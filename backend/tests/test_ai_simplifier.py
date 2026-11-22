"""
Unit Tests for AI Policy Simplifier & Fallback
"""
from app.services.ai_simplifier import generate_ai_explanation

def test_ai_fallback_loan_explanation():
    res = generate_ai_explanation("Why is my loan disbursed amount less than approved?", language="hi")
    assert res.reply is not None
    assert "80,000" in res.reply
    assert "70,000" in res.reply
    assert "10,000" in res.reply
    assert len(res.suggested_chips) > 0

def test_ai_fallback_insurance_explanation():
    res = generate_ai_explanation("Mera crop insurance ka paisa abhi tak nahi aaya", language="hi")
    assert "Under Review" in res.reply or "समीक्षा" in res.reply
    assert "30,000" in res.reply

def test_ai_fallback_msp_explanation():
    res = generate_ai_explanation("Explain my MSP payment rate for paddy", language="en")
    assert "2,300" in res.reply
    assert "1,15,000" in res.reply

def test_no_forbidden_words_in_ai_replies():
    forbidden = ["fraud", "scam", "thief", "crime", "illegal", "corrupt", "cheat"]
    for q in ["loan difference", "crop insurance delayed", "msp payment less"]:
        res = generate_ai_explanation(q, language="en")
        for word in forbidden:
            assert word not in res.reply.lower()
