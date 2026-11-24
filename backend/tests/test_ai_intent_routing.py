import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_simplifier import (
    detect_intent,
    generate_ai_explanation,
    verify_grounded_response,
    ChatMessage,
    INTENT_GREETING,
    INTENT_SCHEME_ELIGIBILITY,
    INTENT_LOAN_STATUS,
    INTENT_LOAN_APPLY,
    INTENT_MSP_STATUS,
    INTENT_INSURANCE_CLAIM_STATUS,
    INTENT_REQUIRED_DOCUMENTS,
    INTENT_MANDI_PRICE,
    INTENT_WEATHER,
    INTENT_NEARBY_OFFICE,
    INTENT_GRIEVANCE,
    INTENT_CONTACT_HELP,
    INTENT_UNKNOWN,
)

client = TestClient(app)

def test_intent_detection_multilingual():
    """Verify deterministic intent detection across English, Hindi, and Hinglish."""
    # Greetings
    assert detect_intent("hlo") == INTENT_GREETING
    assert detect_intent("hello") == INTENT_GREETING
    assert detect_intent("hi") == INTENT_GREETING
    assert detect_intent("नमस्ते") == INTENT_GREETING
    assert detect_intent("pranam") == INTENT_GREETING

    # Scheme eligibility
    assert detect_intent("which scheme am i eligible for") == INTENT_SCHEME_ELIGIBILITY
    assert detect_intent("मुझे कौन सी योजना मिल सकती है") == INTENT_SCHEME_ELIGIBILITY
    assert detect_intent("kaun si yojana ke liye eligible hu") == INTENT_SCHEME_ELIGIBILITY
    assert detect_intent("yojana eligibility bataye") == INTENT_SCHEME_ELIGIBILITY

    # Loan status & application
    assert detect_intent("mera loan status kya hai") == INTENT_LOAN_STATUS
    assert detect_intent("what is my kcc loan difference") == INTENT_LOAN_STATUS
    assert detect_intent("loans i can apply for") == INTENT_LOAN_APPLY
    assert detect_intent("naya loan kaise milega") == INTENT_LOAN_APPLY

    # MSP procurement
    assert detect_intent("msp status") == INTENT_MSP_STATUS
    assert detect_intent("dhan ka paisa kitna mila") == INTENT_MSP_STATUS
    assert detect_intent("mandi procurement payment") == INTENT_MSP_STATUS

    # Insurance claim
    assert detect_intent("claim status") == INTENT_INSURANCE_CLAIM_STATUS
    assert detect_intent("fasal bima ka paisa kab aayega") == INTENT_INSURANCE_CLAIM_STATUS
    assert detect_intent("pmfby crop insurance under review") == INTENT_INSURANCE_CLAIM_STATUS

    # Required documents
    assert detect_intent("kaun se documents chahiye") == INTENT_REQUIRED_DOCUMENTS
    assert detect_intent("required documents") == INTENT_REQUIRED_DOCUMENTS
    assert detect_intent("dastavej checklist") == INTENT_REQUIRED_DOCUMENTS

    # Mandi prices & weather
    assert detect_intent("mandi price of paddy") == INTENT_MANDI_PRICE
    assert detect_intent("aaj ka mandi bhav") == INTENT_MANDI_PRICE
    assert detect_intent("weather today") == INTENT_WEATHER
    assert detect_intent("aaj mausam kaisa rahega") == INTENT_WEATHER

    # Nearby office & contact
    assert detect_intent("nearest agriculture office") == INTENT_NEARBY_OFFICE
    assert detect_intent("najdeeki krishi office kahan hai") == INTENT_NEARBY_OFFICE
    assert detect_intent("contact helpline number") == INTENT_CONTACT_HELP
    assert detect_intent("sahayata sampark number") == INTENT_CONTACT_HELP

    # Grievance
    assert detect_intent("shikayat kaise darj kare") == INTENT_GRIEVANCE
    assert detect_intent("file a grievance") == INTENT_GRIEVANCE

    # Unknown
    assert detect_intent("random nonsense string 999 xyz") == INTENT_UNKNOWN


