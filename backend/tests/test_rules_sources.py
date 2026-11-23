import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.verification_engine import (
    verify_loan,
    verify_msp,
    verify_insurance,
    OFFICIAL_MSP_RULES,
    OFFICIAL_LOAN_RULES,
)

client = TestClient(app)

def test_verify_rules_endpoint():
    response = client.get("/api/v1/verify/rules")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    
    # Check that official Paddy rule is present
    rule_codes = [r["rule_code"] for r in data]
    assert "CACP-MSP-KHARIF-PADDY-2024" in rule_codes or any("PADDY" in c for c in rule_codes)
    assert any("RBI" in c or "KCC" in c for c in rule_codes)

def test_verify_loan_sources_and_rule_transparency():
    # Discrepancy case: Approved 80,000, Disbursed 70,000
    res = verify_loan(
        approved_amount=80000.0,
        disbursed_amount=70000.0,
        deductions=5000.0,
        bank_name="State Bank of India"
    )
    assert res.is_flagged is True
    assert res.difference == 10000.0
    assert res.unaccounted_difference == 5000.0
    assert res.flagged_rule_code == "RULE-LOAN-DISBURSEMENT"
    assert res.flagged_rule_threshold is not None
    assert len(res.sources) >= 4

    origins = {s.data_origin for s in res.sources}
    assert "bank_document" in origins
    assert "official" in origins

    # Verified case: Approved 50,000, Disbursed 50,000
    res_clean = verify_loan(
        approved_amount=50000.0,
        disbursed_amount=50000.0,
        deductions=0.0,
        bank_name="State Bank of India"
    )
    assert res_clean.is_flagged is False
    assert res_clean.difference == 0.0
    assert res_clean.flagged_rule_code is None
    assert len(res_clean.sources) >= 4

def test_verify_msp_sources_and_benchmarks():
    # MSP Paddy Common: 50 quintals at 2300 = 115,000 expected, 105,000 actual -> 10,000 diff
    res = verify_msp(
        crop="Paddy",
        quantity_quintals=50.0,
        msp_rate=2300.0,
        actual_payment=105000.0,
        procurement_center="Durg Mandi"
    )
    assert res.is_flagged is True
    assert res.expected_payment == 115000.0
    assert res.difference == 10000.0
    assert res.flagged_rule_code == "RULE-MSP-PAYMENT"
    assert len(res.sources) >= 3

    # Check that official CACP URL is cited
    official_source = next((s for s in res.sources if s.data_origin == "official"), None)
    assert official_source is not None
    assert "cacp.dacnet.nic.in" in official_source.url or "agriwelfare.gov.in" in official_source.url
    assert official_source.status == "verified"

def test_verify_loan_api_endpoint_returns_sources():
    response = client.post("/api/v1/verify/loan", json={
        "bank_name": "Punjab National Bank",
        "loan_account_ref": "LN-TEST-001",
        "loan_type": "KCC",
        "approved_amount": 100000.0,
        "disbursed_amount": 90000.0,
        "interest_rate": 7.0,
        "deductions": 2000.0,
        "loan_date": "2025-01-15"
    })
    assert response.status_code == 200
    data = response.json()
    assert "sources" in data
    assert len(data["sources"]) >= 3
    assert data["flagged_rule_code"] == "RULE-LOAN-DISBURSEMENT"
