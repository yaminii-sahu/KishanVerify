import React, { useState } from 'react';
import { Settings, Shield, Key, CheckCircle2, Save } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState('500');
  const [autoEscalateDays, setAutoEscalateDays] = useState('7');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-charcoal tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest" />
          System & Reconciliation Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-muted mt-1">
          Configure discrepancy thresholds, automated alert escalations, and API integrations.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-status-eligible border border-status-eligible-text/20 text-status-eligible-text p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-status-eligible-text shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">Settings updated successfully! System reconciliation policies updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Engine Settings */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl border border-warm-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-warm-border pb-3">
            <Shield className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-charcoal">Verification & Review Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase mb-1.5">
                Discrepancy Flagging Threshold (₹)
              </label>
              <input
                type="number"
                value={discrepancyThreshold}
                onChange={(e) => setDiscrepancyThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-cream border border-warm-border rounded-xl text-charcoal focus:ring-2 focus:ring-olive focus:outline-none"
              />
              <span className="text-[11px] text-charcoal-muted mt-1 block">
                Any difference above this amount automatically flags the case for review.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase mb-1.5">
                Auto-Escalation Window (Days)
              </label>
              <input
                type="number"
                value={autoEscalateDays}
                onChange={(e) => setAutoEscalateDays(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-cream border border-warm-border rounded-xl text-charcoal focus:ring-2 focus:ring-olive focus:outline-none"
              />
              <span className="text-[11px] text-charcoal-muted mt-1 block">
                Unresolved discrepancies are escalated to the District Lead Bank Manager.
              </span>
            </div>
          </div>
        </div>

        {/* AI & Integration Status */}
        <div className="bg-cream-surface rounded-2xl sm:rounded-3xl border border-warm-border p-5 sm:p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-warm-border pb-3">
            <Key className="w-5 h-5 text-forest" />
            <h2 className="text-sm sm:text-base font-bold text-charcoal">AI Intelligence & Model Providers</h2>
          </div>

          <div className="p-4 rounded-xl bg-cream border border-warm-border space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs sm:text-sm font-bold text-charcoal">Gemini 2.5 Flash / Pro Engine</div>
                <div className="text-[11px] sm:text-xs text-charcoal-muted">Provides bilingual conversational explanations in Hindi/English</div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-status-eligible text-status-eligible-text flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active (Deterministic Fallback Ready)
              </span>
            </div>

            <div className="text-xs text-charcoal-muted border-t border-warm-border pt-2 leading-relaxed">
              <strong>Core Principle:</strong> All financial arithmetic is computed deterministically by the Python verification engine before reaching the language model.
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="h-12 px-6 bg-olive hover:bg-forest text-white font-bold text-xs sm:text-sm rounded-xl shadow-soft flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save System Policies</span>
        </button>
      </form>
    </div>
  );
};
