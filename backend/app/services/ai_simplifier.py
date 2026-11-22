"""
KisanVerify AI Policy Simplifier & Chat Service
===============================================
Explains already-computed financial verification records and government scheme
policies in accessible Hindi, Hinglish, or English.
Graceful fallback: Works seamlessly via smart template-based policy rules
when no GEMINI_API_KEY is configured.
"""

import os
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.core.config import settings

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "hi" # "hi", "en", "hinglish"
    farmer_id: Optional[str] = "FV12345"
    history: Optional[List[ChatMessage]] = []
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    reply: str
    reply_language: str
    provider: str # "gemini" or "template-fallback"
    suggested_chips: List[str]
    source_documents: List[str]

# Pre-indexed knowledge base for graceful fallback
FALLBACK_KNOWLEDGE = {
    "insurance": {
        "hi": (
            "आपका फसल बीमा (PMFBY) दावा अभी 'Under Review' स्थिति में है।\n\n"
            "• किसान आईडी: FV12345\n"
            "• फसल: धान (खरीफ 2024)\n"
            "• दावा संदर्भ: INS-2024-7711\n"
            "• निर्धारित दावा: ₹30,000 | प्राप्त: ₹20,000 | शेष: ₹10,000\n\n"
            "संभावित कारण: फसल कटाई प्रयोग (CCE) उपज निर्धारण का सत्यापन चल रहा है और राज्य सब्सिडी अंश की द्वितीय किश्त प्रतीक्षित है। "
            "यदि 15 दिनों में भुगतान नहीं आता है, तो आप इसी पोर्टल से शिकायत दर्ज कर सकते हैं।"
        ),
        "en": (
            "Your PMFBY crop insurance claim is currently recorded as 'Under Review'.\n\n"
            "• Farmer ID: FV12345\n"
            "• Crop: Paddy (Kharif 2024)\n"
            "• Claim Ref: INS-2024-7711\n"
            "• Assessed Claim: ₹30,000 | Received: ₹20,000 | Pending: ₹10,000\n\n"
            "Reason: Crop Cutting Experiment (CCE) threshold yield assessment is ongoing, and the second subsidy tranche is in administrative clearance. "
            "You can download the claim report or raise a grievance through the portal if delayed beyond 15 days."
        ),
    },
    "loan": {
        "hi": (
            "आपके किसान क्रेडिट कार्ड (KCC) ऋण में ₹10,000 का अंतर समीक्षा के लिए चिन्हित है:\n\n"
            "• स्वीकृत राशि: ₹80,000\n"
            "• वितरित राशि: ₹70,000\n"
            "• अंतर: ₹10,000 (समीक्षा आवश्यक)\n"
            "• दर्ज कटौतियां: ₹5,000 (प्रोसेसिंग शुल्क ₹2,000 + फसल बीमा प्रीमियम ₹3,000)\n\n"
            "ध्यान दें: यह कोई धोखाधड़ी नहीं है। बैंक प्रभार और बीमा प्रीमियम कटौतियों के कारण वितरित राशि कम हो सकती है। "
            "शाखा प्रबंधक से सत्यापित करने के लिए आप 'View Detailed Report' से पीडीएफ डाउनलोड कर सकते हैं।"
        ),
        "en": (
            "Your KCC loan record shows a ₹10,000 difference flagged for administrative review:\n\n"
            "• Approved Limit: ₹80,000\n"
            "• Disbursed into Account: ₹70,000\n"
            "• Gross Difference: ₹10,000\n"
            "• Recorded Deductions: ₹5,000 (Processing charges + PMFBY premium)\n\n"
            "Important: A discrepancy flag is not proof of wrongdoing. Bank documentation charges or insurance auto-debit often account for variations. "
            "Download your detailed verification report to present to the State Bank of India branch."
        ),
    },
    "msp": {
        "hi": (
            "धान उपार्जन (MSP) भुगतान का हिसाब:\n\n"
            "• बेची गई मात्रा: 50 क्विंटल\n"
            "• सरकारी दर: ₹2,300 प्रति क्विंटल\n"
            "• अपेक्षित भुगतान: ₹1,15,000\n"
            "• खाते में जमा: ₹1,05,000\n"
            "• अंतर: ₹10,000\n\n"
            "संभावित कारण: मंडी में नमी छूट (FAQ ग्रेड कटौती) या दो किश्तों में भुगतान की व्यवस्था। "
            "अपनी मंडी जे-फॉर्म रसीद की जांच करें या पाटन मंडी समिति में संपर्क करें।"
        ),
        "en": (
            "Here is the breakdown of your MSP crop procurement payment:\n\n"
            "• Procured Quantity: 50 quintals\n"
            "• Official MSP: ₹2,300 / quintal\n"
            "• Expected Payment: ₹1,15,000\n"
            "• Disbursed into Account: ₹1,05,000\n"
            "• Difference: ₹10,000\n\n"
            "Common Reasons: Moisture discount / refraction standard applied, or staged payment by the procurement agency. "
            "Check your J-Form receipt or file an inquiry with the Patan Mandi Samiti."
        ),
    },
    "documents": {
        "hi": (
            "कृषि योजनाओं और ऋण सत्यापन के लिए आवश्यक मुख्य दस्तावेज़:\n\n"
            "1. आधार कार्ड (बैंक खाते और डीबीटी से लिंक)\n"
            "2. भूमि रिकॉर्ड (बी-1 / खसरा / किसान किताब की प्रति)\n"
            "3. पटवारी गिरदावरी प्रमाण पत्र (फसल बुवाई पुष्टि)\n"
            "4. बैंक पासबुक का मुख्य पृष्ठ (आईएफएससी सहित)\n"
            "5. मंडी उपार्जन रसीद / जे-फॉर्म (एमएसपी दावों के लिए)"
        ),
        "en": (
            "Essential documents required for agricultural schemes & verification:\n\n"
            "1. Aadhaar Card (seeded with bank account for DBT)\n"
            "2. Land Records (B-1 / Khasra / Rin Pustika copy)\n"
            "3. Patwari Girdawari Certificate (sowing verification)\n"
            "4. Bank Passbook front page (showing clear IFSC & Account Number)\n"
            "5. Mandi J-Form / Procurement slip (for MSP claims)"
        ),
    },
    "contact": {
        "hi": (
            "दुर्ग (छत्तीसगढ़) जिले के महत्वपूर्ण सहायता संपर्क:\n\n"
            "• स्टेट बैंक ऑफ इंडिया (पाटन शाखा): 1800-425-3800\n"
            "• जिला उप संचालक कृषि कार्यालय, दुर्ग: 0788-2322401\n"
            "• पीएम-किसान हेल्पलाइन: 155261 / 011-24300606\n"
            "• फसल बीमा (PMFBY) टोल-फ्री: 1800-180-1551\n"
            "• जिला खाद्य एवं नागरिक आपूर्ति नियंत्रक (मंडी): 1967"
        ),
        "en": (
            "Important official contacts for Durg District, Chhattisgarh:\n\n"
            "• State Bank of India (Patan Branch): 1800-425-3800\n"
            "• Deputy Director of Agriculture, Durg: 0788-2322401\n"
            "• PM-KISAN National Helpline: 155261 / 011-24300606\n"
            "• Crop Insurance (PMFBY) Toll-Free: 1800-180-1551\n"
            "• District Food & Civil Supplies (MSP Mandi): 1967"
        ),
    },
}

