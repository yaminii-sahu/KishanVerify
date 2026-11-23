import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { Copyright, FileCheck, ShieldAlert } from 'lucide-react';
import { siteConfig } from '../../config/siteConfig';

export const CopyrightPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Copyright Policy"
      titleHi="कॉपीराइट नीति"
      subtitleEn="Intellectual property rights and permissible reproduction guidelines."
      subtitleHi="बौद्धिक संपदा अधिकार एवं सामग्री के उपयोग व पुनःप्रकाशन संबंधी दिशा-निर्देश।"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Copyright className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '1. सामग्री स्वामित्व' : '1. Ownership of Content'}</span>
        </h2>
        <p>
          {isHi
            ? `किसानवेरीफाई मंच पर प्रदर्शित सभी सॉफ्टवेयर कोड, इंटरफेस डिज़ाइन, चित्र और संकलित सामग्री का स्वामित्व किसानवेरीफाई टीम (टीम ${siteConfig.teamName}) के पास सुरक्षित है।`
            : `All source code, user interface designs, visual layouts, and explanatory graphics featured on KisanVerify are the intellectual property of the KisanVerify Development Team (Team ${siteConfig.teamName}) under civic hackathon copyright protection.`}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '2. पुनः उपयोग एवं शैक्षणिक अनुमति' : '2. Permissible Educational Reproduction'}</span>
        </h2>
        <p>
          {isHi
            ? 'इस मंच पर उपलब्ध सामग्री को किसानों के मार्गदर्शन, शोध या गैर-व्यावसायिक शिक्षा के उद्देश्य से निःशुल्क उद्धृत किया जा सकता है, बशर्ते स्रोत के रूप में किसानवेरीफाई का स्पष्ट उल्लेख किया जाए।'
            : 'The informational frameworks and calculation explanations may be reproduced free of charge in any format or media for personal, educational, research, or non-commercial civic advocacy purposes, subject to the condition that KisanVerify is properly cited as the source.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '3. सरकारी प्रतीक एवं चिह्नों पर प्रतिबंध' : '3. Prohibition on Official Emblems'}</span>
        </h2>
        <p className="text-xs text-stone-600">
          {isHi
            ? 'किसानवेरीफाई किसी भी राज्य प्रतीक (अशोक स्तंभ), राष्ट्रीय चिह्न या सरकारी मुहर का उपयोग नहीं करता है और न ही किसी को ऐसा करने की अनुमति देता है।'
            : 'KisanVerify does not utilize or claim ownership over any official State Emblem of India or Government logos. The State Emblem of India (Prohibition of Improper Use) Act, 2005 strictly governs national symbols.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default CopyrightPage;
