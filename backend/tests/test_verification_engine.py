"""
Unit Tests for KisanVerify Deterministic Verification Engine
"""
import pytest
from app.services.verification_engine import (
    verify_loan,
    verify_msp,
    verify_insurance,
)

class TestLoanVerification:
    def test_blueprint_standard_loan_discrepancy(self):
        """Blueprint case: Approved 80,000, Disbursed 70,000, Difference 10,000."""
        result = verify_loan(
            approved_amount=80000.0,
            disbursed_amount=70000.0,
            deductions=0.0,
            bank_name="State Bank of India"
        )
        assert result.difference == 10000.0
        assert result.status == "Needs Review"
        assert result.is_flagged is True
        assert "₹10,000.00" in result.explanation
        assert "State Bank of India" in result.explanation
        assert len(result.arithmetic_breakdown) >= 3

    def test_loan_with_itemized_deductions(self):
        """Loan with deductions (processing fees + insurance)."""
        result = verify_loan(
            approved_amount=80000.0,
            disbursed_amount=70000.0,
            deductions=5000.0,
            bank_name="SBI"
        )
        assert result.difference == 10000.0
        assert result.deductions == 5000.0
        assert result.unaccounted_difference == 5000.0
        assert result.status == "Needs Review"
        assert result.is_flagged is True

    def test_loan_exact_match_verified(self):
        """Zero difference case: Approved 80,000, Disbursed 80,000."""
        result = verify_loan(
            approved_amount=80000.0,
            disbursed_amount=80000.0,
            deductions=0.0
        )
        assert result.difference == 0.0
        assert result.status == "Verified"
        assert result.is_flagged is False
        assert "matches" in result.explanation.lower()

    def test_loan_negative_difference_excess(self):
        """Disbursed amount exceeds approved amount (subvention/topup)."""
        result = verify_loan(
            approved_amount=50000.0,
            disbursed_amount=52000.0
        )
        assert result.difference == -2000.0
        assert result.status == "Needs Review"
        assert result.is_flagged is True
        assert "exceeds" in result.explanation.lower()

    def test_loan_float_precision(self):
        """Precision test with cents/paisa."""
        result = verify_loan(
            approved_amount=125430.75,
            disbursed_amount=115200.25,
            deductions=1230.50
        )
        assert result.difference == 10230.50
        assert result.unaccounted_difference == 9000.0


class TestMSPVerification:
    def test_blueprint_standard_msp_discrepancy(self):
        """Blueprint case: 50 qtl * 2,300 = 115,000 expected, 105,000 actual, diff 10,000."""
        result = verify_msp(
            crop="Paddy",
            quantity_quintals=50.0,
            msp_rate=2300.0,
            actual_payment=105000.0
        )
        assert result.expected_payment == 115000.0
        assert result.actual_payment == 105000.0
        assert result.difference == 10000.0
        assert result.status == "Needs Review"
        assert result.is_flagged is True
        assert "₹10,000.00" in result.explanation

    def test_msp_exact_match_verified(self):
        """Full MSP payment received."""
        result = verify_msp(
            crop="Wheat",
            quantity_quintals=40.0,
            msp_rate=2275.0,
            actual_payment=91000.0
        )
        assert result.expected_payment == 91000.0
        assert result.difference == 0.0
        assert result.status == "Verified"
        assert result.is_flagged is False

    def test_msp_state_bonus_exceeds(self):
        """Actual exceeds expected (State incentive bonus)."""
        result = verify_msp(
            crop="Paddy",
            quantity_quintals=50.0,
            msp_rate=2300.0,
            actual_payment=120000.0 # Includes ₹5,000 bonus
        )
        assert result.expected_payment == 115000.0
        assert result.difference == -5000.0
        assert result.status == "Verified"
        assert result.is_flagged is False
        assert "bonus" in result.explanation.lower()


class TestInsuranceVerification:
    def test_insurance_claim_under_review(self):
        """Partial disbursement with Under Review status."""
        result = verify_insurance(
            crop="Paddy",
            claim_amount_expected=30000.0,
            amount_received=20000.0,
            claim_status="Under Review"
        )
        assert result.difference == 10000.0
        assert result.status == "Under Review"
        assert result.is_flagged is False
        assert "under review" in result.explanation.lower()

    def test_insurance_claim_discrepancy(self):
        """Discrepancy with settled/final status."""
        result = verify_insurance(
            crop="Wheat",
            claim_amount_expected=30000.0,
            amount_received=20000.0,
            claim_status="Settled"
        )
        assert result.difference == 10000.0
        assert result.status == "Needs Review"
        assert result.is_flagged is True

    def test_insurance_full_settlement(self):
        """Full insurance claim settled."""
        result = verify_insurance(
            crop="Soybean",
            claim_amount_expected=25000.0,
            amount_received=25000.0,
            claim_status="Settled"
        )
        assert result.difference == 0.0
        assert result.status == "Verified"


class TestLanguageSafetyAndNeutrality:
    def test_no_accusatory_wording_in_outputs(self):
        """Ensure wording never accuses fraud or misconduct."""
        loan_out = verify_loan(80000, 70000)
        msp_out = verify_msp("Paddy", 50, 2300, 105000)
        ins_out = verify_insurance("Paddy", 30000, 20000, "Settled")

        forbidden_words = ["fraud", "scam", "thief", "crime", "illegal", "corrupt", "cheat", "guilty"]

        for output in [loan_out, msp_out, ins_out]:
            text_en = (output.explanation + " " + " ".join(output.reasons) + " " + output.status_label).lower()
            for word in forbidden_words:
                assert word not in text_en, f"Forbidden word '{word}' found in output!"
            assert "review" in text_en or "difference" in text_en
