import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { Eye, Keyboard, Contrast, Smartphone, CheckCircle2 } from 'lucide-react';

export const AccessibilityPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Accessibility Statement"
      titleHi="सुगमता विवरण"
      subtitleEn="Our commitment to accessible digital design for farmers across all devices and abilities."
      subtitleHi="सभी किसानों के लिए सुगम एवं सरल डिजिटल डिज़ाइन के प्रति हमारी प्रतिबद्धता।"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '1. सुगमता के प्रति हमारी प्रतिबद्धता' : '1. Commitment to Accessible Design'}</span>
        </h2>
        <p>
          {isHi
            ? 'किसानवेरीफाई को भारत के ग्रामीण परिवेश, विविध साक्षरता स्तरों और विभिन्न क्षमताओं वाले किसानों को ध्यान में रखकर तैयार किया गया है। हम WCAG 2.1 (Web Content Accessibility Guidelines) स्तर AA के मानकों का पालन करने के लिए प्रयासरत हैं।'
            : 'KisanVerify is committed to ensuring that its digital services are accessible to all users regardless of ability, age, device type, or literacy level. The platform strives to conform with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Contrast className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '2. लागू की गई प्रमुख सुगमता सुविधाएं' : '2. Key Accessibility Features Implemented'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 not-prose">
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <div className="font-bold text-xs text-[#233316] mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'उच्च कंट्रास्ट अनुपात (> 4.5:1)' : 'High Contrast Ratio (> 4.5:1)'}</span>
            </div>
            <p className="text-[11px] text-stone-600">
              {isHi
                ? 'गहरे हरे पृष्ठभूमि पर क्रीम और सफेद पाठ (5.4:1 से अधिक कंट्रास्ट) तेज धूप में भी पढ़ने योग्य है।'
                : 'Text elements meet or exceed WCAG AA minimum contrast requirements for outdoor sunlight visibility.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <div className="font-bold text-xs text-[#233316] mb-1 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'कीबोर्ड नेविगेशन एवं फोकस रिंग' : 'Full Keyboard Navigation & Focus'}</span>
            </div>
            <p className="text-[11px] text-stone-600">
              {isHi
                ? 'सभी लिंक, बटन और इनपुट टैब की द्वारा सुलभ हैं और दृश्यमान फोकस रिंग प्रदर्शित करते हैं।'
                : 'All interactive elements, forms, and accordions are operable via keyboard with prominent focus indicators.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <div className="font-bold text-xs text-[#233316] mb-1 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'न्यूनतम 44px टच लक्ष्य' : '44px Minimum Touch Targets'}</span>
            </div>
            <p className="text-[11px] text-stone-600">
              {isHi
                ? 'मोबाइल फोन पर उपयोग में आसानी के लिए सभी मुख्य बटन 44px या उससे बड़े आकार के बनाए गए हैं।'
                : 'Touch targets on mobile devices comply with the 44x44px minimum sizing for comfortable one-handed use.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E6E0D4]">
            <div className="font-bold text-xs text-[#233316] mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isHi ? 'द्विभाषी स्क्रीन रीडर समर्थन' : 'Bilingual Screen Reader Support'}</span>
            </div>
            <p className="text-[11px] text-stone-600">
              {isHi
                ? 'सेमेंटिक HTML5 टैग्स (footer, main, nav, aria-label) स्क्रीन रीडर्स के लिए उपयुक्त हैं।'
                : 'Standard HTML5 landmarks and descriptive ARIA labels facilitate assistive technology compatibility in Hindi and English.'}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14]">
          {isHi ? '3. सुगमता संबंधी फीडबैक' : '3. Feedback & Accessibility Contact'}
        </h2>
        <p className="text-xs text-stone-600">
          {isHi
            ? 'यदि आपको किसानवेरीफाई के किसी भी पृष्ठ या सुविधा का उपयोग करने में कोई कठिनाई आती है, तो कृपया हमारे संपर्क फ़ॉर्म के माध्यम से हमें सूचित करें ताकि हम तुरंत सुधार कर सकें।'
            : 'If you encounter any accessibility barriers while using KisanVerify, please report them to our development team via the Contact Us form. We actively welcome suggestions to enhance inclusivity.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default AccessibilityPage;
