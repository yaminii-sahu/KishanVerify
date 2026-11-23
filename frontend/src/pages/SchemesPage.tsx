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
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { checkEligibilityApi } from '../services/api';

export const SchemesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Subsidy' | 'Insurance' | 'Loan'>('All');
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

  // Checker form state
  const [state, setState] = useState('Chhattisgarh');
  const [district, setDistrict] = useState('Durg');
  const [crop, setCrop] = useState('Paddy');
  const [landArea, setLandArea] = useState(3.0);
  const [farmerCategory, setFarmerCategory] = useState('Small Farmer');
  const [loanStatus, setLoanStatus] = useState('Yes');
  
  const [isChecking, setIsChecking] = useState(false);
  const [evaluatedSchemes, setEvaluatedSchemes] = useState<any[]>([
    {
      id: 'PM_KISAN',
      title: 'PM-KISAN Samman Nidhi',
      title_hi: 'प्रधानमंत्री किसान सम्मान निधि',
      category: 'Subsidy',
      description: 'Income support of ₹6,000/year in three equal installments directly to bank account.',
      description_hi: 'सभी पात्र किसान परिवारों को ₹6,000 प्रति वर्ष की आय सहायता।',
      benefits: '₹6,000 / year',
      benefits_hi: '₹6,000 / वर्ष',
      eligibility_status: 'Eligible',
      deadline: 'Apply by 31 Dec 2025'
    },
    {
      id: 'PMFBY',
      title: 'Pradhan Mantri Fasal Bima Yojana',
      title_hi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
      category: 'Insurance',
      description: 'Comprehensive crop insurance against drought, floods, pests and unseasonal weather.',
      description_hi: 'सूखा, बाढ़ और कीट हमलों से फसल सुरक्षा हेतु व्यापक बीमा।',
      benefits: 'Up to ₹1,50,000 coverage',
      benefits_hi: '₹1,50,000 तक बीमा',
      eligibility_status: 'Eligible',
      deadline: 'Apply by 31 Mar 2026'
    },
    {
      id: 'KCC',
      title: 'Kisan Credit Card (KCC)',
      title_hi: 'किसान क्रेडिट कार्ड (KCC)',
      category: 'Loan',
      description: 'Short-term crop loan at subsidized interest rate of 4% with prompt repayment incentive.',
      description_hi: '4% रियायती ब्याज दर पर अल्पकालिक फसली ऋण।',
      benefits: 'Credit limit up to ₹3,00,000',
      benefits_hi: '₹3,00,000 तक ऋण सीमा',
      eligibility_status: 'Eligible',
      deadline: 'Apply by 31 Dec 2025'
    },
    {
      id: 'CG_INPUT_SUBSIDY',
      title: 'Input Subsidy Scheme',
      title_hi: 'कृषि इनपुट सब्सिडी योजना',
      category: 'Subsidy',
      description: 'Subsidy on certified quality seeds, fertilizers, and modern farm machinery.',
      description_hi: 'प्रमाणित बीजों, उर्वरकों और कृषि यंत्रों पर सब्सिडी सहायता।',
      benefits: '₹9,000 / acre',
      benefits_hi: '₹9,000 / एकड़',
      eligibility_status: 'Possibly Eligible',
      deadline: 'Check details'
    }
  ]);

  const categories = ['All', 'Subsidy', 'Insurance', 'Loan'] as const;

  // Run eligibility check
  const handleRunEligibilityCheck = async () => {
    setIsChecking(true);
    try {
      const res = await checkEligibilityApi({
        state,
        district,
        crop,
        land_holding_acres: landArea,
        farmer_category: farmerCategory,
        loan_status: loanStatus,
      });
      if (res && res.schemes) {
        setEvaluatedSchemes(res.schemes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChecking(false);
    }
  };

  const filteredSchemes = evaluatedSchemes.filter((s) => {
    if (activeCategory === 'All') return true;
    return s.category.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
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
            {language === 'hi' ? 'योजना पात्रता परीक्षक' : 'Scheme Eligibility Checker'}
          </h1>
          <p className="text-xs text-muted">
            {language === 'hi' ? 'देखें कि आप किन सरकारी योजनाओं के लिए पात्र हैं' : 'Find out which government schemes you may be eligible for.'}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* ELIGIBILITY CHECKER FORM (2-col grid on desktop per Image A)   */}
      {/* ============================================================== */}
      <div className="bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-5">
        <div className="border-b border-warm-border pb-3">
          <h2 className="text-base font-bold text-charcoal">
            {language === 'hi' ? 'आपका कृषि विवरण' : 'Your Details'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {language === 'hi' ? 'पात्रता नियमों के अनुसार योजनाएं निर्धारित की जाती हैं' : 'Rules are verified deterministically against official department guidelines.'}
          </p>
        </div>

        {/* 2-Column Inputs Grid (Image A) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Punjab">Punjab</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Durg">Durg</option>
              <option value="Raipur">Raipur</option>
              <option value="Bilaspur">Bilaspur</option>
              <option value="Rajnandgaon">Rajnandgaon</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Paddy">Paddy</option>
              <option value="Wheat">Wheat</option>
              <option value="Maize">Maize</option>
              <option value="Soybean">Soybean</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Land Holding (Acres)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={landArea}
              onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Farmer Category
            </label>
            <select
              value={farmerCategory}
              onChange={(e) => setFarmerCategory(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Small Farmer">Small Farmer (1-2 Ha)</option>
              <option value="Marginal Farmer">Marginal Farmer (&lt; 1 Ha)</option>
              <option value="Large Farmer">Large Farmer (&gt; 2 Ha)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Loan Status
            </label>
            <select
              value={loanStatus}
              onChange={(e) => setLoanStatus(e.target.value)}
              className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
            >
              <option value="Yes">Yes (Active KCC)</option>
              <option value="No">No (No active loan)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={handleRunEligibilityCheck}
            disabled={isChecking}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs shadow-soft transition-all min-h-[46px]"
          >
            {isChecking ? 'Checking Eligibility...' : 'Check Eligible Schemes'}
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* FILTER CHIPS (Mobile Image B & Desktop)                        */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-[38px] ${
                isActive
                  ? 'bg-forest text-white shadow-soft'
                  : 'bg-cream-surface text-muted border border-warm-border hover:bg-tint/40'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ============================================================== */}
      {/* SCHEMES LIST (Image A & Image B)                               */}
      {/* ============================================================== */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-charcoal">
          {language === 'hi' ? 'आप निम्नलिखित योजनाओं के लिए पात्र हो सकते हैं:' : 'You may be eligible for'}
        </h3>

        {filteredSchemes.map((scheme) => (
          <div
            key={scheme.id}
            onClick={() => setSelectedScheme(scheme)}
            className="bg-cream-surface rounded-2xl p-4 sm:p-5 border border-warm-border hover:border-olive hover:shadow-card transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-soft"
          >
            <div className="flex items-start gap-3.5">
              {/* Tinted icon box */}
              <div className="w-10 h-10 rounded-xl bg-tint text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-colors">
                {scheme.category === 'Loan' ? (
                  <Landmark className="w-5 h-5" strokeWidth={1.75} />
                ) : scheme.category === 'Insurance' ? (
                  <ShieldCheck className="w-5 h-5" strokeWidth={1.75} />
                ) : (
                  <Coins className="w-5 h-5" strokeWidth={1.75} />
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-charcoal group-hover:text-forest transition-colors leading-tight">
                  {language === 'hi' ? scheme.title_hi : scheme.title}
                </h4>

                <p className="text-xs text-muted line-clamp-1 leading-snug">
                  {language === 'hi' ? scheme.description_hi : scheme.description}
                </p>

                {scheme.deadline && (
                  <span className="inline-block text-[11px] text-muted font-medium pt-0.5">
                    {scheme.deadline}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <StatusBadge status={scheme.eligibility_status} size="sm" />
              <ChevronRight className="w-4 h-4 text-muted group-hover:text-forest group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
