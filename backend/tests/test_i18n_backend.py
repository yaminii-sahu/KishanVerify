import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.i18n import (
    normalize_locale,
    get_review_status,
    localize_claim_reason,
    localize_loan_reason,
    localize_msp_reason,
    localize_stage,
    localize_office_type,
    localize_weather_advisory,
    localize_error,
    SUPPORTED_LOCALES,
)

client = TestClient(app)

def test_supported_locales_count():
    assert len(SUPPORTED_LOCALES) == 11
    assert "en" in SUPPORTED_LOCALES
    assert "hi" in SUPPORTED_LOCALES
    assert "mr" in SUPPORTED_LOCALES
    assert "gu" in SUPPORTED_LOCALES
    assert "pa" in SUPPORTED_LOCALES
    assert "bn" in SUPPORTED_LOCALES
    assert "or" in SUPPORTED_LOCALES
    assert "ta" in SUPPORTED_LOCALES
    assert "te" in SUPPORTED_LOCALES
    assert "kn" in SUPPORTED_LOCALES
    assert "ml" in SUPPORTED_LOCALES

def test_normalize_locale():
    assert normalize_locale("en-US") == "en"
    assert normalize_locale("hi_IN") == "hi"
    assert normalize_locale("mr-IN") == "mr"
    assert normalize_locale("ta") == "ta"
    assert normalize_locale("FR-fr") == "en" # unsupported falls back to en
    assert normalize_locale(None) == "en"
    assert normalize_locale("") == "en"

def test_review_status():
    assert get_review_status("en") == "reviewed"
    assert get_review_status("hi") == "reviewed"
    assert get_review_status("mr") == "machine_draft"
    assert get_review_status("ta") == "machine_draft"

def test_claim_reason_localization():
    en_res = localize_claim_reason("LATE_INTIMATION", "en")
    assert "Delayed Calamity Intimation" in en_res["label"]
    assert en_res["review_status"] == "reviewed"

    hi_res = localize_claim_reason("LATE_INTIMATION", "hi")
    assert "आपदा सूचना में विलंब" in hi_res["label"]
    assert hi_res["review_status"] == "reviewed"

    mr_res = localize_claim_reason("LATE_INTIMATION", "mr")
    assert "विलंब" in mr_res["label"]
    assert mr_res["review_status"] == "machine_draft"

    ta_res = localize_claim_reason("LATE_INTIMATION", "ta")
    assert "தாமதம்" in ta_res["label"]
    assert ta_res["review_status"] == "machine_draft"

def test_loan_and_msp_reason_localization():
    # Loan
    assert "समीक्षा" in localize_loan_reason("LOAN_DISCREPANCY_UNDER_REVIEW", "hi")
    assert "पुनरावलोकन" in localize_loan_reason("LOAN_DISCREPANCY_UNDER_REVIEW", "mr")
    assert "review" in localize_loan_reason("LOAN_DISCREPANCY_UNDER_REVIEW", "en").lower()

    # MSP
    assert "आधिकारिक" in localize_msp_reason("MSP_PAYMENT_MATCH", "hi")
    assert "हमीभाव" in localize_msp_reason("MSP_PAYMENT_MATCH", "mr")
    assert "official" in localize_msp_reason("MSP_PAYMENT_MATCH", "en").lower()

def test_stage_and_office_localization():
    assert localize_stage("disbursed", "hi") == "ऋण राशि वितरित"
    assert localize_stage("disbursed", "mr") == "कर्ज रक्कम वितरित"

    assert "कृषि विज्ञान केंद्र" in localize_office_type("kvk", "hi")
    assert "மண் பரிசோதனை" in localize_office_type("soil_lab", "ta")

def test_weather_advisory_localization():
    adv_hi = localize_weather_advisory("adv-rain-heavy", "hi")
    assert "भारी वर्षा" in adv_hi["title"]
    assert "नालियां" in adv_hi["action"]

    adv_mr = localize_weather_advisory("adv-rain-heavy", "mr")
    assert "मुसळधार" in adv_mr["title"]

def test_api_claims_reasons_endpoint():
    res = client.get("/api/v1/claims/reasons?lang=hi")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 7
    late = next((d for d in data if d["code"] == "LATE_INTIMATION"), None)
    assert late is not None
    assert "विलंब" in late["label"]

def test_api_claims_timeline_localized():
    res = client.get("/api/v1/claims/1/timeline?lang=hi")
    assert res.status_code == 200
    data = res.json()
    assert data["locale"] == "hi"
    assert data["current_stage_localized"] is not None

def test_api_msp_reasons_endpoint():
    res = client.get("/api/v1/msp/reasons?lang=mr")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    first_item = data[0]
    assert "code" in first_item
    assert "text" in first_item

def test_api_loans_reasons_endpoint():
    res = client.get("/api/v1/loans/reasons?lang=ta")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 3

def test_api_accept_language_header():
    # Test that Accept-Language header works without ?lang= query param
    headers = {"Accept-Language": "mr-IN,mr;q=0.9,en;q=0.8"}
    res = client.get("/api/v1/claims/reasons", headers=headers)
    assert res.status_code == 200
    data = res.json()
    late = next((d for d in data if d["code"] == "LATE_INTIMATION"), None)
    assert late is not None
    assert "विलंब" in late["label"]
    assert late["review_status"] == "machine_draft"
