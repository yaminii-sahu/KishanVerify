import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { siteConfig } from '../../config/siteConfig';
import { ShieldCheck, Target, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="About KisanVerify"
      titleHi="किसानवेरीफाई के बारे में"
      subtitleEn="Empowering Indian farmers through transparent, deterministic financial verification."
      subtitleHi="पारदर्शी एवं सटीक वित्तीय सत्यापन के माध्यम से भारतीय किसानों का सशक्तिकरण।"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1F2E14] flex items-center gap-2">
          <Target className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? 'हमारा मिशन' : 'Our Mission'}</span>
        </h2>
        <p>
          {isHi
            ? 'किसानवेरीफाई एक स्वतंत्र नागरिक तकनीकी पहल (Civic Tech Initiative) है जिसका उद्देश्य भारतीय किसानों को उनके कृषि ऋणों, एमएसपी बिक्री भुगतानों, फसल बीमा दावों और सरकारी सब्सिडी का पारदर्शी मिलान करने में सक्षम बनाना है।'
            : 'KisanVerify is an independent civic technology initiative designed to bridge the information and verification gap for Indian farmers. By providing deterministic mathematical verification across Kisan Credit Card (KCC) loans, Minimum Support Price (MSP) mandi procurement, and Pradhan Mantri Fasal Bima Yojana (PMFBY) insurance tranches, KisanVerify ensures that every eligible rupee is accounted for.'}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1F2E14] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? 'मुख्य विशेषताएं' : 'Core Capabilities'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 not-prose">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <h3 className="font-bold text-sm text-[#233316] mb-1">
              {isHi ? '1. नियम-आधारित ऋण सत्यापन' : '1. Deterministic Loan Audit'}
            </h3>
            <p className="text-xs text-stone-600">
              {isHi
                ? 'आरबीआई के 7% ब्याज दर और 3% त्वरित पुनर्भुगतान सब्सिडी (ISS) के नियमों के अनुसार सटीक ब्याज व कटौती की जांच।'
                : 'Automated cross-checking of interest rates, 3% Prompt Repayment Incentive (PRI), and subvention guidelines under RBI norms.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <h3 className="font-bold text-sm text-[#233316] mb-1">
              {isHi ? '2. पारदर्शी एमएसपी गणना' : '2. Transparent MSP Verification'}
            </h3>
            <p className="text-xs text-stone-600">
              {isHi
                ? 'आधिकारिक न्यूनतम समर्थन मूल्य (MSP) और नमी/तौल कटौतियों का बैंक जमा राशि के साथ सटीक मिलान।'
                : 'Comparing procurement weight, official Kharif/Rabi MSP benchmarks, and actual bank transfer deposits.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <h3 className="font-bold text-sm text-[#233316] mb-1">
              {isHi ? '3. निजी दस्तावेज़ वॉल्ट' : '3. Private Document Vault'}
            </h3>
            <p className="text-xs text-stone-600">
              {isHi
                ? 'आधार, खसरा, पासबुक और स्वीकृति पत्रों का सुरक्षित व निजी भंडारण, जो केवल किसान के पास रहता है।'
                : 'Encrypted, owner-isolated digital storage for land titles (Khasra/7-12), Aadhaar, bank passbooks, and policies.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <h3 className="font-bold text-sm text-[#233316] mb-1">
              {isHi ? '4. वास्तविक विस्तार सेवाएं' : '4. Real Agri Extension Access'}
            </h3>
            <p className="text-xs text-stone-600">
              {isHi
                ? 'दैनिक मंडी भाव, मौसम पूर्वानुमान व कृषि सलाह, निकटतम केवीके व लैब की दूरी, और आधिकारिक टोल-फ्री हेल्पलाइन।'
                : 'Live Agmarknet prices, Open-Meteo crop advisories, proximity-based KVK/APMC directory, and GoI toll-free helplines.'}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#1F2E14] flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? 'स्वतंत्रता एवं निष्पक्षता' : 'Independence & Integrity'}</span>
        </h2>
        <p>
          {isHi
            ? 'किसानवेरीफाई किसी भी बैंक या सरकारी विभाग के पक्ष में काम नहीं करता। हमारा लक्ष्य दोनों पक्षों के बीच पारदर्शी संवाद स्थापित करना है ताकि किसी भी अनजाने अंतर को सौहार्दपूर्ण ढंग से सुलझाया जा सके।'
            : 'KisanVerify does not take sides. A discrepancy flag on the platform is not an allegation of wrongdoing; it is an objective calculation intended to prompt friendly review and transparent verification between farmers and financial institutions.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default AboutPage;
