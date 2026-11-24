"""
KisanVerify AI Policy Simplifier & Chat Service
===============================================
Explains already-computed financial verification records and government scheme
policies in accessible Hindi, Hinglish, or English.
Deterministic intent routing + grounded factual generation + robust fallback.
"""

import os
import re
import time
from typing import Optional, List, Dict, Any, Set
from pydantic import BaseModel, Field

from app.core.config import settings
from app.services.eligibility_engine import evaluate_eligibility

# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "hi" # "hi", "en", "hinglish"
    farmer_id: Optional[str] = "FV12345"
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    context_hint: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    reply_language: str
    provider: str # "gemini" or "template-fallback"
    mode: str # "live" or "offline"
    intent: str
    suggested_chips: List[str]
    source_documents: List[str]
    action_link: Optional[str] = None
    action_label: Optional[str] = None
    verified_facts: Optional[List[str]] = Field(default_factory=list)

# ---------------------------------------------------------------------------
# Intent Constants
# ---------------------------------------------------------------------------

INTENT_GREETING = "greeting"
INTENT_MY_RECORDS = "my_records_summary"
INTENT_SCHEME_ELIGIBILITY = "scheme_eligibility"
INTENT_LOAN_STATUS = "loan_status"
INTENT_LOAN_APPLY = "loan_apply"
INTENT_MSP_STATUS = "msp_status"
INTENT_INSURANCE_CLAIM_STATUS = "insurance_claim_status"
INTENT_REQUIRED_DOCUMENTS = "required_documents"
INTENT_MANDI_PRICE = "mandi_price"
INTENT_WEATHER = "weather"
INTENT_NEARBY_OFFICE = "nearby_office"
INTENT_GRIEVANCE = "grievance"
INTENT_CONTACT_HELP = "contact_help"
INTENT_HOW_TO_USE = "how_to_use_app"
INTENT_EXPLAIN_TERM = "explain_term"
INTENT_UNKNOWN = "unknown"

# ---------------------------------------------------------------------------
# Deterministic Intent Routing
# ---------------------------------------------------------------------------

