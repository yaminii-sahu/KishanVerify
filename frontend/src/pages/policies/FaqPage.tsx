import React, { useState } from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    qEn: 'What is KisanVerify and how does it work?',
    qHi: 'किसानवेरीफाई क्या है और यह कैसे काम करता है?',
    aEn: 'KisanVerify is an independent financial transparency platform for farmers. It compares approved loan sanction terms, government MSP procurement rates, and crop insurance rules against actual bank account credits using deterministic formulas to flag any uncredited subsidies or excess deductions.',
    aHi: 'किसानवेरीफाई किसानों के लिए एक स्वतंत्र वित्तीय पारदर्शिता मंच है। यह स्वीकृत ऋण शर्तों, सरकारी एमएसपी दरों और फसल बीमा नियमों की तुलना सीधे बैंक खाते में जमा राशि से करता है ताकि किसी भी रोकी गई सब्सिडी या अतिरिक्त कटौती का पता लगाया जा सके।',
  },
  {
    qEn: 'Does a discrepancy flag mean the bank has done fraud?',
    qHi: 'क्या विसंगति (Discrepancy) का मतलब है कि बैंक ने धोखाधड़ी की है?',
    aEn: 'No. A discrepancy flag is an invitation for transparent review, not an allegation of wrongdoing. Differences often arise from staggered installment tranches, moisture discounts recorded on mandi J-Forms, or processing delays. KisanVerify gives you the exact math to ask your branch manager politely.',
    aHi: 'नहीं। विसंगति का झंडा केवल समीक्षा का निमंत्रण है, धोखाधड़ी का आरोप नहीं। अक्सर किश्तों में देरी, मंडी में नमी कटौती या लंबित कागजी कार्रवाई के कारण अंतर आता है। किसानवेरीफाई आपको सटीक हिसाब देता है ताकि आप बैंक में जाकर स्पष्ट बात कर सकें।',
  },
  {
    qEn: 'Are the documents in my vault visible to anyone else?',
    qHi: 'क्या मेरे वॉल्ट के दस्तावेज़ किसी और को दिखाई देते हैं?',
    aEn: 'Absolutely not. The My Documents vault enforces strict user-level ownership isolation. Documents are stored with random UUIDs outside the web root and can only be accessed by you with your authenticated session.',
    aHi: 'बिल्कुल नहीं। माई डॉक्यूमेंट्स वॉल्ट में आपके दस्तावेज़ पूरी तरह सुरक्षित और निजी हैं। कोई अन्य उपयोगकर्ता या बाहरी व्यक्ति आपकी फ़ाइलें नहीं देख सकता।',
  },
  {
    qEn: 'How do I apply for government schemes shown on KisanVerify?',
    qHi: 'किसानवेरीफाई पर दिखने वाली योजनाओं के लिए आवेदन कैसे करें?',
    aEn: 'Every scheme card has an official "Apply Now" button that opens the verified official government portal (e.g. pmkisan.gov.in, pmfby.gov.in) in a new tab. KisanVerify does not take money or process applications directly; you apply on the official government site.',
    aHi: 'प्रत्येक योजना कार्ड पर एक आधिकारिक "Apply Now" बटन है जो सीधे सत्यापित सरकारी पोर्टल (जैसे pmkisan.gov.in, pmfby.gov.in) को खोलता है। किसानवेरीफाई सीधे आवेदन शुल्क नहीं लेता; आप सीधे सरकारी पोर्टल पर आवेदन करते हैं।',
  },
  {
    qEn: 'What should I do if I find a difference in my MSP payment?',
    qHi: 'यदि मेरे एमएसपी भुगतान में अंतर मिले तो मुझे क्या करना चाहिए?',
    aEn: 'First, check your Mandi J-Form or procurement receipt for any moisture percentage discounts. If your delivered Grade-A paddy was discounted without justification, visit your local APMC Mandi Samiti or call the Kisan Call Centre at 1800-180-1551.',
    aHi: 'सबसे पहले अपनी मंडी जे-फॉर्म या तौल पर्ची की जांच करें कि क्या कोई नमी कटौती दर्ज है। यदि सही धान पर बिना कारण कटौती हुई है, तो स्थानीय कृषि उपज मंडी समिति से संपर्क करें या किसान कॉल सेंटर 1800-180-1551 पर कॉल करें।',
  },
];

export const FaqPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <PolicyLayout
      titleEn="Help & Frequently Asked Questions"
      titleHi="सहायता एवं अक्सर पूछे जाने वाले प्रश्न"
      subtitleEn="Find quick answers to common questions about verification, calculations, and privacy."
      subtitleHi="सत्यापन, हिसाब-किताब और डेटा सुरक्षा से जुड़े सामान्य प्रश्नों के त्वरित उत्तर।"
    >
      <div className="space-y-3 not-prose">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-[#E6E0D4] rounded-2xl overflow-hidden bg-white shadow-xs"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-[#1F2E14] hover:bg-[#FAF7F2] transition-colors gap-3"
                aria-expanded={isOpen}
              >
                <span className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-[#8B9A6E] shrink-0 mt-0.5" />
                  <span>{isHi ? faq.qHi : faq.qEn}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#8B9A6E] shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-[#3D550C]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs text-stone-600 leading-relaxed border-t border-[#F2EDE2] bg-[#FAF7F2]/50">
                  <p>{isHi ? faq.aHi : faq.aEn}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PolicyLayout>
  );
};

export default FaqPage;
