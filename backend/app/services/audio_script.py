"""
KishanVerify Deterministic Spoken Audio Script Generator
========================================================
Generates calm, respectful, 30–60 second deterministic audio scripts
in Hindi and English for financial verification results.
Converts currency amounts phonetically into words (e.g. ₹10,000 -> "दस हज़ार रुपये").
Includes sentence-level chunking for live UI transcript highlighting.
"""

from typing import List, Dict, Any, Tuple


HINDI_NUMBERS = {
    0: "शून्य",
    1: "एक",
    2: "दो",
    3: "तीन",
    4: "चार",
    5: "पांच",
    6: "छह",
    7: "सात",
    8: "आठ",
    9: "नौ",
    10: "दस",
    11: "ग्यारह",
    12: "बारह",
    13: "तेरह",
    14: "चौदह",
    15: "पंद्रह",
    16: "सोलह",
    17: "सत्रह",
    18: "अट्ठारह",
    19: "उन्नीस",
    20: "बीस",
    25: "पच्चीस",
    30: "तीस",
    35: "पैंतीस",
    40: "चालीस",
    45: "पैंतालीस",
    50: "पचास",
    55: "पचपन",
    60: "साठ",
    65: "पैंसठ",
    70: "सत्तर",
    75: "पचहत्तर",
    80: "अस्सी",
    85: "पचासी",
    90: "नब्बे",
    95: "पंचानवे",
}

ENGLISH_NUMBERS = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
    20: "twenty",
    30: "thirty",
    40: "forty",
    50: "fifty",
    60: "sixty",
    70: "seventy",
    80: "eighty",
    90: "ninety",
}

def number_to_hindi_words(n: float) -> str:
    """
    Converts Indian currency amounts up to Crores into phonetic Hindi words.
    """
    num = int(round(abs(n)))
    if num == 0:
        return "शून्य रुपये"

    parts = []

    # Crores
    crores = num // 10000000
    if crores > 0:
        parts.append(f"{_two_digit_hi(crores)} करोड़")
        num %= 10000000

    # Lakhs
    lakhs = num // 100000
    if lakhs > 0:
        parts.append(f"{_two_digit_hi(lakhs)} लाख")
        num %= 100000

    # Thousands
    thousands = num // 1000
    if thousands > 0:
        parts.append(f"{_two_digit_hi(thousands)} हज़ार")
        num %= 1000

    # Hundreds
    hundreds = num // 100
    if hundreds > 0:
        parts.append(f"{_two_digit_hi(hundreds)} सौ")
        num %= 100

    # Remainder
    if num > 0:
        parts.append(_two_digit_hi(num))

    return " ".join(parts) + " रुपये"

