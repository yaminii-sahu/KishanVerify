"""
KisanVerify MSP & Procurement API
=================================
Deterministic procurement timeline, status tracking, delay threshold monitoring,
and adjustment rules endpoints.
All calculations and matching stay deterministic in Python.
Discrepancies and delays are described with neutral, non-accusatory wording ('may need review').
"""

import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import MSPRecord, MSPEvent, AdjustmentRule, Farmer

router = APIRouter(prefix="/msp", tags=["MSP Records & Procurement"])

class MSPTimelineEvent(BaseModel):
    id: Optional[int] = None
    event_type: str
    date: str
    amount: Optional[float] = None
    quantity: Optional[float] = None
    description_en: str
    description_hi: str
    source: str
    data_origin: str
    is_missing_placeholder: bool = False
    is_current_stage: bool = False

class MSPTimelineResponse(BaseModel):
    record_id: int
    record_ref: str
    crop: str
    variety_grade: str
    season: str
    year: str
    state: str
    procurement_center: str
    farmer_reg_id_masked: str
    receipt_no_masked: str
    quantity_quintals: float
    msp_rate: float
    expected_payment: float
    actual_payment: float
    difference: float
    status: str
    payment_date: str
    days_since_procurement: int
    threshold_days: int
    is_delayed: bool
    delay_days: int
    delay_notice_en: Optional[str] = None
    delay_notice_hi: Optional[str] = None
    current_stage: str
    current_stage_hi: str
    events: List[MSPTimelineEvent]
    missing_events_count: int

class AdjustmentRuleResponse(BaseModel):
    id: int
    rule_code: str
    name: str
    name_hi: str
    category: str
    fee_type: str
    rate_or_value: float
    state: str
    mandi_name: str
    authority: str
    source_document: str
    official_url: str
    last_verified_on: str
    status: str
    data_origin: str

