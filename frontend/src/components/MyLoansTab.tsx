import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Landmark, 
  FileText, 
  Upload, 
  RefreshCw, 
  FileUp, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Volume2,
  AlertTriangle,
  FolderLock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { fetchMyLoansApi, reverifyLoanApi, MyLoanItem } from '../services/api';
import { AudioSummaryPlayer } from './AudioSummaryPlayer';
import { BasisOfCheckCard } from './BasisOfCheckCard';

interface MyLoansTabProps {
  onCheckNewLoan: () => void;
}

export const MyLoansTab: React.FC<MyLoansTabProps> = ({ onCheckNewLoan }) => {
  const { language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<MyLoanItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedLoanId, setExpandedLoanId] = useState<number | null>(null);
  const [reverifyingLoanRef, setReverifyingLoanRef] = useState<string | null>(null);
  const [reverifyMessage, setReverifyMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLoans() {
      setIsLoading(true);
      try {
        const res = await fetchMyLoansApi(farmer.farmerId);
        if (isMounted && res?.loans) {
          setLoans(res.loans);
        }
      } catch (err) {
        console.error('Failed to load my loans', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLoans();
  }, [farmer.farmerId]);

  const handleReverify = async (loanRef: string) => {
    setReverifyingLoanRef(loanRef);
    setReverifyMessage(null);
    try {
      const updated = await reverifyLoanApi(loanRef);
      setLoans((prev) => prev.map((l) => (l.loan_ref === loanRef ? updated : l)));
      setReverifyMessage(
        language === 'hi'
          ? `ऋण ${loanRef} का सत्यापन पुनः पूर्ण हुआ: ${updated.verification_status}`
          : `Re-verification complete for ${loanRef}: ${updated.verification_status}`
      );
      if (updated.verification_status === 'Verified') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5B7A47', '#4A6538', '#E4EBD6'],
        });
      }
    } catch (err) {
      console.error('Re-verification failed', err);
    } finally {
      setReverifyingLoanRef(null);
    }
  };

  const filteredLoans = loans.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.verification_status.toLowerCase() === statusFilter.toLowerCase();
  });

  const countVerified = loans.filter((l) => l.verification_status === 'Verified').length;
  const countNeedsReview = loans.filter((l) => l.verification_status === 'Needs Review').length;
  const countNotVerified = loans.filter((l) => l.verification_status === 'Not Verified').length;

  return (
    <div className="space-y-6">
      {/* Top Summary Strip and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-cream-surface border border-warm-border shadow-soft">
        <div>
          <h2 className="text-base font-bold text-charcoal">
            {language === 'hi' ? 'मेरे मौजूदा कृषि ऋण' : 'My Existing Agricultural Loans'}
          </h2>
          <p className="text-xs text-muted mt-0.5">
            {language === 'hi'
              ? 'आपके बैंक ऋणों की स्वीकृति, वास्तविक वितरण एवं ब्याज दरों का वैधानिक सत्यापन स्थिति।'
              : 'Status of your bank loan sanction limits, disbursed amounts, and statutory compliance.'}
          </p>
        </div>

        <button
          onClick={onCheckNewLoan}
          className="px-4 py-2.5 rounded-lg bg-forest text-cream font-bold text-xs hover:bg-forest-light transition-colors flex items-center justify-center gap-2 shadow-soft flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{language === 'hi' ? 'नया ऋण जांचें / संस्वीकृति पत्र' : 'Check a New Loan / Upload'}</span>
        </button>
      </div>

      {/* Filter and Count Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-warm-bg/50 p-3 rounded-xl border border-warm-border/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-muted">{language === 'hi' ? 'स्थिति फ़िल्टर:' : 'Filter Status:'}</span>
          {[
            { id: 'all', label: language === 'hi' ? `सभी (${loans.length})` : `All (${loans.length})` },
            { id: 'Verified', label: language === 'hi' ? `सत्यापित (${countVerified})` : `Verified (${countVerified})` },
            { id: 'Needs Review', label: language === 'hi' ? `समीक्षा अपेक्षित (${countNeedsReview})` : `Needs Review (${countNeedsReview})` },
            { id: 'Not Verified', label: language === 'hi' ? `सत्यापित नहीं (${countNotVerified})` : `Not Verified (${countNotVerified})` },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                statusFilter === pill.id
                  ? 'bg-forest text-cream shadow-soft'
                  : 'bg-cream-surface text-charcoal hover:bg-tint border border-warm-border'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {reverifyMessage && (
          <span className="text-xs font-semibold text-forest bg-forest/10 px-3 py-1 rounded-md border border-forest/20">
            {reverifyMessage}
          </span>
        )}
      </div>

      {/* Loans List */}
      {isLoading ? (
        <div className="py-16 text-center text-muted">
          <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">{language === 'hi' ? 'ऋण अभिलेख लोड हो रहे हैं...' : 'Loading loan records...'}</p>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="p-8 text-center bg-cream-surface rounded-xl border border-warm-border text-muted">
          <p className="text-sm font-semibold">
            {language === 'hi' ? 'इस फ़िल्टर में कोई ऋण अभिलेख नहीं है।' : 'No loan records found in this category.'}
          </p>
          <button 
            onClick={() => setStatusFilter('all')} 
            className="mt-2 text-xs text-forest hover:underline font-semibold"
          >
            {language === 'hi' ? 'सभी देखें' : 'View all'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => {
            const isExpanded = expandedLoanId === loan.id;
            const isVerified = loan.verification_status === 'Verified';
            const isNeedsReview = loan.verification_status === 'Needs Review';
            const isNotVerified = loan.verification_status === 'Not Verified';

            return (
              <div 
                key={loan.id}
                className="bg-cream-surface rounded-xl border border-warm-border hover:border-forest/40 transition-all shadow-soft overflow-hidden"
              >
                {/* Header bar */}
                <div className="p-4 sm:p-5 border-b border-warm-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest/10 border border-forest/20 flex items-center justify-center text-forest flex-shrink-0">
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-charcoal text-base">
                          {loan.bank_name}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-warm-bg text-muted border border-warm-border">
                          {loan.loan_ref}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-forest/10 text-forest">
                          {loan.loan_type}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-3">
                        <span>{language === 'hi' ? 'ऋण तिथि:' : 'Loan Date:'} {loan.loan_date}</span>
                        {loan.last_verified_at && (
                          <span>• {language === 'hi' ? 'अंतिम सत्यापन:' : 'Verified on:'} {loan.last_verified_at}</span>
                        )}
                        {loan.sanction_doc_name && (
                          <span className="hidden sm:inline">• {loan.sanction_doc_name}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-forest-bg text-forest border border-forest/30 shadow-soft">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                      </span>
                    )}
                    {isNeedsReview && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-soft">
                        <AlertCircle className="w-4 h-4" />
                        <span>{language === 'hi' ? 'समीक्षा अपेक्षित' : 'Needs Review'}</span>
                      </span>
                    )}
                    {isNotVerified && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300 shadow-soft">
                        <HelpCircle className="w-4 h-4" />
                        <span>{language === 'hi' ? 'सत्यापित नहीं' : 'Not Verified'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Arithmetic Breakdown strip */}
                <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-warm-bg/25 border-b border-warm-border/60 text-xs">
                  <div>
                    <span className="text-muted block text-[11px] font-medium">
                      {language === 'hi' ? 'स्वीकृत राशि' : 'Approved Amount'}
                    </span>
                    <span className="text-sm font-bold text-charcoal block mt-0.5">
                      ₹{loan.approved_amount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted block text-[11px] font-medium">
                      {language === 'hi' ? 'वितरित राशि' : 'Disbursed Amount'}
                    </span>
                    <span className="text-sm font-bold text-charcoal block mt-0.5">
                      ₹{loan.disbursed_amount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted block text-[11px] font-medium">
                      {language === 'hi' ? 'अंतर (Difference)' : 'Difference'}
                    </span>
                    <span className={`text-sm font-extrabold block mt-0.5 ${
                      loan.difference > 0 ? 'text-amber-700' : 'text-forest'
                    }`}>
                      {loan.difference > 0 ? `₹${loan.difference.toLocaleString()}` : '₹0'}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted block text-[11px] font-medium">
                      {language === 'hi' ? 'ब्याज दर' : 'Interest Rate'}
                    </span>
                    <span className="text-sm font-bold text-charcoal block mt-0.5">
                      {loan.interest_rate}% p.a.
                    </span>
                  </div>
                </div>

                {/* Reason Block (for Needs Review or Not Verified) */}
                {!isVerified && (
                  <div className="p-4 sm:p-5 bg-amber-50/40 border-b border-warm-border/60 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>
                          {language === 'hi'
                            ? 'कारण विवरण एवं अनुशंसित कदम (समीक्षा अपेक्षित):'
                            : 'Reason Details & Recommended Steps:'}
                        </span>
                      </div>
                      
                      {/* Reason Codes */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {loan.reason_codes.map((code, idx) => (
                          <span key={idx} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            {code}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Explanatory Reasons List */}
                    <ul className="space-y-1.5 text-xs text-amber-950 pl-5 list-disc">
                      {loan.reasons.map((r, i) => (
                        <li key={i} className="leading-relaxed font-medium">
                          {r}
                        </li>
                      ))}
                    </ul>

                    {/* Non-accusatory neutral note */}
                    <p className="text-[11px] text-muted italic">
                      {language === 'hi'
                        ? 'नोट: यह अंतर किसी अनधिकृत कार्य का प्रमाण नहीं है। यह बैंक प्रोसेसिंग शुल्क, बीमा प्रीमियम स्वतः कटौती या संस्वीकृति पत्र के अभाव के कारण हो सकता है।'
                        : 'Note: A discrepancy is not proof of wrongdoing. It may be due to valid processing deductions, insurance premium withholding, or pending document verification.'}
                    </p>
                  </div>
                )}

                {/* Audio player strip for this loan */}
                <div className="px-4 py-2.5 bg-cream-surface border-b border-warm-border/60">
                  <AudioSummaryPlayer
                    checkType="loan"
                    approvedAmount={loan.approved_amount}
                    disbursedAmount={loan.disbursed_amount}
                    difference={loan.difference}
                    bankName={loan.bank_name}
                  />
                </div>

                {/* Basis of Check Expandable Card */}
                {isExpanded && loan.basis_of_check && loan.basis_of_check.length > 0 && (
                  <div className="p-4 sm:p-5 bg-warm-bg/20 border-b border-warm-border/60">
                    <BasisOfCheckCard
                      checkType="loan"
                      isFlagged={loan.difference > 0}
                      sources={loan.basis_of_check.map((b) => ({
                        rule_code: b.rule_code,
                        scheme_name: b.scheme_name,
                        rule_type: b.rule_type,
                        title: b.scheme_name,
                        source_name: b.source_name,
                        source_document: b.source_document,
                        source_url: b.source_url,
                        authority: b.source_name,
                        document: b.source_document,
                        url: b.source_url,
                        effective_from: b.effective_from || '2024-04-01',
                        last_verified_on: b.last_verified_on || '2025-04-10',
                        status: b.status || 'verified',
                        data_origin: 'official',
                        details: b.details || b.description_en,
                        details_hi: b.details_hi || b.description_hi,
                        formula_or_value: b.formula_or_value,
                      }))}
                    />
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="p-3 sm:p-4 bg-cream-surface flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReverify(loan.loan_ref)}
                      disabled={reverifyingLoanRef === loan.loan_ref}
                      className="px-3.5 py-1.5 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest font-bold text-xs flex items-center gap-1.5 transition-colors border border-forest/20 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${reverifyingLoanRef === loan.loan_ref ? 'animate-spin' : ''}`} />
                      <span>{language === 'hi' ? 'पुनः सत्यापित करें' : 'Verify Now'}</span>
                    </button>

                    <button
                      onClick={() => navigate('/farmer/reports')}
                      className="px-3 py-1.5 rounded-lg bg-warm-bg hover:bg-tint text-charcoal font-semibold text-xs border border-warm-border flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-muted" />
                      <span>{language === 'hi' ? 'विस्तृत रिपोर्ट' : 'View Report'}</span>
                    </button>

                    {!loan.sanction_doc_name && (
                      <button
                        onClick={() => navigate('/farmer/documents')}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs border border-amber-300 flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-700" />
                        <span>{language === 'hi' ? 'संस्वीकृति पत्र अपलोड करें' : 'Upload Sanction Letter'}</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/farmer/grievances?record_ref=${loan.loan_ref}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-charcoal hover:bg-tint border border-warm-border/70"
                    >
                      {language === 'hi' ? 'शिकायत दर्ज करें' : 'Raise Grievance'}
                    </button>

                    <button
                      onClick={() => setExpandedLoanId(isExpanded ? null : loan.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-forest hover:underline flex items-center gap-1"
                    >
                      <span>{isExpanded ? (language === 'hi' ? 'नियम छुपाएं' : 'Hide Rules') : (language === 'hi' ? 'जांच नियम देखें' : 'Basis of Check')}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
