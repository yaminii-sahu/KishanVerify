from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
import datetime

from app.core.database import get_db
from app.models.models import Farmer, Loan, LoanProduct, Document, RuleSource
from app.services.loan_eligibility import (
    evaluate_loan_eligibility,
    LoanEligibilityResult,
    DocumentCheckItem,
)
from app.services.verification_engine import verify_loan

router = APIRouter(prefix="/loans", tags=["Loans & Loan Products"])

class LoanProductResponse(BaseModel):
    id: int
    product_code: str
    name: str
    name_hi: Optional[str] = None
    level: str
    state: Optional[str] = None
    lender_type: str
    purpose: str
    purpose_hi: Optional[str] = None
    description: str
    description_hi: Optional[str] = None
    max_amount_rule: str
    interest_rate_rule: str
    tenure: str
    collateral_rule: str
    required_documents: List[str]
    eligibility_rules: Dict[str, Any]
    official_url: Optional[str] = None
    source_name: str
    source_document: str
    last_verified_on: str
    status: str
    eligibility: LoanEligibilityResult

class LoanProductListResponse(BaseModel):
    count: int
    likely_eligible_count: int
    possibly_eligible_count: int
    not_eligible_count: int
    products: List[LoanProductResponse]

class LoanItemResponse(BaseModel):
    id: int
    loan_ref: str
    bank_name: str
    loan_type: str
    approved_amount: float
    disbursed_amount: float
    interest_rate: float
    deductions: float
    repayments: float
    difference: float
    status: str
    verification_status: str # "Verified", "Needs Review", "Not Verified"
    reason_codes: List[str]
    reasons: List[str]
    loan_date: str
    last_verified_at: Optional[str] = None
    sanction_doc_name: Optional[str] = None
    basis_of_check: List[Dict[str, Any]]

class MyLoansResponse(BaseModel):
    farmer_id: str
    farmer_name: str
    total_count: int
    verified_count: int
    needs_review_count: int
    not_verified_count: int
    loans: List[LoanItemResponse]

def get_default_basis_rules(db: Session) -> List[Dict[str, Any]]:
    rules = db.query(RuleSource).filter(
        RuleSource.rule_type.in_(["loan_disbursement", "interest_subvention", "processing_fee"])
    ).all()
    return [
        {
            "rule_code": r.rule_code,
            "scheme_name": r.scheme_name,
            "rule_type": r.rule_type,
            "description_en": r.description_en,
            "description_hi": r.description_hi,
            "formula_or_value": r.formula_or_value,
            "source_name": r.source_name,
            "source_document": r.source_document,
            "source_url": r.source_url,
            "status": r.status,
            "last_verified_on": r.last_verified_on,
        }
        for r in rules
    ]

