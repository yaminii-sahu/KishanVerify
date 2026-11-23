import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.api.weather import generate_agricultural_advisories

client = TestClient(app)

def test_get_weather_endpoint():
    res = client.get("/api/v1/weather?lat=21.03&lon=81.53&district=Durg&state=Chhattisgarh")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "location" in data
    assert "current" in data
    assert "forecast" in data
    assert len(data["forecast"]) == 7
    assert "advisories" in data
    assert len(data["advisories"]) >= 1
    assert "official_imd_url" in data
    assert "mausam.imd.gov.in" in data["official_imd_url"]

def test_advisory_rule_engine_heavy_rain():
    advisories = generate_agricultural_advisories(
        current_temp=28.0,
        max_temp=30.0,
        min_temp=22.0,
        precipitation_sum=35.0,  # >= 25 mm
        max_rain_prob=85,
        max_wind=15.0,
        humidity=85
    )
    warning_advisories = [a for a in advisories if a["level"] == "Warning"]
    assert len(warning_advisories) >= 1
    rain_adv = [a for a in warning_advisories if "rain" in a["id"]][0]
    assert "spraying" in rain_adv["title"].lower() or "spray" in rain_adv["title"].lower()
    assert "छिड़काव" in rain_adv["title_hi"]

def test_advisory_rule_engine_heatwave():
    advisories = generate_agricultural_advisories(
        current_temp=39.0,
        max_temp=42.5,  # >= 40 C
        min_temp=28.0,
        precipitation_sum=0.0,
        max_rain_prob=5,
        max_wind=10.0,
        humidity=35
    )
    heat_adv = [a for a in advisories if a["level"] == "Warning" and "heat" in a["id"]][0]
    assert "heat wave" in heat_adv["title"].lower()
    assert "irrigate" in heat_adv["title"].lower() or "irrigation" in heat_adv["category"].lower()
    assert "लू" in heat_adv["title_hi"]

def test_advisory_rule_engine_strong_wind():
    advisories = generate_agricultural_advisories(
        current_temp=30.0,
        max_temp=32.0,
        min_temp=24.0,
        precipitation_sum=0.0,
        max_rain_prob=10,
        max_wind=36.0,  # >= 30 km/h
        humidity=50
    )
    wind_adv = [a for a in advisories if a["level"] == "Warning" and "wind" in a["id"]][0]
    assert "wind" in wind_adv["title"].lower()
    assert "हवा" in wind_adv["title_hi"]

def test_advisory_rule_engine_favorable_weather():
    advisories = generate_agricultural_advisories(
        current_temp=27.0,
        max_temp=30.0,
        min_temp=20.0,
        precipitation_sum=0.0,
        max_rain_prob=10,
        max_wind=12.0,
        humidity=55
    )
    assert len(advisories) == 1
    assert advisories[0]["level"] == "Info"
    assert "favorable" in advisories[0]["title"].lower()
    assert "अनुकूल" in advisories[0]["title_hi"]
