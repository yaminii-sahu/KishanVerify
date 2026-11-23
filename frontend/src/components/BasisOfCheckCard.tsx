import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  FileCheck2, 
  Calculator, 
  Info,
  Building2,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SourceCitation } from '../services/api';

export interface BasisOfCheckCardProps {
  checkType: 'loan' | 'msp' | 'insurance';
  sources?: SourceCitation[];
  flaggedRuleCode?: string | null;
  flaggedRuleThreshold?: string | null;
  flaggedRuleReasonEn?: string | null;
  flaggedRuleReasonHi?: string | null;
  isFlagged?: boolean;
  arithmetic?: {
    approved?: number;
    disbursed?: number;
    deductions?: number;
    difference?: number;
    unaccounted?: number;
    crop?: string;
    quantity?: number;
    rate?: number;
    expected?: number;
    actual?: number;
    userEnteredFields?: string[];
    bankDocFields?: string[];
  };
}

export const BasisOfCheckCard: React.FC<BasisOfCheckCardProps> = ({
  checkType,
  sources = [],
  flaggedRuleCode,
  flaggedRuleThreshold,
  flaggedRuleReasonEn,
  flaggedRuleReasonHi,
  isFlagged = false,
  arithmetic = {},
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [isWhyFlaggedOpen, setIsWhyFlaggedOpen] = useState(false);

  // Find primary official source
  const primarySource = sources.find(s => s.data_origin === 'official') || sources[0];
  const hasDemoOrUnverified = sources.some(s => s.status === 'demo' || s.status === 'unverified');

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return '₹0';
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const renderOriginBadge = (origin: string) => {
    switch (origin) {
      case 'official':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-3 h-3" />
            {isHi ? 'आधिकारिक स्रोत' : 'Official source'}
          </span>
        );
      case 'bank_document':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileCheck2 className="w-3 h-3" />
            {isHi ? 'बैंक दस्तावेज़ (अपलोड किया गया)' : 'Bank document (uploaded)'}
          </span>
        );
      case 'user_entered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Calculator className="w-3 h-3" />
            {isHi ? 'आपके द्वारा दर्ज' : 'Entered by you'}
          </span>
        );
      case 'demo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Info className="w-3 h-3" />
            {isHi ? 'डेमो डेटा' : 'Demo data'}
          </span>
        );
    }
  };

  return (
    <div className="bg-cream-surface rounded-2xl border border-warm-border p-4 sm:p-5 space-y-4 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-warm-border/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-charcoal">
              {isHi ? 'इस जांच का आधार' : 'Basis of this check'}
            </h4>
            <p className="text-[11px] text-muted">
              {isHi
                ? 'वैधानिक नियम, सरकारी अधिसूचनाएं एवं गणना'
                : 'Statutory rules, cited notifications & formula'}
            </p>
          </div>
        </div>

        {primarySource?.last_verified_on && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-3 h-3" />
            <span>
              {isHi ? `सत्यापित: ${primarySource.last_verified_on}` : `Verified: ${primarySource.last_verified_on}`}
            </span>
          </div>
        )}
      </div>

      {/* Warning banner if demo or unverified */}
      {hasDemoOrUnverified && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              {isHi
                ? 'यह जांच अनुमानित / डेमो मूल्य का उपयोग करती है।'
                : 'This check uses an estimated or demo value.'}
            </p>
            <p className="text-[11px] text-amber-800/90 mt-0.5">
              {isHi
                ? 'इसे आधिकारिक स्रोत से सीधे पुष्टि नहीं किया गया है। कृपया आधिकारिक पोर्टल पर विवरण देखें।'
                : 'It cannot be fully confirmed against a live official notification. Please verify on the official scheme portal.'}
            </p>
          </div>
        </div>
      )}

      {/* Primary Scheme / Rule Being Followed */}
      {primarySource && (
        <div className="bg-cream/60 rounded-xl p-3.5 border border-warm-border/60 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-bold text-forest">
                  {isHi ? primarySource.scheme_name_hi || primarySource.scheme_name : primarySource.scheme_name}
                </span>
                {renderOriginBadge(primarySource.data_origin)}
              </div>
              <p className="text-xs font-medium text-charcoal leading-snug">
                {isHi ? primarySource.details_hi || primarySource.details : primarySource.details}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted pt-1 border-t border-warm-border/50">
            <div className="flex items-center gap-1.5 truncate">
              <Building2 className="w-3 h-3 text-muted shrink-0" />
              <span className="truncate" title={primarySource.authority || primarySource.source_name}>
                {isHi ? primarySource.authority_hi || primarySource.authority || primarySource.source_name : primarySource.authority || primarySource.source_name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-muted shrink-0" />
              <span>
                {isHi ? 'लागू: ' : 'Effective: '}
                {primarySource.effective_from}
                {primarySource.effective_to ? ` - ${primarySource.effective_to}` : ' (चालू / Current)'}
              </span>
            </div>
          </div>

          {/* Official Document name and URL button */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
            <span className="text-[11px] text-muted truncate max-w-[280px]" title={primarySource.document || primarySource.source_document}>
              📜 {isHi ? primarySource.document_hi || primarySource.document || primarySource.source_document : primarySource.document || primarySource.source_document}
            </span>

            {(primarySource.url || primarySource.source_url) && (
              <a
                href={primarySource.url || primarySource.source_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-forest hover:text-forest-dark underline shrink-0 cursor-pointer"
              >
                <span>{isHi ? 'आधिकारिक स्रोत देखें' : 'View official source'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Step-by-Step Exact Arithmetic Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-forest" />
            {isHi ? 'चरणबद्ध गणना समीकरण' : 'Step-by-step arithmetic equation'}
          </span>
          <span className="text-[10px] text-muted uppercase font-semibold">
            {isHi ? 'सटीक गणितीय मिलान' : 'Deterministic Check'}
          </span>
        </div>

        {checkType === 'loan' && (
          <div className="p-3 rounded-xl bg-warm-bg/70 border border-warm-border text-xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                {isHi ? 'स्वीकृत ऋण सीमा' : 'Approved Sanction Limit'}
                {renderOriginBadge('bank_document')}
              </span>
              <span className="font-semibold text-charcoal">{formatCurrency(arithmetic.approved)}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                {isHi ? 'वितरित राशि (बैंक रिकॉर्ड)' : 'Disbursed Amount (Bank Credit)'}
                {renderOriginBadge('bank_document')}
              </span>
              <span className="font-semibold text-charcoal">− {formatCurrency(arithmetic.disbursed)}</span>
            </div>
            {Number(arithmetic.deductions || 0) > 0 && (
              <div className="flex items-center justify-between text-muted">
                <span className="flex items-center gap-1.5">
                  {isHi ? 'वैध दर्ज कटौतियां (बीमा/शुल्क)' : 'Itemized Legitimate Deductions'}
                  {renderOriginBadge('bank_document')}
                </span>
                <span className="font-semibold text-charcoal">− {formatCurrency(arithmetic.deductions)}</span>
              </div>
            )}
            <div className="pt-1.5 border-t border-warm-border flex items-center justify-between font-bold">
              <span className={arithmetic.difference && arithmetic.difference > 0 ? 'text-status-discrepancy-text' : 'text-forest'}>
                {isHi ? 'अस्पष्ट अंतर (समीक्षा हेतु)' : 'Unexplained Difference (For Review)'}
              </span>
              <span className={arithmetic.difference && arithmetic.difference > 0 ? 'text-status-discrepancy-text text-sm' : 'text-forest text-sm'}>
                = {formatCurrency(arithmetic.unaccounted ?? arithmetic.difference)}
              </span>
            </div>
          </div>
        )}

        {checkType === 'msp' && (
          <div className="p-3 rounded-xl bg-warm-bg/70 border border-warm-border text-xs space-y-1.5">
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                {isHi ? `फसल मात्रा (${arithmetic.crop || 'फसल'})` : `Quantity (${arithmetic.crop || 'Crop'})`}
                {renderOriginBadge('bank_document')}
              </span>
              <span className="font-semibold text-charcoal">{arithmetic.quantity || 0} Quintals</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                {isHi ? 'वैधानिक एमएसपी दर (CACP)' : 'Statutory MSP Rate (CACP Benchmark)'}
                {renderOriginBadge('official')}
              </span>
              <span className="font-semibold text-charcoal">× {formatCurrency(arithmetic.rate)} / Qtl</span>
            </div>
            <div className="flex items-center justify-between text-charcoal font-semibold pt-1 border-t border-warm-border/60">
              <span>{isHi ? 'कुल वैधानिक अपेक्षित भुगतान' : 'Total Expected MSP Payment'}</span>
              <span>= {formatCurrency(arithmetic.expected)}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                {isHi ? 'वास्तविक प्राप्त भुगतान' : 'Actual Payment Received'}
                {renderOriginBadge('user_entered')}
              </span>
              <span className="font-semibold text-charcoal">− {formatCurrency(arithmetic.actual)}</span>
            </div>
            <div className="pt-1.5 border-t border-warm-border flex items-center justify-between font-bold">
              <span className={arithmetic.difference && arithmetic.difference > 0 ? 'text-status-discrepancy-text' : 'text-forest'}>
                {isHi ? 'भुगतान अंतर' : 'Payment Difference'}
              </span>
              <span className={arithmetic.difference && arithmetic.difference > 0 ? 'text-status-discrepancy-text text-sm' : 'text-forest text-sm'}>
                = {formatCurrency(arithmetic.difference)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input Data Origins Summary Tag List */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
          {isHi ? 'डेटा उत्पत्ति टैग' : 'Data Origins in this verification'}
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {sources.map((s, idx) => (
            <div
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-cream/80 border border-warm-border/60 flex items-center gap-2 text-[11px]"
            >
              <span className="font-medium text-charcoal">{s.scheme_name}</span>
              {renderOriginBadge(s.data_origin)}
            </div>
          ))}
        </div>
      </div>

      {/* Collapsible: "Why was this flagged?" */}
      {isFlagged && (
        <div className="rounded-xl border border-warm-border/80 overflow-hidden bg-white/70">
          <button
            type="button"
            onClick={() => setIsWhyFlaggedOpen(!isWhyFlaggedOpen)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-cream/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-status-discrepancy-text" />
              <span className="text-xs font-bold text-charcoal">
                {isHi ? 'यह रिकॉर्ड समीक्षा के लिए क्यों चिह्नित किया गया?' : 'Why was this record flagged?'}
              </span>
            </div>
            {isWhyFlaggedOpen ? (
              <ChevronUp className="w-4 h-4 text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted" />
            )}
          </button>

          {isWhyFlaggedOpen && (
            <div className="px-4 pb-3.5 pt-1 space-y-2.5 text-xs text-charcoal/90 border-t border-warm-border/50 animate-in fade-in duration-150">
              {flaggedRuleCode && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-muted">{isHi ? 'नियम कोड:' : 'Rule Code:'}</span>
                  <code className="px-2 py-0.5 rounded bg-cream border border-warm-border text-forest font-mono text-[10px] font-bold">
                    {flaggedRuleCode}
                  </code>
                </div>
              )}

              {flaggedRuleThreshold && (
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-semibold text-muted">{isHi ? 'सहनशीलता सीमा:' : 'Trigger Threshold:'}</span>
                  <span className="font-medium text-charcoal">{flaggedRuleThreshold}</span>
                </div>
              )}

              <p className="text-xs text-charcoal leading-relaxed bg-cream/50 p-2.5 rounded-lg border border-warm-border/40">
                {isHi
                  ? flaggedRuleReasonHi || 'वितरित राशि स्वीकृत राशि अथवा वैधानिक दर से भिन्न पाई गई है।'
                  : flaggedRuleReasonEn || 'The disbursed or received amount varies from the benchmark or sanctioned amount.'}
              </p>

              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-700 shrink-0 mt-0.5" />
                <p>
                  {isHi
                    ? 'महत्वपूर्ण: किसी विसंगति का पाया जाना किसी अनियमितता या गलत कार्य का प्रमाण नहीं है। कई बार यह सामान्य प्रशासनिक प्रक्रिया (जैसे मंडी नमी कटौती, चरणबद्ध किश्त, या दस्तावेजी शुल्क) के कारण हो सकता है।'
                    : 'Important: A flagged discrepancy is never proof of wrongdoing. Discrepancies often stem from routine administrative reasons such as partial tranches, quality moisture cuts, or legitimate fee deductions.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
