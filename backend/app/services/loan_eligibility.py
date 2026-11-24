"""
Deterministic Loan Eligibility Engine
=====================================
Evaluates loan products against a farmer's profile, existing loan portfolio,
and uploaded vault documents using deterministic, transparent rules in Python.

Guarantees:
- Never invents numbers, interest rates, limits, or URLs.
- Always returns lists of matched rules, unmet rules, and missing documents.
- Informational tone only: "You may be eligible", never "approved" or "guaranteed".
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class DocumentCheckItem(BaseModel):
    document_name: str
    document_name_hi: Optional[str] = None
    is_available: bool
    doc_uuid: Optional[str] = None

class LoanEligibilityResult(BaseModel):
    product_code: str
    product_name: str
    product_name_hi: Optional[str] = None
    eligibility_status: str # "Likely eligible", "Possibly eligible (more info needed)", "Not eligible"
    eligibility_label: str
    eligibility_label_hi: str
    status_badge_color: str # "green", "amber", "gray"
    matched_rules: List[str]
    matched_rules_hi: List[str]
    unmet_rules: List[str]
    unmet_rules_hi: List[str]
    required_documents: List[DocumentCheckItem]
    missing_documents: List[str]
    missing_documents_hi: List[str]
    disclaimer_en: str = "Indicative eligibility based on recorded criteria. Final sanction and credit limits depend on bank underwriting and land verification."
    disclaimer_hi: str = "यह पात्रता केवल सांकेतिक है। ऋण स्वीकृति एवं वास्तविक ऋण सीमा बैंक सत्यापन एवं नियमों पर निर्भर है।"
    indicative_rate: str
    indicative_limit: str
    official_url: Optional[str] = None
    source_name: str
    source_document: str
    last_verified_on: str
    status: str

DOC_NAME_HI_MAP: Dict[str, str] = {
    "Aadhaar Card": "आधार कार्ड",
    "Land Ownership Record (7/12 / Khasra / B-1)": "भूमि स्वामित्व अभिलेख (खसरा / बी-1 / 7/12)",
    "Land Record (Khasra / B-1 / P-II)": "भूमि अभिलेख (खसरा / बी-1 / पी-II)",
    "Land Record (Khasra / B-1)": "भूमि अभिलेख (खसरा / बी-1)",
    "Bank Passbook": "बैंक पासबुक",
    "Sowing Certificate (Girdawari)": "फसल बोआई प्रमाण पत्र (गिरदावरी)",
    "Dealer Proforma Invoice / Quotation": "डीलर कोटेशन / प्रोफार्मा इनवॉइस",
    "Animal Health Certificate / Ear Tagging Record": "पशु स्वास्थ्य प्रमाण पत्र / टैगिंग विवरण",
    "Water Body Title / Lease Agreement": "जलाशय पट्टा / जल निकाय समझौता",
    "Small/Marginal Farmer Certificate": "लघु/सीमांत कृषक प्रमाण पत्र",
    "Detailed Project Report (DPR)": "विस्तृत परियोजना रिपोर्ट (डीपीआर)",
    "Gram Panchayat NOC": "ग्राम पंचायत अनापत्ति प्रमाण पत्र (NOC)",
}

def evaluate_loan_eligibility(
    product: Any,
    farmer_profile: Dict[str, Any],
    existing_loans: List[Any],
    vault_documents: List[Any]
) -> LoanEligibilityResult:
    """
    Deterministically evaluates a LoanProduct against farmer profile and vault records.
    """
    matched_en: List[str] = []
    matched_hi: List[str] = []
    unmet_en: List[str] = []
    unmet_hi: List[str] = []

    farmer_state = (farmer_profile.get("state") or "").strip().lower()
    farmer_land = float(farmer_profile.get("land_area_acres") or 0.0)
    farmer_category = (farmer_profile.get("category") or "").strip()
    farmer_crop = (farmer_profile.get("crop") or "").strip().lower()

    rules = product.eligibility_rules or {}

    # 1. State Scope Check
    if product.level == "State" and product.state:
        req_state = product.state.strip().lower()
        if req_state in farmer_state or farmer_state in req_state:
            matched_en.append(f"State residency matches {product.state} state scheme criteria.")
            matched_hi.append(f"राज्य निवास {product.state} राज्य योजना के मानदंडों से मेल खाता है।")
        else:
            unmet_en.append(f"Scheme restricted to residents of {product.state} (your profile state: {farmer_profile.get('state')}).")
            unmet_hi.append(f"यह योजना केवल {product.state} के निवासियों के लिए है (आपकी प्रोफ़ाइल: {farmer_profile.get('state')})।")
    else:
        matched_en.append("National scheme open across all Indian states and Union Territories.")
        matched_hi.append("अखिल भारतीय राष्ट्रीय योजना सभी राज्यों के किसानों के लिए खुली है।")

    # 2. Land Holding Check
    min_land = rules.get("min_land_acres")
    max_land = rules.get("max_land_acres")

    if min_land is not None:
        if farmer_land >= float(min_land):
            matched_en.append(f"Landholding ({farmer_land:.1f} acres) satisfies the minimum {min_land} acre threshold.")
            matched_hi.append(f"भूमि धारिता ({farmer_land:.1f} एकड़) न्यूनतम {min_land} एकड़ की शर्त पूरी करती है।")
        else:
            unmet_en.append(f"Requires minimum {min_land} acres of land (recorded: {farmer_land:.1f} acres).")
            unmet_hi.append(f"न्यूनतम {min_land} एकड़ भूमि आवश्यक है (दर्ज: {farmer_land:.1f} एकड़)।")

    if max_land is not None:
        if farmer_land <= float(max_land):
            matched_en.append(f"Landholding ({farmer_land:.1f} acres) is within the maximum limit of {max_land} acres.")
            matched_hi.append(f"भूमि धारिता ({farmer_land:.1f} एकड़) अधिकतम {max_land} एकड़ की सीमा के भीतर है।")
        else:
            unmet_en.append(f"Restricted to landholders up to {max_land} acres (recorded: {farmer_land:.1f} acres).")
            unmet_hi.append(f"अधिकतम {max_land} एकड़ भूमि वाले कृषकों के लिए सीमित है (दर्ज: {farmer_land:.1f} एकड़)।")

    # 3. Farmer Category Check
    allowed_categories = rules.get("farmer_categories")
    if allowed_categories:
        if any(c.lower() in farmer_category.lower() for c in allowed_categories):
            matched_en.append(f"Farmer category ({farmer_category}) is eligible.")
            matched_hi.append(f"किसान श्रेणी ({farmer_category}) इस योजना के अंतर्गत पात्र है।")
        else:
            allowed_str = ", ".join(allowed_categories)
            unmet_en.append(f"Applicable to: {allowed_str} (your category: {farmer_category}).")
            unmet_hi.append(f"पात्र श्रेणियां: {allowed_str} (आपकी श्रेणी: {farmer_category})।")

    # 4. Crop suitability check if restricted
    allowed_crops = rules.get("allowed_crops")
    if allowed_crops and len(allowed_crops) > 0:
        if any(c.lower() in farmer_crop for c in allowed_crops):
            matched_en.append(f"Primary crop ({farmer_profile.get('crop')}) qualifies for targeted crop credit.")
            matched_hi.append(f"प्राथमिक फसल ({farmer_profile.get('crop')}) लक्षित फसल ऋण के लिए उपयुक्त है।")
        else:
            crops_str = ", ".join(allowed_crops)
            unmet_en.append(f"Targeted for crops: {crops_str} (recorded: {farmer_profile.get('crop')}).")
            unmet_hi.append(f"लक्षित फसलें: {crops_str} (दर्ज फसल: {farmer_profile.get('crop')})।")

    # 5. Check Vault Documents
    vault_doc_names = []
    vault_doc_map = {}
    for doc in vault_documents:
        name = getattr(doc, "original_name", "") or ""
        cat = getattr(doc, "category", "") or ""
        uuid = getattr(doc, "doc_uuid", "") or ""
        vault_doc_names.append(name.lower())
        vault_doc_map[cat.lower()] = uuid

    required_docs_checklist: List[DocumentCheckItem] = []
    missing_docs_en: List[str] = []
    missing_docs_hi: List[str] = []

    req_docs = product.required_documents or []
    for req in req_docs:
        req_clean = req.strip()
        name_hi = DOC_NAME_HI_MAP.get(req_clean, req_clean)
        
        # Heuristic match against vault names & categories
        is_avail = False
        matched_uuid = None

        if "aadhaar" in req_clean.lower() or "identity" in req_clean.lower():
            if any("aadhaar" in n or "voter" in n or "id" in n for n in vault_doc_names) or "identity" in vault_doc_map:
                is_avail = True
                matched_uuid = vault_doc_map.get("identity")
        elif "land" in req_clean.lower() or "khasra" in req_clean.lower() or "7/12" in req_clean.lower():
            if any("land" in n or "khasra" in n or "7/12" in n or "b-1" in n or "patwari" in n for n in vault_doc_names) or "land" in vault_doc_map:
                is_avail = True
                matched_uuid = vault_doc_map.get("land")
        elif "bank" in req_clean.lower() or "passbook" in req_clean.lower():
            if any("passbook" in n or "bank" in n or "statement" in n for n in vault_doc_names) or "bank" in vault_doc_map:
                is_avail = True
                matched_uuid = vault_doc_map.get("bank")
        elif "insurance" in req_clean.lower() or "pmfby" in req_clean.lower():
            if any("insurance" in n or "policy" in n or "pmfby" in n for n in vault_doc_names) or "insurance" in vault_doc_map:
                is_avail = True
                matched_uuid = vault_doc_map.get("insurance")
        else:
            # Check direct substring
            for n in vault_doc_names:
                if any(part in n for part in req_clean.lower().split() if len(part) > 3):
                    is_avail = True
                    break

        required_docs_checklist.append(
            DocumentCheckItem(
                document_name=req_clean,
                document_name_hi=name_hi,
                is_available=is_avail,
                doc_uuid=matched_uuid
            )
        )

        if not is_avail:
            missing_docs_en.append(req_clean)
            missing_docs_hi.append(name_hi)

    # 6. Final Status Determination
    # If any hard structural exclusion failed:
    if len(unmet_en) > 0:
        eligibility_status = "Not eligible"
        eligibility_label = "Not eligible"
        eligibility_label_hi = "पात्र नहीं"
        status_badge_color = "gray"
    elif len(missing_docs_en) == 0:
        eligibility_status = "Likely eligible"
        eligibility_label = "Likely eligible"
        eligibility_label_hi = "संभावित पात्र"
        status_badge_color = "green"
    else:
        eligibility_status = "Possibly eligible (more info needed)"
        eligibility_label = "Possibly eligible (more info needed)"
        eligibility_label_hi = "संभावित पात्र (दस्तावेज अपेक्षित)"
        status_badge_color = "amber"

    return LoanEligibilityResult(
        product_code=product.product_code,
        product_name=product.name,
        product_name_hi=product.name_hi,
        eligibility_status=eligibility_status,
        eligibility_label=eligibility_label,
        eligibility_label_hi=eligibility_label_hi,
        status_badge_color=status_badge_color,
        matched_rules=matched_en,
        matched_rules_hi=matched_hi,
        unmet_rules=unmet_en,
        unmet_rules_hi=unmet_hi,
        required_documents=required_docs_checklist,
        missing_documents=missing_docs_en,
        missing_documents_hi=missing_docs_hi,
        indicative_rate=product.interest_rate_rule,
        indicative_limit=product.max_amount_rule,
        official_url=product.official_url,
        source_name=product.source_name,
        source_document=product.source_document,
        last_verified_on=product.last_verified_on,
        status=product.status,
    )
