import React, { useState, useEffect } from 'react';
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
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { FarmerIllustration } from '../components/FarmerIllustration';
import { fetchFarmerAttentionApi } from '../services/api';

export const FarmerHomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Dynamic attention counter state derived from backend
  const [attentionData, setAttentionData] = useState<{
    count: number;
    has_discrepancies: boolean;
    items: Array<{
      record_type: string;
      record_ref: string;
      title: string;
      title_hi?: string;
      difference: number;
      status: string;
      link: string;
    }>;
  }>({
    count: 2,
    has_discrepancies: true,
    items: [],
  });
  const [isLoadingAttention, setIsLoadingAttention] = useState(true);
  const [isAttentionExpanded, setIsAttentionExpanded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadAttention() {
      setIsLoadingAttention(true);
      try {
        const res = await fetchFarmerAttentionApi(farmer.farmerId);
        if (isMounted && res) {
          setAttentionData(res);
        }
      } catch (err) {
        console.warn('Failed to load attention data', err);
      } finally {
        if (isMounted) setIsLoadingAttention(false);
      }
    }
    loadAttention();
    return () => { isMounted = false; };
  }, [farmer.farmerId]);

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

      {/* Attention Alert Banner - Dynamically derived from flagged records */}
      {isLoadingAttention ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/50 animate-pulse flex items-center justify-between">
          <div className="h-5 bg-amber-200/60 rounded w-1/3"></div>
          <div className="h-8 bg-amber-200/60 rounded w-24"></div>
        </div>
      ) : attentionData.count === 0 ? (
        /* Reassuring zero-flagged state */
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">
                {language === 'hi' ? 'सभी रिकॉर्ड सत्यापित हैं' : 'All Records Verified'}
              </h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                {language === 'hi'
                  ? 'आपके ऋण, एमएसपी और फसल बीमा में कोई विसंगति नहीं पाई गई।'
                  : 'No discrepancies detected in your loans, MSP sales, or insurance policies.'}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 self-end sm:self-center">
            {language === 'hi' ? '100% सत्यापित' : '100% Matched'}
          </span>
        </div>
      ) : (
        /* Flagged records banner */
        <div className="rounded-2xl bg-[#FEF3E2] border border-[#FDE68A] shadow-soft overflow-hidden transition-all">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  {language === 'hi'
                    ? `${attentionData.count} रिकॉर्ड की समीक्षा आवश्यक है`
                    : `${attentionData.count} ${attentionData.count === 1 ? 'Record Needs' : 'Records Need'} Attention`}
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  {language === 'hi'
                    ? 'आपके ऋण और एमएसपी भुगतान रिकॉर्ड में अंतर पाया गया है।'
                    : `There are differences in your ${attentionData.items.map(i => i.record_type.toLowerCase()).join(' and ')} records.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => {
                  if (attentionData.items.length === 1) {
                    navigate(attentionData.items[0].link);
                  } else {
                    setIsAttentionExpanded(!isAttentionExpanded);
                  }
                }}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-soft flex items-center gap-1.5 transition-colors"
              >
                <span>{t('home.view_details')}</span>
                {attentionData.items.length > 1 ? (
                  isAttentionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable filtered list of flagged records */}
          {isAttentionExpanded && attentionData.items.length > 0 && (
            <div className="border-t border-amber-200/70 bg-amber-50/70 p-3 sm:p-4 space-y-2">
              <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1">
                {language === 'hi' ? 'समीक्षा हेतु लंबित रिकॉर्ड' : 'Flagged Records Requiring Review'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {attentionData.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.link)}
                    className="p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-soft transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        {language === 'hi' && item.title_hi ? item.title_hi : item.title}
                      </div>
                      <div className="text-[11px] text-amber-800 font-medium mt-0.5">
                        {language === 'hi' ? 'अंतर: ' : 'Difference: '}
                        <span className="font-bold text-red-700">₹{item.difference.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors">
                      Verify <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
