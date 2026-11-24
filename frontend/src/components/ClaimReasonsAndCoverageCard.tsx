import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  Info, 
  CheckCircle2, 
  HelpCircle, 
  FolderUp, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ClaimReasonCodeDetail, InsuranceVerificationOutput } from '../services/api';

export interface ClaimReasonsAndCoverageCardProps {
  result: InsuranceVerificationOutput;
}

export const ClaimReasonsAndCoverageCard: React.FC<ClaimReasonsAndCoverageCardProps> = ({ result }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const navigate = useNavigate();

  // Track expanded state for each reason card
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({
    0: true, // Default open the primary reason
  });

  const toggleReason = (idx: number) => {
    setExpandedReasons((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const structuredReasons = result.structured_reasons || [];
  const coverage = result.coverage || { checked: [], not_checked: [], coverage_score: 1.0 };
  const coveragePercent = Math.round((coverage.coverage_score || 1.0) * 100);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'delay':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            {isHi ? 'प्रक्रियात्मक विलंब' : 'May cause delay'}
          </span>
        );
      case 'action_required':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            {isHi ? 'कार्रवाई आवश्यक' : 'Action required'}
          </span>
        );
      case 'rejection':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            {isHi ? 'समीक्षा अपेक्षित' : 'Review needed'}
          </span>
        );
      case 'informational':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sage-50 text-forest border border-sage-200">
            <Info className="w-3.5 h-3.5 text-forest" />
            {isHi ? 'सूचनात्मक स्थिति' : 'Informational'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Reason Codes Block */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-warm-border shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-warm-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal">
                {isHi ? 'दावा स्थिति एवं कारण कोड' : 'Claim Status & Reason Analysis'}
              </h4>
              <p className="text-[11px] text-muted">
                {isHi ? 'वैधानिक परिचालन नियमों के अनुसार कारण एवं समाधान' : 'Structured operational reason codes with resolution steps'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-cream text-charcoal border border-warm-border">
            {structuredReasons.length} {isHi ? 'नियम कोड' : 'Codes'}
          </span>
        </div>

        {/* List of Structured Reason Cards */}
        <div className="space-y-3">
          {structuredReasons.length > 0 ? (
            structuredReasons.map((reason, idx) => {
              const isOpen = !!expandedReasons[idx];
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-warm-border/80 bg-cream/30 overflow-hidden transition-all duration-200"
                >
                  {/* Card Header Accordion Trigger */}
                  <div 
                    onClick={() => toggleReason(idx)}
                    className="p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-cream/60 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCategoryBadge(reason.category)}
                        <code className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cream border border-warm-border text-forest">
                          {reason.code}
                        </code>
                      </div>
                      <h5 className="text-xs sm:text-sm font-bold text-charcoal leading-snug">
                        {isHi ? reason.label_hi : reason.label_en}
                      </h5>
                    </div>

                    <button 
                      type="button"
                      className="p-1 rounded-lg text-muted hover:text-charcoal hover:bg-cream transition-colors shrink-0 mt-1"
                      aria-label="Toggle details"
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Card Expanded Content */}
                  {isOpen && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-3 border-t border-warm-border/50 text-xs animate-in fade-in duration-150">
                      {/* Explanation */}
                      <p className="text-charcoal/90 leading-relaxed text-xs">
                        {isHi ? reason.explanation_hi : reason.explanation_en}
                      </p>

                      {/* How to Fix / Resolution Box */}
                      {(reason.how_to_fix_en || reason.how_to_fix_hi) && (
                        <div className="p-3 rounded-xl bg-forest/5 border border-forest/15 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-forest font-bold text-[11px]">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>{isHi ? 'समाधान / आगे क्या करें:' : 'How to resolve / Next step:'}</span>
                          </div>
                          <p className="text-charcoal text-[11px] leading-relaxed pl-5">
                            {isHi ? reason.how_to_fix_hi : reason.how_to_fix_en}
                          </p>
                        </div>
                      )}

                      {/* Document Required & Upload Vault Link */}
                      {reason.required_document && (
                        <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                              {isHi ? 'आवश्यक दस्तावेज़:' : 'Required Document:'}
                            </span>
                            <p className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-amber-700" />
                              {reason.required_document}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => navigate(reason.vault_action_url || '/farmer/documents')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-soft shrink-0 transition-all cursor-pointer"
                          >
                            <FolderUp className="w-3.5 h-3.5" />
                            <span>{isHi ? 'वॉल्ट में अपलोड करें' : 'Upload to Vault'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 rounded-2xl bg-cream/40 border border-warm-border text-center text-xs text-muted">
              {isHi ? 'कोई विशिष्ट विसंगति कोड दर्ज नहीं है।' : 'No specific reason codes recorded.'}
            </div>
          )}
        </div>
      </div>

      {/* 2. Verification Coverage & Completeness Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-warm-border shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-charcoal">
                {isHi ? 'सत्यापन पूर्णता एवं दायरा' : 'Verification Coverage & Completeness'}
              </h4>
              <p className="text-[11px] text-muted">
                {isHi ? 'सत्यापित परीक्षण एवं छूटे हुए परीक्षणों का विवरण' : 'Audit checks performed vs skipped due to missing data'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-forest">{coveragePercent}%</span>
            <span className="text-[10px] text-muted block">{isHi ? 'कवरेज' : 'Coverage'}</span>
          </div>
        </div>

        {/* Coverage Progress Bar */}
        <div className="w-full bg-cream rounded-full h-2 overflow-hidden border border-warm-border">
          <div 
            className="bg-forest h-full rounded-full transition-all duration-500"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>

        {/* Checks Performed List */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isHi ? 'सत्यापित परीक्षण (सफलतापूर्वक जाँचे गए)' : 'Checks Completed'}
          </span>
          <div className="space-y-1.5">
            {coverage.checked && coverage.checked.length > 0 ? (
              coverage.checked.map((item: any, idx: number) => {
                const label = typeof item === 'string' ? item : item.check;
                return (
                  <div key={idx} className="flex items-center gap-2 text-xs text-charcoal bg-forest/5 px-3 py-1.5 rounded-xl border border-forest/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                    <span>{label}</span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted pl-5">{isHi ? 'कोई जांच पूर्ण नहीं हुई' : 'No checks completed'}</p>
            )}
          </div>
        </div>

        {/* Skipped Checks (Missing Data) */}
        {coverage.not_checked && coverage.not_checked.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-warm-border/60">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {isHi ? 'अपूर्ण परीक्षण (डेटा अनुपलब्ध होने के कारण छोड़े गए)' : 'Checks Skipped (Missing Data)'}
            </span>
            <div className="space-y-2">
              {coverage.not_checked.map((item: any, idx: number) => {
                const checkName = typeof item === 'string' ? item : item.check;
                const reason = typeof item === 'object' ? item.reason : 'Data not uploaded';
                return (
                  <div key={idx} className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-amber-950">
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        {checkName}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                        {isHi ? 'छोड़ा गया' : 'Skipped'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900/90 pl-5">
                      {isHi ? `कारण: ${reason}` : `Reason: ${reason}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
