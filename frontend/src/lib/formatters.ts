/**
 * KisanVerify Locale-Aware Number, Currency and Date Formatters
 * =============================================================
 * Deterministic formatting using Intl APIs with Indian currency grouping (e.g. ₹1,15,000)
 * Western Arabic numerals by default, with an optional toggle for native scripts.
 */

// Native numeral maps for Indian scripts
const NATIVE_DIGITS: Record<string, string[]> = {
  hi: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  mr: ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'],
  gu: ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'],
  pa: ['੦', '੧', '੨', '੩', '੪', '੫', '੬', '੭', '੮', '੯'],
  bn: ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'],
  or: ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯'],
  ta: ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'],
  te: ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'],
  kn: ['೦', '೧', '೨', '೩', '೪', '೫', '೬', '೭', '೮', '೯'],
  ml: ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'],
};

export function convertToNativeNumerals(text: string, lang: string): string {
  const digits = NATIVE_DIGITS[lang];
  if (!digits) return text;
  return text.replace(/[0-9]/g, (w) => digits[parseInt(w, 10)]);
}

export function formatCurrency(
  amount: number | null | undefined,
  lang: string = 'en',
  useNativeNumerals: boolean = false
): string {
  if (amount == null || isNaN(amount)) return '₹0';
  const locale = lang === 'en' ? 'en-IN' : `${lang}-IN`;
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
    return useNativeNumerals ? convertToNativeNumerals(formatted, lang) : formatted;
  } catch {
    const fallback = `₹${Math.round(amount).toLocaleString('en-IN')}`;
    return useNativeNumerals ? convertToNativeNumerals(fallback, lang) : fallback;
  }
}

export function formatNumber(
  val: number | null | undefined,
  lang: string = 'en',
  decimals: number = 0,
  useNativeNumerals: boolean = false
): string {
  if (val == null || isNaN(val)) return '0';
  const locale = lang === 'en' ? 'en-IN' : `${lang}-IN`;
  try {
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
    }).format(val);
    return useNativeNumerals ? convertToNativeNumerals(formatted, lang) : formatted;
  } catch {
    const fallback = val.toLocaleString('en-IN');
    return useNativeNumerals ? convertToNativeNumerals(fallback, lang) : fallback;
  }
}

export function formatDate(
  dateInput: string | Date | null | undefined,
  lang: string = 'en'
): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  const locale = lang === 'en' ? 'en-IN' : `${lang}-IN`;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return d.toLocaleDateString();
  }
}
