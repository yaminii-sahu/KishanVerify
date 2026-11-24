from fastapi import APIRouter, HTTPException, Depends, Request
from typing import Dict, Any, Optional

from app.core.config import settings
from app.voice.agent import (
    VoiceTurnRequest,
    VoiceTurnResponse,
    process_voice_call_turn,
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


@router.post("/turn", response_model=VoiceTurnResponse)
def voice_call_turn(req: VoiceTurnRequest) -> VoiceTurnResponse:
    """
    Executes a single conversational speech turn for voice call support.
    Accepts speech transcription, session history, and optional pending confirmations.
    Returns grounded spoken text, phonetic pronunciation, and synchronized action cards.
    """
    try:
        return process_voice_call_turn(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice agent error: {str(e)}")


@router.post("/agent", response_model=VoiceTurnResponse)
def voice_call_agent(req: VoiceTurnRequest) -> VoiceTurnResponse:
    """
    Alias for /voice/turn to support standard agent invocation semantics.
    """
    return voice_call_turn(req)
