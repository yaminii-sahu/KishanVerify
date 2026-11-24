import pytest
from app.core.database import SessionLocal, Base, engine
from app.core.seed import seed_database
from app.models.models import Farmer, Loan, MSPRecord, InsuranceRecord, CallbackRequest, Grievance, ToolAuditLog
from app.voice.tools import (
    get_records_summary,
    get_loan_status,
    get_msp_status,
    get_claim_status,
    get_eligible_schemes,
    get_eligible_loans,
    get_required_documents,
    list_my_documents,
    get_mandi_prices,
    get_weather_alerts,
    find_nearby_offices,
    get_grievance_status,
    raise_grievance,
    request_callback,
    mask_ref,
)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception:
        pass
    db = SessionLocal()
    # Ensure demo farmer exists
    farmer = db.query(Farmer).filter_by(farmer_id="FV12345").first()
    if not farmer:
        farmer = Farmer(
            farmer_id="FV12345",
            name="Ramesh Kumar",
            name_hi="रमेश कुमार",
            phone="+91 98765 43210",
            village="Patan",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=3.0,
            crop="Paddy",
            category="Small Farmer",
            bank_name="State Bank of India",
            account_number_masked="SBIN*******1234",
            kcc_active=True,
        )
        db.add(farmer)
        db.commit()

    # Ensure secondary farmer exists for cross-access test
    foreign_farmer = db.query(Farmer).filter_by(farmer_id="FV99999").first()
    if not foreign_farmer:
        foreign_farmer = Farmer(
            farmer_id="FV99999",
            name="Suresh Singh",
            name_hi="सुरेश सिंह",
            phone="+91 91111 22222",
            village="Kumhari",
            district="Durg",
            state="Chhattisgarh",
            land_area_acres=5.0,
            crop="Wheat",
            category="Small Farmer",
            bank_name="Bank of Baroda",
            account_number_masked="BARB*******9999",
            kcc_active=True,
        )
        db.add(foreign_farmer)
        db.commit()

        foreign_loan = Loan(
            loan_ref="LN-2024-9999",
            farmer_id=foreign_farmer.id,
            bank_name="Bank of Baroda",
            approved_amount=150000.0,
            disbursed_amount=140000.0,
            difference=10000.0,
            status="Needs Review",
            loan_date="2024-04-01",
        )
        db.add(foreign_loan)
        db.commit()

    db.close()
    yield


def test_mask_ref_function():
    assert mask_ref("LN-2024-8812") == "LN-****8812"
    assert mask_ref("MSP-2024-4411") == "MSP-****4411"
    assert mask_ref("INS-2024-7711") == "INS-****7711"


def test_get_records_summary():
    data = get_records_summary("FV12345")
    assert data["farmer_id"] == "FV12345"
    assert data["attention_count"] >= 1
    assert data["total_flagged_difference"] > 0
    assert "sources" in data
    assert data["data_origin"] == "official"


def test_get_loan_status_demo_farmer():
    data = get_loan_status("FV12345")
    assert "error" not in data
    assert data["approved_amount"] > 0
    assert data["disbursed_amount"] > 0
    assert data["difference"] == 10000.0
    assert "LN-****" in data["loan_ref_masked"]
    assert "State Bank" in data["bank_name"] or "SBI" in data["bank_name"]
    assert len(data["reason_codes"]) >= 1


def test_cross_farmer_loan_access_blocked():
    """Verify farmer FV12345 cannot read loan LN-2024-9999 belonging to FV99999."""
    with pytest.raises(PermissionError) as exc_info:
        get_loan_status("FV12345", loan_id="LN-2024-9999")
    assert "Unauthorized" in str(exc_info.value)


def test_get_msp_status():
    data = get_msp_status("FV12345")
    assert "error" not in data
    assert data["crop"] == "Paddy" or "Paddy" in data["crop"]
    assert data["quantity_quintals"] == 50.0
    assert data["msp_rate"] == 2300.0
    assert data["expected_payment"] == 115000.0
    assert data["actual_payment"] == 105000.0
    assert data["difference"] == 10000.0
    assert data["unexplained_difference"] == 3475.0
    assert len(data["itemized_adjustments"]) == 4