def test_different_intents_return_different_answers():
    """Ensure each intent returns a distinct, relevant answer, not the canned records summary."""
    res_greeting = generate_ai_explanation("hlo", language="en")
    res_schemes = generate_ai_explanation("which scheme am i eligible for", language="en")
    res_loan = generate_ai_explanation("what is the status of my loan", language="en")
    res_msp = generate_ai_explanation("what about my msp payment", language="en")
    res_claim = generate_ai_explanation("what is the status of my crop insurance claim", language="en")
    res_weather = generate_ai_explanation("weather today", language="en")
    res_unknown = generate_ai_explanation("qwertyuiop asdfgh", language="en")

    replies = [
        res_greeting.reply,
        res_schemes.reply,
        res_loan.reply,
        res_msp.reply,
        res_claim.reply,
        res_weather.reply,
        res_unknown.reply,
    ]

    # All replies must be non-empty and unique
    assert len(set(replies)) == len(replies)

    # Greeting should not dump the financial numbers
    assert "Disbursed" not in res_greeting.reply
    assert "₹80,000" not in res_greeting.reply

    # Unknown should give suggestions and not dump the financial numbers
    assert "Which schemes am I eligible for" in res_unknown.reply or "couldn't understand" in res_unknown.reply
    assert "₹80,000" not in res_unknown.reply

    # Schemes should mention PM-KISAN or PMFBY
    assert "PM-KISAN" in res_schemes.reply
    assert res_schemes.action_link == "/farmer/schemes"

    # Loan should mention KCC and ₹80,000
    assert "₹80,000" in res_loan.reply
    assert "₹70,000" in res_loan.reply
    assert res_loan.action_link == "/farmer/loan-verify"

    # MSP should mention ₹1,15,000 or ₹2,300
    assert "₹1,15,000" in res_msp.reply or "₹2,300" in res_msp.reply
    assert res_msp.action_link == "/farmer/msp-verify"

    # Claim should mention INS-2024-7711 or ₹30,000
    assert "INS-2024-7711" in res_claim.reply or "₹30,000" in res_claim.reply
    assert res_claim.action_link == "/farmer/claim-verify"


def test_scheme_eligibility_engine_grounding():
    """Verify scheme eligibility lists actual schemes from the deterministic engine."""
    res = generate_ai_explanation("which scheme am i eligible for", language="en")
    assert res.intent == INTENT_SCHEME_ELIGIBILITY
    assert "PM-KISAN" in res.reply
    assert "PMFBY" in res.reply
    assert res.action_link == "/farmer/schemes"
    # Never promise approval
    assert "guaranteed" not in res.reply.lower()
    assert "may be eligible" in res.reply.lower()


def test_verification_safety_rejection():
    """Verify that ungrounded numbers, ungrounded URLs, and accusatory language are rejected."""
    facts = [
        "Sanctioned: ₹80,000",
        "Disbursed: ₹70,000",
        "Official URL: https://www.myscheme.gov.in/schemes/pm-kisan",
    ]

    # Valid grounded text
    valid_text = "Your loan sanctioned is ₹80,000 and disbursed is ₹70,000. Check https://www.myscheme.gov.in/schemes/pm-kisan for details."
    assert verify_grounded_response(valid_text, facts) is True

    # Hallucinated number (e.g. ₹95,000 not in facts)
    hallucinated_num = "Your sanctioned loan is ₹95,000 and you owe ₹50,000."
    assert verify_grounded_response(hallucinated_num, facts) is False

    # Hallucinated URL
    hallucinated_url = "Apply at https://fake-kisan-portal.com/apply right now."
    assert verify_grounded_response(hallucinated_url, facts) is False

    # Accusatory / fraud wording
    accusatory_text = "The bank has committed fraud and cheated you of your money."
    assert verify_grounded_response(accusatory_text, facts) is False

    # Guarantee wording
    guarantee_text = "Your loan approval is guaranteed."
    assert verify_grounded_response(guarantee_text, facts) is False


def test_fallback_when_llm_fails_or_unconfigured():
    """Verify fallback is intent-specific and graceful when LLM fails or is absent."""
    with patch("app.core.config.settings.GEMINI_API_KEY", ""):
        res = generate_ai_explanation("weather today", language="hi")
        assert res.mode == "offline"
        assert res.provider == "template-fallback"
        assert res.intent == INTENT_WEATHER
        assert "मौसम" in res.reply or "तापमान" in res.reply
        assert res.action_link == "/farmer/weather"


def test_ai_status_endpoint():
    """Verify /api/v1/ai/status endpoint returns valid operational mode."""
    response = client.get("/api/v1/ai/status")
    assert response.status_code == 200
    data = response.json()
    assert "provider_configured" in data
    assert data["mode"] in ["live", "offline"]
    assert "provider" in data
    assert "model" in data


def test_chat_api_endpoint_with_history():
    """Verify /api/v1/ai/chat processes user message and conversation history."""
    payload = {
        "message": "and the loan one?",
        "language": "en",
        "farmer_id": "FV12345",
        "history": [
            {"role": "user", "content": "which scheme am i eligible for"},
            {"role": "assistant", "content": "You may be eligible for PM-KISAN and PMFBY."},
        ]
    }
    response = client.post("/api/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["intent"] == INTENT_LOAN_STATUS
    assert "₹80,000" in data["reply"]
