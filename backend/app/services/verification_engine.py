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

class ArithmeticItem(BaseModel):
    label: str
    label_hi: str
    amount: float

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
    )