def test_get_claim_status():
    data = get_claim_status("FV12345")
    assert "error" not in data
    assert "Paddy" in data["crop"]
    assert data["expected_claim_amount"] == 30000.0
    assert data["amount_received"] == 20000.0
    assert data["pending_balance"] == 10000.0
    assert data["status"] == "Under Review"
    assert data["is_delayed"] is True
    assert "INS-****" in data["claim_ref_masked"]


def test_get_eligible_schemes_and_loans():
    schemes_data = get_eligible_schemes("FV12345")
    assert schemes_data["eligible_count"] >= 1
    assert any("PM-KISAN" in s["scheme_code"] or "PM-KISAN" in s["title"] for s in schemes_data["schemes"])

    loans_data = get_eligible_loans("FV12345")
    assert len(loans_data["products"]) >= 2
    assert any("KCC" in p["product_code"] for p in loans_data["products"])


def test_get_required_documents_and_vault():
    req_docs = get_required_documents("FV12345", topic="loan")
    assert req_docs["farmer_id"] == "FV12345"
    assert len(req_docs["checklist"]) >= 3

    my_docs = list_my_documents("FV12345")
    assert my_docs["count"] >= 1
    for doc in my_docs["documents"]:
        # Verify privacy: no raw file paths or binary, only masked references
        assert "content" not in doc
        assert "masked_id" in doc


def test_mandi_weather_offices():
    mandi = get_mandi_prices("Paddy", "Patan")
    assert mandi["modal_price"] > 0
    assert mandi["official_msp_benchmark"] == 2300.0

    weather = get_weather_alerts()
    assert "temperature_celsius" in weather
    assert "advisory" in weather

    offices = find_nearby_offices()
    assert offices["count"] >= 1
    for o in offices["offices"]:
        assert "name" in o
        assert "address" in o


def test_write_action_raise_grievance_requires_confirmation():
    # Attempt 1: without confirmation -> must require confirmation
    unconfirmed = raise_grievance("FV12345", "LN-2024-8812", "Discrepancy in loan disbursement", confirmed=False)
    assert unconfirmed["status"] == "confirmation_required"
    assert unconfirmed["requires_confirmation"] is True
    assert "confirmation_prompt_en" in unconfirmed

    # Attempt 2: with confirmed=True -> persists grievance ticket
    confirmed = raise_grievance("FV12345", "LN-2024-8812", "Discrepancy in loan disbursement", confirmed=True)
    assert confirmed["status"] == "success"
    assert "GRV-" in confirmed["grievance_ref"]

    # Verify status via get_grievance_status
    grv_status = get_grievance_status("FV12345")
    assert grv_status["has_grievances"] is True


def test_write_action_request_callback_requires_confirmation():
    # Attempt 1: without confirmation -> must require confirmation
    unconfirmed = request_callback("FV12345", topic="MSP Payment Refraction", confirmed=False)
    assert unconfirmed["status"] == "confirmation_required"
    assert unconfirmed["requires_confirmation"] is True

    # Attempt 2: with confirmed=True -> persists callback request
    confirmed = request_callback("FV12345", topic="MSP Payment Refraction", confirmed=True)
    assert confirmed["status"] == "success"
    assert "CBK-" in confirmed["callback_ref"]
    assert "phone_masked" in confirmed


def test_tool_audit_logging():
    db = SessionLocal()
    recent_logs = db.query(ToolAuditLog).order_by(ToolAuditLog.id.desc()).limit(10).all()
    assert len(recent_logs) > 0
    tools_logged = [l.tool_name for l in recent_logs]
    assert "get_records_summary" in tools_logged or "get_loan_status" in tools_logged or "raise_grievance" in tools_logged
    db.close()
