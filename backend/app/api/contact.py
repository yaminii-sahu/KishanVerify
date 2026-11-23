import datetime
import random
import re
import time
from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.models import ContactMessage

router = APIRouter(prefix="/contact", tags=["Contact Us & Helplines"])

# In-memory rate limiting map: ip -> last_submission_timestamp
_IP_RATE_LIMIT: Dict[str, float] = {}
RATE_LIMIT_COOLDOWN_SECONDS = 10.0

VERIFIED_HELPLINES = [
    {
        "code": "GOI-KCC",
        "title": "Kisan Call Centre (All India)",
        "title_hi": "किसान कॉल सेंटर (अखिल भारतीय)",
        "number": "1800-180-1551",
        "department": "Ministry of Agriculture & Farmers Welfare, GoI",
        "hours": "6:00 AM - 10:00 PM (All 7 Days)",
        "languages": "22 Official Languages (Hindi, Chhattisgarhi, English, etc.)",
        "description": "Toll-free telephonic agricultural extension service answering queries on farming, seeds, pests, weather, and technologies.",
        "description_hi": "खेती, बीज, कीट नियंत्रण, मौसम और नई तकनीकों पर सभी 22 आधिकारिक भाषाओं में निःशुल्क कृषि सलाह।",
        "is_toll_free": True,
        "verified": True,
    },
    {
        "code": "GOI-PM-KISAN",
        "title": "PM-KISAN National Helpline",
        "title_hi": "पीएम-किसान राष्ट्रीय हेल्पलाइन",
        "number": "155261",
        "alt_number": "011-24300606",
        "department": "PM-KISAN Nodal Unit, MoA&FW",
        "hours": "Mon-Sat: 9:30 AM - 6:00 PM",
        "languages": "Hindi, English",
        "description": "Inquiries regarding installment status, e-KYC validation, Aadhaar bank seeding, and rejected beneficiary accounts.",
        "description_hi": "किस्त की स्थिति, ई-केवाईसी सत्यापन, आधार बैंक सीडिंग और खारिज किए गए खातों से संबंधित आधिकारिक सहायता।",
        "is_toll_free": True,
        "verified": True,
    },
    {
        "code": "GOI-PMFBY",
        "title": "Pradhan Mantri Fasal Bima Helpline",
        "title_hi": "प्रधानमंत्री फसल बीमा हेल्पलाइन",
        "number": "14447",
        "department": "Department of Agriculture & Farmers Welfare",
        "hours": "Mon-Sat: 9:00 AM - 7:00 PM",
        "languages": "Hindi, English, Regional Languages",
        "description": "Assistance on crop loss intimation (within 72 hours), surveyor contacts, policy certificate download, and claim settlement.",
        "description_hi": "72 घंटे के भीतर फसल नुकसान सूचना, सर्वेक्षक संपर्क, बीमा पॉलिसी डाउनलोड और क्लेम निपटान सहायता।",
        "is_toll_free": True,
        "verified": True,
    },
    {
        "code": "GOI-RBI",
        "title": "Banking Ombudsman (RBI Financial Redressal)",
        "title_hi": "बैंकिंग लोकपाल (आरबीआई वित्तीय समाधान)",
        "number": "14440",
        "department": "Reserve Bank of India",
        "hours": "Mon-Fri: 9:30 AM - 5:15 PM",
        "languages": "Hindi, English",
        "description": "Redressal for wrongful interest charges, excess processing fees on KCC loans below ₹3 Lakh, or withheld subsidies.",
        "description_hi": "केसीसी ऋण पर गलत ब्याज, ₹3 लाख से कम पर अवैध प्रोसेसिंग शुल्क या रोकी गई ब्याज सब्सिडी के लिए शिकायत।",
        "is_toll_free": True,
        "verified": True,
    },
    {
        "code": "CG-AGRI-DESK",
        "title": "Chhattisgarh Krishi Samvaad Helpline",
        "title_hi": "छत्तीसगढ़ कृषि संवाद हेल्पलाइन",
        "number": "0771-2442537",
        "department": "Directorate of Agriculture, Govt. of Chhattisgarh, Raipur",
        "hours": "Mon-Fri: 10:00 AM - 5:30 PM",
        "languages": "Chhattisgarhi, Hindi",
        "description": "State input subsidy assistance (Rajiv Gandhi / Krishak Unnati), paddy procurement bonus, seed certification, and mandi grievances.",
        "description_hi": "राज्य आदान सहायता (राजीव गांधी / कृषक उन्नति), धान अंतर राशि, प्रमाणित बीज और स्थानीय मंडी समाधान।",
        "is_toll_free": False,
        "verified": True,
    },
]

class HelplineItem(BaseModel):
    code: str
    title: str
    title_hi: Optional[str] = None
    number: str
    alt_number: Optional[str] = None
    department: str
    hours: str
    languages: str
    description: str
    description_hi: Optional[str] = None
    is_toll_free: bool
    verified: bool

class ContactSubmitPayload(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = Field(None, max_length=100)
    category: str = Field(..., max_length=50)
    message: str = Field(..., min_length=5, max_length=2000)
    attached_doc_uuid: Optional[str] = None
    farmer_id: Optional[str] = None
    website_url: Optional[str] = None  # Honeypot field (must remain empty)

class ContactSubmitResponse(BaseModel):
    ticket_id: str
    status: str
    message: str
    turnaround_time: str
    created_at: str

@router.get("/helplines", response_model=List[HelplineItem])
def get_verified_helplines():
    """Return list of verified official government agricultural helplines."""
    return VERIFIED_HELPLINES

@router.post("/submit", response_model=ContactSubmitResponse)
def submit_contact_form(
    payload: ContactSubmitPayload,
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Submit platform inquiry or grievance ticket with honeypot spam protection
    and ticket reference generation.
    """
    # 1. Honeypot check: If the hidden honeypot field is filled, reject silently or with 400
    if payload.website_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Spam submission detected by security filter."
        )

    # 2. Rate limiting check
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    last_time = _IP_RATE_LIMIT.get(client_ip, 0.0)
    if (now - last_time) < RATE_LIMIT_COOLDOWN_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait a few seconds before submitting another request."
        )
    _IP_RATE_LIMIT[client_ip] = now

    # 3. Clean and validate phone number
    cleaned_phone = re.sub(r"[^\d+]", "", payload.phone)
    if len(re.sub(r"[^\d]", "", cleaned_phone)) < 10:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide a valid 10-digit mobile number."
        )

    # 4. Generate unique trackable ticket ID: TKT-YYYY-XXXX
    current_year = datetime.datetime.now().year
    random_code = random.randint(1000, 9999)
    ticket_id = f"TKT-{current_year}-{random_code}"

    # Check for rare collision
    existing = db.query(ContactMessage).filter_by(ticket_id=ticket_id).first()
    if existing:
        ticket_id = f"TKT-{current_year}-{random.randint(10000, 99999)}"

    # 5. Persist to database
    record = ContactMessage(
        ticket_id=ticket_id,
        farmer_id=payload.farmer_id or "FV12345",
        name=payload.name.strip(),
        phone=cleaned_phone,
        email=payload.email.strip() if payload.email else None,
        category=payload.category.strip(),
        message=payload.message.strip(),
        attached_doc_uuid=payload.attached_doc_uuid,
        status="Open",
    )
    db.add(record)
    db.commit()

    return ContactSubmitResponse(
        ticket_id=ticket_id,
        status="Received",
        message="Your message has been received. Our agriculture verification support team will review your query.",
        turnaround_time="Within 24 business hours",
        created_at=datetime.datetime.utcnow().isoformat(),
    )
