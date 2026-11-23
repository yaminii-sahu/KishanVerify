import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_verified_helplines():
    response = client.get("/api/v1/contact/helplines")
    assert response.status_code == 200
    helplines = response.json()
    assert len(helplines) >= 5

    codes = [h["code"] for h in helplines]
    assert "GOI-KCC" in codes
    assert "GOI-PM-KISAN" in codes
    assert "GOI-PMFBY" in codes
    assert "GOI-RBI" in codes

    kcc = next(h for h in helplines if h["code"] == "GOI-KCC")
    assert kcc["number"] == "1800-180-1551"
    assert kcc["is_toll_free"] is True
    assert kcc["verified"] is True

def test_submit_contact_form_success():
    payload = {
        "name": "Ramesh Kumar",
        "phone": "9876543210",
        "email": "ramesh@example.com",
        "category": "Loan Verification",
        "message": "There is a ₹10,000 difference in my KCC interest subvention credit.",
        "farmer_id": "FV12345",
        "website_url": ""  # empty honeypot
    }
    response = client.post("/api/v1/contact/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ticket_id" in data
    assert data["ticket_id"].startswith("TKT-")
    assert data["status"] == "Received"
    assert "24" in data["turnaround_time"]

def test_submit_contact_honeypot_spam_rejection():
    spam_payload = {
        "name": "Spam Bot",
        "phone": "9999999999",
        "email": "bot@spammer.com",
        "category": "Other",
        "message": "Click here for cheap pills",
        "website_url": "https://spamlink.com"  # Bot filled this honeypot!
    }
    response = client.post("/api/v1/contact/submit", json=spam_payload)
    assert response.status_code == 400
    assert "Spam submission detected" in response.json()["detail"]

def test_submit_contact_invalid_phone_rejection():
    payload = {
        "name": "Ramesh",
        "phone": "123",  # invalid short phone
        "category": "Other",
        "message": "Test inquiry message with sufficient length.",
        "website_url": ""
    }
    response = client.post("/api/v1/contact/submit", json=payload)
    # Pydantic or endpoint rejects invalid length
    assert response.status_code in (422, 400)
