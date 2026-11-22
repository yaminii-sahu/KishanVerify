import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Landmark, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Calculator, 
  Info,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyLoanApi } from '../services/api';

export const LoanVerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Form Inputs (Blueprint: Approved 80,000, Disbursed 70,000, Deductions 5,000)
  const [bankName, setBankName] = useState('State Bank of India');
  const [loanAccountRef, setLoanAccountRef] = useState('SBIN*******1234');
  const [loanType, setLoanType] = useState('Crop Loan');
  const [approvedAmount, setApprovedAmount] = useState<number>(80000);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(70000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [deductions, setDeductions] = useState<number>(5000);
  const [loanDate, setLoanDate] = useState('12-03-2024');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyLoanApi({
        bank_name: bankName,
        loan_account_ref: loanAccountRef,
        loan_type: loanType,
        approved_amount: approvedAmount,
        disbursed_amount: disbursedAmount,
        interest_rate: interestRate,
        deductions: deductions,
        loan_date: loanDate,
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

  const loadSampleMatch = () => {
    setApprovedAmount(80000);
    setDisbursedAmount(80000);
    setDeductions(0);
    setResult(null);
  };

  const loadSampleDiscrepancy = () => {
    setApprovedAmount(80000);
    setDisbursedAmount(70000);
    setDeductions(5000);
    setResult(null);
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
              {language === 'hi' ? 'ऋण सत्यापन' : 'Loan Verification'}
            </h1>
            <p className="text-xs text-gray-500">
              Check if your loan details match the expected sanction amount
            </p>
          </div>
        </div>

        {/* Quick Sample toggles for judges */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={loadSampleDiscrepancy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-kisan-lightred text-kisan-red border border-kisan-red/30 hover:bg-red-100 transition-colors"
          >
            Load ₹10k Discrepancy
          </button>
          <button
            onClick={loadSampleMatch}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-300 hover:bg-sage-200 transition-colors"
          >
            Load Verified Match
          </button>
        </div>
      </div>

      {/* Grid: Form on left, Result on right on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-4">
          <div className="border-b border-warm-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                Enter Loan Details
              </h2>
              <p className="text-xs text-gray-500">
                Inputs are verified deterministically without altering bank records
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="Chhattisgarh Rajya Gramin Bank">Chhattisgarh Rajya Gramin Bank</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="Punjab National Bank">Punjab National Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Loan Account Reference
                </label>
                <input
                  type="text"
                  value={loanAccountRef}
                  onChange={(e) => setLoanAccountRef(e.target.value)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Approved Amount (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Disbursed Amount (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={disbursedAmount}
                  onChange={(e) => setDisbursedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deductions (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={deductions}
                  onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Loan Date
                </label>
                <input
                  type="text"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-warm-bg rounded-2xl border border-warm-border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500"
                >
                  <option value="Crop Loan">Crop Loan (KCC)</option>
                  <option value="Term Loan">Agricultural Term Loan</option>
                  <option value="Tractor Loan">Farm Mechanization Loan</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 py-3 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Checking arithmetic...</span>
                ) : (
                  <>
                    <span>Check for Discrepancies</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Result Pane (5 cols on lg) - Matches screenshot layout */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-5 animate-in fade-in duration-300">
              
              {/* Alert Banner Card */}
              {result.is_flagged ? (
                <div className="p-4 rounded-2xl bg-kisan-lightred border border-kisan-red/25 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-300 text-kisan-red flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 text-kisan-red" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-kisan-red">
                      {result.status_label}
                    </h3>
                    <p className="text-xs text-red-800 mt-0.5 leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EDF7ED] border border-[#C8E6C9] flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 border border-green-300 text-[#2E7D32] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#2E7D32]">
                      Your loan details look good!
                    </h3>
                    <p className="text-xs text-green-800 mt-0.5 leading-relaxed">
                      No major discrepancy found. Disbursed amount matches approved sanction limits.
                    </p>
                  </div>
                </div>
              )}

              {/* Arithmetic Breakdown Table */}
              <div className="divide-y divide-warm-border border-y border-warm-border py-1">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-gray-500">Approved Amount</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ₹ {result.approved_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-gray-500">Disbursed Amount</span>
                  <span className="font-bold text-gray-900 text-sm">
                    ₹ {result.disbursed_amount.toLocaleString()}
                  </span>
                </div>
                {result.deductions > 0 && (
                  <div className="flex items-center justify-between py-2.5 text-xs">
                    <span className="text-gray-500">Deductions (Fees/Insurance)</span>
                    <span className="font-semibold text-gray-700">
                      ₹ {result.deductions.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 text-xs">
                  <span className="font-bold text-gray-900">Difference</span>
                  <span
                    className={`font-extrabold text-base ${
                      result.difference > 0 ? 'text-kisan-red' : 'text-[#2E7D32]'
                    }`}
                  >
                    ₹ {result.difference.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Possible Reasons list (from Blueprint) */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Possible Reasons (Informational)
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  {result.reasons.map((r: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons (Matches Mockup) */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => navigate('/farmer/reports')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Detailed Report</span>
                </button>

                {result.is_flagged && (
                  <button
                    onClick={() => navigate('/farmer/grievance')}
                    className="w-full py-3 px-6 rounded-2xl bg-white border border-warm-border hover:bg-warm-bg text-gray-800 font-semibold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-kisan-red" />
                    <span>Raise a Grievance</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-warm-border text-center flex flex-col items-center justify-center min-h-[360px] text-gray-400">
              <div className="w-16 h-16 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                Awaiting Verification
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-gray-500">
                Click <strong>"Check for Discrepancies"</strong> to calculate approved vs disbursed difference.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
