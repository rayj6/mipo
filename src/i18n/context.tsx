import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, isValidLocale, type LocaleCode } from './locales';
import { translations } from './translations';

const STORAGE_KEY = '@mipo/locale';

type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => Promise<void>;
  t: (key: string) => string;
};

const fallback = translations.en;
function getTranslation(locale: string, key: string): string {
  const map = translations[locale] ?? fallback;
  return (map && map[key]) ?? fallback[key] ?? key;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export async function getStoredLocale(): Promise<LocaleCode> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored && isValidLocale(stored)) return stored as LocaleCode;
  } catch {}
  return DEFAULT_LOCALE;
}

export async function setStoredLocale(code: LocaleCode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch {}
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);

  useEffect(() => {
    getStoredLocale().then((code) => setLocaleState(code));
  }, []);

  const setLocale = useCallback(async (code: LocaleCode) => {
    setLocaleState(code);
    await setStoredLocale(code);
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(locale, key),
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
