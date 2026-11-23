"""
KisanVerify Deterministic Verification Engine
=============================================
Core Principle:
All mathematical calculations and discrepancy detection are deterministic in Python.
The results are explainable, transparent, and neutral.
Wording must NEVER imply fraud or wrongdoing — discrepancies indicate records that
require administrative review.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from pydantic import BaseModel, Field, model_validator

class ArithmeticItem(BaseModel):
    label: str
    label_hi: str
    amount: float

class SourceCitation(BaseModel):
    rule_code: str
    scheme_name: str
    scheme_name_hi: Optional[str] = None
    rule_type: str = "guideline" # loan_disbursement, interest_subvention, processing_fee, msp, insurance_claim
    title: Optional[str] = None
    title_hi: Optional[str] = None
    formula_or_value: Optional[str] = None
    source_name: str = ""
    source_document: str = ""
    source_url: Optional[str] = None
    authority: Optional[str] = None
    authority_hi: Optional[str] = None
    document: Optional[str] = None
    document_hi: Optional[str] = None
    url: Optional[str] = None
    effective_from: str = "2024-04-01"
    effective_to: Optional[str] = None
    last_verified_on: str = "2025-04-10"
    status: str = "verified" # "verified", "demo", "unverified"
    data_origin: str = "official" # "official", "bank_document", "user_entered", "demo"
    field_associated: Optional[str] = None
    details: str = ""
    details_hi: str = ""

    @model_validator(mode="before")
    @classmethod
    def sync_aliases(cls, values: Any) -> Any:
        if isinstance(values, dict):
            # Sync source_name and authority
            if "authority" in values and not values.get("source_name"):
                values["source_name"] = values["authority"]
            elif "source_name" in values and not values.get("authority"):
                values["authority"] = values["source_name"]

            # Sync source_document and document
            if "document" in values and not values.get("source_document"):
                values["source_document"] = values["document"]
            elif "source_document" in values and not values.get("document"):
                values["document"] = values["source_document"]

            # Sync source_url and url
            if "url" in values and not values.get("source_url"):
                values["source_url"] = values["url"]
            elif "source_url" in values and not values.get("url"):
                values["url"] = values["source_url"]

            # Defaults for title and title_hi
            if not values.get("title"):
                values["title"] = values.get("scheme_name", "")
            if not values.get("title_hi"):
                values["title_hi"] = values.get("scheme_name_hi") or values.get("title", "")
        return values

# ---------------------------------------------------------------------------
# CITED STATUTORY & POLICY REGISTRY (Official Verified Benchmarks)
# ---------------------------------------------------------------------------

OFFICIAL_MSP_RULES: Dict[str, Dict[str, Any]] = {
    "Paddy": {
        "rule_code": "CACP-MSP-KHARIF-PADDY-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 2300.0,
        "season": "Kharif 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Kharif Crops: The Marketing Season 2024-25",
        "document_hi": "खरीफ फसलों के लिए मूल्य नीति: विपणन सत्र 2024-25 अधिसूचना",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-10-01",
        "effective_to": "2025-09-30",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Paddy (Common)": {
        "rule_code": "CACP-MSP-KHARIF-PADDY-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 2300.0,
        "season": "Kharif 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Kharif Crops: The Marketing Season 2024-25",
        "document_hi": "खरीफ फसलों के लिए मूल्य नीति: विपणन सत्र 2024-25 अधिसूचना",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-10-01",
        "effective_to": "2025-09-30",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Paddy (Grade A)": {
        "rule_code": "CACP-MSP-KHARIF-PADDY-A-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 2320.0,
        "season": "Kharif 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Kharif Crops: The Marketing Season 2024-25 (Grade A)",
        "document_hi": "खरीफ फसलों के लिए मूल्य नीति: विपणन सत्र 2024-25 (ग्रेड ए)",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-10-01",
        "effective_to": "2025-09-30",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Wheat": {
        "rule_code": "CACP-MSP-RABI-WHEAT-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 2275.0,
        "season": "Rabi 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Rabi Crops: The Marketing Season 2024-25",
        "document_hi": "रबी फसलों के लिए मूल्य नीति: विपणन सत्र 2024-25 अधिसूचना",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-04-01",
        "effective_to": "2025-03-31",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Soybean": {
        "rule_code": "CACP-MSP-KHARIF-SOYBEAN-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 4600.0,
        "season": "Kharif 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Kharif Crops: The Marketing Season 2024-25 (Oilseeds)",
        "document_hi": "खरीफ फसलों के लिए मूल्य नीति: सोयाबीन (पीला) न्यूनतम समर्थन मूल्य",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-10-01",
        "effective_to": "2025-09-30",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Maize": {
        "rule_code": "CACP-MSP-KHARIF-MAIZE-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 2090.0,
        "season": "Kharif 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Kharif Crops: The Marketing Season 2024-25 (Coarse Cereals)",
        "document_hi": "खरीफ फसलों के लिए मूल्य नीति: मक्का न्यूनतम समर्थन मूल्य",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-10-01",
        "effective_to": "2025-09-30",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Chana": {
        "rule_code": "CACP-MSP-RABI-CHANA-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 5440.0,
        "season": "Rabi 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Rabi Crops: The Marketing Season 2024-25 (Pulses)",
        "document_hi": "रबी फसलों के लिए मूल्य नीति: चना (ग्राम) न्यूनतम समर्थन मूल्य",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-04-01",
        "effective_to": "2025-03-31",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
    "Mustard": {
        "rule_code": "CACP-MSP-RABI-MUSTARD-2024",
        "scheme_name": "Minimum Support Price (MSP)",
        "scheme_name_hi": "न्यूनतम समर्थन मूल्य (एमएसपी)",
        "rate": 5650.0,
        "season": "Rabi 2024-25",
        "authority": "Commission for Agricultural Costs and Prices (CACP) / DA&FW, GoI",
        "authority_hi": "कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
        "document": "Price Policy for Rabi Crops: The Marketing Season 2024-25 (Rapeseed & Mustard)",
        "document_hi": "रबी फसलों के लिए मूल्य नीति: सरसों/तोरिया न्यूनतम समर्थन मूल्य",
        "url": "https://cacp.dacnet.nic.in",
        "effective_from": "2024-04-01",
        "effective_to": "2025-03-31",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
    },
}

OFFICIAL_LOAN_RULES: Dict[str, Dict[str, Any]] = {
    "KCC_GUIDELINES": {
        "rule_code": "RBI-FIDD-KCC-2019",
        "scheme_name": "Kisan Credit Card (KCC) Scheme",
        "scheme_name_hi": "किसान क्रेडिट कार्ड (केसीसी) योजना",
        "authority": "Reserve Bank of India (RBI)",
        "authority_hi": "भारतीय रिज़र्व बैंक (आरबीआई)",
        "document": "Master Circular – Kisan Credit Card (KCC) Scheme (FIDD.CO.FSD.BC.No.12/05.05.010/2018-19)",
        "document_hi": "मास्टर परिपत्र – किसान क्रेडिट कार्ड (केसीसी) योजना दिशानिर्देश",
        "url": "https://www.rbi.org.in",
        "effective_from": "2019-02-04",
        "effective_to": None,
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
        "formula_or_value": "Limit based on Scale of Finance + 10% post-harvest/household + 20% maintenance",
    },
    "INTEREST_SUBVENTION": {
        "rule_code": "MOA-MISS-PRI-2024",
        "scheme_name": "Modified Interest Subvention Scheme (MISS)",
        "scheme_name_hi": "संशोधित ब्याज अनुदान योजना (MISS)",
        "authority": "Ministry of Agriculture & Farmers Welfare, GoI / RBI",
        "authority_hi": "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार / आरबीआई",
        "document": "Operational Guidelines for Modified Interest Subvention Scheme (MISS) for Short-Term Agri Loans",
        "document_hi": "अल्पकालिक कृषि ऋण हेतु संशोधित ब्याज अनुदान योजना परिचालन दिशानिर्देश",
        "url": "https://agriwelfare.gov.in",
        "effective_from": "2024-04-01",
        "effective_to": "2025-03-31",
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
        "formula_or_value": "7.0% p.a. standard benchmark lending rate; 3.0% Prompt Repayment Incentive (PRI) reduces effective rate to 4.0% p.a. up to ₹3 Lakh",
    },
    "PROCESSING_FEE_WAIVER": {
        "rule_code": "RBI-FEE-WAIVER-2019",
        "scheme_name": "Agricultural Loan Service Charges Waiver",
        "scheme_name_hi": "कृषि ऋण सेवा शुल्क छूट निर्देश",
        "authority": "Reserve Bank of India (RBI)",
        "authority_hi": "भारतीय रिज़र्व बैंक (आरबीआई)",
        "document": "Waiver of Processing, Documentation, Inspection and Ledger Folio Charges for KCC loans up to ₹3 Lakh (FIDD.CO.FSD.BC.No.13/05.05.010/2018-19)",
        "document_hi": "₹3 लाख तक केसीसी ऋण हेतु प्रोसेसिंग, दस्तावेज़ीकरण और निरीक्षण शुल्क की पूर्ण छूट",
        "url": "https://www.rbi.org.in",
        "effective_from": "2019-02-07",
        "effective_to": None,
        "last_verified_on": "2025-04-10",
        "status": "verified",
        "data_origin": "official",
        "formula_or_value": "₹0 (Zero charges) for processing, documentation, inspection, or ledger folio on crop loans up to ₹3,00,000",
    },
}

class LoanVerificationOutput(BaseModel):
    status: str # "Verified", "Needs Review", "Possible Discrepancy"
    approved_amount: float
    disbursed_amount: float
    deductions: float
    difference: float # approved - disbursed
    unaccounted_difference: float # difference - deductions
    is_flagged: bool
    status_label: str
    status_label_hi: str
    explanation: str
    explanation_hi: str
    reasons: List[str]
    reasons_hi: List[str]
    arithmetic_breakdown: List[ArithmeticItem]
    next_steps: List[str]
    next_steps_hi: List[str]
    sources: List[SourceCitation] = Field(default_factory=list)
    flagged_rule_code: Optional[str] = None
    flagged_rule_threshold: Optional[str] = None
    flagged_rule_reason_en: Optional[str] = None
    flagged_rule_reason_hi: Optional[str] = None

class MSPVerificationOutput(BaseModel):
    status: str
    crop: str
    quantity_quintals: float
    msp_rate: float
    expected_payment: float
    actual_payment: float
    difference: float
    is_flagged: bool
    status_label: str
    status_label_hi: str
    explanation: str
    explanation_hi: str
    reasons: List[str]
    reasons_hi: List[str]
    arithmetic_breakdown: List[ArithmeticItem]
    next_steps: List[str]
    next_steps_hi: List[str]
    sources: List[SourceCitation] = Field(default_factory=list)
    flagged_rule_code: Optional[str] = None
    flagged_rule_threshold: Optional[str] = None
    flagged_rule_reason_en: Optional[str] = None
    flagged_rule_reason_hi: Optional[str] = None

class InsuranceVerificationOutput(BaseModel):
    status: str
    crop: str
    claim_amount_expected: float
    amount_received: float
    difference: float
    claim_status: str
    is_flagged: bool
    status_label: str
    status_label_hi: str
    explanation: str
    explanation_hi: str
    reasons: List[str]
    reasons_hi: List[str]
    arithmetic_breakdown: List[ArithmeticItem]
    next_steps: List[str]
    next_steps_hi: List[str]
    sources: List[SourceCitation] = Field(default_factory=list)


def verify_loan(
    approved_amount: float,
    disbursed_amount: float,
    deductions: float = 0.0,
    interest_rate: float = 7.0,
    bank_name: str = "Bank"
) -> LoanVerificationOutput:
    """
    Deterministic loan verification.
    difference = approved_amount - disbursed_amount
    If difference > 0, flagged for review.
    Deductions are accounted for transparently.
    """
    approved = round(float(approved_amount), 2)
    disbursed = round(float(disbursed_amount), 2)
    ded = round(float(deductions), 2)

    diff = round(approved - disbursed, 2)
    unaccounted = round(diff - ded, 2)

    breakdown = [
        ArithmeticItem(label="Approved Loan Amount", label_hi="स्वीकृत ऋण राशि", amount=approved),
        ArithmeticItem(label="Disbursed Amount Recorded", label_hi="वितरित राशि दर्ज", amount=disbursed),
        ArithmeticItem(label="Gross Difference", label_hi="कुल अंतर", amount=diff),
    ]

    if ded > 0:
        breakdown.append(
            ArithmeticItem(label="Recorded Deductions (Fees/Insurance)", label_hi="दर्ज कटौतियां (शुल्क/बीमा)", amount=ded)
        )
        breakdown.append(
            ArithmeticItem(label="Net Unexplained Difference", label_hi="शुद्ध अस्पष्ट अंतर", amount=unaccounted)
        )

    if diff > 0:
        is_flagged = True
        status = "Needs Review"
        status_label = "Discrepancy Detected (Needs Review)"
        status_label_hi = "अंतर पाया गया (समीक्षा आवश्यक)"

        explanation = (
            f"The recorded disbursed amount (₹{disbursed:,.2f}) is ₹{diff:,.2f} less than the approved "
            f"sanction limit of ₹{approved:,.2f}. This record may need review with {bank_name}."
        )
        explanation_hi = (
            f"वितरित राशि (₹{disbursed:,.2f}) स्वीकृत सीमा ₹{approved:,.2f} से ₹{diff:,.2f} कम पाई गई है। "
            f"{bank_name} के साथ इस रिकॉर्ड की समीक्षा की जानी चाहिए।"
        )

        reasons = [
            "Deductions for bank processing fees and documentation charges",
            "Auto-deduction of mandatory crop insurance premium (PMFBY)",
            "Bank policy variation or pending secondary disbursement tranche",
            "Data entry variation in branch ledger vs loan passbook",
        ]
        reasons_hi = [
            "बैंक प्रोसेसिंग शुल्क और दस्तावेज़ीकरण शुल्क की कटौती",
            "अनिवार्य फसल बीमा प्रीमियम (पीएमएफबीवाई) की स्वतः कटौती",
            "बैंक नीति या दूसरी किश्त जारी होने की प्रक्रियाधीन स्थिति",
            "पासबुक और शाखा लेज़र में डेटा प्रविष्टि का अंतर",
        ]

        next_steps = [
            "Check your loan statement for itemized processing fees or premium deductions.",
            "Download your official KisanVerify Discrepancy Report.",
            "Raise a grievance directly to your branch manager through this portal.",
        ]
        next_steps_hi = [
            "कटौती विवरण जानने के लिए बैंक ऋण विवरण की जांच करें।",
            "अपनी आधिकारिक किसानवेरीफाई विसंगति रिपोर्ट डाउनलोड करें।",
            "पोर्टल के माध्यम से शाखा प्रबंधक को शिकायत दर्ज करें।",
        ]

    elif diff == 0:
        is_flagged = False
        status = "Verified"
        status_label = "Verified (Amounts Match)"
        status_label_hi = "सत्यापित (राशि मेल खाती है)"

        explanation = (
            f"Disbursed amount (₹{disbursed:,.2f}) exactly matches the approved limit of ₹{approved:,.2f}. "
            "No discrepancy found."
        )
        explanation_hi = (
            f"वितरित राशि (₹{disbursed:,.2f}) स्वीकृत सीमा ₹{approved:,.2f} से पूर्णतः मेल खाती है। "
            "कोई विसंगति नहीं पाई गई।"
        )
        reasons = ["All figures match the approved sanction letter."]
        reasons_hi = ["सभी आंकड़े स्वीकृत पत्र से मेल खाते हैं।"]
        next_steps = ["Your loan record is in order. Keep a copy of this verification for your records."]
        next_steps_hi = ["आपका ऋण रिकॉर्ड सही है। अपने रिकॉर्ड के लिए प्रति सहेजें।"]

    else: # diff < 0
        is_flagged = True
        status = "Needs Review"
        status_label = "Needs Review (Disbursement Exceeds Sanction)"
        status_label_hi = "समीक्षा आवश्यक (वितरण स्वीकृत से अधिक)"
        abs_diff = abs(diff)

        explanation = (
            f"The disbursed amount (₹{disbursed:,.2f}) exceeds the approved amount (₹{approved:,.2f}) "
            f"by ₹{abs_diff:,.2f}. This may indicate an interest subvention credit or additional top-up."
        )
        explanation_hi = (
            f"वितरित राशि (₹{disbursed:,.2f}) स्वीकृत राशि से ₹{abs_diff:,.2f} अधिक दर्ज है। "
            "यह ब्याज अनुदान या अतिरिक्त टॉप-अप का संकेत हो सकता है।"
        )
        reasons = ["Government interest subvention credited", "Additional top-up facility active"]
        reasons_hi = ["सरकारी ब्याज अनुदान जमा किया गया", "अतिरिक्त टॉप-अप सुविधा सक्रिय"]
        next_steps = ["Verify whether interest subvention or subsidy was credited."]
        next_steps_hi = ["जांचें कि क्या ब्याज सब्सिडी जमा की गई है।"]

    sources: List[SourceCitation] = [
        SourceCitation(
            rule_code="BANK-SANCTION-TERMS",
            scheme_name=f"{bank_name} Sanction Terms",
            scheme_name_hi=f"{bank_name} ऋण स्वीकृति अनुबंध",
            authority=bank_name,
            authority_hi=bank_name,
            document="Loan Sanction Letter / Credit Arrangement Letter",
            document_hi="ऋण स्वीकृति पत्र / साख अनुबंध",
            url=None,
            effective_from="2024-04-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="bank_document",
            field_associated="approved_amount",
            details=f"Approved limit of ₹{approved:,.2f} with recorded disbursement of ₹{disbursed:,.2f}.",
            details_hi=f"स्वीकृत ऋण सीमा ₹{approved:,.2f} और दर्ज संवितरण ₹{disbursed:,.2f}।",
        ),
        SourceCitation(
            rule_code=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["rule_code"],
            scheme_name=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["scheme_name"],
            scheme_name_hi=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["scheme_name_hi"],
            authority=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["authority"],
            authority_hi=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["authority_hi"],
            document=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["document"],
            document_hi=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["document_hi"],
            url=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["url"],
            effective_from=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["effective_from"],
            effective_to=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["effective_to"],
            last_verified_on=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["last_verified_on"],
            status=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["status"],
            data_origin=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["data_origin"],
            field_associated="deductions",
            details=OFFICIAL_LOAN_RULES["PROCESSING_FEE_WAIVER"]["formula_or_value"],
            details_hi="₹3 लाख तक के फसल ऋण पर कोई प्रोसेसिंग या दस्तावेजी शुल्क नहीं काटा जा सकता।",
        ),
        SourceCitation(
            rule_code=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["rule_code"],
            scheme_name=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["scheme_name"],
            scheme_name_hi=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["scheme_name_hi"],
            authority=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["authority"],
            authority_hi=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["authority_hi"],
            document=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["document"],
            document_hi=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["document_hi"],
            url=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["url"],
            effective_from=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["effective_from"],
            effective_to=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["effective_to"],
            last_verified_on=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["last_verified_on"],
            status=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["status"],
            data_origin=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["data_origin"],
            field_associated="interest_rate",
            details=OFFICIAL_LOAN_RULES["INTEREST_SUBVENTION"]["formula_or_value"],
            details_hi="7% मानक ब्याज दर और समय पर अदायगी पर 3% प्रोत्साहन छूट (प्रभावी 4% ब्याज)।",
        ),
        SourceCitation(
            rule_code=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["rule_code"],
            scheme_name=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["scheme_name"],
            scheme_name_hi=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["scheme_name_hi"],
            authority=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["authority"],
            authority_hi=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["authority_hi"],
            document=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["document"],
            document_hi=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["document_hi"],
            url=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["url"],
            effective_from=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["effective_from"],
            effective_to=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["effective_to"],
            last_verified_on=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["last_verified_on"],
            status=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["status"],
            data_origin=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["data_origin"],
            field_associated="disbursed_amount",
            details=OFFICIAL_LOAN_RULES["KCC_GUIDELINES"]["formula_or_value"],
            details_hi="केसीसी सीमा और किश्तों के वितरण के लिए आरबीआई के वैधानिक दिशानिर्देश।",
        ),
    ]

    flagged_rule_code = "RULE-LOAN-DISBURSEMENT" if is_flagged else None
    flagged_rule_threshold = "Disbursed < Approved Sanction Limit" if is_flagged else None
    flagged_rule_reason_en = (
        f"Recorded disbursement (₹{disbursed:,.2f}) is lower than the sanctioned limit (₹{approved:,.2f}) "
        f"leaving an unexplained difference of ₹{unaccounted:,.2f} after legitimate deductions."
        if is_flagged and diff > 0 else None
    )
    flagged_rule_reason_hi = (
        f"दर्ज वितरण (₹{disbursed:,.2f}) स्वीकृत सीमा (₹{approved:,.2f}) से कम है, "
        f"जिससे वैध कटौतियों के बाद ₹{unaccounted:,.2f} का अस्पष्ट अंतर रहता है।"
        if is_flagged and diff > 0 else None
    )

    return LoanVerificationOutput(
        status=status,
        approved_amount=approved,
        disbursed_amount=disbursed,
        deductions=ded,
        difference=diff,
        unaccounted_difference=unaccounted,
        is_flagged=is_flagged,
        status_label=status_label,
        status_label_hi=status_label_hi,
        explanation=explanation,
        explanation_hi=explanation_hi,
        reasons=reasons,
        reasons_hi=reasons_hi,
        arithmetic_breakdown=breakdown,
        next_steps=next_steps,
        next_steps_hi=next_steps_hi,
        sources=sources,
        flagged_rule_code=flagged_rule_code,
        flagged_rule_threshold=flagged_rule_threshold,
        flagged_rule_reason_en=flagged_rule_reason_en,
        flagged_rule_reason_hi=flagged_rule_reason_hi,
    )


def verify_msp(
    crop: str,
    quantity_quintals: float,
    msp_rate: float,
    actual_payment: float,
    procurement_center: str = "Procurement Mandi"
) -> MSPVerificationOutput:
    """
    Deterministic MSP Payment verification.
    expected_payment = quantity_quintals * msp_rate
    difference = expected_payment - actual_payment
    """
    qty = round(float(quantity_quintals), 2)
    rate = round(float(msp_rate), 2)
    expected = round(qty * rate, 2)
    actual = round(float(actual_payment), 2)
    diff = round(expected - actual, 2)

    breakdown = [
        ArithmeticItem(label=f"Crop Quantity ({crop})", label_hi=f"फसल मात्रा ({crop})", amount=qty),
        ArithmeticItem(label="MSP Rate per Quintal", label_hi="एमएसपी दर प्रति क्विंटल", amount=rate),
        ArithmeticItem(label="Calculated Expected Payment", label_hi="अपेक्षित कुल भुगतान", amount=expected),
        ArithmeticItem(label="Actual Payment Received", label_hi="प्राप्त वास्तविक भुगतान", amount=actual),
        ArithmeticItem(label="Payment Difference", label_hi="भुगतान अंतर", amount=diff),
    ]

    if diff > 0:
        is_flagged = True
        status = "Needs Review"
        status_label = "Payment Discrepancy Detected"
        status_label_hi = "भुगतान में अंतर पाया गया"

        explanation = (
            f"Based on {qty} quintals at ₹{rate:,.2f}/qtl, the expected payment is ₹{expected:,.2f}. "
            f"The payment received is ₹{actual:,.2f}, leaving a difference of ₹{diff:,.2f}."
        )
        explanation_hi = (
            f"{qty} क्विंटल फसल की ₹{rate:,.2f}/क्विंटल की दर से अपेक्षित राशि ₹{expected:,.2f} है। "
            f"प्राप्त राशि ₹{actual:,.2f} है, जिससे ₹{diff:,.2f} का अंतर बनता है।"
        )

        reasons = [
            "Quality moisture discount (refraction / FAQ grade variation)",
            "Partial procurement disbursement released; remaining balance scheduled",
            "Mandi cess, handling charges, or gunny bag security withheld",
            "Bank transaction delay or IFSC settlement pending",
        ]
        reasons_hi = [
            "नमी या गुणवत्ता छूट (एफएक्यू मानक कटौती)",
            "आंशिक भुगतान जारी; शेष राशि प्रक्रियाधीन",
            "मंडी शुल्क, तुलाई या बारदाना सुरक्षा राशि की कटौती",
            "बैंक लेन-देन या आईएफएससी निपटान में देरी",
        ]
        next_steps = [
            "Check the Mandi J-Form or procurement receipt for moisture percentage deductions.",
            "Inquire at your local procurement center regarding tranche schedule.",
            "Raise a complaint with the District Civil Supplies Office.",
        ]
        next_steps_hi = [
            "नमी कटौती की पुष्टि के लिए मंडी जे-फॉर्म या रसीद देखें।",
            "भुगतान किश्त के लिए अपने स्थानीय उपार्जन केंद्र से संपर्क करें।",
            "जिला खाद्य एवं नागरिक आपूर्ति कार्यालय में शिकायत दर्ज करें।",
        ]

    elif diff == 0:
        is_flagged = False
        status = "Verified"
        status_label = "Verified (Full MSP Received)"
        status_label_hi = "सत्यापित (पूर्ण एमएसपी प्राप्त)"

        explanation = (
            f"Actual payment of ₹{actual:,.2f} matches 100% of the statutory MSP expected (₹{expected:,.2f})."
        )
        explanation_hi = (
            f"प्राप्त भुगतान ₹{actual:,.2f} अपेक्षित एमएसपी (₹{expected:,.2f}) से पूरी तरह मेल खाता है।"
        )
        reasons = ["Payment credited in full per official MSP procurement notification."]
        reasons_hi = ["आधिकारिक एमएसपी अधिसूचना के अनुसार पूरा भुगतान जमा किया गया।"]
        next_steps = ["Your MSP record is verified. No further action needed."]
        next_steps_hi = ["आपका एमएसपी रिकॉर्ड सत्यापित है। आगे किसी कार्रवाई की आवश्यकता नहीं है।"]

    else: # diff < 0 (actual > expected)
        is_flagged = False
        status = "Verified"
        status_label = "Verified with State Bonus"
        status_label_hi = "सत्यापित (राज्य बोनस सहित)"
        bonus = abs(diff)

        explanation = (
            f"Payment of ₹{actual:,.2f} includes ₹{bonus:,.2f} in addition to the base MSP expected (₹{expected:,.2f}). "
            "This reflects state agricultural bonus incentives."
        )
        explanation_hi = (
            f"प्राप्त भुगतान ₹{actual:,.2f} में मूल एमएसपी के अलावा ₹{bonus:,.2f} अतिरिक्त शामिल हैं, "
            "जो राज्य कृषि प्रोत्साहन बोनस को दर्शाता है।"
        )
        reasons = ["State agricultural input bonus incentive credited."]
        reasons_hi = ["राज्य सरकार की कृषि इनपुट प्रोत्साहन राशि शामिल।"]
        next_steps = ["Payment verified including bonus entitlements."]
        next_steps_hi = ["बोनस सहित भुगतान सत्यापित।"]

    # Look up official MSP rule
    crop_rule = OFFICIAL_MSP_RULES.get(crop)
    if not crop_rule:
        for k, v in OFFICIAL_MSP_RULES.items():
            if k.lower() in crop.lower() or crop.lower() in k.lower():
                crop_rule = v
                break

    if crop_rule:
        msp_citation = SourceCitation(
            rule_code=crop_rule["rule_code"],
            scheme_name=crop_rule["scheme_name"],
            scheme_name_hi=crop_rule["scheme_name_hi"],
            authority=crop_rule["authority"],
            authority_hi=crop_rule["authority_hi"],
            document=crop_rule["document"],
            document_hi=crop_rule["document_hi"],
            url=crop_rule["url"],
            effective_from=crop_rule["effective_from"],
            effective_to=crop_rule.get("effective_to"),
            last_verified_on=crop_rule["last_verified_on"],
            status=crop_rule["status"],
            data_origin=crop_rule["data_origin"],
            field_associated="msp_rate",
            details=f"Statutory MSP for {crop} ({crop_rule.get('season', '2024-25')}): ₹{crop_rule.get('rate', rate):,.2f} per quintal.",
            details_hi=f"{crop} के लिए वैधानिक एमएसपी ({crop_rule.get('season', '2024-25')}): ₹{crop_rule.get('rate', rate):,.2f} प्रति क्विंटल।",
        )
    else:
        msp_citation = SourceCitation(
            rule_code="DEMO-MSP-RATE",
            scheme_name="Minimum Support Price (MSP)",
            scheme_name_hi="न्यूनतम समर्थन मूल्य (एमएसपी)",
            authority="Commission for Agricultural Costs and Prices (CACP) / DA&FW",
            authority_hi="कृषि लागत एवं मूल्य आयोग (CACP) / कृषि एवं किसान कल्याण विभाग",
            document="Price Policy Notification / Mandi Reference Rate",
            document_hi="मूल्य नीति अधिसूचना / मंडी संदर्भ दर",
            url="https://cacp.dacnet.nic.in",
            effective_from="2024-10-01",
            effective_to="2025-09-30",
            last_verified_on="2025-04-10",
            status="demo",
            data_origin="demo",
            field_associated="msp_rate",
            details=f"Demo benchmark MSP rate: ₹{rate:,.2f} per quintal (verify on official CACP portal).",
            details_hi=f"डेमो बेंचमार्क एमएसपी दर: ₹{rate:,.2f} प्रति क्विंटल (आधिकारिक सीएसीपी पोर्टल पर सत्यापित करें)।",
        )

    sources: List[SourceCitation] = [
        msp_citation,
        SourceCitation(
            rule_code="MANDI-JFORM-RECEIPT",
            scheme_name="Mandi Procurement Receipt / J-Form",
            scheme_name_hi="मंडी खरीद रसीद / जे-फॉर्म",
            authority=procurement_center,
            authority_hi=procurement_center,
            document="Weighbridge Slip & Mandi J-Form",
            document_hi="तौल पर्ची एवं मंडी जे-फॉर्म",
            url="https://enam.gov.in",
            effective_from="2024-10-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="bank_document",
            field_associated="quantity_quintals",
            details=f"Procured quantity: {qty} quintals recorded at {procurement_center}.",
            details_hi=f"उपार्जित मात्रा: {qty} क्विंटल {procurement_center} पर दर्ज।",
        ),
        SourceCitation(
            rule_code="PFMS-DBT-SETTLEMENT",
            scheme_name="Public Financial Management System (PFMS) DBT",
            scheme_name_hi="सार्वजनिक वित्तीय प्रबंधन प्रणाली (PFMS) डीबीटी",
            authority="Ministry of Finance / DA&FW, GoI",
            authority_hi="वित्त मंत्रालय / कृषि एवं किसान कल्याण विभाग, भारत सरकार",
            document="DBT Procurement Settlement Protocol",
            document_hi="डीबीटी उपार्जन भुगतान निपटान दिशानिर्देश",
            url="https://pfms.nic.in",
            effective_from="2024-04-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="user_entered",
            field_associated="actual_payment",
            details=f"Actual bank credit recorded: ₹{actual:,.2f}.",
            details_hi=f"बैंक खाते में दर्ज जमा राशि: ₹{actual:,.2f}।",
        ),
    ]

    flagged_rule_code = "RULE-MSP-PAYMENT" if is_flagged else None
    flagged_rule_threshold = "Actual Payment < Expected (Quantity × Statutory MSP Rate)" if is_flagged else None
    flagged_rule_reason_en = (
        f"Received payment (₹{actual:,.2f}) is lower than statutory entitlement (₹{expected:,.2f}) "
        f"by ₹{diff:,.2f}."
        if is_flagged else None
    )
    flagged_rule_reason_hi = (
        f"प्राप्त भुगतान (₹{actual:,.2f}) वैधानिक पात्रता (₹{expected:,.2f}) से ₹{diff:,.2f} कम है।"
        if is_flagged else None
    )

    return MSPVerificationOutput(
        status=status,
        crop=crop,
        quantity_quintals=qty,
        msp_rate=rate,
        expected_payment=expected,
        actual_payment=actual,
        difference=diff,
        is_flagged=is_flagged,
        status_label=status_label,
        status_label_hi=status_label_hi,
        explanation=explanation,
        explanation_hi=explanation_hi,
        reasons=reasons,
        reasons_hi=reasons_hi,
        arithmetic_breakdown=breakdown,
        next_steps=next_steps,
        next_steps_hi=next_steps_hi,
        sources=sources,
        flagged_rule_code=flagged_rule_code,
        flagged_rule_threshold=flagged_rule_threshold,
        flagged_rule_reason_en=flagged_rule_reason_en,
        flagged_rule_reason_hi=flagged_rule_reason_hi,
    )


def verify_insurance(
    crop: str,
    claim_amount_expected: float,
    amount_received: float,
    claim_status: str = "Under Review"
) -> InsuranceVerificationOutput:
    """
    Deterministic Crop Insurance claim verification.
    difference = claim_amount_expected - amount_received
    """
    expected = round(float(claim_amount_expected), 2)
    received = round(float(amount_received), 2)
    diff = round(expected - received, 2)

    breakdown = [
        ArithmeticItem(label=f"Insured Crop ({crop})", label_hi=f"बीमित फसल ({crop})", amount=0.0),
        ArithmeticItem(label="Assessed Claim Entitlement", label_hi="निर्धारित दावा राशि", amount=expected),
        ArithmeticItem(label="Disbursed Insurance Claim", label_hi="प्राप्त बीमा राशि", amount=received),
        ArithmeticItem(label="Pending Claim Balance", label_hi="लंबित दावा शेष", amount=diff),
    ]

    # Handle status
    is_under_review = "review" in claim_status.lower() or "pending" in claim_status.lower()

    if diff > 0 and is_under_review:
        is_flagged = False
        status = "Under Review"
        status_label = "Claim Processing (Under Review)"
        status_label_hi = "दावा प्रक्रियाधीन (समीक्षा जारी)"

        explanation = (
            f"Your crop insurance claim of ₹{expected:,.2f} has disbursed ₹{received:,.2f}. "
            f"The remaining balance of ₹{diff:,.2f} is currently recorded as 'Under Review'."
        )
        explanation_hi = (
            f"आपके ₹{expected:,.2f} के फसल बीमा दावे में से ₹{received:,.2f} जारी किए गए हैं। "
            f"शेष ₹{diff:,.2f} की राशि वर्तमान में 'प्रक्रियाधीन' दर्ज है।"
        )
        reasons = [
            "Crop cutting experiment (CCE) threshold yield assessment ongoing",
            "State share subsidy release awaiting administrative clearance",
            "Staged settlement protocol for notified assessment unit",
        ]
        reasons_hi = [
            "फसल कटाई प्रयोग (सीसीई) उपज आकलन प्रक्रियाधीन",
            "राज्य सब्सिडी अंश जारी करने की प्रशासनिक स्वीकृति लंबित",
            "अधिसूचित क्षेत्र के लिए चरणबद्ध भुगतान प्रक्रिया",
        ]
        next_steps = [
            "Monitor portal for insurance company CCE finalization.",
            "Verify your Aadhaar-linked bank account is active.",
            "If unpaid after 15 days, submit a grievance.",
        ]
        next_steps_hi = [
            "अंतिम निपटान के लिए पोर्टल की स्थिति पर नजर रखें।",
            "सुनिश्चित करें कि आधार से जुड़ा बैंक खाता सक्रिय है।",
            "15 दिनों के बाद भुगतान न होने पर शिकायत दर्ज करें।",
        ]

    elif diff > 0 and not is_under_review:
        is_flagged = True
        status = "Needs Review"
        status_label = "Insurance Discrepancy Flagged"
        status_label_hi = "बीमा विसंगति पाई गई"

        explanation = (
            f"Claim entitlement was assessed at ₹{expected:,.2f}, but only ₹{received:,.2f} was disbursed. "
            f"The difference of ₹{diff:,.2f} requires verification."
        )
        explanation_hi = (
            f"दावा पात्रता ₹{expected:,.2f} निर्धारित थी, परंतु केवल ₹{received:,.2f} वितरित किए गए। "
            f"₹{diff:,.2f} के अंतर की समीक्षा आवश्यक है।"
        )
        reasons = [
            "Acreage mismatch between Patwari girdawari and insurance portal",
            "Excess area deduction applied across co-shared holdings",
            "Incomplete bank mandate or documentation discrepancy",
        ]
        reasons_hi = [
            "पटवारी गिरदावरी और बीमा पोर्टल के रकबे में अंतर",
            "साझा खसरा धारकों में अधिक रकबा कटौती",
            "अधूरा बैंक अधिदेश या दस्तावेज़ विसंगति",
        ]
        next_steps = [
            "Request claim calculation sheet from your insurance district representative.",
            "Submit a formal appeal with Patwari sowing certificate.",
        ]
        next_steps_hi = [
            "बीमा जिला प्रतिनिधि से दावा गणना पत्रक मांगें।",
            "पटवारी बुवाई प्रमाण पत्र के साथ औपचारिक अपील दर्ज करें।",
        ]

    else:
        is_flagged = False
        status = "Verified"
        status_label = "Claim Settled in Full"
        status_label_hi = "दावे का पूर्ण निपटान"

        explanation = (
            f"Your crop insurance claim of ₹{expected:,.2f} has been fully disbursed and verified."
        )
        explanation_hi = (
            f"आपका ₹{expected:,.2f} का फसल बीमा दावा पूर्णतः वितरित और सत्यापित है।"
        )
        reasons = ["100% of assessed insurance indemnity released to farmer account."]
        reasons_hi = ["निर्धारित बीमा राशि का 100% किसान खाते में जमा।"]
        next_steps = ["Insurance record complete and archived."]
        next_steps_hi = ["बीमा रिकॉर्ड पूर्ण।"]

    sources: List[SourceCitation] = [
        SourceCitation(
            rule_code="PMFBY-REV-GUIDELINES-2020",
            scheme_name="Pradhan Mantri Fasal Bima Yojana (PMFBY)",
            scheme_name_hi="प्रधानमंत्री फसल बीमा योजना (पीएमएफबीवाई)",
            authority="Ministry of Agriculture & Farmers Welfare, GoI",
            authority_hi="कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
            document="PMFBY Revised Operational Guidelines & Yield Guarantee Assessment",
            document_hi="पीएमएफबीवाई संशोधित परिचालन दिशानिर्देश एवं उपज गारंटी आकलन",
            url="https://pmfby.gov.in",
            effective_from="2020-04-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="official",
            field_associated="claim_amount_expected",
            details=f"Indemnity calculation formula based on Threshold Yield vs Actual Yield for {crop}.",
            details_hi=f"{crop} के लिए थ्रेशोल्ड उपज बनाम वास्तविक उपज पर आधारित दावा निर्धारण नियम।",
        ),
        SourceCitation(
            rule_code="INS-POLICY-CERTIFICATE",
            scheme_name="Crop Insurance Policy Certificate",
            scheme_name_hi="फसल बीमा पॉलिसी प्रमाणपत्र",
            authority="Agriculture Insurance Company of India / Empanelled Insurer",
            authority_hi="भारतीय कृषि बीमा कंपनी / अधिकृत बीमा कंपनी",
            document="Crop Insurance Policy Schedule & Claim Advice",
            document_hi="फसल बीमा पॉलिसी अनुसूची एवं दावा सूचना",
            url=None,
            effective_from="2024-06-01",
            effective_to="2025-05-31",
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="bank_document",
            field_associated="claim_amount_expected",
            details=f"Assessed claim indemnity: ₹{expected:,.2f}.",
            details_hi=f"निर्धारित दावा राशि: ₹{expected:,.2f}।",
        ),
        SourceCitation(
            rule_code="BANK-CREDIT-RECORD",
            scheme_name="Bank Account DBT Credit Advice",
            scheme_name_hi="बैंक खाता डीबीटी भुगतान सूचना",
            authority="Bank / PFMS",
            authority_hi="बैंक / पीएफएमएस",
            document="Passbook / Electronic Clearing Advice",
            document_hi="पासबुक / इलेक्ट्रॉनिक समाशोधन सूचना",
            url=None,
            effective_from="2024-04-01",
            effective_to=None,
            last_verified_on="2025-04-10",
            status="verified",
            data_origin="user_entered",
            field_associated="amount_received",
            details=f"Disbursed indemnity credited: ₹{received:,.2f}.",
            details_hi=f"खाते में जमा की गई बीमा राशि: ₹{received:,.2f}।",
        ),
    ]

    return InsuranceVerificationOutput(
        status=status,
        crop=crop,
        claim_amount_expected=expected,
        amount_received=received,
        difference=diff,
        claim_status=claim_status,
        is_flagged=is_flagged,
        status_label=status_label,
        status_label_hi=status_label_hi,
        explanation=explanation,
        explanation_hi=explanation_hi,
        reasons=reasons,
        reasons_hi=reasons_hi,
        arithmetic_breakdown=breakdown,
        next_steps=next_steps,
        next_steps_hi=next_steps_hi,
        sources=sources,
    )
