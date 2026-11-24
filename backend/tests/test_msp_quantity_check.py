import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.verification_engine import cross_check_msp_quantities

client = TestClient(app)

def test_cross_check_msp_quantities_with_discrepancy():
    # Farmer believed 50 qtl delivered, weighbridge slip 50 qtl, but portal recorded 48 qtl
    res = cross_check_msp_quantities(
        farmer_qty=50.0,
        msp_rate=2300.0,
        weight_slip_qty=50.0,
        portal_qty=48.0,
        weight_slip_ref="REC-PTN-****441",
        portal_ref="CG-KRY-****891",
    )
    assert res.has_discrepancy is True
    assert res.max_difference_qtl == 2.0
    assert res.max_difference_kg == 200.0
    # Money impact = 2.0 * 2300 = 4600.0
    assert res.monetary_impact == 4600.0
    assert "₹4,600.00" in res.explanation_en
    assert "₹4,600.00" in res.explanation_hi
    assert "may need review" in res.explanation_en
    assert len(res.sources) == 3

def test_cross_check_msp_quantities_kg_conversion():
    # 5,000 kg input should convert to 50.0 quintals
    res = cross_check_msp_quantities(
        farmer_qty=5000.0,
        msp_rate=2300.0,
        weight_slip_qty=5000.0,
        portal_qty=5000.0,
        unit_input="kg",
    )
    assert res.farmer_quantity_qtl == 50.0
    assert res.farmer_quantity_kg == 5000.0
    assert res.has_discrepancy is False
    assert res.monetary_impact == 0.0

def test_quantity_check_api_endpoint():
    response = client.post(
        "/api/v1/msp/quantity-check",
        json={
            "farmer_quantity": 50.0,
            "msp_rate": 2300.0,
            "weight_slip_quantity": 50.0,
            "portal_quantity": 48.0,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["has_discrepancy"] is True
    assert data["max_difference_qtl"] == 2.0
    assert data["monetary_impact"] == 4600.0
