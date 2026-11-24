import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal
from app.models.models import Farmer, Loan, MSPRecord, InsuranceRecord
from app.api.farmers import compute_farmer_attention

client = TestClient(app)

def test_ramesh_kumar_seed_attention_count():
    """
    Ramesh Kumar (FV12345) has:
    - 1 Loan with 'Needs Review' (₹10,000 diff)
    - 1 Loan with 'Not Verified' (missing sanction doc)
    - 1 MSP with 'Needs Review' (₹10,000 diff)
    Total count is 3.
    """
    response = client.get("/api/v1/farmers/me/attention?farmer_id=FV12345")
    assert response.status_code == 200
    data = response.json()

    assert data["farmer_id"] == "FV12345"
    assert data["count"] == 3
    assert data["has_discrepancies"] is True

    record_types = [item["record_type"] for item in data["items"]]
    assert "Loan" in record_types
    assert "MSP" in record_types

def test_attention_counting_zero_records():
    """
    Test farmer with all verified records yields count = 0 and has_discrepancies = False.
    """
    db = SessionLocal()
    try:
        test_farmer = Farmer(
            farmer_id="TEST_ZERO",
            name="Verified Farmer",
            phone="9999999999",
            village="Test",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=2.0,
            crop="Paddy",
            category="Small Farmer",
            bank_name="SBI",
            account_number_masked="SBIN****9999"
        )
        db.add(test_farmer)
        db.flush()

        v_loan = Loan(
            loan_ref="LN-TEST-00",
            farmer_id=test_farmer.id,
            bank_name="SBI",
            loan_type="Crop Loan",
            approved_amount=50000.0,
            disbursed_amount=50000.0,
            difference=0.0,
            status="Verified",
            loan_date="2024-03-12"
        )
        db.add(v_loan)
        db.commit()

        result = compute_farmer_attention(test_farmer, db)
        assert result.count == 0
        assert result.has_discrepancies is False
        assert len(result.items) == 0

    finally:
        db.rollback()
        db.query(Loan).filter_by(loan_ref="LN-TEST-00").delete()
        db.query(Farmer).filter_by(farmer_id="TEST_ZERO").delete()
        db.commit()
        db.close()

def test_attention_counting_single_record():
    """
    Test farmer with exactly 1 flagged record yields count = 1.
    """
    db = SessionLocal()
    try:
        test_farmer = Farmer(
            farmer_id="TEST_ONE",
            name="Single Discrepancy Farmer",
            phone="9999999998",
            village="Test",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=2.0,
            crop="Paddy",
            category="Small Farmer",
            bank_name="SBI",
            account_number_masked="SBIN****9998"
        )
        db.add(test_farmer)
        db.flush()

        f_loan = Loan(
            loan_ref="LN-TEST-01",
            farmer_id=test_farmer.id,
            bank_name="SBI",
            loan_type="Crop Loan",
            approved_amount=60000.0,
            disbursed_amount=50000.0,
            difference=10000.0,
            status="Needs Review",
            loan_date="2024-03-12"
        )
        v_msp = MSPRecord(
            record_ref="MSP-TEST-01",
            farmer_id=test_farmer.id,
            crop="Paddy",
            quantity_quintals=10.0,
            msp_rate=2300.0,
            expected_payment=23000.0,
            actual_payment=23000.0,
            difference=0.0,
            status="Verified",
            payment_date="2024-04-05"
        )
        db.add_all([f_loan, v_msp])
        db.commit()

        result = compute_farmer_attention(test_farmer, db)
        assert result.count == 1
        assert result.has_discrepancies is True
        assert result.items[0].record_type == "Loan"

    finally:
        db.rollback()
        db.query(Loan).filter_by(loan_ref="LN-TEST-01").delete()
        db.query(MSPRecord).filter_by(record_ref="MSP-TEST-01").delete()
        db.query(Farmer).filter_by(farmer_id="TEST_ONE").delete()
        db.commit()
        db.close()

