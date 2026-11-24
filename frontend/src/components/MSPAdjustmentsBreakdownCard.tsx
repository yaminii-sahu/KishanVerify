import React, { useState } from 'react';
import {
  HelpCircle,
  Copy,
  Check,
  Volume2,
  VolumeX,
  AlertTriangle,
  ShieldCheck,
  Scale,
  FileCheck2,
  Building2,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';

export interface AdjustmentItem {
  id?: string;
  category: string;
  label_en: string;
  label_hi: string;
  amount: number;
  rate_rule?: string;
  is_statutory?: boolean;
  is_flagged?: boolean;
  flag_reason_en?: string;
  flag_reason_hi?: string;
  authority?: string;
  data_origin?: string;
}

export interface QuestionItem {
  id: string;
  category: string;
  target_authority: string;
  statutory_reference: string;
  question_en: string;
  question_hi: string;
}

interface MSPAdjustmentsBreakdownCardProps {
  grossExpected: number;
  actualPayment: number;
  totalDifference: number;
  totalExplained: number;
  unexplainedDifference: number;
  adjustments: AdjustmentItem[];
  questionsToAsk?: QuestionItem[];
  crop?: string;
}

export const MSPAdjustmentsBreakdownCard: React.FC<MSPAdjustmentsBreakdownCardProps> = ({
  grossExpected,
  actualPayment,
  totalDifference,
  totalExplained,
  unexplainedDifference,
  adjustments,
  questionsToAsk = [],
  crop = 'Paddy',
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = isHi ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    utterance.onend = () => setPlayingId(null);
    utterance.onerror = () => setPlayingId(null);

    setPlayingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Recharts waterfall data
  const chartData = [
    {
      name: isHi ? 'सकल पात्रता' : 'Gross Expected',
      amount: grossExpected,
      color: '#4E6E3D', // Forest
    },
    {
      name: isHi ? 'प्रमाणित कटौतियां' : 'Explained Deductions',
      amount: totalExplained,
      color: '#829B70', // Sage/Olive
    },
    {
      name: isHi ? 'अस्पष्ट अंतर' : 'Unexplained',
      amount: unexplainedDifference,
      color: '#D97706', // Amber
    },
    {
      name: isHi ? 'प्राप्त बैंक राशि' : 'Net Received',
      amount: actualPayment,
      color: '#1E3A1E', // Dark Forest
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-warm-border p-5 sm:p-7 space-y-6 shadow-soft">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-border/80">
        <div>
          <h3 className="text-base font-bold text-charcoal">
            {isHi ? 'मदवार कटौतियां एवं अस्पष्ट अंतर विश्लेषण' : 'Itemized Deductions & Discrepancy Breakdown'}
          </h3>
          <p className="text-xs text-muted">
            {isHi
              ? 'वैधानिक मंडी नियमों के अनुसार सत्यापित एवं अस्पष्ट अंतर का विभाजन'
              : 'Explained deductions vs. unexplained difference audited against APMC guidelines'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-tint text-forest border border-forest/20">
            {isHi ? 'वैधानिक ऑडिट' : 'Deterministic Audit'}
          </span>
        </div>
      </div>

      {/* Visual Chart */}
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#4B5563' }} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, isHi ? 'राशि' : 'Amount']}
              contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto rounded-2xl border border-warm-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-warm-bg/70 text-charcoal font-bold uppercase tracking-wider text-[10px] border-b border-warm-border">
            <tr>
              <th className="py-2.5 px-3">{isHi ? 'मद विवरण' : 'Line Item'}</th>
              <th className="py-2.5 px-3">{isHi ? 'प्राधिकरण / नियम' : 'Rule / Authority'}</th>
              <th className="py-2.5 px-3 text-right">{isHi ? 'राशि (₹)' : 'Amount (₹)'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-warm-border/60">
            {/* Gross Entitlement Row */}
            <tr className="bg-emerald-50/50 font-bold text-forest">
              <td className="py-3 px-3">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest shrink-0" />
                  {isHi ? 'सकल वैधानिक एमएसपी पात्रता' : 'Gross Statutory Entitlement'}
                </span>
              </td>
              <td className="py-3 px-3 text-[11px] text-forest/80 font-normal">
                {isHi ? 'सीएसीपी / भारत सरकार अधिसूचित दर' : 'CACP / DA&FW Notified MSP'}
              </td>
              <td className="py-3 px-3 text-right text-sm">
                ₹{grossExpected.toLocaleString('en-IN')}
              </td>
            </tr>

            {/* Adjustments Rows */}
            {adjustments.map((adj, idx) => {
              const isUnexplained = adj.category === 'unexplained';

              return (
                <tr
                  key={idx}
                  className={
                    isUnexplained
                      ? 'bg-amber-50/80 font-semibold text-amber-900 border-l-4 border-l-amber-500'
                      : 'hover:bg-warm-bg/30 text-charcoal'
                  }
                >
                  <td className="py-2.5 px-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-medium">
                        {isUnexplained ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        ) : (
                          <Scale className="w-3.5 h-3.5 text-sage-600 shrink-0" />
                        )}
                        <span>{isHi ? adj.label_hi : adj.label_en}</span>
                      </div>
                      {adj.rate_rule && (
                        <p className="text-[10px] text-muted pl-5">{adj.rate_rule}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-muted">
                    {adj.authority || (isHi ? 'मंडी समिति' : 'Mandi Samiti')}
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      isUnexplained ? 'text-amber-800' : 'text-charcoal'
                    }`}
                  >
                    -₹{adj.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}

            {/* Net Received Row */}
            <tr className="bg-warm-bg font-extrabold text-charcoal text-sm border-t-2 border-warm-border">
              <td className="py-3 px-3" colSpan={2}>
                {isHi ? 'बैंक खाते में जमा वास्तविक भुगतान' : 'Net Payment Credited to Bank'}
              </td>
              <td className="py-3 px-3 text-right text-forest">
                ₹{actualPayment.toLocaleString('en-IN')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Explanatory summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-forest/5 border border-forest/15 space-y-1">
          <p className="text-[11px] font-semibold text-forest uppercase tracking-wider">
            {isHi ? 'प्रमाणित कटौतियां' : 'Itemized Explained Deductions'}
          </p>
          <p className="text-base font-extrabold text-forest">
            ₹{totalExplained.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-forest/80">
            {isHi
              ? 'हम्माली, नमी गुणवत्ता कटौती, बारदाना एवं पैक्स समिति समायोजन'
              : 'Handling, moisture FAQ cut, gunny bag, and PACS society recovery'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
          <p className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
            {isHi ? 'अस्पष्ट अंतर (समीक्षा आवश्यक)' : 'Unexplained Difference'}
          </p>
          <p className="text-base font-extrabold text-amber-900">
            ₹{unexplainedDifference.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-amber-800/90">
            {isHi
              ? 'बिना दर्ज कारण के शेष अंतर; अपने उपार्जन केंद्र से जे-फॉर्म मांगें'
              : 'Balance without matching statutory rule; request itemized J-Form from center'}
          </p>
        </div>
      </div>

      {/* Questions to Ask Procurement Centre */}
      {questionsToAsk.length > 0 && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-forest" />
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              {isHi
                ? 'उपार्जन केंद्र या बैंक शाखा से पूछने हेतु प्रश्न'
                : 'Questions to Ask Your Procurement Centre'}
            </h4>
          </div>

          <div className="space-y-2.5">
            {questionsToAsk.map((q) => {
              const textToSpeak = isHi ? q.question_hi : q.question_en;
              const isCopied = copiedId === q.id;
              const isSpeaking = playingId === q.id;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-2xl bg-cream border border-warm-border/90 space-y-2 hover:border-forest/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-tint text-forest border border-forest/20">
                      {q.target_authority}
                    </span>
                    <span className="text-[10px] text-muted truncate max-w-[200px]">
                      {q.statutory_reference}
                    </span>
                  </div>

                  <p className="text-xs text-charcoal leading-relaxed font-medium">
                    "{isHi ? q.question_hi : q.question_en}"
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-warm-border/40">
                    <button
                      onClick={() => handleCopy(q.id, textToSpeak)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-warm-border hover:bg-warm-bg text-[11px] font-semibold text-charcoal/80 flex items-center gap-1 transition-all"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-forest" />
                          <span className="text-forest">{isHi ? 'कॉपी हो गया' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-charcoal/60" />
                          <span>{isHi ? 'प्रश्न कॉपी करें' : 'Copy Question'}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSpeak(q.id, textToSpeak)}
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-all ${
                        isSpeaking
                          ? 'bg-forest text-white border-forest'
                          : 'bg-white border-warm-border hover:bg-warm-bg text-charcoal/80'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-white animate-pulse" />
                          <span>{isHi ? 'रोकें' : 'Stop'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 text-forest" />
                          <span>{isHi ? 'सुनें' : 'Listen'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
