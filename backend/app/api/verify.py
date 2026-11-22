from fastapi import APIRouter, Depends, HTTPException
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
)
from app.models.models import Farmer, Loan, MSPRecord, InsuranceRecord

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
        claim_status=req.claim_status or "Under Review"
    )

    if req.farmer_id:
        farmer = db.query(Farmer).filter_by(farmer_id=req.farmer_id).first()
        if farmer:
            ins = db.query(InsuranceRecord).filter_by(farmer_id=farmer.id).first()
            if ins:
                ins.claim_amount_expected = result.claim_amount_expected
                ins.amount_received = result.amount_received
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
