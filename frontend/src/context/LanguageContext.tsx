import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';
import { Language } from '../types';
import { formatCurrency as fmtCurrency, formatNumber as fmtNumber, formatDate as fmtDate } from '../lib/formatters';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, options?: any) => string;
  useNativeNumerals: boolean;
  setUseNativeNumerals: (enabled: boolean) => void;
  formatCurrency: (amount: number | null | undefined) => string;
  formatNumber: (val: number | null | undefined, decimals?: number) => string;
  formatDate: (dateInput: string | Date | null | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string) => key,
  useNativeNumerals: false,
  setUseNativeNumerals: () => {},
  formatCurrency: (amount) => `₹${amount || 0}`,
  formatNumber: (val) => String(val || 0),
  formatDate: (dateInput) => String(dateInput || ''),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t: i18nTranslate } = useTranslation();

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('kv_lang') as Language) || i18n.language || 'en';
  });

  const [useNativeNumerals, setUseNativeNumeralsState] = useState<boolean>(() => {
    return localStorage.getItem('kv_native_numerals') === 'true';
  });

  // Sync with document element & i18n
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kv_lang', lang);
    i18n.changeLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const setUseNativeNumerals = (enabled: boolean) => {
    setUseNativeNumeralsState(enabled);
    localStorage.setItem('kv_native_numerals', String(enabled));
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, options?: any): string => {
    if (!key) return '';

    // If key has no namespace prefix and matches common format
    const hasNamespace = key.includes(':');
    const lookupKey = hasNamespace ? key : `common:${key}`;

    const res = i18nTranslate(lookupKey, options);
    if (res !== lookupKey) {
      return res;
    }

    // Direct namespace fallback check
    const parts = key.split('.');
    if (parts.length === 2) {
      const nsGuess = `${parts[0]}:${parts[1]}`;
      const resNs = i18nTranslate(nsGuess, options);
      if (resNs !== nsGuess) return resNs;
    }

    return i18nTranslate(key, { ...options, defaultValue: key });
  };

  const formatCurrency = (amount: number | null | undefined): string => {
    return fmtCurrency(amount, language, useNativeNumerals);
  };

  const formatNumber = (val: number | null | undefined, decimals: number = 0): string => {
    return fmtNumber(val, language, decimals, useNativeNumerals);
  };

  const formatDate = (dateInput: string | Date | null | undefined): string => {
    return fmtDate(dateInput, language);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        useNativeNumerals,
        setUseNativeNumerals,
        formatCurrency,
        formatNumber,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
