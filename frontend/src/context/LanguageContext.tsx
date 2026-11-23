import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Brand & Tagline
  'app.name': { en: 'KisanVerify', hi: 'किसानवेरीफाई' },
  'app.tagline': { en: 'Every rupee. Every benefit. Verified.', hi: 'हर रुपया। हर लाभ। सत्यापित।' },
  'app.demo_badge': { en: 'Demo Data', hi: 'डेमो डेटा' },

  // Navigation
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.schemes': { en: 'My Schemes', hi: 'मेरी योजनाएं' },
  'nav.loan': { en: 'My Loan', hi: 'मेरा ऋण' },
  'nav.msp': { en: 'MSP Payments', hi: 'एमएसपी भुगतान' },
  'nav.insurance': { en: 'Crop Insurance', hi: 'फसल बीमा' },
  'nav.assistant': { en: 'AI Assistant', hi: 'एआई सहायक' },
  'nav.grievances': { en: 'Grievances', hi: 'शिकायतें' },
  'nav.reports': { en: 'My Reports', hi: 'रिपोर्ट्स' },
  'nav.documents': { en: 'My Documents', hi: 'मेरे दस्तावेज़' },
  'nav.mandi': { en: 'Mandi Prices', hi: 'मंडी भाव' },
  'nav.weather': { en: 'Weather Alerts', hi: 'मौसम और सलाह' },
  'nav.offices': { en: 'Nearby Offices', hi: 'निकटतम कार्यालय' },
  'nav.contact': { en: 'Contact Us', hi: 'संपर्क करें' },
  'nav.more': { en: 'More Services', hi: 'अन्य सेवाएं' },
  'nav.profile': { en: 'Profile', hi: 'प्रोफ़ाइल' },
  'nav.dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav.logout': { en: 'Logout', hi: 'लॉग आउट' },

  // Home Screen
  'home.greeting': { en: 'Namaste, Ramesh Kumar 👋', hi: 'नमस्ते, रमेश कुमार 👋' },
  'home.summary_sub': { en: "Here's your agricultural benefit summary", hi: 'यहाँ आपके कृषि लाभों का सारांश है' },
  'home.hero_title': { en: 'Know your benefits. Verify your money.', hi: 'अपने लाभ जानें। अपने पैसे की पुष्टि करें।' },
  'home.hero_sub': { en: 'Check your loans, subsidies, MSP and insurance in one place.', hi: 'अपने ऋण, सब्सिडी, एमएसपी और फसल बीमा एक ही स्थान पर जांचें।' },
  'home.ask_voice': { en: 'Ask in your language', hi: 'अपनी भाषा में पूछें' },
  'home.tap_mic': { en: 'Tap the mic and speak', hi: 'माइक दबाएं और बोलें' },
  'home.attention_banner': { en: '2 Records Need Attention', hi: '2 रिकॉर्ड की समीक्षा आवश्यक है' },
  'home.attention_sub': { en: 'There are differences in your loan and MSP payment records.', hi: 'आपके ऋण और एमएसपी भुगतान रिकॉर्ड में अंतर पाया गया है।' },
  'home.view_details': { en: 'View Details', hi: 'विवरण देखें' },

  // Cards
  'tile.schemes_desc': { en: 'Check your eligible government schemes', hi: 'अपनी पात्र सरकारी योजनाएं देखें' },
  'tile.loan_desc': { en: 'Verify your loan details and deductions', hi: 'अपने ऋण विवरण और कटौतियों की जांच करें' },
  'tile.msp_desc': { en: 'Track your crop payments and MSP rates', hi: 'फसल भुगतान और एमएसपी दरें ट्रैक करें' },
  'tile.insurance_desc': { en: 'Check your claim status and payout', hi: 'अपने बीमा दावे की स्थिति जांचें' },

  // Statuses
  'status.verified': { en: 'Verified', hi: 'सत्यापित' },
  'status.needs_review': { en: 'Needs Review', hi: 'समीक्षा आवश्यक' },
  'status.discrepancy': { en: 'Possible Discrepancy', hi: 'संभावित विसंगति' },
  'status.under_review': { en: 'Under Review', hi: 'प्रक्रियाधीन' },
  'status.eligible': { en: 'Eligible', hi: 'पात्र' },
  'status.possibly_eligible': { en: 'Possibly Eligible', hi: 'संभावित पात्र' },

  // Verification Results
  'result.discrepancy_title': { en: 'Discrepancy Detected', hi: 'अंतर पाया गया' },
  'result.discrepancy_desc': { en: 'The disbursed amount is less than the approved amount.', hi: 'वितरित राशि स्वीकृत राशि से कम दर्ज है।' },
  'result.verified_title': { en: 'Your details look good!', hi: 'आपका विवरण सही है!' },
  'result.verified_desc': { en: 'All numbers match the expected records.', hi: 'सभी आंकड़े अपेक्षित रिकॉर्ड से मेल खाते हैं।' },
  'result.approved': { en: 'Approved Amount', hi: 'स्वीकृत राशि' },
  'result.disbursed': { en: 'Disbursed Amount', hi: 'वितरित राशि' },
  'result.difference': { en: 'Difference', hi: 'अंतर' },
  'result.expected': { en: 'Expected Payment', hi: 'अपेक्षित भुगतान' },
  'result.actual': { en: 'Actual Payment', hi: 'प्राप्त भुगतान' },
  'result.possible_reasons': { en: 'Possible Reasons (Informational)', hi: 'संभावित कारण (सूचनात्मक)' },
  'result.view_report': { en: 'View Detailed Report', hi: 'विस्तृत रिपोर्ट देखें' },
  'result.raise_grievance': { en: 'Raise a Grievance', hi: 'शिकायत दर्ज करें' },
  'result.download_report': { en: 'Download Report (PDF)', hi: 'रिपोर्ट डाउनलोड करें (PDF)' },

  // AI Assistant
  'ai.title': { en: 'AI Assistant', hi: 'एआई सहायक' },
  'ai.subtitle': { en: 'Ask anything about schemes, loans, MSP or crop insurance.', hi: 'योजनाओं, ऋण, एमएसपी या फसल बीमा के बारे में कुछ भी पूछें।' },
  'ai.chip.claim_status': { en: 'Claim status', hi: 'दावा स्थिति' },
  'ai.chip.required_docs': { en: 'Required documents', hi: 'ज़रूरी दस्तावेज़' },
  'ai.chip.contact_details': { en: 'Contact details', hi: 'संपर्क विवरण' },
  'ai.chip.explain_hindi': { en: 'Explain difference in Hindi', hi: 'अंतर हिंदी में समझाएं' },
  'ai.input_placeholder': { en: 'Type or speak a question...', hi: 'अपना सवाल लिखें या बोलें...' },
  'ai.speak': { en: 'Listen', hi: 'सुनें' },

  // Reports
  'reports.title': { en: 'My Reports', hi: 'मेरी रिपोर्ट्स' },
  'reports.subtitle': { en: 'View and download your financial and verification reports.', hi: 'अपनी वित्तीय और सत्यापन रिपोर्ट्स देखें और डाउनलोड करें।' },
  'reports.last_6_months': { en: 'Last 6 Months', hi: 'पिछले 6 महीने' },
  'reports.download_all': { en: 'Download All', hi: 'सभी डाउनलोड करें' },

  // Grievance
  'grievance.title': { en: 'Raise a Grievance', hi: 'शिकायत दर्ज करें' },
  'grievance.subtitle': { en: 'Report any issue related to loan, MSP, insurance or scheme.', hi: 'ऋण, एमएसपी, बीमा या योजना से जुड़ी समस्या बताएं।' },
  'grievance.issue_type': { en: 'Issue Type', hi: 'समस्या का प्रकार' },
  'grievance.description': { en: 'Describe Your Issue', hi: 'अपनी समस्या का विवरण लिखें' },
  'grievance.upload_doc': { en: 'Upload Document (Optional)', hi: 'दस्तावेज़ अपलोड करें (वैकल्पिक)' },
  'grievance.submit': { en: 'Submit Grievance', hi: 'शिकायत सबमिट करें' },

  // Admin
  'admin.title': { en: 'Bank / Admin Dashboard', hi: 'बैंक / एडमिन डैशबोर्ड' },
  'admin.subtitle': { en: 'Monitor records, verify discrepancies and resolve cases.', hi: 'रिकॉर्ड की निगरानी करें और शिकायतों का समाधान करें।' },
  'admin.total_records': { en: 'Total Records', hi: 'कुल रिकॉर्ड्स' },
  'admin.verified_count': { en: 'Verified', hi: 'सत्यापित' },
  'admin.discrepancies': { en: 'Discrepancies', hi: 'विसंगतियाँ' },
  'admin.pending_complaints': { en: 'Pending Complaints', hi: 'लंबित शिकायतें' },
  'admin.recent_cases': { en: 'Recent Cases', hi: 'हाल के मामले' },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kv_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kv_lang', lang);
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
