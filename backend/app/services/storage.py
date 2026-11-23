"""
KisanVerify Storage Service
===========================
Secure document storage abstraction supporting local disk and future cloud backends.
Enforces content-type magic byte validation and sanitized random filenames.
"""

import os
import uuid
import tempfile
from pathlib import Path
from typing import Optional, Tuple

MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB

class StorageBackend:
    def save(self, data: bytes, ext: str) -> str:
        raise NotImplementedError

    def read(self, stored_name: str) -> bytes:
        raise NotImplementedError

    def delete(self, stored_name: str) -> bool:
        raise NotImplementedError

    def exists(self, stored_name: str) -> bool:
        raise NotImplementedError

    def get_path(self, stored_name: str) -> Path:
        raise NotImplementedError

class LocalStorageBackend(StorageBackend):
    def __init__(self, base_dir: Optional[str] = None):
        if base_dir:
            self.base_dir = Path(base_dir)
        elif os.environ.get("VERCEL") == "1":
            self.base_dir = Path(tempfile.gettempdir()) / "kisanverify_vault"
        else:
            # Stored outside web root
            self.base_dir = Path("uploads") / "vault"

        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, data: bytes, ext: str) -> str:
        clean_ext = ext.lstrip(".").lower()
        if not clean_ext:
            clean_ext = "bin"
        unique_name = f"{uuid.uuid4().hex}.{clean_ext}"
        target_path = self.base_dir / unique_name
        target_path.write_bytes(data)
        return unique_name

    def get_path(self, stored_name: str) -> Path:
        # Prevent directory traversal
        safe_name = os.path.basename(stored_name)
        return self.base_dir / safe_name

    def read(self, stored_name: str) -> bytes:
        path = self.get_path(stored_name)
        if not path.is_file():
            raise FileNotFoundError(f"File not found: {stored_name}")
        return path.read_bytes()

    def delete(self, stored_name: str) -> bool:
        path = self.get_path(stored_name)
        if path.is_file():
            try:
                path.unlink()
                return True
            except OSError:
                return False
        return False

    def exists(self, stored_name: str) -> bool:
        return self.get_path(stored_name).is_file()

def get_storage_backend() -> StorageBackend:
    # Future: switch on STORAGE_PROVIDER env var (e.g. S3, Supabase)
    return LocalStorageBackend()

def validate_and_detect_mime(data: bytes, filename: str) -> Tuple[bool, str, str]:
    """
    Validates file size and inspects magic bytes for real content type.
    Allowed formats: PDF, JPG, PNG.
    Returns: (is_valid, mime_type, error_message)
    """
    if len(data) == 0:
        return False, "", "File is empty"

    if len(data) > MAX_FILE_SIZE:
        return False, "", "File size exceeds 5MB limit"

    # Magic byte check
    if data.startswith(b"%PDF"):
        return True, "application/pdf", ""
    elif data.startswith(b"\xff\xd8\xff"):
        return True, "image/jpeg", ""
    elif data.startswith(b"\x89PNG\r\n\x1a\n"):
        return True, "image/png", ""

    return False, "", "Invalid file format. Only PDF, JPG, and PNG files are supported."
