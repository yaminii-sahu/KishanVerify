import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.voice.agent import (
    phoneticize_speech,
    is_affirmative,
    is_negative,
    VoiceTurnRequest,
    process_voice_call_turn,
)

client = TestClient(app)


def test_voice_status_endpoint():
    res = client.get("/api/v1/voice/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ready"
    assert "get_loan_status" in data["tools_loaded"]
    assert "raise_grievance" in data["tools_loaded"]
    assert data["phonetic_converter"] == "enabled"


def test_phonetic_number_conversion():
    hi_conv = phoneticize_speech("आपके खाते में ₹10,000 का अंतर है", language="hi")
    assert "दस हज़ार रुपये" in hi_conv
    assert "₹" not in hi_conv

    en_conv = phoneticize_speech("Approved limit is ₹80,000 and disbursed is ₹70,000", language="en")
    assert "eighty thousand rupees" in en_conv
    assert "seventy thousand rupees" in en_conv
    assert "₹" not in en_conv


def test_affirmation_and_negation_detection():
    assert is_affirmative("haan ji bilkul") is True
    assert is_affirmative("yes please proceed") is True
    assert is_affirmative("sahi hai kardo") is True
    assert is_negative("nahi mat karna") is True
    assert is_negative("no cancel it") is True
    assert is_negative("ruk jao") is True


def test_voice_turn_greeting():
    # Hindi greeting
    req_hi = {"user_speech_text": "namaste", "language": "hi"}
    res_hi = client.post("/api/v1/voice/turn", json=req_hi)
    assert res_hi.status_code == 200
    d_hi = res_hi.json()
    assert "नमस्ते" in d_hi["agent_speech_text"] or "किसानवेरीफाई" in d_hi["agent_speech_text"]

    # English greeting
    req_en = {"user_speech_text": "hello", "language": "en"}
    res_en = client.post("/api/v1/voice/turn", json=req_en)
    assert res_en.status_code == 200
    d_en = res_en.json()
    assert "KisanVerify" in d_en["agent_speech_text"]


def test_voice_turn_loan_status():
    req = {
        "user_speech_text": "mera loan ka kya status hai aur kitna kata hai?",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["tool_called"] == "get_loan_status"
    assert data["action_card"]["type"] == "loan_card"
    assert "दस हज़ार रुपये" in data["agent_speech_phonetic"] or "10,000" in data["agent_speech_text"]
    assert data["tool_result"]["difference"] == 10000.0


def test_voice_turn_msp_status():
    req = {
        "user_speech_text": "dhan ka msp payment kitna mila?",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["tool_called"] == "get_msp_status"
    assert data["action_card"]["type"] == "msp_card"
    assert data["tool_result"]["actual_payment"] == 105000.0


def test_voice_turn_insurance_claim():
    req = {
        "user_speech_text": "fasal bima claim status kya hai?",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["tool_called"] == "get_claim_status"
    assert data["action_card"]["type"] == "claim_card"
    assert data["tool_result"]["pending_balance"] == 10000.0


def test_voice_turn_mandi_prices():
    req = {
        "user_speech_text": "aaj mandi me dhan ka bhav kya hai?",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["tool_called"] == "get_mandi_prices"
    assert data["action_card"]["type"] == "mandi_card"
    assert data["tool_result"]["modal_price"] == 2280.0


def test_voice_turn_weather():
    req = {
        "user_speech_text": "aaj mausam kaisa rahega kheti ke liye?",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["tool_called"] == "get_weather_alerts"
    assert data["action_card"]["type"] == "weather_card"


def test_verbal_confirmation_grievance_workflow():
    # Turn 1: Farmer verbally asks to raise grievance
    req1 = {
        "user_speech_text": "shikayat darj karni hai is antar ke liye",
        "language": "hi",
        "current_record_context": {"record_ref": "LN-2024-8812"},
    }
    res1 = client.post("/api/v1/voice/turn", json=req1)
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["confirmation_requested"] is True
    assert d1["confirmation_action"]["action"] == "raise_grievance"
    assert "हाँ" in d1["agent_speech_text"] or "शिकायत" in d1["agent_speech_text"]

    # Turn 2: Farmer confirms with 'haan ji bilkul kardo'
    req2 = {
        "user_speech_text": "haan bilkul kardo",
        "language": "hi",
        "confirmation_pending": d1["confirmation_action"],
    }
    res2 = client.post("/api/v1/voice/turn", json=req2)
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["confirmation_requested"] is False
    assert d2["tool_called"] == "raise_grievance"
    assert d2["tool_result"]["status"] in ["success", "SUBMITTED"]
    assert d2["tool_result"]["grievance_ref"].startswith("GRV-")
    assert "दर्ज" in d2["agent_speech_text"]


def test_verbal_confirmation_cancelled():
    # Turn 1: Farmer asks for callback
    req1 = {
        "user_speech_text": "kisi officer se baat karni hai callback chahiye",
        "language": "en",
    }
    res1 = client.post("/api/v1/voice/turn", json=req1)
    assert res1.status_code == 200
    d1 = res1.json()
    assert d1["confirmation_requested"] is True
    assert d1["confirmation_action"]["action"] == "request_callback"

    # Turn 2: Farmer says 'no cancel'
    req2 = {
        "user_speech_text": "no cancel it",
        "language": "en",
        "confirmation_pending": d1["confirmation_action"],
    }
    res2 = client.post("/api/v1/voice/turn", json=req2)
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["confirmation_requested"] is False
    assert "cancelled" in d2["agent_speech_text"].lower()


def test_voice_turn_unknown_fallback():
    req = {
        "user_speech_text": "random gibberish phrase xyz 123",
        "language": "en",
    }
    res = client.post("/api/v1/voice/turn", json=req)
    assert res.status_code == 200
    data = res.json()
    assert "couldn't catch that" in data["agent_speech_text"].lower()
    assert len(data["suggested_quick_phrases"]) >= 3
