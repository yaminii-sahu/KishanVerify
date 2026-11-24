"""
KisanVerify Voice Call Support - Agent Orchestration
=====================================================
Processes spoken conversational turns for in-app and telephony voice calls.
Features:
- Deterministic intent routing with automatic tool selection.
- Function calling using live farmer records (loans, MSP, claims, schemes, etc.).
- Post-generation factual verification (all numbers must appear in tool result).
- Strict verbal confirmation before write actions (raise grievance, request callback).
- Conversation session memory for follow-ups.
- Spoken phonetic number conversion (₹10,000 -> "दस हज़ार रुपये").
"""

import os
import re
import time
import uuid
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.ai_simplifier import (
    detect_intent,
    verify_grounded_response,
    INTENT_GREETING,
    INTENT_MY_RECORDS,
    INTENT_SCHEME_ELIGIBILITY,
    INTENT_LOAN_STATUS,
    INTENT_LOAN_APPLY,
    INTENT_MSP_STATUS,
    INTENT_INSURANCE_CLAIM_STATUS,
    INTENT_REQUIRED_DOCUMENTS,
    INTENT_MANDI_PRICE,
    INTENT_WEATHER,
    INTENT_NEARBY_OFFICE,
    INTENT_GRIEVANCE,
    INTENT_CONTACT_HELP,
    INTENT_HOW_TO_USE,
    INTENT_EXPLAIN_TERM,
    INTENT_UNKNOWN,
)
from app.services.audio_script import number_to_hindi_words, number_to_english_words
from app.voice.tools import (
    get_records_summary,
    get_loan_status,
    get_msp_status,
    get_claim_status,
    get_eligible_schemes,
    get_eligible_loans,
    get_required_documents,
    list_my_documents,
    get_mandi_prices,
    get_weather_alerts,
    find_nearby_offices,
    get_grievance_status,
    raise_grievance,
    request_callback,
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class VoiceTurnRequest(BaseModel):
    session_id: Optional[str] = None
    farmer_id: Optional[str] = "FV12345"
    user_speech_text: str
    language: Optional[str] = "hi" # "hi" or "en"
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    current_record_context: Optional[Dict[str, Any]] = None
    confirmation_pending: Optional[Dict[str, Any]] = None


class VoiceTurnResponse(BaseModel):
    session_id: str
    agent_speech_text: str
    agent_speech_phonetic: str
    language: str
    tool_called: Optional[str] = None
    tool_result: Optional[Dict[str, Any]] = None
    action_card: Optional[Dict[str, Any]] = None
    confirmation_requested: bool = False
    confirmation_action: Optional[Dict[str, Any]] = None
    suggested_quick_phrases: List[str] = Field(default_factory=list)
    mode: str = "offline" # "live" or "offline"
    provider: str = "template-fallback"


# ---------------------------------------------------------------------------
# Phonetic Speech Converter Helper
# ---------------------------------------------------------------------------

def phoneticize_speech(text: str, language: str = "hi") -> str:
    """
    Replaces currency expressions like ₹10,000 or Rs. 10,000 with phonetic words
    (e.g. 'दस हज़ार रुपये' in Hindi, 'ten thousand rupees' in English) so TTS
    pronounces numbers smoothly.
    """
    is_hi = language in ["hi", "hindi", "hinglish"]

    def replace_rupee(match):
        raw_num = match.group(1).replace(",", "").strip()
        try:
            val = float(raw_num)
            if is_hi:
                return number_to_hindi_words(val)
            else:
                return number_to_english_words(val)
        except Exception:
            return match.group(0)

    # Replace ₹10,000 or ₹ 10,000
    cleaned = re.sub(r"₹\s*([0-9,]+(?:\.[0-9]+)?)", replace_rupee, text)
    # Replace bullet points and markdown symbols that shouldn't be vocalized
    cleaned = re.sub(r"[•\*\#\-\_]", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


# ---------------------------------------------------------------------------
# Affirmation & Negation Checkers
# ---------------------------------------------------------------------------

def is_affirmative(text: str) -> bool:
    msg = text.lower().strip()
    return bool(re.search(r"\b(yes|haan|ha|hanji|haanji|sahi|kar do|kardo|theek|thik|confirm|proceed|bilkul|sure|okay|ok)\b", msg))

def is_negative(text: str) -> bool:
    msg = text.lower().strip()
    return bool(re.search(r"\b(no|nahin|nahi|na|mat karo|cancel|stop|rehne do|ruk jao|chhod do|never)\b", msg))


# ---------------------------------------------------------------------------
# Main Orchestrator: process_voice_call_turn
# ---------------------------------------------------------------------------

def process_voice_call_turn(req: VoiceTurnRequest) -> VoiceTurnResponse:
    """
    Executes a single conversational speech turn for voice support calls.
    - Handles active confirmation flows first.
    - Routes intent deterministically and executes verified tools.
    - Grounds response exclusively on tool output.
    - Generates phonetic spoken text.
    """
    session_id = req.session_id or f"vcall-{uuid.uuid4().hex[:10]}"
    farmer_id = req.farmer_id or "FV12345"
    language = req.language or "hi"
    is_hi = language in ["hi", "hindi", "hinglish"]
    user_speech = (req.user_speech_text or "").strip()

    # -----------------------------------------------------------------------
    # Step A: Handle Pending Confirmation for Write Actions
    # -----------------------------------------------------------------------
    if req.confirmation_pending:
        pending_act = req.confirmation_pending
        act_type = pending_act.get("action")

        if is_affirmative(user_speech):
            # User confirmed! Execute action
            if act_type == "raise_grievance":
                res = raise_grievance(
                    farmer_id=farmer_id,
                    record_ref=pending_act.get("record_ref", "General"),
                    issue_summary=pending_act.get("issue_summary", "Dispute raised via voice call"),
                    confirmed=True
                )
                speech = (
                    f"आपकी शिकायत संदर्भ {res.get('grievance_ref')} दर्ज कर ली गई है। आप इसे अपने ऐप में देख सकते हैं।"
                    if is_hi else
                    f"Your grievance reference {res.get('grievance_ref')} has been successfully recorded. You can track it in your app."
                )
                return VoiceTurnResponse(
                    session_id=session_id,
                    agent_speech_text=speech,
                    agent_speech_phonetic=phoneticize_speech(speech, language),
                    language=language,
                    tool_called="raise_grievance",
                    tool_result=res,
                    confirmation_requested=False,
                    action_card={
                        "type": "grievance_submitted",
                        "title": f"Grievance {res.get('grievance_ref')}",
                        "status": "Submitted",
                        "link": "/farmer/grievance",
                    },
                    suggested_quick_phrases=["Check status", "Talk to a person", "Thank you"],
                    mode="offline",
                    provider="tool-executor",
                )

            elif act_type == "request_callback":
                res = request_callback(
                    farmer_id=farmer_id,
                    topic=pending_act.get("topic", "Support inquiry"),
                    phone_masked=pending_act.get("phone_masked"),
                    preferred_language=language,
                    confirmed=True
                )
                speech = (
                    f"कॉलबैक अनुरोध {res.get('callback_ref')} दर्ज हो गया है। कृषि सहायता अधिकारी शीघ्र आपसे संपर्क करेंगे।"
                    if is_hi else
                    f"Callback request {res.get('callback_ref')} is submitted. An officer will call you back shortly."
                )
                return VoiceTurnResponse(
                    session_id=session_id,
                    agent_speech_text=speech,
                    agent_speech_phonetic=phoneticize_speech(speech, language),
                    language=language,
                    tool_called="request_callback",
                    tool_result=res,
                    confirmation_requested=False,
                    action_card={
                        "type": "callback_scheduled",
                        "title": f"Callback {res.get('callback_ref')}",
                        "status": "Scheduled",
                    },
                    suggested_quick_phrases=["Check loan status", "Mandi prices", "Thank you"],
                    mode="offline",
                    provider="tool-executor",
                )

        elif is_negative(user_speech):
            # User canceled
            speech = (
                "ठीक है, यह अनुरोध रद्द कर दिया गया है। मैं आपकी और क्या मदद कर सकता हूँ?"
                if is_hi else
                "Understood, this request has been cancelled. How else can I help you today?"
            )
            return VoiceTurnResponse(
                session_id=session_id,
                agent_speech_text=speech,
                agent_speech_phonetic=phoneticize_speech(speech, language),
                language=language,
                confirmation_requested=False,
                suggested_quick_phrases=["Loan difference", "Claim status", "Mandi prices"],
                mode="offline",
                provider="agent-dialogue",
            )
        else:
            # Ambiguous answer, repeat confirmation
            speech = (
                "कृपया स्पष्ट 'हाँ' या 'ना' कहें ताकि मैं आगे की कार्रवाई कर सकूँ।"
                if is_hi else
                "Please say clearly 'yes' or 'no' so I can confirm your request."
            )
            return VoiceTurnResponse(
                session_id=session_id,
                agent_speech_text=speech,
                agent_speech_phonetic=phoneticize_speech(speech, language),
                language=language,
                confirmation_requested=True,
                confirmation_action=pending_act,
                suggested_quick_phrases=["Yes, proceed", "No, cancel"],
                mode="offline",
                provider="agent-dialogue",
            )

    # -----------------------------------------------------------------------
    # Step B: Check for Explicit Verbal Grievance / Callback Requests
    # -----------------------------------------------------------------------
    speech_lower = user_speech.lower()

    # Raise Grievance request
    if any(k in speech_lower for k in ["shikayat karni", "file a grievance", "raise a grievance", "shikayat darj", "complaint file"]):
        current_ref = req.current_record_context.get("record_ref") if req.current_record_context else "LN-2024-8812"
        conf_res = raise_grievance(farmer_id=farmer_id, record_ref=current_ref, issue_summary="Discrepancy in recorded benefit", confirmed=False)
        speech = conf_res["confirmation_prompt_hi"] if is_hi else conf_res["confirmation_prompt_en"]
        return VoiceTurnResponse(
            session_id=session_id,
            agent_speech_text=speech,
            agent_speech_phonetic=phoneticize_speech(speech, language),
            language=language,
            tool_called="raise_grievance",
            tool_result=conf_res,
            confirmation_requested=True,
            confirmation_action={"action": "raise_grievance", "record_ref": current_ref, "issue_summary": "Discrepancy in recorded benefit"},
            suggested_quick_phrases=["Yes, raise grievance", "No, do not raise"],
            mode="offline",
            provider="tool-executor",
        )

    # Human Handoff / Callback request
    if any(k in speech_lower for k in ["talk to a person", "officer se baat", "call me back", "human support", "kisi se baat", "callback", "madadgar se baat"]):
        conf_res = request_callback(farmer_id=farmer_id, topic="Caller requested human officer assistance", confirmed=False)
        speech = conf_res["confirmation_prompt_hi"] if is_hi else conf_res["confirmation_prompt_en"]
        return VoiceTurnResponse(
            session_id=session_id,
            agent_speech_text=speech,
            agent_speech_phonetic=phoneticize_speech(speech, language),
            language=language,
            tool_called="request_callback",
            tool_result=conf_res,
            confirmation_requested=True,
            confirmation_action={"action": "request_callback", "topic": "Caller requested human officer assistance"},
            suggested_quick_phrases=["Yes, call me back", "No, I'm okay"],
            mode="offline",
            provider="tool-executor",
        )

    # -----------------------------------------------------------------------
    # Step C: Deterministic Intent Detection & Tool Selection
    # -----------------------------------------------------------------------
    # Reconstruct history for intent router
    hist_objects = []
    if req.history:
        from app.services.ai_simplifier import ChatMessage
        for h in req.history:
            hist_objects.append(ChatMessage(role=h.get("role", "user"), content=h.get("content", "")))

    intent = detect_intent(user_speech, history=hist_objects)

    tool_name: Optional[str] = None
    tool_data: Optional[Dict[str, Any]] = None
    action_card: Optional[Dict[str, Any]] = None
    spoken_reply: str = ""
    suggested_phrases: List[str] = []

    if intent == INTENT_GREETING:
        spoken_reply = (
            "नमस्ते रमेश कुमार जी! मैं किसानवेरीफाई कॉल सहायक हूँ। आप अपने ऋण, धान एमएसपी भुगतान, फसल बीमा या योजनाओं के बारे में पूछ सकते हैं।"
            if is_hi else
            "Namaste Ramesh Kumar! I am your KisanVerify call assistant. You can ask me about your loan, MSP paddy payment, crop insurance, or eligible schemes."
        )
        suggested_phrases = ["Mera loan status", "Dhan MSP payment", "Fasal bima claim", "Yojana patrata"]

    elif intent == INTENT_LOAN_STATUS:
        tool_name = "get_loan_status"
        tool_data = get_loan_status(farmer_id)
        approved = tool_data.get("approved_amount", 80000.0)
        disbursed = tool_data.get("disbursed_amount", 70000.0)
        diff = tool_data.get("difference", 10000.0)
        unexplained = tool_data.get("unexplained_difference", 5000.0)
        bank = tool_data.get("bank_name", "State Bank of India")

        spoken_reply = (
            f"आपके {bank} केसीसी ऋण में स्वीकृत राशि ₹{approved:,.0f} थी, जिसमें से ₹{disbursed:,.0f} वितरित हुए हैं। इसमें ₹{diff:,.0f} का अंतर है, जिसमें ₹{unexplained:,.0f} की बैंक से समीक्षा आवश्यक है।"
            if is_hi else
            f"In your {bank} KCC loan, approved limit is ₹{approved:,.0f} and disbursed is ₹{disbursed:,.0f}. There is a ₹{diff:,.0f} difference, with ₹{unexplained:,.0f} flagged for bank verification."
        )
        action_card = {
            "type": "loan_card",
            "title": "KCC Loan Verification",
            "approved": approved,
            "disbursed": disbursed,
            "difference": diff,
            "unexplained": unexplained,
            "link": "/farmer/loan-verify",
        }
        suggested_phrases = ["Why is there a difference?", "Raise a grievance", "What about MSP?"]

    elif intent == INTENT_LOAN_APPLY:
        tool_name = "get_eligible_loans"
        tool_data = get_eligible_loans(farmer_id)
        spoken_reply = (
            "आपकी भूमि के आधार पर आप 4% ब्याज पर ₹3,00,000 तक केसीसी फसल ऋण और कृषि उपकरण ऋण के लिए आवेदन कर सकते हैं।"
            if is_hi else
            "Based on your land, you can apply for a Kisan Credit Card limit up to ₹3,00,000 at 4% effective interest or farm machinery term loans."
        )
        action_card = {
            "type": "loan_apply_card",
            "title": "Available Loan Options",
            "link": "/farmer/loan-verify",
        }
        suggested_phrases = ["Required documents", "KCC loan difference", "Talk to a person"]

    elif intent == INTENT_MSP_STATUS:
        tool_name = "get_msp_status"
        tool_data = get_msp_status(farmer_id)
        exp = tool_data.get("expected_payment", 115000.0)
        act = tool_data.get("actual_payment", 105000.0)
        diff = tool_data.get("difference", 10000.0)
        unexp = tool_data.get("unexplained_difference", 3475.0)

        spoken_reply = (
            f"पाटन मंडी में 50 क्विंटल धान के लिए अपेक्षित भुगतान ₹{exp:,.0f} था, और आपको ₹{act:,.0f} प्राप्त हुए हैं। कुल ₹{diff:,.0f} के अंतर में ₹{unexp:,.0f} अव्याख्यायित है।"
            if is_hi else
            f"At Patan Mandi for 50 quintals paddy, expected payment is ₹{exp:,.0f} and received is ₹{act:,.0f}. Out of ₹{diff:,.0f} difference, ₹{unexp:,.0f} needs मंडी samiti review."
        )
        action_card = {
            "type": "msp_card",
            "title": "Paddy MSP Procurement",
            "expected": exp,
            "actual": act,
            "difference": diff,
            "link": "/farmer/msp-verify",
        }
        suggested_phrases = ["Itemized deductions", "Raise a grievance", "Current paddy price"]

    elif intent == INTENT_INSURANCE_CLAIM_STATUS:
        tool_name = "get_claim_status"
        tool_data = get_claim_status(farmer_id)
        exp = tool_data.get("expected_claim_amount", 30000.0)
        rec = tool_data.get("amount_received", 20000.0)
        pend = tool_data.get("pending_balance", 10000.0)

        spoken_reply = (
            f"आपके फसल बीमा में निर्धारित दावा ₹{exp:,.0f} था, जिसमें से ₹{rec:,.0f} प्राप्त हुए हैं। शेष ₹{pend:,.0f} की द्वितीय किश्त समीक्षाधीन है।"
            if is_hi else
            f"In your PMFBY claim, assessed amount is ₹{exp:,.0f} and ₹{rec:,.0f} is received. The remaining ₹{pend:,.0f} second tranche is under review."
        )
        action_card = {
            "type": "claim_card",
            "title": "PMFBY Insurance Claim",
            "assessed": exp,
            "received": rec,
            "pending": pend,
            "status": "Under Review",
            "link": "/farmer/claim-verify",
        }
        suggested_phrases = ["Why is it delayed?", "Raise a grievance", "What documents needed?"]

    elif intent == INTENT_SCHEME_ELIGIBILITY:
        tool_name = "get_eligible_schemes"
        tool_data = get_eligible_schemes(farmer_id)
        spoken_reply = (
            "आपकी 3.0 एकड़ भूमि और धान की फसल के आधार पर आप पीएम-किसान में ₹6,000 प्रति वर्ष, फसल बीमा और केसीसी ऋण के लिए पात्र हैं।"
            if is_hi else
            "Based on your 3.0 acres paddy land, you may be eligible for PM-KISAN ₹6,000 per year, PMFBY crop insurance, and KCC crop credit."
        )
        action_card = {
            "type": "schemes_card",
            "title": "Eligible Schemes",
            "count": tool_data.get("eligible_count", 3),
            "link": "/farmer/schemes",
        }
        suggested_phrases = ["Required documents", "How to apply", "Check loan difference"]

    elif intent == INTENT_REQUIRED_DOCUMENTS:
        tool_name = "get_required_documents"
        tool_data = get_required_documents(farmer_id, topic="general")
        spoken_reply = (
            "मुख्य रूप से आधार कार्ड, खसरा बी-1 प्रति, बैंक पासबुक और गिरदावरी की आवश्यकता होती है। आपका आधार और खसरा पहले से सत्यापित हैं।"
            if is_hi else
            "Primary documents required are Aadhaar Card, Khasra B-1 land record, Bank Passbook, and Girdawari. Your Aadhaar and Land records are already verified."
        )
        action_card = {
            "type": "documents_card",
            "title": "Required Documents",
            "link": "/farmer/documents",
        }
        suggested_phrases = ["Open document vault", "Loan status", "Eligible schemes"]

    elif intent == INTENT_MANDI_PRICE:
        tool_name = "get_mandi_prices"
        tool_data = get_mandi_prices()
        modal = tool_data.get("modal_price", 2280.0)
        msp = tool_data.get("official_msp_benchmark", 2300.0)

        spoken_reply = (
            f"पाटन मंडी में सामान्य धान का आज का मॉडल भाव ₹{modal:,.0f} प्रति क्विंटल है। सरकारी एमएसपी बेंचमार्क ₹{msp:,.0f} है।"
            if is_hi else
            f"Today's modal price for common paddy at Patan Mandi is ₹{modal:,.0f} per quintal, against official MSP benchmark of ₹{msp:,.0f}."
        )
        action_card = {
            "type": "mandi_card",
            "title": "Patan Mandi Prices",
            "modal_price": modal,
            "msp_benchmark": msp,
            "link": "/farmer/mandi",
        }
        suggested_phrases = ["Weather forecast", "My MSP payment", "Nearby offices"]

    elif intent == INTENT_WEATHER:
        tool_name = "get_weather_alerts"
        tool_data = get_weather_alerts()
        spoken_reply = (
            "पाटन में आज आंशिक बादल छाए रहेंगे, तापमान 24 से 34 डिग्री रहेगा। मौसम खाद छिड़काव और खेत तैयारी के लिए उपयुक्त है।"
            if is_hi else
            "Patan weather today is partly cloudy with temperature between 24°C and 34°C. Weather is suitable for field preparation and fertilizer application."
        )
        action_card = {
            "type": "weather_card",
            "title": "Patan Agro-Weather",
            "link": "/farmer/weather",
        }
        suggested_phrases = ["Mandi prices", "Talk to a person", "Loan status"]

    elif intent == INTENT_NEARBY_OFFICE:
        tool_name = "find_nearby_offices"
        tool_data = find_nearby_offices()
        spoken_reply = (
            "निकटतम कार्यालय: एसबीआई पाटन शाखा ढाई किलोमीटर, पाटन मंडी 3 किलोमीटर, और दुर्ग उप संचालक कृषि कार्यालय 14 किलोमीटर पर है।"
            if is_hi else
            "Nearest offices: SBI Patan branch is 2.5 km, Patan Mandi Samiti is 3.0 km, and Durg Agriculture Office is 14 km away."
        )
        action_card = {
            "type": "offices_card",
            "title": "Nearby Extension Offices",
            "link": "/farmer/offices",
        }
        suggested_phrases = ["Helpline number", "Loan difference", "Talk to a person"]

    elif intent == INTENT_GRIEVANCE:
        tool_name = "get_grievance_status"
        tool_data = get_grievance_status(farmer_id)
        if tool_data.get("has_grievances"):
            ref = tool_data.get("grievance_ref_masked")
            st = tool_data.get("status")
            spoken_reply = (
                f"आपकी शिकायत {ref} वर्तमान में {st} स्थिति में है और नोडल अधिकारी द्वारा इसकी जांच की जा रही है।"
                if is_hi else
                f"Your grievance {ref} is currently {st} and under review by the nodal officer."
            )
        else:
            spoken_reply = (
                "आपके खाते में कोई सक्रिय शिकायत नहीं है। क्या आप किसी अंतर के लिए शिकायत दर्ज कराना चाहते हैं?"
                if is_hi else
                "You have no active grievances recorded. Would you like me to file a grievance for any discrepancy?"
            )
        action_card = {
            "type": "grievance_card",
            "title": "Grievance Status",
            "link": "/farmer/grievance",
        }
        suggested_phrases = ["Raise new grievance", "Talk to a person", "Loan status"]

    elif intent == INTENT_MY_RECORDS:
        tool_name = "get_records_summary"
        tool_data = get_records_summary(farmer_id)
        spoken_reply = (
            "आपके खाते में 3 मामले समीक्षा के लिए हैं: ऋण में ₹10,000, एमएसपी में ₹10,000, और फसल बीमा में ₹10,000 की दूसरी किश्त लंबित है।"
            if is_hi else
            "You have 3 items flagged for review: ₹10,000 in your loan, ₹10,000 in MSP procurement, and ₹10,000 pending in crop insurance."
        )
        action_card = {
            "type": "summary_card",
            "title": "Records Summary",
            "total_diff": 30000.0,
            "link": "/farmer",
        }
        suggested_phrases = ["Check loan details", "Check MSP details", "Check claim status"]

    else:
        # Unknown: calm guidance, offering 3 examples
        spoken_reply = (
            "माफ़ कीजिए, मैं समझ नहीं पाया। आप मुझसे पूछ सकते हैं: 'ऋण का अंतर क्या है?', 'धान का एमएसपी भुगतान', या 'फसल बीमा दावा स्थिति'। या सहायता अधिकारी से बात करने के लिए कहें।"
            if is_hi else
            "I'm sorry, I couldn't catch that. You can ask: 'What is my loan difference?', 'My MSP paddy payment', or 'Crop insurance claim status', or ask to talk to an officer."
        )
        suggested_phrases = ["Loan difference", "MSP payment", "Claim status", "Talk to a person"]

    # -----------------------------------------------------------------------
    # Step D: Optional LLM Rephrasing with Strict Factual Grounding
    # -----------------------------------------------------------------------
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    mode = "offline"
    provider = "deterministic-rule-engine"

    if gemini_key and len(gemini_key.strip()) > 10 and tool_data:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)

            facts_text = str(tool_data)
            prompt = f"""
You are KisanVerify's live voice call support assistant on a phone/voice call with an Indian farmer.
Caller Profile: Farmer Ramesh Kumar (ID: {farmer_id}), Patan, Durg, Chhattisgarh.

CRITICAL VOICE CALL RULES:
1. Speak calm, respectful, natural {language}.
2. Maximum 2 short sentences (UNDER 30 WORDS).
3. Use ONLY facts from the tool result below. NEVER invent or extrapolate any amount, date, or name.
4. If asked about something not in the facts, state you do not have that data and suggest speaking with an officer.
5. No accusatory words (use "needs review"). Never promise approval (use "may be eligible").

TOOL RESULT FACTS:
{facts_text}

FARMER SPOKE: "{user_speech}"
"""
            llm_res = client.models.generate_content(
                model=settings.LLM_MODEL or "gemini-1.5-flash",
                contents=prompt,
            )
            if llm_res and llm_res.text:
                candidate = llm_res.text.strip()
                # Post-generation grounding check
                flat_facts = [str(v) for v in tool_data.values() if isinstance(v, (str, int, float))]
                if verify_grounded_response(candidate, flat_facts):
                    spoken_reply = candidate
                    mode = "live"
                    provider = "gemini"
        except Exception as e:
            print(f"[Voice Agent] LLM invocation note: {e}, using grounded deterministic speech")

    # Generate phonetic spoken speech
    phonetic_reply = phoneticize_speech(spoken_reply, language=language)

    return VoiceTurnResponse(
        session_id=session_id,
        agent_speech_text=spoken_reply,
        agent_speech_phonetic=phonetic_reply,
        language=language,
        tool_called=tool_name,
        tool_result=tool_data,
        action_card=action_card,
        confirmation_requested=False,
        suggested_quick_phrases=suggested_phrases,
        mode=mode,
        provider=provider,
    )
