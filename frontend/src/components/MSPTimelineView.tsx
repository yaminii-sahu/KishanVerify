import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Building2,
  PhoneCall,
  Loader2,
  Info,
  Truck,
  Scale,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  MSPTimelineResponse,
  MSPTimelineEvent,
  fetchMspTimelineApi,
} from '../services/api';

interface MSPTimelineViewProps {
  recordRef?: string;
  initialTimeline?: MSPTimelineResponse | null;
}

export const MSPTimelineView: React.FC<MSPTimelineViewProps> = ({
  recordRef = 'MSP-2024-4411',
  initialTimeline,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [timeline, setTimeline] = useState<MSPTimelineResponse | null>(
    initialTimeline || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(!initialTimeline);

  useEffect(() => {
    let isMounted = true;
    if (!initialTimeline) {
      setIsLoading(true);
      fetchMspTimelineApi(recordRef)
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
  }, [recordRef, initialTimeline]);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-warm-border/80 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-forest" />
        <p className="text-xs text-charcoal/70 font-medium">
          {isHi ? 'उपार्जन एवं भुगतान समयरेखा लोड हो रही है...' : 'Loading procurement & payment timeline...'}
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
            {isHi ? 'ई-उपार्जन पोर्टल' : 'Official Portal'}
          </span>
        );
      case 'procurement_record':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Scale className="w-2.5 h-2.5" />
            {isHi ? 'मंडी तौल पर्ची' : 'Mandi Weight Slip'}
          </span>
        );
      case 'bank_document':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <FileCheck2 className="w-2.5 h-2.5" />
            {isHi ? 'बैंक डीबीटी स्क्रॉल' : 'Bank DBT Scroll'}
          </span>
        );
      case 'user_entered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Info className="w-2.5 h-2.5" />
            {isHi ? 'किसान द्वारा दर्ज' : 'Farmer Entered'}
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

  const getEventIcon = (type: string, isMissing?: boolean) => {
    if (isMissing) {
      return <Clock className="w-4 h-4 text-amber-700 animate-pulse" />;
    }
    switch (type) {
      case 'registered':
        return <BadgeCheck className="w-4 h-4 text-forest" />;
      case 'produce_delivered':
        return <Truck className="w-4 h-4 text-emerald-600" />;
      case 'quality_checked':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'weighed':
        return <Scale className="w-4 h-4 text-indigo-600" />;
      case 'procurement_recorded':
        return <Building2 className="w-4 h-4 text-forest" />;
      case 'payment_initiated':
        return <Send className="w-4 h-4 text-amber-600" />;
      case 'payment_credited':
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
                {isHi ? 'उपार्जन से भुगतान समयरेखा' : 'Procurement-to-Payment Timeline'}
              </h3>
              <p className="text-xs text-muted">
                {isHi
                  ? `पावती: ${timeline.receipt_no_masked} • केंद्र: ${timeline.procurement_center}`
                  : `Receipt: ${timeline.receipt_no_masked} • Centre: ${timeline.procurement_center}`}
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
                {isHi ? 'भुगतान निपटान में विलंब हो सकता है' : 'Settlement may be delayed'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                {isHi
                  ? `${timeline.days_since_procurement} दिन (वैधानिक मानक: ${timeline.threshold_days} दिन)`
                  : `${timeline.days_since_procurement} days elapsed (threshold: ${timeline.threshold_days}d)`}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/90">
              {isHi ? timeline.delay_notice_hi : timeline.delay_notice_en}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] text-amber-950 font-medium">
              <span className="inline-flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-amber-700" />
                {isHi ? 'किसान कॉल सेंटर: 1800-180-1551' : 'Kisan Call Centre: 1800-180-1551'}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-700" />
                {isHi ? 'मंडी सचिव / उपार्जन केंद्र' : 'Mandi Secretary / Centre Office'}
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
                    : 'bg-white border-forest/30 text-forest shadow-xs'
                }`}
              >
                {getEventIcon(ev.event_type, isMissing)}
              </div>

              {/* Event Content */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal">
                      {ev.date}
                    </span>
                    {renderOriginBadge(ev.data_origin)}
                  </div>
                  {ev.amount !== null && ev.amount !== undefined && (
                    <span
                      className={`text-xs font-extrabold ${
                        isMissing
                          ? 'text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md'
                          : 'text-forest'
                      }`}
                    >
                      {isMissing
                        ? `${isHi ? 'लंबित राशि:' : 'Pending:'} ₹${ev.amount.toLocaleString('en-IN')}`
                        : `₹${ev.amount.toLocaleString('en-IN')}`}
                    </span>
                  )}
                  {ev.quantity !== null && ev.quantity !== undefined && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {ev.quantity} {isHi ? 'क्विंटल' : 'Qtl'}
                    </span>
                  )}
                </div>

                <p className="text-xs text-charcoal/90 leading-relaxed">
                  {isHi ? ev.description_hi : ev.description_en}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="font-medium">
                    {isHi ? 'स्रोत दस्तावेज़:' : 'Source:'}
                  </span>
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
