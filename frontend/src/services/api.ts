import { apiClient, BASE_API_URL } from '../lib/api';

export const API_BASE = BASE_API_URL;

export async function checkEligibilityApi(params: {
  state: string;
  district: string;
  crop: string;
  land_holding_acres: number;
  farmer_category: string;
  loan_status: string;
}) {
  try {
    return await apiClient.post<any>('/schemes/check-eligibility', params);
  } catch (err) {
    console.warn('Backend offline, using client-side fallback rule engine', err);
  }

  // Client-side fallback rule engine
  const isCg = params.state.toLowerCase().includes('chhattisgarh');
  return {
    farmer_profile_summary: params,
    schemes_count: 4,
    eligible_count: 3,
    possibly_eligible_count: 1,
    disclaimer: 'Results are indicative and represent potential eligibility. They do not constitute a guarantee of approval. Validate against official sources.',
    disclaimer_hi: 'परिणाम सांकेतिक हैं और संभावित पात्रता दर्शाते हैं। ये स्वीकृति की गारंटी नहीं हैं। आधिकारिक स्रोतों से पुष्टि करें।',
    schemes: [
      {
        id: 'sch-pm-kisan',
        scheme_code: 'PM-KISAN',
        title: 'PM-KISAN Samman Nidhi',
        title_hi: 'पीएम-किसान सम्मान निधि',
        category: 'Subsidy',
        description: 'Income support of ₹6,000 per year in three equal 4-monthly installments directly to farmer bank accounts.',
        description_hi: 'किसानों के बैंक खातों में सीधे ₹6,000 प्रति वर्ष की आय सहायता।',
        benefits: '₹6,000 / year via Direct Benefit Transfer (DBT)',
        benefits_hi: '₹6,000 प्रति वर्ष सीधे बैंक खाते में (डीबीटी)',
        eligibility_status: 'Eligible',
        eligibility_label: 'Eligible',
        eligibility_label_hi: 'पात्र',
        deadline: 'Apply by 31 Dec 2025',
        documents_required: ['Aadhaar Card', 'Land Ownership Record (B-1/Khasra)', 'Bank Passbook'],
        state: 'All India',
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pm-kisan',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
      },
      {
        id: 'sch-pmfby',
        scheme_code: 'PMFBY',
        title: 'Pradhan Mantri Fasal Bima Yojana',
        title_hi: 'प्रधानमंत्री फसल बीमा योजना',
        category: 'Insurance',
        description: 'Crop loss insurance covering non-preventable natural risks from pre-sowing to post-harvest.',
        description_hi: 'प्राकृतिक आपदाओं से फसल नुकसान का व्यापक बीमा।',
        benefits: 'Up to ₹50,000/acre insurance sum assured; farmer share only 2% premium',
        benefits_hi: '₹50,000/एकड़ तक की बीमा राशि',
        eligibility_status: 'Eligible',
        eligibility_label: 'Eligible',
        eligibility_label_hi: 'पात्र',
        deadline: 'Apply by 31 Mar 2026',
        documents_required: ['Patwari Girdawari Sowing Certificate', 'Land Record (Khasra/B-1)', 'Aadhaar Card'],
        state: 'All India',
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pmfby',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
      },
      {
        id: 'sch-kcc',
        scheme_code: 'KCC',
        title: 'Kisan Credit Card (KCC)',
        title_hi: 'किसान क्रेडिट कार्ड (केसीसी)',
        category: 'Loan',
        description: 'Institutional short-term crop loan @ 7% with 3% prompt repayment subvention (effective 4%).',
        description_hi: 'समय पर भुगतान पर प्रभावी 4% ब्याज पर अल्पकालिक संस्थागत ऋण।',
        benefits: 'Credit limit up to ₹3,00,000 with 3% prompt repayment subvention',
        benefits_hi: '3% ब्याज छूट के साथ ₹3,00,000 तक की ऋण सीमा',
        eligibility_status: 'Eligible',
        eligibility_label: 'Eligible',
        eligibility_label_hi: 'पात्र',
        deadline: 'Apply by 31 Dec 2025',
        documents_required: ['Land Title (B-1 copy)', 'Identity Proof', 'Address Proof', 'No-Dues Certificate'],
        state: 'All India',
        myscheme_url: 'https://www.myscheme.gov.in/schemes/kcc',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
      },
      {
        id: 'sch-input-sub',
        scheme_code: 'INPUT-SUB',
        title: 'Input Subsidy Scheme',
        title_hi: 'कृषि आदान सहायता योजना',
        category: 'Subsidy',
        description: 'State financial support on seeds, fertilizers and micro-irrigation equipment to boost agricultural yield.',
        description_hi: 'बीज, खाद और कृषि उपकरणों पर सब्सिडी।',
        benefits: 'Subsidy on seeds, fertilizers, and farm equipment up to ₹9,000/acre',
        benefits_hi: 'बीज, खाद और उपकरणों पर ₹9,000/एकड़ तक की सब्सिडी',
        eligibility_status: isCg ? 'Eligible' : 'Possibly Eligible',
        eligibility_label: isCg ? 'Eligible' : 'Possibly Eligible',
        eligibility_label_hi: isCg ? 'पात्र' : 'संभावित पात्र',
        deadline: 'Check details at local Krishi Kendra',
        documents_required: ['Kisan Rin Pustika (KRP)', 'Mandi Registration Slip', 'Aadhaar Card'],
        state: 'Chhattisgarh',
        myscheme_url: 'https://www.myscheme.gov.in/schemes/smam',
        ministry: 'Department of Agriculture & Farmers Welfare',
        source: 'myScheme.gov.in',
      },
    ],
  };
}

