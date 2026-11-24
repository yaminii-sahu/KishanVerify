import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.core.seed import ensure_sqlite_columns, seed_demo_msp_events
from app.models.models import MSPRecord

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_msp_db():
    ensure_sqlite_columns()
    db = SessionLocal()
    seed_demo_msp_events(db)
    db.close()

def test_get_msp_timeline_success():
    response = client.get("/api/v1/msp/MSP-2024-4411/timeline")
    assert response.status_code == 200
    data = response.json()
    assert data["record_ref"] == "MSP-2024-4411"
    assert data["crop"] == "Paddy (Common)"
    assert data["expected_payment"] == 115000.0
    assert data["actual_payment"] == 105000.0
    assert data["difference"] == 10000.0
    assert len(data["events"]) >= 8
    
    # Check that events contain registered, produce_delivered, weighed, payment_credited
    event_types = [e["event_type"] for e in data["events"]]
    assert "registered" in event_types
    assert "produce_delivered" in event_types
    assert "weighed" in event_types
    assert "payment_credited" in event_types
    assert "payment_initiated" in event_types

def test_msp_timeline_delay_flag():
    response = client.get("/api/v1/msp/MSP-2024-4411/timeline?threshold_days=14")
    assert response.status_code == 200
    data = response.json()
    assert data["threshold_days"] == 14
    assert data["is_delayed"] is True
    assert data["delay_notice_en"] is not None
    assert "exceeds standard 14-day" in data["delay_notice_en"]

def test_msp_adjustment_rules():
    response = client.get("/api/v1/msp/rules")
    assert response.status_code == 200
    rules = response.json()
    assert len(rules) >= 4
    rule_codes = [r["rule_code"] for r in rules]
    assert "CG-MANDI-CESS-2024" in rule_codes
    assert "CG-HAMALI-2024" in rule_codes
