/**
 * KisanVerify Language Registry
 * =============================
 * Single source of truth for all supported regional Indian languages and scripts.
 * Defines ISO codes, native display names, script fonts, TTS voice capabilities,
 * and review status flags.
 */

export type ReviewStatus = 'reviewed' | 'machine_draft';

export interface LanguageInfo {
  code: string;
  nativeName: string;
  englishName: string;
  script: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
  fontCssUrl?: string;
  ttsVoiceCode: string;
  ttsSupported: boolean;
  reviewStatus: ReviewStatus;
  reviewedBy: string | null;
  draftWarningEn: string;
  draftWarningNative: string;
}

export const LANGUAGE_REGISTRY: Record<string, LanguageInfo> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    script: 'Latin',
    direction: 'ltr',
    fontFamily: "'Inter', sans-serif",
    ttsVoiceCode: 'en-IN',
    ttsSupported: true,
    reviewStatus: 'reviewed',
    reviewedBy: 'KisanVerify Team',
    draftWarningEn: '',
    draftWarningNative: '',
  },
  hi: {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    script: 'Devanagari',
    direction: 'ltr',
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    ttsVoiceCode: 'hi-IN',
    ttsSupported: true,
    reviewStatus: 'reviewed',
    reviewedBy: 'KisanVerify Agriculture Cell',
    draftWarningEn: '',
    draftWarningNative: '',
  },
  mr: {
    code: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    script: 'Devanagari',
    direction: 'ltr',
    fontFamily: "'Noto Sans Devanagari', sans-serif",
    ttsVoiceCode: 'mr-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Marathi translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'मराठी भाषांतर मशीन-निर्मित मसुदा आहे. कृपया आपल्या बँक शाखेशी खात्री करा.',
  },
  gu: {
    code: 'gu',
    nativeName: 'ગુજરાતી',
    englishName: 'Gujarati',
    script: 'Gujarati',
    direction: 'ltr',
    fontFamily: "'Noto Sans Gujarati', sans-serif",
    ttsVoiceCode: 'gu-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Gujarati translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'ગુજરાતી અનુવાદ મશીન-નિર્મિત ડ્રાફ્ટ છે. કૃપા કરીને તમારી બેંક શાખા સાથે ચકાસો.',
  },
  pa: {
    code: 'pa',
    nativeName: 'ਪੰਜਾਬੀ',
    englishName: 'Punjabi',
    script: 'Gurmukhi',
    direction: 'ltr',
    fontFamily: "'Noto Sans Gurmukhi', sans-serif",
    ttsVoiceCode: 'pa-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Punjabi translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'ਪੰਜਾਬੀ ਅਨੁਵਾਦ ਇੱਕ ਮਸ਼ੀਨੀ ਖਰੜਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਬੈਂਕ ਸ਼ਾਖਾ ਤੋਂ ਪੁਸ਼ਟੀ ਕਰੋ।',
  },
  bn: {
    code: 'bn',
    nativeName: 'বাংলা',
    englishName: 'Bengali',
    script: 'Bengali',
    direction: 'ltr',
    fontFamily: "'Noto Sans Bengali', sans-serif",
    ttsVoiceCode: 'bn-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Bengali translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'বাংলা অনুবাদটি মেশিন-নির্মিত খসড়া। অনুগ্রহ করে আপনার ব্যাংক শাখার সাথে যাচাই করুন।',
  },
  or: {
    code: 'or',
    nativeName: 'ଓଡ଼ିଆ',
    englishName: 'Odia',
    script: 'Odia',
    direction: 'ltr',
    fontFamily: "'Noto Sans Oriya', sans-serif",
    ttsVoiceCode: 'or-IN',
    ttsSupported: false, // Odia voices are rare on Android/browser; shows text transcript with notice
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Odia translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'ଓଡ଼ିଆ ଅନୁବାଦ ଏକ ମେସିନ୍ ନିର୍ମିତ ଡ୍ରାଫ୍ଟ। ଦୟାକରି ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଶାଖାରେ ଯାଞ୍ଚ କରନ୍ତୁ।',
  },
  ta: {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    script: 'Tamil',
    direction: 'ltr',
    fontFamily: "'Noto Sans Tamil', sans-serif",
    ttsVoiceCode: 'ta-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Tamil translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'தமிழ் மொழிபெயர்ப்பு இயந்திர வரைவு ஆகும். தயவுசெய்து உங்கள் வங்கி கிளையில் சரிபார்க்கவும்.',
  },
  te: {
    code: 'te',
    nativeName: 'తెలుగు',
    englishName: 'Telugu',
    script: 'Telugu',
    direction: 'ltr',
    fontFamily: "'Noto Sans Telugu', sans-serif",
    ttsVoiceCode: 'te-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Telugu translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'తెలుగు అనువాదం యంత్ర ముసాయిదా. దయచేసి మీ బ్యాంకు శాఖ వద్ద ధృవీకరించుకోండి.',
  },
  kn: {
    code: 'kn',
    nativeName: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    script: 'Kannada',
    direction: 'ltr',
    fontFamily: "'Noto Sans Kannada', sans-serif",
    ttsVoiceCode: 'kn-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Kannada translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'ಕನ್ನಡ ಅನುವಾದವು ಯಂತ್ರ-ರಚಿತ ಕರಡು ಆಗಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಶಾಖೆಯಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.',
  },
  ml: {
    code: 'ml',
    nativeName: 'മലയാളം',
    englishName: 'Malayalam',
    script: 'Malayalam',
    direction: 'ltr',
    fontFamily: "'Noto Sans Malayalam', sans-serif",
    ttsVoiceCode: 'ml-IN',
    ttsSupported: true,
    reviewStatus: 'machine_draft',
    reviewedBy: null,
    draftWarningEn: 'Malayalam translation is a machine draft. Please verify with your bank branch.',
    draftWarningNative: 'മലയാളം വിവർത്തനം മെഷീൻ ഡ്രാഫ്റ്റ് ആണ്. ദയവായി നിങ്ങളുടെ ബാങ്ക് ശാഖയുമായി പരിശോധിക്കുക.',
  },
};

export const SUPPORTED_LANGUAGES = Object.values(LANGUAGE_REGISTRY);

export function getLanguageInfo(code: string): LanguageInfo {
  return LANGUAGE_REGISTRY[code] || LANGUAGE_REGISTRY.en;
}

export function isLanguageReviewed(code: string): boolean {
  const info = LANGUAGE_REGISTRY[code];
  return info ? info.reviewStatus === 'reviewed' : false;
}

export function isTtsSupportedForLang(code: string): boolean {
  const info = LANGUAGE_REGISTRY[code];
  return info ? info.ttsSupported : false;
}