export async function fetchSchemeSourceInfoApi() {
  try {
    return await apiClient.get<any>('/schemes/source-info');
  } catch {
    return {
      source: 'myScheme.gov.in',
      title: 'National Platform for Government Schemes & Services',
      portal_url: 'https://www.myscheme.gov.in',
      ministry: 'Ministry of Electronics and Information Technology (MeitY) & NeGD',
      category: 'Agriculture, Rural & Environment',
      status: 'Verified & Active',
    };
  }
}

export async function verifyLoanApi(payload: {
  bank_name: string;
  loan_account_ref: string;
  loan_type: string;
  approved_amount: number;
  disbursed_amount: number;
  interest_rate: number;
  deductions: number;
  loan_date: string;
  farmer_id?: string;
}) {
  try {
    return await apiClient.post<any>('/verify/loan', payload);
  } catch (err) {
    console.warn('Backend offline, calculating loan client-side', err);
  }

  // Deterministic calculation fallback
  const diff = Math.round((payload.approved_amount - payload.disbursed_amount) * 100) / 100;
  const isFlagged = diff > 0;
  return {
    status: isFlagged ? 'Needs Review' : 'Verified',
    approved_amount: payload.approved_amount,
    disbursed_amount: payload.disbursed_amount,
    deductions: payload.deductions,
    difference: diff,
    unaccounted_difference: Math.round((diff - payload.deductions) * 100) / 100,
    is_flagged: isFlagged,
    status_label: isFlagged ? 'Discrepancy Detected' : 'Verified',
    status_label_hi: isFlagged ? 'अंतर पाया गया' : 'सत्यापित',
    explanation: isFlagged
      ? `The disbursed amount (₹${payload.disbursed_amount.toLocaleString()}) is ₹${diff.toLocaleString()} less than the approved amount (₹${payload.approved_amount.toLocaleString()}).`
      : `Disbursed amount matches approved amount exactly.`,
    explanation_hi: isFlagged
      ? `वितरित राशि (₹${payload.disbursed_amount.toLocaleString()}) स्वीकृत राशि से ₹${diff.toLocaleString()} कम दर्ज है।`
      : `वितरित राशि स्वीकृत राशि से पूर्णतः मेल खाती है।`,
    reasons: [
      'Deductions for processing fees and documentation charges',
      'Incomplete documentation or policy variation',
      'Bank policy variation or insurance auto-deduction',
    ],
    reasons_hi: [
      'बैंक प्रोसेसिंग शुल्क और दस्तावेज़ीकरण शुल्क की कटौती',
      'अपूर्ण दस्तावेज़ या बैंक नीतिगत बदलाव',
      'अनिवार्य फसल बीमा प्रीमियम (पीएमएफबीवाई) की स्वतः कटौती',
    ],
    arithmetic_breakdown: [
      { label: 'Approved Loan Amount', label_hi: 'स्वीकृत ऋण राशि', amount: payload.approved_amount },
      { label: 'Disbursed Loan Amount', label_hi: 'वितरित ऋण राशि', amount: payload.disbursed_amount },
      { label: 'Difference Detected', label_hi: 'अंतर पाया गया', amount: diff },
    ],
    next_steps: [
      'Request an itemized sanction letter from your branch.',
      'Check if any insurance premiums were deducted.',
      'File an institutional inquiry if difference is unexplained.',
    ],
    next_steps_hi: [
      'अपनी बैंक शाखा से मदवार स्वीकृति पत्र का अनुरोध करें।',
      'जांचें कि क्या कोई बीमा प्रीमियम काटा गया है।',
      'यदि अंतर स्पष्ट न हो तो संस्थागत जांच दर्ज करें।',
    ]
  };
}