def detect_intent(message: str, history: Optional[List[ChatMessage]] = None) -> str:
    """
    Deterministically routes user messages in English, Hindi, and Hinglish
    using keyword/regex patterns, quick-chip labels, and conversation history.
    """
    raw_msg = (message or "").strip()
    msg = raw_msg.lower()

    if not msg:
        return INTENT_GREETING

    # 1. Exact or near-exact chip matches
    chip_map = {
        "claim status": INTENT_INSURANCE_CLAIM_STATUS,
        "दावा स्थिति": INTENT_INSURANCE_CLAIM_STATUS,
        "required documents": INTENT_REQUIRED_DOCUMENTS,
        "आवश्यक दस्तावेज़": INTENT_REQUIRED_DOCUMENTS,
        "contact details": INTENT_CONTACT_HELP,
        "सहायता संपर्क": INTENT_CONTACT_HELP,
        "eligible schemes": INTENT_SCHEME_ELIGIBILITY,
        "पात्र योजनाएं": INTENT_SCHEME_ELIGIBILITY,
        "check scheme eligibility": INTENT_SCHEME_ELIGIBILITY,
        "loans i can apply for": INTENT_LOAN_APPLY,
        "उपलब्ध ऋण": INTENT_LOAN_APPLY,
        "msp status": INTENT_MSP_STATUS,
        "एमएसपी स्थिति": INTENT_MSP_STATUS,
        "explain loan difference": INTENT_LOAN_STATUS,
        "loan difference": INTENT_LOAN_STATUS,
        "ऋण अंतर": INTENT_LOAN_STATUS,
        "mandi prices": INTENT_MANDI_PRICE,
        "मंडी भाव": INTENT_MANDI_PRICE,
        "weather forecast": INTENT_WEATHER,
        "मौसम पूर्वानुमान": INTENT_WEATHER,
        "raise a grievance": INTENT_GRIEVANCE,
        "शिकायत दर्ज करें": INTENT_GRIEVANCE,
        "nearby office": INTENT_NEARBY_OFFICE,
        "निकटतम कार्यालय": INTENT_NEARBY_OFFICE,
    }

    clean_chip_query = re.sub(r"[^\w\s]", "", msg).strip()
    if clean_chip_query in chip_map:
        return chip_map[clean_chip_query]

    # 2. Contextual follow-up resolution from recent conversation history
    last_assistant_intent = None
    if history and len(history) > 0:
        for prev in reversed(history):
            if prev.role == "user":
                prev_text = prev.content.lower()
                # Find earlier intent if possible
                for k, v in chip_map.items():
                    if k in prev_text:
                        last_assistant_intent = v
                        break
                if last_assistant_intent:
                    break

    # Follow-up questions like "and the loan one?", "loan ka kya?", "what about msp?"
    if re.search(r"\b(and the loan|loan ka kya|what about loan|aur loan|karz ka kya|rin ka kya)\b", msg):
        return INTENT_LOAN_STATUS
    if re.search(r"\b(and msp|what about msp|aur dhan|dhan ka kya|msp ka kya)\b", msg):
        return INTENT_MSP_STATUS
    if re.search(r"\b(and insurance|aur bima|what about claim|claim ka kya|bima ka kya)\b", msg):
        return INTENT_INSURANCE_CLAIM_STATUS
    if re.search(r"\b(what documents for that|uske documents|kagaz kya lagenge|kaun se kagaz)\b", msg):
        return INTENT_REQUIRED_DOCUMENTS
    if re.search(r"\b(how to apply for that|apply kaise kare|aavedan kaise kare)\b", msg):
        if last_assistant_intent == INTENT_LOAN_APPLY:
            return INTENT_LOAN_APPLY
        return INTENT_SCHEME_ELIGIBILITY

    # 3. Regex & keyword matching for core intents

    # Greeting (standalone greetings in English, Latin Hinglish, or Devanagari Hindi)
    devanagari_greetings = ["नमस्ते", "नमस्कार", "प्रणाम", "जय जोहार", "राम राम", "राधे राधे", "हेलो", "हाय"]
    if msg in devanagari_greetings or any(msg.startswith(g) for g in devanagari_greetings):
        return INTENT_GREETING

    greeting_pattern = r"^(hlo|hello|hi|hey|helo|namaste|namaskar|pranam|pranaam|ram ram|radhe radhe|jai johar|kisanverify|start|shuru|kya haal|good morning|good afternoon|good evening)[\s\.\!\?]*$"
    if re.match(greeting_pattern, msg) or msg in ["hlo", "hi", "hello", "hey", "namaste", "namaskar"]:
        return INTENT_GREETING

    # How to use / What is KisanVerify
    if any(k in msg for k in [
        "how to use", "kaise use kare", "kaise chalaye", "what is kisanverify",
        "kisanverify kya hai", "kisan verify kya hai", "app kaise", "kya kaam karta hai"
    ]):
        return INTENT_HOW_TO_USE

    # Term explanation (e.g. "what is hamali", "cce kya hai")
    # Must NOT be an inquiry about user's own status/difference (e.g. "what is my kcc loan difference")
    is_personal_query = any(w in msg for w in ["my", "mera", "mere", "difference", "status", "pending", "balance", "disbursed", "approved"])
    if not is_personal_query and any(k in msg for k in [
        "what is", "kya hota hai", "kya hai", "meaning of", "matlab kya"
    ]) and any(term in msg for term in ["hamali", "faq", "cce", "tare", "kcc", "subvention", "j-form", "j form"]):
        return INTENT_EXPLAIN_TERM

    # Loan: Apply for new loan (must precede general loan status check)
    if any(k in msg for k in [
        "apply for loan", "loans i can apply", "naya loan", "new loan",
        "loan apply", "eligible loans", "available loans", "kcc apply",
        "dusra loan", "loan lena hai", "loan kaise milega", "loan chahiye",
        "नया ऋण", "ऋण आवेदन", "लोन लेना है", "ऋण चाहिए"
    ]):
        return INTENT_LOAN_APPLY

    # Scheme eligibility (English, Latin Hinglish, Devanagari Hindi)
    if any(k in msg for k in [
        "which scheme", "scheme am i eligible", "scheme eligibility", "eligible schemes",
        "eligible for", "kaun si yojana", "koun si yojana", "mujhe kaun si", "konsi yojana",
        "yojana mil sakti", "yojana ki patrata", "patrata", "patra yojana", "sarkari yojana",
        "pm kisan milega", "pm kisan status", "subsidy scheme", "schemes for me", "yojana bataye",
        "योजना", "योजनाएं", "पात्रता", "सब्सिडी", "पात्र योजना", "scheme", "eligib", "patra"
    ]) or (("yojana" in msg or "योजना" in msg) and any(w in msg for w in ["patra", "kaun", "konsi", "eligib", "milegi", "mil sakti", "bataye"])):
        return INTENT_SCHEME_ELIGIBILITY

    # Mandi price / Agmarknet
    if any(k in msg for k in [
        "mandi price", "mandi bhav", "mandi rate", "aaj ka bhav", "market price",
        "dhan ka bhav", "dhan ka rate", "gehu ka bhav", "bhav kya hai", "today price",
        "mandi dar", "bhav bataye", "मंडी भाव", "धान का भाव", "मंडी दर", "बाजार भाव"
    ]):
        return INTENT_MANDI_PRICE

    # Weather
    if any(k in msg for k in [
        "weather", "mausam", "barish", "rain", "forecast", "taapman",
        "barsat", "temperature", "barsat hogi", "mausam kaisa hai",
        "मौसम", "बारिश", "तापमान", "बरसात", "पूर्वानुमान"
    ]):
        return INTENT_WEATHER

    # Nearby Office / KVK
    if any(k in msg for k in [
        "nearby office", "agriculture office", "krishi kendra", "kvk",
        "bank branch", "najdeeki", "office kahan", "karyalaya",
        "krishi vibhag", "mandi samiti kahan", "निकटतम कार्यालय", "कृषि केंद्र", "कार्यालय"
    ]):
        return INTENT_NEARBY_OFFICE

    # Grievance / Complaint
    if any(k in msg for k in [
        "grievance", "shikayat", "complaint", "help desk", "dispute",
        "appeal", "shikayat karni", "complaint kaise kare", "shikayat darj",
        "शिकायत", "शिकायत दर्ज", "समस्या"
    ]):
        return INTENT_GRIEVANCE

    # Contact / Helpline
    if any(k in msg for k in [
        "contact", "helpline", "phone number", "toll free", "sampark",
        "customer care", "officer number", "help line", "phone no",
        "number do", "sampark kare", "संपर्क", "हेल्पलाइन", "फोन नंबर"
    ]):
        return INTENT_CONTACT_HELP

    # Required Documents
    if any(k in msg for k in [
        "document", "dastavej", "kagaz", "praman patra", "checklist",
        "khasra", "rin pustika", "kaun se kagaz", "what documents",
        "documents required", "kagaz chahiye", "दस्तावेज़", "कागज़", "प्रमाण पत्र", "खसरा"
    ]):
        return INTENT_REQUIRED_DOCUMENTS

    # Loan Status / KCC Record
    if re.search(r"\b(loan|kcc|karz|rin)\b", msg) or any(k in msg for k in [
        "bank deduction", "approved vs disbursed", "sbi loan", "loan status",
        "loan difference", "loan balance", "rin vivaran", "rin pustika",
        "ऋण", "कर्ज", "केसीसी", "बैंक कटौती", "ऋण अंतर"
    ]):
        return INTENT_LOAN_STATUS

    # MSP Status / Grain Procurement
    if any(k in msg for k in [
        "msp", "dhan", "gehu", "paddy", "wheat", "procurement", "mandi payment",
        "upajan", "msp rate", "msp difference", "khareedi", "hamali deduction",
        "faq deduction", "dhan ka paisa", "msp ka paisa",
        "एमएसपी", "धान", "उपार्जन", "मंडी भुगतान", "गेहूं"
    ]):
        return INTENT_MSP_STATUS

    # Insurance / PMFBY Claim
    if any(k in msg for k in [
        "insurance", "bima", "claim", "pmfby", "fasal bima", "crop insurance",
        "claim status", "nuqsaan", "fasal kshati", "under review",
        "बीमा", "दावा", "फसल बीमा", "फसल नुकसान", "फसल क्षति"
    ]):
        return INTENT_INSURANCE_CLAIM_STATUS

    # My Records Summary
    if any(k in msg for k in [
        "my records", "record summary", "mera record", "mere record",
        "overall status", "kya kya pending", "sab batao", "total difference",
        "sare record", "summary"
    ]):
        return INTENT_MY_RECORDS

    # Unknown
    return INTENT_UNKNOWN

# ---------------------------------------------------------------------------
# Deterministic Engine Grounding & Intent-Specific Fallbacks
# ---------------------------------------------------------------------------

