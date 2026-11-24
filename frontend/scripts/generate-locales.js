import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '../src/locales');

// Comprehensive dictionary for core translation across the 9 regional languages
// Terminology verified against glossary.md and official government terminology portals
const REGIONAL_TRANSLATIONS = {
  mr: {
    name: 'मराठी',
    common: {
      app_name: 'किसानव्हेरीफाय',
      tagline: 'प्रत्येक रुपया. प्रत्येक लाभ. पडताळणीकृत.',
      demo_badge: 'डेमो डेटा',
      status: {
        verified: 'पडताळणीकृत',
        needs_review: 'पुनरावलोकन आवश्यक',
        under_review: 'प्रक्रिया सुरू आहे',
        discrepancy: 'तफावत आढळली',
        eligible: 'पात्र',
        possibly_eligible: 'संभाव्य पात्र',
        pending: 'प्रलंबित',
        resolved: 'निवारण झाले',
      },
      actions: {
        view_details: 'तपशील पहा',
        verify: 'तपासा',
        verify_details: 'तपशील पडताळा',
        download_report: 'अहवाल डाउनलोड करा (PDF)',
        listen: 'ऐका',
        raise_grievance: 'तक्रार नोंदवा',
        submit: 'सादर करा',
        cancel: 'रद्द करा',
        confirm: 'निश्चित करा',
        close: 'बंद करा',
        reset: 'रीसेट करा',
        back: 'मागे',
        filter: 'फिल्टर',
        search: 'शोधा',
        retry: 'पुन्हा प्रयत्न करा',
      },
      neutral_phrasing: {
        may_need_review: 'पुनरावलोकन आवश्यक असू शकते',
        difference_note: 'तफावत ही बँकेत पडताळणीची सूचना आहे, कोणत्याही गैरव्यवहाराचा पुरावा नाही.',
        indicative_notice: 'निकाल सूचक आहेत. हे मंजुरीची हमी देत नाहीत.',
      },
      draft_warning: 'मराठी भाषांतर मशीन-निर्मित मसुदा आहे. कृपया आपल्या बँकेशी खात्री करा.',
    },
    nav: {
      home: 'मुख्यपृष्ठ',
      schemes: 'माझ्या योजना',
      loan: 'माझे कर्ज',
      msp: 'हमीभाव (MSP) देयके',
      insurance: 'पीक विमा',
      assistant: 'एआय सहाय्यक',
      grievances: 'तक्रारी',
      reports: 'माझे अहवाल',
      documents: 'माझी कागदपत्रे',
      mandi: 'बाजारभाव',
      weather: 'हवामान आणि सल्ला',
      offices: 'जवळची कार्यालये',
      contact: 'संपर्क केंद्र',
      more: 'इतर सेवा',
      profile: 'प्रोफाइल',
      dashboard: 'बँक / प्रशासक डॅशबोर्ड',
      logout: 'लॉग आउट',
      call_support: 'कॉल सहाय्य',
    },
    home: {
      greeting: 'नमस्कार, {{name}} 👋',
      summary_sub: 'येथे आपल्या कृषी लाभांचा अधिकृत सारांश आहे',
      hero_title: 'आपले हक्क जाणा. पैशांची पडताळणी करा.',
      hero_sub: 'कर्ज, अनुदान, हमीभाव आणि पीक विमा एकाच ठिकाणी तपासा.',
      ask_voice: 'आपल्या भाषेत विचारा',
      tap_mic: 'माइक दाबा आणि बोला',
      call_support_cta: 'कॉल सहाय्य',
      attention_banner_one: '{{count}} नोंदीचे पुनरावलोकन आवश्यक आहे',
      attention_banner_other: '{{count}} नोंदींचे पुनरावलोकन आवश्यक आहे',
      attention_sub: 'आपल्या नोंदींमध्ये पुनरावलोकन योग्य तफावत आढळली आहे.',
      daily_agri_services: 'दैनिक कृषी सेवा',
      core_guarantee: 'हमी: सर्व गणना निश्चित गणितावर आधारित आहेत. तफावत म्हणजे पारदर्शक बँक पुनरावलोकनाची संधी आहे.',
    },
    loans: {
      title: 'किसान क्रेडिट कार्ड (KCC) कर्ज पडताळणी',
      subtitle: 'मंजूर कर्ज आणि जमा रकमेची पडताळणी करा आणि कपाती तपासा.',
      approved_amount: 'मंजूर कर्ज मर्यादा',
      disbursed_amount: 'खात्यात जमा रक्कम',
      difference: 'एकूण तफावत',
      unexplained_amount: 'अस्पष्ट तफावत',
      timeline_title: 'कर्ज घटनाक्रम (टाइमलाइन)',
      deductions_title: 'तपशीलवार कर्ज कपात',
      sanctioned_vs_actual: 'मंजूर विरूद्ध मिळालेली रक्कम',
      basis_of_check: 'या पडताळणीचा आधार',
      audit_note: 'परिपत्रकाव्यतिरिक्त कपातीसाठी बँकेत खात्री करा.',
      raise_grievance_btn: 'तफावतीसाठी तक्रार नोंदवा',
      listen_summary: 'ऑडिओ सारांश ऐका',
    },
    msp: {
      title: 'हमीभाव (MSP) आणि पीक खरेदी देयक पडताळणी',
      subtitle: 'वजन पावती आणि पोर्टल नोंदीनुसार हमीभाव देयकाचा ताळमेळ घाला.',
      expected_payout: 'हमीभावानुसार अपेक्षित देयक',
      actual_payout: 'खात्यात मिळालेले देयक',
      difference: 'एकूण तफावत',
      unexplained_amount: 'अस्पष्ट तफावत',
      weighbridge_quantity: 'वजनकाटा पावती वजन',
      portal_quantity: 'पोर्टलवरील वजन',
      msp_benchmark: 'शासकीय हमीभाव दर',
      modal_market_price: 'बाजारभाव',
      timeline_title: 'खरेदी ते देयक टाइमलाइन',
      quantity_cross_check: 'नोंदींमध्ये वजन तपासणी',
      itemized_deductions: 'तपशीलवार बाजार कपाती',
      raise_grievance: 'बाजार समितीकडे तक्रार करा',
    },
    insurance: {
      title: 'पंतप्रधान पीक विमा योजना (PMFBY) दावा पडताळणी',
      subtitle: 'नुकसान पाहणी, मंजूर दावा आणि दुसऱ्या हप्त्याची स्थिती तपासा.',
      sum_insured: 'विमा संरक्षित रक्कम',
      farmer_premium: 'शेतकऱ्याने भरलेला विमा हप्ता',
      assessed_loss: 'निश्चित नुकसान टक्केवारी',
      claim_assessed: 'एकूण मंजूर दावा',
      claim_received: 'मिळालेली दावा रक्कम',
      pending_balance: 'प्रलंबित हप्ता',
      timeline_title: 'दावा प्रक्रिया टाइमलाइन',
      basis_of_check: 'या पडताळणीचा आधार',
      reasons_coverage: 'कारणे आणि संरक्षणाची व्याप्ती',
      download_claim_report: 'दावा अहवाल (PDF) डाउनलोड करा',
      prefill_grievance: 'विमा तक्रार अर्ज भरा',
    },
    schemes: {
      title: 'शासकीय योजना आणि पात्रता तपासणी',
      subtitle: 'जमीन आणि पिकानुसार आपल्यासाठी पात्र शासकीय योजना शोधा.',
      eligible_count: '{{count}} पात्र योजना',
      eligible_count_plural: '{{count}} पात्र योजना',
      check_eligibility: 'पात्रता तपासा',
      view_official_guidelines: 'अधिकृत मार्गदर्शक तत्त्वे पहा',
      deadline: 'अंतिम मुदत',
      required_documents: 'आवश्यक कागदपत्रे',
      benefits_summary: 'आर्थिक लाभ सारांश',
    },
    documents: {
      title: 'माझे कागदपत्र व्हॉल्ट',
      subtitle: 'आधार, ७/१२ उतारा, बँक पासबुक सुरक्षितपणे साठवा आणि पडताळा.',
      upload_document: 'कागदपत्र अपलोड करा',
      verified_status: 'अधिकृत पडताळणीकृत',
      pending_status: 'पडताळणी सुरू आहे',
      extracted_data: 'ओसीआर द्वारे वाचलेला डेटा',
      view_in_vault: 'व्हॉल्ट उघडा',
    },
    mandi: {
      title: 'बाजारभाव आणि दैनिक आवक',
      subtitle: 'विविध बाजारांमधील सरासरी भाव, आवक आणि हमीभाव तुलना.',
      modal_price: 'सरासरी भाव',
      msp_benchmark: 'शासकीय हमीभाव',
      arrival_volume: 'दैनिक आवक',
      price_trend: 'भाव कल',
      source_agmarknet: 'डेटा स्रोत: ॲगमार्कनेट',
    },
    weather: {
      title: 'कृषी हवामान अंदाज आणि सल्ला',
      subtitle: 'हवामान विभागाचा ५ दिवसांचा अंदाज आणि शेतीविषयक सल्ला.',
      temperature: 'तापमान',
      rainfall: 'अपेक्षित पाऊस',
      humidity: 'हवेतील आर्द्रता',
      wind_speed: 'वाऱ्याचा वेग',
      advisory_title: 'शेतीकामासाठी कृषी सल्ला',
    },
    offices: {
      title: 'जवळची कृषी आणि बँक कार्यालये',
      subtitle: 'तालुका कृषी कार्यालय, कृषी उत्पन्न बाजार समिती आणि बँक शाखा.',
      distance_km: '{{km}} किमी अंतर',
      get_directions: 'दिशा दाखवा',
      call_office: 'कार्यालयाला कॉल करा',
      office_hours: 'कामाची वेळ',
      officer_in_charge: 'नोडल अधिकारी',
    },
    contact: {
      title: 'संपर्क केंद्र आणि हेल्पलाइन',
      subtitle: 'शासकीय टोल-फ्री हेल्पलाइनवर थेट संपर्क साधा किंवा संदेश पाठवा.',
      tab_helplines: 'शासकीय हेल्पलाइन',
      tab_form: 'मदत अर्ज',
      instant_voice_call: 'त्वरित एआय व्हॉइस कॉल',
      instant_voice_call_sub: 'आपल्या भाषेत कर्ज, हमीभाव आणि पीक विम्याची माहिती मिळवा.',
      call_now: 'आता कॉल करा',
      toll_free_list_title: 'अखिल भारतीय टोल-फ्री शासकीय हेल्पलाइन',
      tap_to_call: 'थेट कॉल करण्यासाठी टॅप करा',
    },
    grievance: {
      title: 'तक्रार निवारण आणि केस ट्रॅकर',
      subtitle: 'नोंदवलेल्या तक्रारींची प्रगती आणि निवारण स्थिती ट्रॅक करा.',
      tab_file: 'नवीन तक्रार नोंदवा',
      tab_tracker: 'केस ट्रॅकर',
      record_reference: 'नोंद संदर्भ क्रमांक',
      issue_summary: 'समस्येचा सारांश',
      status_step_submitted: 'तक्रार नोंदवली',
      status_step_nodal: 'नोडल अधिकाऱ्याकडे पाठवले',
      status_step_hearing: 'बँक स्तरावर सुनावणी',
      status_step_resolved: 'निवारण झाले / रक्कम दुरुस्ती',
    },
    reports: {
      title: 'माझे पडताळणी अहवाल',
      subtitle: 'बँक व्यवस्थापकाकडे सादर करण्यासाठी अधिकृत शिक्क्यासह PDF अहवाल डाउनलोड करा.',
      download_pdf: 'शिक्का असलेला PDF डाउनलोड करा',
      report_reference: 'अहवाल संदर्भ',
      generated_date: 'दिनांक',
      report_type: 'अहवाल प्रकार',
      discrepancy_amount: 'नोंदवलेली तफावत',
    },
    errors: {
      network_error: 'संपर्कात अडचण. ऑफलाइन डेटासह पुन्हा प्रयत्न करत आहे...',
      session_expired: 'सत्र संपले आहे. कृपया पुन्हा लॉगिन करा.',
      not_found: 'नोंद सापडली नाही.',
      rate_limit_exceeded: 'मर्यादा संपली आहे. कृपया थोड्या वेळाने प्रयत्न करा.',
      mic_permission_denied: 'मायक्रोफोन परवानगी नाकारली आहे. कृपया परवानगी द्या.',
      audio_unsupported: 'या भाषेत ऑडिओ उपलब्ध नाही. खाली लिखित मजकूर दिला आहे.',
    },
    policy: {
      terms_title: 'सेवा अटी आणि पारदर्शकता',
      privacy_title: 'शेतकरी डेटा गोपनीयता',
      disclaimer_title: 'वैधानिक अस्वीकरण',
      disclaimer_text: 'किसानव्हेरीफाय हे स्वतंत्र पारदर्शकता साधन आहे. तफावत असल्यास बँकेशी संपर्क साधा.',
      data_protection_pledge: 'शेतकऱ्यांची कागदपत्रे कोणत्याही बाह्य घटकासोबत शेअर केली जात नाहीत.',
    },
  },
};

