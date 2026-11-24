/**
 * Client-Side Deterministic Spoken Script Generator for KisanVerify
 * Translates numbers phonetically into Hindi and English words
 * and splits into sentences for live transcript highlighting during audio playback.
 */

const HINDI_ONES: Record<number, string> = {
  0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार',
  5: 'पांच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ',
  10: 'दस', 11: 'ग्यारह', 12: 'बारह', 13: 'तेरह', 14: 'चौदह',
  15: 'पंद्रह', 16: 'सोलह', 17: 'सत्रह', 18: 'अट्ठारह', 19: 'उन्नीस',
  20: 'बीस', 25: 'पच्चीस', 30: 'तीस', 40: 'चालीस', 50: 'पचास',
  60: 'साठ', 70: 'सत्तर', 80: 'अस्सी', 90: 'नब्बे'
};

const ENGLISH_WORDS: Record<number, string> = {
  0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four',
  5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine',
  10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
  15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen',
  20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
  60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety'
};

export function numberToHindiWords(amount: number): string {
  let num = Math.round(Math.abs(amount));
  if (num === 0) return 'शून्य रुपये';

  const parts: string[] = [];

  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    parts.push(`${twoDigitHindi(crores)} करोड़`);
    num %= 10000000;
  }

  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    parts.push(`${twoDigitHindi(lakhs)} लाख`);
    num %= 100000;
  }

  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    parts.push(`${twoDigitHindi(thousands)} हज़ार`);
    num %= 1000;
  }

  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    parts.push(`${twoDigitHindi(hundreds)} सौ`);
    num %= 100;
  }

  if (num > 0) {
    parts.push(twoDigitHindi(num));
  }

  return parts.join(' ') + ' रुपये';
}

function twoDigitHindi(n: number): string {
  if (HINDI_ONES[n]) return HINDI_ONES[n];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  return `${HINDI_ONES[tens] || tens} ${HINDI_ONES[ones] || ones}`;
}

export function numberToEnglishWords(amount: number): string {
  let num = Math.round(Math.abs(amount));
  if (num === 0) return 'zero rupees';

  const parts: string[] = [];

  const crores = Math.floor(num / 10000000);
  if (crores > 0) {
    parts.push(`${twoDigitEnglish(crores)} crore`);
    num %= 10000000;
  }

  const lakhs = Math.floor(num / 100000);
  if (lakhs > 0) {
    parts.push(`${twoDigitEnglish(lakhs)} lakh`);
    num %= 100000;
  }

  const thousands = Math.floor(num / 1000);
  if (thousands > 0) {
    parts.push(`${twoDigitEnglish(thousands)} thousand`);
    num %= 1000;
  }

  const hundreds = Math.floor(num / 100);
  if (hundreds > 0) {
    parts.push(`${twoDigitEnglish(hundreds)} hundred`);
    num %= 100;
  }

  if (num > 0) {
    parts.push(twoDigitEnglish(num));
  }

  return parts.join(' ') + ' rupees';
}

function twoDigitEnglish(n: number): string {
  if (ENGLISH_WORDS[n]) return ENGLISH_WORDS[n];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  return `${ENGLISH_WORDS[tens] || tens}-${ENGLISH_WORDS[ones] || ones}`;
}

export interface SpokenScriptResult {
  fullText: string;
  sentences: string[];
  isFlagged: boolean;
  difference: number;
}

