import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getLanguageInfo } from '../lib/languages';

export const DraftLanguageBanner: React.FC = () => {
  const { language } = useLanguage();
  const [dismissedForLang, setDismissedForLang] = useState<string | null>(null);

  const langInfo = getLanguageInfo(language);

  if (langInfo.reviewStatus === 'reviewed' || dismissedForLang === language) {
    return null;
  }

  const noticeText =
    langInfo.draftWarningNative ||
    langInfo.draftWarningEn ||
    'Translation may contain errors. Please verify with your bank branch or the official portal.';

  return (
    <aside
      aria-label="Language translation disclaimer"
      className="bg-amber-50 dark:bg-amber-950/80 border-b border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs px-3 py-1.5 flex items-center justify-between z-40 transition-all"
    >
      <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="leading-snug">
          <strong>[{langInfo.nativeName} Draft]:</strong> {noticeText}
        </span>
      </div>
      <button
        onClick={() => setDismissedForLang(language)}
        className="text-amber-700 dark:text-amber-300 hover:text-amber-950 p-1 shrink-0 ml-2"
        title="Dismiss warning"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
