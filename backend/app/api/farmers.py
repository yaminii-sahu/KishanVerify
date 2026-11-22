from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import Farmer, Loan, MSPRecord, InsuranceRecord

router = APIRouter(prefix="/farmers", tags=["Farmer Profile & Attention Records"])

class AttentionItem(BaseModel):
    record_type: str
    record_ref: str
    title: str
    title_hi: Optional[str] = None
    difference: float
    status: str
    link: str
    date: Optional[str] = None
    reasons: Optional[List[str]] = []

class AttentionResponse(BaseModel):
    farmer_id: str
    farmer_name: str
    count: int
    items: List[AttentionItem]
    has_discrepancies: bool

def compute_farmer_attention(farmer: Farmer, db: Session) -> AttentionResponse:
    attention_statuses = {"Needs Review", "Possible Discrepancy"}
    items: List[AttentionItem] = []

    # 1. Check Loans
    loans = db.query(Loan).filter_by(farmer_id=farmer.id).all()
    for l in loans:
        if l.status in attention_statuses or (l.difference and l.difference > 0 and l.status != "Verified"):
            items.append(
                AttentionItem(
                    record_type="Loan",
                    record_ref=l.loan_ref,
                    title=f"KCC Loan ({l.bank_name})",
                    title_hi=f"केसीसी ऋण ({l.bank_name})",
                    difference=float(l.difference or 0.0),
                    status=l.status,
                    link="/farmer/loan",
                    date=l.loan_date,
                    reasons=l.reasons or []
                )
            )

    # 2. Check MSP Records
    msps = db.query(MSPRecord).filter_by(farmer_id=farmer.id).all()
    for m in msps:
        if m.status in attention_statuses or (m.difference and m.difference > 0 and m.status != "Verified"):
            items.append(
                AttentionItem(
                    record_type="MSP",
                    record_ref=m.record_ref,
                    title=f"MSP Payment ({m.crop})",
                    title_hi=f"एमएसपी भुगतान ({m.crop})",
                    difference=float(m.difference or 0.0),
                    status=m.status,
                    link="/farmer/msp",
                    date=m.payment_date,
                    reasons=m.reasons or []
                )
            )

    # 3. Check Insurance Records
    insurances = db.query(InsuranceRecord).filter_by(farmer_id=farmer.id).all()
    for ins in insurances:
        if ins.claim_status in attention_statuses or (ins.difference and ins.difference > 0 and ins.claim_status not in {"Verified", "Under Review"}):
            items.append(
                AttentionItem(
                    record_type="Insurance",
                    record_ref=ins.insurance_ref,
                    title=f"Crop Insurance ({ins.crop})",
                    title_hi=f"फसल बीमा ({ins.crop})",
                    difference=float(ins.difference or 0.0),
                    status=ins.claim_status,
                    link="/farmer/insurance",
                    date=ins.filing_date,
                    reasons=ins.reasons or []
                )
            )

    return AttentionResponse(
        farmer_id=farmer.farmer_id,
        farmer_name=farmer.name,
        count=len(items),
        items=items,
        has_discrepancies=len(items) > 0
    )

@router.get("/me/attention", response_model=AttentionResponse)
def get_current_farmer_attention(
    farmer_id: Optional[str] = Query("FV12345", description="Current logged in farmer ID (default Ramesh Kumar)"),
    db: Session = Depends(get_db)
):
    """
    Returns the real-time count and list of records requiring attention for the farmer.
    Flagged records include any Loan, MSP, or Insurance entry with status 'Needs Review' or 'Possible Discrepancy'.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer {farmer_id} not found")

    return compute_farmer_attention(farmer, db)

@router.get("/{farmer_id}/attention", response_model=AttentionResponse)
def get_farmer_attention_by_id(
    farmer_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns records requiring attention for a specific farmer ID.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer {farmer_id} not found")

    return compute_farmer_attention(farmer, db)
