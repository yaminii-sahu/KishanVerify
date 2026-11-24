"""
KishanVerify Backend i18n Module
================================
Provides locale resolution via FastAPI Dependency (`get_locale`),
deterministic multilingual translation mapping, and fallback resolution.
"""

from typing import Optional, Dict, Any, List
from fastapi import Request, Query

from app.i18n.catalog import (
    CATALOG_METADATA,
    CLAIM_REASONS,
    LOAN_REASONS,
    MSP_REASONS,
    TIMELINE_STAGES,
    OFFICE_TYPES,
    WEATHER_ADVISORIES,
    ERROR_MESSAGES,
)

SUPPORTED_LOCALES = [
    "en", "hi", "mr", "gu", "pa", "bn", "or", "ta", "te", "kn", "ml"
]

DEFAULT_LOCALE = "en"

def normalize_locale(raw_locale: Optional[str]) -> str:
    """
    Normalizes locale code from formats like 'hi-IN', 'en_US', 'MR', etc.
    Returns normalized 2-letter code if supported, else 'en'.
    """
    if not raw_locale:
        return DEFAULT_LOCALE

    # Split on hyphen, underscore, semicolon, comma
    cleaned = raw_locale.strip().replace("_", "-").split(",")[0].split(";")[0].strip()
    primary = cleaned.split("-")[0].lower()

    if primary in SUPPORTED_LOCALES:
        return primary
    return DEFAULT_LOCALE

def get_locale(request: Request, lang: Optional[str] = Query(None)) -> str:
    """
    FastAPI dependency to extract locale from:
    1. Query param `lang` or `locale`
    2. Header `Accept-Language`
    3. Default to 'en'
    """
    if lang:
        normalized = normalize_locale(lang)
        if normalized:
            return normalized

    # Query param check if called with ?locale=
    query_locale = request.query_params.get("locale")
    if query_locale:
        normalized = normalize_locale(query_locale)
        if normalized:
            return normalized

    # Header check
    accept_lang = request.headers.get("accept-language")
    if accept_lang:
        # e.g., 'mr,en-US;q=0.9,en;q=0.8'
        for part in accept_lang.split(","):
            candidate = part.split(";")[0].strip()
            norm = normalize_locale(candidate)
            if norm != DEFAULT_LOCALE or candidate.lower().startswith("en"):
                return norm

    return DEFAULT_LOCALE

def get_review_status(locale: str) -> str:
    """Returns 'reviewed' or 'machine_draft'."""
    meta = CATALOG_METADATA.get(locale, CATALOG_METADATA[DEFAULT_LOCALE])
    return meta.get("review_status", "machine_draft")

def fallback_value(translations: Dict[str, str], locale: str) -> str:
    """
    Resolves translation using fallback chain:
    requested -> 'hi' (if available) -> 'en' -> first available string.
    """
    if locale in translations and translations[locale]:
        return translations[locale]
    if "hi" in translations and translations["hi"]:
        return translations["hi"]
    if "en" in translations and translations["en"]:
        return translations["en"]
    if translations:
        return next(iter(translations.values()))
    return ""

def localize_claim_reason(code: str, locale: str = DEFAULT_LOCALE) -> Dict[str, str]:
    """
    Returns localized label, explanation, and how_to_fix for a PMFBY reason code.
    """
    locale = normalize_locale(locale)
    reason = CLAIM_REASONS.get(code)
    if not reason:
        # Graceful fallback for custom or unlisted reason codes
        clean_name = code.replace("_", " ").title()
        return {
            "code": code,
            "label": clean_name,
            "explanation": f"Claim status code: {code}. Verification in progress under scheme guidelines.",
            "how_to_fix": "Verify details on the official PMFBY portal (pmfby.gov.in) or contact your District Agriculture Officer.",
            "review_status": get_review_status(locale),
        }

    return {
        "code": code,
        "label": fallback_value(reason.get("label", {}), locale),
        "explanation": fallback_value(reason.get("explanation", {}), locale),
        "how_to_fix": fallback_value(reason.get("how_to_fix", {}), locale),
        "review_status": get_review_status(locale),
    }

def localize_loan_reason(key_or_text: str, locale: str = DEFAULT_LOCALE) -> str:
    """Returns localized loan discrepancy or match explanation."""
    locale = normalize_locale(locale)
    # Direct key lookup
    if key_or_text in LOAN_REASONS:
        return fallback_value(LOAN_REASONS[key_or_text], locale)

    # Text match fallback
    for k, trans in LOAN_REASONS.items():
        if trans.get("en", "").lower() in key_or_text.lower() or key_or_text.lower() in trans.get("en", "").lower():
            return fallback_value(trans, locale)
        if trans.get("hi", "") in key_or_text:
            return fallback_value(trans, locale)

    return key_or_text

def localize_msp_reason(key_or_text: str, locale: str = DEFAULT_LOCALE) -> str:
    """Returns localized MSP deduction or payment explanation."""
    locale = normalize_locale(locale)
    if key_or_text in MSP_REASONS:
        return fallback_value(MSP_REASONS[key_or_text], locale)

    for k, trans in MSP_REASONS.items():
        if trans.get("en", "").lower() in key_or_text.lower() or key_or_text.lower() in trans.get("en", "").lower():
            return fallback_value(trans, locale)
        if trans.get("hi", "") in key_or_text:
            return fallback_value(trans, locale)

    return key_or_text

def localize_stage(stage_key: str, locale: str = DEFAULT_LOCALE) -> str:
    """Returns localized name of a timeline stage."""
    locale = normalize_locale(locale)
    stage = TIMELINE_STAGES.get(stage_key.lower().strip())
    if stage:
        return fallback_value(stage, locale)
    return stage_key.replace("_", " ").title()

def localize_office_type(office_type: str, locale: str = DEFAULT_LOCALE) -> str:
    """Returns localized name for extension office category."""
    locale = normalize_locale(locale)
    ot = office_type.lower().strip()
    if ot in OFFICE_TYPES:
        return fallback_value(OFFICE_TYPES[ot], locale)
    return office_type.title()

def localize_weather_advisory(advisory_id: str, locale: str = DEFAULT_LOCALE) -> Dict[str, str]:
    """Returns localized title and action for weather advisory."""
    locale = normalize_locale(locale)
    adv = WEATHER_ADVISORIES.get(advisory_id)
    if not adv:
        return {"title": advisory_id, "action": ""}
    return {
        "title": fallback_value(adv.get("title", {}), locale),
        "action": fallback_value(adv.get("action", {}), locale),
    }

def localize_error(error_key: str, locale: str = DEFAULT_LOCALE) -> str:
    """Returns localized system or validation error message."""
    locale = normalize_locale(locale)
    err = ERROR_MESSAGES.get(error_key)
    if err:
        return fallback_value(err, locale)
    return error_key
