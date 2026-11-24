import pytest
from app.services.verification_engine import verify_insurance

def test_insurance_exact_match():
    # 1. Exact match: 30,000 expected, 30,000 received
    res = verify_insurance(
        crop="Paddy",
        claim_amount_expected=30000.0,
        amount_received=30000.0,
        claim_status="Settled",
    )
    assert res.status == "Verified"
    assert res.is_match is True
    assert res.difference == 0.0
    assert res.is_flagged is False
    assert "figures match" in res.explanation.lower() or "matches" in res.explanation.lower()

def test_insurance_shortfall():
    # 2. Shortfall: ₹80,000 sum insured, 37.5% loss = ₹30,000 expected, ₹20,000 received
    res = verify_insurance(
        crop="Paddy",
        sum_insured=80000.0,
        assessed_loss_percentage=37.5,
        amount_received=20000.0,
        claim_status="Settled", # Marked settled but has shortfall -> Needs Review
    )
    assert res.status == "Needs Review"
    assert res.claim_amount_expected == 30000.0
    assert res.difference == 10000.0
    assert res.is_flagged is True
    assert "DISBURSEMENT_SHORTFALL" in res.reason_codes

def test_insurance_excess_disbursement():
    # 3. Excess: 30,000 expected, 35,000 received (State supplementary bonus)
    res = verify_insurance(
        crop="Paddy",
        claim_amount_expected=30000.0,
        amount_received=35000.0,
        claim_status="Settled",
    )
    assert res.status == "Verified"
    assert res.difference == -5000.0
    assert res.is_flagged is False
    assert "EXCESS_CREDIT_BONUS" in res.reason_codes
    assert "exceeds" in res.explanation.lower()

def test_insurance_rule_missing():
    # 4. Null expected when rule is missing
    res = verify_insurance(
        crop="Dragonfruit",
        sum_insured=100000.0,
        assessed_loss_percentage=50.0,
        amount_received=20000.0,
        rule_missing=True,
    )
    assert res.status == "Not Verified"
    assert res.claim_amount_expected is None
    assert res.difference is None
    assert "NO_VERIFIED_RULE" in res.reason_codes
    assert res.is_flagged is True

def test_insurance_tolerance():
    # 5. Tolerance: expected 30,000, received 29,950 with tolerance 100.0 -> within tolerance
    res = verify_insurance(
        crop="Paddy",
        claim_amount_expected=30000.0,
        amount_received=29950.0,
        claim_status="Settled",
        tolerance=100.0,
    )
    assert res.status == "Verified"
    assert res.is_match is True
    assert res.is_flagged is False

def test_insurance_zero_loss():
    # 6. Zero loss assessed: loss 0%, received 0 -> Verified zero loss
    res = verify_insurance(
        crop="Paddy",
        sum_insured=80000.0,
        assessed_loss_percentage=0.0,
        amount_received=0.0,
        claim_status="Settled",
    )
    assert res.status == "Verified"
    assert res.claim_amount_expected == 0.0
    assert res.difference == 0.0
    assert res.is_match is True

def test_insurance_missing_received_amount():
    # 7. Missing received amount -> Not Verified
    res = verify_insurance(
        crop="Paddy",
        claim_amount_expected=30000.0,
        amount_received=None,
    )
    assert res.status == "Not Verified"
    assert res.amount_received is None
    assert res.difference is None
    assert "MISSING_RECEIVED_AMOUNT" in res.reason_codes
