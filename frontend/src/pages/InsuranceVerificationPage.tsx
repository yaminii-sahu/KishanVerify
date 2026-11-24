import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  HelpCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyInsuranceApi } from '../services/api';
import { ClaimTimelineView } from '../components/ClaimTimelineView';
import { ClaimCalculationCard } from '../components/ClaimCalculationCard';
import { BasisOfCheckCard } from '../components/BasisOfCheckCard';
import { ClaimReasonsAndCoverageCard } from '../components/ClaimReasonsAndCoverageCard';

export const InsuranceVerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Inputs
  const [insuranceRef, setInsuranceRef] = useState('INS-2024-7711');
  const [crop, setCrop] = useState('Paddy (Kharif)');
  const [claimExpected, setClaimExpected] = useState<number>(30000);
  const [amountReceived, setAmountReceived] = useState<number>(20000);
  const [claimStatus, setClaimStatus] = useState('Under Review');
  const [activeTab, setActiveTab] = useState<'verify' | 'timeline'>('verify');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyInsuranceApi({
        insurance_ref: insuranceRef,
        crop,
        claim_amount_expected: claimExpected,
        amount_received: amountReceived,
        claim_status: claimStatus,
        farmer_id: farmer.farmerId,
      });

      setResult(res);

      if (res.status === 'Verified') {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#4E6E3D', '#698E59', '#FAF8F2'],
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-10 h-10 rounded-2xl bg-white border border-warm-border flex items-center justify-center text-gray-700 hover:bg-sage-50 transition-colors shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-gray-800" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {language === 'hi' ? 'फसल बीमा दावा सत्यापन' : 'Crop Insurance Claim Verification'}
            </h1>
            <p className="text-xs text-gray-500">
              Verify PMFBY crop insurance indemnity settlements
            </p>
          </div>
        </div>

        {/* Preset quick test */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => {
              setClaimExpected(30000);
              setAmountReceived(20000);
              setClaimStatus('Under Review');
              setResult(null);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            Load Under Review Case
          </button>
          <button
            onClick={() => {
              setClaimExpected(30000);
              setAmountReceived(30000);
              setClaimStatus('Settled');
              setResult(null);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-300 hover:bg-sage-200 transition-colors"
          >
            Load Full Settlement
          </button>
        </div>
      </div>

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-warm-border pb-1">
        <button
          onClick={() => setActiveTab('verify')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'verify'
              ? 'bg-forest text-white shadow-soft'
              : 'bg-white text-charcoal/70 hover:bg-tint/40 border border-warm-border/70'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'hi' ? 'दावा सत्यापन एवं पात्रता' : 'Verify Claim & Entitlement'}</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-forest text-white shadow-soft'
              : 'bg-white text-charcoal/70 hover:bg-tint/40 border border-warm-border/70'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{language === 'hi' ? 'दावा प्रगति समयरेखा एवं विलंब' : 'Claim Timeline & Status'}</span>
        </button>
      </div>

      {activeTab === 'timeline' ? (
        <ClaimTimelineView claimRef={insuranceRef} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-4">
          <div className="border-b border-warm-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">
                Insurance Claim Particulars
              </h2>
              <p className="text-xs text-muted">
                Pradhan Mantri Fasal Bima Yojana (PMFBY) claim tracking
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Policy / Claim Reference
                </label>
                <input
                  type="text"
                  value={insuranceRef}
                  onChange={(e) => setInsuranceRef(e.target.value)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Insured Crop
                </label>
                <input
                  type="text"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Assessed Claim Entitlement (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="100"
                  value={claimExpected}
                  onChange={(e) => setClaimExpected(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Amount Received into Account (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="100"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Portal Claim Status
              </label>
              <select
                value={claimStatus}
                onChange={(e) => setClaimStatus(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
              >
                <option value="Under Review">Under Review (Assessment in progress)</option>
                <option value="Settled">Settled (Disbursement completed)</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Analyzing claim payout...</span>
                ) : (
                  <>
                    <span>Verify Claim Settlement</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Result */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <ClaimCalculationCard result={result} />

              <BasisOfCheckCard
                checkType="insurance"
                sources={result.sources}
                flaggedRuleCode={result.reason_codes?.[0] || 'PMFBY-REV-GUIDELINES-2020'}
                flaggedRuleThreshold={`±₹${result.tolerance?.toFixed(0) || 100}`}
                flaggedRuleReasonEn={result.explanation}
                flaggedRuleReasonHi={result.explanation_hi}
                isFlagged={result.is_flagged}
                arithmetic={{
                  crop: result.crop,
                  expected: result.claim_amount_calculated ?? result.claim_amount_expected ?? 0,
                  actual: result.amount_received ?? 0,
                  difference: result.difference ?? 0,
                }}
              />

              <ClaimReasonsAndCoverageCard result={result} />

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => navigate('/farmer/reports')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Insurance Report</span>
                </button>

                <button
                  onClick={() => navigate('/farmer/grievance')}
                  className="w-full py-3 px-6 rounded-2xl bg-white border border-warm-border hover:bg-warm-bg text-gray-800 font-semibold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
                >
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>Inquire with District Officer</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-warm-border text-center flex flex-col items-center justify-center min-h-[360px] text-gray-400">
              <div className="w-16 h-16 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                Insurance Check Ready
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-gray-500">
                Verify assessed loss against actual bank disbursement.
              </p>
            </div>
          )}
        </div>

      </div>
      )}

    </div>
  );
};
