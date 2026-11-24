import React from 'react';
import { Check, Globe, X, Sparkles, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, LanguageInfo } from '../lib/languages';

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, useNativeNumerals, setUseNativeNumerals } = useLanguage();

  if (!isOpen) return null;

  const handleSelect = (code: string) => {
    setLanguage(code);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
    >
      <div className="bg-[#FAF9F5] dark:bg-stone-900 border border-[#556B2F]/20 dark:border-stone-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#556B2F] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h2 id="language-picker-title" className="font-bold text-base sm:text-lg leading-tight">
                Choose Language / भाषा चुनें
              </h2>
              <p className="text-[11px] text-white/80">
                11 Regional Indian Languages Available
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang: LanguageInfo) => {
              const isSelected = language === lang.code;
              const isReviewed = lang.reviewStatus === 'reviewed';

              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-150 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#EAEFE4] dark:bg-[#556B2F]/20 border-[#556B2F] shadow-sm'
                      : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-[#556B2F]/40 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {lang.nativeName}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      {lang.englishName} ({lang.script})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isReviewed ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        Reviewed
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-1.5 py-0.5 rounded">
                        Draft
                      </span>
                    )}

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#556B2F] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Native Numerals Toggle */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between px-2">
            <div>
              <span className="text-xs font-bold text-stone-800 dark:text-stone-200 block">
                Use Native Numerals / स्थानीय अंक प्रणाली
              </span>
              <span className="text-[11px] text-stone-500 block">
                Format amounts in script numerals (e.g. १२,००० vs 12,000)
              </span>
            </div>
            <button
              onClick={() => setUseNativeNumerals(!useNativeNumerals)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                useNativeNumerals ? 'bg-[#556B2F]' : 'bg-stone-300 dark:bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  useNativeNumerals ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-100 dark:bg-stone-800/80 border-t border-stone-200 dark:border-stone-700 text-[11px] text-stone-600 dark:text-stone-400 flex items-center justify-between">
          <span>Active: {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#556B2F] text-white font-bold text-xs hover:bg-[#435424] transition-colors"
          >
            Apply & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
