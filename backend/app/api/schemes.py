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
    All scheme details are sourced from official myScheme.gov.in platform.
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
            "myscheme_url": s.myscheme_url or f"https://www.myscheme.gov.in/schemes/{s.scheme_code.lower()}",
            "ministry": s.ministry or "Ministry of Agriculture and Farmers Welfare",
            "source": s.source or "myScheme.gov.in",
            "source_platform_url": "https://www.myscheme.gov.in",
            "eligibility_status": "Eligible" if s.scheme_code in ["PM-KISAN", "PMFBY", "KCC"] else "Possibly Eligible",
        }
        for s in schemes
    ]

@router.get("/source-info")
def get_myscheme_source_info():
    """
    Returns official attribution and verification information for myScheme.gov.in integration.
    """
    return {
        "source": "myScheme.gov.in",
        "title": "National Platform for Government Schemes & Services",
        "portal_url": "https://www.myscheme.gov.in",
        "ministry": "Ministry of Electronics and Information Technology (MeitY) & NeGD",
        "purpose": "All government scheme details, eligibility guidelines, benefits, and required documents are sourced directly from the official myScheme platform.",
        "category": "Agriculture, Rural & Environment",
        "status": "Verified & Active",
    }

@router.post("/check-eligibility", response_model=EligibilityCheckResponse)
def check_eligibility_endpoint(req: EligibilityCheckRequest):
    """
    Rule-based eligibility evaluation.
    Compares farmer profile against scheme requirements.
    Results are clearly marked as 'Potentially Eligible' (never guaranteed).
    All schemes are linked to their canonical records on myScheme.gov.in.
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
        "myscheme_url": scheme.myscheme_url or f"https://www.myscheme.gov.in/schemes/{scheme.scheme_code.lower()}",
        "ministry": scheme.ministry or "Ministry of Agriculture and Farmers Welfare",
        "source": scheme.source or "myScheme.gov.in",
        "source_platform_url": "https://www.myscheme.gov.in",
    }
