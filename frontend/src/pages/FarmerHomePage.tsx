import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  Mic, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FarmerIllustration } from '../components/FarmerIllustration';

export const FarmerHomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const tiles = [
    {
      title: t('nav.schemes'),
      desc: t('tile.schemes_desc'),
      path: '/farmer/schemes',
      icon: Layers,
      tag: '4 Available',
      color: 'bg-sage-50 text-sage-700 border-sage-200',
    },
    {
      title: t('nav.loan'),
      desc: t('tile.loan_desc'),
      path: '/farmer/loan-verify',
      icon: Landmark,
      tag: 'Needs Review',
      tagColor: 'bg-kisan-lightred text-kisan-red border-kisan-red/30',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      title: t('nav.msp'),
      desc: t('tile.msp_desc'),
      path: '/farmer/msp-verify',
      icon: Coins,
      tag: 'Discrepancy',
      tagColor: 'bg-kisan-lightred text-kisan-red border-kisan-red/30',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: t('nav.insurance'),
      desc: t('tile.insurance_desc'),
      path: '/farmer/insurance-verify',
      icon: ShieldCheck,
      tag: 'Under Review',
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Mobile greeting */}
      <div className="md:hidden">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          {language === 'hi' ? 'नमस्ते, ' + farmer.nameHi : 'Namaste, ' + farmer.name} 👋
        </h1>
        <p className="text-xs text-gray-500">
          {t('home.summary_sub')}
        </p>
      </div>

      {/* Hero Banner with Farmer Illustration (matches mockups) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EAF2E8] via-[#F4F7F2] to-[#FAF8F2] border border-sage-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        
        <div className="max-w-md space-y-3 text-left z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-sage-200 text-xs font-semibold text-sage-800 shadow-soft">
            <Sparkles className="w-3.5 h-3.5 text-sage-600" />
            <span>KisanVerify Transparency</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
            {t('home.hero_title')}
          </h2>

          <p className="text-sm text-gray-600 leading-relaxed">
            {t('home.hero_sub')}
          </p>

          <div className="pt-2">
            {/* Ask in your language mic button */}
            <button
              onClick={() => navigate('/farmer/assistant')}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-md transition-all transform active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>{t('home.ask_voice')}</span>
            </button>
          </div>
        </div>

        {/* Farmer Artwork */}
        <div className="w-full md:w-80 h-48 sm:h-56 shrink-0 rounded-2xl overflow-hidden shadow-soft border border-white/60 bg-white/40">
          <FarmerIllustration className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Attention Alert Banner (2 Records Need Attention - Matching mockups) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF3E2] border border-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              {t('home.attention_banner')}
            </h3>
            <p className="text-xs text-amber-800 mt-0.5">
              {t('home.attention_sub')}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/farmer/loan-verify')}
          className="shrink-0 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors self-end sm:self-center"
        >
          <span>{t('home.view_details')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Core Verification Tiles (My Schemes, My Loan, MSP Payments, Crop Insurance) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Verification Services
          </h2>
          <span className="text-xs text-gray-500">Every rupee accounted for</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.path}
                onClick={() => navigate(tile.path)}
                className="bg-white rounded-3xl p-5 border border-warm-border hover:border-sage-400 hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center group-hover:bg-sage-600 group-hover:text-white transition-colors shadow-soft">
                      <Icon className="w-6 h-6" />
                    </div>
                    {tile.tag && (
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${tile.tagColor || 'bg-sage-50 text-sage-700 border-sage-200'}`}>
                        {tile.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-sage-700 transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {tile.desc}
                  </p>
                </div>

                <div className="pt-4 mt-2 border-t border-warm-border/60 flex items-center justify-between text-xs font-semibold text-sage-700">
                  <span>Verify Now</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Transparency Note */}
      <div className="p-4 rounded-2xl bg-white border border-warm-border text-xs text-gray-500 flex items-center gap-3">
        <Info className="w-4 h-4 text-sage-600 shrink-0" />
        <p>
          <strong className="text-gray-700">Core Guarantee:</strong> All financial math is calculated deterministically. A discrepancy flag is an invitation for review, not proof of wrongdoing.
        </p>
      </div>

    </div>
  );
};
