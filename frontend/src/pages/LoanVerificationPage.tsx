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
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  FileUp, 
  Loader2, 
  Check, 
  Flag 
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
  // Default sample result matching Image A & Image B for initial desktop presentation
  const [result, setResult] = useState<any | null>({
    is_flagged: true,
    status_label: 'Discrepancy Detected',
    explanation: 'The disbursed amount is less than the approved amount.',
    approved_amount: 80000,
    disbursed_amount: 70000,
    deductions: 5000,
    difference: 10000,
    reasons: [
      'Deductions for processing fees',
      'Incomplete documentation',
      'Bank policy variation'
    ]
  });

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
      setOcrError('Only PDF, PNG, JPG, or JPEG files are supported.');
      return;
    }

    // Validate size: max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setOcrError('File size exceeds 5 MB limit.');
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
        setOcrSuccessMsg(`Extracted ${filled.length} fields from "${file.name}". Please review extracted values.`);
      } else {
        setOcrError('No legible loan amounts found. Please enter values manually.');
      }
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setOcrError('Document extraction failed. You can enter details manually.');
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
          colors: ['#5B7A47', '#4A6538', '#E4EBD6'],
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
    setResult({
      is_flagged: false,
      status_label: 'Loan Details Verified',
      explanation: 'Disbursed amount matches the approved sanction limit exactly.',
      approved_amount: 80000,
      disbursed_amount: 80000,
      deductions: 0,
      difference: 0,
      reasons: ['Full sanction disbursed to savings account', 'No unauthorized deductions']
    });
  };

  const loadSampleDiscrepancy = () => {
    setApprovedAmount(80000);
    setDisbursedAmount(70000);
    setDeductions(5000);
    setResult({
      is_flagged: true,
      status_label: 'Discrepancy Detected',
      explanation: 'The disbursed amount is less than the approved amount.',
      approved_amount: 80000,
      disbursed_amount: 70000,
      deductions: 5000,
      difference: 10000,
      reasons: [
        'Deductions for processing fees',
        'Incomplete documentation',
        'Bank policy variation'
      ]
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Header bar with Sample toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1 border-b border-warm-border/60">
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => navigate('/farmer')}
            className="w-9 h-9 rounded-full bg-cream-surface border border-warm-border flex items-center justify-center text-charcoal hover:bg-tint transition-colors shadow-soft"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-charcoal tracking-tight">
              {language === 'hi' ? 'ऋण सत्यापन (KCC)' : 'Loan Verification'}
            </h1>
            <p className="text-xs text-muted">
              Check if your loan details match the expected amount.
            </p>
          </div>
        </div>

        {/* Quick Sample toggles for testing */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={loadSampleDiscrepancy}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-status-discrepancy-bg text-status-discrepancy-text border border-status-discrepancy-text/30 hover:opacity-90 transition-all min-h-[36px]"
          >
            Sample ₹10k Discrepancy
          </button>
          <button
            type="button"
            onClick={loadSampleMatch}
            className="px-3 py-1.5 rounded-full text-xs font-semibold bg-status-eligible-bg text-status-eligible-text border border-status-eligible-text/30 hover:opacity-90 transition-all min-h-[36px]"
          >
            Sample Verified Match
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TWO-COLUMN GRID (Desktop Image A) / STACKED (Phone Image B)    */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Enter Loan Details Form (7 cols on lg) */}
        <div className="lg:col-span-7 bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-4">
          <div className="border-b border-warm-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">
                Enter Loan Details
              </h2>
              <p className="text-xs text-muted">
                Deterministic calculations ensure accuracy without changing bank data.
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>

          {/* OCR Document Upload Button (Secondary Outlined) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-cream border border-warm-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />
            
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal">
                <Sparkles className="w-3.5 h-3.5 text-forest" />
                <span>Upload Sanction Letter (PDF/Image)</span>
              </div>
              <p className="text-[11px] text-muted mt-0.5">
                Auto-fill fields from sanction document (max 5 MB).
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isOcrLoading}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-cream-surface hover:bg-tint text-charcoal border border-warm-border rounded-xl text-xs font-semibold shadow-soft transition-all min-h-[44px]"
            >
              {isOcrLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-3.5 h-3.5 text-forest" />
                  <span>Choose File</span>
                </>
              )}
            </button>
          </div>

          {/* OCR Success/Error Banner */}
          {ocrSuccessMsg && (
            <div className="bg-status-eligible-bg border border-status-eligible-text/20 text-status-eligible-text px-3 py-2 rounded-xl text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                {ocrSuccessMsg}
              </span>
            </div>
          )}
          {ocrError && (
            <div className="bg-status-review-bg border border-status-review-text/30 text-status-review-text px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}

          {/* Form Fields: Label Above Field */}
          <form onSubmit={handleVerify} className="space-y-4">
            
            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Bank Name
              </label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
              >
                <option value="State Bank of India">State Bank of India</option>
                <option value="Chhattisgarh Rajya Gramin Bank">Chhattisgarh Rajya Gramin Bank</option>
                <option value="Bank of Baroda">Bank of Baroda</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
              </select>
            </div>

            {/* Loan Account Reference */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Loan Account Reference
              </label>
              <input
                type="text"
                value={loanAccountRef}
                onChange={(e) => setLoanAccountRef(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                required
              />
            </div>

            {/* Approved & Disbursed Amounts (2-cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Approved Amount (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="100"
                  value={approvedAmount || ''}
                  onChange={(e) => setApprovedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Disbursed Amount (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="100"
                  value={disbursedAmount || ''}
                  onChange={(e) => setDisbursedAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                  required
                />
              </div>
            </div>

            {/* Interest Rate & Deductions (2-cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={interestRate || ''}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Deductions (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="100"
                  value={deductions || ''}
                  onChange={(e) => setDeductions(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                  placeholder="5,000"
                />
              </div>
            </div>

            {/* Loan Date & Loan Type (2-cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Loan Date
                </label>
                <input
                  type="text"
                  value={loanDate}
                  onChange={(e) => setLoanDate(e.target.value)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                  placeholder="12-03-2024"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Loan Type
                </label>
                <select
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive transition-colors min-h-[48px]"
                >
                  <option value="Crop Loan">Crop Loan</option>
                  <option value="Kisan Credit Card">Kisan Credit Card (KCC)</option>
                  <option value="Agricultural Term Loan">Agricultural Term Loan</option>
                </select>
              </div>
            </div>

            {/* Primary Action Button (52px full-width) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
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

        {/* Right Column: Verification Result Panel (5 cols on lg - Image A & Image B) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-5 animate-in fade-in duration-200">
              
              {/* Alert Banner Card (Sampled Peach-Red #FCEAE4 / Red #B83227) */}
              {result.is_flagged ? (
                <div className="p-4 rounded-xl bg-status-discrepancy-bg border border-status-discrepancy-text/25 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-status-discrepancy-text flex items-center justify-center shrink-0 mt-0.5 shadow-soft">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-discrepancy-text">
                      {result.status_label || 'Discrepancy Detected'}
                    </h3>
                    <p className="text-xs text-charcoal/80 mt-0.5 leading-relaxed">
                      {result.explanation || 'The disbursed amount is less than the approved amount.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-status-eligible-bg border border-status-eligible-text/25 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-status-eligible-text flex items-center justify-center shrink-0 mt-0.5 shadow-soft">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-status-eligible-text">
                      Verified
                    </h3>
                    <p className="text-xs text-charcoal/80 mt-0.5 leading-relaxed">
                      Disbursed amount matches approved limit.
                    </p>
                  </div>
                </div>
              )}

              {/* Table of Approved / Disbursed / Difference */}
              <div className="divide-y divide-warm-border border-y border-warm-border py-1">
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-muted font-medium">Approved Amount</span>
                  <span className="font-bold text-charcoal text-sm">
                    ₹ {result.approved_amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-muted font-medium">Disbursed Amount</span>
                  <span className="font-bold text-charcoal text-sm">
                    ₹ {result.disbursed_amount.toLocaleString()}
                  </span>
                </div>
                {result.deductions > 0 && (
                  <div className="flex items-center justify-between py-2.5 text-xs">
                    <span className="text-muted font-medium">Deductions</span>
                    <span className="font-semibold text-charcoal">
                      ₹ {result.deductions.toLocaleString()}
                    </span>
                  </div>
                )}
                {/* Difference row highlighted in soft red if discrepancy */}
                <div className={`flex items-center justify-between py-3 px-2 rounded-lg text-xs ${
                  result.difference > 0 ? 'bg-status-discrepancy-bg/60' : ''
                }`}>
                  <span className="font-bold text-charcoal">Difference</span>
                  <span
                    className={`font-extrabold text-base ${
                      result.difference > 0 ? 'text-status-discrepancy-text' : 'text-status-eligible-text'
                    }`}
                  >
                    ₹ {result.difference.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Possible Reasons List */}
              {result.reasons && result.reasons.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-charcoal mb-2">
                    Possible Reasons
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {result.reasons.map((r: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons: View Detailed Report & Raise Grievance (Image A & B) */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/farmer/reports')}
                  className="w-full h-[48px] py-3 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Detailed Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/farmer/grievance')}
                  className="w-full h-[48px] py-3 px-6 rounded-xl bg-cream-surface border border-warm-border hover:bg-tint/40 text-charcoal font-semibold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Flag className="w-4 h-4 text-status-discrepancy-text" />
                  <span>Raise a Grievance</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-cream-surface rounded-2xl p-8 border border-dashed border-warm-border text-center flex flex-col items-center justify-center min-h-[340px] text-muted">
              <ShieldCheck className="w-12 h-12 text-forest/40 mb-3" />
              <h3 className="text-sm font-bold text-charcoal mb-1">
                Awaiting Verification
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-muted">
                Click <strong>"Check for Discrepancies"</strong> to calculate approved vs disbursed difference.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