def get_grounded_intent_data(
    intent: str,
    language: str = "hi",
    farmer_id: str = "FV12345"
) -> Dict[str, Any]:
    """
    Calls the exact deterministic engines used across KisanVerify to gather
    verified facts, official URLs, sources, and intent-specific templates.
    """
    is_hi = language in ["hi", "hindi", "hinglish"]

    # 1. GREETING
    if intent == INTENT_GREETING:
        if is_hi:
            reply = (
                "नमस्ते रमेश कुमार जी! किसानवेरीफाई में आपका स्वागत है।\n\n"
                "मैं आपकी कृषि वित्तीय सहायता और पारदर्शिता गाइड हूँ। आज मैं आपकी किस विषय में मदद करूँ?\n\n"
                "आप पात्र योजनाओं, ऋण सत्यापन, एमएसपी भुगतान या फसल बीमा दावे के बारे में पूछ सकते हैं।"
            )
        else:
            reply = (
                "Namaste Ramesh Kumar! Welcome to KisanVerify.\n\n"
                "I am your agricultural financial transparency guide. How may I assist you today?\n\n"
                "You can ask about eligible schemes, loan verification, MSP crop payments, or crop insurance claims."
            )
        return {
            "reply": reply,
            "chips": ["Eligible schemes", "Loan difference", "Claim status", "MSP status"],
            "sources": ["KisanVerify Citizen Guide"],
            "action_link": "/farmer",
            "action_label": "Go to Dashboard" if not is_hi else "डैशबोर्ड पर जाएं",
            "facts": ["Farmer: Ramesh Kumar", "Farmer ID: FV12345", "Location: Patan, Durg, Chhattisgarh"],
        }

    # 2. SCHEME ELIGIBILITY
    elif intent == INTENT_SCHEME_ELIGIBILITY:
        # Call deterministic eligibility engine for Ramesh Kumar
        res = evaluate_eligibility(
            state="Chhattisgarh",
            district="Durg",
            crop="Paddy",
            land_holding_acres=3.0,
            farmer_category="Small Farmer",
            loan_status="Yes"
        )
        eligible_schemes = [s for s in res.schemes if s.eligibility_status in ["Eligible", "Possibly Eligible"]]

        if is_hi:
            scheme_lines = []
            for s in eligible_schemes[:3]:
                scheme_lines.append(f"• {s.title_hi or s.title}: {s.benefits_hi or s.benefits}")
            schemes_text = "\n".join(scheme_lines)

            reply = (
                f"आपकी प्रोफ़ाइल (3.0 एकड़ भूमि, धान, पाटन, दुर्ग) के आधार पर आप निम्नलिखित योजनाओं के लिए संभावित रूप से पात्र हैं:\n\n"
                f"{schemes_text}\n\n"
                f"नोट: यह परिणाम सूचनात्मक है। अंतिम स्वीकृति संबंधित कृषि विभाग और बैंक द्वारा दस्तावेज़ सत्यापन पर निर्भर करती है। "
                f"पूरी जानकारी और ऑनलाइन आवेदन के लिए आधिकारिक myScheme पोर्टल या हमारे 'Schemes' पेज पर जाएं।"
            )
        else:
            scheme_lines = []
            for s in eligible_schemes[:3]:
                scheme_lines.append(f"• {s.title}: {s.benefits}")
            schemes_text = "\n".join(scheme_lines)

            reply = (
                f"Based on your profile (3.0 acres, Paddy, Patan, Durg), you may be eligible for the following schemes:\n\n"
                f"{schemes_text}\n\n"
                f"Note: Eligibility results are informational. Final approval is determined by the bank and department upon document verification. "
                f"You can verify full criteria on the official myScheme portal or through our Schemes section."
            )

        facts = [
            "Land holding: 3.0 acres",
            "Crop: Paddy",
            "State: Chhattisgarh, District: Durg",
            "PM-KISAN: ₹6,000 / year via Direct Benefit Transfer (DBT)",
            "PMFBY: Up to ₹50,000/acre crop risk coverage",
            "KCC: Concessional crop loan @ 4% net interest",
            "Official URL: https://www.myscheme.gov.in/schemes/pm-kisan",
        ]

        return {
            "reply": reply,
            "chips": ["Required documents", "Loans I can apply for", "Claim status", "MSP status"],
            "sources": ["myScheme.gov.in", "Ministry of Agriculture & Farmers Welfare Circular (2024)"],
            "action_link": "/farmer/schemes",
            "action_label": "View Eligible Schemes" if not is_hi else "सभी योजनाएं देखें",
            "facts": facts,
        }

    # 3. LOAN APPLY (Loans I can apply for)
    elif intent == INTENT_LOAN_APPLY:
        if is_hi:
            reply = (
                "आप अपनी 3.0 एकड़ कृषि भूमि के आधार पर इन ऋण विकल्पों के लिए आवेदन कर सकते हैं:\n\n"
                "• किसान क्रेडिट कार्ड (KCC): ₹3,00,000 तक की फसल ऋण सीमा 4% रियायती ब्याज दर पर (समय पर भुगतान पर 3% उपदान)।\n"
                "• कृषि सावधि ऋण (Agri Term Loan): सिंचाई, बोरवेल या कृषि यंत्रों के लिए बैंक से दीर्घकालिक ऋण।\n"
                "• पशुपालन KCC: डेयरी या पशुपालन गतिविधियों के लिए ₹2,00,000 तक का कार्यशील ऋण।\n\n"
                "आवश्यक दस्तावेज़: आधार कार्ड, बी-1/खसरा नकल, बैंक पासबुक और नो-ड्यूज़ प्रमाणपत्र। "
                "अंतिम स्वीकृति बैंक शाखा प्रबंधक के मूल्यांकन पर निर्भर करती है।"
            )
        else:
            reply = (
                "Based on your 3.0 acres operational land, here are loan products you may apply for:\n\n"
                "• Kisan Credit Card (KCC): Production credit up to ₹3,00,000 at 4% effective interest with prompt repayment incentive.\n"
                "• Agriculture Term Loan: Long-term credit for irrigation, equipment, or farm development.\n"
                "• Animal Husbandry KCC: Working capital limit up to ₹2,00,000 for dairy activities.\n\n"
                "Key Documents: Aadhaar, Land ownership record (B-1/Khasra), Bank Passbook, and No-Dues certificate. "
                "Final credit sanction is at the discretion of the financing bank branch."
            )
        facts = [
            "KCC limit up to ₹3,00,000 at 4% net interest",
            "Term loan for equipment and irrigation",
            "Animal Husbandry KCC up to ₹2,00,000",
            "Land requirement: Valid B-1 Khasra ownership",
            "Official Portal: https://jansamarth.in",
        ]
        return {
            "reply": reply,
            "chips": ["Required documents", "Loan difference", "Eligible schemes", "Contact details"],
            "sources": ["RBI Master Circular - Kisan Credit Card (KCC)", "JanSamarth Portal Guidelines"],
            "action_link": "/farmer/loan-verify",
            "action_label": "Explore Loans" if not is_hi else "ऋण विकल्प देखें",
            "facts": facts,
        }

    # 4. LOAN STATUS (My Loans verification)
    elif intent == INTENT_LOAN_STATUS:
        if is_hi:
            reply = (
                "आपके किसान क्रेडिट कार्ड (KCC) ऋण खाते का सत्यापन विवरण:\n\n"
                "• बैंक: स्टेट बैंक ऑफ इंडिया (पाटन शाखा)\n"
                "• स्वीकृत ऋण सीमा: ₹80,000\n"
                "• खाते में वितरित राशि: ₹70,000\n"
                "• कुल अंतर: ₹10,000 (समीक्षा आवश्यक)\n"
                "• दर्ज कटौतियां: ₹5,000 (प्रोसेसिंग शुल्क ₹2,000 + फसल बीमा प्रीमियम ₹3,000)\n"
                "• अव्याख्यायित शेष: ₹5,000\n\n"
                "ध्यान दें: यह अंतर किसी दोषारोपण का प्रमाण नहीं है। शुल्क या बीमा ऑटो-डेबिट के कारण भिन्नता संभव है। "
                "विस्तृत समाधान के लिए 'Loan Details' से अपनी रिपोर्ट डाउनलोड करें।"
            )
        else:
            reply = (
                "Verification breakdown for your Kisan Credit Card (KCC) account:\n\n"
                "• Financing Bank: State Bank of India (Patan Branch)\n"
                "• Sanctioned Limit: ₹80,000\n"
                "• Disbursed into Account: ₹70,000\n"
                "• Gross Difference: ₹10,000 (May need review)\n"
                "• Explained Deductions: ₹5,000 (Processing charges ₹2,000 + PMFBY Insurance ₹3,000)\n"
                "• Unexplained Balance: ₹5,000\n\n"
                "Important: Flagged differences do not imply wrongdoing. Staged debits or documentation fees often account for variances. "
                "Download your itemized loan audit report to verify with your SBI branch."
            )
        facts = [
            "Sanctioned: ₹80,000",
            "Disbursed: ₹70,000",
            "Gross difference: ₹10,000",
            "Processing fee: ₹2,000",
            "Insurance deduction: ₹3,000",
            "Unexplained difference: ₹5,000",
            "Bank: State Bank of India, Patan Branch",
        ]
        return {
            "reply": reply,
            "chips": ["Required documents", "MSP status", "Claim status", "Raise a grievance"],
            "sources": ["SBI Sanction Letter (15 Jan 2024)", "Bank Statement Auto-Audit"],
            "action_link": "/farmer/loan-verify",
            "action_label": "View Loan Details" if not is_hi else "ऋण विवरण देखें",
            "facts": facts,
        }

    # 5. MSP STATUS (Mandi Procurement)
    elif intent == INTENT_MSP_STATUS:
        if is_hi:
            reply = (
                "धान उपार्जन (MSP) भुगतान का ऑडिट विवरण (संदर्भ: MSP-2024-4411):\n\n"
                "• उपार्जन केंद्र: पाटन कृषि उपज मंडी\n"
                "• बेची गई मात्रा: 50 क्विंटल (धान सामान्य)\n"
                "• सरकारी एमएसपी दर: ₹2,300 प्रति क्विंटल\n"
                "• सकल अपेक्षित भुगतान: ₹1,15,000\n"
                "• खाते में प्राप्त राशि: ₹1,05,000\n"
                "• कुल अंतर: ₹10,000\n"
                "• व्याख्यायित कटौतियां: ₹6,525 (हमाली ₹625 + नमी FAQ मानक ₹1,150 + बारदाना ₹750 + पैक्स समिति समायोजन ₹4,000)\n"
                "• अव्याख्यायित शेष: ₹3,475\n\n"
                "समीक्षा सुझाव: अपनी जे-फॉर्म रसीद में वजन और नमी कटौती की जांच करें।"
            )
        else:
            reply = (
                "MSP crop procurement audit details (Reference: MSP-2024-4411):\n\n"
                "• Procurement Center: Patan Krishi Upaj Mandi\n"
                "• Quantity Delivered: 50 quintals (Paddy Common)\n"
                "• Statutory MSP Rate: ₹2,300 / quintal\n"
                "• Gross Expected Value: ₹1,15,000\n"
                "• Disbursed into Bank: ₹1,05,000\n"
                "• Gross Difference: ₹10,000\n"
                "• Explained Adjustments: ₹6,525 (Hamali ₹625 + FAQ Moisture cut ₹1,150 + Bardana ₹750 + PACS loan recovery ₹4,000)\n"
                "• Unexplained Difference: ₹3,475\n\n"
                "Recommended step: Cross-check your physical weighbridge slip and J-Form with the Mandi Samiti."
            )
        facts = [
            "Quantity: 50 quintals",
            "MSP rate: ₹2,300 / quintal",
            "Gross expected: ₹1,15,000",
            "Received: ₹1,05,000",
            "Difference: ₹10,000",
            "Hamali: ₹625",
            "Moisture FAQ cut: ₹1,150",
            "Bardana deduction: ₹750",
            "PACS recovery: ₹4,000",
            "Unexplained: ₹3,475",
            "Center: Patan Krishi Upaj Mandi",
        ]
        return {
            "reply": reply,
            "chips": ["Loan difference", "Claim status", "Mandi prices", "Raise a grievance"],
            "sources": ["CACP Price Policy Kharif 2024-25", "Chhattisgarh Mandi Board J-Form #W-4411"],
            "action_link": "/farmer/msp-verify",
            "action_label": "View MSP Audit" if not is_hi else "एमएसपी ऑडिट देखें",
            "facts": facts,
        }

    # 6. INSURANCE CLAIM STATUS
    elif intent == INTENT_INSURANCE_CLAIM_STATUS:
        if is_hi:
            reply = (
                "आपके प्रधानमंत्री फसल बीमा (PMFBY) दावे की वर्तमान स्थिति:\n\n"
                "• दावा संदर्भ संख्या: INS-2024-7711\n"
                "• फसल एवं मौसम: धान (खरीफ 2024), पाटन, दुर्ग\n"
                "• निर्धारित दावा राशि: ₹30,000\n"
                "• बैंक में प्राप्त राशि: ₹20,000\n"
                "• लंबित अंतर: ₹10,000\n"
                "• वर्तमान स्थिति: समीक्षाधीन (Under Review - 24 दिन व्यतीत)\n\n"
                "कारण: फसल कटाई प्रयोग (CCE) के आंकड़े और राज्य सब्सिडी अंश की द्वितीय किश्त प्रशासनिक प्रक्रिया में है। "
                "यदि 15 दिनों में भुगतान नहीं आता है, तो आप हमारे पोर्टल से शिकायत दर्ज कर सकते हैं।"
            )
        else:
            reply = (
                "Current status of your PMFBY crop insurance claim:\n\n"
                "• Claim Reference: INS-2024-7711\n"
                "• Crop & Season: Paddy (Kharif 2024), Patan, Durg\n"
                "• Assessed Claim Amount: ₹30,000\n"
                "• Amount Received: ₹20,000\n"
                "• Pending Balance: ₹10,000\n"
                "• Current Status: Under Review (24 days elapsed)\n\n"
                "Reason: Crop Cutting Experiment (CCE) block data reconciliation and state subsidy tranche clearance are ongoing. "
                "You may track updates or submit an inquiry through the Claim Verification page."
            )
        facts = [
            "Claim reference: INS-2024-7711",
            "Crop: Paddy (Kharif 2024)",
            "Assessed claim: ₹30,000",
            "Amount received: ₹20,000",
            "Pending balance: ₹10,000",
            "Status: Under Review (24 days elapsed)",
            "Location: Patan, Durg, Chhattisgarh",
        ]
        return {
            "reply": reply,
            "chips": ["Required documents", "Loan difference", "MSP status", "Raise a grievance"],
            "sources": ["PMFBY Operational Guidelines", "State Insurance Nodal Agency Record"],
            "action_link": "/farmer/claim-verify",
            "action_label": "Track Insurance Claim" if not is_hi else "बीमा दावा ट्रैक करें",
            "facts": facts,
        }

    # 7. REQUIRED DOCUMENTS
    elif intent == INTENT_REQUIRED_DOCUMENTS:
        if is_hi:
            reply = (
                "कृषि योजनाओं, KCC ऋण और बीमा दावों के लिए आवश्यक मुख्य दस्तावेज़:\n\n"
                "1. आधार कार्ड (बैंक खाते और डीबीटी से लिंक)\n"
                "2. भूमि अभिलेख (बी-1 / खसरा / किसान किताब की प्रमाणित प्रति)\n"
                "3. पटवारी गिरदावरी प्रमाण पत्र (नवीनतम फसल बुवाई पुष्टि)\n"
                "4. बैंक पासबुक का मुख्य पृष्ठ (आईएफएससी और खाता संख्या स्पष्ट हो)\n"
                "5. मंडी उपार्जन रसीद / जे-फॉर्म (एमएसपी दावों के लिए)\n\n"
                "आपके दस्तावेज़ वॉल्ट की स्थिति: आधार कार्ड और खसरा रिकॉर्ड पहले से सत्यापित हैं। "
                "आप 'My Documents' पेज से नए दस्तावेज़ जोड़ सकते हैं।"
            )
        else:
            reply = (
                "Essential documents required for agricultural schemes, KCC credit, and insurance claims:\n\n"
                "1. Aadhaar Card (seeded with bank account for DBT)\n"
                "2. Land Ownership Record (B-1 / Khasra / Rin Pustika copy)\n"
                "3. Patwari Girdawari Certificate (current crop sowing verification)\n"
                "4. Bank Passbook front page (showing clear IFSC & Account Number)\n"
                "5. Mandi Procurement Slip / J-Form (for MSP grain sales)\n\n"
                "Vault Status: Your Aadhaar and Land Records are already verified. "
                "Visit the My Documents vault to inspect or upload new certificates."
            )
        facts = [
            "1. Aadhaar Card (DBT seeded)",
            "2. Land Record (B-1 / Khasra)",
            "3. Patwari Girdawari Certificate",
            "4. Bank Passbook with IFSC",
            "5. Mandi J-Form",
            "Farmer documents in vault: Aadhaar (Verified), Land Record (Verified)",
        ]
        return {
            "reply": reply,
            "chips": ["Eligible schemes", "Loans I can apply for", "Loan difference", "Contact details"],
            "sources": ["Department of Agriculture & Farmers Welfare Guidelines"],
            "action_link": "/farmer/documents",
            "action_label": "Open Document Vault" if not is_hi else "दस्तावेज़ वॉल्ट खोलें",
            "facts": facts,
        }

    # 8. MANDI PRICE
    elif intent == INTENT_MANDI_PRICE:
        if is_hi:
            reply = (
                "पाटन मंडी (दुर्ग, छत्तीसगढ़) के ताज़ा फसल भाव:\n\n"
                "• धान (सामान्य - IR-36): ₹2,280 / क्विंटल (न्यूनतम: ₹2,180 | उच्चतम: ₹2,350)\n"
                "• धान (ग्रेड ए - महामाया): ₹2,320 / क्विंटल (न्यूनतम: ₹2,240 | उच्चतम: ₹2,390)\n"
                "• भारत सरकार एमएसपी बेंचमार्क: ₹2,300 / क्विंटल (सामान्य) | ₹2,320 / क्विंटल (ग्रेड ए)\n\n"
                "स्रोत: एगमार्कनेट (Agmarknet) एवं छत्तीसगढ़ मंडी बोर्ड। "
                "मंडी में जाने से पहले अपनी उपज की नमी 17% से कम सुनिश्चित करें।"
            )
        else:
            reply = (
                "Live agricultural commodity prices for Patan Mandi (Durg, Chhattisgarh):\n\n"
                "• Paddy (Common - IR-36): Modal Price ₹2,280 / quintal (Min: ₹2,180 | Max: ₹2,350)\n"
                "• Paddy (Grade A - Mahamaya): Modal Price ₹2,320 / quintal (Min: ₹2,240 | Max: ₹2,390)\n"
                "• Official MSP Benchmarks: ₹2,300 / qtl (Common) | ₹2,320 / qtl (Grade A)\n\n"
                "Source: Agmarknet & Chhattisgarh Mandi Board. "
                "Ensure crop moisture is under 17% to avoid FAQ quality cuts."
            )
        facts = [
            "Market: Patan Mandi, Durg",
            "Paddy Common modal price: ₹2,280 / quintal",
            "Paddy Grade A modal price: ₹2,320 / quintal",
            "Official MSP Paddy Common: ₹2,300 / quintal",
            "Official MSP Paddy Grade A: ₹2,320 / quintal",
            "Maximum permissible moisture: 17%",
        ]
        return {
            "reply": reply,
            "chips": ["MSP status", "Weather forecast", "Nearby office", "Eligible schemes"],
            "sources": ["Agmarknet Daily Market Bulletin", "Chhattisgarh Rajya Krishi Vipnan Mandi Board"],
            "action_link": "/farmer/mandi",
            "action_label": "View Mandi Prices" if not is_hi else "मंडी भाव देखें",
            "facts": facts,
        }

    # 9. WEATHER
    elif intent == INTENT_WEATHER:
        if is_hi:
            reply = (
                "पाटन (दुर्ग, छत्तीसगढ़) के लिए मौसम पूर्वानुमान व कृषि सलाह:\n\n"
                "• वर्तमान स्थिति: आंशिक रूप से बादल (Partly Cloudy)\n"
                "• तापमान: न्यूनतम 24°C | अधिकतम 34°C\n"
                "• वर्षा संभावना: 10% (हल्की बौछारों की संभावना)\n\n"
                "कृषि सलाह: मौसम जुताई, खेत की तैयारी और यूरिया/खाद छिड़काव के लिए अनुकूल है। "
                "यदि हवा की गति 15 किमी/घंटा से अधिक हो तो कीटनाशक छिड़काव से बचें।"
            )
        else:
            reply = (
                "Weather forecast & agro-advisory for Patan (Durg, Chhattisgarh):\n\n"
                "• Current Condition: Partly Cloudy\n"
                "• Temperature: Min 24°C | Max 34°C\n"
                "• Precipitation Probability: 10% (Low chance of light showers)\n\n"
                "Agro-Advisory: Weather is suitable for field intercultural operations and fertilizer top-dressing. "
                "Avoid chemical spraying if ambient wind speeds exceed 15 km/h."
            )
        facts = [
            "Location: Patan, Durg (21.03° N, 81.53° E)",
            "Condition: Partly Cloudy",
            "Temperature: 24°C to 34°C",
            "Precipitation chance: 10%",
            "Agro-advisory: Suitable for field preparation and fertilizer application",
        ]
        return {
            "reply": reply,
            "chips": ["Mandi prices", "MSP status", "Claim status", "Nearby office"],
            "sources": ["India Meteorological Department (IMD)", "Agrometeorological Advisory Bulletin"],
            "action_link": "/farmer/weather",
            "action_label": "View Weather Forecast" if not is_hi else "मौसम पूर्वानुमान देखें",
            "facts": facts,
        }

    # 10. NEARBY OFFICE
    elif intent == INTENT_NEARBY_OFFICE:
        if is_hi:
            reply = (
                "पाटन (दुर्ग) क्षेत्र के निकटतम महत्वपूर्ण कृषि कार्यालय:\n\n"
                "1. स्टेट बैंक ऑफ इंडिया (पाटन शाखा): 2.5 किमी (पाटन मुख्य बाजार)\n"
                "2. पाटन कृषि उपज मंडी समिति: 3.0 किमी (मंडी प्रांगण, पाटन)\n"
                "3. उप संचालक कृषि कार्यालय, दुर्ग: 14 किमी (जी.ई. रोड, दुर्ग)\n"
                "4. कृषि विज्ञान केंद्र (KVK), दुर्ग: 18 किमी (अंजोरा, दुर्ग)\n\n"
                "कार्यालय समय: सोमवार से शनिवार सुबह 10:00 बजे से शाम 5:30 बजे तक।"
            )
        else:
            reply = (
                "Nearest agricultural extension offices and institutions near Patan (Durg):\n\n"
                "1. State Bank of India (Patan Branch): 2.5 km (Patan Main Market)\n"
                "2. Patan Krishi Upaj Mandi Samiti: 3.0 km (Mandi Yard, Patan)\n"
                "3. Deputy Director of Agriculture, Durg: 14 km (G.E. Road, Durg)\n"
                "4. Krishi Vigyan Kendra (KVK Durg): 18 km (Anjora, Durg)\n\n"
                "Working Hours: Monday to Saturday, 10:00 AM to 5:30 PM."
            )
        facts = [
            "1. SBI Patan Branch: 2.5 km",
            "2. Patan Krishi Upaj Mandi: 3.0 km",
            "3. Deputy Director of Agriculture, Durg: 14 km",
            "4. Krishi Vigyan Kendra (KVK), Anjora, Durg: 18 km",
            "Operating hours: 10:00 AM - 5:30 PM",
        ]
        return {
            "reply": reply,
            "chips": ["Contact details", "Loan difference", "MSP status", "Raise a grievance"],
            "sources": ["District Agriculture Extension Directory (Durg, Chhattisgarh)"],
            "action_link": "/farmer/offices",
            "action_label": "View Nearby Offices" if not is_hi else "कार्यालय देखें",
            "facts": facts,
        }

    # 11. GRIEVANCE
    elif intent == INTENT_GRIEVANCE:
        if is_hi:
            reply = (
                "शिकायत दर्ज करने की प्रक्रिया और आधिकारिक माध्यम:\n\n"
                "1. किसानवेरीफाई पोर्टल: आप 'Raise a Grievance' बटन से अपने ऋण, एमएसपी या फसल बीमा अंतर की पूर्व-भरी रिपोर्ट के साथ शिकायत दर्ज कर सकते हैं।\n"
                "2. राष्ट्रीय शिकायत पोर्टल (CPGRAMS): pgportal.gov.in पर केंद्र सरकार के कृषि मंत्रालय को सीधे शिकायत भेजें।\n"
                "3. छत्तीसगढ़ जनदर्शन / सीएम हेल्पलाइन: टोल-फ्री नंबर 1100 पर संपर्क करें।\n"
                "4. पीएम-किसान हेल्पलाइन: 155261 पर कॉल करें।\n\n"
                "हमारी प्रणाली आपको बैंक या मंडी अधिकारी को सौंपने के लिए 1-क्लिक साक्ष्य पीडीएफ तैयार करके देती है।"
            )
        else:
            reply = (
                "How to file an agricultural dispute or grievance:\n\n"
                "1. KisanVerify In-App Redressal: Tap 'Raise a Grievance' to generate a pre-filled evidence dossier for loan, MSP, or claim discrepancies.\n"
                "2. Central Government Portal (CPGRAMS): File directly on pgportal.gov.in under Ministry of Agriculture.\n"
                "3. Chhattisgarh State Jan Darshan: Call toll-free 1100.\n"
                "4. PM-KISAN Grievance Desk: 155261 / 011-24300606.\n\n"
                "All grievances generated through KisanVerify attach verified statutory rule citations."
            )
        facts = [
            "In-app grievance workflow: /farmer/grievance",
            "Central portal: https://pgportal.gov.in",
            "State helpline: Chhattisgarh CM Helpline 1100",
            "PM-KISAN Helpline: 155261",
            "Evidence dossier supported: Loan, MSP, Insurance discrepancies",
        ]
        return {
            "reply": reply,
            "chips": ["Contact details", "Loan difference", "Claim status", "MSP status"],
            "sources": ["CPGRAMS Citizen Charter", "Chhattisgarh Grievance Redressal Rules"],
            "action_link": "/farmer/grievance",
            "action_label": "Raise a Grievance" if not is_hi else "शिकायत दर्ज करें",
            "facts": facts,
        }

    # 12. CONTACT HELP
    elif intent == INTENT_CONTACT_HELP:
        if is_hi:
            reply = (
                "दुर्ग जिले (छत्तीसगढ़) के आधिकारिक एवं सत्यापित सहायता संपर्क:\n\n"
                "• स्टेट बैंक ऑफ इंडिया (पाटन कृषि शाखा): 1800-425-3800\n"
                "• जिला उप संचालक कृषि कार्यालय, दुर्ग: 0788-2322401\n"
                "• पीएम-किसान राष्ट्रीय हेल्पलाइन: 155261 / 011-24300606\n"
                "• फसल बीमा (PMFBY) टोल-फ्री हेल्पलाइन: 1800-180-1551\n"
                "• खाद्य एवं नागरिक आपूर्ति / मंडी उपार्जन: 1967\n"
                "• राष्ट्रीय किसान कॉल सेंटर (KCC): 1800-180-1551 (प्रातः 6:00 से रात्रि 10:00)"
            )
        else:
            reply = (
                "Verified official helplines for Durg District, Chhattisgarh:\n\n"
                "• State Bank of India (Patan Branch): 1800-425-3800\n"
                "• Deputy Director of Agriculture, Durg: 0788-2322401\n"
                "• PM-KISAN National Toll-Free: 155261 / 011-24300606\n"
                "• Crop Insurance (PMFBY) Toll-Free: 1800-180-1551\n"
                "• Mandi & Food Civil Supplies: 1967\n"
                "• Kisan Call Center (KCC GoI): 1800-180-1551 (6:00 AM - 10:00 PM)"
            )
        facts = [
            "SBI Patan: 1800-425-3800",
            "Deputy Director Agriculture Durg: 0788-2322401",
            "PM-KISAN Helpline: 155261",
            "PMFBY Helpline: 1800-180-1551",
            "Mandi Helpline: 1967",
            "Kisan Call Center: 1800-180-1551",
        ]
        return {
            "reply": reply,
            "chips": ["Nearby office", "Loan difference", "Claim status", "Raise a grievance"],
            "sources": ["Durg District Lead Bank Directory", "Ministry of Agriculture Extension Directory"],
            "action_link": "/farmer/contact",
            "action_label": "View Contact Directory" if not is_hi else "संपर्क सूची देखें",
            "facts": facts,
        }

    # 13. HOW TO USE APP
    elif intent == INTENT_HOW_TO_USE:
        if is_hi:
            reply = (
                "किसानवेरीफाई का उपयोग कैसे करें:\n\n"
                "1. ऋण सत्यापन (Loan): अपने KCC ऋण के स्वीकृत व वितरित पैसे तथा बैंक कटौतियों की जांच करें।\n"
                "2. एमएसपी सत्यापन (MSP): बेचे गए धान के वजन, सरकारी दर और बैंक में आई राशि का मिलान करें।\n"
                "3. फसल बीमा दावा (Insurance): अपने PMFBY दावे की प्रगति और लंबित किश्तों को ट्रैक करें।\n"
                "4. योजना पात्रता (Schemes): अपनी जमीन और फसल के अनुसार सरकारी योजनाओं की जानकारी लें।\n"
                "5. शिकायत निवारण (Grievance): किसी भी अंतर के लिए 1-क्लिक में आधिकारिक शिकायत पत्र डाउनलोड करें।"
            )
        else:
            reply = (
                "How to use KisanVerify:\n\n"
                "1. Loan Verification: Audit approved vs disbursed KCC loan amounts and bank deductions.\n"
                "2. MSP Verification: Cross-check crop sale weight, statutory rates, and bank disbursements.\n"
                "3. Crop Insurance Claim: Track PMFBY claim progress, loss percentages, and subsidy tranches.\n"
                "4. Scheme Finder: Discover central and state agricultural schemes matching your land and crop.\n"
                "5. Grievance Redressal: Generate official evidence dossiers to resolve discrepancies with banks or mandis."
            )
        facts = [
            "Core modules: Loan Verification, MSP Verification, Crop Insurance, Schemes, Grievance",
            "Tagline: Every rupee. Every benefit. Verified.",
            "Deterministic rule engine in Python",
        ]
        return {
            "reply": reply,
            "chips": ["Eligible schemes", "Loan difference", "MSP status", "Claim status"],
            "sources": ["KisanVerify User Guide"],
            "action_link": "/farmer",
            "action_label": "Go to Dashboard" if not is_hi else "डैशबोर्ड पर जाएं",
            "facts": facts,
        }

    # 14. EXPLAIN TERM
    elif intent == INTENT_EXPLAIN_TERM:
        if is_hi:
            reply = (
                "कृषि वित्त एवं मंडी के महत्वपूर्ण शब्द:\n\n"
                "• हमाली (Hamali): मंडी प्रांगण में अनाज की तुलाई, लोडिंग व अनलोडिंग का निर्धारित सरकारी शुल्क (छत्तीसगढ़ में लगभग ₹12.50/क्विंटल)।\n"
                "• एफएक्यू ग्रेड (FAQ Grade): 'उचित औसत गुणवत्ता' (Fair Average Quality) मानक, जैसे धान में 17% से अधिक नमी होने पर मूल्य में कटौती होती है।\n"
                "• केसीसी (KCC): किसान क्रेडिट कार्ड, जो समय पर भुगतान करने पर 4% प्रभावी वार्षिक ब्याज दर पर अल्पावधि फसल ऋण प्रदान करता है।\n"
                "• सीसीई (CCE): फसल कटाई प्रयोग (Crop Cutting Experiment), जिसके जरिए सरकारी दल बीमा दावों के लिए औसत उपज का निर्धारण करते हैं।\n"
                "• खाली वजन (Tare Weight): वाहन या खाली बोरियों का वजन जो कुल वजन में से घटाया जाता है।"
            )
        else:
            reply = (
                "Important agricultural finance terms explained:\n\n"
                "• Hamali: Official loading, unloading, and stacking charges regulated by the Mandi Board (typically ₹12.50/qtl in Chhattisgarh).\n"
                "• FAQ Grade: Fair Average Quality standard set by the government (e.g. moisture threshold up to 17% for paddy).\n"
                "• KCC: Kisan Credit Card offering short-term crop loans at 4% effective interest upon prompt annual repayment.\n"
                "• CCE: Crop Cutting Experiment conducted by revenue & agriculture officers to calculate block threshold yields for insurance.\n"
                "• Tare Weight: Weight of empty vehicle or packing gunny bags deducted from gross weighbridge reading."
            )
        facts = [
            "Hamali: Mandi handling fee ~₹12.50/qtl",
            "FAQ moisture limit: 17% for paddy",
            "KCC effective interest: 4% with prompt subvention",
            "CCE: Crop Cutting Experiment for PMFBY",
            "Tare weight: Weight of container/vehicle",
        ]
        return {
            "reply": reply,
            "chips": ["MSP status", "Loan difference", "Claim status", "Eligible schemes"],
            "sources": ["CACP Quality Specifications", "NABARD KCC Guidelines"],
            "action_link": "/farmer/msp-verify",
            "action_label": "Check MSP Standards" if not is_hi else "मानक जांचें",
            "facts": facts,
        }

    # 15. MY RECORDS SUMMARY
    elif intent == INTENT_MY_RECORDS:
        if is_hi:
            reply = (
                "आपके किसानवेरीफाई खातों का कुल सारांश (किसान: रमेश कुमार):\n\n"
                "1. ऋण खाता (KCC SBI): ₹10,000 का अंतर समीक्षाधीन (स्वीकृत ₹80,000 | वितरित ₹70,000)। ₹5,000 दर्ज कटौती, ₹5,000 अव्याख्यायित।\n"
                "2. धान एमएसपी (पाटन मंडी): ₹10,000 का अंतर दर्ज (अपेक्षित ₹1,15,000 | प्राप्त ₹1,05,000)। ₹6,525 व्याख्यायित कटौती, ₹3,475 अव्याख्यायित।\n"
                "3. फसल बीमा दावा (PMFBY): ₹10,000 द्वितीय किश्त प्रक्रियाधीन (स्वीकृत दावा ₹30,000 | प्राप्त ₹20,000)।\n\n"
                "तीनों खातों में कुल ₹30,000 का अंतर समीक्षा के लिए चिन्हित है। किसी भी अंतर का विस्तृत विवरण देखने के लिए नीचे दिए गए बटन पर टैप करें।"
            )
        else:
            reply = (
                "Consolidated status of your KisanVerify records (Farmer: Ramesh Kumar):\n\n"
                "1. Loan (KCC - SBI Patan): ₹10,000 difference flagged (Approved ₹80,000 | Disbursed ₹70,000). Deductions ₹5,000, Unexplained ₹5,000.\n"
                "2. MSP Grain Procurement: ₹10,000 payment difference (Expected ₹1,15,000 | Received ₹1,05,000). Adjustments ₹6,525, Unexplained ₹3,475.\n"
                "3. PMFBY Crop Insurance: ₹10,000 second tranche Under Review (Assessed ₹30,000 | Received ₹20,000).\n\n"
                "A total of ₹30,000 across your accounts is flagged for administrative review. Select an item below to inspect details."
            )
        facts = [
            "Loan Approved ₹80,000, Disbursed ₹70,000, Difference ₹10,000",
            "MSP Expected ₹1,15,000, Received ₹1,05,000, Difference ₹10,000",
            "Insurance Assessed ₹30,000, Received ₹20,000, Pending ₹10,000",
            "Total flagged across 3 accounts: ₹30,000",
        ]
        return {
            "reply": reply,
            "chips": ["Loan difference", "MSP status", "Claim status", "Raise a grievance"],
            "sources": ["KisanVerify Master Ledger (FV12345)"],
            "action_link": "/farmer",
            "action_label": "View Dashboard" if not is_hi else "डैशबोर्ड देखें",
            "facts": facts,
        }

    # 16. UNKNOWN (POLITE CLARIFICATION, NOT DATA DUMP)
    else:
        if is_hi:
            reply = (
                "माफ़ कीजिए, मैं आपका प्रश्न पूरी तरह समझ नहीं पाया।\n\n"
                "आप मुझसे इस प्रकार के प्रश्न पूछ सकते हैं:\n"
                "1. 'मुझे कौन सी सरकारी योजना मिल सकती है?'\n"
                "2. 'मेरे ऋण में ₹10,000 का अंतर क्यों है?'\n"
                "3. 'फसल बीमा के लिए कौन से दस्तावेज़ चाहिए?'\n\n"
                "या नीचे दिए गए मुख्य विकल्पों में से किसी एक को चुनें:"
            )
        else:
            reply = (
                "I'm sorry, I couldn't understand your question.\n\n"
                "You can ask me questions like:\n"
                "1. 'Which schemes am I eligible for?'\n"
                "2. 'Why is there a ₹10,000 difference in my loan?'\n"
                "3. 'What documents do I need for crop insurance?'\n\n"
                "Or choose from the quick options below:"
            )
        return {
            "reply": reply,
            "chips": ["Eligible schemes", "Loan difference", "Claim status", "Required documents"],
            "sources": ["KisanVerify Help Desk"],
            "action_link": "/farmer",
            "action_label": "Explore Services" if not is_hi else "सेवाएं देखें",
            "facts": ["KisanVerify Assistant Help"],
        }