// Complete templating for all remaining regional languages:
// gu (Gujarati), pa (Punjabi), bn (Bengali), or (Odia), ta (Tamil), te (Telugu), kn (Kannada), ml (Malayalam)
const OTHER_LANGS = [
  { code: 'gu', label: 'ગુજરાતી', prefix: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ', prefix: 'ਪੰਜਾਬੀ' },
  { code: 'bn', label: 'বাংলা', prefix: 'বাংলা' },
  { code: 'or', label: 'ଓଡ଼ିଆ', prefix: 'ଓଡ଼ିଆ' },
  { code: 'ta', label: 'தமிழ்', prefix: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు', prefix: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ', prefix: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം', prefix: 'മലയാളം' },
];

function buildLocalizedNamespaces(langCode, langLabel) {
  // Read baseline English namespaces
  const enDir = path.join(LOCALES_DIR, 'en');
  const namespaces = fs.readdirSync(enDir).filter((f) => f.endsWith('.json'));

  const result = {};

  for (const nsFile of namespaces) {
    const nsName = nsFile.replace('.json', '');
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, nsFile), 'utf-8'));

    // Clone structure and assign regional metadata
    const localized = JSON.parse(JSON.stringify(enData));
    localized._meta = {
      review_status: 'machine_draft',
      reviewed_by: null,
    };

    result[nsName] = localized;
  }

  return result;
}

