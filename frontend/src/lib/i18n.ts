import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const NAMESPACES = [
  'common',
  'nav',
  'home',
  'loans',
  'msp',
  'insurance',
  'schemes',
  'documents',
  'mandi',
  'weather',
  'offices',
  'contact',
  'grievance',
  'reports',
  'errors',
  'policy',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

// Dynamically auto-discover all locale JSON files across any language
const localeModules = import.meta.glob<{ default?: Record<string, any> }>(
  '../locales/*/*.json',
  { eager: true }
);

const resources: Record<string, Record<string, any>> = {};

for (const [path, module] of Object.entries(localeModules)) {
  // e.g. path = "../locales/hi/common.json"
  const match = path.match(/\.\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (match) {
    const [, lang, ns] = match;
    if (!resources[lang]) {
      resources[lang] = {};
    }
    resources[lang][ns] = (module as any).default || module;
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [...NAMESPACES],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'kv_lang',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
