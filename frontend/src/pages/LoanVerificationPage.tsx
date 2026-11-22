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
  RefreshCw,
  UploadCloud,
  FileUp,
  Loader2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyLoanApi, extractLoanOcrApi } from '../services/api';

export const LoanVerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Form Inputs
  const [bankName, setBankName] = useState('State Bank of India');
  const [loanAccountRef, setLoanAccountRef] = useState('SBIN*******1234');
  const [loanType, setLoanType] = useState('Crop Loan');
  const [approvedAmount, setApprovedAmount] = useState<number>(80000);
  const [disbursedAmount, setDisbursedAmount] = useState<number>(70000);
  const [interestRate, setInterestRate] = useState<number>(7.5);
  const [deductions, setDeductions] = useState<number>(5000);
  const [loanDate, setLoanDate] = useState('12-03-2024');

  // OCR state
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError(null);
    setOcrSuccessMsg(null);

    // Validate type
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    if (!isValidType) {
      setOcrError('Only PDF, PNG, JPG, or JPEG files are supported. Please select a valid document.');
      return;
    }

    // Validate size: max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setOcrError('File size exceeds the 5 MB limit. Please upload a smaller document.');
      return;
    }

    setIsOcrLoading(true);
    try {
      const data = await extractLoanOcrApi(file);
      const filled: string[] = [];

      if (data.bank_name) {
        setBankName(data.bank_name);
        filled.push('bankName');
      }
      if (data.loan_account_ref) {
        setLoanAccountRef(data.loan_account_ref);
        filled.push('loanAccountRef');
      }
      if (data.loan_type) {
        setLoanType(data.loan_type);
        filled.push('loanType');
      }
      if (data.approved_amount !== null && data.approved_amount !== undefined) {
        setApprovedAmount(data.approved_amount);
        filled.push('approvedAmount');
      }
      if (data.disbursed_amount !== null && data.disbursed_amount !== undefined) {
        setDisbursedAmount(data.disbursed_amount);
        filled.push('disbursedAmount');
      }
      if (data.interest_rate !== null && data.interest_rate !== undefined) {
        setInterestRate(data.interest_rate);
        filled.push('interestRate');
      }
      if (data.deductions !== null && data.deductions !== undefined) {
        setDeductions(data.deductions);
        filled.push('deductions');
      }
      if (data.loan_date) {
        setLoanDate(data.loan_date);
        filled.push('loanDate');
      }

      setAutoFilledFields(filled);

      if (filled.length > 0) {
        setOcrSuccessMsg(`Extracted ${filled.length} fields from "${file.name}" with ${(data.confidence * 100).toFixed(0)}% confidence. Please review the values below.`);
      } else {
        setOcrError('No legible loan amounts found in document. Please enter values manually below.');
      }
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setOcrError('Document extraction failed or could not be processed. You can enter the details manually below.');
    } finally {
      setIsOcrLoading(false);
      if (e.target) e.target.value = '';
    }
  };

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

          {/* OCR Document Upload Section */}
          <div className="p-4 rounded-2xl bg-sage-50/60 border border-sage-200/80 space-y-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-sage-900">
                  <Sparkles className="w-4 h-4 text-sage-700" />
                  <span>Instant OCR Document Extraction</span>
                </div>
                <p className="text-[11px] text-sage-700 mt-0.5">
                  Upload a Loan Sanction Letter or Bank Statement (.pdf, .png, .jpg, max 5 MB).
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isOcrLoading}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-sage-700 hover:bg-sage-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-soft transition-all cursor-pointer whitespace-nowrap"
              >
                {isOcrLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Extracting data...
                  </>
                ) : (
                  <>
                    <FileUp className="w-3.5 h-3.5" />
                    Upload Sanction Letter (PDF/Image)
                  </>
                )}
              </button>
            </div>

            {/* OCR Success Banner */}
            {ocrSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  {ocrSuccessMsg}
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-semibold ml-2 flex-shrink-0">
                  Please review
                </span>
              </div>
            )}

            {/* OCR Error / Friendly Fallback Banner */}
            {ocrError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{ocrError}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bank Name
                  {autoFilledFields.includes('bankName') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('bankName') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
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
                  {autoFilledFields.includes('loanAccountRef') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="text"
                  value={loanAccountRef}
                  onChange={(e) => setLoanAccountRef(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('loanAccountRef') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Approved Amount (₹)
                  {autoFilledFields.includes('approvedAmount') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="number"
                  step="100"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('approvedAmount') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Disbursed Amount (₹)
                  {autoFilledFields.includes('disbursedAmount') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="number"
                  step="100"
                  value={disbursedAmount}
                  onChange={(e) => setDisbursedAmount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('disbursedAmount') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Interest Rate (%)
                  {autoFilledFields.includes('interestRate') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('interestRate') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deductions (₹)
                  {autoFilledFields.includes('deductions') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="number"
                  step="100"
                  value={deductions}
                  onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('deductions') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Loan Date
                  {autoFilledFields.includes('loanDate') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <input
                  type="text"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('loanDate') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Loan Type
                  {autoFilledFields.includes('loanType') && (
                    <span className="text-[10px] text-sage-700 bg-sage-100 px-1.5 py-0.5 rounded ml-2 font-normal">Auto-filled</span>
                  )}
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className={`w-full px-4 py-2.5 bg-warm-bg rounded-2xl border text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-sage-500 transition-colors ${
                    autoFilledFields.includes('loanType') ? 'border-sage-400 bg-sage-50/30 ring-1 ring-sage-400' : 'border-warm-border'
                  }`}
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
