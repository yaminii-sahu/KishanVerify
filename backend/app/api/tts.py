"""
KishanVerify TTS & Spoken Audio Router
======================================
Provides endpoints for deterministic spoken script generation and audio synthesis.
Uses gTTS with persistent disk caching by sha256 hash.
Gracefully provides Web Speech API fallback flags when offline.
"""

import os
import hashlib
import io
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.audio_script import (
    generate_loan_script,
    generate_msp_script,
    number_to_hindi_words,
    number_to_english_words,
)

router = APIRouter(prefix="/tts", tags=["Text-to-Speech & Audio Summaries"])

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "storage", "tts_cache")
os.makedirs(CACHE_DIR, exist_ok=True)

class ScriptRequest(BaseModel):
    check_type: str # "loan" or "msp"
    language: str = "hi" # "hi" or "en"
    # Loan parameters
    approved_amount: Optional[float] = 80000.0
    disbursed_amount: Optional[float] = 70000.0
    deductions: Optional[float] = 5000.0
    bank_name: Optional[str] = "State Bank of India"
    # MSP parameters
    crop: Optional[str] = "Paddy (Common)"
    quantity_quintals: Optional[float] = 50.0
    msp_rate: Optional[float] = 2300.0
    actual_payment: Optional[float] = 105000.0
    procurement_center: Optional[str] = "Patan Krishi Upaj Mandi"

class SynthesizeRequest(BaseModel):
    text: str
    language: str = "hi"

@router.post("/script")
def get_spoken_script(req: ScriptRequest):
    """
    Generate deterministic, calm, respectful spoken script with sentence-level chunks.
    """
    if req.check_type == "loan":
        script_hi = generate_loan_script(
            approved_amount=req.approved_amount or 80000.0,
            disbursed_amount=req.disbursed_amount or 70000.0,
            deductions=req.deductions or 0.0,
            difference=(req.approved_amount or 80000.0) - (req.disbursed_amount or 70000.0),
            bank_name=req.bank_name or "State Bank of India",
            language="hi"
        )
        script_en = generate_loan_script(
            approved_amount=req.approved_amount or 80000.0,
            disbursed_amount=req.disbursed_amount or 70000.0,
            deductions=req.deductions or 0.0,
            difference=(req.approved_amount or 80000.0) - (req.disbursed_amount or 70000.0),
            bank_name=req.bank_name or "State Bank of India",
            language="en"
        )
    else: # msp
        exp = (req.quantity_quintals or 50.0) * (req.msp_rate or 2300.0)
        script_hi = generate_msp_script(
            crop=req.crop or "Paddy",
            quantity_quintals=req.quantity_quintals or 50.0,
            msp_rate=req.msp_rate or 2300.0,
            expected_payment=exp,
            actual_payment=req.actual_payment or 105000.0,
            difference=exp - (req.actual_payment or 105000.0),
            procurement_center=req.procurement_center or "Patan Krishi Upaj Mandi",
            language="hi"
        )
        script_en = generate_msp_script(
            crop=req.crop or "Paddy",
            quantity_quintals=req.quantity_quintals or 50.0,
            msp_rate=req.msp_rate or 2300.0,
            expected_payment=exp,
            actual_payment=req.actual_payment or 105000.0,
            difference=exp - (req.actual_payment or 105000.0),
            procurement_center=req.procurement_center or "Patan Krishi Upaj Mandi",
            language="en"
        )

    return {
        "check_type": req.check_type,
        "selected_language": req.language,
        "active_script": script_hi if req.language == "hi" else script_en,
        "hi": script_hi,
        "en": script_en,
    }

@router.post("/synthesize")
def synthesize_audio(req: SynthesizeRequest):
    """
    Synthesize audio using gTTS and cache by SHA256 of text+language.
    Returns audio/mpeg stream.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    lang_code = "hi" if req.language.lower().startswith("hi") else "en"
    cache_key = hashlib.sha256(f"{lang_code}:{req.text.strip()}".encode("utf-8")).hexdigest()
    cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")

    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 0:
        return FileResponse(cache_path, media_type="audio/mpeg", headers={"X-Cache": "HIT"})

    try:
        from gtts import gTTS
        tts = gTTS(text=req.text.strip(), lang=lang_code, slow=False)
        tts.save(cache_path)
        return FileResponse(cache_path, media_type="audio/mpeg", headers={"X-Cache": "MISS"})
    except Exception as e:
        print(f"TTS synthesis notice: {e}. Client should use Web Speech API fallback.")
        # Return fallback status so client uses in-browser speechSynthesis
        raise HTTPException(
            status_code=503,
            detail=f"TTS server offline or unreachable ({e}). Please use client Web Speech API."
        )
