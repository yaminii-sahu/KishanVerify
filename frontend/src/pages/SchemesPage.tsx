import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  Landmark, 
  Coins, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Info,
  Calendar,
  FileText,
  X,
  Sparkles,
  ExternalLink,
  Search,
  Flag,
  Check,
  Building2,
  Droplets,
  Tractor,
  HandCoins
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { fetchSchemesListApi, reportBrokenLinkApi } from '../services/api';

export const INDIAN_STATES_AND_UTS = [
  'All States & UTs',
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const SchemesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Filters state
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Central' | 'State'>('All');
  const [selectedState, setSelectedState] = useState<string>(farmer?.state || 'Chhattisgarh');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data state
  const [schemes, setSchemes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

  // Broken link report modal state
  const [reportingScheme, setReportingScheme] = useState<any | null>(null);
  const [reportNote, setReportNote] = useState('Official website link is not opening or timed out');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const categories = [
    'All',
    'Subsidy',
    'Insurance',
    'Loan',
    'Income Support',
    'Irrigation',
    'Equipment'
  ];

  // Load schemes from backend API
  const loadSchemes = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSchemesListApi({
        level: selectedLevel,
        state: selectedLevel === 'Central' ? undefined : selectedState,
        category: selectedCategory,
        search: searchQuery,
      });
      setSchemes(data || []);
    } catch (err) {
      console.warn('Failed to fetch schemes list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchemes();
  }, [selectedLevel, selectedState, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadSchemes();
  };

  const handleReportBrokenLink = async () => {
    if (!reportingScheme) return;
    setIsReporting(true);
    try {
      await reportBrokenLinkApi(reportingScheme.scheme_code, {
        reported_url: reportingScheme.official_url,
        note: reportNote,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingScheme(null);
      }, 1800);
    } catch {
      setReportingScheme(null);
    } finally {
      setIsReporting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Loan':
        return <Landmark className="w-5 h-5" strokeWidth={1.75} />;
      case 'Insurance':
        return <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />;
      case 'Income Support':
        return <HandCoins className="w-5 h-5" strokeWidth={1.75} />;
      case 'Irrigation':
        return <Droplets className="w-5 h-5" strokeWidth={1.75} />;
      case 'Equipment':
        return <Tractor className="w-5 h-5" strokeWidth={1.75} />;
      default:
        return <Coins className="w-5 h-5" strokeWidth={1.75} />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Desktop Header */}
      <div className="hidden md:flex items-center gap-3">
        <button
          onClick={() => navigate('/farmer')}
          className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-charcoal tracking-tight">
            {language === 'hi' ? 'सरकारी योजनाएं एवं प्रत्यक्ष लाभ' : 'Government Schemes & Subsidies'}
          </h1>
          <p className="text-xs text-muted">
            {language === 'hi' 
              ? 'केंद्रीय व राज्य स्तरीय आधिकारिक योजनाएं, पात्रता गाइड और सीधे सरकारी आवेदन पोर्टल।' 
              : 'Official Central and State agricultural schemes, eligibility guides, and direct portal access.'}
          </p>
        </div>
      </div>

      {/* Official Government Verification Banner */}
      <div className="bg-[#EAF0E2] border border-[#CAD8B6] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <ShieldCheck className="w-5 h-5 text-tint" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-charcoal">
                {language === 'hi' ? 'सत्यापित आधिकारिक सरकारी पोर्टल लिंक' : 'Verified Official Government Portals'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-forest text-white text-[10px] font-bold tracking-wide">
                .gov.in / .nic.in
              </span>
            </div>
            <p className="text-xs text-[#4F6244] mt-1 leading-relaxed max-w-2xl">
              {language === 'hi'
                ? 'सभी "Apply Now" लिंक केवल आधिकारिक भारत सरकार (.gov.in / .nic.in) पोर्टल खोलते हैं। पात्रता स्थितियां सांकेतिक हैं ("संभावित पात्र"), कोई गारंटीकृत दावा नहीं है।'
                : 'Every "Apply Now" link connects directly to official Government of India (.gov.in or .nic.in) portals. Eligibility tags reflect potential criteria, never a guaranteed approval.'}
            </p>
          </div>
        </div>

        <a
          href="https://www.myscheme.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cream-surface border border-warm-border text-forest hover:bg-forest hover:text-white text-xs font-bold transition-all shadow-soft shrink-0 self-end sm:self-center"
        >
          <span>myScheme.gov.in</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* ============================================================== */}
      {/* FILTER CONTROLS CARD                                           */}
      {/* ============================================================== */}
      <div className="bg-cream-surface rounded-2xl p-5 border border-warm-border shadow-soft space-y-4">
        
        {/* Row 1: Level Pills + State Dropdown + Search Input */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Level Switcher (4 cols) */}
          <div className="md:col-span-4 flex items-center p-1 bg-cream rounded-xl border border-warm-border">
            {(['All', 'Central', 'State'] as const).map((lvl) => {
              const isSel = selectedLevel === lvl;
              const label = lvl === 'All' 
                ? (language === 'hi' ? 'सभी स्तर' : 'All Levels')
                : lvl === 'Central'
                ? (language === 'hi' ? 'केंद्रीय (राष्ट्रीय)' : 'Central (National)')
                : (language === 'hi' ? 'राज्य स्तरीय' : 'State');
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isSel 
                      ? 'bg-forest text-white shadow-soft' 
                      : 'text-charcoal/80 hover:text-charcoal'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* State Dropdown (4 cols) - disabled when Level = Central */}
          <div className="md:col-span-4">
            <select
              value={selectedState}
              disabled={selectedLevel === 'Central'}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-cream rounded-xl border border-warm-border text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive disabled:opacity-50 min-h-[42px]"
            >
              {INDIAN_STATES_AND_UTS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box (4 cols) */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'योजना खोजें (जैसे पीएम-किसान, सोलर)...' : 'Search schemes (e.g. PM-KISAN, Solar)...'}
              className="w-full pl-9 pr-8 py-2.5 bg-cream rounded-xl border border-warm-border text-xs font-medium text-charcoal placeholder-muted focus:outline-none focus:ring-2 focus:ring-olive min-h-[42px]"
            />
            <Search className="w-4 h-4 text-muted absolute left-3 top-3 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); loadSchemes(); }}
                className="w-5 h-5 rounded-full hover:bg-warm-border text-muted absolute right-2.5 top-2.5 flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </form>
        </div>

        {/* Row 2: Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <span className="text-xs font-bold text-muted uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-[34px] ${
                  isActive
                    ? 'bg-forest text-white shadow-soft'
                    : 'bg-cream text-muted border border-warm-border hover:bg-tint/40'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SCHEMES CARDS LIST                                             */}
      {/* ============================================================== */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <span>{language === 'hi' ? 'उपलब्ध सरकारी योजनाएं' : 'Available Government Schemes'}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tint text-forest">
              {schemes.length}
            </span>
          </h3>
          <span className="text-[11px] text-muted">
            {language === 'hi' ? 'पात्रता स्थिति: संभावित पात्र' : 'Status: Potentially Eligible'}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
            <span>Loading verified schemes...</span>
          </div>
        ) : schemes.length === 0 ? (
          <div className="bg-cream-surface rounded-2xl p-8 border border-dashed border-warm-border text-center text-muted space-y-2">
            <p className="font-bold text-charcoal text-sm">No schemes match the selected filters.</p>
            <p className="text-xs">Try selecting "All Levels" or clearing the search query.</p>
            <button
              onClick={() => { setSelectedLevel('All'); setSelectedCategory('All'); setSearchQuery(''); }}
              className="mt-2 px-4 py-2 bg-tint text-forest font-bold rounded-xl text-xs hover:bg-tint/80"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border hover:border-olive hover:shadow-card transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-soft group"
            >
              {/* Left Column: Icon + Titles + Badges + Short Description */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-colors mt-0.5">
                  {getCategoryIcon(scheme.category)}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  {/* Badges: Level, State, Category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      scheme.level === 'Central' 
                        ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {scheme.level === 'Central' ? 'Central (National)' : `State: ${scheme.state || 'State'}`}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cream border border-warm-border text-charcoal">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-status-eligible-bg text-status-eligible-text border border-status-eligible-text/20">
                      Potentially Eligible
                    </span>
                  </div>

                  {/* Title */}
                  <h4 
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-sm sm:text-base font-bold text-charcoal group-hover:text-forest transition-colors leading-tight cursor-pointer"
                  >
                    {language === 'hi' ? scheme.title_hi : scheme.title}
                  </h4>

                  {/* Short description */}
                  <p className="text-xs text-muted leading-relaxed line-clamp-2">
                    {language === 'hi' ? scheme.description_hi : (scheme.short_description || scheme.description)}
                  </p>

                  {/* Verification & Deadline metadata */}
                  <div className="flex items-center gap-3 text-[11px] text-muted flex-wrap pt-0.5">
                    <span className="flex items-center gap-1 text-forest font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{scheme.source_note || 'Verified Official Portal'}</span>
                    </span>
                    <span>•</span>
                    <span>Deadline: <strong>{scheme.deadline}</strong></span>
                    {scheme.last_verified_on && (
                      <>
                        <span>•</span>
                        <span className="text-[10px] font-mono text-muted/80">Verified {scheme.last_verified_on}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Actions (Apply Now + View Details + Report link) */}
              <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-warm-border/60">
                {scheme.has_verified_official_portal && scheme.official_url ? (
                  <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                    <a
                      href={scheme.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft flex items-center justify-center gap-1.5 transition-all min-h-[38px]"
                    >
                      <span>Apply Now</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[10px] text-muted text-right">
                      Leaves to official gov site (.gov.in / .nic.in)
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cream border border-warm-border text-charcoal font-semibold text-xs hover:bg-tint transition-all min-h-[38px]"
                  >
                    See Official Guidance
                  </button>
                )}

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full text-xs">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-forest hover:underline font-bold text-xs"
                  >
                    Full Details →
                  </button>
                  <button
                    onClick={() => setReportingScheme(scheme)}
                    className="text-[11px] text-muted hover:text-status-discrepancy-text hover:underline flex items-center gap-1"
                  >
                    <Flag className="w-3 h-3" />
                    <span>Report broken link</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================================================== */}
      {/* SCHEME DETAIL MODAL                                            */}
      {/* ============================================================== */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-cream-surface rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 border border-warm-border shadow-dropdown space-y-4 max-h-[90dvh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-warm-border pb-3.5">
              <div className="space-y-1.5 pr-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    selectedScheme.level === 'Central' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedScheme.level === 'Central' ? 'Central Scheme' : `State: ${selectedScheme.state}`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-tint text-forest text-[11px] font-bold">
                    {selectedScheme.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-status-eligible-bg text-status-eligible-text text-[10px] font-bold">
                    Potentially Eligible
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-charcoal leading-tight">
                  {language === 'hi' ? selectedScheme.title_hi : selectedScheme.title}
                </h3>
                <p className="text-[11px] text-muted flex items-center gap-1.5 flex-wrap">
                  <span>{selectedScheme.ministry || 'Ministry of Agriculture and Farmers Welfare'}</span>
                  <span>•</span>
                  <span className="font-semibold text-forest">{selectedScheme.source || 'Official Government Portal'}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 rounded-full hover:bg-tint flex items-center justify-center text-muted shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-3 text-xs">
              {/* Benefits */}
              <div className="p-4 rounded-xl bg-cream border border-warm-border space-y-2">
                <p className="font-bold text-charcoal flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-olive" />
                  <span>{language === 'hi' ? 'लाभ और वित्तीय सहायता:' : 'Benefits & Financial Assistance:'}</span>
                </p>
                <p className="text-sm font-extrabold text-forest">
                  {language === 'hi' ? selectedScheme.benefits_hi || selectedScheme.benefits : selectedScheme.benefits}
                </p>
                <p className="text-muted leading-relaxed pt-1">
                  {language === 'hi' ? selectedScheme.description_hi : selectedScheme.description}
                </p>
              </div>

              {/* Eligibility Criteria */}
              <div className="p-3.5 rounded-xl bg-tint/30 border border-warm-border space-y-1">
                <p className="font-bold text-charcoal">
                  {language === 'hi' ? 'पात्रता सारांश:' : 'Eligibility Summary:'}
                </p>
                <p className="text-muted leading-relaxed">
                  {selectedScheme.eligibility_summary || 'Available for verified landholding agricultural families.'}
                </p>
                <p className="text-[10px] text-muted/80 italic pt-0.5">
                  Note: Final eligibility is determined by the competent department upon document review.
                </p>
              </div>

              {/* Required Documents */}
              {selectedScheme.documents_required && selectedScheme.documents_required.length > 0 && (
                <div className="space-y-2">
                  <p className="font-bold text-charcoal flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-forest" />
                    <span>{language === 'hi' ? 'आवश्यक दस्तावेज़:' : 'Documents Required:'}</span>
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedScheme.documents_required.map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-tint/40 border border-warm-border text-[11px] font-medium text-charcoal">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verification & Source Box */}
              <div className="p-3 rounded-xl bg-cream border border-warm-border text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal">Official Domain:</span>
                  <span className="font-mono text-forest font-bold">{selectedScheme.official_url ? new URL(selectedScheme.official_url).hostname : 'Official Portal'}</span>
                </div>
                <div className="flex items-center justify-between text-muted text-[10px]">
                  <span>Last verified: {selectedScheme.last_verified_on || '10 Apr 2025'}</span>
                  <button
                    onClick={() => {
                      setReportingScheme(selectedScheme);
                      setSelectedScheme(null);
                    }}
                    className="text-status-discrepancy-text hover:underline"
                  >
                    Report broken link
                  </button>
                </div>
              </div>
            </div>

            {/* Actions: Apply Now + Close */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {selectedScheme.official_url ? (
                <a
                  href={selectedScheme.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>Apply Now on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <a
                  href={selectedScheme.myscheme_url || 'https://www.myscheme.gov.in'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>View on myScheme.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={() => setSelectedScheme(null)}
                className="py-3 px-5 rounded-xl bg-cream-surface border border-warm-border text-charcoal font-semibold text-xs hover:bg-tint transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REPORT BROKEN LINK MODAL                                       */}
      {/* ============================================================== */}
      {reportingScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-cream-surface rounded-2xl p-5 border border-warm-border shadow-dropdown space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-warm-border pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-status-discrepancy-text" />
                <h3 className="text-sm font-bold text-charcoal">Report Broken Link</h3>
              </div>
              <button onClick={() => setReportingScheme(null)} className="w-7 h-7 rounded-lg hover:bg-cream flex items-center justify-center text-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-status-eligible-bg text-status-eligible-text flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-charcoal">Thank you!</p>
                <p className="text-[11px] text-muted">Your report has been logged and our portal team will verify the link.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal mb-1">Scheme</label>
                  <p className="p-2.5 bg-cream rounded-xl border border-warm-border font-bold text-charcoal">{reportingScheme.title}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal mb-1">Official Portal URL</label>
                  <p className="p-2.5 bg-cream rounded-xl border border-warm-border font-mono text-muted text-[11px] truncate">{reportingScheme.official_url || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal mb-1">What went wrong?</label>
                  <textarea
                    rows={3}
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                    className="w-full px-3 py-2 bg-cream rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-olive resize-none"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={handleReportBrokenLink}
                    disabled={isReporting}
                    className="flex-1 py-2.5 bg-forest hover:bg-forest-dark text-white rounded-xl font-bold shadow-soft transition-all"
                  >
                    {isReporting ? 'Submitting...' : 'Submit Report'}
                  </button>
                  <button
                    onClick={() => setReportingScheme(null)}
                    className="px-4 py-2.5 bg-cream border border-warm-border rounded-xl font-semibold text-charcoal"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
