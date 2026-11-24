import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.loan_eligibility import evaluate_loan_eligibility
from app.models.models import LoanProduct, Document

client = TestClient(app)

class DummyProduct:
    def __init__(self, **kwargs):
        self.product_code = kwargs.get("product_code", "TEST-PROD")
        self.name = kwargs.get("name", "Test Product")
        self.name_hi = kwargs.get("name_hi", "टेस्ट उत्पाद")
        self.level = kwargs.get("level", "Central")
        self.state = kwargs.get("state", None)
        self.max_amount_rule = kwargs.get("max_amount_rule", "Up to ₹3,00,000")
        self.interest_rate_rule = kwargs.get("interest_rate_rule", "4% effective")
        self.required_documents = kwargs.get("required_documents", ["Aadhaar Card", "Bank Passbook"])
        self.eligibility_rules = kwargs.get("eligibility_rules", {"min_land_acres": 1.0})
        self.official_url = kwargs.get("official_url", "https://agricoop.nic.in")
        self.source_name = kwargs.get("source_name", "Ministry of Agriculture")
        self.source_document = kwargs.get("source_document", "Circular 12")
        self.last_verified_on = kwargs.get("last_verified_on", "2025-04-10")
        self.status = kwargs.get("status", "verified")

class DummyDoc:
    def __init__(self, name, category, uuid="doc-123"):
        self.original_name = name
        self.category = category
        self.doc_uuid = uuid

def test_evaluate_loan_eligibility_likely():
    prod = DummyProduct(
        required_documents=["Aadhaar Card", "Bank Passbook"],
        eligibility_rules={"min_land_acres": 1.0, "farmer_categories": ["Small Farmer"]}
    )
    farmer = {
        "state": "Chhattisgarh",
        "land_area_acres": 3.0,
        "category": "Small Farmer",
        "crop": "Paddy"
    }
    docs = [
        DummyDoc("Aadhaar_Card_Ramesh.pdf", "Identity"),
        DummyDoc("SBI_Passbook.png", "Bank")
    ]
    res = evaluate_loan_eligibility(prod, farmer, [], docs)
    assert res.eligibility_status == "Likely eligible"
    assert "guaranteed" not in res.disclaimer_en.lower()
    assert "approved" not in res.disclaimer_en.lower()
    assert len(res.missing_documents) == 0

def test_evaluate_loan_eligibility_missing_docs():
    prod = DummyProduct(
        required_documents=["Aadhaar Card", "Bank Passbook", "Dealer Proforma Invoice / Quotation"],
        eligibility_rules={"min_land_acres": 1.0}
    )
    farmer = {
        "state": "Chhattisgarh",
        "land_area_acres": 3.0,
        "category": "Small Farmer",
        "crop": "Paddy"
    }
    docs = [
        DummyDoc("Aadhaar_Card_Ramesh.pdf", "Identity"),
    ]
    res = evaluate_loan_eligibility(prod, farmer, [], docs)
    assert res.eligibility_status == "Possibly eligible (more info needed)"
    assert len(res.missing_documents) > 0

def test_evaluate_loan_eligibility_not_eligible_land():
    prod = DummyProduct(
        required_documents=["Aadhaar Card"],
        eligibility_rules={"min_land_acres": 5.0}
    )
    farmer = {
        "state": "Chhattisgarh",
        "land_area_acres": 2.0,
        "category": "Small Farmer",
        "crop": "Paddy"
    }
    docs = [DummyDoc("Aadhaar_Card.pdf", "Identity")]
    res = evaluate_loan_eligibility(prod, farmer, [], docs)
    assert res.eligibility_status == "Not eligible"
    assert any("Requires minimum 5.0 acres" in r for r in res.unmet_rules)

def test_evaluate_loan_eligibility_state_mismatch():
    prod = DummyProduct(
        level="State",
        state="Punjab",
        required_documents=["Aadhaar Card"],
        eligibility_rules={}
    )
    farmer = {
        "state": "Chhattisgarh",
        "land_area_acres": 3.0,
        "category": "Small Farmer",
        "crop": "Paddy"
    }
    res = evaluate_loan_eligibility(prod, farmer, [], [])
    assert res.eligibility_status == "Not eligible"
    assert any("Punjab" in r for r in res.unmet_rules)

def test_api_get_loan_products():
    res = client.get("/api/v1/loans/products?farmer_id=FV12345")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] >= 8
    assert "likely_eligible_count" in data
    assert "products" in data
    first = data["products"][0]
    assert "source_name" in first
    assert "source_document" in first
    assert "eligibility" in first
    assert first["eligibility"]["disclaimer_en"] is not None

def test_api_get_my_loans():
    res = client.get("/api/v1/loans/me?farmer_id=FV12345")
    assert res.status_code == 200
    data = res.json()
    assert data["total_count"] >= 3
    assert data["verified_count"] >= 1
    assert data["needs_review_count"] >= 1
    assert data["not_verified_count"] >= 1
    
    statuses = [l["verification_status"] for l in data["loans"]]
    assert "Verified" in statuses
    assert "Needs Review" in statuses
    assert "Not Verified" in statuses

    # Check reason codes for unverified loan
    unverified_loan = next(l for l in data["loans"] if l["verification_status"] == "Not Verified")
    assert "MISSING_SANCTION_DOC" in unverified_loan["reason_codes"]
    assert len(unverified_loan["reasons"]) > 0

def test_api_verify_loan_endpoint():
    res = client.post("/api/v1/loans/LN-2024-8812/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["loan_ref"] == "LN-2024-8812"
    assert data["verification_status"] == "Needs Review"
    assert "DISBURSEMENT_MISMATCH" in data["reason_codes"]
    assert len(data["basis_of_check"]) > 0