def test_attention_counting_multiple_records_including_insurance():
    """
    Test farmer with 3 flagged records (Loan + MSP + Insurance) yields count = 3.
    """
    db = SessionLocal()
    try:
        test_farmer = Farmer(
            farmer_id="TEST_MULTI",
            name="Multi Discrepancy Farmer",
            phone="9999999997",
            village="Test",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=3.0,
            crop="Paddy",
            category="Small Farmer",
            bank_name="SBI",
            account_number_masked="SBIN****9997"
        )
        db.add(test_farmer)
        db.flush()

        f_loan = Loan(
            loan_ref="LN-TEST-M",
            farmer_id=test_farmer.id,
            bank_name="SBI",
            loan_type="Crop Loan",
            approved_amount=80000.0,
            disbursed_amount=70000.0,
            difference=10000.0,
            status="Needs Review",
            loan_date="2024-03-12"
        )
        f_msp = MSPRecord(
            record_ref="MSP-TEST-M",
            farmer_id=test_farmer.id,
            crop="Paddy",
            quantity_quintals=20.0,
            msp_rate=2300.0,
            expected_payment=46000.0,
            actual_payment=40000.0,
            difference=6000.0,
            status="Possible Discrepancy",
            payment_date="2024-04-05"
        )
        f_ins = InsuranceRecord(
            insurance_ref="INS-TEST-M",
            farmer_id=test_farmer.id,
            crop="Paddy",
            season="Kharif 2024",
            premium_paid=1000.0,
            claim_amount_expected=25000.0,
            amount_received=15000.0,
            difference=10000.0,
            claim_status="Needs Review",
            filing_date="2024-03-28"
        )
        db.add_all([f_loan, f_msp, f_ins])
        db.commit()

        result = compute_farmer_attention(test_farmer, db)
        assert result.count == 3
        assert result.has_discrepancies is True
        types = {i.record_type for i in result.items}
        assert types == {"Loan", "MSP", "Insurance"}

        # Verify links point to verification pages with recordId query param
        for item in result.items:
            if item.record_type == "Loan":
                assert "/farmer/loan-verify?recordId=" in item.link
                assert item.record_ref in item.link
            elif item.record_type == "MSP":
                assert "/farmer/msp-verify?recordId=" in item.link
                assert item.record_ref in item.link
            elif item.record_type == "Insurance":
                assert "/farmer/insurance-verify?recordId=" in item.link
                assert item.record_ref in item.link

    finally:
        db.rollback()
        db.query(Loan).filter_by(loan_ref="LN-TEST-M").delete()
        db.query(MSPRecord).filter_by(record_ref="MSP-TEST-M").delete()
        db.query(InsuranceRecord).filter_by(insurance_ref="INS-TEST-M").delete()
        db.query(Farmer).filter_by(farmer_id="TEST_MULTI").delete()
        db.commit()
        db.close()


def test_verify_record_by_ref_endpoint():
    """
    Test GET /api/v1/verify/record/{record_ref} returns pre-fill data and verification.
    """
    # Loan record
    res_loan = client.get("/api/v1/verify/record/LN-2024-8812")
    assert res_loan.status_code == 200
    data_loan = res_loan.json()
    assert data_loan["record_type"] == "loan"
    assert data_loan["record_ref"] == "LN-2024-8812"
    assert data_loan["data"]["approved_amount"] > 0
    assert data_loan["data"]["disbursed_amount"] > 0
    assert data_loan["verification"]["is_flagged"] is True

    # MSP record
    res_msp = client.get("/api/v1/verify/record/MSP-2024-4411")
    assert res_msp.status_code == 200
    data_msp = res_msp.json()
    assert data_msp["record_type"] == "msp"
    assert data_msp["record_ref"] == "MSP-2024-4411"
    assert data_msp["data"]["quantity"] == 50.0
    assert data_msp["data"]["msp_rate"] == 2300.0
    assert data_msp["verification"]["is_flagged"] is True

