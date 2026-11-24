import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.seed import ensure_sqlite_columns, seed_demo_claim_events

@pytest.fixture(autouse=True)
def init_db():
    ensure_sqlite_columns()
    db = SessionLocal()
    seed_demo_claim_events(db)
    db.close()

def test_claim_timeline_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/v1/claims/INS-2024-7711/timeline")
        assert res.status_code == 200
        data = res.json()

        assert data["insurance_ref"] == "INS-2024-7711"
        assert "Paddy" in data["crop"]
        assert len(data["events"]) >= 7
        assert data["missing_events_count"] >= 1

        # Delay detection
        assert data["threshold_days"] == 21
        assert data["days_in_current_stage"] >= 21
        assert data["is_delayed"] is True
        assert "may need" in data["delay_notice_en"].lower() or "may be delayed" in data["delay_notice_en"].lower()
        assert "समीक्षा" in data["delay_notice_hi"]

        # Missing step placeholder
        missing_placeholders = [e for e in data["events"] if e["is_missing_placeholder"]]
        assert len(missing_placeholders) >= 1
        assert missing_placeholders[0]["date"] == "Date Pending"
        assert missing_placeholders[0]["amount"] == 10000.0

        # Origins
        origins = {e["data_origin"] for e in data["events"]}
        assert "official" in origins
        assert "bank_document" in origins

def test_claim_timeline_custom_threshold():
    with TestClient(app) as client:
        # If threshold is very high (e.g. 5000 days), is_delayed should be False
        res = client.get("/api/v1/claims/INS-2024-7711/timeline?threshold_days=5000")
        assert res.status_code == 200
        data = res.json()
        assert data["is_delayed"] is False
