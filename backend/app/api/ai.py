import os
from fastapi import APIRouter
from app.core.config import settings
from app.services.ai_simplifier import (
    generate_ai_explanation,
    ChatRequest,
    ChatResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Policy Simplifier & Chat"])

@router.get("/status")
def ai_status_endpoint():
    """
    Returns the operational status and configuration mode of the AI Assistant.
    """
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    is_configured = bool(gemini_key and len(gemini_key.strip()) > 10)
    return {
        "provider_configured": is_configured,
        "mode": "live" if is_configured else "offline",
        "provider": settings.LLM_PROVIDER or "gemini",
        "model": settings.LLM_MODEL or "gemini-1.5-flash",
    }

@router.post("/chat", response_model=ChatResponse)
def ai_chat_endpoint(req: ChatRequest):
    """
    Conversational AI assistant for policy and verification queries.
    Never invents numbers; uses deterministic facts and provides intent-specific fallback.
    """
    return generate_ai_explanation(
        message=req.message,
        language=req.language or "hi",
        farmer_id=req.farmer_id or "FV12345",
        history=req.history or [],
        context=req.context_hint,
    )

@router.post("/explain-discrepancy")
def explain_discrepancy(
    record_type: str, # "Loan", "MSP", "Insurance"
    difference: float,
    language: str = "hi"
):
    """
    Returns an accessible bilingual explanation for a specific flagged difference.
    """
    query = f"Explain the {record_type} discrepancy of ₹{difference:,.2f}"
    return generate_ai_explanation(query, language=language)