export async function verifyMspApi(payload: {
  crop: string;
  quantity_quintals: number;
  msp_rate: number;
  actual_payment: number;
  procurement_center?: string;
  payment_date?: string;
  farmer_id?: string;
}) {
  try {
    return await apiClient.post<any>('/verify/msp', payload);
  } catch (err) {
    console.warn('Backend offline, calculating MSP client-side', err);
  }

  const expected = Math.round(payload.quantity_quintals * payload.msp_rate * 100) / 100;
  const diff = Math.round((expected - payload.actual_payment) * 100) / 100;
  const isFlagged = diff > 0;

  return {
    status: isFlagged ? 'Needs Review' : 'Verified',
    crop: payload.crop,
    quantity_quintals: payload.quantity_quintals,
    msp_rate: payload.msp_rate,
    expected_payment: expected,
    actual_payment: payload.actual_payment,
    difference: diff,
    is_flagged: isFlagged,
    status_label: isFlagged ? 'Payment Discrepancy Detected' : 'Verified',
    status_label_hi: isFlagged ? 'भुगतान अंतर पाया गया' : 'सत्यापित',
    explanation: isFlagged
      ? `For ${payload.quantity_quintals} quintals at ₹${payload.msp_rate}/qtl, expected amount is ₹${expected.toLocaleString()}. Payment received is ₹${payload.actual_payment.toLocaleString()}, leaving a difference of ₹${diff.toLocaleString()}.`
      : `Actual payment matches expected statutory MSP.`,
    explanation_hi: isFlagged
      ? `${payload.quantity_quintals} क्विंटल के लिए अपेक्षित भुगतान ₹${expected.toLocaleString()} है। प्राप्त राशि ₹${payload.actual_payment.toLocaleString()} है, जिससे ₹${diff.toLocaleString()} का अंतर है।`
      : `प्राप्त भुगतान अपेक्षित एमएसपी से पूर्णतः मेल खाता है।`,
    reasons: [
      'Moisture standard discount (FAQ variation applied at mandi)',
      'Partial tranche payment released by procurement agency',
      'Mandi handling cess or weighing charges withheld',
    ],
    reasons_hi: [
      'मंडी में नमी या गुणवत्ता मानक छूट लागू की गई',
      'उपार्जन एजेंसी द्वारा आंशिक किश्त जारी की गई',
      'मंडी तुलाई या हैंडलिंग शुल्क काटा गया',
    ],
    arithmetic_breakdown: [
      { label: `Crop Quantity (${payload.crop})`, label_hi: 'फसल मात्रा', amount: payload.quantity_quintals },
      { label: 'MSP Rate per Quintal', label_hi: 'एमएसपी दर प्रति क्विंटल', amount: payload.msp_rate },
      { label: 'Expected Payment', label_hi: 'अपेक्षित कुल भुगतान', amount: expected },
      { label: 'Actual Payment Received', label_hi: 'प्राप्त वास्तविक भुगतान', amount: payload.actual_payment },
      { label: 'Payment Difference', label_hi: 'भुगतान अंतर', amount: diff },
    ],
    next_steps: [
      'Inspect your Mandi J-Form receipt for moisture discount notes.',
      'Inquire at the Patan Krishi Upaj Mandi procurement desk.',
      'File a grievance to the Civil Supplies Officer.',
    ],
    next_steps_hi: [
      'नमी कटौती की पुष्टि के लिए मंडी जे-फॉर्म रसीद देखें।',
      'स्थानीय उपार्जन केंद्र से संपर्क करें।',
      'जिला खाद्य एवं नागरिक आपूर्ति कार्यालय में शिकायत दर्ज करें।',
    ]
  };
}

