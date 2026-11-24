import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  Info,
  Scale,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { InsuranceVerificationOutput, StepArithmeticItem } from '../services/api';

interface ClaimCalculationCardProps {
  result: InsuranceVerificationOutput;
}

export const ClaimCalculationCard: React.FC<ClaimCalculationCardProps> = ({ result }) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const [isWhyFlaggedOpen, setIsWhyFlaggedOpen] = useState(false);

  const expected = result.claim_amount_expected ?? 0;
  const received = result.amount_received ?? 0;
  const diff = result.difference ?? 0;
  const isMatch = result.is_match || (diff === 0 && result.status === 'Verified');
  const isUnderReview = result.status === 'Under Review';
  const isNeedsReview = result.status === 'Needs Review' || (result.is_flagged && !isUnderReview);
  const isNotVerified = result.status === 'Not Verified';

  const renderOriginTag = (origin: string) => {
    switch (origin) {
      case 'official':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-2.5 h-2.5" />
            {isHi ? 'आधिकारिक स्रोत' : 'Official Source'}
          </span>
        );
      case 'bank_document':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileCheck2 className="w-2.5 h-2.5" />
            {isHi ? 'बैंक / बीमा दस्तावेज़' : 'Bank / Policy Document'}
          </span>
        );
      case 'user_entered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Calculator className="w-2.5 h-2.5" />
            {isHi ? 'दर्ज विवरण' : 'Entered by You'}
          </span>
        );
      case 'demo':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <Info className="w-2.5 h-2.5" />
            {isHi ? 'डेमो' : 'Demo'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-5 sm:p-7 space-y-6 shadow-soft">
      {/* Status Banner */}
      {isNotVerified ? (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {isHi ? result.status_label_hi : result.status_label}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {isHi ? result.explanation_hi : result.explanation}
            </p>
          </div>
        </div>
      ) : isMatch ? (
        <div className="p-4 rounded-2xl bg-tint/60 border border-forest/20 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest/15 text-forest flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-forest" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-forest">
                {isHi ? 'आंकड़े मेल खाते हैं (पूर्ण निपटान)' : 'Figures Match (Fully Settled)'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-forest text-white">
                {isHi ? 'सत्यापित' : 'Verified'}
              </span>
            </div>
            <p className="text-xs text-forest/90 mt-0.5 leading-relaxed font-medium">
              {isHi ? result.explanation_hi : result.explanation}
            </p>
          </div>
        </div>
      ) : isUnderReview ? (
        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
            <Clock className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-blue-900">
                {isHi ? result.status_label_hi : result.status_label}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                {isHi ? 'समीक्षाधीन' : 'Under Review'}
              </span>
            </div>
            <p className="text-xs text-blue-800/90 mt-0.5 leading-relaxed">
              {isHi ? result.explanation_hi : result.explanation}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-kisan-lightred border border-kisan-red/25 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-100 text-kisan-red flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5 text-kisan-red" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-kisan-red">
                {isHi ? result.status_label_hi : result.status_label}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                {isHi ? 'समीक्षा आवश्यक' : 'Needs Review'}
              </span>
            </div>
            <p className="text-xs text-red-900/90 mt-0.5 leading-relaxed">
              {isHi ? result.explanation_hi : result.explanation}
            </p>
          </div>
        </div>
      )}

      {/* 3 Metric Cards: Expected / Received / Difference */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Expected */}
        <div className="p-4 rounded-2xl bg-cream border border-warm-border/70 space-y-1">
          <span className="text-[11px] font-medium text-muted block">
            {isHi ? 'निर्धारित दावा पात्रता' : 'Assessed Entitlement'}
          </span>
          <div className="text-lg font-black text-charcoal">
            {result.claim_amount_expected !== null && result.claim_amount_expected !== undefined
              ? `₹${result.claim_amount_expected.toLocaleString('en-IN')}`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-forest font-semibold block">
            {isHi ? 'पीएमएफबीवाई गणना' : 'PMFBY Formula'}
          </span>
        </div>

        {/* Received */}
        <div className="p-4 rounded-2xl bg-cream border border-warm-border/70 space-y-1">
          <span className="text-[11px] font-medium text-muted block">
            {isHi ? 'बैंक में प्राप्त राशि' : 'Received in Bank'}
          </span>
          <div className="text-lg font-black text-charcoal">
            {result.amount_received !== null && result.amount_received !== undefined
              ? `₹${result.amount_received.toLocaleString('en-IN')}`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-muted font-semibold block">
            {isHi ? 'डीबीटी क्रेडिट' : 'DBT Credit Entry'}
          </span>
        </div>

        {/* Difference */}
        <div
          className={`p-4 rounded-2xl border space-y-1 ${
            isMatch
              ? 'bg-tint/40 border-forest/20'
              : diff > 0
              ? 'bg-amber-50/70 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}
        >
          <span className="text-[11px] font-medium text-muted block">
            {isMatch
              ? isHi
                ? 'अंतर (सहनशीलता में)'
                : 'Difference (Matched)'
              : isHi
              ? 'शेष / अंतर राशि'
              : 'Difference / Balance'}
          </span>
          <div
            className={`text-lg font-black ${
              isMatch
                ? 'text-forest'
                : diff > 0
                ? 'text-amber-800'
                : 'text-emerald-800'
            }`}
          >
            {diff !== null && diff !== undefined
              ? `₹${Math.abs(diff).toLocaleString('en-IN')}`
              : 'N/A'}
          </div>
          <span className="text-[10px] font-semibold block opacity-90">
            {isMatch
              ? isHi
                ? '✓ पूर्ण मिलान'
                : '✓ Figures Match'
              : diff > 0
              ? isHi
                ? 'समीक्षाधीन अंतर'
                : 'Pending Reconciliation'
              : isHi
              ? 'अतिरिक्त राज्य बोनस'
              : 'Supplementary Bonus'}
          </span>
        </div>
      </div>

      {/* Step-by-Step Arithmetic Section */}
      {result.step_by_step_arithmetic && result.step_by_step_arithmetic.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
                {isHi ? 'चरण-दर-चरण गणना एवं स्रोत' : 'Step-by-Step Calculation & Sources'}
              </h4>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-warm-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-cream-surface border-b border-warm-border text-[11px] text-muted font-bold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{isHi ? 'गणना पैरामीटर' : 'Calculation Parameter'}</th>
                  <th className="py-2.5 px-3 text-right">{isHi ? 'मान' : 'Value'}</th>
                  <th className="py-2.5 px-3 text-center">{isHi ? 'डेटा स्रोत' : 'Data Origin'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border/60">
                {result.step_by_step_arithmetic.map((step) => (
                  <tr key={step.step} className="hover:bg-cream/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-muted">{step.step}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-charcoal">
                        {isHi ? step.label_hi : step.label}
                      </div>
                      <div className="text-[10px] text-muted">{step.source_name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-charcoal">
                      {step.value}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {renderOriginTag(step.data_origin)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* "Why was this flagged?" Expandable Drawer */}
      <div className="border border-warm-border rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => setIsWhyFlaggedOpen(!isWhyFlaggedOpen)}
          className="w-full p-4 bg-cream flex items-center justify-between text-left hover:bg-cream-surface transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-forest" />
            <span className="text-xs font-bold text-charcoal">
              {isHi ? 'इस रिकॉर्ड को समीक्षा हेतु क्यों चिह्नित किया गया?' : 'Why was this record flagged for review?'}
            </span>
          </div>
          {isWhyFlaggedOpen ? (
            <ChevronUp className="w-4 h-4 text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted" />
          )}
        </button>

        {isWhyFlaggedOpen && (
          <div className="p-4 bg-white border-t border-warm-border text-xs text-charcoal/80 space-y-2 leading-relaxed animate-in fade-in duration-200">
            <p>
              {isHi ? result.why_flagged_details_hi : result.why_flagged_details}
            </p>
            <div className="p-3 rounded-xl bg-forest/5 border border-forest/15 text-[11px] text-forest flex items-start gap-2 font-medium">
              <Info className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
              <span>
                {isHi
                  ? 'अस्वीकरण: यह तुलना वैधानिक पीएमएफबीवाई नियमों पर आधारित एक पारदर्शी सूचनात्मक विश्लेषण है। यह किसी भी प्रकार के दोषारोपण का निष्कर्ष नहीं है। अंतिम निर्णय संबंधित बीमा समिति के अधिकार क्षेत्र में है।'
                  : 'Notice: This calculation is an informational comparison based on official PMFBY operational guidelines. A difference is not a finding of wrongdoing; tranches and acreage adjustments routinely account for differences.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