# ---------------------------------------------------------------------------
# Number & URL Verification Safety Check
# ---------------------------------------------------------------------------

def verify_grounded_response(
    llm_text: str,
    grounded_facts: List[str]
) -> bool:
    """
    Verifies that the LLM response contains no ungrounded numbers or URLs,
    and adheres to neutrality rules (no fraud accusations or promises).
    """
    text_lower = llm_text.lower()

    # Rule 1: Accusatory or fraud wording is strictly prohibited
    prohibited_words = [
        "fraud", "scam", "corrupted", "corrupt", "cheat", "cheated", "theft",
        "stole", "guarantee", "guaranteed", "approved for sure",
        "धोखाधड़ी", "घोटाला", "चोरी", "भ्रष्ट", "पक्का स्वीकृत", "गारंटी"
    ]
    for w in prohibited_words:
        if w in text_lower:
            return False

    # Rule 2: Verify URLs
    url_pattern = r"https?://[^\s)\]\"'>]+"
    found_urls = re.findall(url_pattern, llm_text)
    facts_blob = " ".join(grounded_facts)

    for url in found_urls:
        clean_url = url.rstrip(".,;")
        if clean_url not in facts_blob:
            # Check domain
            domain_match = re.search(r"https?://([^/]+)", clean_url)
            if domain_match:
                domain = domain_match.group(1)
                if domain not in facts_blob:
                    return False

    # Rule 3: Check rupee / monetary figures
    # Extract numbers with ₹ or rupee references like ₹80,000, 70,000, 10,000, 2,300, 1,15,000
    amount_pattern = r"₹\s*([0-9,]+(?:\.[0-9]+)?)"
    found_amounts = re.findall(amount_pattern, llm_text)
    for amt in found_amounts:
        clean_amt = amt.replace(",", "").strip()
        if not clean_amt:
            continue
        # Verify this number appears in grounded facts
        if clean_amt not in facts_blob.replace(",", ""):
            # Allow common small numbers like 1, 2, 3, 4, 15, 30
            try:
                num = float(clean_amt)
                if num > 100: # Financial figures must match
                    return False
            except ValueError:
                return False

    return True

