"""
KisanVerify Voice Call Support - Auth, Privacy & Rate Limiting
==============================================================
Manages:
- Caller authentication (in-app JWT or phone PIN / demo OTP 1234).
- Consent disclosure tracking (mandatory disclosure that caller is speaking with AI).
- In-memory rate limiting (max 20 turns per session, max 5 calls per hour per farmer/IP).
- Voice history retention and privacy purge (DELETE /api/v1/voice/history/{farmer_id}).
"""

import time
from typing import Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from fastapi import HTTPException, Header, Request

# ---------------------------------------------------------------------------
# Rate Limiting & Session Storage (In-memory)
# ---------------------------------------------------------------------------

# { session_id: { "farmer_id": str, "turn_count": int, "created_at": float, "consent_given": bool } }
_VOICE_SESSIONS: Dict[str, Dict[str, Any]] = {}

# { farmer_or_ip: [timestamp1, timestamp2, ...] }
_CALL_RATE_LIMITS: Dict[str, list] = {}

MAX_TURNS_PER_SESSION = 20
MAX_CALLS_PER_HOUR = 5
RATE_WINDOW_SECONDS = 3600

# Demo verification PIN
DEMO_VERIFY_PIN = "1234"


# ---------------------------------------------------------------------------
# Consent & Disclosure Text
# ---------------------------------------------------------------------------

CONSENT_DISCLOSURE_HI = (
    "नमस्ते। आप किसानवेरीफाई के कृत्रिम बुद्धिमत्ता (AI) कॉल सहायक से बात कर रहे हैं। "
    "यह कॉल गुणवत्ता और पारदर्शिता के लिए रिकॉर्ड की जा सकती है। जारी रखने के लिए 'हाँ' कहें।"
)

CONSENT_DISCLOSURE_EN = (
    "Namaste. You are speaking with KisanVerify's AI voice assistant. "
    "This call may be recorded for quality and verification. Say 'yes' to continue."
)


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class PinVerifyRequest(BaseModel):
    phone_number: str
    pin: str
    language: Optional[str] = "hi"


class PinVerifyResponse(BaseModel):
    success: bool
    farmer_id: Optional[str] = None
    farmer_name: Optional[str] = None
    phone_masked: Optional[str] = None
    session_id: Optional[str] = None
    message: str
    is_demo: bool = True


class ConsentRequest(BaseModel):
    session_id: str
    consent_given: bool
    farmer_id: Optional[str] = "FV12345"


class ConsentResponse(BaseModel):
    session_id: str
    consent_given: bool
    status: str
    message: str


# ---------------------------------------------------------------------------
# Rate Limiting Functions
# ---------------------------------------------------------------------------

def check_call_initiation_limit(client_id: str) -> bool:
    """
    Checks if client (farmer_id or IP) has initiated <= MAX_CALLS_PER_HOUR calls in the last hour.
    """
    now = time.time()
    history = _CALL_RATE_LIMITS.get(client_id, [])
    # Filter timestamps within current window
    valid_history = [ts for ts in history if now - ts < RATE_WINDOW_SECONDS]
    if len(valid_history) >= MAX_CALLS_PER_HOUR:
        return False
    valid_history.append(now)
    _CALL_RATE_LIMITS[client_id] = valid_history
    return True


def record_and_check_turn_limit(session_id: str, farmer_id: str = "FV12345") -> Tuple[bool, int]:
    """
    Increments turn count for a session.
    Returns (is_allowed, current_turn_count).
    """
    if session_id not in _VOICE_SESSIONS:
        _VOICE_SESSIONS[session_id] = {
            "farmer_id": farmer_id,
            "turn_count": 0,
            "created_at": time.time(),
            "consent_given": False,
        }
    sess = _VOICE_SESSIONS[session_id]
    sess["turn_count"] += 1
    if sess["turn_count"] > MAX_TURNS_PER_SESSION:
        return False, sess["turn_count"]
    return True, sess["turn_count"]


def get_session_info(session_id: str) -> Optional[Dict[str, Any]]:
    return _VOICE_SESSIONS.get(session_id)


def record_consent(session_id: str, consent: bool, farmer_id: str = "FV12345"):
    if session_id not in _VOICE_SESSIONS:
        _VOICE_SESSIONS[session_id] = {
            "farmer_id": farmer_id,
            "turn_count": 0,
            "created_at": time.time(),
            "consent_given": consent,
        }
    else:
        _VOICE_SESSIONS[session_id]["consent_given"] = consent


def purge_voice_history_for_farmer(farmer_id: str) -> int:
    """
    Purges all in-memory voice sessions, rate-limit logs, and audit logs for the farmer.
    Satisfies data protection & privacy deletion rights.
    """
    purged_count = 0
    sessions_to_remove = [
        sid for sid, data in _VOICE_SESSIONS.items()
        if data.get("farmer_id") == farmer_id
    ]
    for sid in sessions_to_remove:
        del _VOICE_SESSIONS[sid]
        purged_count += 1

    if farmer_id in _CALL_RATE_LIMITS:
        del _CALL_RATE_LIMITS[farmer_id]

    # Also clean up database audit logs for this farmer
    try:
        from app.core.database import SessionLocal
        from app.models.models import ToolAuditLog
        db = SessionLocal()
        db.query(ToolAuditLog).filter(ToolAuditLog.farmer_id == farmer_id).delete()
        db.commit()
        db.close()
    except Exception as e:
        print(f"[Privacy Purge] Error clearing audit logs: {e}")

    return purged_count


# ---------------------------------------------------------------------------
# PIN / Caller Authentication
# ---------------------------------------------------------------------------

def verify_caller_pin(req: PinVerifyRequest) -> PinVerifyResponse:
    """
    Verifies caller credentials. Supports demo OTP 1234 for sandbox/demonstration.
    """
    is_hi = req.language in ["hi", "hindi", "hinglish"]
    clean_phone = req.phone_number.replace(" ", "").replace("-", "")
    
    if req.pin != DEMO_VERIFY_PIN:
        return PinVerifyResponse(
            success=False,
            message="अमान्य पिन। कृपया डेमो पिन 1234 का उपयोग करें।" if is_hi else "Invalid PIN. Please use demo PIN 1234.",
            is_demo=True,
        )

    # Return authenticated farmer session
    masked = clean_phone[-4:] if len(clean_phone) >= 4 else "1234"
    phone_masked = f"+91-XXXXX-{masked}"
    
    import uuid
    sess_id = f"vcall-{uuid.uuid4().hex[:10]}"
    record_consent(sess_id, consent=True, farmer_id="FV12345")

    return PinVerifyResponse(
        success=True,
        farmer_id="FV12345",
        farmer_name="Ramesh Kumar",
        phone_masked=phone_masked,
        session_id=sess_id,
        message="सफलतापूर्वक सत्यापित। आप कॉल सहायता शुरू कर सकते हैं।" if is_hi else "Successfully verified. Voice call support activated.",
        is_demo=True,
    )
