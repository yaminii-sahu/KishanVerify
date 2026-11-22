import random
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import Grievance, Farmer

router = APIRouter(prefix="/grievances", tags=["Grievances & Complaints"])

class GrievanceCreateRequest(BaseModel):
    farmer_id: str = "FV12345"
    issue_type: str = "Loan Discrepancy"
    description: str
    attachment_name: Optional[str] = None

class GrievanceStatusUpdateRequest(BaseModel):
    status: str # "In Progress", "Resolved", "Escalated"
    resolution_notes: Optional[str] = None

@router.get("/")
def list_all_grievances(
    status: Optional[str] = None,
    issue_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Grievance)
    if status and status.lower() != "all":
        query = query.filter(Grievance.status.ilike(status))
    if issue_type and issue_type.lower() != "all":
        query = query.filter(Grievance.issue_type.ilike(issue_type))

    records = query.order_by(Grievance.id.desc()).all()
    return [
        {
            "id": g.id,
            "grievance_ref": g.grievance_ref,
            "farmer_id": g.farmer.farmer_id if g.farmer else "FV12345",
            "farmer_name": g.farmer_name,
            "issue_type": g.issue_type,
            "description": g.description,
            "status": g.status,
            "attachment_name": g.attachment_name,
            "resolution_notes": g.resolution_notes,
            "date": g.created_at.strftime("%d %b %Y"),
        }
        for g in records
    ]

@router.get("/farmer/{farmer_id}")
def list_farmer_grievances(farmer_id: str, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter_by(farmer_id=farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    records = db.query(Grievance).filter_by(farmer_id=farmer.id).order_by(Grievance.id.desc()).all()
    return [
        {
            "id": g.id,
            "grievance_ref": g.grievance_ref,
            "farmer_id": farmer.farmer_id,
            "farmer_name": g.farmer_name,
            "issue_type": g.issue_type,
            "description": g.description,
            "status": g.status,
            "attachment_name": g.attachment_name,
            "resolution_notes": g.resolution_notes,
            "date": g.created_at.strftime("%d %b %Y"),
        }
        for g in records
    ]

@router.post("/")
def create_grievance(req: GrievanceCreateRequest, db: Session = Depends(get_db)):
    farmer = db.query(Farmer).filter_by(farmer_id=req.farmer_id).first()
    if not farmer:
        # Fallback to demo farmer if not found
        farmer = db.query(Farmer).first()

    ref_num = random.randint(1000, 9999)
    grievance_ref = f"GRV-2025-{ref_num}"

    new_g = Grievance(
        grievance_ref=grievance_ref,
        farmer_id=farmer.id if farmer else 1,
        farmer_name=farmer.name if farmer else "Ramesh Kumar",
        issue_type=req.issue_type,
        description=req.description[:500],
        status="Open",
        attachment_name=req.attachment_name or "Loan_Sanction.pdf",
        resolution_notes="Ticket assigned to Lead District Officer (SBI Patan / Durg Mandi). Acknowledged by portal.",
    )

    db.add(new_g)
    db.commit()
    db.refresh(new_g)

    return {
        "id": new_g.id,
        "grievance_ref": new_g.grievance_ref,
        "farmer_name": new_g.farmer_name,
        "issue_type": new_g.issue_type,
        "status": new_g.status,
        "description": new_g.description,
        "date": new_g.created_at.strftime("%d %b %Y"),
        "message": "Grievance submitted successfully. Tracking reference generated.",
    }

@router.patch("/{grievance_id}/status")
def update_grievance_status(
    grievance_id: int,
    req: GrievanceStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    g = db.query(Grievance).filter_by(id=grievance_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="Grievance not found")

    g.status = req.status
    if req.resolution_notes:
        g.resolution_notes = req.resolution_notes

    db.commit()
    db.refresh(g)

    return {
        "id": g.id,
        "grievance_ref": g.grievance_ref,
        "status": g.status,
        "resolution_notes": g.resolution_notes,
    }
