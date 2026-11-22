import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { subscribeToApiToasts, ApiToastMessage } from '../lib/api';

export const ApiToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ApiToastMessage[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToApiToasts((toast) => {
      setToasts((prev) => [...prev.slice(-4), toast]); // keep at most 5 recent toasts

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== toast.id));
      }, 4500);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-gray-900 text-white border-gray-700';
        let icon = <Info className="w-4 h-4 text-sky-400 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-red-50 text-red-900 border-red-200 shadow-md';
          icon = <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 text-amber-900 border-amber-200 shadow-md';
          icon = <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
        } else if (toast.type === 'success') {
          bg = 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-md';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 shadow-lg transition-all transform animate-in slide-in-from-bottom-3 duration-200 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              {icon}
              <span className="leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
