import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.voice.telephony import (
    MockTelephonyAdapter,
    TelephonyCallContext,
)

client = TestClient(app)


def test_telephony_status_endpoint():
    res = client.get("/api/v1/voice/telephony/status")
    assert res.status_code == 200
    data = res.json()
    assert "telephony_enabled" in data
    assert data["provider"] in ["mock", "twilio", "exotel"]
    assert data["missed_call_service"] == "active"


def test_telephony_incoming_call_twiml():
    req = {
        "call_sid": "CA1234567890abcdef",
        "caller_phone": "+919876543210",
        "language": "hi",
    }
    # Test XML response
    res = client.post("/api/v1/voice/telephony/incoming", json=req)
    assert res.status_code == 200
    assert "application/xml" in res.headers["content-type"]
    assert "<Response>" in res.text
    assert "<Say" in res.text
    assert "<Gather" in res.text
    assert "किसानवेरीफाई" in res.text


def test_telephony_incoming_call_json():
    req = {
        "call_sid": "CA1234567890abcdef",
        "caller_phone": "+919876543210",
        "language": "en",
    }
    res = client.post(
        "/api/v1/voice/telephony/incoming",
        json=req,
        headers={"Accept": "application/json"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["call_sid"] == "CA1234567890abcdef"
    assert "KisanVerify" in data["speech_to_say"]
    assert data["gather_speech"] is True


def test_telephony_gather_speech_processing():
    req = {
        "call_sid": "CA-gather-1",
        "caller_phone": "+919876543210",
        "farmer_id": "FV12345",
        "language": "hi",
        "speech_result": "mera loan ka kya status hai?",
    }
    res = client.post("/api/v1/voice/telephony/gather", json=req)
    assert res.status_code == 200
    assert "application/xml" in res.headers["content-type"]
    assert "<Response>" in res.text
    # Should contain loan details (₹10,000 / दस हज़ार रुपये)
    assert "दस हज़ार" in res.text or "10,000" in res.text or "ऋण" in res.text


def test_telephony_gather_hangup():
    req = {
        "call_sid": "CA-gather-hangup",
        "caller_phone": "+919876543210",
        "farmer_id": "FV12345",
        "language": "hi",
        "speech_result": "dhanyawad alvida",
    }
    res = client.post("/api/v1/voice/telephony/gather", json=req)
    assert res.status_code == 200
    assert "<Hangup/>" in res.text


def test_telephony_missed_call():
    req = {
        "caller_phone": "9876543210",
        "language": "hi",
    }
    res = client.post("/api/v1/voice/telephony/missed-call", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "callback_queued"
    assert data["callback_ref"].startswith("CBK-")
    assert "XXXXX-3210" in data["caller_phone_masked"]
