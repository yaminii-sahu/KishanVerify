import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Key, CheckCircle2, Save, RefreshCw } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [discrepancyThreshold, setDiscrepancyThreshold] = useState('500');
  const [autoEscalateDays, setAutoEscalateDays] = useState('7');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [geminiApiKeySet, setGeminiApiKeySet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary-700" />
          System & Reconciliation Settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure discrepancy thresholds, automated alert escalations, and API integrations.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium">Settings updated successfully! System reconciliation policies updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Verification Engine Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Shield className="w-5 h-5 text-primary-700" />
            <h2 className="text-base font-semibold text-gray-900">Verification & Review Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Discrepancy Flagging Threshold (₹)
              </label>
              <input
                type="number"
                value={discrepancyThreshold}
                onChange={(e) => setDiscrepancyThreshold(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Any difference above this amount automatically flags the case for review.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                Auto-Escalation Window (Days)
              </label>
              <input
                type="number"
                value={autoEscalateDays}
                onChange={(e) => setAutoEscalateDays(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
              />
              <span className="text-xs text-gray-500 mt-1 block">
                Unresolved discrepancies are escalated to the District Lead Bank Manager.
              </span>
            </div>
          </div>
        </div>

        {/* AI & Integration Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Key className="w-5 h-5 text-primary-700" />
            <h2 className="text-base font-semibold text-gray-900">AI Intelligence & Model Providers</h2>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">Gemini 2.5 Flash / Pro Engine</div>
                <div className="text-xs text-gray-500">Provides bilingual conversational explanations in Hindi/English</div>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active (Deterministic Fallback Ready)
              </span>
            </div>

            <div className="text-xs text-gray-600 border-t border-gray-200 pt-2">
              <strong>Core Principle:</strong> All financial arithmetic is computed deterministically by the Python verification engine before reaching the language model.
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Bell className="w-5 h-5 text-primary-700" />
            <h2 className="text-base font-semibold text-gray-900">Farmer Notification Channel</h2>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={(e) => setSmsAlerts(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">Send Instant SMS on Discrepancy Resolution</div>
              <div className="text-xs text-gray-500">Dispatches localized SMS via Saral Sandesh Gateway upon review resolution</div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white font-medium text-sm rounded-lg shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