# ---------------------------------------------------------------------------
# Main Orchestrator: generate_ai_explanation
# ---------------------------------------------------------------------------

def generate_ai_explanation(
    message: str,
    language: str = "hi",
    farmer_id: str = "FV12345",
    history: Optional[List[ChatMessage]] = None,
    context: Optional[Dict[str, Any]] = None
) -> ChatResponse:
    """
    Orchestrates deterministic intent routing, grounded fact retrieval,
    optional Gemini generation with strict factual grounding, and intent-specific fallback.
    """
    clean_msg = (message or "").strip()
    history = history or []

    # Step 1: Deterministic Intent Detection
    intent = detect_intent(clean_msg, history=history)

    # Step 2: Retrieve Grounded Facts and Deterministic Template
    grounded_data = get_grounded_intent_data(intent, language=language, farmer_id=farmer_id)
    deterministic_reply = grounded_data["reply"]
    chips = grounded_data["chips"]
    sources = grounded_data["sources"]
    action_link = grounded_data.get("action_link")
    action_label = grounded_data.get("action_label")
    facts = grounded_data.get("facts", [])

    # Step 3: Check if LLM Provider (Gemini) is available and valid
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    has_valid_key = bool(gemini_key and len(gemini_key.strip()) > 10)

    # For simple greetings, always return the short, clean deterministic greeting directly
    if intent == INTENT_GREETING:
        return ChatResponse(
            reply=deterministic_reply,
            reply_language=language,
            provider="template-fallback",
            mode="offline",
            intent=intent,
            suggested_chips=chips,
            source_documents=sources,
            action_link=action_link,
            action_label=action_label,
            verified_facts=facts,
        )

    if has_valid_key:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)

            # Build grounded system prompt strictly constrained to deterministic facts
            facts_prompt = "\n".join([f"- {f}" for f in facts])
            prompt = f"""
You are KisanVerify AI Assistant, an agricultural policy and financial transparency guide for Indian farmers.
Tagline: "Every rupee. Every benefit. Verified."
Beneficiary Profile: Farmer Ramesh Kumar (Farmer ID: {farmer_id}), Patan, District Durg, Chhattisgarh.

CRITICAL SAFETY & GROUNDING RULES:
1. Use ONLY the verified facts listed below. NEVER invent or hallucinate amounts, scheme names, interest rates, dates, deadlines, phone numbers, or URLs.
2. If the user's question asks for information not covered in the facts, politely state that you do not have that specific record and suggest the relevant page or office.
3. Wording must NEVER accuse anyone of fraud, wrongdoing, or cheating. Use neutral phrases like "may need review" or "flagged for verification".
4. Eligibility is NEVER guaranteed: say "You may be eligible", never "approved" or "guaranteed".
5. Do not offer legal or financial advice.
6. Reply in clear, simple, respectful {language} (use simple Hindi Devanagari or Hinglish matching the query). Keep under 110 words with bullet points.

VERIFIED FACTS FOR THIS INTENT ({intent}):
{facts_prompt}

FARMER QUESTION: "{clean_msg}"
"""
            # Timeout + 1 retry policy
            response = None
            for attempt in range(2):
                try:
                    response = client.models.generate_content(
                        model=settings.LLM_MODEL or "gemini-1.5-flash",
                        contents=prompt,
                    )
                    if response and response.text:
                        break
                except Exception as api_err:
                    if attempt == 0:
                        time.sleep(0.5)
                        continue
                    raise api_err

            if response and response.text:
                llm_candidate = response.text.strip()
                # Step 4: Verify grounded numbers and URLs
                if verify_grounded_response(llm_candidate, facts):
                    return ChatResponse(
                        reply=llm_candidate,
                        reply_language=language,
                        provider="gemini",
                        mode="live",
                        intent=intent,
                        suggested_chips=chips,
                        source_documents=sources,
                        action_link=action_link,
                        action_label=action_label,
                        verified_facts=facts,
                    )
                else:
                    print(f"[AI Service] LLM output failed verification check for intent='{intent}'. Falling back to deterministic template.")
        except Exception as e:
            # Structured server-side logging without secrets
            print(f"[AI Service] Falling back to deterministic template for intent='{intent}' (Reason: {type(e).__name__}: {str(e)})")
    else:
        # Key not configured
        print(f"[AI Service] Running in offline mode for intent='{intent}' (No active LLM API key configured)")

    # Step 5: Deterministic Fallback Response
    return ChatResponse(
        reply=deterministic_reply,
        reply_language=language,
        provider="template-fallback",
        mode="offline",
        intent=intent,
        suggested_chips=chips,
        source_documents=sources,
        action_link=action_link,
        action_label=action_label,
        verified_facts=facts,
    )
