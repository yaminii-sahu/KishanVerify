import React from 'react';
import { Link } from 'react-router-dom';
import { PolicyLayout } from '../../components/PolicyLayout';
import { useLanguage } from '../../context/LanguageContext';
import { Map, ChevronRight, ExternalLink } from 'lucide-react';

interface RouteGroup {
  groupEn: string;
  groupHi: string;
  links: Array<{ path: string; labelEn: string; labelHi: string; descEn: string; descHi: string }>;
}

const SITEMAP_DATA: RouteGroup[] = [
  {
    groupEn: 'Farmer Verification Portal',
    groupHi: 'किसान सत्यापन पोर्टल',
    links: [
      { path: '/farmer', labelEn: 'Home Dashboard', labelHi: 'मुख्य डैशबोर्ड', descEn: 'Overview of verified benefits, flagged items, and quick tiles.', descHi: 'सत्यापित लाभों और ध्यानाकर्षण रिकॉर्ड का अवलोकन।' },
      { path: '/farmer/schemes', labelEn: 'My Schemes & Apply Now', labelHi: 'सरकारी योजनाएं एवं आवेदन', descEn: 'Browse Central and State schemes with verified official application links.', descHi: 'केंद्र व राज्य योजनाओं की पात्रता एवं आधिकारिक आवेदन लिंक।' },
      { path: '/farmer/loan-verify', labelEn: 'Loan Verification', labelHi: 'ऋण सत्यापन', descEn: 'Cross-verify approved vs disbursed KCC loan amounts and 3% interest subsidy.', descHi: 'केसीसी ऋण, ब्याज दर एवं त्वरित पुनर्भुगतान छूट की जांच।' },
      { path: '/farmer/msp-verify', labelEn: 'MSP Mandi Verification', labelHi: 'एमएसपी मंडी सत्यापन', descEn: 'Verify procurement receipts, crop weights, and bank credit formula.', descHi: 'मंडी तौल पर्ची एवं बैंक खाते में जमा अंतर राशि का मिलान।' },
      { path: '/farmer/insurance-verify', labelEn: 'Crop Insurance (PMFBY)', labelHi: 'फसल बीमा (पीएमएफबीवाई)', descEn: 'Audit policy certificate, sum insured, premium subsidy, and claim settlement.', descHi: 'बीमा राशि, किसान प्रीमियम अंश एवं क्लेम निपटान स्थिति।' },
      { path: '/farmer/mandi', labelEn: 'Mandi Prices & Trends', labelHi: 'मंडी भाव एवं मूल्य रुझान', descEn: 'Daily commodity prices, modal rates, and official MSP comparison chart.', descHi: 'दैनिक मंडी दरें, न्यूनतम/अधिकतम भाव व एमएसपी तुलना।' },
      { path: '/farmer/weather', labelEn: 'Weather Alerts & Advisories', labelHi: 'मौसम पूर्वानुमान व कृषि सलाह', descEn: '7-day local forecast and deterministic farming action advisories.', descHi: '7-दिवसीय मौसम पूर्वानुमान एवं कृषि कार्य परामर्श।' },
      { path: '/farmer/documents', labelEn: 'My Documents Vault', labelHi: 'माई डॉक्यूमेंट्स वॉल्ट', descEn: 'Secure private vault for land records, Aadhaar, and passbooks.', descHi: 'खसरा, आधार और बैंक पासबुक का सुरक्षित निजी डिजिटल भंडारण।' },
      { path: '/farmer/offices', labelEn: 'Nearby Agriculture Offices', labelHi: 'निकटतम कृषि केंद्र एवं कार्यालय', descEn: 'Map and directory of KVKs, APMC mandis, testing labs, and CSC centres.', descHi: 'केवीके, मंडी समिति, मृदा परीक्षण लैब व सीएससी की दूरी व नक्शा।' },
      { path: '/farmer/contact', labelEn: 'Contact Us & Official Helplines', labelHi: 'संपर्क केंद्र एवं आधिकारिक हेल्पलाइन', descEn: 'Directory of GoI toll-free helplines and KisanVerify support ticket desk.', descHi: 'सरकारी टोल-फ्री हेल्पलाइन एवं किसानवेरीफाई सहायता डेस्क।' },
      { path: '/farmer/grievance', labelEn: 'Raise a Grievance', labelHi: 'शिकायत दर्ज करें', descEn: 'Formal grievance filing workflow with document attachments.', descHi: 'ऋण, एमएसपी या बीमा विसंगति हेतु औपचारिक शिकायत।' },
      { path: '/farmer/reports', labelEn: 'My Verification Reports', labelHi: 'सत्यापन रिपोर्ट्स', descEn: 'View, filter, and download verified financial audit certificates.', descHi: 'सत्यापित वित्तीय रिपोर्ट देखें और डाउनलोड करें।' },
      { path: '/farmer/profile', labelEn: 'Farmer Profile & Avatar', labelHi: 'किसान प्रोफ़ाइल', descEn: 'Farmer personal details, bank linkage, and camera photo capture.', descHi: 'व्यक्तिगत जानकारी, बैंक विवरण एवं फोटो अपलोड।' },
    ],
  },
  {
    groupEn: 'Bank Officer & Admin Console',
    groupHi: 'बैंक अधिकारी एवं एडमिन कंसोल',
    links: [
      { path: '/admin', labelEn: 'Bank Dashboard', labelHi: 'बैंक डैशबोर्ड', descEn: 'District-level discrepancy monitoring and resolution progress.', descHi: 'जिला-स्तरीय विसंगतियों की निगरानी और समाधान प्रगति।' },
      { path: '/admin/reports', labelEn: 'Audit Reports', labelHi: 'ऑडिट रिपोर्ट्स', descEn: 'Batch audit logs and institutional review documentation.', descHi: 'सामूहिक ऑडिट रिपोर्ट एवं बैंक समीक्षा प्रलेखन।' },
      { path: '/admin/complaints', labelEn: 'Complaints Management', labelHi: 'शिकायत प्रबंधन', descEn: 'Resolve farmer grievances and record settlement notes.', descHi: 'किसानों की शिकायतों का समाधान और निस्तारण टिप्पणी।' },
      { path: '/admin/analytics', labelEn: 'Discrepancy Analytics', labelHi: 'विसंगति विश्लेषण', descEn: 'Trends in subsidy delays, moisture deductions, and interest claims.', descHi: 'सब्सिडी विलंब, नमी कटौती और ब्याज दावों के आंकड़े।' },
      { path: '/admin/settings', labelEn: 'System Settings', labelHi: 'प्रणाली सेटिंग्स', descEn: 'Thresholds, rule configurations, and export parameters.', descHi: 'नियम सीमाएं, ऑडिट पैरामीटर और डेटा एक्सपोर्ट।' },
    ],
  },
  {
    groupEn: 'Policies & Legal Information',
    groupHi: 'नीतियां एवं कानूनी सूचनाएं',
    links: [
      { path: '/about', labelEn: 'About KisanVerify', labelHi: 'किसानवेरीफाई के बारे में', descEn: 'Mission, architecture, and civic technology transparency principles.', descHi: 'मिशन, कार्यप्रणाली एवं नागरिक तकनीकी पारदर्शिता के सिद्धांत।' },
      { path: '/terms', labelEn: 'Terms & Conditions', labelHi: 'नियम एवं शर्तें', descEn: 'Terms governing prototype platform access and use.', descHi: 'प्रोटोटाइप मंच के उपयोग को नियंत्रित करने वाले नियम।' },
      { path: '/privacy', labelEn: 'Privacy Policy', labelHi: 'गोपनीयता नीति', descEn: 'Data isolation, document vault security, and synthetic demo records.', descHi: 'डेटा अलगाव, वॉल्ट सुरक्षा और सांकेतिक डेमो रिकॉर्ड्स।' },
      { path: '/disclaimer', labelEn: 'Disclaimer', labelHi: 'अस्वीकरण', descEn: 'Independence disclaimer, no government affiliation notice.', descHi: 'स्वतंत्रता अस्वीकरण, किसी सरकारी विभाग से असंबद्धता की सूचना।' },
      { path: '/hyperlinking-policy', labelEn: 'Hyperlinking Policy', labelHi: 'हाइपरलिंकिंग नीति', descEn: 'Rules on outbound links to official portals and inbound links.', descHi: 'आधिकारिक पोर्टलों के लिंक और बाहरी वेबसाइटों से जुड़ने के नियम।' },
      { path: '/copyright-policy', labelEn: 'Copyright Policy', labelHi: 'कॉपीराइट नीति', descEn: 'Intellectual property ownership and educational citation.', descHi: 'बौद्धिक संपदा स्वामित्व एवं गैर-व्यावसायिक उद्धरण अनुमति।' },
      { path: '/accessibility', labelEn: 'Accessibility Statement', labelHi: 'सुगमता विवरण', descEn: 'WCAG 2.1 AA compliance, high contrast, and keyboard support.', descHi: 'डब्ल्यूसीएजी 2.1 एए मानक, उच्च कंट्रास्ट एवं कीबोर्ड संचालन।' },
      { path: '/faq', labelEn: 'Help & FAQ', labelHi: 'सहायता एवं अक्सर पूछे जाने वाले प्रश्न', descEn: 'Answers to frequently asked questions about verification.', descHi: 'वित्तीय सत्यापन से जुड़े अक्सर पूछे जाने वाले प्रश्नों के उत्तर।' },
      { path: '/sitemap', labelEn: 'HTML Sitemap', labelHi: 'साइटमैप', descEn: 'Comprehensive index of all portal routes and sections.', descHi: 'पोर्टल के सभी पृष्ठों और सेवाओं की पूरी सूची।' },
    ],
  },
];