export function generateClientAudioScript(params: {
  checkType: 'loan' | 'msp' | 'insurance';
  language: 'hi' | 'en';
  approvedAmount?: number;
  disbursedAmount?: number;
  difference?: number;
  bankName?: string;
  crop?: string;
  quantity?: number;
  rate?: number;
  expectedPayment?: number;
  actualPayment?: number;
  procurementCenter?: string;
  claimStatus?: string;
}): SpokenScriptResult {
  const isHi = params.language === 'hi';

  if (params.checkType === 'insurance') {
    const crop = params.crop || 'Paddy (Kharif)';
    const exp = params.expectedPayment !== undefined ? params.expectedPayment : 30000;
    const act = params.actualPayment !== undefined ? params.actualPayment : 20000;
    const diff = params.difference !== undefined ? params.difference : (exp - act);
    const isFlagged = diff > 0 && Math.abs(diff) > 100;
    const isMatch = Math.abs(diff) <= 100;

    const expText = isHi ? numberToHindiWords(exp) : numberToEnglishWords(exp);
    const actText = isHi ? numberToHindiWords(act) : numberToEnglishWords(act);
    const diffText = isHi ? numberToHindiWords(Math.abs(diff)) : numberToEnglishWords(Math.abs(diff));

    if (isHi) {
      const sentences = isMatch ? [
        `नमस्कार। आपके ${crop} के प्रधानमंत्री फसल बीमा दावे की जांच पूरी हो गई है।`,
        `बैंक में प्राप्त राशि ${actText} निर्धारित दावा पात्रता ${expText} से पूर्णतः मेल खाती है।`,
        `आपका फसल बीमा दावा वैधानिक नियमों के अनुरूप पूर्णतः निपटित और सत्यापित है।`,
        `भविष्य के संदर्भ के लिए आप अपनी आधिकारिक फसल बीमा सत्यापन रिपोर्ट डाउनलोड कर सकते हैं।`,
      ] : [
        `नमस्कार। आपके ${crop} के प्रधानमंत्री फसल बीमा दावे की जांच पूरी हो गई है।`,
        `संयुक्त खेत सर्वेक्षण के अनुसार आपकी निर्धारित दावा पात्रता ${expText} थी, जबकि बैंक खाते में अब तक ${actText} प्राप्त हुए हैं।`,
        `इस प्रकार ${diffText} का अंतर प्रक्रियाधीन दर्ज किया गया है।`,
        `यह जांच कृषि एवं किसान कल्याण मंत्रालय के पीएमएफबीवाई संशोधित परिचालन दिशानिर्देशों के अनुसार की गई है।`,
        `कृपया ध्यान दें कि यह अंतर राज्य सरकार के सब्सिडी अंश के मिलान के कारण द्वितीय किश्त में जारी होने की संभावना है।`,
        `यदि 21 दिनों के भीतर भुगतान न हो, तो आप टोल-फ्री हेल्पलाइन 14447 या जिला कृषि अधिकारी से संपर्क कर सकते हैं।`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    } else {
      const sentences = isMatch ? [
        `Hello. The Pradhan Mantri Fasal Bima Yojana claim verification for your ${crop} is complete.`,
        `The disbursed amount of ${actText} exactly matches your assessed entitlement of ${expText}.`,
        `Your crop insurance claim is fully settled and verified under statutory guidelines.`,
        `You can download your official KisanVerify crop insurance report for your records.`,
      ] : [
        `Hello. The Pradhan Mantri Fasal Bima Yojana claim verification for your ${crop} is complete.`,
        `Based on the joint field survey, your assessed claim entitlement was ${expText}, while recorded disbursement is ${actText}.`,
        `A balance difference of ${diffText} is currently recorded under administrative review.`,
        `This check follows official guidelines from the Ministry of Agriculture and Farmers Welfare.`,
        `Under standard procedures, this variance often reflects a secondary tranche pending state premium subsidy release.`,
        `For assistance, you can call the PMFBY toll-free helpline at 14447 or contact your District Agriculture Officer.`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    }
  }

  if (params.checkType === 'loan') {
    const app = params.approvedAmount || 80000;
    const dis = params.disbursedAmount || 70000;
    const diff = params.difference !== undefined ? params.difference : (app - dis);
    const bank = params.bankName || 'State Bank of India';
    const isFlagged = diff > 0;

    const appText = isHi ? numberToHindiWords(app) : numberToEnglishWords(app);
    const disText = isHi ? numberToHindiWords(dis) : numberToEnglishWords(dis);
    const diffText = isHi ? numberToHindiWords(diff) : numberToEnglishWords(diff);

    if (isHi) {
      const sentences = isFlagged ? [
        `नमस्कार। आपके ${bank} के किसान क्रेडिट कार्ड खाते की जांच पूरी हो गई है।`,
        `इस रिकॉर्ड में स्वीकृत ऋण सीमा ${appText} थी, जबकि बैंक द्वारा ${disText} वितरित किए गए हैं।`,
        `इस प्रकार ${diffText} का अंतर पाया गया है, जिसकी समीक्षा की जानी चाहिए।`,
        `यह जांच भारतीय रिज़र्व बैंक के केसीसी शुल्क छूट निर्देश और संशोधित ब्याज अनुदान योजना के आधार पर की गई है।`,
        `कृपया ध्यान दें कि यह अंतर अनिवार्य फसल बीमा प्रीमियम या बैंक दस्तावेजी शुल्क की कटौती के कारण हो सकता है।`,
        `आप अपनी बैंक शाखा से संपर्क कर सकते हैं, अथवा किसान कॉल सेंटर टोल-फ्री नंबर 1800-180-1551 पर कॉल कर सकते हैं।`,
      ] : [
        `नमस्कार। आपके ${bank} के किसान क्रेडिट कार्ड खाते की जांच पूरी हो गई है।`,
        `वितरित राशि ${disText} स्वीकृत सीमा ${appText} से पूर्णतः मेल खाती है।`,
        `आपका ऋण रिकॉर्ड पूरी तरह सत्यापित है और इसमें कोई अंतर नहीं पाया गया है।`,
        `भविष्य के संदर्भ के लिए आप अपनी आधिकारिक सत्यापन रिपोर्ट डाउनलोड कर सकते हैं।`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    } else {
      const sentences = isFlagged ? [
        `Hello. The verification for your Kisan Credit Card account with ${bank} is complete.`,
        `The approved credit limit was ${appText}, while recorded disbursement is ${disText}.`,
        `A difference of ${diffText} has been identified and may need administrative review.`,
        `This check follows Reserve Bank of India fee waiver directives and the Modified Interest Subvention Scheme.`,
        `This variance could be due to authorized crop insurance deductions or pending secondary tranches.`,
        `You can request an itemized statement from your branch, call the Kisan Call Centre at 1800-180-1551, or raise a grievance through this portal.`,
      ] : [
        `Hello. The verification for your Kisan Credit Card account with ${bank} is complete.`,
        `The disbursed amount of ${disText} exactly matches your approved credit limit of ${appText}.`,
        `Your loan record is fully verified with no discrepancy found.`,
        `You can download your official KisanVerify verification report for your records.`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    }
  } else {
    // MSP
    const crop = params.crop || 'Paddy';
    const qty = params.quantity || 50;
    const exp = params.expectedPayment || 115000;
    const act = params.actualPayment || 105000;
    const diff = params.difference !== undefined ? params.difference : (exp - act);
    const mandi = params.procurementCenter || 'Patan Krishi Upaj Mandi';
    const isFlagged = diff > 0;
    const isBonus = diff < 0;

    const expText = isHi ? numberToHindiWords(exp) : numberToEnglishWords(exp);
    const actText = isHi ? numberToHindiWords(act) : numberToEnglishWords(act);
    const diffText = isHi ? numberToHindiWords(Math.abs(diff)) : numberToEnglishWords(Math.abs(diff));

    if (isHi) {
      const sentences = isFlagged ? [
        `नमस्कार। आपके ${crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।`,
        `${qty} क्विंटल फसल के लिए वैधानिक अपेक्षित राशि ${expText} थी, जबकि आपके बैंक खाते में ${actText} जमा हुए हैं।`,
        `इस प्रकार ${diffText} का अंतर पाया गया है, जिसकी समीक्षा की जानी चाहिए।`,
        `यह जांच कृषि लागत एवं मूल्य आयोग की आधिकारिक मूल्य नीति के आधार पर की गई है।`,
        `यह अंतर मंडी में नमी या गुणवत्ता छूट, अथवा आंशिक किश्त जारी होने के कारण हो सकता है।`,
        `आप अपने स्थानीय उपार्जन केंद्र ${mandi} से संपर्क कर सकते हैं, अथवा किसान कॉल सेंटर 1800-180-1551 पर कॉल कर सकते हैं।`,
      ] : isBonus ? [
        `नमस्कार। आपके ${crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।`,
        `प्राप्त भुगतान ${actText} में मूल एमएसपी के अलावा ${diffText} अतिरिक्त बोनस राशि शामिल है।`,
        `आपका भुगतान राज्य सरकार के कृषि इनपुट प्रोत्साहन बोनस सहित पूर्णतः सत्यापित है।`,
      ] : [
        `नमस्कार। आपके ${crop} की न्यूनतम समर्थन मूल्य भुगतान जांच पूरी हो गई है।`,
        `प्राप्त भुगतान ${actText} वैधानिक एमएसपी से शत-प्रतिशत मेल खाता है।`,
        `आपका उपार्जन रिकॉर्ड पूरी तरह सत्यापित है।`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    } else {
      const sentences = isFlagged ? [
        `Hello. The statutory Minimum Support Price verification for your ${crop} is complete.`,
        `For ${qty} quintals, the expected statutory entitlement was ${expText}, while recorded bank credit is ${actText}.`,
        `A payment difference of ${diffText} has been flagged and may need review.`,
        `This check follows official Price Policy notifications from the Commission for Agricultural Costs and Prices.`,
        `This variance could be due to quality moisture refractions at the mandi weighbridge, or a scheduled second tranche.`,
        `You can check your Mandi J-Form, contact ${mandi}, or call the toll-free Kisan Call Centre at 1800-180-1551.`,
      ] : isBonus ? [
        `Hello. The Minimum Support Price verification for your ${crop} is complete.`,
        `Your payment of ${actText} includes a state agricultural bonus of ${diffText} above the statutory base price.`,
        `Your payment is fully verified with state incentive entitlements.`,
      ] : [
        `Hello. The Minimum Support Price verification for your ${crop} is complete.`,
        `Your payment of ${actText} exactly matches 100 percent of the statutory MSP expected.`,
        `Your procurement record is fully verified.`,
      ];
      return { fullText: sentences.join(' '), sentences, isFlagged, difference: diff };
    }
  }
}
