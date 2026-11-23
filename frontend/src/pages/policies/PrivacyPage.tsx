import React from 'react';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, FileText, Database, ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Privacy Policy"
      titleHi="गोपनीयता नीति"
      subtitleEn="How your agricultural data and private vault files are stored and protected."
      subtitleHi="आपके कृषि डेटा और निजी वॉल्ट फ़ाइलों का भंडारण और सुरक्षा कैसे की जाती है।"
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Database className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '1. हम कौन सा डेटा संग्रहीत करते हैं?' : '1. What Data We Collect & Store'}</span>
        </h2>
        <p>
          {isHi
            ? 'किसानवेरीफाई केवल वही डेटा एकत्र करता है जो वित्तीय सत्यापन के लिए आवश्यक है:'
            : 'KisanVerify collects and processes only the minimal information necessary for mathematical benefit verification:'}
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>
            <strong>{isHi ? 'किसान प्रोफ़ाइल:' : 'Farmer Profile:'}</strong>{' '}
            {isHi ? 'नाम, किसान आईडी, राज्य, जिला, गाँव, भूमि रकबा (एकड़), प्रमुख फसल, बैंक का नाम एवं खाता संख्या (मास्क की हुई)।' : 'Farmer name, ID, village, district, state, land area (acres), crop type, and masked account number.'}
          </li>
          <li>
            <strong>{isHi ? 'सत्यापन रिकॉर्ड:' : 'Verification Records:'}</strong>{' '}
            {isHi ? 'स्वीकृत बनाम संवितरित ऋण राशि, फसल बीमा प्रीमियम व क्लेम, और मंडी तौल पर्ची व एमएसपी दरें।' : 'Approved vs disbursed loan amounts, insurance policy tranches, and mandi procurement weights.'}
          </li>
          <li>
            <strong>{isHi ? 'समर्थन पूछताछ:' : 'Inquiry Tickets:'}</strong>{' '}
            {isHi ? 'संपर्क फ़ॉर्म में दर्ज नाम, फ़ोन नंबर, श्रेणी और संदेश विवरण।' : 'Name, mobile number, inquiry category, and message text submitted via the contact desk.'}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '2. माई डॉक्यूमेंट्स वॉल्ट की पूर्ण गोपनीयता' : '2. Strict Document Vault Privacy & Ownership Isolation'}</span>
        </h2>
        <p>
          {isHi
            ? 'माई डॉक्यूमेंट्स (My Documents) वॉल्ट में अपलोड की गई सभी फ़ाइलें पूरी तरह से आपकी निजी संपत्ति हैं:'
            : 'All documents uploaded to the My Documents vault remain strictly confidential and isolated to the authenticated owner:'}
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>
            <strong>{isHi ? 'स्वामित्व अलगाव (Ownership Isolation):' : 'Ownership Isolation:'}</strong>{' '}
            {isHi ? 'प्रत्येक फ़ाइल सर्वर-स्तरीय सत्यापन द्वारा सुरक्षित है। कोई अन्य उपयोगकर्ता किसी दूसरे किसान की फ़ाइल नहीं देख या डाउनलोड नहीं कर सकता।' : 'Enforced at the database and filesystem level. User B cannot access, read, or download files belonging to User A.'}
          </li>
          <li>
            <strong>{isHi ? 'वेब रूट के बाहर सुरक्षित भंडारण:' : 'Storage Outside Web Root:'}</strong>{' '}
            {isHi ? 'फ़ाइलें यादृच्छिक UUID नामों से वेब डायरेक्टरी के बाहर रखी जाती हैं, जिससे अनधिकृत प्रत्यक्ष यूआरएल से पहुंच संभव नहीं है।' : 'Files are saved using cryptographically random UUIDs outside the web root, accessible solely via authenticated token endpoints.'}
          </li>
          <li>
            <strong>{isHi ? 'डेटा हटाने का अधिकार:' : 'Right to Delete All Data:'}</strong>{' '}
            {isHi ? 'किसान किसी भी समय अपने व्यक्तिगत दस्तावेज़ों को स्थायी रूप से हटा सकते हैं।' : 'Farmers retain the unilateral right to delete individual documents or purge their entire vault at any time.'}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[#1F2E14] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#3D550C]" />
          <span>{isHi ? '3. डेमो डेटा की सांकेतिक प्रकृति' : '3. Synthetic Demo Records Notice'}</span>
        </h2>
        <p>
          {isHi
            ? 'वर्तमान डेमो वातावरण में प्रदर्शित किसान रिकॉर्ड (उदा. रमेश कुमार, FV12345) पूरी तरह से सांकेतिक (सिंथेटिक) और काल्पनिक हैं। किसी भी वास्तविक व्यक्ति की वास्तविक वित्तीय जानकारी का उपयोग या प्रदर्शन नहीं किया गया है।'
            : 'In this demonstration environment, default farmer profiles (such as Ramesh Kumar, FV12345) are entirely synthetic benchmark records designed for feature demonstration. No real individual financial records are exposed or stored without explicit user upload.'}
        </p>
      </section>
    </PolicyLayout>
  );
};

export default PrivacyPage;
