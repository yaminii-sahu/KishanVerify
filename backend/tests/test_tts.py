import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.audio_script import (
    number_to_hindi_words,
    number_to_english_words,
    generate_loan_script,
    generate_msp_script,
)

client = TestClient(app)

def test_number_to_hindi_words():
    assert "दस हज़ार" in number_to_hindi_words(10000)
    assert "अस्सी हज़ार" in number_to_hindi_words(80000)
    assert "एक लाख पंद्रह हज़ार" in number_to_hindi_words(115000)
    assert "शून्य रुपये" == number_to_hindi_words(0)

def test_number_to_english_words():
    assert "ten thousand rupees" == number_to_english_words(10000)
    assert "eighty thousand rupees" == number_to_english_words(80000)
    assert "one lakh fifteen thousand rupees" == number_to_english_words(115000)

def test_generate_loan_script_non_accusatory():
    script_hi = generate_loan_script(
        approved_amount=80000.0,
        disbursed_amount=70000.0,
        deductions=5000.0,
        difference=10000.0,
        bank_name="State Bank of India",
        language="hi"
    )
    assert script_hi["is_flagged"] is True
    assert len(script_hi["sentences"]) >= 4
    # Calm phrasing check
    full_hi = script_hi["full_text"]
    assert "समीक्षा" in full_hi
    assert "घोटाला" not in full_hi
    assert "धोखाधड़ी" not in full_hi
    assert "1800-180-1551" in full_hi

    script_en = generate_loan_script(
        approved_amount=80000.0,
        disbursed_amount=70000.0,
        deductions=5000.0,
        difference=10000.0,
        bank_name="State Bank of India",
        language="en"
    )
    assert "may need administrative review" in script_en["full_text"]
    assert "fraud" not in script_en["full_text"].lower()
    assert "theft" not in script_en["full_text"].lower()

def test_generate_msp_script():
    script_hi = generate_msp_script(
        crop="धान",
        quantity_quintals=50.0,
        msp_rate=2300.0,
        expected_payment=115000.0,
        actual_payment=105000.0,
        difference=10000.0,
        language="hi"
    )
    assert script_hi["is_flagged"] is True
    assert "एक लाख पंद्रह हज़ार" in script_hi["full_text"]
    assert "नमी या गुणवत्ता छूट" in script_hi["full_text"]
    assert "1800-180-1551" in script_hi["full_text"]

def test_tts_script_endpoint():
    response = client.post("/api/v1/tts/script", json={
        "check_type": "loan",
        "language": "hi",
        "approved_amount": 80000.0,
        "disbursed_amount": 70000.0,
        "bank_name": "State Bank of India"
    })
    assert response.status_code == 200
    data = response.json()
    assert "active_script" in data
    assert "sentences" in data["active_script"]
    assert len(data["active_script"]["sentences"]) > 0
