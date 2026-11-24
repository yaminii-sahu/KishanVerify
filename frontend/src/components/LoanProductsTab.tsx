import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Upload, 
  Landmark, 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Filter, 
  Clock, 
  X,
  Info,
  Building2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchLoanProductsApi, LoanProductItem } from '../services/api';

export const LoanProductsTab: React.FC = () => {
  const { language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<LoanProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<number | null>(null);
  const [showIneligibleSection, setShowIneligibleSection] = useState<boolean>(false);

  // EMI Calculator Modal State
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calcProduct, setCalcProduct] = useState<LoanProductItem | null>(null);
  const [calcAmount, setCalcAmount] = useState<number>(100000);
  const [calcRate, setCalcRate] = useState<number>(4.0);
  const [calcTenureYears, setCalcTenureYears] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await fetchLoanProductsApi(farmer.farmerId);
        if (isMounted && res?.products) {
          setProducts(res.products);
        }
      } catch (err) {
        console.error('Failed to load loan products', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadProducts();
  }, [farmer.farmerId]);

  // Open Calculator
  const openCalculator = (product: LoanProductItem) => {
    setCalcProduct(product);
    let parsedRate = 7.0;
    if (product.interest_rate_rule.includes('4.0%') || product.interest_rate_rule.includes('4%')) {
      parsedRate = 4.0;
    } else if (product.interest_rate_rule.includes('6.0%') || product.interest_rate_rule.includes('6%')) {
      parsedRate = 6.0;
    } else if (product.interest_rate_rule.includes('8.0%') || product.interest_rate_rule.includes('8%')) {
      parsedRate = 8.0;
    } else if (product.interest_rate_rule.includes('8.50%')) {
      parsedRate = 8.5;
    }
    setCalcRate(parsedRate);

    let defaultAmt = 100000;
    if (product.max_amount_rule.includes('3,00,000')) defaultAmt = 150000;
    else if (product.max_amount_rule.includes('2,00,000')) defaultAmt = 100000;
    else if (product.max_amount_rule.includes('10,00,000')) defaultAmt = 400000;
    setCalcAmount(defaultAmt);

    let defaultTenure = 1;
    if (product.tenure.toLowerCase().includes('5') || product.tenure.toLowerCase().includes('7')) defaultTenure = 5;
    setCalcTenureYears(defaultTenure);

    setIsCalculatorOpen(true);
  };

  // Calculate monthly EMI
  const monthlyRate = calcRate / 12 / 100;
  const totalMonths = calcTenureYears * 12;
  const monthlyEmi = monthlyRate > 0 && totalMonths > 0
    ? Math.round((calcAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
    : Math.round(calcAmount / (totalMonths || 1));
  const totalPayment = monthlyEmi * totalMonths;
  const totalInterest = Math.max(0, totalPayment - calcAmount);

  // Filter products
  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(term) ||
      (p.name_hi && p.name_hi.includes(term)) ||
      p.purpose.toLowerCase().includes(term) ||
      p.product_code.toLowerCase().includes(term) ||
      p.lender_type.toLowerCase().includes(term);

    const matchesLevel = 
      levelFilter === 'all' || 
      (levelFilter === 'Central' && p.level === 'Central') ||
      (levelFilter === 'State' && p.level === 'State');

    const matchesPurpose = 
      purposeFilter === 'all' || 
      p.purpose.toLowerCase().includes(purposeFilter.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'likely' && p.eligibility.eligibility_status === 'Likely eligible') ||
      (statusFilter === 'possibly' && p.eligibility.eligibility_status === 'Possibly eligible (more info needed)') ||
      (statusFilter === 'unmet' && p.eligibility.eligibility_status === 'Not eligible');

    return matchesSearch && matchesLevel && matchesPurpose && matchesStatus;
  });

  const eligibleProducts = filteredProducts.filter(p => p.eligibility.eligibility_status !== 'Not eligible');
  const ineligibleProducts = filteredProducts.filter(p => p.eligibility.eligibility_status === 'Not eligible');

  const countLikely = products.filter(p => p.eligibility.eligibility_status === 'Likely eligible').length;
  const countPossibly = products.filter(p => p.eligibility.eligibility_status === 'Possibly eligible (more info needed)').length;
  const countIneligible = products.filter(p => p.eligibility.eligibility_status === 'Not eligible').length;

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="p-4 rounded-xl bg-forest/5 border border-forest/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-charcoal">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-charcoal">
              {language === 'hi'
                ? 'पात्रता सांकेतिक है — "आप पात्र हो सकते हैं"'
                : 'Informational Eligibility — "You may be eligible"'}
            </p>
            <p className="text-muted text-xs mt-0.5">
              {language === 'hi'
                ? 'ऋण पात्रता आपके भूमि अभिलेख और प्राथमिक फसल के आधार पर जांची गई है। अंतिम ऋण स्वीकृति और वास्तविक सीमा बैंक नियमों और सत्यापन के अधीन है।'
                : 'Eligibility is checked deterministically against your landholding and recorded criteria. Final sanction and terms depend on bank assessment.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-full bg-forest-bg text-forest font-semibold text-xs border border-forest/20">
            {countLikely} {language === 'hi' ? 'संभावित पात्र' : 'Likely Eligible'}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold text-xs border border-amber-200">
            {countPossibly} {language === 'hi' ? 'दस्तावेज अपेक्षित' : 'Docs Needed'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-cream-surface rounded-xl border border-warm-border p-4 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'hi' ? 'ऋण योजना, उद्देश्य या बैंक खोजें...' : 'Search loan products, purpose, or bank...'}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-warm-border focus:outline-none focus:ring-2 focus:ring-forest bg-warm-bg/40 text-charcoal"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Level Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              {language === 'hi' ? 'स्तर:' : 'Level:'}
            </span>
            {[
              { id: 'all', label: language === 'hi' ? 'सभी' : 'All' },
              { id: 'Central', label: language === 'hi' ? 'केंद्रीय' : 'Central' },
              { id: 'State', label: language === 'hi' ? 'छत्तीसगढ़' : 'Chhattisgarh' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setLevelFilter(btn.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  levelFilter === btn.id
                    ? 'bg-forest text-cream'
                    : 'bg-warm-bg text-charcoal hover:bg-tint border border-warm-border'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Purpose and Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-warm-border/60 text-xs">
          <span className="font-semibold text-muted">{language === 'hi' ? 'उद्देश्य:' : 'Purpose:'}</span>
          {[
            { id: 'all', label: language === 'hi' ? 'सभी उद्देश्य' : 'All' },
            { id: 'Crop', label: language === 'hi' ? 'फसल उत्पादन' : 'Crop' },
            { id: 'Mechanization', label: language === 'hi' ? 'ट्रैक्टर / यंत्र' : 'Mechanization' },
            { id: 'Irrigation', label: language === 'hi' ? 'सिंचाई / सोलर' : 'Irrigation & Solar' },
            { id: 'Dairy', label: language === 'hi' ? 'डेयरी व पशुपालन' : 'Dairy' },
            { id: 'Fisheries', label: language === 'hi' ? 'मत्स्य पालन' : 'Fisheries' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setPurposeFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                purposeFilter === cat.id
                  ? 'bg-forest/15 text-forest font-bold border border-forest/30'
                  : 'bg-cream-surface text-muted hover:text-charcoal border border-warm-border/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Eligible Products Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-muted">
          <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">{language === 'hi' ? 'ऋण योजनाएं लोड हो रही हैं...' : 'Loading loan products...'}</p>
        </div>
      ) : eligibleProducts.length === 0 ? (
        <div className="p-8 text-center bg-cream-surface rounded-xl border border-warm-border text-muted">
          <p className="text-sm font-semibold">{language === 'hi' ? 'कोई ऋण योजना नहीं मिली।' : 'No matching loan products found.'}</p>
          <button 
            onClick={() => { setSearchTerm(''); setLevelFilter('all'); setPurposeFilter('all'); setStatusFilter('all'); }} 
            className="mt-3 text-xs text-forest hover:underline font-semibold"
          >
            {language === 'hi' ? 'फ़िल्टर हटाएं' : 'Clear all filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {eligibleProducts.map((p) => {
            const isExpanded = expandedCardId === p.id;
            const elig = p.eligibility;
            const isLikely = elig.eligibility_status === 'Likely eligible';

            return (
              <div 
                key={p.id}
                className="bg-cream-surface rounded-xl border border-warm-border hover:border-forest/40 transition-all shadow-soft flex flex-col justify-between overflow-hidden"
              >
                {/* Top strip with Level and Status Badge */}
                <div className="p-4 sm:p-5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-warm-bg text-muted border border-warm-border">
                        {p.product_code}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
                        {p.level === 'State' ? (language === 'hi' ? 'छत्तीसगढ़ राज्य' : 'Chhattisgarh') : (language === 'hi' ? 'केंद्रीय योजना' : 'Central Scheme')}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                        {language === 'hi' ? p.purpose_hi || p.purpose : p.purpose}
                      </span>
                    </div>

                    {/* Eligibility Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                      isLikely 
                        ? 'bg-forest-bg text-forest border-forest/30' 
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {isLikely ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {language === 'hi' ? elig.eligibility_label_hi : elig.eligibility_label}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-base text-charcoal leading-snug">
                    {language === 'hi' ? p.name_hi || p.name : p.name}
                  </h3>
                  <p className="text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">
                    {language === 'hi' ? p.description_hi || p.description : p.description}
                  </p>

                  {/* Key Financial Terms Box */}
                  <div className="mt-3.5 p-3 rounded-lg bg-warm-bg/70 border border-warm-border/70 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted block text-[10px] font-medium">{language === 'hi' ? 'ब्याज दर / छूट' : 'Interest Rate'}</span>
                      <span className="font-bold text-forest text-xs leading-tight block mt-0.5">
                        {p.interest_rate_rule}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] font-medium">{language === 'hi' ? 'अधिकतम साख सीमा' : 'Credit Limit'}</span>
                      <span className="font-bold text-charcoal text-xs leading-tight block mt-0.5">
                        {p.max_amount_rule}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] font-medium">{language === 'hi' ? 'अवधि' : 'Tenure'}</span>
                      <span className="text-charcoal font-medium text-xs block mt-0.5">{p.tenure}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] font-medium">{language === 'hi' ? 'बंधक / ज़मानत' : 'Collateral'}</span>
                      <span className="text-charcoal font-medium text-xs block mt-0.5">{p.collateral_rule}</span>
                    </div>
                  </div>

                  {/* Matched Criteria */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-bold text-charcoal block">
                      {language === 'hi' ? 'पात्रता मिलान आधार:' : 'Why you may be eligible:'}
                    </span>
                    <ul className="space-y-1">
                      {(language === 'hi' ? elig.matched_rules_hi : elig.matched_rules).slice(0, isExpanded ? 6 : 2).map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs text-charcoal">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest flex-shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Documents Alert if applicable */}
                  {elig.missing_documents.length > 0 && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
                      <div className="flex items-center justify-between gap-1 mb-1 font-semibold">
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          {language === 'hi' ? 'दस्तावेज़ अपेक्षित:' : 'Documents Needed in Vault:'}
                        </span>
                        <button
                          onClick={() => navigate('/farmer/documents')}
                          className="text-[11px] font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-0.5"
                        >
                          <Upload className="w-3 h-3" />
                          {language === 'hi' ? 'अपलोड करें' : 'Upload'}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(language === 'hi' ? elig.missing_documents_hi : elig.missing_documents).map((doc, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white/80 border border-amber-300 text-[11px] font-medium">
                            {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Expandable Section: Documents Checklist & Source Citations */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-warm-border space-y-3 text-xs">
                      {/* Required Documents Checklist */}
                      <div>
                        <span className="font-bold text-charcoal block mb-1.5">
                          {language === 'hi' ? 'आवश्यक दस्तावेज़ चेकलिस्ट:' : 'Required Documents Checklist:'}
                        </span>
                        <div className="space-y-1.5">
                          {elig.required_documents.map((doc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-warm-bg/40 border border-warm-border/60">
                              <span className="text-charcoal font-medium flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-muted" />
                                {language === 'hi' ? doc.document_name_hi || doc.document_name : doc.document_name}
                              </span>
                              {doc.is_available ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {language === 'hi' ? 'उपलब्ध' : 'In Vault'}
                                </span>
                              ) : (
                                <button
                                  onClick={() => navigate('/farmer/documents')}
                                  className="text-[11px] font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  {language === 'hi' ? 'अपलोड करें' : 'Upload'}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Source Citation */}
                      <div className="p-2.5 rounded-lg bg-cream-surface border border-warm-border text-[11px] text-muted space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-charcoal flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                            {language === 'hi' ? 'वैधानिक स्रोत आधार:' : 'Statutory Source Authority:'}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-forest/10 text-forest text-[10px] font-bold">
                            {language === 'hi' ? 'सत्यापित' : 'Verified'}
                          </span>
                        </div>
                        <p className="text-charcoal font-medium">{p.source_name}</p>
                        <p className="text-muted text-[10px]">{p.source_document}</p>
                        <div className="flex items-center justify-between pt-1 text-[10px]">
                          <span>{language === 'hi' ? 'सत्यापन तिथि:' : 'Verified on:'} {p.last_verified_on}</span>
                          {p.official_url && (
                            <a 
                              href={p.official_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-forest hover:underline font-bold flex items-center gap-0.5"
                            >
                              <span>{language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom Strip */}
                <div className="p-3 bg-warm-bg/40 border-t border-warm-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openCalculator(p)}
                      className="px-3 py-1.5 rounded-lg bg-cream-surface hover:bg-tint border border-warm-border text-charcoal font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-soft"
                    >
                      <Calculator className="w-3.5 h-3.5 text-forest" />
                      <span>{language === 'hi' ? 'किस्त कैलकुलेटर' : 'EMI Calc'}</span>
                    </button>
                    <button
                      onClick={() => setExpandedCardId(isExpanded ? null : p.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-charcoal flex items-center gap-1"
                    >
                      <span>{isExpanded ? (language === 'hi' ? 'कम देखें' : 'Less') : (language === 'hi' ? 'विवरण' : 'Details')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {p.official_url ? (
                    <a
                      href={p.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-lg bg-forest text-cream font-semibold text-xs hover:bg-forest-light transition-colors flex items-center gap-1.5 shadow-soft"
                    >
                      <span>{language === 'hi' ? 'आवेदन दिशा-निर्देश' : 'Apply on Portal'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <button
                      onClick={() => navigate('/farmer/offices')}
                      className="px-3.5 py-1.5 rounded-lg bg-forest text-cream font-semibold text-xs hover:bg-forest-light transition-colors flex items-center gap-1.5 shadow-soft"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'नजदीकी बैंक शाखा' : 'Nearest Branch'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ineligible Loan Schemes Collapsible Section */}
      {ineligibleProducts.length > 0 && (
        <div className="mt-8 border border-warm-border rounded-xl bg-warm-bg/20 overflow-hidden">
          <button
            onClick={() => setShowIneligibleSection(!showIneligibleSection)}
            className="w-full p-4 flex items-center justify-between text-left text-charcoal hover:bg-tint/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted" />
              <span className="font-bold text-sm text-charcoal">
                {language === 'hi' ? 'अन्य ऋण योजनाएं (वर्तमान में मानदंड अपूर्ण)' : 'Other Loan Products (Criteria Not Currently Met)'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-warm-bg text-muted font-bold text-xs border border-warm-border">
                {ineligibleProducts.length}
              </span>
            </div>
            {showIneligibleSection ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
          </button>

          {showIneligibleSection && (
            <div className="p-4 pt-0 border-t border-warm-border/60 divide-y divide-warm-border/60 space-y-3">
              {ineligibleProducts.map((p) => (
                <div key={p.id} className="pt-3 first:pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-charcoal text-sm">
                      {language === 'hi' ? p.name_hi || p.name : p.name}
                    </h4>
                    <p className="text-muted text-xs mt-0.5">
                      {p.max_amount_rule} • {p.interest_rate_rule}
                    </p>
                    <div className="mt-1 space-y-0.5 text-xs text-amber-900 font-medium">
                      {(language === 'hi' ? p.eligibility.unmet_rules_hi : p.eligibility.unmet_rules).map((unmet, i) => (
                        <p key={i} className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-700" />
                          <span>{unmet}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                  {p.official_url && (
                    <a
                      href={p.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest hover:underline font-semibold flex items-center gap-1 text-xs whitespace-nowrap"
                    >
                      <span>{language === 'hi' ? 'दिशानिर्देश देखें' : 'View Guidelines'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Indicative EMI Calculator Modal */}
      {isCalculatorOpen && calcProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-cream-surface rounded-2xl max-w-md w-full p-5 sm:p-6 border border-warm-border shadow-modal relative">
            <button
              onClick={() => setIsCalculatorOpen(false)}
              className="absolute right-4 top-4 text-muted hover:text-charcoal p-1 rounded-full hover:bg-tint"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-forest" />
              <h3 className="text-base font-bold text-charcoal">
                {language === 'hi' ? 'ऋण किस्त (EMI) कैलकुलेटर' : 'Indicative Loan EMI Calculator'}
              </h3>
            </div>
            <p className="text-xs text-muted mb-4">
              {language === 'hi' ? calcProduct.name_hi || calcProduct.name : calcProduct.name}
            </p>

            {/* Inputs */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">
                  {language === 'hi' ? 'ऋण राशि (₹):' : 'Loan Amount (₹):'}
                </label>
                <input
                  type="number"
                  step="5000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(1000, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-bg/40 font-bold text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    {language === 'hi' ? 'ब्याज दर (%):' : 'Interest Rate (%):'}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={calcRate}
                    onChange={(e) => setCalcRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-bg/40 font-bold text-forest"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal mb-1">
                    {language === 'hi' ? 'अवधि (वर्ष):' : 'Tenure (Years):'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={calcTenureYears}
                    onChange={(e) => setCalcTenureYears(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg border border-warm-border bg-warm-bg/40 font-bold text-charcoal"
                  />
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="p-3.5 rounded-xl bg-forest/10 border border-forest/20 mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted font-medium">{language === 'hi' ? 'मासिक अनुमानित किस्त:' : 'Estimated Monthly EMI:'}</span>
                  <span className="text-lg font-extrabold text-forest">₹{monthlyEmi.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-forest/15">
                  <span className="text-muted">{language === 'hi' ? 'कुल ब्याज देय:' : 'Total Interest Payable:'}</span>
                  <span className="font-bold text-charcoal">₹{totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted">{language === 'hi' ? 'कुल पुनर्भुगतान:' : 'Total Repayment:'}</span>
                  <span className="font-bold text-charcoal">₹{totalPayment.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-muted italic text-center mt-2">
                {language === 'hi'
                  ? '* यह गणना केवल सांकेतिक है। वास्तविक किस्त फसल कटाई चक्र एवं बैंक पुनर्भुगतान अनुसूची पर निर्भर करती है।'
                  : '* Figures are indicative. Actual schedules may be seasonal or half-yearly depending on bank sanction terms.'}
              </p>
            </div>

            <button
              onClick={() => setIsCalculatorOpen(false)}
              className="w-full mt-4 py-2.5 rounded-lg bg-forest text-cream font-semibold text-xs hover:bg-forest-light transition-colors"
            >
              {language === 'hi' ? 'बंद करें' : 'Close Calculator'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
