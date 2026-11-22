"""
Tests for Static File Mounting, Health Check, and SPA Fallback Routing
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "database" in data
    assert "version" in data

def test_spa_deep_link_or_root_serving():
    response = client.get("/")
    assert response.status_code == 200

    # Deep link should return 200
    deep_link_response = client.get("/schemes")
    assert deep_link_response.status_code == 200

def test_unmatched_api_route_returns_404_json():
    response = client.get("/api/v1/non_existent_route_12345")
    assert response.status_code == 404
    assert response.headers["content-type"].startswith("application/json")
    data = response.json()
    assert "detail" in data
