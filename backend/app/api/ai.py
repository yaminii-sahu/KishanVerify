from fastapi import APIRouter
from app.services.ai_simplifier import (
    generate_ai_explanation,
    ChatRequest,
    ChatResponse,
)

router = APIRouter(prefix="/ai", tags=["AI Policy Simplifier & Chat"])

@router.post("/chat", response_model=ChatResponse)
def ai_chat_endpoint(req: ChatRequest):
    """
    Conversational AI assistant for policy and verification queries.
    Never invents numbers; uses deterministic facts and provides template fallback.
    """
    return generate_ai_explanation(
        message=req.message,
        language=req.language or "hi",
        farmer_id=req.farmer_id or "FV12345",
        context=req.context,
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
