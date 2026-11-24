import pytest
from app.services.verification_engine import verify_msp

def test_verify_msp_explained_and_unexplained_split():
    # 50 quintals at 2300 = 115000 expected, 105000 actual, diff 10000
    res = verify_msp(
        crop="Paddy (Common)",
        quantity_quintals=50.0,
        msp_rate=2300.0,
        actual_payment=105000.0,
        procurement_center="Patan Krishi Upaj Mandi"
    )
    assert res.status == "Needs Review"
    assert res.difference == 10000.0
    assert res.gross_expected == 115000.0
    assert res.total_explained_adjustments > 0
    assert res.unexplained_difference > 0
    # Explained + Unexplained must equal Total Difference
    assert round(res.total_explained_adjustments + res.unexplained_difference, 2) == res.difference
    
    # Check adjustments categories
    categories = [a["category"] for a in res.adjustments]
    assert "hamali" in categories
    assert "quality_cut" in categories
    assert "bardana" in categories
    assert "unexplained" in categories
    
    # Check questions to ask are non-empty and neutral
    assert len(res.questions_to_ask) >= 3
    for q in res.questions_to_ask:
        assert "target_authority" in q
        assert "statutory_reference" in q
        assert "question_en" in q
        assert "question_hi" in q

def test_verify_msp_with_state_bonus():
    # 50 quintals at 2300 + 100 bonus = 120000 gross expected
    res = verify_msp(
        crop="Paddy (Common)",
        quantity_quintals=50.0,
        msp_rate=2300.0,
        actual_payment=120000.0,
        procurement_center="Patan Krishi Upaj Mandi",
        state_bonus_per_quintal=100.0,
    )
    assert res.status == "Verified"
    assert res.gross_expected == 120000.0
    assert res.difference == 0.0
    assert res.unexplained_difference == 0.0