export const SitemapPage: React.FC = () => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <PolicyLayout
      titleEn="Sitemap"
      titleHi="साइटमैप"
      subtitleEn="Comprehensive index of all accessible pages and services on the KisanVerify platform."
      subtitleHi="किसानवेरीफाई मंच पर उपलब्ध सभी पृष्ठों और सेवाओं की संपूर्ण अनुक्रमणिका।"
    >
      <div className="space-y-8 not-prose">
        {SITEMAP_DATA.map((group, gIdx) => (
          <div key={gIdx} className="space-y-3">
            <h2 className="text-base font-bold text-[#1F2E14] flex items-center gap-2 border-b border-[#E6E0D4] pb-2">
              <Map className="w-4 h-4 text-[#8B9A6E]" />
              <span>{isHi ? group.groupHi : group.groupEn}</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {group.links.map((link, lIdx) => (
                <Link
                  key={lIdx}
                  to={link.path}
                  className="p-3 rounded-xl bg-white border border-[#E6E0D4] hover:border-[#8B9A6E] hover:shadow-xs transition-all flex items-start justify-between group"
                >
                  <div className="pr-2">
                    <div className="text-xs font-bold text-[#1F2E14] group-hover:text-[#3D550C] flex items-center gap-1.5">
                      <span>{isHi ? link.labelHi : link.labelEn}</span>
                      <span className="text-[10px] text-stone-400 font-mono">({link.path})</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                      {isHi ? link.descHi : link.descEn}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-[#3D550C] shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PolicyLayout>
  );
};

export default SitemapPage;
