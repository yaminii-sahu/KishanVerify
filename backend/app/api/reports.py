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

@router.get("/download/{report_ref}")
def download_report_pdf(report_ref: str, db: Session = Depends(get_db)):
    """
    Generate and stream the ReportLab PDF on demand.
    """
    report = db.query(Report).filter_by(report_ref=report_ref).first()
    if not report:
        raise HTTPException(status_code=404, detail=f"Report {report_ref} not found")

    farmer = db.query(Farmer).filter_by(id=report.farmer_id).first()

    # Determine report specifics
    approved_val = 80000.0
    disbursed_val = 70000.0
    diff_val = report.difference_amount
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

    pdf_bytes = generate_verification_pdf(
        report_type=report.report_type,
        report_ref=report.report_ref,
        farmer_name=farmer.name if farmer else "Ramesh Kumar",
        farmer_id=farmer.farmer_id if farmer else "FV12345",
        village=farmer.village if farmer else "Patan",
        district=farmer.district if farmer else "Durg",
        state=farmer.state if farmer else "Chhattisgarh",
        bank_name=farmer.bank_name if farmer else "State Bank of India",
        account_masked=farmer.account_number_masked if farmer else "SBIN*******1234",
        status=report.status,
        approved_or_expected=approved_val,
        disbursed_or_actual=disbursed_val,
        difference=diff_val,
        reasons=reasons,
        extra_details={"deductions": 5000.0} if "Loan" in report.report_type else None
    )

    filename = f"{report.report_ref}_{report.report_type.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition",
        }
    )
