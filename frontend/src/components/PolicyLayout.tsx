import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Globe, AlertTriangle, Calendar } from 'lucide-react';
import { Logo } from './Logo';
import { Footer } from './Footer';
import { useLanguage } from '../context/LanguageContext';
import { siteConfig } from '../config/siteConfig';

interface PolicyLayoutProps {
  titleEn: string;
  titleHi: string;
  subtitleEn?: string;
  subtitleHi?: string;
  children: React.ReactNode;
}

export const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  titleEn,
  titleHi,
  subtitleEn,
  subtitleHi,
  children,
}) => {
  const { language, toggleLanguage } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-[#FAF7F2] text-[#2C3B1E] flex flex-col justify-between antialiased selection:bg-[#E4EBD6] selection:text-[#233316]">
      {/* Policy Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6E0D4] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white border border-[#D5CDBC] flex items-center justify-center text-[#2C3B1E] hover:bg-[#F2ECE0] transition-colors shadow-soft"
            aria-label={isHi ? 'पीछे जाएं' : 'Go back'}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <Link to="/farmer" className="flex items-center">
            <Logo variant="dark" size="sm" showTagline={false} />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/farmer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D5CDBC] text-xs font-semibold text-[#2C3B1E] hover:bg-[#F2ECE0] transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-[#5B6B4D]" />
            <span>{isHi ? 'किसान पोर्टल' : 'Farmer Portal'}</span>
          </Link>

          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D5CDBC] text-xs font-semibold text-[#2C3B1E] hover:bg-[#F2ECE0] transition-colors"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-[#8B9A6E]" />
            <span>{isHi ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex items-center gap-1.5 text-xs text-[#6B7A5D]">
            <li>
              <Link to="/farmer" className="hover:text-[#233316] hover:underline flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span>{isHi ? 'होम' : 'Home'}</span>
              </Link>
            </li>
            <li aria-hidden="true" className="text-stone-400">/</li>
            <li className="font-semibold text-[#233316] truncate">
              {isHi ? titleHi : titleEn}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#EBF0E4] border border-[#CCD8BE] text-[#2C3B1E] text-xs font-bold uppercase tracking-wider">
              {isHi ? 'आधिकारिक नीति विवरण' : 'Platform Policy'}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#8B9A6E]" />
              <span>{isHi ? `अंतिम अद्यतन: ${siteConfig.lastUpdated}` : `Last updated: ${siteConfig.lastUpdated}`}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2E14] tracking-tight">
            {isHi ? titleHi : titleEn}
          </h1>

          {(subtitleEn || subtitleHi) && (
            <p className="text-sm text-[#5B6B4D] mt-2 leading-relaxed">
              {isHi ? subtitleHi : subtitleEn}
            </p>
          )}

          {/* Legal Prototype Notice Banner */}
          <div className="mt-5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>{isHi ? 'महत्वपूर्ण सूचना:' : 'Notice:'}</strong>{' '}
              {isHi
                ? 'यह नीति दस्तावेज़ किसानवेरीफाई हैकाथॉन प्रोटोटाइप के लिए तैयार किया गया सांकेतिक प्रारूप है। उत्पादन में उपयोग से पूर्व विधिक परामर्श अनिवार्य है।'
                : 'This policy document is a prototype framework prepared for the KisanVerify platform. Prior to commercial production deployment, it must be reviewed and adapted by legal counsel.'}
            </p>
          </div>
        </div>

        {/* Policy Body Content */}
        <div className="bg-white border border-[#E6E0D4] rounded-3xl p-6 sm:p-8 shadow-sm prose prose-stone max-w-none text-stone-700 leading-relaxed space-y-6">
          {children}
        </div>
      </main>

      {/* Government-style Responsive Footer */}
      <Footer hasBottomTabBar={false} />
    </div>
  );
};

export default PolicyLayout;
