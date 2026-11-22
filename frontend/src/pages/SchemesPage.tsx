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
import { Scheme } from '../types';

export const SchemesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<'All' | 'Subsidy' | 'Insurance' | 'Loan'>('All');
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);

  // Checker form state (pre-filled with Ramesh Kumar's profile from mockups)
  const [state, setState] = useState('Chhattisgarh');
  const [district, setDistrict] = useState('Durg');
  const [crop, setCrop] = useState('Paddy');
  const [landArea, setLandArea] = useState(3.0);
  const [farmerCategory, setFarmerCategory] = useState('Small Farmer');
  const [loanStatus, setLoanStatus] = useState('Yes');
  
  const [isChecking, setIsChecking] = useState(false);
  const [evaluatedSchemes, setEvaluatedSchemes] = useState<any[]>([]);
  const [eligibilityResult, setEligibilityResult] = useState<any | null>(null);

  const categories = ['All', 'Subsidy', 'Insurance', 'Loan'] as const;

  // Run eligibility check on initial mount
  useEffect(() => {
    handleRunEligibilityCheck();
  }, []);

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
      setEligibilityResult(res);
      setEvaluatedSchemes(res.schemes || []);
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
      
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/farmer')}
          className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {language === 'hi' ? 'मेरी सरकारी योजनाएं' : 'My Schemes'}
          </h1>
          <p className="text-xs text-gray-500">
            Government schemes you may be eligible for
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all shadow-soft ${
                isActive
                  ? 'bg-sage-600 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-warm-border hover:bg-warm-bg'
              }`}
            >
              {cat === 'All' ? 'All Schemes' : cat}
            </button>
          );
        })}
      </div>

      {/* Schemes List Cards (Matching the design cards) */}
      <div className="space-y-3.5">
        {filteredSchemes.map((scheme) => {
          const isEligible = scheme.eligibility_status === 'Eligible';
          return (
            <div
              key={scheme.id}
              onClick={() => setSelectedScheme(scheme)}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-warm-border hover:border-sage-400 hover:shadow-card transition-all cursor-pointer flex items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                {/* Scheme Icon */}
                <div className="w-11 h-11 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center shrink-0 group-hover:bg-sage-600 group-hover:text-white transition-colors">
                  {scheme.category === 'Loan' ? (
                    <Landmark className="w-5 h-5" />
                  ) : scheme.category === 'Insurance' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-sage-700 transition-colors">
                      {language === 'hi' ? scheme.title_hi : scheme.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-1">
                    {language === 'hi' ? scheme.description_hi : scheme.description}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-500">
                    <span className="font-semibold text-sage-800">
                      {language === 'hi' ? scheme.benefits_hi : scheme.benefits}
                    </span>
                    <span>•</span>
                    <span className="text-gray-400">{scheme.deadline}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={scheme.eligibility_status} size="sm" />
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-sage-700 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Scheme Eligibility Checker Form (Matches design mockup) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-5">
        <div className="border-b border-warm-border pb-4">
          <div className="flex items-center gap-2 text-sage-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-sage-600" />
            <span>Rule-Based Eligibility Engine</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">
            Scheme Eligibility Checker
          </h2>
          <p className="text-xs text-gray-500">
            Find out which government schemes and subsidies you may be eligible for.
          </p>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Maharashtra">Maharashtra</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              District
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="Durg">Durg</option>
              <option value="Raipur">Raipur</option>
              <option value="Bilaspur">Bilaspur</option>
              <option value="Rajnandgaon">Rajnandgaon</option>
              <option value="Dhamtari">Dhamtari</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="Paddy">Paddy (धान)</option>
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Maize">Maize (मक्का)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Pulses">Pulses (दलहन)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Land Holding (Acres)
            </label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              value={landArea}
              onChange={(e) => setLandArea(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Farmer Category
            </label>
            <select
              value={farmerCategory}
              onChange={(e) => setFarmerCategory(e.target.value)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="Small Farmer">Small Farmer (1 - 2 Hectares / 2.5 - 5 Acres)</option>
              <option value="Marginal Farmer">Marginal Farmer (&lt; 1 Hectare / &lt; 2.5 Acres)</option>
              <option value="Large Farmer">Large Farmer (&gt; 2 Hectares / &gt; 5 Acres)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Active Agricultural Loan
            </label>
            <select
              value={loanStatus}
              onChange={(e) => setLoanStatus(e.target.value)}
              className="w-full px-4 py-3 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="Yes">Yes (Have KCC / Crop Loan)</option>
              <option value="No">No (No active loan)</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
        <button
          onClick={handleRunEligibilityCheck}
          disabled={isChecking}
          className="w-full h-12 py-3 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-60"
        >
          {isChecking ? (
            <span>Evaluating rules against policy database...</span>
          ) : (
            <span>Check Eligible Schemes</span>
          )}
        </button>

        {/* Mandatory Transparency Disclaimer (From Blueprint) */}
        <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border text-xs text-gray-500 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sage-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-gray-700">Transparency Notice:</strong> Eligibility results are rule-based recommendations and represent potential eligibility. They are not guaranteed approvals. Final approval is subject to document scrutiny by competent authorities.
          </p>
        </div>
      </div>

      {/* Scheme Detail Modal */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-warm-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
                  {selectedScheme.category} Scheme
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'hi' ? selectedScheme.title_hi : selectedScheme.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedScheme(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Eligibility Assessment</p>
                <p className="text-sm font-bold text-sage-900">
                  {selectedScheme.eligibility_status} (Potentially)
                </p>
              </div>
              <StatusBadge status={selectedScheme.eligibility_status} size="sm" />
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {language === 'hi' ? selectedScheme.description_hi : selectedScheme.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Entitlement Benefit
              </h4>
              <div className="p-3 rounded-2xl bg-warm-bg border border-warm-border font-semibold text-sm text-gray-900">
                {language === 'hi' ? selectedScheme.benefits_hi : selectedScheme.benefits}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Documents Required
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {(selectedScheme.documents_required || []).map((doc: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
              <Calendar className="w-4 h-4 text-sage-600" />
              <span>Deadline: <strong>{selectedScheme.deadline}</strong></span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedScheme(null)}
                className="w-full py-3 rounded-2xl bg-sage-600 text-white font-semibold text-sm shadow-soft hover:bg-sage-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
