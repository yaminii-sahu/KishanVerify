"""
KisanVerify My Documents (Vault) API
====================================
Secure document vault for farmers with ownership enforcement,
strict magic-byte validation, and download streaming.
"""

import uuid
import mimetypes
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, Query, Response
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db
from app.models.models import Document
from app.services.storage import get_storage_backend, validate_and_detect_mime, MAX_FILE_SIZE

router = APIRouter(prefix="/documents", tags=["My Documents Vault"])

VALID_CATEGORIES = ["Identity", "Land", "Bank", "Insurance", "Scheme", "Other"]
STORAGE_QUOTA_BYTES = 50 * 1024 * 1024 # 50 MB total quota per farmer

class DocumentResponse(BaseModel):
    id: int
    doc_uuid: str
    farmer_id: str
    category: str
    original_name: str
    mime_type: str
    size_bytes: int
    size_formatted: str
    note: Optional[str] = None
    expiry_date: Optional[str] = None
    masked_id: Optional[str] = None
    uploaded_at: str

class DocumentPatchRequest(BaseModel):
    original_name: Optional[str] = None
    note: Optional[str] = None
    expiry_date: Optional[str] = None
    category: Optional[str] = None

def format_size(bytes_val: int) -> str:
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    else:
        return f"{bytes_val / (1024 * 1024):.2f} MB"

def get_farmer_identity(x_farmer_id: Optional[str] = Header(None), farmer_id: Optional[str] = Query(None)) -> str:
    fid = x_farmer_id or farmer_id or "FV12345"
    return fid.strip()

