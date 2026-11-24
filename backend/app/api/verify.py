from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.verification import (
    LoanVerifyRequest,
    MSPVerifyRequest,
    InsuranceVerifyRequest,
)
from app.services.verification_engine import (
    verify_loan,
    verify_msp,
    verify_insurance,
    LoanVerificationOutput,
    MSPVerificationOutput,
    InsuranceVerificationOutput,
    OFFICIAL_MSP_RULES,
    OFFICIAL_LOAN_RULES,
)
from app.models.models import Farmer, Loan, MSPRecord, InsuranceRecord, RuleSource

router = APIRouter(prefix="/verify", tags=["Verification Engine"])

@router.post("/loan", response_model=LoanVerificationOutput)
def verify_loan_endpoint(req: LoanVerifyRequest, db: Session = Depends(get_db)):
    """
    Deterministic loan verification.
    difference = approved_amount - disbursed_amount
    Flags if positive.
    """
    result = verify_loan(
        approved_amount=req.approved_amount,
        disbursed_amount=req.disbursed_amount,
        deductions=req.deductions or 0.0,
        interest_rate=req.interest_rate or 7.0,
        bank_name=req.bank_name
    )

    # If farmer_id provided, update or record in DB
    if req.farmer_id:
        farmer = db.query(Farmer).filter_by(farmer_id=req.farmer_id).first()
        if farmer:
            loan = db.query(Loan).filter_by(farmer_id=farmer.id).first()
            if loan:
                loan.approved_amount = result.approved_amount
                loan.disbursed_amount = result.disbursed_amount
                loan.difference = result.difference
                loan.deductions = result.deductions
                loan.status = result.status
                loan.reasons = result.reasons
                db.commit()

    return result

@router.post("/msp", response_model=MSPVerificationOutput)
def verify_msp_endpoint(req: MSPVerifyRequest, db: Session = Depends(get_db)):
    """
    Deterministic MSP verification.
    expected = quantity * msp_rate
    difference = expected - actual
    """
    result = verify_msp(
        crop=req.crop,
        quantity_quintals=req.quantity_quintals,
        msp_rate=req.msp_rate,
        actual_payment=req.actual_payment,
        procurement_center=req.procurement_center or "Procurement Mandi"
    )

    if req.farmer_id:
        farmer = db.query(Farmer).filter_by(farmer_id=req.farmer_id).first()
        if farmer:
            msp = db.query(MSPRecord).filter_by(farmer_id=farmer.id).first()
            if msp:
                msp.expected_payment = result.expected_payment
                msp.actual_payment = result.actual_payment
                msp.difference = result.difference
                msp.status = result.status
                msp.reasons = result.reasons
                db.commit()

    return result

@router.post("/insurance", response_model=InsuranceVerificationOutput)
def verify_insurance_endpoint(req: InsuranceVerifyRequest, db: Session = Depends(get_db)):
    """
    Deterministic crop insurance claim verification.
    difference = expected - received
    """
    result = verify_insurance(
        crop=req.crop,
        claim_amount_expected=req.claim_amount_expected,
        amount_received=req.amount_received,
        claim_status=req.claim_status or "Under Review",
        sum_insured=req.sum_insured,
        insured_area_hectares=req.insured_area_hectares,
        assessed_loss_percentage=req.assessed_loss_percentage,
        tolerance=req.tolerance or 100.0,
        rule_missing=req.rule_missing or False,
    )

    if req.farmer_id:
        farmer = db.query(Farmer).filter_by(farmer_id=req.farmer_id).first()
        if farmer:
            ins = db.query(InsuranceRecord).filter_by(farmer_id=farmer.id).first()
            if ins:
                if result.claim_amount_expected is not None:
                    ins.claim_amount_expected = result.claim_amount_expected
                if result.amount_received is not None:
                    ins.amount_received = result.amount_received
                if result.difference is not None:
                    ins.difference = result.difference
                ins.claim_status = result.claim_status
                ins.reasons = result.reasons
                db.commit()

    return result

