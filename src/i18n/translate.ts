import { en } from './en';
import { es } from './es';

export type AppLanguage = 'en' | 'es';
export type MessageKey = keyof typeof en;
export type Vars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: Vars) => string;

export const STRINGS: Record<AppLanguage, Record<MessageKey, string>> = {
  en,
  es,
};

export const LANGUAGE_STORAGE_KEY = 'foco-language';

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

export function deviceLanguage(): AppLanguage {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale || 'en';
    return locale.toLowerCase().startsWith('es') ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  return value === 'en' || value === 'es';
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
