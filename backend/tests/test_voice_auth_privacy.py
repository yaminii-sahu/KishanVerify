import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.voice.auth_privacy import (
    verify_caller_pin,
    PinVerifyRequest,
    MAX_TURNS_PER_SESSION,
    _VOICE_SESSIONS,
)

client = TestClient(app)


def test_verify_caller_pin_success():
    req = {
        "phone_number": "9876543210",
        "pin": "1234",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/verify-caller-pin", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["farmer_id"] == "FV12345"
    assert "XXXXX-3210" in data["phone_masked"]
    assert data["session_id"].startswith("vcall-")


def test_verify_caller_pin_invalid():
    req = {
        "phone_number": "9876543210",
        "pin": "9999",
        "language": "en",
    }
    res = client.post("/api/v1/voice/verify-caller-pin", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert "Invalid PIN" in data["message"]


def test_consent_disclosure_endpoint():
    res_hi = client.get("/api/v1/voice/consent-disclosure?language=hi")
    assert res_hi.status_code == 200
    d_hi = res_hi.json()
    assert "कृत्रिम बुद्धिमत्ता" in d_hi["disclosure_text"]

    res_en = client.get("/api/v1/voice/consent-disclosure?language=en")
    assert res_en.status_code == 200
    d_en = res_en.json()
    assert "AI voice assistant" in d_en["disclosure_text"]


def test_record_consent():
    req = {
        "session_id": "test-sess-consent-1",
        "consent_given": True,
        "farmer_id": "FV12345",
    }
    res = client.post("/api/v1/voice/record-consent", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["consent_given"] is True
    assert data["status"] == "Recorded"


def test_turn_rate_limiting():
    sess_id = "test-rate-limit-session"
    # Send up to MAX_TURNS_PER_SESSION turns (20)
    for i in range(MAX_TURNS_PER_SESSION):
        res = client.post(
            "/api/v1/voice/turn",
            json={"session_id": sess_id, "user_speech_text": "namaste", "language": "hi"},
        )
        assert res.status_code == 200

    # The 21st turn should exceed limit and return 429
    res_limit = client.post(
        "/api/v1/voice/turn",
        json={"session_id": sess_id, "user_speech_text": "namaste", "language": "hi"},
    )
    assert res_limit.status_code == 429
    assert "अधिकतम सीमा" in res_limit.json()["detail"] or "Session limit" in res_limit.json()["detail"]


def test_purge_voice_history():
    # Setup test session
    sess_id = "test-purge-session"
    client.post(
        "/api/v1/voice/turn",
        json={"session_id": sess_id, "farmer_id": "FV99999", "user_speech_text": "namaste"},
    )
    assert sess_id in _VOICE_SESSIONS

    # Purge history
    del_res = client.delete("/api/v1/voice/history/FV99999")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True
    assert sess_id not in _VOICE_SESSIONS