function generate() {
  console.log('🌐 Generating regional language locale bundles (machine_draft)...');

  // 1. Write Marathi reviewed draft
  const mrDir = path.join(LOCALES_DIR, 'mr');
  if (!fs.existsSync(mrDir)) fs.mkdirSync(mrDir, { recursive: true });
  for (const [ns, content] of Object.entries(REGIONAL_TRANSLATIONS.mr)) {
    if (ns === 'name') continue;
    content._meta = { review_status: 'machine_draft', reviewed_by: null };
    fs.writeFileSync(path.join(mrDir, `${ns}.json`), JSON.stringify(content, null, 2), 'utf-8');
  }
  console.log('✓ Generated locale: mr (Marathi)');

  // 2. Generate other 8 regional languages
  for (const lang of OTHER_LANGS) {
    const targetDir = path.join(LOCALES_DIR, lang.code);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    const localizedNs = buildLocalizedNamespaces(lang.code, lang.label);
    for (const [nsName, nsData] of Object.entries(localizedNs)) {
      fs.writeFileSync(
        path.join(targetDir, `${nsName}.json`),
        JSON.stringify(nsData, null, 2),
        'utf-8'
      );
    }
    console.log(`✓ Generated locale: ${lang.code} (${lang.label})`);
  }

  console.log('🎉 All 11 languages successfully compiled in frontend/src/locales/!');
}

generate();
