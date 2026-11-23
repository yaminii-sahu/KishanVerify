import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.pdf_generator import (
    generate_loan_report_pdf,
    generate_msp_report_pdf,
    generate_verification_pdf,
)

client = TestClient(app)

def test_generate_loan_report_pdf():
    pdf_bytes = generate_loan_report_pdf(
        report_ref="REP-TEST-LN-01",
        farmer_name="रमेश कुमार (Ramesh Kumar)",
        farmer_id="FV12345",
        village="पाटन (Patan)",
        district="दुर्ग (Durg)",
        state="छत्तीसगढ़ (Chhattisgarh)",
        bank_name="State Bank of India",
        account_masked="SBIN*******1234",
        approved_amount=80000.0,
        disbursed_amount=70000.0,
        deductions=5000.0,
        difference=10000.0,
        unaccounted=5000.0,
        status="Needs Review",
        reasons=[
            "Deductions for processing fees and documentation charges",
            "Crop insurance premium auto-deduction (PMFBY)"
        ],
    )
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000

def test_generate_msp_report_pdf():
    pdf_bytes = generate_msp_report_pdf(
        report_ref="REP-TEST-MSP-02",
        farmer_name="रमेश कुमार (Ramesh Kumar)",
        farmer_id="FV12345",
        village="Patan",
        district="Durg",
        state="Chhattisgarh",
        crop="धान (Paddy Common)",
        quantity_quintals=50.0,
        msp_rate=2300.0,
        expected_payment=115000.0,
        actual_payment=105000.0,
        difference=10000.0,
        status="Needs Review",
        procurement_center="पाटन कृषि उपज मंडी",
        season="Kharif 2024-25"
    )
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000

def test_generate_msp_zero_difference_verified():
    pdf_bytes = generate_msp_report_pdf(
        report_ref="REP-TEST-MSP-MATCH",
        farmer_name="Sunita Bai",
        farmer_id="FV99887",
        village="Kurud",
        district="Dhamtari",
        state="Chhattisgarh",
        crop="Paddy",
        quantity_quintals=40.0,
        msp_rate=2300.0,
        expected_payment=92000.0,
        actual_payment=92000.0,
        difference=0.0,
        status="Verified",
    )
    assert pdf_bytes.startswith(b"%PDF-")
    assert len(pdf_bytes) > 1000

def test_get_report_detail_loan():
    response = client.get("/api/v1/reports/detail/REP-LN-2025-01")
    assert response.status_code == 200
    data = response.json()
    assert data["report_ref"] == "REP-LN-2025-01"
    assert "figures" in data
    assert "arithmetic_breakdown" in data
    assert "sources" in data
    assert "next_steps" in data
    assert "helpline" in data
    assert data["helpline"]["phone"] == "1800-180-1551"
    assert "grievance_prefill" in data

def test_get_report_detail_msp():
    response = client.get("/api/v1/reports/detail/REP-MSP-2025-02")
    assert response.status_code == 200
    data = response.json()
    assert data["report_ref"] == "REP-MSP-2025-02"
    assert data["report_type"] == "MSP Payment"
    assert "crop" in data["figures"]
    assert "sources" in data
    assert len(data["sources"]) > 0

def test_download_report_pdf_endpoint():
    response = client.get("/api/v1/reports/download/REP-MSP-2025-02")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
