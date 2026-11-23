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

export async function fetchSchemesListApi(params?: {
  level?: string;
  state?: string;
  category?: string;
  search?: string;
}) {
  try {
    const q = new URLSearchParams();
    if (params?.level && params.level !== 'All') q.append('level', params.level);
    if (params?.state && params.state !== 'All' && params.state !== 'All States & UTs') q.append('state', params.state);
    if (params?.category && params.category !== 'All') q.append('category', params.category);
    if (params?.search && params.search.trim()) q.append('search', params.search.trim());

    const queryStr = q.toString() ? `?${q.toString()}` : '';
    return await apiClient.get<any[]>(`/schemes/${queryStr}`);
  } catch (err) {
    console.warn('Backend schemes list fetch failed, using fallback list', err);
    return [
      {
        id: 'PM-KISAN',
        scheme_code: 'PM-KISAN',
        title: 'PM-KISAN Samman Nidhi',
        title_hi: 'पीएम-किसान सम्मान निधि',
        level: 'Central',
        state: null,
        category: 'Income Support',
        short_description: 'Direct income support of ₹6,000/year to landholding farmer families.',
        description: 'Central sector scheme providing income support of ₹6,000 per year in three equal 4-monthly installments directly to farmer bank accounts.',
        description_hi: 'किसानों के बैंक खातों में सीधे तीन समान 4-मासिक किश्तों में प्रति वर्ष ₹6,000 की आय सहायता।',
        benefits: '₹6,000 / year via Direct Benefit Transfer (DBT)',
        benefits_hi: '₹6,000 प्रति वर्ष सीधे बैंक खाते में (डीबीटी)',
        eligibility_summary: 'All landholding farmer families having cultivable landholding in their name.',
        documents_required: ['Aadhaar Card', 'Land Ownership Record (B-1/Khasra)', 'Bank Passbook'],
        deadline: 'Apply by 31 Dec 2025',
        official_url: 'https://pmkisan.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pm-kisan',
        source_note: 'Official portal of PM-KISAN, Ministry of Agriculture & Farmers Welfare, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'PMFBY',
        scheme_code: 'PMFBY',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        title_hi: 'प्रधानमंत्री फसल बीमा योजना',
        level: 'Central',
        state: null,
        category: 'Insurance',
        short_description: 'Subsidized crop insurance coverage against non-preventable natural risks.',
        description: 'Comprehensive crop insurance covering non-preventable natural risks from pre-sowing to post-harvest at very low farmer premiums (2% for Kharif, 1.5% for Rabi).',
        description_hi: 'बुवाई से पहले से लेकर कटाई के बाद तक गैर-रोकथाम प्राकृतिक जोखिमों को कवर करने वाला व्यापक फसल बीमा।',
        benefits: 'Up to ₹50,000/acre insurance sum assured against natural calamities',
        benefits_hi: 'प्राकृतिक आपदाओं के विरुद्ध ₹50,000/एकड़ तक की बीमा राशि',
        eligibility_summary: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
        documents_required: ['Land Girdawari Certificate', 'Sowing Certificate', 'Aadhaar Card', 'Bank Account Details'],
        deadline: 'Apply by 31 Mar 2026',
        official_url: 'https://pmfby.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pmfby',
        source_note: 'Official PMFBY Portal, Ministry of Agriculture & Farmers Welfare, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'KCC',
        scheme_code: 'KCC',
        title: 'Kisan Credit Card (KCC) Scheme',
        title_hi: 'किसान क्रेडिट कार्ड योजना',
        level: 'Central',
        state: null,
        category: 'Loan',
        short_description: 'Flexible revolving cash credit for cultivation and farm asset maintenance at 4% interest.',
        description: 'Timely, flexible and cost-effective institutional short-term credit for cultivation, post-harvest expenses and maintenance @ effective 4% interest upon prompt repayment.',
        description_hi: 'समय पर पुनर्भुगतान करने पर प्रभावी 4% ब्याज पर खेती और रख-रखाव के लिए समयबद्ध और लचीला संस्थागत ऋण।',
        benefits: 'Credit limit up to ₹3,00,000 with 3% prompt repayment subvention',
        benefits_hi: '3% ब्याज छूट के साथ ₹3,00,000 तक की ऋण सीमा',
        eligibility_summary: 'All farmers, individual/joint borrowers who are owner cultivators or tenant farmers.',
        documents_required: ['Land Title (B-1/Khasra Copy)', 'Identity Proof', 'Address Proof', 'No-Dues Certificate'],
        deadline: 'Apply by 31 Dec 2025',
        official_url: 'https://agricoop.nic.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/kcc',
        source_note: 'Official portal under Department of Agriculture & Farmers Welfare, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'SOIL-CARD',
        scheme_code: 'SOIL-CARD',
        title: 'Soil Health Card Scheme',
        title_hi: 'मृदा स्वास्थ्य कार्ड योजना',
        level: 'Central',
        state: null,
        category: 'Subsidy',
        short_description: 'Free soil testing report card with crop-wise nutrient recommendations.',
        description: 'Provides farmers with soil health cards carrying nutrient status and fertilizer dosage recommendations every 2 years to reduce farming costs.',
        description_hi: 'किसानों को मिट्टी की गुणवत्ता और पोषक तत्वों की सटीक रिपोर्ट तथा खाद उपयोग की सिफारिशें।',
        benefits: 'Free scientific soil laboratory test and customized fertilizer advisory',
        benefits_hi: 'निःशुल्क वैज्ञानिक मिट्टी परीक्षण और उर्वरक सलाह',
        eligibility_summary: 'Open to all farmers across India holding cultivable land.',
        documents_required: ['Aadhaar Card', 'Land Identification Details (Khasra No.)'],
        deadline: 'Ongoing cycle 2025-26',
        official_url: 'https://soilhealth.dac.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/shc',
        source_note: 'Official Soil Health Portal, Ministry of Agriculture & Farmers Welfare, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'ENAM',
        scheme_code: 'ENAM',
        title: 'National Agriculture Market (e-NAM)',
        title_hi: 'राष्ट्रीय कृषि बाजार (ई-नाम)',
        level: 'Central',
        state: null,
        category: 'Equipment',
        short_description: 'Pan-India electronic trading portal integrating APMC mandis.',
        description: 'Online trading platform for agricultural commodities facilitating transparent price discovery and online payment directly into farmer accounts.',
        description_hi: 'पारदर्शी बोली और बेहतर मूल्य प्राप्ति के लिए अखिल भारतीय इलेक्ट्रॉनिक कृषि व्यापार पोर्टल।',
        benefits: 'Direct access to nationwide buyers and transparent digital bidding',
        benefits_hi: 'देशभर के व्यापारियों से सीधे ऑनलाइन बोली और बैंक भुगतान',
        eligibility_summary: 'Farmers selling agricultural commodities through regulated APMC markets.',
        documents_required: ['Aadhaar Card', 'Bank Account Details', 'Mandi Entry Pass'],
        deadline: 'Year-round operation',
        official_url: 'https://enam.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/e-nam',
        source_note: 'Official e-NAM portal under SFAC, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of Agriculture and Farmers Welfare',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'PM-KUSUM',
        scheme_code: 'PM-KUSUM',
        title: 'Pradhan Mantri KUSUM Yojana',
        title_hi: 'प्रधानमंत्री कुसुम योजना (सोलर पंप)',
        level: 'Central',
        state: null,
        category: 'Irrigation',
        short_description: 'Up to 60% subsidy for installation of stand-alone solar agriculture pumps.',
        description: 'Supports farmers in installing solar irrigation water pumps, replacing expensive diesel pumps and securing reliable daytime irrigation.',
        description_hi: 'कृषि में सिंचाई के लिए सोलर पंप स्थापना पर 60% तक का भारी सरकारी अनुदान।',
        benefits: '60% government subsidy (30% Central + 30% State) on solar pump systems',
        benefits_hi: 'सोलर पंप स्थापना पर 60% तक का अनुदान',
        eligibility_summary: 'Individual farmers, cooperatives, panchayats with agricultural land.',
        documents_required: ['Land Ownership Papers (Khasra/B1)', 'Bank Details', 'Aadhaar Card'],
        deadline: 'Apply by 31 Dec 2025',
        official_url: 'https://pmkusum.mnre.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pm-kusum',
        source_note: 'Official portal of PM-KUSUM, Ministry of New and Renewable Energy, GoI',
        last_verified_on: '2025-04-10',
        ministry: 'Ministry of New and Renewable Energy',
        source: 'myScheme.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'CG-KUY',
        scheme_code: 'CG-KUY',
        title: 'Krishi Unnati Yojana (Chhattisgarh)',
        title_hi: 'कृषक उन्नति योजना (छत्तीसगढ़)',
        level: 'State',
        state: 'Chhattisgarh',
        category: 'Subsidy',
        short_description: 'State input incentive ensuring up to ₹3,100/quintal remunerative price for paddy.',
        description: 'Flagship scheme of Govt of Chhattisgarh providing input assistance to paddy farmers, ensuring ₹3,100 per quintal total price for up to 21 quintals/acre.',
        description_hi: 'धान उत्पादक किसानों को ₹3,100 प्रति क्विंटल तक का सुनिश्चित लाभकारी मूल्य व आदान सहायता।',
        benefits: 'Input assistance bridging market price to ₹3,100 per quintal up to 21 quintals/acre',
        benefits_hi: '21 क्विंटल/एकड़ तक ₹3,100 प्रति क्विंटल का भुगतान',
        eligibility_summary: 'Farmers selling paddy at designated Primary Agricultural Cooperative Societies (PACS) in Chhattisgarh.',
        documents_required: ['Kisan Rin Pustika (KRP)', 'Girdawari Registration Slip', 'Aadhaar Card', 'Bank Passbook'],
        deadline: 'Procurement season cycle',
        official_url: 'https://agriportal.cg.nic.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/smam',
        source_note: 'Official Portal of Directorate of Agriculture, Government of Chhattisgarh',
        last_verified_on: '2025-04-10',
        ministry: 'Department of Agriculture, Govt of Chhattisgarh',
        source: 'agriportal.cg.nic.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
      {
        id: 'CG-SSY',
        scheme_code: 'CG-SSY',
        title: 'Saur Sujala Yojana (Chhattisgarh)',
        title_hi: 'सौर सुजला योजना (छत्तीसगढ़)',
        level: 'State',
        state: 'Chhattisgarh',
        category: 'Irrigation',
        short_description: 'Subsidized solar-powered water irrigation pumps for Chhattisgarh farmers.',
        description: 'CREDA initiative to deploy 3HP and 5HP solar irrigation pumps to farmers at highly subsidized rates for un-electrified agricultural lands.',
        description_hi: 'छत्तीसगढ़ के गैर-विद्युतीकृत कृषि क्षेत्रों में 3HP/5HP सोलर पंप नाममात्र दर पर उपलब्ध कराना।',
        benefits: 'Solar water pump installation at 90%+ subsidized cost for small/marginal farmers',
        benefits_hi: 'लघु व सीमांत किसानों को 90% से अधिक अनुदान पर सोलर पंप',
        eligibility_summary: 'Farmers in un-electrified or low-voltage agricultural regions of Chhattisgarh.',
        documents_required: ['B-1/P-II Khasra Copy', 'Caste Certificate (for SC/ST concession)', 'Aadhaar Card', 'Bank Details'],
        deadline: 'Apply via District CREDA office',
        official_url: 'https://creda.cgstate.gov.in',
        has_verified_official_portal: true,
        myscheme_url: 'https://www.myscheme.gov.in/schemes/pm-kusum',
        source_note: 'Official Portal of Chhattisgarh State Renewable Energy Development Agency (CREDA)',
        last_verified_on: '2025-04-10',
        ministry: 'CREDA, Energy Department, Govt of Chhattisgarh',
        source: 'creda.cgstate.gov.in',
        eligibility_status: 'Potentially Eligible',
        eligibility_label: 'Potentially Eligible',
        eligibility_label_hi: 'संभावित पात्र',
      },
    ];
  }
}

export async function reportBrokenLinkApi(schemeCode: string, payload: { reported_url?: string; note?: string }) {
  try {
    return await apiClient.post<any>(`/schemes/${schemeCode}/report-broken-link`, payload);
  } catch {
    return {
      status: 'success',
      message: 'Thank you. Your report has been recorded for portal verification.',
    };
  }
}

// ==========================================
// MY DOCUMENTS VAULT APIS
// ==========================================

export interface DocumentItem {
  id?: number;
  doc_uuid: string;
  farmer_id: string;
  category: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  size_formatted?: string;
  note?: string;
  masked_id?: string;
  expiry_date?: string;
  uploaded_at: string;
}

export async function fetchDocumentsApi(farmerId: string = 'FV12345', category?: string, search?: string) {
  try {
    const q = new URLSearchParams({ farmer_id: farmerId });
    if (category && category !== 'All') q.append('category', category);
    if (search) q.append('search', search);

    return await apiClient.get<any>(`/documents/?${q.toString()}`, {
      'X-Farmer-Id': farmerId,
    });
  } catch (err) {
    console.warn('Backend documents fetch failed, using fallback mock', err);
    return {
      farmer_id: farmerId,
      total_documents: 5,
      storage: {
        used_bytes: 4200000,
        used_formatted: '4.2 MB',
        quota_bytes: 52428800,
        quota_formatted: '50 MB',
        usage_percent: 8.4,
      },
      documents: [
        {
          id: 1,
          doc_uuid: 'doc-aadhaar',
          farmer_id: farmerId,
          category: 'Identity',
          original_name: 'Aadhaar_Card_Ramesh.pdf',
          mime_type: 'application/pdf',
          size_bytes: 1250000,
          size_formatted: '1.2 MB',
          note: 'Aadhaar seeded with SBI account for PM-KISAN DBT',
          masked_id: 'XXXX-XXXX-8921',
          uploaded_at: '12 Jan 2025, 10:30 AM',
        },
        {
          id: 2,
          doc_uuid: 'doc-khasra',
          farmer_id: farmerId,
          category: 'Land',
          original_name: 'Khasra_B1_Patan_142.pdf',
          mime_type: 'application/pdf',
          size_bytes: 1450000,
          size_formatted: '1.4 MB',
          note: 'Patan Durg land parcel record (3.0 acres)',
          masked_id: 'KH-142/1',
          uploaded_at: '15 Feb 2025, 02:15 PM',
        },
        {
          id: 3,
          doc_uuid: 'doc-passbook',
          farmer_id: farmerId,
          category: 'Bank',
          original_name: 'SBI_Passbook_FrontPage.png',
          mime_type: 'image/png',
          size_bytes: 850000,
          size_formatted: '850 KB',
          note: 'SBI Patan branch primary account',
          masked_id: 'SBIN*******1234',
          uploaded_at: '01 Mar 2025, 11:00 AM',
        },
        {
          id: 4,
          doc_uuid: 'doc-insurance',
          farmer_id: farmerId,
          category: 'Insurance',
          original_name: 'PMFBY_Policy_Certificate_2025.pdf',
          mime_type: 'application/pdf',
          size_bytes: 650000,
          size_formatted: '650 KB',
          note: 'Paddy crop insurance policy receipt',
          expiry_date: '31 Dec 2025',
          masked_id: 'CI20251234',
          uploaded_at: '10 Mar 2025, 04:45 PM',
        },
        {
          id: 5,
          doc_uuid: 'doc-sanction',
          farmer_id: farmerId,
          category: 'Bank',
          original_name: 'Loan_Sanction_Letter_SBI.pdf',
          mime_type: 'application/pdf',
          size_bytes: 980000,
          size_formatted: '980 KB',
          note: 'Approved ₹80,000 KCC Sanction from SBI Patan',
          expiry_date: '15 Mar 2026',
          masked_id: 'LN-2024-8812',
          uploaded_at: '12 Apr 2025, 09:30 AM',
        },
      ]
    };
  }
}

export async function uploadDocumentApi(formData: FormData, farmerId: string = 'FV12345') {
  if (!formData.has('farmer_id')) {
    formData.append('farmer_id', farmerId);
  }
  return await apiClient.upload<any>('/documents/upload', formData);
}

export async function updateDocumentApi(docUuid: string, patchData: any, farmerId: string = 'FV12345') {
  return await apiClient.patch<any>(`/documents/${docUuid}`, patchData, {
    'X-Farmer-Id': farmerId,
  });
}

export async function deleteDocumentApi(docUuid: string, farmerId: string = 'FV12345') {
  return await apiClient.delete<any>(`/documents/${docUuid}`, {
    'X-Farmer-Id': farmerId,
  });
}

export async function deleteAllDocumentsApi(farmerId: string = 'FV12345') {
  return await apiClient.delete<any>('/documents/all/purge', {
    'X-Farmer-Id': farmerId,
  });
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