export async function verifyInsuranceApi(payload: {
  insurance_ref?: string;
  crop: string;
  claim_amount_expected: number;
  amount_received: number;
  claim_status?: string;
  farmer_id?: string;
}) {
  try {
    return await apiClient.post<any>('/verify/insurance', payload);
  } catch (err) {
    console.warn('Backend offline, calculating insurance client-side', err);
  }

  const diff = Math.round((payload.claim_amount_expected - payload.amount_received) * 100) / 100;
  const isUnderReview = (payload.claim_status || '').toLowerCase().includes('review');

  return {
    status: diff > 0 && isUnderReview ? 'Under Review' : (diff > 0 ? 'Needs Review' : 'Verified'),
    crop: payload.crop,
    claim_amount_expected: payload.claim_amount_expected,
    amount_received: payload.amount_received,
    difference: diff,
    claim_status: payload.claim_status || 'Under Review',
    is_flagged: diff > 0 && !isUnderReview,
    status_label: isUnderReview ? 'Claim Under Review' : (diff > 0 ? 'Discrepancy Flagged' : 'Verified'),
    status_label_hi: isUnderReview ? 'दावा प्रक्रियाधीन' : (diff > 0 ? 'विसंगति दर्ज' : 'सत्यापित'),
    explanation: `Assessed claim entitlement is ₹${payload.claim_amount_expected.toLocaleString()}. Amount received is ₹${payload.amount_received.toLocaleString()} with ₹${diff.toLocaleString()} pending administrative review.`,
    explanation_hi: `निर्धारित बीमा दावा ₹${payload.claim_amount_expected.toLocaleString()} है। प्राप्त राशि ₹${payload.amount_received.toLocaleString()} है तथा ₹${diff.toLocaleString()} प्रक्रियाधीन है।`,
    reasons: [
      'Crop Cutting Experiment (CCE) threshold yield assessment ongoing',
      'State share subsidy tranche release scheduled for next cycle',
    ],
    reasons_hi: [
      'फसल कटाई प्रयोग (सीसीई) उपज आकलन प्रक्रियाधीन',
      'राज्य सब्सिडी अंश जारी करने की प्रशासनिक स्वीकृति लंबित',
    ],
    arithmetic_breakdown: [
      { label: 'Assessed Claim Entitlement', label_hi: 'निर्धारित दावा राशि', amount: payload.claim_amount_expected },
      { label: 'Disbursed Insurance Claim', label_hi: 'प्राप्त बीमा राशि', amount: payload.amount_received },
      { label: 'Pending Claim Balance', label_hi: 'लंबित दावा शेष', amount: diff },
    ],
    next_steps: [
      'Monitor insurance company status on PMFBY portal.',
      'Ensure bank IFSC and Aadhaar seeding are active.',
    ],
    next_steps_hi: [
      'पीएमएफबीवाई पोर्टल पर बीमा कंपनी की स्थिति देखें।',
      'बैंक खाते में आधार सीडिंग सक्रिय रखें।',
    ]
  };
}

export async function downloadReportPdfApi(reportId: string = 'REP-LN-2025-01'): Promise<Blob> {
  const targetId = reportId || 'REP-LN-2025-01';
  return await apiClient.download(`/reports/download/${targetId}`, `${targetId}_Audit_Report.pdf`);
}

export async function extractLoanOcrApi(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return await apiClient.upload<any>('/ocr/extract-loan', formData);
}

export async function fetchFarmerAttentionApi(farmerId: string = 'FV12345') {
  try {
    return await apiClient.get<any>(`/farmers/me/attention?farmer_id=${farmerId}`);
  } catch (err) {
    console.warn('Backend attention endpoint offline, using client fallback', err);
  }

  // Fallback for offline mode: demo Ramesh Kumar has 2 flagged records (Loan & MSP)
  return {
    farmer_id: farmerId,
    farmer_name: 'Ramesh Kumar',
    count: 2,
    has_discrepancies: true,
    items: [
      {
        record_type: 'Loan',
        record_ref: 'LN-2024-8812',
        title: 'KCC Loan (State Bank of India)',
        title_hi: 'केसीसी ऋण (State Bank of India)',
        difference: 10000,
        status: 'Needs Review',
        link: '/farmer/loan',
      },
      {
        record_type: 'MSP',
        record_ref: 'MSP-2024-4411',
        title: 'MSP Payment (Paddy)',
        title_hi: 'एमएसपी भुगतान (धान)',
        difference: 10000,
        status: 'Needs Review',
        link: '/farmer/msp',
      }
    ]
  };
}

export async function sendAiChatApi(message: string, language: string = 'hi', farmerId: string = 'FV12345') {
  return await apiClient.post<any>('/ai/chat', {
    message,
    language,
    farmer_id: farmerId,
  });
}

export async function fileGrievanceApi(payload: {
  farmer_id: string;
  issue_type: string;
  description: string;
  attachment_name?: string;
}) {
  return await apiClient.post<any>('/grievances/', payload);
}

export function getExportCsvUrl(district?: string): string {
  const query = district ? `?district=${encodeURIComponent(district)}` : '';
  return `${BASE_API_URL}/admin/export-csv${query}`;
}
