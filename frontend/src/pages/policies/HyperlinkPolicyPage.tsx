import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { ExternalLink, Link2, ShieldCheck } from 'lucide-react';

export const HyperlinkPolicyPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Hyperlinking Policy"
      titleHi="हाइपरलिंकिंग नीति"
      subtitleEn="Guidelines on inbound links to KisanVerify and outbound links to official portals."
      subtitleHi="किसानवेरीफाई से बाहरी पोर्टलों और अन्य वेबसाइटों से हमारे लिंक के नियम।"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <ExternalLink className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '1. बाहरी वेबसाइटों के लिए लिंक (आउटबाउंड लिंक)' : '1. Links to External Websites (Outbound Links)'}</span>
        </h2>
        <p>
          {isHi
            ? 'किसानवेरीफाई पर दिए गए सभी महत्वपूर्ण बाहरी लिंक विशेष रूप से आधिकारिक सरकारी डोमेन (.gov.in अथवा .nic.in) से जुड़े हैं। ये लिंक उपयोगकर्ताओं की सुविधा के लिए दिए गए हैं ताकि वे योजनाओं के लिए सीधे आधिकारिक स्रोतों से आवेदन या पुष्टि कर सकें।'
            : 'At multiple places across KisanVerify, you may find outbound links to other government portals (e.g. pmkisan.gov.in, pmfby.gov.in, enam.gov.in, agricoop.gov.in). These links are placed solely for farmer convenience to facilitate direct statutory applications on official portals.'}
        </p>
        <p className="text-xs text-stone-600">
          {isHi
            ? 'हम बाहरी वेबसाइटों की सामग्री, उपलब्धता या गोपनीयता नीतियों के लिए उत्तरदायी नहीं हैं। किसी भी बाहरी लिंक पर जाने से पूर्व कृपया उस पोर्टल की अपनी नीतियों की समीक्षा करें।'
            : 'KisanVerify cannot guarantee that these external links will work continuously and has no control over the availability or content of the linked pages. We are not responsible for the privacy practices or operational security of external government websites.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Link2 className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '2. किसानवेरीफाई के लिए लिंक (इनबाउंड लिंक)' : '2. Links to KisanVerify by Other Websites (Inbound Links)'}</span>
        </h2>
        <p>
          {isHi
            ? 'गैर-व्यावसायिक, शैक्षिक या किसान-कल्याणकारी वेबसाइटें बिना किसी पूर्व अनुमति के किसानवेरीफाई के मुखपृष्ठ से सीधे लिंक जोड़ सकती हैं। हालांकि, हमारे किसी भी पृष्ठ को अपनी साइट के फ्रेम या भ्रामक संदर्भ में प्रदर्शित करने की अनुमति नहीं है।'
            : 'We welcome educational, non-profit, and civic technology websites to link directly to information hosted on KisanVerify. Prior permission is not required for standard hyperlinks to our home or verification pages.'}
        </p>
        <p className="text-xs text-stone-600">
          {isHi
            ? 'किसी भी वेबसाइट को यह दावा करने की अनुमति नहीं है कि किसानवेरीफाई उनके उत्पाद, सेवा या संगठन का समर्थन करता है।'
            : 'However, linking websites must not load KisanVerify pages into frames on their site or imply any official endorsement, certification, or sponsorship by the KisanVerify team.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default HyperlinkPolicyPage;
