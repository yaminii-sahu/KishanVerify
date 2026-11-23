import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine, SessionLocal
from app.core.seed import seed_database

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    seed_database()

client = TestClient(app)

def test_schemes_list_default():
    res = client.get("/api/v1/schemes/")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 6
    # Verify every scheme has level, category, and eligibility_status as Potentially Eligible
    for s in schemes:
        assert s["level"] in ["Central", "State"]
        assert "eligibility_status" in s
        assert "potentially" in s["eligibility_status"].lower()

def test_schemes_filter_central():
    res = client.get("/api/v1/schemes/?level=Central")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 4
    for s in schemes:
        assert s["level"] == "Central"
        assert s["state"] is None

def test_schemes_filter_state():
    res = client.get("/api/v1/schemes/?level=State&state=Chhattisgarh")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 2
    for s in schemes:
        assert s["level"] == "State"
        assert s["state"] == "Chhattisgarh"

def test_schemes_category_filter():
    res = client.get("/api/v1/schemes/?category=Insurance")
    assert res.status_code == 200
    schemes = res.json()
    assert len(schemes) >= 1
    for s in schemes:
        assert s["category"].lower() == "insurance"

def test_schemes_official_urls_are_valid_gov_domains():
    res = client.get("/api/v1/schemes/")
    assert res.status_code == 200
    schemes = res.json()
    for s in schemes:
        if s.get("official_url"):
            url = s["official_url"]
            assert url.startswith("https://")
            assert (".gov.in" in url) or (".nic.in" in url), f"Invalid gov URL: {url}"
            assert s["has_verified_official_portal"] is True

def test_report_broken_link():
    res = client.post("/api/v1/schemes/PM-KISAN/report-broken-link", json={
        "farmer_id": "FV12345",
        "reported_url": "https://pmkisan.gov.in",
        "note": "Page returned timeout error"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "recorded" in data["message"].lower()