@router.get("/products", response_model=LoanProductListResponse)
def get_loan_products(
    farmer_id: Optional[str] = Query("FV12345", description="Farmer ID for eligibility evaluation"),
    level: Optional[str] = Query(None, description="Filter by level: Central or State"),
    state: Optional[str] = Query(None, description="Filter by State"),
    purpose: Optional[str] = Query(None, description="Filter by Purpose"),
    status: Optional[str] = Query(None, description="Filter by eligibility status: likely, possibly, unmet"),
    db: Session = Depends(get_db)
):
    """
    Returns available loan products deterministically evaluated against farmer profile and vault records.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if farmer:
        farmer_profile = {
            "name": farmer.name,
            "state": farmer.state,
            "district": farmer.district,
            "land_area_acres": farmer.land_area_acres,
            "crop": farmer.crop,
            "category": farmer.category,
        }
        existing_loans = db.query(Loan).filter_by(farmer_id=farmer.id).all()
        vault_docs = db.query(Document).filter_by(farmer_id=farmer_id).all()
    else:
        farmer_profile = {
            "name": "Ramesh Kumar",
            "state": "Chhattisgarh",
            "district": "Durg",
            "land_area_acres": 3.0,
            "crop": "Paddy",
            "category": "Small Farmer",
        }
        existing_loans = []
        vault_docs = []

    query = db.query(LoanProduct)
    if level and level.lower() != "all":
        query = query.filter(LoanProduct.level.ilike(level.strip()))
    if state and state.lower() != "all":
        query = query.filter(
            (LoanProduct.state.ilike(f"%{state.strip()}%")) | (LoanProduct.level == "Central")
        )
    if purpose and purpose.lower() != "all":
        query = query.filter(LoanProduct.purpose.ilike(f"%{purpose.strip()}%"))

    products = query.order_by(LoanProduct.id.asc()).all()

    evaluated_items: List[LoanProductResponse] = []
    likely_cnt = 0
    possibly_cnt = 0
    not_cnt = 0

    for p in products:
        elig = evaluate_loan_eligibility(
            product=p,
            farmer_profile=farmer_profile,
            existing_loans=existing_loans,
            vault_documents=vault_docs,
        )

        if elig.eligibility_status == "Likely eligible":
            likely_cnt += 1
        elif elig.eligibility_status == "Possibly eligible (more info needed)":
            possibly_cnt += 1
        else:
            not_cnt += 1

        if status:
            s_clean = status.strip().lower()
            if s_clean == "likely" and elig.eligibility_status != "Likely eligible":
                continue
            if s_clean == "possibly" and elig.eligibility_status != "Possibly eligible (more info needed)":
                continue
            if s_clean in ["unmet", "not_eligible"] and elig.eligibility_status != "Not eligible":
                continue

        evaluated_items.append(
            LoanProductResponse(
                id=p.id,
                product_code=p.product_code,
                name=p.name,
                name_hi=p.name_hi,
                level=p.level,
                state=p.state,
                lender_type=p.lender_type,
                purpose=p.purpose,
                purpose_hi=p.purpose_hi,
                description=p.description,
                description_hi=p.description_hi,
                max_amount_rule=p.max_amount_rule,
                interest_rate_rule=p.interest_rate_rule,
                tenure=p.tenure,
                collateral_rule=p.collateral_rule,
                required_documents=p.required_documents or [],
                eligibility_rules=p.eligibility_rules or {},
                official_url=p.official_url,
                source_name=p.source_name,
                source_document=p.source_document,
                last_verified_on=p.last_verified_on,
                status=p.status,
                eligibility=elig,
            )
        )

    return LoanProductListResponse(
        count=len(evaluated_items),
        likely_eligible_count=likely_cnt,
        possibly_eligible_count=possibly_cnt,
        not_eligible_count=not_cnt,
        products=evaluated_items,
    )

@router.get("/products/{product_code}", response_model=LoanProductResponse)
def get_loan_product_detail(
    product_code: str,
    farmer_id: Optional[str] = Query("FV12345"),
    db: Session = Depends(get_db)
):
    product = db.query(LoanProduct).filter_by(product_code=product_code).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Loan product '{product_code}' not found.")

    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    farmer_profile = {
        "name": farmer.name if farmer else "Ramesh Kumar",
        "state": farmer.state if farmer else "Chhattisgarh",
        "district": farmer.district if farmer else "Durg",
        "land_area_acres": farmer.land_area_acres if farmer else 3.0,
        "crop": farmer.crop if farmer else "Paddy",
        "category": farmer.category if farmer else "Small Farmer",
    }
    existing_loans = db.query(Loan).filter_by(farmer_id=farmer.id).all() if farmer else []
    vault_docs = db.query(Document).filter_by(farmer_id=farmer_id).all() if farmer else []

    elig = evaluate_loan_eligibility(
        product=product,
        farmer_profile=farmer_profile,
        existing_loans=existing_loans,
        vault_documents=vault_docs,
    )

    return LoanProductResponse(
        id=product.id,
        product_code=product.product_code,
        name=product.name,
        name_hi=product.name_hi,
        level=product.level,
        state=product.state,
        lender_type=product.lender_type,
        purpose=product.purpose,
        purpose_hi=product.purpose_hi,
        description=product.description,
        description_hi=product.description_hi,
        max_amount_rule=product.max_amount_rule,
        interest_rate_rule=product.interest_rate_rule,
        tenure=product.tenure,
        collateral_rule=product.collateral_rule,
        required_documents=product.required_documents or [],
        eligibility_rules=product.eligibility_rules or {},
        official_url=product.official_url,
        source_name=product.source_name,
        source_document=product.source_document,
        last_verified_on=product.last_verified_on,
        status=product.status,
        eligibility=elig,
    )

@router.get("/me", response_model=MyLoansResponse)
def get_my_loans(
    farmer_id: Optional[str] = Query("FV12345", description="Current logged in farmer ID"),
    status: Optional[str] = Query(None, description="Filter by status: Verified, Needs Review, Not Verified"),
    db: Session = Depends(get_db)
):
    """
    Returns existing loans for the farmer with verification_status, reason_codes, and cited sources.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail=f"Farmer '{farmer_id}' not found.")

    basis_rules = get_default_basis_rules(db)
    query = db.query(Loan).filter_by(farmer_id=farmer.id)
    all_loans = query.order_by(Loan.id.desc()).all()

    verified_cnt = sum(1 for l in all_loans if (l.verification_status or l.status) == "Verified")
    needs_review_cnt = sum(1 for l in all_loans if (l.verification_status or l.status) == "Needs Review")
    not_verified_cnt = sum(1 for l in all_loans if (l.verification_status or l.status) == "Not Verified")

    loan_items: List[LoanItemResponse] = []
    for l in all_loans:
        eff_status = l.verification_status or l.status or "Needs Review"
        if status and status.lower() != "all":
            if eff_status.lower() != status.strip().lower():
                continue

        loan_items.append(
            LoanItemResponse(
                id=l.id,
                loan_ref=l.loan_ref,
                bank_name=l.bank_name,
                loan_type=l.loan_type,
                approved_amount=float(l.approved_amount or 0.0),
                disbursed_amount=float(l.disbursed_amount or 0.0),
                interest_rate=float(l.interest_rate or 7.0),
                deductions=float(l.deductions or 0.0),
                repayments=float(l.repayments or 0.0),
                difference=float(l.difference or 0.0),
                status=l.status or eff_status,
                verification_status=eff_status,
                reason_codes=l.reason_codes or [],
                reasons=l.reasons or [],
                loan_date=l.loan_date or "N/A",
                last_verified_at=l.last_verified_at,
                sanction_doc_name=l.sanction_doc_name,
                basis_of_check=basis_rules,
            )
        )

    return MyLoansResponse(
        farmer_id=farmer.farmer_id,
        farmer_name=farmer.name,
        total_count=len(all_loans),
        verified_count=verified_cnt,
        needs_review_count=needs_review_cnt,
        not_verified_count=not_verified_cnt,
        loans=loan_items,
    )

