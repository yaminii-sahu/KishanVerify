import React, { useState, useEffect } from 'react';
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  ArrowRightLeft,
  Info,
  Building2,
  User,
  Calculator,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  MSPQuantityCrossCheckOutput,
  crossCheckMspQuantityApi,
  getFallbackMspQuantityCrossCheck,
} from '../services/api';

interface MSPQuantityCrossCheckCardProps {
  farmerQuantity: number;
  mspRate: number;
  weightSlipQuantity?: number | null;
  portalQuantity?: number | null;
  weightSlipRef?: string;
  portalRef?: string;
  initialData?: MSPQuantityCrossCheckOutput;
}

export const MSPQuantityCrossCheckCard: React.FC<MSPQuantityCrossCheckCardProps> = ({
  farmerQuantity,
  mspRate,
  weightSlipQuantity = 50.0,
  portalQuantity = 48.0,
  weightSlipRef = 'REC-PTN-****441',
  portalRef = 'CG-KRY-****891',
  initialData,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [unitMode, setUnitMode] = useState<'qtl' | 'kg'>('qtl');
  const [data, setData] = useState<MSPQuantityCrossCheckOutput>(
    initialData ||
      getFallbackMspQuantityCrossCheck({
        farmer_quantity: farmerQuantity,
        msp_rate: mspRate,
        weight_slip_quantity: weightSlipQuantity,
        portal_quantity: portalQuantity,
        weight_slip_ref: weightSlipRef,
        portal_ref: portalRef,
        unit_input: 'quintal',
      })
  );

  useEffect(() => {
    let isMounted = true;
    crossCheckMspQuantityApi({
      farmer_quantity: farmerQuantity,
      msp_rate: mspRate,
      weight_slip_quantity: weightSlipQuantity,
      portal_quantity: portalQuantity,
      weight_slip_ref: weightSlipRef,
      portal_ref: portalRef,
      unit_input: 'quintal',
    }).then((res) => {
      if (isMounted) setData(res);
    });
    return () => {
      isMounted = false;
    };
  }, [farmerQuantity, mspRate, weightSlipQuantity, portalQuantity, weightSlipRef, portalRef]);

  if (!data) return null;

  const renderOriginBadge = (origin: string) => {
    switch (origin) {
      case 'official':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-forest/10 text-forest border border-forest/20">
            <ShieldCheck className="w-2.5 h-2.5" />
            {isHi ? 'सरकारी पोर्टल' : 'Official Portal'}
          </span>
        );
      case 'procurement_record':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Scale className="w-2.5 h-2.5" />
            {isHi ? 'इलेक्ट्रॉनिक धर्मकांटा' : 'Mandi Weighbridge'}
          </span>
        );
      case 'user_entered':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <User className="w-2.5 h-2.5" />
            {isHi ? 'किसान द्वारा दर्ज' : 'Farmer Claimed'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-5 sm:p-7 space-y-6 shadow-soft">
      {/* Header and Unit Converter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-tint text-forest flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-charcoal">
              {isHi ? 'विभिन्न अभिलेखों से वजन / मात्रा मिलान' : 'Multi-Source Quantity Cross-Check'}
            </h3>
          </div>
          <p className="text-xs text-muted pt-1">
            {isHi
              ? 'किसान प्रविष्टि, मंडी तौल पर्ची एवं ई-उपार्जन पोर्टल के बीच वजन का सत्यापन'
              : 'Verifying physical delivered weight vs weighbridge slip vs civil supplies portal'}
          </p>
        </div>

        {/* Segmented Unit Selector */}
        <div className="flex items-center gap-1 bg-warm-bg p-1 rounded-xl border border-warm-border/80 self-start sm:self-auto">
          <button
            onClick={() => setUnitMode('qtl')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              unitMode === 'qtl'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            {isHi ? 'क्विंटल (Qtl)' : 'Quintals (Qtl)'}
          </button>
          <button
            onClick={() => setUnitMode('kg')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              unitMode === 'kg'
                ? 'bg-forest text-white shadow-xs'
                : 'text-charcoal/70 hover:text-charcoal'
            }`}
          >
            {isHi ? 'किलोग्राम (Kg)' : 'Kilograms (Kg)'}
          </button>
        </div>
      </div>

      {/* 3-Column Sources Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {data.sources.map((src, idx) => {
          const displayQty = unitMode === 'qtl' ? `${src.quantity_qtl} Qtl` : `${src.quantity_kg.toLocaleString('en-IN')} kg`;
          const secondaryQty = unitMode === 'qtl' ? `(${src.quantity_kg.toLocaleString('en-IN')} kg)` : `(${src.quantity_qtl} Qtl)`;

          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-cream border border-warm-border flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  {renderOriginBadge(src.data_origin)}
                  {src.reference_id && (
                    <span className="text-[10px] font-mono text-muted">
                      {src.reference_id}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-charcoal">
                  {isHi ? src.source_name_hi : src.source_name_en}
                </h4>
              </div>

              <div className="pt-2 border-t border-warm-border/60">
                <p className="text-lg font-extrabold text-charcoal tracking-tight">
                  {displayQty}
                </p>
                <p className="text-[11px] text-muted font-medium">
                  {secondaryQty}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discrepancy & Economic Impact Banner */}
      {data.has_discrepancy ? (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                {isHi ? 'वजन / मात्रा में अंतर दर्ज' : 'Weight Variance Detected Across Records'}
              </span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Δ {data.max_difference_qtl} Qtl ({data.max_difference_kg} kg)
            </span>
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed">
            {isHi ? data.explanation_hi : data.explanation_en}
          </p>

          <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-amber-800" />
              <span className="text-amber-800 font-medium">
                {isHi ? 'सटीक आर्थिक प्रभाव:' : 'Calculated Monetary Impact:'}
              </span>
              <span className="font-extrabold text-amber-950 text-sm">
                ₹{data.monetary_impact.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-800/80">
                ({data.max_difference_qtl} Qtl × ₹{data.msp_rate}/qtl)
              </span>
            </div>

            <span className="text-[11px] text-amber-900 font-semibold underline decoration-dotted">
              {isHi ? 'तौल पर्ची की पावती से मिलान करें' : 'Verify with Weighbridge Slip Copy'}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              {isHi ? 'सभी अभिलेखों में दर्ज वजन एकसमान है' : 'Weight Verified: All 3 Records Match'}
            </span>
          </div>
          <p className="text-xs text-emerald-900/90 leading-relaxed">
            {isHi ? data.explanation_hi : data.explanation_en}
          </p>
        </div>
      )}

      {/* Unit Conversion Transparent Footnote */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted pt-1 border-t border-warm-border/60">
        <span className="inline-flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3 text-muted" />
          {isHi ? data.unit_conversion_note_hi : data.unit_conversion_note_en}
        </span>
        <span>
          {isHi ? 'इलेक्ट्रॉनिक धर्मकांटा कैलिब्रेशन मानक' : 'Certified Weighbridge Calibration Protocol'}
        </span>
      </div>
    </div>
  );
};
