"""
Unit tests for Scheme Eligibility Engine
"""
import pytest
from app.services.eligibility_engine import evaluate_eligibility

def test_ramesh_kumar_standard_eligibility():
    """Ramesh Kumar (3 acres, Paddy, Durg, CG, Small Farmer)."""
    res = evaluate_eligibility(
        state="Chhattisgarh",
        district="Durg",
        crop="Paddy",
        land_holding_acres=3.0,
        farmer_category="Small Farmer",
        loan_status="Yes"
    )

    assert res.schemes_count == 4
    assert res.eligible_count >= 3
    assert "guarantee" in res.disclaimer.lower()

    # Verify PM-KISAN, PMFBY, KCC
    codes = [s.scheme_code for s in res.schemes]
    assert "PM-KISAN" in codes
    assert "PMFBY" in codes
    assert "KCC" in codes
    assert "INPUT-SUB" in codes

def test_large_farmer_input_subsidy_possibly_eligible():
    """Large farmer in CG should have input subsidy marked possibly eligible."""
    res = evaluate_eligibility(
        state="Chhattisgarh",
        district="Durg",
        crop="Paddy",
        land_holding_acres=15.0,
        farmer_category="Large Farmer",
        loan_status="No"
    )
    input_sub = next(s for s in res.schemes if s.scheme_code == "INPUT-SUB")
    assert input_sub.eligibility_status == "Possibly Eligible"

def test_documents_and_deadlines_present():
    """Every scheme returned must have required documents and a deadline."""
    res = evaluate_eligibility("Chhattisgarh", "Durg", "Paddy", 3.0)
    for scheme in res.schemes:
        assert len(scheme.documents_required) > 0
        assert scheme.deadline is not None
