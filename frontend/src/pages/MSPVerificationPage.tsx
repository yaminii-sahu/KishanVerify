import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Coins, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  Calculator, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { verifyMspApi } from '../services/api';

export const MSPVerificationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { farmer } = useAuth();
  const navigate = useNavigate();

  // Form Inputs (Blueprint example: 50 quintals * 2300 = 115000 expected, 105000 received, diff 10000)
  const [crop, setCrop] = useState('Paddy (Common)');
  const [quantity, setQuantity] = useState<number>(50);
  const [mspRate, setMspRate] = useState<number>(2300);
  const [actualPayment, setActualPayment] = useState<number>(105000);
  const [procurementCenter, setProcurementCenter] = useState('Patan Krishi Upaj Mandi');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await verifyMspApi({
        crop,
        quantity_quintals: quantity,
        msp_rate: mspRate,
        actual_payment: actualPayment,
        procurement_center: procurementCenter,
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

  const loadSampleDiscrepancy = () => {
    setQuantity(50);
    setMspRate(2300);
    setActualPayment(105000);
    setResult(null);
  };

  const loadSampleMatch = () => {
    setQuantity(50);
    setMspRate(2300);
    setActualPayment(115000);
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
              {language === 'hi' ? 'एमएसपी और भुगतान स्थिति' : 'MSP & Payment Status'}
            </h1>
            <p className="text-xs text-gray-500">
              Verify Minimum Support Price crop procurement payments
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={loadSampleDiscrepancy}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-kisan-lightred text-kisan-red border border-kisan-red/30 hover:bg-red-100 transition-colors"
          >
            Load ₹10k Difference
          </button>
          <button
            onClick={loadSampleMatch}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-sage-100 text-sage-800 border border-sage-300 hover:bg-sage-200 transition-colors"
          >
            Load Full MSP Match
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form */}
        <div className="lg:col-span-7 bg-cream-surface rounded-2xl p-5 sm:p-7 border border-warm-border shadow-soft space-y-4">
          <div className="border-b border-warm-border pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-charcoal">
                Crop Procurement Information
              </h2>
              <p className="text-xs text-muted">
                Formula: Expected = Quantity (qtl) × MSP Rate (₹/qtl)
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-tint text-forest flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Crop Variety
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
              >
                <option value="Paddy (Common)">Paddy Common (₹2,300/qtl)</option>
                <option value="Paddy (Grade A)">Paddy Grade A (₹2,320/qtl)</option>
                <option value="Wheat">Wheat (₹2,275/qtl)</option>
                <option value="Maize">Maize (₹2,225/qtl)</option>
                <option value="Soybean">Soybean (₹4,892/qtl)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  Procured Quantity (Quintals)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">
                  MSP Rate per Quintal (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  value={mspRate}
                  onChange={(e) => setMspRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Actual Payment Received in Bank (₹)
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="100"
                value={actualPayment}
                onChange={(e) => setActualPayment(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-bold text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Mandi / Procurement Center
              </label>
              <input
                type="text"
                value={procurementCenter}
                onChange={(e) => setProcurementCenter(e.target.value)}
                className="w-full px-4 py-3 bg-cream rounded-xl border border-warm-border text-sm font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-olive min-h-[48px]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] py-3.5 px-6 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-sm shadow-soft flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Computing MSP entitlement...</span>
                ) : (
                  <>
                    <span>Verify MSP Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Result Pane (Matches mockup screenshot) */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-warm-border shadow-card space-y-5 animate-in fade-in duration-300">
              
              {/* Paddy badge header */}
              <div className="p-4 rounded-2xl bg-warm-card border border-warm-border flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{result.crop}</h3>
                  <p className="text-xs text-gray-500">{result.quantity_quintals} Quintals</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 uppercase font-semibold">MSP Rate</p>
                  <p className="text-sm font-bold text-sage-800">₹{result.msp_rate}/qtl</p>
                </div>
              </div>

              {/* Expected vs Actual 2-Col Card */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border">
                  <p className="text-xs text-gray-500 mb-1">Expected Payment</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    ₹{result.expected_payment.toLocaleString()}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-warm-bg border border-warm-border">
                  <p className="text-xs text-gray-500 mb-1">Actual Payment</p>
                  <p className="text-lg font-extrabold text-gray-900">
                    ₹{result.actual_payment.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Discrepancy Alert */}
              {result.is_flagged ? (
                <div className="p-4 rounded-2xl bg-kisan-lightred border border-kisan-red/25 space-y-1">
                  <div className="flex items-center gap-2 text-kisan-red font-bold text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Payment Discrepancy Detected!</span>
                  </div>
                  <p className="text-xs font-extrabold text-kisan-red">
                    Difference: ₹{result.difference.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#EDF7ED] border border-[#C8E6C9] space-y-1">
                  <div className="flex items-center gap-2 text-[#2E7D32] font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Payment Matches Statutory MSP</span>
                  </div>
                  <p className="text-xs text-green-800 leading-relaxed pt-1">
                    {result.explanation}
                  </p>
                </div>
              )}

              {/* Reasons */}
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2">
                  Possible reasons
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

              {/* Action buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => navigate('/farmer/reports')}
                  className="w-full py-3.5 px-6 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-sm shadow-card flex items-center justify-center gap-2 transition-all"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download MSP Report</span>
                </button>

                {result.is_flagged && (
                  <button
                    onClick={() => navigate('/farmer/grievance')}
                    className="w-full py-3 px-6 rounded-2xl bg-white border border-warm-border hover:bg-warm-bg text-gray-800 font-semibold text-sm shadow-soft flex items-center justify-center gap-2 transition-all"
                  >
                    <HelpCircle className="w-4 h-4 text-kisan-red" />
                    <span>Raise a Complaint</span>
                  </button>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-warm-border text-center flex flex-col items-center justify-center min-h-[360px] text-gray-400">
              <div className="w-16 h-16 rounded-full bg-sage-50 text-sage-600 flex items-center justify-center mb-3">
                <Coins className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-gray-700 mb-1">
                MSP Calculator Ready
              </h3>
              <p className="text-xs max-w-xs leading-relaxed text-gray-500">
                Click <strong>"Verify MSP Payment"</strong> to compare expected rate against received payment.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
