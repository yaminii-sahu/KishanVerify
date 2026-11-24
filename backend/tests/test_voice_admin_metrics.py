import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import SessionLocal
from app.models.models import CallbackRequest

client = TestClient(app)


def test_voice_admin_metrics_endpoints():
    # 1. Admin router
    res1 = client.get("/api/v1/admin/voice-metrics")
    assert res1.status_code == 200
    d1 = res1.json()
    assert "total_calls" in d1
    assert d1["grounded_resolution_rate_pct"] > 95
    assert len(d1["top_query_intents"]) >= 4
    assert "callbacks" in d1

    # 2. Voice alias router
    res2 = client.get("/api/v1/voice/admin/metrics")
    assert res2.status_code == 200
    d2 = res2.json()
    assert d2["total_calls"] == d1["total_calls"]


def test_resolve_callback_request():
    # Insert a test callback request
    db = SessionLocal()
    cb = CallbackRequest(
        farmer_id="FV12345",
        callback_ref="CBK-TEST-9999",
        topic="Test callback resolution",
        status="PENDING",
        phone_masked="+91-XXXXX-9999",
        preferred_language="hi",
    )
    db.add(cb)
    db.commit()
    db.refresh(cb)
    cb_id = cb.id
    db.close()

    # Resolve callback
    resolve_res = client.post(
        f"/api/v1/admin/callbacks/{cb_id}/resolve",
        json={"status": "RESOLVED", "officer_notes": "Contacted farmer via phone."},
    )
    assert resolve_res.status_code == 200
    data = resolve_res.json()
    assert data["success"] is True
    assert data["status"] == "RESOLVED"

    # Confirm in DB
    db2 = SessionLocal()
    updated = db2.query(CallbackRequest).filter(CallbackRequest.id == cb_id).first()
    assert updated.status == "RESOLVED"
    db2.close()