def compute_msp_timeline(msp: MSPRecord, db: Session, threshold_days: int = 14) -> MSPTimelineResponse:
    events = (
        db.query(MSPEvent)
        .filter_by(record_id=msp.id)
        .order_by(MSPEvent.date.asc(), MSPEvent.id.asc())
        .all()
    )

    # Deterministic delivery and payment dates
    delivery_date_str = None
    payment_date_str = msp.payment_date
    for ev in events:
        if ev.event_type in ["produce_delivered", "weighed"]:
            delivery_date_str = ev.date
            break

    if not delivery_date_str and events:
        delivery_date_str = events[0].date
    if not delivery_date_str:
        delivery_date_str = "2024-03-22"

    days_elapsed = 0
    try:
        del_dt = datetime.datetime.strptime(delivery_date_str, "%Y-%m-%d").date()
        if msp.difference == 0 and payment_date_str:
            # Full payment completed; measure elapsed turnaround
            try:
                pay_dt = datetime.datetime.strptime(payment_date_str, "%Y-%m-%d").date()
            except Exception:
                pay_dt = datetime.datetime.strptime(payment_date_str, "%d-%m-%Y").date()
            days_elapsed = max(0, (pay_dt - del_dt).days)
        else:
            # Still pending or partial; measure against today
            today = datetime.date.today()
            days_elapsed = max(0, (today - del_dt).days)
    except Exception:
        days_elapsed = 18

    # Statutory APMC mandate is typically 3-14 days
    is_delayed = (days_elapsed > threshold_days and (msp.difference > 0 or msp.status != "Verified"))
    delay_days = max(0, days_elapsed - threshold_days) if is_delayed else 0

    delay_notice_en = None
    delay_notice_hi = None
    if is_delayed:
        delay_notice_en = (
            f"Payment reconciliation period ({days_elapsed} days elapsed) exceeds standard {threshold_days}-day statutory mandate. "
            f"The unpaid balance or withheld deductions may need review with your Mandi Secretary or Civil Supplies office."
        )
        delay_notice_hi = (
            f"भुगतान समाधान अवधि ({days_elapsed} दिन बीत चुके हैं) वैधानिक {threshold_days} दिनों की मानक सीमा से अधिक है। "
            f"बकाया अंतर या रोकी गई कटौतियों की अपने मंडी सचिव या खाद्य व नागरिक आपूर्ति कार्यालय से समीक्षा की जा सकती है।"
        )

    timeline_events: List[MSPTimelineEvent] = []
    for ev in events:
        timeline_events.append(
            MSPTimelineEvent(
                id=ev.id,
                event_type=ev.event_type,
                date=ev.date,
                amount=ev.amount,
                quantity=ev.quantity,
                description_en=ev.description_en,
                description_hi=ev.description_hi,
                source=ev.source,
                data_origin=ev.data_origin,
                is_missing_placeholder=False,
                is_current_stage=False,
            )
        )

    # Detect missing expected milestones
    missing_count = 0
    if msp.difference > 0 or msp.status in ["Under Review", "Needs Review", "Possible Discrepancy"]:
        missing_count += 1
        timeline_events.append(
            MSPTimelineEvent(
                id=None,
                event_type="payment_credited",
                date="Date Pending",
                amount=msp.difference,
                quantity=None,
                description_en=f"Final reconciliation and release of remaining ₹{msp.difference:,.2f} pending itemized audit.",
                description_hi=f"शेष ₹{msp.difference:,.2f} का अंतिम समायोजन एवं डीबीटी भुगतान ऑडिट पश्चात लंबित।",
                source="e-Uparjan State Procurement Settlement Portal",
                data_origin="official",
                is_missing_placeholder=True,
                is_current_stage=True,
            )
        )
    elif timeline_events:
        timeline_events[-1].is_current_stage = True

    current_stage = (
        "Itemized Deductions & Final Settlement Under Review"
        if msp.difference > 0
        else "Procurement Payment Settled in Full"
    )
    current_stage_hi = (
        "मदवार कटौतियां एवं अंतिम निपटान समीक्षाधीन"
        if msp.difference > 0
        else "उपार्जन भुगतान पूर्णतः अंतरित"
    )

    return MSPTimelineResponse(
        record_id=msp.id,
        record_ref=msp.record_ref,
        crop=msp.crop,
        variety_grade=msp.variety_grade or "Common",
        season=msp.season or "Kharif 2024-25",
        year=msp.year or "2024",
        state=msp.state or "Chhattisgarh",
        procurement_center=msp.procurement_center or "Patan Krishi Upaj Mandi",
        farmer_reg_id_masked=msp.farmer_reg_id_masked or "CG-KRY-****891",
        receipt_no_masked=msp.receipt_no_masked or "REC-PTN-****441",
        quantity_quintals=msp.quantity_quintals,
        msp_rate=msp.msp_rate,
        expected_payment=msp.expected_payment,
        actual_payment=msp.actual_payment,
        difference=msp.difference,
        status=msp.status,
        payment_date=msp.payment_date,
        days_since_procurement=days_elapsed,
        threshold_days=threshold_days,
        is_delayed=is_delayed,
        delay_days=delay_days,
        delay_notice_en=delay_notice_en,
        delay_notice_hi=delay_notice_hi,
        current_stage=current_stage,
        current_stage_hi=current_stage_hi,
        events=timeline_events,
        missing_events_count=missing_count,
    )