@router.post("/{loan_ref}/verify", response_model=LoanItemResponse)
def run_loan_verification(
    loan_ref: str,
    db: Session = Depends(get_db)
):
    """
    Deterministic re-verification of a specific loan record against official statutory guidelines.
    """
    loan = db.query(Loan).filter_by(loan_ref=loan_ref).first()
    if not loan:
        raise HTTPException(status_code=404, detail=f"Loan '{loan_ref}' not found.")

    result = verify_loan(
        approved_amount=loan.approved_amount,
        disbursed_amount=loan.disbursed_amount,
        deductions=loan.deductions or 0.0,
        interest_rate=loan.interest_rate or 7.0,
        bank_name=loan.bank_name,
    )

    reason_codes = []
    if result.difference > 0:
        reason_codes.append("DISBURSEMENT_MISMATCH")
    if (loan.interest_rate or 0.0) > 7.0:
        reason_codes.append("INTEREST_RATE_MISMATCH")
    if (loan.deductions or 0.0) > 0 and loan.approved_amount <= 300000:
        reason_codes.append("PROCESSING_FEE_FLAG")
    if not loan.sanction_doc_name:
        reason_codes.append("MISSING_SANCTION_DOC")

    loan.difference = result.difference
    loan.status = result.status
    loan.verification_status = result.status
    loan.reason_codes = reason_codes
    loan.reasons = result.reasons
    loan.last_verified_at = datetime.datetime.now().strftime("%d %b %Y")
    db.commit()
    db.refresh(loan)

    basis_rules = get_default_basis_rules(db)
    return LoanItemResponse(
        id=loan.id,
        loan_ref=loan.loan_ref,
        bank_name=loan.bank_name,
        loan_type=loan.loan_type,
        approved_amount=float(loan.approved_amount or 0.0),
        disbursed_amount=float(loan.disbursed_amount or 0.0),
        interest_rate=float(loan.interest_rate or 7.0),
        deductions=float(loan.deductions or 0.0),
        repayments=float(loan.repayments or 0.0),
        difference=float(loan.difference or 0.0),
        status=loan.status,
        verification_status=loan.verification_status or loan.status,
        reason_codes=loan.reason_codes or [],
        reasons=loan.reasons or [],
        loan_date=loan.loan_date or "N/A",
        last_verified_at=loan.last_verified_at,
        sanction_doc_name=loan.sanction_doc_name,
        basis_of_check=basis_rules,
    )