def _two_digit_hi(n: int) -> str:
    if n in HINDI_NUMBERS:
        return HINDI_NUMBERS[n]
    tens = (n // 10) * 10
    ones = n % 10
    tens_str = HINDI_NUMBERS.get(tens, str(tens))
    ones_str = HINDI_NUMBERS.get(ones, str(ones))
    return f"{tens_str} {ones_str}"


def number_to_english_words(n: float) -> str:
    """
    Converts Indian currency amounts up to Crores into natural English words.
    """
    num = int(round(abs(n)))
    if num == 0:
        return "zero rupees"

    parts = []

    # Crores
    crores = num // 10000000
    if crores > 0:
        parts.append(f"{_two_digit_en(crores)} crore")
        num %= 10000000

    # Lakhs
    lakhs = num // 100000
    if lakhs > 0:
        parts.append(f"{_two_digit_en(lakhs)} lakh")
        num %= 100000

    # Thousands
    thousands = num // 1000
    if thousands > 0:
        parts.append(f"{_two_digit_en(thousands)} thousand")
        num %= 1000

    # Hundreds
    hundreds = num // 100
    if hundreds > 0:
        parts.append(f"{_two_digit_en(hundreds)} hundred")
        num %= 100

    # Remainder
    if num > 0:
        parts.append(_two_digit_en(num))

    return " ".join(parts) + " rupees"

def _two_digit_en(n: int) -> str:
    if n in ENGLISH_NUMBERS:
        return ENGLISH_NUMBERS[n]
    tens = (n // 10) * 10
    ones = n % 10
    tens_str = ENGLISH_NUMBERS.get(tens, str(tens))
    ones_str = ENGLISH_NUMBERS.get(ones, str(ones))
    return f"{tens_str}-{ones_str}"


# ---------------------------------------------------------------------------
# SCRIPT GENERATORS
# ---------------------------------------------------------------------------

def generate_loan_script(
    approved_amount: float,
    disbursed_amount: float,
    deductions: float,
    difference: float,
    bank_name: str = "State Bank of India",
    language: str = "hi"
) -> Dict[str, Any]:
    """
    Generates a 30-50 second spoken summary for agricultural loan verification.
    """
    diff = round(approved_amount - disbursed_amount, 2)
    is_flagged = diff > 0
    app_hi = number_to_hindi_words(approved_amount)
    dis_hi = number_to_hindi_words(disbursed_amount)
    diff_hi = number_to_hindi_words(diff)

    app_en = number_to_english_words(approved_amount)
    dis_en = number_to_english_words(disbursed_amount)
    diff_en = number_to_english_words(diff)

    if language == "hi":
        if is_flagged:
            sentences = [
                f"नमस्कार। आपके {bank_name} के किसान क्रेडिट कार्ड खाते की जांच पूरी हो गई है।",
                f"इस रिकॉर्ड में स्वीकृत ऋण सीमा {app_hi} थी, जबकि बैंक द्वारा {dis_hi} वितरित किए गए हैं।",
                f"इस प्रकार {diff_hi} का अंतर पाया गया है, जिसकी समीक्षा की जानी चाहिए।",
                "यह जांच भारतीय रिज़र्व बैंक के केसीसी शुल्क छूट निर्देश और संशोधित ब्याज अनुदान योजना के आधार पर की गई है।",
                "कृपया ध्यान दें कि यह अंतर अनिवार्य फसल बीमा प्रीमियम या बैंक दस्तावेजी शुल्क की कटौती के कारण हो सकता है।",
                "आप अपनी बैंक शाखा से संपर्क कर सकते हैं, अथवा किसान कॉल सेंटर टोल-फ्री नंबर 1800-180-1551 पर कॉल कर सकते हैं।",
            ]
        else:
            sentences = [
                f"नमस्कार। आपके {bank_name} के किसान क्रेडिट कार्ड खाते की जांच पूरी हो गई है।",
                f"वितरित राशि {dis_hi} स्वीकृत सीमा {app_hi} से पूर्णतः मेल खाती है।",
                "आपका ऋण रिकॉर्ड पूरी तरह सत्यापित है और इसमें कोई अंतर नहीं पाया गया है।",
                "भविष्य के संदर्भ के लिए आप अपनी आधिकारिक सत्यापन रिपोर्ट डाउनलोड कर सकते हैं।",
            ]
    else:
        if is_flagged:
            sentences = [
                f"Hello. The verification for your Kisan Credit Card account with {bank_name} is complete.",
                f"The approved credit limit was {app_en}, while the recorded disbursement is {dis_en}.",
                f"A difference of {diff_en} has been identified and may need administrative review.",
                "This check follows the Reserve Bank of India's fee waiver guidelines and the Modified Interest Subvention Scheme.",
                "This difference could be due to authorized crop insurance deductions or pending secondary tranches.",
                "You can request an itemized statement from your branch, call the Kisan Call Centre at 1800-180-1551, or raise a grievance through this portal.",
            ]
        else:
            sentences = [
                f"Hello. The verification for your Kisan Credit Card account with {bank_name} is complete.",
                f"The disbursed amount of {dis_en} exactly matches your approved credit limit of {app_en}.",
                "Your loan record is fully verified with no discrepancy found.",
                "You can download your official KisanVerify verification report for your records.",
            ]

    full_text = " ".join(sentences)
    return {
        "language": language,
        "is_flagged": is_flagged,
        "difference": diff,
        "sentences": sentences,
        "full_text": full_text,
    }


def generate_msp_script(
    crop: str,
    quantity_quintals: float,
    msp_rate: float,
    expected_payment: float,
    actual_payment: float,
    difference: float,
    procurement_center: str = "Patan Krishi Upaj Mandi",
    language: str = "hi"
) -> Dict[str, Any]:
    """
    Generates a 30-50 second spoken summary for MSP payment verification.
    """
    diff = round(expected_payment - actual_payment, 2)
    is_flagged = diff > 0
    is_bonus = diff < 0

    exp_hi = number_to_hindi_words(expected_payment)
    act_hi = number_to_hindi_words(actual_payment)
    diff_hi = number_to_hindi_words(abs(diff))

    exp_en = number_to_english_words(expected_payment)
    act_en = number_to_english_words(actual_payment)
    diff_en = number_to_english_words(abs(diff))

    if language == "hi":
        if is_flagged:
            sentences = [
                f"नमस्कार। आपके {crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।",
                f"{quantity_quintals} क्विंटल फसल के लिए वैधानिक अपेक्षित राशि {exp_hi} थी, जबकि आपके बैंक खाते में {act_hi} जमा हुए हैं।",
                f"इस प्रकार {diff_hi} का अंतर पाया गया है, जिसकी समीक्षा की जानी चाहिए।",
                f"यह जांच कृषि एवं किसान कल्याण मंत्रालय के कृषि लागत एवं मूल्य आयोग की आधिकारिक मूल्य नीति के आधार पर की गई है।",
                "यह अंतर मंडी में नमी या गुणवत्ता छूट, अथवा आंशिक किश्त जारी होने के कारण हो सकता है।",
                f"आप अपने स्थानीय उपार्जन केंद्र {procurement_center} से संपर्क कर सकते हैं, अथवा किसान कॉल सेंटर 1800-180-1551 पर कॉल कर सकते हैं।",
            ]
        elif is_bonus:
            sentences = [
                f"नमस्कार। आपके {crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।",
                f"प्राप्त भुगतान {act_hi} में मूल एमएसपी के अलावा {diff_hi} अतिरिक्त बोनस राशि शामिल है।",
                "आपका भुगतान राज्य सरकार के कृषि इनपुट प्रोत्साहन बोनस सहित पूर्णतः सत्यापित है।",
            ]
        else:
            sentences = [
                f"नमस्कार। आपके {crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।",
                f"प्राप्त भुगतान {act_hi} वैधानिक एमएसपी से शत-प्रतिशत मेल खाता है।",
                "आपका उपार्जन रिकॉर्ड पूरी तरह सत्यापित है।",
            ]
    else:
        if is_flagged:
            sentences = [
                f"Hello. The statutory Minimum Support Price verification for your {crop} is complete.",
                f"For {quantity_quintals} quintals, the expected statutory entitlement was {exp_en}, while recorded bank credit is {act_en}.",
                f"A payment difference of {diff_en} has been flagged and may need review.",
                "This check follows the official Price Policy notification from the Commission for Agricultural Costs and Prices, Ministry of Agriculture.",
                "This variance could be due to quality moisture refractions at the mandi weighbridge, or a scheduled second tranche.",
                f"You can check your Mandi J-Form, contact {procurement_center}, or call the toll-free Kisan Call Centre at 1800-180-1551.",
            ]
        elif is_bonus:
            sentences = [
                f"Hello. The Minimum Support Price verification for your {crop} is complete.",
                f"Your payment of {act_en} includes a state agricultural bonus of {diff_en} above the statutory base price.",
                "Your payment is fully verified with state incentive entitlements.",
            ]
        else:
            sentences = [
                f"Hello. The Minimum Support Price verification for your {crop} is complete.",
                f"Your payment of {act_en} exactly matches 100 percent of the statutory MSP expected.",
                "Your procurement record is fully verified.",
            ]

    full_text = " ".join(sentences)
    return {
        "language": language,
        "is_flagged": is_flagged,
        "difference": diff,
        "sentences": sentences,
        "full_text": full_text,
    }
