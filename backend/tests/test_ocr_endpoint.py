import os
from fastapi.testclient import TestClient
from app.main import app
from app.services.verification_engine import verify_loan

client = TestClient(app)

def test_ocr_extract_sanction_letter_pdf():
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "sample_sanction_letter.pdf")
    assert os.path.exists(fixture_path), "Fixture sample_sanction_letter.pdf must exist"

    with open(fixture_path, "rb") as f:
        response = client.post(
            "/api/v1/ocr/extract-loan",
            files={"file": ("sample_sanction_letter.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    data = response.json()

    # Assert real extracted values from the PDF (not hardcoded default)
    assert data["bank_name"] == "State Bank of India"
    assert data["approved_amount"] == 80000.0
    assert data["disbursed_amount"] == 70000.0
    assert data["interest_rate"] == 7.0
    assert data["deductions"] == 1700.0
    assert data["loan_type"] == "Crop Loan (KCC)"
    assert data["confidence"] >= 0.8
    assert "SBIN" in data["loan_account_ref"]

    # Verify deterministic verification engine computes difference strictly
    verification = verify_loan(
        approved_amount=data["approved_amount"],
        disbursed_amount=data["disbursed_amount"],
        deductions=data["deductions"],
        interest_rate=data["interest_rate"],
        bank_name=data["bank_name"],
    )

    assert verification.difference == 10000.0
    assert verification.unaccounted_difference == 8300.0
    assert verification.status == "Needs Review"
    assert verification.is_flagged is True

def test_ocr_empty_document_returns_nulls():
    # Test uploading a file with no recognizable loan data
    dummy_bytes = b"Hello, this is a random note with no financial data."
    response = client.post(
        "/api/v1/ocr/extract-loan",
        files={"file": ("notes.txt", dummy_bytes, "text/plain")}
    )

    assert response.status_code == 200
    data = response.json()
    assert data["approved_amount"] is None
    assert data["disbursed_amount"] is None
    assert data["confidence"] == 0.0

def test_ocr_invalid_file_type_rejected():
    response = client.post(
        "/api/v1/ocr/extract-loan",
        files={"file": ("malicious.exe", b"MZ...", "application/octet-stream")}
    )
    assert response.status_code == 400
