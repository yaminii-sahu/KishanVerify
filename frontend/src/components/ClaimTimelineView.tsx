import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  FileCheck2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  FileText,
  BadgeCheck,
  Building2,
  PhoneCall,
  Loader2,
  Info,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  ClaimTimelineResponse,
  ClaimTimelineEvent,
  fetchClaimTimelineApi,
} from '../services/api';

interface ClaimTimelineViewProps {
  claimRef?: string;
  initialTimeline?: ClaimTimelineResponse | null;
}

export const ClaimTimelineView: React.FC<ClaimTimelineViewProps> = ({
  claimRef = 'INS-2024-7711',
  initialTimeline,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [timeline, setTimeline] = useState<ClaimTimelineResponse | null>(
    initialTimeline || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialTimeline);

  useEffect(() => {
    let isMounted = true;
    if (!initialTimeline) {
      setIsLoading(true);
      fetchClaimTimelineApi(claimRef)
        .then((data) => {
          if (isMounted) setTimeline(data);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      setTimeline(initialTimeline);
    }
    return () => {
      isMounted = false;
    };
  }, [claimRef, initialTimeline]);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-warm-border/80 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-forest" />
        <p className="text-xs text-charcoal/70 font-medium">
          {isHi ? 'दावा स्थिति समयरेखा लोड हो रही है...' : 'Loading claim status timeline...'}
        </p>
      </div>
    );
  }

  if (!timeline) {
    return null;
  }

  const renderOriginBadge = (origin: string) => {
    switch (origin) {
      case 'official':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-2.5 h-2.5" />
            {isHi ? 'आधिकारिक पोर्टल' : 'Official Portal'}
          </span>
        );
      case 'bank_document':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileCheck2 className="w-2.5 h-2.5" />
            {isHi ? 'बैंक डीबीटी रिकॉर्ड' : 'Bank DBT Advice'}
          </span>
        );
      case 'user_entered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Info className="w-2.5 h-2.5" />
            {isHi ? 'किसान द्वारा दर्ज' : 'Farmer Intimation'}
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

  const getEventIcon = (type: string, isMissing: boolean) => {
    if (isMissing) {
      return <Clock className="w-4 h-4 text-amber-700 animate-pulse" />;
    }
    switch (type) {
      case 'policy_enrolled':
        return <BadgeCheck className="w-4 h-4 text-forest" />;
      case 'loss_intimated':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'survey_done':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'claim_calculated':
        return <Building2 className="w-4 h-4 text-indigo-600" />;
      case 'claim_approved':
        return <BadgeCheck className="w-4 h-4 text-forest" />;
      case 'amount_credited':
        return <BadgeCheck className="w-4 h-4 text-emerald-700" />;
      case 'note':
      default:
        return <Info className="w-4 h-4 text-charcoal/60" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-5 sm:p-7 space-y-6 shadow-soft">
      {/* Header and Current Stage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal">
                {isHi ? 'दावा प्रगति एवं स्थिति समयरेखा' : 'Claim Progress & Status Timeline'}
              </h3>
              <p className="text-xs text-muted">
                {isHi
                  ? `दावा संदर्भ: ${timeline.insurance_ref} • फसल: ${timeline.crop}`
                  : `Claim Ref: ${timeline.insurance_ref} • Crop: ${timeline.crop}`}
              </p>
            </div>
          </div>
        </div>

        {/* Current Stage Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-tint/60 border border-forest/20 text-forest">
          <div className="w-2 h-2 rounded-full bg-forest animate-ping" />
          <div className="text-xs">
            <span className="font-semibold block">
              {isHi ? 'वर्तमान चरण:' : 'Current Stage:'}
            </span>
            <span className="text-[11px] font-medium opacity-90">
              {isHi ? timeline.current_stage_hi : timeline.current_stage}
            </span>
          </div>
        </div>
      </div>

      {/* Delay Warning Banner if applicable */}
      {timeline.is_delayed && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900 leading-relaxed shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between font-semibold">
              <span>
                {isHi ? 'प्रसंस्करण में विलंब हो सकता है' : 'Settlement may be delayed'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                {isHi
                  ? `${timeline.days_in_current_stage} दिन (मानक: ${timeline.threshold_days} दिन)`
                  : `${timeline.days_in_current_stage} days elapsed (threshold: ${timeline.threshold_days}d)`}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90">
              {isHi ? timeline.delay_notice_hi : timeline.delay_notice_en}
            </p>
            <div className="pt-1 flex items-center gap-3 text-[11px] text-amber-950 font-medium">
              <span className="inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-amber-700" />
                {isHi ? 'पीएमएफबीवाई हेल्पलाइन: 14447' : 'PMFBY Helpline: 14447'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-700" />
                {isHi ? 'जिला नोडल कृषि अधिकारी' : 'District Nodal Officer'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Sequence */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-warm-border">
        {timeline.events.map((ev, index) => {
          const isMissing = ev.is_missing_placeholder;

          return (
            <div
              key={index}
              className={`relative group transition-all duration-200 ${
                isMissing
                  ? 'p-3.5 rounded-2xl border border-dashed border-amber-300 bg-amber-50/40'
                  : ''
              }`}
            >
              {/* Dot Icon on Timeline Bar */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isMissing
                    ? 'bg-amber-100 border-amber-400 text-amber-800 ring-4 ring-amber-50'
                    : ev.is_current_stage
                    ? 'bg-forest text-white border-forest ring-4 ring-forest/15'
                    : 'bg-white border-forest/60 text-forest shadow-xs'
                }`}
              >
                {getEventIcon(ev.event_type, isMissing)}
              </div>

              {/* Event Content Box */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal">
                      {isHi
                        ? ev.event_type === 'policy_enrolled'
                          ? 'पॉलिसी नामांकन'
                          : ev.event_type === 'loss_intimated'
                          ? 'फसल नुकसान सूचना'
                          : ev.event_type === 'survey_done'
                          ? 'खेत सर्वेक्षण संपन्न'
                          : ev.event_type === 'claim_calculated'
                          ? 'दावा पात्रता निर्धारण'
                          : ev.event_type === 'claim_approved'
                          ? 'दावा अनुमोदन'
                          : ev.event_type === 'amount_credited'
                          ? isMissing
                            ? 'शेष किश्त भुगतान लंबित'
                            : 'खाते में राशि जमा'
                          : 'समीक्षा नोट'
                        : ev.event_type === 'policy_enrolled'
                        ? 'Policy Enrolled'
                        : ev.event_type === 'loss_intimated'
                        ? 'Loss Intimated'
                        : ev.event_type === 'survey_done'
                        ? 'Field Survey Done'
                        : ev.event_type === 'claim_calculated'
                        ? 'Claim Calculated'
                        : ev.event_type === 'claim_approved'
                        ? 'Claim Sanctioned'
                        : ev.event_type === 'amount_credited'
                        ? isMissing
                          ? 'Pending Final Tranche Release'
                          : 'Amount Credited'
                        : 'Administrative Note'}
                    </span>
                    {renderOriginBadge(ev.data_origin)}
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Calendar className="w-3 h-3" />
                    <span>{ev.date}</span>
                    {ev.amount !== null && ev.amount !== undefined && ev.amount > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-extrabold ${
                          isMissing
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-forest/10 text-forest'
                        }`}
                      >
                        ₹{ev.amount.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-charcoal/80 leading-relaxed">
                  {isHi ? ev.description_hi : ev.description_en}
                </p>

                <div className="text-[11px] text-muted flex items-center gap-1.5 pt-0.5">
                  <span className="font-semibold">{isHi ? 'स्रोत:' : 'Source:'}</span>
                  <span>{ev.source}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
