"""
Unit tests for My Documents Vault API
=====================================
Covers upload, magic-byte validation, size limits, ownership isolation, and deletion.
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)

client = TestClient(app)

DUMMY_PDF = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer<</Size 2/Root 1 0 R>>\nstartxref\n50\n%%EOF"
DUMMY_PNG = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x05\xfe\x02\xfe\x1c\xc1m\x00\x00\x00\x00IEND\xaeB`\x82"
FAKE_PDF_TEXT = b"This is just plain text masquerading as a PDF file."

def test_list_documents_default_farmer():
    res = client.get("/api/v1/documents/", headers={"X-Farmer-Id": "FV12345"})
    assert res.status_code == 200
    data = res.json()
    assert "documents" in data
    assert "storage" in data
    assert data["farmer_id"] == "FV12345"
    assert data["storage"]["quota_formatted"] == "50 MB"

def test_upload_valid_pdf_and_ownership():
    # User A uploads a document
    file_payload = {"file": ("my_khasra.pdf", io.BytesIO(DUMMY_PDF), "application/pdf")}
    data_payload = {
        "category": "Land",
        "note": "Original Patan Khasra",
        "masked_id": "KH-999",
    }
    res = client.post(
        "/api/v1/documents/upload",
        files=file_payload,
        data=data_payload,
        headers={"X-Farmer-Id": "FV12345"},
    )
    assert res.status_code == 200
    doc_data = res.json()["document"]
    doc_uuid = doc_data["doc_uuid"]
    assert doc_data["category"] == "Land"
    assert doc_data["mime_type"] == "application/pdf"

    # User A can preview their document
    preview_res = client.get(
        f"/api/v1/documents/{doc_uuid}/preview",
        headers={"X-Farmer-Id": "FV12345"}
    )
    assert preview_res.status_code == 200
    assert preview_res.headers["content-type"] == "application/pdf"

    # User B (different farmer) CANNOT access User A's document (Ownership isolation check)
    forbidden_res = client.get(
        f"/api/v1/documents/{doc_uuid}/preview",
        headers={"X-Farmer-Id": "FV99999_DIFFERENT_USER"}
    )
    assert forbidden_res.status_code == 403
    assert "Access denied" in forbidden_res.json()["detail"]

    # User B CANNOT download User A's document
    forbidden_dl = client.get(
        f"/api/v1/documents/{doc_uuid}/download",
        headers={"X-Farmer-Id": "FV99999_DIFFERENT_USER"}
    )
    assert forbidden_dl.status_code == 403

    # User B CANNOT patch User A's document
    forbidden_patch = client.patch(
        f"/api/v1/documents/{doc_uuid}",
        json={"note": "hacked"},
        headers={"X-Farmer-Id": "FV99999_DIFFERENT_USER"}
    )
    assert forbidden_patch.status_code == 403

    # User B CANNOT delete User A's document
    forbidden_del = client.delete(
        f"/api/v1/documents/{doc_uuid}",
        headers={"X-Farmer-Id": "FV99999_DIFFERENT_USER"}
    )
    assert forbidden_del.status_code == 403

    # User A can rename/patch
    patch_res = client.patch(
        f"/api/v1/documents/{doc_uuid}",
        json={"note": "Updated Patan Khasra note", "original_name": "renamed_khasra.pdf"},
        headers={"X-Farmer-Id": "FV12345"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["document"]["note"] == "Updated Patan Khasra note"
    assert patch_res.json()["document"]["original_name"] == "renamed_khasra.pdf"

    # User A can delete
    del_res = client.delete(
        f"/api/v1/documents/{doc_uuid}",
        headers={"X-Farmer-Id": "FV12345"}
    )
    assert del_res.status_code == 200

def test_reject_invalid_magic_bytes():
    """Fails if extension is .pdf but content is not real PDF."""
    file_payload = {"file": ("fake.pdf", io.BytesIO(FAKE_PDF_TEXT), "application/pdf")}
    res = client.post(
        "/api/v1/documents/upload",
        files=file_payload,
        data={"category": "Other"},
        headers={"X-Farmer-Id": "FV12345"}
    )
    assert res.status_code == 400
    assert "Invalid file format" in res.json()["detail"]

def test_reject_oversized_file():
    """Fails if file exceeds 5MB."""
    oversized = b"%PDF" + (b"0" * (5 * 1024 * 1024 + 100))
    file_payload = {"file": ("large.pdf", io.BytesIO(oversized), "application/pdf")}
    res = client.post(
        "/api/v1/documents/upload",
        files=file_payload,
        data={"category": "Other"},
        headers={"X-Farmer-Id": "FV12345"}
    )
    assert res.status_code == 400
    assert "5MB" in res.json()["detail"]
