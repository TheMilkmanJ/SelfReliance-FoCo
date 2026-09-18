import { ar } from './ar';
import { en } from './en';
import { es } from './es';
import { he } from './he';
import { hi } from './hi';
import { ko } from './ko';
import { vi } from './vi';
import { zh } from './zh';

export type AppLanguage = 'en' | 'es' | 'hi' | 'zh' | 'vi' | 'ko' | 'ar' | 'he';
export type MessageKey = keyof typeof en;
export type Vars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: Vars) => string;

export type LanguageOption = {
  id: AppLanguage;
  code: string;
  nativeName: string;
  englishName: string;
};

/** Languages in the header and Language tile dropdowns. Native names stay in their own script. */
export const APP_LANGUAGES: LanguageOption[] = [
  { id: 'en', code: 'EN', nativeName: 'English', englishName: 'English' },
  { id: 'es', code: 'ES', nativeName: 'Español', englishName: 'Spanish' },
  { id: 'hi', code: 'HI', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { id: 'zh', code: 'ZH', nativeName: '中文', englishName: 'Chinese' },
  { id: 'vi', code: 'VI', nativeName: 'Tiếng Việt', englishName: 'Vietnamese' },
  { id: 'ko', code: 'KO', nativeName: '한국어', englishName: 'Korean' },
  { id: 'ar', code: 'AR', nativeName: 'العربية', englishName: 'Arabic' },
  { id: 'he', code: 'HE', nativeName: 'עברית', englishName: 'Hebrew' },
];

export const STRINGS: Record<AppLanguage, Record<MessageKey, string>> = {
  en,
  es,
  hi,
  zh,
  vi,
  ko,
  ar,
  he,
};

export const LANGUAGE_STORAGE_KEY = 'foco-language';

const INDIAN_LOCALE_PREFIXES = ['hi', 'te', 'ta', 'gu', 'pa', 'ml', 'kn', 'mr', 'bn', 'ur', 'ne'];

export function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
}

export function translate(lang: AppLanguage, key: MessageKey, vars?: Vars): string {
  const dict = STRINGS[lang] ?? en;
  return interpolate(dict[key] ?? en[key], vars);
}

export function languageOption(id: AppLanguage): LanguageOption {
  return APP_LANGUAGES.find((row) => row.id === id) ?? APP_LANGUAGES[0];
}

export function nextLanguage(id: AppLanguage): LanguageOption {
  const i = APP_LANGUAGES.findIndex((row) => row.id === id);
  return APP_LANGUAGES[(i + 1) % APP_LANGUAGES.length];
}

export function deviceLanguage(): AppLanguage {
  try {
    const locale = (Intl.DateTimeFormat().resolvedOptions().locale || 'en').toLowerCase();
    if (locale.startsWith('es')) return 'es';
    if (locale.startsWith('zh')) return 'zh';
    if (locale.startsWith('vi')) return 'vi';
    if (locale.startsWith('ko')) return 'ko';
    if (locale.startsWith('ar')) return 'ar';
    if (locale.startsWith('he') || locale.startsWith('iw')) return 'he';
    if (INDIAN_LOCALE_PREFIXES.some((p) => locale === p || locale.startsWith(`${p}-`))) return 'hi';
    return 'en';
  } catch {
    return 'en';
  }
}

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return APP_LANGUAGES.some((row) => row.id === value);
}

const HOLIDAY_KEYS: Record<string, MessageKey> = {
  "New Year's Day": 'holiday.nye',
  'Memorial Day': 'holiday.memorial',
  'Independence Day': 'holiday.independence',
  'Labor Day': 'holiday.labor',
  Thanksgiving: 'holiday.thanksgiving',
  'Christmas Day': 'holiday.christmas',
};

export function holidayLabel(name: string, t: Translate): string {
  const key = HOLIDAY_KEYS[name];
  return key ? t(key) : name;
}

export function dowKey(dow: number): MessageKey {
  const n = ((dow % 7) + 7) % 7;
  return `dow.${n}` as MessageKey;
}

export function dowShortKey(dow: number): MessageKey {
  const n = ((dow % 7) + 7) % 7;
  return `dowShort.${n}` as MessageKey;
}

export function monthKey(month: number): MessageKey {
  const n = Math.min(12, Math.max(1, month));
  return `month.${n}` as MessageKey;
}
