import pytest
from app.services.pdf_generator import generate_insurance_report_pdf, generate_verification_pdf
from fastapi.testclient import TestClient
from app.main import app

def test_generate_insurance_report_pdf_bytes():
    pdf_bytes = generate_insurance_report_pdf(
        report_ref="REP-INS-2024-7711",
        farmer_name="Ramesh Kumar",
        farmer_id="FV12345",
        village="Patan",
        district="Durg",
        state="Chhattisgarh",
        crop="Paddy (Kharif)",
        season="Kharif 2024",
        sum_insured=80000.0,
        insured_area_hectares=2.0,
        assessed_loss_percentage=37.5,
        expected_claim=30000.0,
        actual_payment=20000.0,
        difference=10000.0,
        status="Under Review",
        insurance_ref="INS-2024-7711",
        reasons=["Secondary tranche pending state government matching subsidy"],
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

def test_generate_verification_pdf_insurance_dispatch():
    pdf_bytes = generate_verification_pdf(
        report_type="PMFBY Crop Insurance Claim Verification Audit",
        report_ref="REP-INS-2024-7711",
        farmer_name="Ramesh Kumar",
        farmer_id="FV12345",
        village="Patan",
        district="Durg",
        state="Chhattisgarh",
        bank_name="State Bank of India",
        account_masked="SBIN*******1234",
        status="Under Review",
        approved_or_expected=30000.0,
        disbursed_or_actual=20000.0,
        difference=10000.0,
        reasons=["Secondary tranche release pending state subsidy reconciliation"],
        extra_details={
            "crop": "Paddy (Kharif)",
            "season": "Kharif 2024",
            "sum_insured": 80000.0,
            "insured_area_hectares": 2.0,
            "assessed_loss_percentage": 37.5,
            "insurance_ref": "INS-2024-7711",
        }
    )

    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")

def test_download_report_pdf_endpoint():
    with TestClient(app) as client:
        res = client.get("/api/v1/reports/download/REP-INS-2024-7711")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert res.content.startswith(b"%PDF")
