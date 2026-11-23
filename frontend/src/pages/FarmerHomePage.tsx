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
      desc: language === 'hi' ? 'अपनी पात्र सरकारी योजनाएं देखें' : 'Check your eligible government schemes',
      path: '/farmer/schemes',
      icon: Layers,
    },
    {
      title: t('nav.loan'),
      desc: language === 'hi' ? 'ऋण राशि व कटौती सत्यापित करें' : 'Verify your loan details and deductions',
      path: '/farmer/loan-verify',
      icon: Landmark,
    },
    {
      title: t('nav.msp'),
      desc: language === 'hi' ? 'फसल बिक्री व एमएसपी भुगतान ट्रैक करें' : 'Track your crop payments',
      path: '/farmer/msp-verify',
      icon: Coins,
    },
    {
      title: t('nav.insurance'),
      desc: language === 'hi' ? 'फसल बीमा क्लेम स्थिति जांचें' : 'Check your claim status',
      path: '/farmer/insurance-verify',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      
      {/* Mobile Greeting (Image B Screen 3: "Namaste, Ramesh Kumar 👋") */}
      <div className="md:hidden pt-1">
        <h1 className="text-xl font-bold text-charcoal tracking-tight flex items-center gap-2">
          <span>{language === 'hi' ? 'नमस्ते, ' + farmer.nameHi : 'Namaste, ' + farmer.name}</span>
          <span className="text-xl">👋</span>
        </h1>
        <p className="text-xs text-muted font-medium mt-0.5">
          {language === 'hi' ? 'यहाँ आपका कृषि वित्तीय विवरण प्रस्तुत है' : "Here's your agricultural benefit summary"}
        </p>
      </div>

      {/* ============================================================== */}
      {/* HERO BANNER (Unified compact banner) */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-[#E3EBD1] border border-[#CAD8B6] px-5 py-4 sm:px-6 sm:py-5 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Headline & Description */}
        <div className="py-1 flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-charcoal tracking-tight leading-tight">
            {language === 'hi' ? 'अपनी योजनाएं जानें। अपना पैसा सत्यापित करें।' : 'Know your benefits. Verify your money.'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4E6243] font-medium leading-snug mt-1 max-w-xl">
            {language === 'hi' 
              ? 'अपने ऋण, सब्सिडी, एमएसपी और फसल बीमा का पारदर्शी विवरण एक ही स्थान पर जांचें।' 
              : 'Check your loans, subsidies, MSP and insurance in one place.'}
          </p>
        </div>

        {/* Right Section: Compact Voice Assistant Panel */}
        <div className="hidden md:flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-[#D6E2C6]/80 border border-[#C5D4B3] shrink-0 shadow-sm">
          {/* Decorative outline mic icon on left */}
          <Mic className="w-5 h-5 text-forest/90 shrink-0" strokeWidth={2} />

          {/* Text block */}
          <div className="text-left whitespace-nowrap">
            <p className="text-xs font-bold text-charcoal leading-tight">
              {language === 'hi' ? 'अपनी भाषा में पूछें' : 'Ask in your language'}
            </p>
            <p className="text-[11px] text-[#556948] mt-0.5">
              {language === 'hi' ? 'माइक दबाकर बोलें' : 'Tap the mic and speak'}
            </p>
          </div>

          {/* Compact round voice button */}
          <button
            onClick={() => navigate('/farmer/assistant')}
            className="w-9 h-9 rounded-full bg-forest hover:bg-forest-dark text-white flex items-center justify-center shadow-soft hover:scale-105 active:scale-95 transition-all ml-1 shrink-0"
            aria-label="Activate voice assistant"
          >
            <Mic className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Mobile Voice Button (< md) */}
        <div className="w-full md:hidden pt-0.5">
          <button
            onClick={() => navigate('/farmer/assistant')}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-forest text-white text-xs font-bold shadow-soft hover:bg-forest-dark transition-all active:scale-98 min-h-[42px]"
          >
            <Mic className="w-4 h-4 text-white" />
            <span>{language === 'hi' ? 'अपनी भाषा में पूछें — माइक दबाकर बोलें' : 'Ask in your language — Tap the mic and speak'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4 CORE ACTION CARDS (4-cols on desktop Image A, 2x2 grid on phone Image B) */}
      {/* ============================================================== */}
      <div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.path}
                onClick={() => navigate(tile.path)}
                className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border hover:border-olive hover:shadow-card transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-soft min-h-[110px] sm:min-h-[135px]"
              >
                <div className="flex items-start justify-between">
                  {/* Tinted icon container (sampled #E4EBD6) */}
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-tint text-forest flex items-center justify-center group-hover:bg-forest group-hover:text-white transition-colors shrink-0">
                    <Icon className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={1.75} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-forest transform group-hover:translate-x-1 transition-all mt-1" />
                </div>

                <div className="mt-3">
                  <h3 className="text-sm sm:text-base font-bold text-charcoal group-hover:text-forest transition-colors leading-tight">
                    {tile.title}
                  </h3>
                  <p className="hidden sm:block text-xs text-muted mt-1 line-clamp-1 leading-snug">
                    {tile.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* ATTENTION BANNER (Dynamic count with View Details button)      */}
      {/* ============================================================== */}
      {isLoadingAttention ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-tint/30 border border-warm-border animate-pulse flex items-center justify-between">
          <div className="h-5 bg-tint rounded w-1/3"></div>
          <div className="h-8 bg-tint rounded w-24"></div>
        </div>
      ) : attentionData.count === 0 ? (
        /* Zero discrepancies matched state */
        <div className="p-4 sm:p-5 rounded-2xl bg-status-eligible-bg border border-status-eligible-text/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-soft transition-all">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-status-eligible-text/20 text-status-eligible-text flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-status-eligible-text" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-status-eligible-text">
                {language === 'hi' ? 'सभी रिकॉर्ड सत्यापित हैं' : 'All Records Verified'}
              </h3>
              <p className="text-xs text-charcoal/80 mt-0.5">
                {language === 'hi'
                  ? 'आपके ऋण, एमएसपी और फसल बीमा में कोई विसंगति नहीं पाई गई।'
                  : 'No discrepancies detected in your loans, MSP sales, or insurance policies.'}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1.5 rounded-full bg-white text-status-eligible-text text-xs font-bold border border-status-eligible-text/20 self-end sm:self-center">
            {language === 'hi' ? '100% सत्यापित' : '100% Verified'}
          </span>
        </div>
      ) : (
        /* Flagged discrepancies banner matching Image A & Image B */
        <div className="rounded-2xl bg-status-review-bg border border-status-review-text/30 shadow-soft overflow-hidden transition-all">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-status-review-bg border border-status-review-text/30 text-status-review-text flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5 text-status-review-text" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-charcoal">
                  {language === 'hi'
                    ? `${attentionData.count} रिकॉर्ड की समीक्षा आवश्यक है`
                    : `${attentionData.count} Records Need Attention`}
                </h3>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">
                  {language === 'hi'
                    ? 'आपके ऋण और एमएसपी भुगतान रिकॉर्ड में विसंगति पाई गई है।'
                    : 'There are discrepancies in your loan and MSP payment records.'}
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
                className="shrink-0 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white text-xs font-bold shadow-soft flex items-center gap-1.5 transition-colors min-h-[40px]"
              >
                <span>{language === 'hi' ? 'विवरण देखें' : 'View Details'}</span>
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
            <div className="border-t border-status-review-text/20 bg-cream-surface p-3.5 sm:p-4 space-y-2">
              <div className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1">
                {language === 'hi' ? 'समीक्षा हेतु लंबित रिकॉर्ड' : 'Flagged Records Requiring Review'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {attentionData.items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.link)}
                    className="p-3 rounded-xl bg-cream border border-warm-border hover:border-olive hover:shadow-soft transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-charcoal">
                        {language === 'hi' && item.title_hi ? item.title_hi : item.title}
                      </div>
                      <div className="text-[11px] text-muted font-medium mt-0.5">
                        {language === 'hi' ? 'अंतर: ' : 'Difference: '}
                        <span className="font-bold text-status-discrepancy-text">₹{item.difference.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest bg-tint px-2.5 py-1 rounded-lg transition-colors">
                      Verify <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust & Transparency Footnote */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-cream-surface border border-warm-border text-xs text-muted flex items-center gap-3">
        <Info className="w-4 h-4 text-forest shrink-0" />
        <p className="leading-relaxed">
          <strong className="text-charcoal font-semibold">Core Guarantee:</strong> All financial math is calculated deterministically. A discrepancy flag is an invitation for transparent bank review, not proof of wrongdoing.
        </p>
      </div>

    </div>
  );
};
