import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.offices import haversine_km

client = TestClient(app)

def test_haversine_calculation():
    # Distance between Patan (21.0362, 81.5375) and Durg KVK (21.1610, 81.2580)
    dist = haversine_km(21.0362, 81.5375, 21.1610, 81.2580)
    assert 25.0 < dist < 35.0  # Around ~32 km

    # Distance to same point is 0
    assert haversine_km(21.0, 81.0, 21.0, 81.0) == 0.0

def test_get_offices_default():
    response = client.get("/api/v1/offices")
    assert response.status_code == 200
    data = response.json()
    assert "offices" in data
    assert "total_count" in data
    assert data["total_count"] >= 5
    assert data["is_demo"] is True
    assert "center" in data

def test_get_offices_with_coordinates_sorted_by_distance():
    # Ramesh Kumar in Patan: 21.0362, 81.5375
    response = client.get("/api/v1/offices?lat=21.0362&lon=81.5375")
    assert response.status_code == 200
    data = response.json()
    offices = data["offices"]
    assert len(offices) > 0

    # Ensure distances are calculated and monotonically non-decreasing
    distances = [o["distance_km"] for o in offices if o["distance_km"] is not None]
    assert len(distances) == len(offices)
    assert distances == sorted(distances)

    # Nearest office to Patan center should be within 1 km (e.g. SBI Patan or CSC Patan)
    assert distances[0] < 2.0

def test_get_offices_filter_by_type():
    response = client.get("/api/v1/offices?office_type=KVK")
    assert response.status_code == 200
    data = response.json()
    offices = data["offices"]
    assert len(offices) > 0
    for o in offices:
        assert o["office_type"] == "KVK"

def test_get_offices_filter_by_district():
    response = client.get("/api/v1/offices?district=Durg")
    assert response.status_code == 200
    data = response.json()
    offices = data["offices"]
    assert len(offices) > 0
    for o in offices:
        assert "Durg" in o["district"]
