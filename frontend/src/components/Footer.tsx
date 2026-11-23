import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  PhoneCall,
  Mail,
  ChevronDown,
  ArrowUp,
  Globe,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { siteConfig } from '../config/siteConfig';

export const Footer: React.FC<{ hasBottomTabBar?: boolean }> = ({ hasBottomTabBar = true }) => {
  const { language, toggleLanguage } = useLanguage();
  const isHi = language === 'hi';

  // Mobile accordion state (collapsed by default on mobile)
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    quick: false,
    info: false,
    govt: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const skipToMain = (e: React.MouseEvent) => {
    e.preventDefault();
    const mainEl = document.querySelector('main') || document.getElementById('main-content');
    if (mainEl) {
      mainEl.tabIndex = -1;
      mainEl.focus();
      mainEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { to: '/farmer', labelEn: 'Home', labelHi: 'होम' },
    { to: '/farmer/schemes', labelEn: 'My Schemes', labelHi: 'मेरी योजनाएं' },
    { to: '/farmer/loan-verify', labelEn: 'Loan Verification', labelHi: 'ऋण सत्यापन' },
    { to: '/farmer/msp-verify', labelEn: 'MSP Payments', labelHi: 'एमएसपी भुगतान' },
    { to: '/farmer/insurance-verify', labelEn: 'Crop Insurance', labelHi: 'फसल बीमा' },
    { to: '/farmer/mandi', labelEn: 'Mandi Prices', labelHi: 'मंडी भाव' },
    { to: '/farmer/weather', labelEn: 'Weather Alerts', labelHi: 'मौसम और सलाह' },
    { to: '/farmer/documents', labelEn: 'My Documents', labelHi: 'मेरे दस्तावेज़' },
    { to: '/farmer/grievance', labelEn: 'Grievances', labelHi: 'शिकायतें' },
  ];

  const infoLinks = [
    { to: '/about', labelEn: 'About KisanVerify', labelHi: 'किसानवेरीफाई के बारे में' },
    { to: '/faq', labelEn: 'Help & FAQ', labelHi: 'सहायता एवं अक्सर पूछे जाने वाले प्रश्न' },
    { to: '/farmer/contact', labelEn: 'Contact Us', labelHi: 'संपर्क करें' },
    { to: '/farmer/offices', labelEn: 'Nearby Offices', labelHi: 'निकटतम कृषि केंद्र' },
    { to: '/sitemap', labelEn: 'Sitemap', labelHi: 'साइटमैप' },
    { to: '/accessibility', labelEn: 'Accessibility Statement', labelHi: 'सुगमता विवरण' },
    { to: '/farmer/grievance', labelEn: 'Feedback & Grievances', labelHi: 'प्रतिक्रिया एवं शिकायत' },
  ];

  const legalPolicies = [
    { to: '/terms', labelEn: 'Terms & Conditions', labelHi: 'नियम एवं शर्तें' },
    { to: '/privacy', labelEn: 'Privacy Policy', labelHi: 'गोपनीयता नीति' },
    { to: '/disclaimer', labelEn: 'Disclaimer', labelHi: 'अस्वीकरण' },
    { to: '/hyperlinking-policy', labelEn: 'Hyperlinking Policy', labelHi: 'हाइपरलिंकिंग नीति' },
    { to: '/copyright-policy', labelEn: 'Copyright Policy', labelHi: 'कॉपीराइट नीति' },
    { to: '/accessibility', labelEn: 'Accessibility', labelHi: 'सुगमता' },
    { to: '/sitemap', labelEn: 'Sitemap', labelHi: 'साइटमैप' },
  ];

  return (
    <footer
      role="contentinfo"
      aria-label={isHi ? 'फुटर' : 'Footer'}
      className={`relative w-full text-[#F7F5EC] bg-[#4A6538] border-t border-[#3D550C] ${
        hasBottomTabBar ? 'pb-24 md:pb-0' : ''
      }`}
    >
      {/* 1. Saffron Top Accent Line */}
      <div
        className="w-full h-[3px] bg-gradient-to-r from-[#FF9933] via-[#FFB366] to-[#FF9933]"
        aria-hidden="true"
      />

      {/* Skip to Main Content Link for Keyboard Users */}
      <a
        href="#main-content"
        onClick={skipToMain}
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 z-50 px-4 py-2 bg-[#FF9933] text-stone-900 font-bold rounded-lg shadow-lg"
      >
        {isHi ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
      </a>

      {/* 2. Main Footer Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Brand & Synopsis */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo variant="mono-white" size="md" showTagline={false} />
            </div>

            <p className="text-sm font-semibold text-[#FFB366] tracking-wide">
              {isHi ? siteConfig.taglineHi : siteConfig.tagline}
            </p>

            <p className="text-xs text-[#EAE6DA] leading-relaxed">
              {isHi ? siteConfig.descriptionHi : siteConfig.descriptionEn}
            </p>

            {/* Language & Accessibility Quick Pills */}
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={toggleLanguage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D550C] hover:bg-[#34480A] text-xs font-semibold text-[#F7F5EC] border border-[#5E7E48] transition-colors focus:ring-2 focus:ring-[#FF9933] focus:outline-none min-h-[36px]"
                aria-label={isHi ? 'Switch to English' : 'हिंदी में बदलें'}
              >
                <Globe className="w-3.5 h-3.5 text-[#FFB366]" />
                <span>{isHi ? 'English' : 'हिन्दी'}</span>
              </button>

              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3D550C] hover:bg-[#34480A] text-xs font-semibold text-[#F7F5EC] border border-[#5E7E48] transition-colors focus:ring-2 focus:ring-[#FF9933] focus:outline-none min-h-[36px]"
                aria-label={isHi ? 'शीर्ष पर वापस जाएं' : 'Back to top'}
              >
                <ArrowUp className="w-3.5 h-3.5 text-[#FFB366]" />
                <span>{isHi ? 'शीर्ष पर जाएं' : 'Back to top'}</span>
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="border-t border-[#5E7E48] md:border-t-0 pt-4 md:pt-0">
            <button
              onClick={() => toggleAccordion('quick')}
              className="w-full flex items-center justify-between text-left font-bold text-sm tracking-wide text-[#F7F5EC] md:cursor-default"
              aria-expanded={openAccordions.quick}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#FF9933] rounded-full inline-block md:inline-block"></span>
                <span>{isHi ? 'त्वरित लिंक' : 'Quick Links'}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#FFB366] transition-transform ${
                  openAccordions.quick ? 'rotate-180' : ''
                }`}
              />
            </button>

            <nav
              aria-label={isHi ? 'त्वरित लिंक' : 'Quick Links'}
              className={`mt-3 space-y-2 text-xs ${
                openAccordions.quick ? 'block' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-1.5">
                {quickLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className="inline-block py-1 text-[#EAE6DA] hover:text-[#FFB366] transition-colors focus:ring-2 focus:ring-[#FF9933] focus:outline-none rounded"
                    >
                      {isHi ? item.labelHi : item.labelEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 3: Information & Help */}
          <div className="border-t border-[#5E7E48] md:border-t-0 pt-4 md:pt-0">
            <button
              onClick={() => toggleAccordion('info')}
              className="w-full flex items-center justify-between text-left font-bold text-sm tracking-wide text-[#F7F5EC] md:cursor-default"
              aria-expanded={openAccordions.info}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#FF9933] rounded-full inline-block md:inline-block"></span>
                <span>{isHi ? 'सूचना एवं सहायता' : 'Information & Support'}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#FFB366] transition-transform ${
                  openAccordions.info ? 'rotate-180' : ''
                }`}
              />
            </button>

            <nav
              aria-label={isHi ? 'सूचना एवं सहायता' : 'Information & Support'}
              className={`mt-3 space-y-2 text-xs ${
                openAccordions.info ? 'block' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-1.5">
                {infoLinks.map((item, idx) => (
                  <li key={idx}>
                    <Link
                      to={item.to}
                      className="inline-block py-1 text-[#EAE6DA] hover:text-[#FFB366] transition-colors focus:ring-2 focus:ring-[#FF9933] focus:outline-none rounded"
                    >
                      {isHi ? item.labelHi : item.labelEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Column 4: Verified Important Official Links */}
          <div className="border-t border-[#5E7E48] md:border-t-0 pt-4 md:pt-0">
            <button
              onClick={() => toggleAccordion('govt')}
              className="w-full flex items-center justify-between text-left font-bold text-sm tracking-wide text-[#F7F5EC] md:cursor-default"
              aria-expanded={openAccordions.govt}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#FF9933] rounded-full inline-block md:inline-block"></span>
                <span>{isHi ? 'महत्वपूर्ण सरकारी पोर्टल' : 'Official Government Links'}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 md:hidden text-[#FFB366] transition-transform ${
                  openAccordions.govt ? 'rotate-180' : ''
                }`}
              />
            </button>

            <nav
              aria-label={isHi ? 'आधिकारिक सरकारी पोर्टल' : 'Official Government Portals'}
              className={`mt-3 space-y-2 text-xs ${
                openAccordions.govt ? 'block' : 'hidden md:block'
              }`}
            >
              <ul className="space-y-1.5">
                {siteConfig.importantLinks.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1 text-[#EAE6DA] hover:text-[#FFB366] transition-colors focus:ring-2 focus:ring-[#FF9933] focus:outline-none rounded group"
                      title={`${link.domain} (opens in a new tab)`}
                    >
                      <span className="truncate">{isHi ? link.nameHi : link.nameEn}</span>
                      <ExternalLink className="w-3 h-3 text-[#FFB366]/80 group-hover:text-[#FFB366] shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* 3. Help Strip (Inside Body, Above Bottom Bar) */}
        <div className="mt-8 pt-6 border-t border-[#5E7E48]/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#3E562F] p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F4223] flex items-center justify-center shrink-0 border border-[#5E7E48]">
              <PhoneCall className="w-5 h-5 text-[#FFB366]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#FFB366] uppercase tracking-wider">
                {isHi ? 'अखिल भारतीय निःशुल्क हेल्पलाइन' : 'All-India Toll-Free Assistance'}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {isHi ? 'किसान कॉल सेंटर:' : 'Kisan Call Centre:'}
                </span>
                <a
                  href={`tel:${siteConfig.kisanCallCentrePhone}`}
                  className="text-sm font-extrabold text-[#FFB366] hover:underline"
                >
                  {siteConfig.kisanCallCentrePhone}
                </a>
                <span className="text-[10px] bg-[#2F4223] px-2 py-0.5 rounded text-[#EAE6DA] border border-[#5E7E48]">
                  {isHi ? 'निःशुल्क' : 'Toll-free'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F4223] flex items-center justify-center shrink-0 border border-[#5E7E48]">
              <Mail className="w-5 h-5 text-[#FFB366]" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[#FFB366] uppercase tracking-wider">
                {isHi ? 'मंच सहायता ईमेल' : 'Platform Support Email'}
              </div>
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="text-xs font-semibold text-white hover:text-[#FFB366] transition-colors"
              >
                {siteConfig.supportEmail}
              </a>
            </div>
          </div>
        </div>

        {/* 4. Strict Legal & Honesty Prototype Disclaimer Box */}
        <div className="mt-6 p-4 rounded-xl bg-[#374C2A] border border-[#5E7E48] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#FFB366] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#EAE6DA] leading-relaxed">
            {isHi ? siteConfig.disclaimerHi : siteConfig.disclaimerEn}
          </p>
        </div>
      </div>

      {/* 5. Darker Bottom Bar (Government-portal Standard Pattern) */}
      <div className="w-full bg-[#364B29] border-t border-[#2F4223] py-4 text-xs text-[#D8D3C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          {/* Policy Links with Thin Saffron Dividers */}
          <nav aria-label={isHi ? 'नीति एवं वैधानिक लिंक' : 'Legal & Policy Links'}>
            <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px]">
              {legalPolicies.map((item, idx) => (
                <li key={idx} className="flex items-center">
                  <Link
                    to={item.to}
                    className="hover:text-[#FFB366] transition-colors focus:ring-1 focus:ring-[#FF9933] focus:outline-none px-1 py-0.5 rounded"
                  >
                    {isHi ? item.labelHi : item.labelEn}
                  </Link>
                  {idx < legalPolicies.length - 1 && (
                    <span className="mx-1 text-[#FF9933]/50 select-none" aria-hidden="true">
                      |
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright, Attribution & Last Updated */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-center gap-2 pt-2 border-t border-[#445E34] text-[11px] text-[#C8C2B3]">
            <div>
              © {new Date().getFullYear()} KisanVerify. {isHi ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
            </div>

            <div>
              {isHi
                ? `सामग्री स्वामित्व: किसानवेरीफाई टीम • डिज़ाइन एवं विकास: टीम ${siteConfig.teamName}`
                : `Content owned by KisanVerify Team • Designed & developed by Team ${siteConfig.teamName}`}
            </div>

            <div>
              {isHi
                ? `अंतिम अद्यतन: ${siteConfig.lastUpdated}`
                : `Last updated: ${siteConfig.lastUpdated}`}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