@router.get("/")
def list_documents(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all documents owned by the calling farmer.
    Returns documents list plus storage quota metrics.
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)

    query = db.query(Document).filter(Document.farmer_id == owner_id)

    if category and category.lower() != "all":
        query = query.filter(Document.category.ilike(category))

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (Document.original_name.ilike(search_filter)) |
            (Document.note.ilike(search_filter)) |
            (Document.masked_id.ilike(search_filter))
        )

    docs = query.order_by(Document.uploaded_at.desc()).all()

    # Calculate total usage for this farmer
    all_farmer_docs = db.query(Document).filter(Document.farmer_id == owner_id).all()
    total_bytes = sum(d.size_bytes for d in all_farmer_docs)
    quota_percentage = min(100.0, round((total_bytes / STORAGE_QUOTA_BYTES) * 100, 1))

    return {
        "farmer_id": owner_id,
        "total_documents": len(docs),
        "storage": {
            "used_bytes": total_bytes,
            "used_formatted": format_size(total_bytes),
            "quota_bytes": STORAGE_QUOTA_BYTES,
            "quota_formatted": "50 MB",
            "usage_percent": quota_percentage,
        },
        "documents": [
            {
                "id": d.id,
                "doc_uuid": d.doc_uuid,
                "farmer_id": d.farmer_id,
                "category": d.category,
                "original_name": d.original_name,
                "mime_type": d.mime_type,
                "size_bytes": d.size_bytes,
                "size_formatted": format_size(d.size_bytes),
                "note": d.note,
                "expiry_date": d.expiry_date,
                "masked_id": d.masked_id,
                "uploaded_at": d.uploaded_at.strftime("%d %b %Y, %I:%M %p") if d.uploaded_at else "",
            }
            for d in docs
        ]
    }

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("Other"),
    note: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    masked_id: Optional[str] = Form(None),
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Upload a document to the farmer's private vault.
    Validates file size (max 5MB) and content magic bytes (PDF, JPG, PNG).
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)

    raw_data = await file.read()
    filename = file.filename or "document"

    # Server-side validation
    is_valid, detected_mime, err_msg = validate_and_detect_mime(raw_data, filename)
    if not is_valid:
        raise HTTPException(status_code=400, detail=err_msg)

    # Check storage quota
    existing_docs = db.query(Document).filter(Document.farmer_id == owner_id).all()
    current_used = sum(d.size_bytes for d in existing_docs)
    if current_used + len(raw_data) > STORAGE_QUOTA_BYTES:
        raise HTTPException(status_code=400, detail="Storage quota exceeded. Free up space before uploading.")

    # Save to storage backend
    storage = get_storage_backend()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    stored_name = storage.save(raw_data, ext)

    # Sanitize category
    clean_category = category.strip().title()
    if clean_category not in VALID_CATEGORIES:
        clean_category = "Other"

    doc = Document(
        doc_uuid=str(uuid.uuid4()),
        farmer_id=owner_id,
        category=clean_category,
        original_name=filename,
        stored_filename=stored_name,
        mime_type=detected_mime,
        size_bytes=len(raw_data),
        note=note.strip() if note else None,
        expiry_date=expiry_date.strip() if expiry_date else None,
        masked_id=masked_id.strip() if masked_id else None,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    return {
        "message": "Document uploaded successfully",
        "document": {
            "id": doc.id,
            "doc_uuid": doc.doc_uuid,
            "category": doc.category,
            "original_name": doc.original_name,
            "mime_type": doc.mime_type,
            "size_bytes": doc.size_bytes,
            "size_formatted": format_size(doc.size_bytes),
            "note": doc.note,
            "expiry_date": doc.expiry_date,
            "masked_id": doc.masked_id,
            "uploaded_at": doc.uploaded_at.strftime("%d %b %Y, %I:%M %p"),
        }
    }

@router.get("/{doc_uuid}/preview")
def preview_document(
    doc_uuid: str,
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Stream inline preview of a document with strict ownership enforcement.
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)
    doc = db.query(Document).filter(Document.doc_uuid == doc_uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.farmer_id != owner_id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this document")

    storage = get_storage_backend()
    try:
        data = storage.read(doc.stored_filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document content missing on server")

    return Response(
        content=data,
        media_type=doc.mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{doc.original_name}"',
            "Cache-Control": "private, max-age=3600"
        }
    )

@router.get("/{doc_uuid}/download")
def download_document(
    doc_uuid: str,
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Download a document with Content-Disposition attachment.
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)
    doc = db.query(Document).filter(Document.doc_uuid == doc_uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.farmer_id != owner_id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this document")

    storage = get_storage_backend()
    try:
        data = storage.read(doc.stored_filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Document content missing on server")

    return Response(
        content=data,
        media_type=doc.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{doc.original_name}"'
        }
    )

@router.patch("/{doc_uuid}")
def update_document(
    doc_uuid: str,
    req: DocumentPatchRequest,
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Update document metadata (rename, note, expiry, category).
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)
    doc = db.query(Document).filter(Document.doc_uuid == doc_uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.farmer_id != owner_id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this document")

    if req.original_name is not None and req.original_name.strip():
        doc.original_name = req.original_name.strip()
    if req.note is not None:
        doc.note = req.note.strip()
    if req.expiry_date is not None:
        doc.expiry_date = req.expiry_date.strip()
    if req.category is not None and req.category.strip().title() in VALID_CATEGORIES:
        doc.category = req.category.strip().title()

    db.commit()
    db.refresh(doc)

    return {
        "message": "Document updated",
        "document": {
            "id": doc.id,
            "doc_uuid": doc.doc_uuid,
            "original_name": doc.original_name,
            "note": doc.note,
            "expiry_date": doc.expiry_date,
            "category": doc.category,
        }
    }

@router.delete("/{doc_uuid}")
def delete_document(
    doc_uuid: str,
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Delete a document and purge file from storage.
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)
    doc = db.query(Document).filter(Document.doc_uuid == doc_uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if doc.farmer_id != owner_id:
        raise HTTPException(status_code=403, detail="Access denied: You do not own this document")

    storage = get_storage_backend()
    storage.delete(doc.stored_filename)

    db.delete(doc)
    db.commit()

    return {"message": "Document deleted successfully", "doc_uuid": doc_uuid}

@router.delete("/all/purge")
def delete_all_farmer_documents(
    x_farmer_id: Optional[str] = Header(None),
    farmer_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Delete all documents for the calling farmer ('Delete all my data' option).
    """
    owner_id = get_farmer_identity(x_farmer_id, farmer_id)
    docs = db.query(Document).filter(Document.farmer_id == owner_id).all()

    storage = get_storage_backend()
    count = len(docs)
    for d in docs:
        storage.delete(d.stored_filename)
        db.delete(d)

    db.commit()

    return {"message": f"Successfully deleted all {count} documents from your vault."}
