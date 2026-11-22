"""
KisanVerify Scheme Eligibility Engine
======================================
Rule-based evaluation comparing farmer inputs against policy conditions.
Rule from Blueprint: Results must NOT be presented as guaranteed approval.
They must always be labeled 'Potentially Eligible' with required documents and deadlines.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class SchemeMatch(BaseModel):
    id: str
    scheme_code: str
    title: str
    title_hi: str
    category: str # "Subsidy", "Insurance", "Loan"
    description: str
    description_hi: str
    benefits: str
    benefits_hi: str
    eligibility_status: str # "Eligible", "Possibly Eligible", "Not Eligible"
    eligibility_label: str
    eligibility_label_hi: str
    reasons: List[str]
    reasons_hi: List[str]
    documents_required: List[str]
    deadline: str
    state: str

class EligibilityCheckRequest(BaseModel):
    state: str = "Chhattisgarh"
    district: str = "Durg"
    crop: str = "Paddy"
    land_holding_acres: float = 3.0
    farmer_category: str = "Small Farmer" # "Marginal Farmer", "Small Farmer", "Large Farmer"
    loan_status: str = "Yes" # "Yes", "No"
    kcc_active: Optional[bool] = True

class EligibilityCheckResponse(BaseModel):
    farmer_profile_summary: Dict[str, Any]
    schemes_count: int
    eligible_count: int
    possibly_eligible_count: int
    disclaimer: str
    disclaimer_hi: str
    schemes: List[SchemeMatch]


def evaluate_eligibility(
    state: str,
    district: str,
    crop: str,
    land_holding_acres: float,
    farmer_category: str = "Small Farmer",
    loan_status: str = "Yes"
) -> EligibilityCheckResponse:
    """
    Evaluates farmer inputs deterministically against government scheme criteria.
    """
    acres = float(land_holding_acres)
    crop_clean = crop.strip().title()
    state_clean = state.strip().title()
    cat_clean = farmer_category.strip().title()
    has_loan = loan_status.strip().lower() in ["yes", "true", "1"]

    matches: List[SchemeMatch] = []

    # 1. PM-KISAN Samman Nidhi
    # Criteria: Landholders (small, marginal, large) with valid land records
    pm_kisan_eligible = acres > 0 and acres <= 50.0
    matches.append(
        SchemeMatch(
            id="sch-pm-kisan",
            scheme_code="PM-KISAN",
            title="PM-KISAN Samman Nidhi",
            title_hi="पीएम-किसान सम्मान निधि",
            category="Subsidy",
            description="Central sector scheme providing ₹6,000 per year income support in three equal 4-monthly installments.",
            description_hi="किसानों को प्रति वर्ष ₹6,000 की आय सहायता तीन समान 4-मासिक किश्तों में सीधे बैंक खाते में।",
            benefits="₹6,000 / year via Direct Benefit Transfer (DBT)",
            benefits_hi="₹6,000 प्रति वर्ष सीधे बैंक खाते में (डीबीटी)",
            eligibility_status="Eligible" if pm_kisan_eligible else "Not Eligible",
            eligibility_label="Eligible (Potentially)",
            eligibility_label_hi="पात्र (संभावित)",
            reasons=[
                f"Land holding of {acres} acres qualifies under operational landholder norms.",
                "Direct Benefit Transfer linked to Aadhaar bank account.",
            ],
            reasons_hi=[
                f"{acres} एकड़ की भूमि परिचालन जोत मानदंडों के अंतर्गत आती है।",
                "आधार से जुड़े बैंक खाते में प्रत्यक्ष लाभ अंतरण।",
            ],
            documents_required=[
                "Aadhaar Card",
                "Land Ownership Record (B-1/Khasra Copy)",
                "Bank Passbook with active DBT / NPCI seeding",
            ],
            deadline="Apply by 31 Dec 2025",
            state="All India",
        )
    )

    # 2. Pradhan Mantri Fasal Bima Yojana (PMFBY)
    # Criteria: Notified crops (Paddy, Wheat, Pulses) in notified state
    notified_crops = ["Paddy", "Wheat", "Maize", "Soybean", "Pulses", "Oilseeds", "Cotton", "Sugarcane"]
    pmfby_eligible = crop_clean in notified_crops or any(c in crop_clean for c in notified_crops)
    matches.append(
        SchemeMatch(
            id="sch-pmfby",
            scheme_code="PMFBY",
            title="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            title_hi="प्रधानमंत्री फसल बीमा योजना",
            category="Insurance",
            description="Comprehensive risk insurance for crop loss from sowing to post-harvest due to flood, drought, pests, or hail.",
            description_hi="बाढ़, सूखा, कीट या ओलावृष्टि से बुवाई से लेकर कटाई तक फसल नुकसान के लिए व्यापक जोखिम बीमा।",
            benefits="Up to ₹50,000/acre insurance sum assured; farmer share only 2% premium",
            benefits_hi="₹50,000/एकड़ तक की बीमा राशि; किसान का हिस्सा केवल 2% प्रीमियम",
            eligibility_status="Eligible" if pmfby_eligible else "Possibly Eligible",
            eligibility_label="Eligible (Potentially)",
            eligibility_label_hi="पात्र (संभावित)",
            reasons=[
                f"{crop_clean} is a notified crop for Kharif/Rabi seasons in {district}.",
                "Covers localized calamities and post-harvest cyclone/hailstorm risks.",
            ],
            reasons_hi=[
                f"{crop_clean} {district} जिले में खरीफ/रबी मौसम की अधिसूचित फसल है।",
                "स्थानीयकृत आपदाओं और कटाई उपरांत ओलावृष्टि जोखिमों को कवर करता है।",
            ],
            documents_required=[
                "Patwari Girdawari Sowing Certificate",
                "Land Record (Khasra/B-1)",
                "Aadhaar Card",
                "Bank Account Mandate Form",
            ],
            deadline="Apply by 31 Mar 2026",
            state="All India",
        )
    )

    # 3. Kisan Credit Card (KCC)
    # Criteria: Landholding >= 0.1 acres, owner cultivator
    kcc_eligible = acres >= 0.1
    matches.append(
        SchemeMatch(
            id="sch-kcc",
            scheme_code="KCC",
            title="Kisan Credit Card (KCC)",
            title_hi="किसान क्रेडिट कार्ड (केसीसी)",
            category="Loan",
            description="Institutional short-term crop loan facility @ 7% p.a. with an extra 3% prompt repayment incentive, bringing effective rate to 4%.",
            description_hi="संस्थागत अल्पकालिक फसल ऋण 7% पर, समय पर भुगतान करने पर 3% अतिरिक्त छूट के साथ प्रभावी दर 4%।",
            benefits="Credit limit up to ₹3,00,000 with 3% prompt repayment subvention",
            benefits_hi="3% ब्याज छूट के साथ ₹3,00,000 तक की ऋण सुविधा",
            eligibility_status="Eligible" if kcc_eligible else "Possibly Eligible",
            eligibility_label="Eligible (Potentially)",
            eligibility_label_hi="पात्र (संभावित)",
            reasons=[
                f"{acres} acres provides sufficient scale of finance for crop cultivation credit.",
                "Prompt repayment lowers effective interest rate from 7% to 4%.",
            ],
            reasons_hi=[
                f"{acres} एकड़ भूमि फसल ऋण के लिए पर्याप्त वित्त पैमाना प्रदान करती है।",
                "समय पर भुगतान से प्रभावी ब्याज दर 7% से घटकर 4% हो जाती है।",
            ],
            documents_required=[
                "Land Title (B-1 / Rin Pustika copy)",
                "Passport Size Photograph",
                "No-Dues Certificate from adjacent PACS / Banks",
                "Aadhaar & PAN Card",
            ],
            deadline="Apply by 31 Dec 2025",
            state="All India",
        )
    )

    # 4. Input Subsidy Scheme (State-specific: Chhattisgarh)
    is_cg = "chhattisgarh" in state_clean.lower()
    is_small = cat_clean in ["Small Farmer", "Marginal Farmer"] or acres <= 5.0
    input_status = "Eligible" if (is_cg and is_small) else ("Possibly Eligible" if is_cg else "Possibly Eligible")

    matches.append(
        SchemeMatch(
            id="sch-input-sub",
            scheme_code="INPUT-SUB",
            title="Input Subsidy Scheme (Chhattisgarh)",
            title_hi="कृषि आदान सहायता योजना (छत्तीसगढ़)",
            category="Subsidy",
            description="State subsidy on certified seeds, micronutrients, bio-fertilizers and farm implements for paddy and pulse growers.",
            description_hi="धान और दलहन उत्पादकों के लिए प्रमाणित बीज, सूक्ष्म पोषक तत्वों और कृषि यंत्रों पर राज्य सब्सिडी।",
            benefits="Subsidy on seeds, fertilizers, and farm equipment up to ₹9,000/acre",
            benefits_hi="बीज, खाद और उपकरणों पर ₹9,000/एकड़ तक की सब्सिडी",
            eligibility_status=input_status,
            eligibility_label="Possibly Eligible" if input_status == "Possibly Eligible" else "Eligible (Potentially)",
            eligibility_label_hi="संभावित पात्र" if input_status == "Possibly Eligible" else "पात्र (संभावित)",
            reasons=[
                f"Small/marginal farmer profile in {district}, Chhattisgarh is targeted for input assistance.",
                "Subject to registration on the state agricultural portal (Rajiv Gandhi Kisan Nyay / Kisaan Portal).",
            ],
            reasons_hi=[
                f"{district}, छत्तीसगढ़ में लघु/सीमांत किसान आदान सहायता के लक्षित लाभार्थी हैं।",
                "राज्य कृषि पोर्टल पर किसान पंजीयन के अधीन।",
            ],
            documents_required=[
                "Kisan Rin Pustika (KRP)",
                "Mandi Farmer Registration Slip (Kisan Panjiyan)",
                "Aadhaar Card",
            ],
            deadline="Check details at local Krishi Kendra",
            state="Chhattisgarh",
        )
    )

    eligible_cnt = sum(1 for m in matches if m.eligibility_status == "Eligible")
    possibly_cnt = sum(1 for m in matches if m.eligibility_status == "Possibly Eligible")

    return EligibilityCheckResponse(
        farmer_profile_summary={
            "state": state,
            "district": district,
            "crop": crop,
            "land_holding_acres": acres,
            "farmer_category": farmer_category,
            "loan_status": loan_status,
        },
        schemes_count=len(matches),
        eligible_count=eligible_cnt,
        possibly_eligible_count=possibly_cnt,
        disclaimer="Results are indicative and represent potential eligibility. They do not constitute a guarantee of approval. Validate against official government notifications.",
        disclaimer_hi="परिणाम सांकेतिक हैं और संभावित पात्रता दर्शाते हैं। ये स्वीकृति की गारंटी नहीं हैं। आधिकारिक सरकारी अधिसूचनाओं से पुष्टि करें।",
        schemes=matches,
    )
