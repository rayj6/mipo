/** Supported locale codes (stored in DB and app). */
export type LocaleCode = 'en' | 'vi' | 'es' | 'fr' | 'ja' | 'zh' | 'fil' | 'my';

export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'vi', 'es', 'fr', 'ja', 'zh', 'fil', 'my'];

/** Display name for each language (in that language). */
export const LOCALE_NAMES: Record<LocaleCode, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  es: 'Español',
  fr: 'Français',
  ja: '日本語',
  zh: '中文',
  fil: 'Filipino',
  my: 'မြန်မာ',
};

export const DEFAULT_LOCALE: LocaleCode = 'en';

export function isValidLocale(code: string): code is LocaleCode {
  return SUPPORTED_LOCALES.includes(code as LocaleCode);
}
