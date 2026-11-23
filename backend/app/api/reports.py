from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.database import get_db
from app.models.models import Farmer, Report, Loan, MSPRecord, InsuranceRecord
from app.services.pdf_generator import generate_verification_pdf
from app.services.verification_engine import verify_loan, verify_msp, verify_insurance

router = APIRouter(prefix="/reports", tags=["Reports & PDF Generation"])

@router.get("/farmer/{farmer_id}")
def list_farmer_reports(farmer_id: str, db: Session = Depends(get_db)):
    """
    List all generated reports for a farmer with status badges and download links.
    """
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    reports = db.query(Report).filter_by(farmer_id=farmer.id).order_by(Report.id.desc()).all()
    return [
        {
            "id": r.id,
            "report_ref": r.report_ref,
            "title": r.title,
            "title_hi": r.title_hi or r.title,
            "report_type": r.report_type,
            "status": r.status,
            "difference_amount": r.difference_amount,
            "summary": r.summary,
            "file_size": r.file_size,
            "report_date": r.report_date,
            "download_url": f"/api/v1/reports/download/{r.report_ref}",
        }
        for r in reports
    ]

@router.get("/detail/{report_ref}")
def get_report_detail(report_ref: str, db: Session = Depends(get_db)):
    """
    Retrieve comprehensive structured data for on-screen detailed report view.
    Includes itemized deductions, step-by-step arithmetic, cited statutory sources,
    and pre-filled grievance parameters.
    """
    report = db.query(Report).filter_by(report_ref=report_ref).first()
    farmer = db.query(Farmer).first()

    is_msp = "MSP" in report_ref or (report and "MSP" in report.report_type)
    is_insurance = "INS" in report_ref or (report and "Insurance" in report.report_type)

    if is_msp:
        msp = db.query(MSPRecord).first()
        res = verify_msp(
            crop=msp.crop if msp else "Paddy (Common)",
            quantity_quintals=msp.quantity_quintals if msp else 50.0,
            msp_rate=msp.msp_rate if msp else 2300.0,
            actual_payment=msp.actual_payment if msp else 105000.0,
            procurement_center=msp.procurement_center if msp else "Patan Krishi Upaj Mandi"
        )
        report_title = "MSP Payment Verification Report"
        report_title_hi = "एमएसपी भुगतान सत्यापन रिपोर्ट"
        report_type = "MSP Payment"
        date_str = report.report_date if report else "05 Apr 2025"

        figures = {
            "crop": res.crop,
            "quantity_quintals": res.quantity_quintals,
            "msp_rate": res.msp_rate,
            "expected_payment": res.expected_payment,
            "actual_payment": res.actual_payment,
            "difference": res.difference,
            "procurement_center": msp.procurement_center if msp else "Patan Krishi Upaj Mandi",
        }
    elif is_insurance:
        ins = db.query(InsuranceRecord).first()
        res = verify_insurance(
            crop=ins.crop if ins else "Paddy",
            claim_amount_expected=ins.claim_amount_expected if ins else 30000.0,
            amount_received=ins.amount_received if ins else 20000.0,
            claim_status=ins.claim_status if ins else "Under Review"
        )
        report_title = "Crop Insurance Claim Verification Report"
        report_title_hi = "फसल बीमा दावा सत्यापन रिपोर्ट"
        report_type = "Insurance Claim"
        date_str = report.report_date if report else "28 Mar 2025"

        figures = {
            "crop": res.crop,
            "claim_amount_expected": res.claim_amount_expected,
            "amount_received": res.amount_received,
            "difference": res.difference,
            "claim_status": res.claim_status,
        }
    else: # Loan
        loan = db.query(Loan).first()
        res = verify_loan(
            approved_amount=loan.approved_amount if loan else 80000.0,
            disbursed_amount=loan.disbursed_amount if loan else 70000.0,
            deductions=loan.deductions if loan else 5000.0,
            interest_rate=loan.interest_rate if loan else 7.5,
            bank_name=loan.bank_name if loan else "State Bank of India"
        )
        report_title = "Agricultural Loan Verification Report"
        report_title_hi = "कृषि ऋण सत्यापन रिपोर्ट"
        report_type = "Loan Verification"
        date_str = report.report_date if report else "12 Apr 2025"

        figures = {
            "approved_amount": res.approved_amount,
            "disbursed_amount": res.disbursed_amount,
            "deductions": res.deductions,
            "difference": res.difference,
            "unaccounted_difference": res.unaccounted_difference,
            "bank_name": loan.bank_name if loan else "State Bank of India",
            "loan_account_ref": loan.loan_ref if loan else "LN-2024-8812",
        }

    return {
        "report_ref": report_ref,
        "report_type": report_type,
        "title": report_title,
        "title_hi": report_title_hi,
        "report_date": date_str,
        "status": res.status,
        "status_label": res.status_label,
        "status_label_hi": res.status_label_hi,
        "is_flagged": res.is_flagged,
        "explanation": res.explanation,
        "explanation_hi": res.explanation_hi,
        "farmer": {
            "name": farmer.name if farmer else "Ramesh Kumar",
            "name_hi": farmer.name_hi if farmer else "रमेश कुमार",
            "farmer_id": farmer.farmer_id if farmer else "FV12345",
            "village": farmer.village if farmer else "Patan",
            "district": farmer.district if farmer else "Durg",
            "state": farmer.state if farmer else "Chhattisgarh",
            "bank_name": farmer.bank_name if farmer else "State Bank of India",
            "account_number_masked": farmer.account_number_masked if farmer else "SBIN*******1234",
        },
        "figures": figures,
        "arithmetic_breakdown": [
            {"label": item.label, "label_hi": item.label_hi, "amount": item.amount}
            for item in res.arithmetic_breakdown
        ],
        "reasons": res.reasons,
        "reasons_hi": res.reasons_hi,
        "next_steps": res.next_steps,
        "next_steps_hi": res.next_steps_hi,
        "sources": [s.model_dump() for s in res.sources],
        "flagged_rule_code": getattr(res, "flagged_rule_code", None),
        "flagged_rule_threshold": getattr(res, "flagged_rule_threshold", None),
        "flagged_rule_reason_en": getattr(res, "flagged_rule_reason_en", None),
        "flagged_rule_reason_hi": getattr(res, "flagged_rule_reason_hi", None),
        "helpline": {
            "name": "Kisan Call Centre",
            "phone": "1800-180-1551",
            "hours": "6:00 AM to 10:00 PM (All 7 Days)",
            "toll_free": True,
        },
        "grievance_prefill": {
            "issue_type": "Loan Discrepancy" if report_type == "Loan Verification" else ("MSP Payment Discrepancy" if report_type == "MSP Payment" else "Insurance Claim"),
            "bank_name": farmer.bank_name if farmer else "State Bank of India",
            "difference_amount": figures.get("difference", 0.0),
            "report_ref": report_ref,
            "suggested_note": f"Discrepancy flagged under KisanVerify report {report_ref}. Amount difference: ₹{figures.get('difference', 0.0):,.2f}.",
        }
    }