def generate_ai_explanation(
    message: str,
    language: str = "hi",
    farmer_id: str = "FV12345",
    context: Optional[Dict[str, Any]] = None
) -> ChatResponse:
    """
    Generates transparent policy/financial explanations.
    Uses Gemini API if GEMINI_API_KEY is configured, otherwise uses template fallback.
    """
    msg_lower = message.lower()
    gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

    # Check if Gemini API key is available
    if gemini_key and len(gemini_key.strip()) > 10:
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=gemini_key)
            prompt = f"""
You are KisanVerify AI Assistant, an agricultural policy and financial transparency guide for Indian farmers.
Tagline: "Every rupee. Every benefit. Verified."
Beneficiary Profile: Farmer Ramesh Kumar (Farmer ID: FV12345), Village Patan, District Durg, Chhattisgarh.
Land: 3.0 Acres, Crop: Paddy. Bank: State Bank of India.

CRITICAL RULES:
1. Never invent or recalculate financial figures. Use only verified facts:
   - Loan: Approved ₹80,000, Disbursed ₹70,000, Difference ₹10,000 (Deductions ₹5,000)
   - MSP: 50 qtl @ ₹2,300 = ₹1,15,000 expected, ₹1,05,000 actual, Difference ₹10,000
   - Insurance: Claim ₹30,000 expected, ₹20,000 received, Status: Under Review
2. Wording must NEVER accuse fraud or wrongdoing. Use neutral phrasing like "needs review", "may need verification".
3. Reply in simple, respectful {language} (if Hindi, use clear simple Devanagari or Hinglish depending on prompt).
4. Keep the answer concise (under 120 words), structured with bullet points.

Farmer Question: "{message}"
"""
            response = client.models.generate_content(
                model=settings.LLM_MODEL or "gemini-1.5-flash",
                contents=prompt
            )
            if response.text:
                return ChatResponse(
                    reply=response.text.strip(),
                    reply_language=language,
                    provider="gemini",
                    suggested_chips=["Claim status", "Required documents", "Contact details", "Raise a Grievance"],
                    source_documents=["PMFBY Operational Guidelines", "KCC Scheme Circular", "MSP Gazette Notification"],
                )
        except Exception as e:
            # Fall back to template on any error
            print(f"Gemini API invocation note: {e}, using graceful template engine")

    # ==============================================================
    # Smart Template-Based Fallback Engine
    # ==============================================================
    lang_key = "hi" if language in ["hi", "hindi", "hinglish"] else "en"

    if any(w in msg_lower for w in ["insurance", "bima", "claim", "faasal", "fasal", "nuqsaan"]):
        reply = FALLBACK_KNOWLEDGE["insurance"][lang_key]
        chips = ["Explain loan difference", "Required documents", "Contact details"]
        sources = ["PMFBY Guidelines (2024)", "Chhattisgarh Crop Insurance Portal"]

    elif any(w in msg_lower for w in ["loan", "karz", "kcc", "rin", "bank", "disbursed", "approved", "rin pustika"]):
        reply = FALLBACK_KNOWLEDGE["loan"][lang_key]
        chips = ["Claim status", "MSP rates", "Raise a Grievance"]
        sources = ["RBI Priority Sector Lending Circular", "SBI Kisan Credit Card Norms"]

    elif any(w in msg_lower for w in ["msp", "rate", "payment", "paddy", "dhan", "wheat", "gehu", "mandi"]):
        reply = FALLBACK_KNOWLEDGE["msp"][lang_key]
        chips = ["Loan difference", "Insurance status", "Contact details"]
        sources = ["CACP Price Policy Kharif 2024", "Chhattisgarh Mandi Board Notification"]

    elif any(w in msg_lower for w in ["document", "kagaz", "patra", "dastavej", "proof", "require"]):
        reply = FALLBACK_KNOWLEDGE["documents"][lang_key]
        chips = ["Claim status", "Loan verification", "Contact details"]
        sources = ["State Agriculture Department Document Checklist"]

    elif any(w in msg_lower for w in ["contact", "helpline", "phone", "number", "sampark", "officer"]):
        reply = FALLBACK_KNOWLEDGE["contact"][lang_key]
        chips = ["Claim status", "Required documents", "Explain difference"]
        sources = ["Durg District Lead Bank Directory"]

    else:
        # Default welcoming response
        if lang_key == "hi":
            reply = (
                f"नमस्ते रमेश जी! मैं किसानवेरीफाई सहायक हूँ।\n\n"
                f"आपके रिकॉर्ड के अनुसार:\n"
                f"• ऋण (KCC): ₹10,000 की समीक्षा आवश्यक है।\n"
                f"• एमएसपी (धान): ₹10,000 का अंतर दर्ज है।\n"
                f"• फसल बीमा: ₹10,000 की दूसरी किश्त प्रक्रियाधीन है।\n\n"
                f"आप नीचे दिए गए विकल्पों में से किसी एक पर टैप करके या बोलकर पूछ सकते हैं।"
            )
        else:
            reply = (
                f"Namaste Ramesh Kumar! I am your KisanVerify transparency assistant.\n\n"
                f"According to your current records:\n"
                f"• Loan (KCC): ₹10,000 difference needs review.\n"
                f"• MSP (Paddy): ₹10,000 payment difference recorded.\n"
                f"• Insurance Claim: ₹10,000 second tranche under review.\n\n"
                f"You can ask about any of these records, scheme eligibility, or required documents."
            )
        chips = ["Claim status", "Explain loan difference", "Required documents", "Contact details"]
        sources = ["KisanVerify Beneficiary Ledger"]

    return ChatResponse(
        reply=reply,
        reply_language=lang_key,
        provider="template-fallback",
        suggested_chips=chips,
        source_documents=sources,
    )
