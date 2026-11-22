from typing import Optional, List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Scheme
from app.services.eligibility_engine import (
    evaluate_eligibility,
    EligibilityCheckRequest,
    EligibilityCheckResponse,
    SchemeMatch,
)

router = APIRouter(prefix="/schemes", tags=["Government Schemes & Eligibility"])

@router.get("/")
def list_schemes(
    category: Optional[str] = Query(None, description="Filter: All, Subsidy, Insurance, Loan"),
    db: Session = Depends(get_db)
):
    """
    List government agricultural schemes with category filtering.
    """
    query = db.query(Scheme)
    if category and category.lower() != "all":
        query = query.filter(Scheme.category.ilike(category))

    schemes = query.all()
    return [
        {
            "id": s.scheme_code,
            "title": s.title,
            "title_hi": s.title_hi or s.title,
            "category": s.category,
            "description": s.description,
            "description_hi": s.description_hi or s.description,
            "benefits": s.benefits,
            "benefits_hi": s.benefits_hi or s.benefits,
            "deadline": s.deadline,
            "documents_required": s.documents_required or [],
            "state": s.state,
            "eligibility_status": "Eligible" if s.scheme_code in ["PM-KISAN", "PMFBY", "KCC"] else "Possibly Eligible",
        }
        for s in schemes
    ]

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility_endpoint(req: EligibilityCheckRequest):
    """
    Rule-based eligibility evaluation.
    Compares farmer profile against scheme requirements.
    Results are clearly marked as 'Potentially Eligible' (never guaranteed).
    """
    return evaluate_eligibility(
        state=req.state,
        district=req.district,
        crop=req.crop,
        land_holding_acres=req.land_holding_acres,
        farmer_category=req.farmer_category,
        loan_status=req.loan_status,
    )

@router.get("/{scheme_code}")
def get_scheme_detail(scheme_code: str, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.scheme_code.ilike(scheme_code)).first()
    if not scheme:
        raise HTTPException(status_code=404, detail=f"Scheme '{scheme_code}' not found")

    return {
        "id": scheme.scheme_code,
        "title": scheme.title,
        "title_hi": scheme.title_hi,
        "category": scheme.category,
        "description": scheme.description,
        "description_hi": scheme.description_hi,
        "benefits": scheme.benefits,
        "benefits_hi": scheme.benefits_hi,
        "eligibility_rules": scheme.eligibility_rules,
        "documents_required": scheme.documents_required,
        "deadline": scheme.deadline,
        "state": scheme.state,
    }