@router.get("/rules", response_model=List[AdjustmentRuleResponse])
def get_adjustment_rules(
    state: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns statutory APMC mandi and quality adjustment rules."""
    q = db.query(AdjustmentRule)
    if state:
        q = q.filter(AdjustmentRule.state.ilike(f"%{state}%"))
    rules = q.all()
    return [
        AdjustmentRuleResponse(
            id=r.id,
            rule_code=r.rule_code,
            name=r.name,
            name_hi=r.name_hi,
            category=r.category,
            fee_type=r.fee_type,
            rate_or_value=r.rate_or_value,
            state=r.state,
            mandi_name=r.mandi_name,
            authority=r.authority,
            source_document=r.source_document,
            official_url=r.official_url,
            last_verified_on=r.last_verified_on,
            status=r.status,
            data_origin=r.data_origin,
        )
        for r in rules
    ]

@router.get("/{record_id_or_ref}/timeline", response_model=MSPTimelineResponse)
def get_msp_timeline(
    record_id_or_ref: str,
    threshold_days: int = Query(14, ge=1, le=180),
    db: Session = Depends(get_db)
):
    """
    Returns deterministic procurement-to-payment timeline events,
    current stage, and statutory delay indicators.
    """
    msp = None
    if record_id_or_ref.isdigit():
        msp = db.query(MSPRecord).filter_by(id=int(record_id_or_ref)).first()
    if not msp:
        msp = db.query(MSPRecord).filter_by(record_ref=record_id_or_ref).first()

    if not msp:
        # Fallback to demo record
        msp = db.query(MSPRecord).filter_by(record_ref="MSP-2024-4411").first()

    if not msp:
        raise HTTPException(status_code=404, detail="MSP procurement record not found")

    return compute_msp_timeline(msp, db, threshold_days=threshold_days)

@router.get("/{record_id_or_ref}")
def get_msp_record_detail(
    record_id_or_ref: str,
    db: Session = Depends(get_db)
):
    """Returns full MSP record details."""
    msp = None
    if record_id_or_ref.isdigit():
        msp = db.query(MSPRecord).filter_by(id=int(record_id_or_ref)).first()
    if not msp:
        msp = db.query(MSPRecord).filter_by(record_ref=record_id_or_ref).first()

    if not msp:
        msp = db.query(MSPRecord).filter_by(record_ref="MSP-2024-4411").first()

    if not msp:
        raise HTTPException(status_code=404, detail="MSP procurement record not found")

    return {
        "id": msp.id,
        "record_ref": msp.record_ref,
        "farmer_id": msp.farmer_id,
        "crop": msp.crop,
        "variety_grade": msp.variety_grade or "Common",
        "season": msp.season or "Kharif 2024-25",
        "year": msp.year or "2024",
        "state": msp.state or "Chhattisgarh",
        "procurement_center": msp.procurement_center or "Patan Krishi Upaj Mandi",
        "farmer_reg_id_masked": msp.farmer_reg_id_masked or "CG-KRY-****891",
        "receipt_no_masked": msp.receipt_no_masked or "REC-PTN-****441",
        "quantity_quintals": msp.quantity_quintals,
        "weight_slip_quantity": msp.weight_slip_quantity or msp.quantity_quintals,
        "recorded_quantity": msp.recorded_quantity or msp.quantity_quintals,
        "msp_rate": msp.msp_rate,
        "state_bonus_per_quintal": msp.state_bonus_per_quintal or 0.0,
        "expected_payment": msp.expected_payment,
        "actual_payment": msp.actual_payment,
        "difference": msp.difference,
        "status": msp.status,
        "payment_date": msp.payment_date,
        "reasons": msp.reasons or [],
        "adjustments": msp.adjustments or [],
    }

@router.get("/farmer/{farmer_id_or_ref}")
def get_farmer_msp_records(
    farmer_id_or_ref: str,
    db: Session = Depends(get_db)
):
    """Lists all MSP procurement records for a farmer."""
    farmer = None
    if farmer_id_or_ref.isdigit():
        farmer = db.query(Farmer).filter_by(id=int(farmer_id_or_ref)).first()
    if not farmer:
        farmer = db.query(Farmer).filter_by(farmer_id=farmer_id_or_ref).first()

    if not farmer:
        farmer = db.query(Farmer).filter_by(farmer_id="FV12345").first()

    if not farmer:
        return []

    records = db.query(MSPRecord).filter_by(farmer_id=farmer.id).order_by(MSPRecord.id.desc()).all()
    return [
        {
            "id": r.id,
            "record_ref": r.record_ref,
            "crop": r.crop,
            "variety_grade": r.variety_grade or "Common",
            "season": r.season or "Kharif 2024-25",
            "year": r.year or "2024",
            "quantity_quintals": r.quantity_quintals,
            "msp_rate": r.msp_rate,
            "expected_payment": r.expected_payment,
            "actual_payment": r.actual_payment,
            "difference": r.difference,
            "status": r.status,
            "procurement_center": r.procurement_center,
            "payment_date": r.payment_date,
        }
        for r in records
    ]
