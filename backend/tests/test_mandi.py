import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_mandi_prices_list():
    res = client.get("/api/v1/mandi/prices")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "data_mode" in data
    assert "records" in data
    assert len(data["records"]) >= 8
    # Check fields of records
    first = data["records"][0]
    assert "commodity" in first
    assert "market" in first
    assert "min_price" in first
    assert "max_price" in first
    assert "modal_price" in first
    assert "arrival_date" in first

def test_mandi_prices_filtering():
    res = client.get("/api/v1/mandi/prices?commodity=Paddy")
    assert res.status_code == 200
    records = res.json()["records"]
    assert len(records) >= 2
    for r in records:
        assert "paddy" in r["commodity"].lower()

def test_mandi_prices_sorting():
    res_desc = client.get("/api/v1/mandi/prices?sort_by=modal_price&sort_order=desc")
    assert res_desc.status_code == 200
    prices_desc = [r["modal_price"] for r in res_desc.json()["records"]]
    assert prices_desc == sorted(prices_desc, reverse=True)

    res_asc = client.get("/api/v1/mandi/prices?sort_by=modal_price&sort_order=asc")
    assert res_asc.status_code == 200
    prices_asc = [r["modal_price"] for r in res_asc.json()["records"]]
    assert prices_asc == sorted(prices_asc, reverse=False)

def test_mandi_msp_comparison():
    res = client.get("/api/v1/mandi/prices?commodity=Paddy")
    assert res.status_code == 200
    records = res.json()["records"]
    for r in records:
        assert r["msp"] is not None
        assert r["msp"] in [2300.0, 2320.0]
        assert r["msp_comparison"] in ["Above MSP", "Below MSP", "At MSP"]
        assert r["msp_difference"] == round(r["modal_price"] - r["msp"], 2)

def test_mandi_trends():
    res = client.get("/api/v1/mandi/trends?commodity=Paddy&market=Patan&days=14")
    assert res.status_code == 200
    data = res.json()
    assert data["commodity"] == "Paddy"
    assert data["days"] == 14
    assert len(data["trend"]) == 14
    first_pt = data["trend"][0]
    assert "date" in first_pt
    assert "modal_price" in first_pt
    assert "msp_benchmark" in first_pt

def test_mandi_offline_fallback():
    # If no key, it falls back to demo data and is clearly marked as demo data
    res = client.get("/api/v1/mandi/prices")
    assert res.status_code == 200
    data = res.json()
    if data["is_demo_data"]:
        assert "Demo data" in data["data_mode"]
