import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import core namespaces for English and Hindi
import enCommon from '../locales/en/common.json';
import enNav from '../locales/en/nav.json';
import enHome from '../locales/en/home.json';
import enLoans from '../locales/en/loans.json';
import enMsp from '../locales/en/msp.json';
import enInsurance from '../locales/en/insurance.json';
import enSchemes from '../locales/en/schemes.json';
import enDocuments from '../locales/en/documents.json';
import enMandi from '../locales/en/mandi.json';
import enWeather from '../locales/en/weather.json';
import enOffices from '../locales/en/offices.json';
import enContact from '../locales/en/contact.json';
import enGrievance from '../locales/en/grievance.json';
import enReports from '../locales/en/reports.json';
import enErrors from '../locales/en/errors.json';
import enPolicy from '../locales/en/policy.json';

import hiCommon from '../locales/hi/common.json';
import hiNav from '../locales/hi/nav.json';
import hiHome from '../locales/hi/home.json';
import hiLoans from '../locales/hi/loans.json';
import hiMsp from '../locales/hi/msp.json';
import hiInsurance from '../locales/hi/insurance.json';
import hiSchemes from '../locales/hi/schemes.json';
import hiDocuments from '../locales/hi/documents.json';
import hiMandi from '../locales/hi/mandi.json';
import hiWeather from '../locales/hi/weather.json';
import hiOffices from '../locales/hi/offices.json';
import hiContact from '../locales/hi/contact.json';
import hiGrievance from '../locales/hi/grievance.json';
import hiReports from '../locales/hi/reports.json';
import hiErrors from '../locales/hi/errors.json';
import hiPolicy from '../locales/hi/policy.json';

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

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    home: enHome,
    loans: enLoans,
    msp: enMsp,
    insurance: enInsurance,
    schemes: enSchemes,
    documents: enDocuments,
    mandi: enMandi,
    weather: enWeather,
    offices: enOffices,
    contact: enContact,
    grievance: enGrievance,
    reports: enReports,
    errors: enErrors,
    policy: enPolicy,
  },
  hi: {
    common: hiCommon,
    nav: hiNav,
    home: hiHome,
    loans: hiLoans,
    msp: hiMsp,
    insurance: hiInsurance,
    schemes: hiSchemes,
    documents: hiDocuments,
    mandi: hiMandi,
    weather: hiWeather,
    offices: hiOffices,
    contact: hiContact,
    grievance: hiGrievance,
    reports: hiReports,
    errors: hiErrors,
    policy: hiPolicy,
  },
};

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
