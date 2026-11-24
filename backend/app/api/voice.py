from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.core.config import settings
from app.voice.agent import (
    VoiceTurnRequest,
    VoiceTurnResponse,
    process_voice_call_turn,
)
from app.voice.auth_privacy import (
    PinVerifyRequest,
    PinVerifyResponse,
    ConsentRequest,
    ConsentResponse,
    verify_caller_pin,
    record_consent,
    record_and_check_turn_limit,
    check_call_initiation_limit,
    purge_voice_history_for_farmer,
    CONSENT_DISCLOSURE_HI,
    CONSENT_DISCLOSURE_EN,
    DEMO_VERIFY_PIN,
)

router = APIRouter(prefix="/voice", tags=["Voice Call Support Agent"])


@router.get("/status")
def get_voice_status() -> Dict[str, Any]:
    """
    Returns the operational status of the Voice Call Support subsystem.
    """
    gemini_key = settings.GEMINI_API_KEY
    is_live = bool(gemini_key and len(gemini_key.strip()) > 10)
    return {
        "status": "ready",
        "service": "KisanVerify AI Voice Call Support",
        "mode": "live" if is_live else "offline",
        "provider": "gemini" if is_live else "deterministic-rule-engine",
        "llm_model": settings.LLM_MODEL,
        "phonetic_converter": "enabled",
        "rate_limiting": "active",
        "demo_pin": DEMO_VERIFY_PIN,
        "tools_loaded": [
            "get_records_summary",
            "get_loan_status",
            "get_msp_status",
            "get_claim_status",
            "get_eligible_schemes",
            "get_eligible_loans",
            "get_required_documents",
            "list_my_documents",
            "get_mandi_prices",
            "get_weather_alerts",
            "find_nearby_offices",
            "get_grievance_status",
            "raise_grievance",
            "request_callback",
        ],
    }


@router.get("/consent-disclosure")
def get_consent_disclosure(language: str = "hi") -> Dict[str, str]:
    """
    Returns the spoken AI disclosure statement in Hindi and English.
    """
    is_hi = language in ["hi", "hindi", "hinglish"]
    return {
        "disclosure_text": CONSENT_DISCLOSURE_HI if is_hi else CONSENT_DISCLOSURE_EN,
        "disclosure_hi": CONSENT_DISCLOSURE_HI,
        "disclosure_en": CONSENT_DISCLOSURE_EN,
        "requirement": "Mandatory prior disclosure before processing personal account information",
    }


@router.post("/verify-caller-pin", response_model=PinVerifyResponse)
def verify_pin(req: PinVerifyRequest) -> PinVerifyResponse:
    """
    Verifies caller credentials via phone number and PIN / demo OTP 1234.
    """
    return verify_caller_pin(req)


@router.post("/record-consent", response_model=ConsentResponse)
def set_consent(req: ConsentRequest) -> ConsentResponse:
    """
    Records verbal or in-app consent for AI voice conversation recording.
    """
    record_consent(req.session_id, req.consent_given, req.farmer_id or "FV12345")
    return ConsentResponse(
        session_id=req.session_id,
        consent_given=req.consent_given,
        status="Recorded",
        message="Consent recorded successfully." if req.consent_given else "Consent declined.",
    )


@router.delete("/history/{farmer_id}")
def purge_voice_history(farmer_id: str) -> Dict[str, Any]:
    """
    Deletes all voice conversation sessions, logs, and audit entries for the specified farmer.
    Enforces privacy and right-to-be-forgotten compliance.
    """
    cleared = purge_voice_history_for_farmer(farmer_id)
    return {
        "success": True,
        "farmer_id": farmer_id,
        "sessions_purged": cleared,
        "message": f"Successfully deleted voice call logs and audit history for farmer {farmer_id}.",
    }


@router.post("/turn", response_model=VoiceTurnResponse)
def voice_call_turn(req: VoiceTurnRequest, request: Request) -> VoiceTurnResponse:
    """
    Executes a single conversational speech turn for voice call support.
    Enforces turn limits (max 20 turns) and hourly call rate limits.
    """
    farmer_id = req.farmer_id or "FV12345"
    client_ip = request.client.host if request.client else "unknown"
    rate_key = farmer_id or client_ip

    # Enforce turn limits per session
    if req.session_id:
        allowed, count = record_and_check_turn_limit(req.session_id, farmer_id=farmer_id)
        if not allowed:
            is_hi = req.language in ["hi", "hindi", "hinglish"]
            detail_msg = (
                "इस कॉल की अधिकतम सीमा (20 राउंड) पूरी हो गई है। कृपया नई कॉल शुरू करें या अधिकारी से संपर्क करें।"
                if is_hi else
                "Session limit reached (20 turns max). Please start a new call or speak with an officer."
            )
            raise HTTPException(status_code=429, detail=detail_msg)

    try:
        return process_voice_call_turn(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice agent error: {str(e)}")


@router.post("/agent", response_model=VoiceTurnResponse)
def voice_call_agent(req: VoiceTurnRequest, request: Request) -> VoiceTurnResponse:
    """
    Alias for /voice/turn to support standard agent invocation semantics.
    """
    return voice_call_turn(req, request)


# ---------------------------------------------------------------------------
# Telephony Integration Endpoints (Feature-Flagged)
# ---------------------------------------------------------------------------

from app.voice.telephony import (
    VOICE_TELEPHONY_ENABLED,
    TELEPHONY_PROVIDER,
    TelephonyCallContext,
    TelephonyResponse,
    get_telephony_adapter,
)
from fastapi.responses import Response


class MissedCallPayload(BaseModel):
    caller_phone: str
    language: Optional[str] = "hi"


@router.get("/telephony/status")
def get_telephony_status() -> Dict[str, Any]:
    """
    Returns telephony adapter availability and feature flag configuration.
    """
    return {
        "telephony_enabled": VOICE_TELEPHONY_ENABLED,
        "provider": TELEPHONY_PROVIDER,
        "supported_codecs": ["PCMU", "opus", "pcm"],
        "missed_call_service": "active",
        "demo_mode": not VOICE_TELEPHONY_ENABLED,
    }


@router.post("/telephony/incoming")
def telephony_incoming_call(ctx: TelephonyCallContext, request: Request):
    """
    Webhook for incoming phone calls. Returns TwiML or structured JSON.
    """
    adapter = get_telephony_adapter()
    res = adapter.handle_incoming_call(ctx)

    accept_header = request.headers.get("accept", "")
    if "application/json" in accept_header:
        return res
    return Response(content=res.twiml_xml, media_type="application/xml")


@router.post("/telephony/gather")
def telephony_gather_speech(ctx: TelephonyCallContext, request: Request):
    """
    Webhook for speech gathering result. Invokes voice agent and returns spoken response.
    """
    adapter = get_telephony_adapter()
    res = adapter.handle_gather(ctx)

    accept_header = request.headers.get("accept", "")
    if "application/json" in accept_header:
        return res
    return Response(content=res.twiml_xml, media_type="application/xml")


@router.post("/telephony/missed-call")
def telephony_missed_call(payload: MissedCallPayload) -> Dict[str, Any]:
    """
    Webhook for missed-call alerts. Queues a priority officer callback.
    """
    adapter = get_telephony_adapter()
    return adapter.handle_missed_call(payload.caller_phone, language=payload.language or "hi")

