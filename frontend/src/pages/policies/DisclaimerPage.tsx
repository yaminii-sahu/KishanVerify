import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Disclaimer"
      titleHi="अस्वीकरण"
      subtitleEn="Important notices regarding platform independence and informational scope."
      subtitleHi="मंच की स्वतंत्रता एवं सूचनात्मक दायरे से संबंधित महत्वपूर्ण सूचनाएं।"
    >
      <section className="space-y-3">
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed font-medium">
            {isHi
              ? 'किसानवेरीफाई एक स्वतंत्र प्रोटोटाइप है। यह भारत सरकार की आधिकारिक वेबसाइट नहीं है और किसी भी सरकारी विभाग या बैंक से संबद्ध नहीं है। योजना की जानकारी केवल मार्गदर्शन के लिए है; कृपया आवेदन करने से पूर्व आधिकारिक योजना पोर्टल पर सत्यापन करें।'
              : 'KisanVerify is an independent prototype. It is not an official Government of India website and is not affiliated with any government department, ministry, or commercial bank. Scheme information is provided strictly for guidance; users must verify terms on the official government scheme website before applying.'}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14]">
          {isHi ? '1. कोई विधिक दायित्व नहीं' : '1. No Legal Advice or Official Representation'}
        </h2>
        <p>
          {isHi
            ? 'इस मंच पर प्रस्तुत सभी गणनाएं, ऋण अंतर विश्लेषण, और एमएसपी भुगतान सत्यापन गणितीय मॉडलों और सार्वजनिक नियमों पर आधारित हैं। इन्हें किसी विधिक या वैधानिक प्रमाण पत्र के रूप में नहीं माना जा सकता।'
            : 'All verification algorithms, calculations, and discrepancy indicators are generated through public formula models. They do not constitute certified legal, financial, or tax advice. For formal statutory claims, contact your respective bank branch or the district agriculture officer.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14]">
          {isHi ? '2. बाहरी स्रोतों एवं डेमो डेटा की सीमाएं' : '2. External Data & Demo Fallbacks'}
        </h2>
        <p>
          {isHi
            ? 'मौसम पूर्वानुमान (Open-Meteo) और मंडी भाव (Agmarknet) तृतीय-पक्ष सार्वजनिक डेटासेट पर आधारित हैं। तकनीकी खराबी या नेटवर्क बाधा के समय सांकेतिक डेमो डेटा का उपयोग किया जाता है जिसे पृष्ठ पर स्पष्ट रूप से लेबल किया गया है।'
            : 'Mandi prices (Agmarknet) and weather advisories (Open-Meteo) rely on external feeds. In the event of network disruption, seeded fallback datasets are served and explicitly labeled with a "Demo data" disclaimer so farmers are never misled into accepting cached rates as live prices.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14]">
          {isHi ? '3. आधिकारिक सरकारी पोर्टलों का उपयोग' : '3. Use of Official Government Portals'}
        </h2>
        <p>
          {isHi
            ? 'जब भी किसान "Apply Now" या किसी योजना लिंक पर टैप करते हैं, वे किसानवेरीफाई को छोड़कर आधिकारिक सरकारी पोर्टल (.gov.in / .nic.in) पर जाते हैं। उन पोर्टलों की उपलब्धता और सामग्री के लिए संबंधित मंत्रालय उत्तरदायी है।'
            : 'External links displayed on scheme cards direct users to verified official government portals (such as pmkisan.gov.in, pmfby.gov.in, and enam.gov.in). KisanVerify does not control or assume responsibility for external government server uptime or third-party content.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default DisclaimerPage;