@router.get("/summary/{farmer_id}")
def get_farmer_summary(farmer_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all current records and verification states for a given farmer.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer {farmer_id} not found")

    loan = db.query(Loan).filter_by(farmer_id=farmer.id).first()
    msp = db.query(MSPRecord).filter_by(farmer_id=farmer.id).first()
    ins = db.query(InsuranceRecord).filter_by(farmer_id=farmer.id).first()

    loan_res = verify_loan(
        loan.approved_amount, loan.disbursed_amount, loan.deductions, loan.interest_rate, loan.bank_name
    ) if loan else None

    msp_res = verify_msp(
        msp.crop, msp.quantity_quintals, msp.msp_rate, msp.actual_payment, msp.procurement_center
    ) if msp else None

    ins_res = verify_insurance(
        ins.crop, ins.claim_amount_expected, ins.amount_received, ins.claim_status
    ) if ins else None

    records_needing_attention = sum([
        1 for r in [loan_res, msp_res, ins_res] if r and r.is_flagged
    ])

    return {
        "farmer": {
            "id": farmer.farmer_id,
            "name": farmer.name,
            "name_hi": farmer.name_hi,
            "district": farmer.district,
            "state": farmer.state,
            "land_area_acres": farmer.land_area_acres,
            "crop": farmer.crop,
            "category": farmer.category,
            "bank_name": farmer.bank_name,
            "account_number_masked": farmer.account_number_masked,
        },
        "records_needing_attention_count": records_needing_attention,
        "loan": loan_res,
        "msp": msp_res,
        "insurance": ins_res,
    }

@router.get("/rules")
def get_rule_sources(
    rule_type: Optional[str] = Query(None, description="Filter by rule type: loan_disbursement, msp, interest_subvention, processing_fee, insurance_claim"),
    crop: Optional[str] = Query(None, description="Filter by crop name"),
    db: Session = Depends(get_db)
):
    """
    Retrieve cited reference rules, statutory MSP benchmarks, and interest rate guidelines.
    Reads from database, falling back gracefully to static official benchmarks if table is empty.
    """
    try:
        query = db.query(RuleSource)
        if rule_type:
            query = query.filter(RuleSource.rule_type == rule_type)
        if crop:
            query = query.filter(RuleSource.crop.ilike(f"%{crop}%"))
        db_rules = query.all()
    except Exception:
        db.rollback()
        db_rules = []

    if db_rules:
        return [
            {
                "id": r.id,
                "rule_code": r.rule_code,
                "scheme_name": r.scheme_name,
                "rule_type": r.rule_type,
                "crop": r.crop,
                "season": r.season,
                "description_en": r.description_en,
                "description_hi": r.description_hi,
                "formula_or_value": r.formula_or_value,
                "source_name": r.source_name,
                "source_document": r.source_document,
                "source_url": r.source_url,
                "effective_from": r.effective_from,
                "effective_to": r.effective_to,
                "last_verified_on": r.last_verified_on,
                "status": r.status,
                "data_origin": r.data_origin,
            }
            for r in db_rules
        ]

    # In-memory fallback if db not seeded yet
    rules = []
    for c_name, m in OFFICIAL_MSP_RULES.items():
        if rule_type and rule_type != "msp":
            continue
        if crop and crop.lower() not in c_name.lower():
            continue
        rules.append({
            "rule_code": m["rule_code"],
            "scheme_name": m["scheme_name"],
            "scheme_name_hi": m.get("scheme_name_hi"),
            "rule_type": "msp",
            "crop": c_name,
            "season": m.get("season"),
            "description_en": f"Official MSP rate for {c_name} at ₹{m['rate']}/quintal.",
            "description_hi": f"{c_name} के लिए आधिकारिक एमएसपी दर ₹{m['rate']}/क्विंटल।",
            "formula_or_value": f"₹{m['rate']:,.2f} / quintal",
            "source_name": m["authority"],
            "source_document": m["document"],
            "source_url": m["url"],
            "effective_from": m["effective_from"],
            "effective_to": m.get("effective_to"),
            "last_verified_on": m["last_verified_on"],
            "status": m["status"],
            "data_origin": m["data_origin"],
        })

    for k, lr in OFFICIAL_LOAN_RULES.items():
        r_type = "processing_fee" if "FEE" in k else ("interest_subvention" if "INTEREST" in k else "loan_disbursement")
        if rule_type and rule_type != r_type:
            continue
        rules.append({
            "rule_code": lr["rule_code"],
            "scheme_name": lr["scheme_name"],
            "scheme_name_hi": lr.get("scheme_name_hi"),
            "rule_type": r_type,
            "crop": None,
            "season": None,
            "description_en": lr["formula_or_value"],
            "description_hi": lr.get("document_hi"),
            "formula_or_value": lr["formula_or_value"],
            "source_name": lr["authority"],
            "source_document": lr["document"],
            "source_url": lr["url"],
            "effective_from": lr["effective_from"],
            "effective_to": lr.get("effective_to"),
            "last_verified_on": lr["last_verified_on"],
            "status": lr["status"],
            "data_origin": lr["data_origin"],
        })

    return rules


@router.get("/record/{record_ref}")
def get_verification_record_by_ref(record_ref: str, db: Session = Depends(get_db)):
    """
    Retrieve pre-fill data and deterministic verification result for a flagged record by reference ID.
    Supports Loan (LN-...), MSP (MSP-...), or Insurance (INS-...).
    """
    # 1. Check Loan
    loan = db.query(Loan).filter_by(loan_ref=record_ref).first()
    if loan:
        verification = verify_loan(
            approved_amount=loan.approved_amount,
            disbursed_amount=loan.disbursed_amount,
            deductions=loan.deductions or 0.0,
            interest_rate=loan.interest_rate or 7.0,
            bank_name=loan.bank_name,
        )
        return {
            "record_type": "loan",
            "record_ref": loan.loan_ref,
            "data": {
                "bank_name": loan.bank_name,
                "loan_account_ref": loan.loan_ref,
                "loan_type": loan.loan_type,
                "approved_amount": loan.approved_amount,
                "disbursed_amount": loan.disbursed_amount,
                "interest_rate": loan.interest_rate,
                "deductions": loan.deductions,
                "loan_date": loan.loan_date,
            },
            "verification": verification,
        }

    # 2. Check MSP
    msp = db.query(MSPRecord).filter_by(record_ref=record_ref).first()
    if msp:
        verification = verify_msp(
            crop=msp.crop,
            quantity_quintals=msp.quantity_quintals,
            msp_rate=msp.msp_rate,
            actual_payment=msp.actual_payment,
            procurement_center=msp.procurement_center,
        )
        return {
            "record_type": "msp",
            "record_ref": msp.record_ref,
            "data": {
                "crop": msp.crop,
                "quantity": msp.quantity_quintals,
                "msp_rate": msp.msp_rate,
                "actual_payment": msp.actual_payment,
                "procurement_center": msp.procurement_center,
                "payment_date": msp.payment_date,
            },
            "verification": verification,
        }

    # 3. Check Insurance
    ins = db.query(InsuranceRecord).filter_by(insurance_ref=record_ref).first()
    if ins:
        verification = verify_insurance(
            crop=ins.crop,
            claim_amount_expected=ins.claim_amount_expected,
            amount_received=ins.amount_received,
            claim_status=ins.claim_status,
        )
        return {
            "record_type": "insurance",
            "record_ref": ins.insurance_ref,
            "data": {
                "crop": ins.crop,
                "claim_amount_expected": ins.claim_amount_expected,
                "amount_received": ins.amount_received,
                "claim_status": ins.claim_status,
                "filing_date": ins.filing_date,
            },
            "verification": verification,
        }

    # 4. Fallback for demo records if database session doesn't contain the record
    if "8812" in record_ref or "LN" in record_ref.upper():
        verification = verify_loan(80000.0, 70000.0, 5000.0, 7.5, "State Bank of India")
        return {
            "record_type": "loan",
            "record_ref": record_ref,
            "data": {
                "bank_name": "State Bank of India",
                "loan_account_ref": record_ref,
                "loan_type": "Crop Loan (KCC)",
                "approved_amount": 80000.0,
                "disbursed_amount": 70000.0,
                "interest_rate": 7.5,
                "deductions": 5000.0,
                "loan_date": "12-03-2024",
            },
            "verification": verification,
        }

    if "4411" in record_ref or "MSP" in record_ref.upper():
        verification = verify_msp("Paddy (Common)", 50.0, 2300.0, 105000.0, "Patan Krishi Upaj Mandi")
        return {
            "record_type": "msp",
            "record_ref": record_ref,
            "data": {
                "crop": "Paddy (Common)",
                "quantity": 50.0,
                "msp_rate": 2300.0,
                "actual_payment": 105000.0,
                "procurement_center": "Patan Krishi Upaj Mandi",
                "payment_date": "05-04-2024",
            },
            "verification": verification,
        }

    raise HTTPException(status_code=404, detail=f"Verification record '{record_ref}' not found")