@router.get("/download/{report_ref}")
def download_report_pdf(report_ref: str, db: Session = Depends(get_db)):
    """
    Generate and stream the ReportLab PDF on demand.
    Accepts report reference IDs such as REP-LN-2025-01 or audit reference codes.
    """
    report = db.query(Report).filter_by(report_ref=report_ref).first()
    farmer = db.query(Farmer).first()

    if report:
        report_type = report.report_type
        diff_val = report.difference_amount
        status = report.status
        approved_val = 80000.0
        disbursed_val = 70000.0
        reasons = [
            "Deductions for processing fees and documentation charges",
            "Crop insurance premium auto-deduction (PMFBY)",
            "Bank policy variation or pending secondary tranche",
        ]
        if "MSP" in report.report_type:
            approved_val = 115000.0
            disbursed_val = 105000.0 if diff_val > 0 else 115000.0
            reasons = [
                "Quality moisture discount applied during mandi weighing",
                "Tranche payment protocol applied by state procurement agency",
            ]
        elif "Insurance" in report.report_type:
            approved_val = 30000.0
            disbursed_val = 20000.0
            reasons = [
                "Crop cutting experiment (CCE) threshold yield assessment ongoing",
                "State share subsidy release in administrative cycle",
            ]
    else:
        # Dynamic handling for institutional / audit report references (e.g. REP-LN-2025-01 or REP-AUDIT-*)
        report_type = "Loan Verification Audit" if ("LN" in report_ref or "KCC" in report_ref) else "Institutional Audit Report"
        diff_val = 10000.0
        approved_val = 80000.0
        disbursed_val = 70000.0
        status = "Needs Review"
        reasons = [
            "Sanctioned vs disbursed reconciliation variance",
            "Institutional processing fee and documentation deduction",
            "Pradhan Mantri Fasal Bima Yojana (PMFBY) premium adjustment",
        ]

    extra_details = {}
    if "MSP" in report_type:
        extra_details = {
            "crop": "Paddy (Common)",
            "quantity_quintals": 50.0,
            "msp_rate": 2300.0,
            "procurement_center": "Patan Krishi Upaj Mandi",
        }
    else:
        extra_details = {
            "deductions": 5000.0,
            "unaccounted": 5000.0 if diff_val > 5000 else 0.0,
        }

    pdf_bytes = generate_verification_pdf(
        report_type=report_type,
        report_ref=report_ref,
        farmer_name=farmer.name if farmer else "Ramesh Kumar",
        farmer_id=farmer.farmer_id if farmer else "FV12345",
        village=farmer.village if farmer else "Patan",
        district=farmer.district if farmer else "Durg",
        state=farmer.state if farmer else "Chhattisgarh",
        bank_name=farmer.bank_name if farmer else "State Bank of India",
        account_masked=farmer.account_number_masked if farmer else "SBIN*******1234",
        status=status,
        approved_or_expected=approved_val,
        disbursed_or_actual=disbursed_val,
        difference=diff_val,
        reasons=reasons,
        extra_details=extra_details
    )

    filename = f"{report_ref}_{report_type.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )
