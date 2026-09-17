import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Area, CategoryId } from '../data/types';
import {
  LANGUAGE_STORAGE_KEY,
  deviceLanguage,
  isAppLanguage,
  nextLanguage,
  translate as translateLang,
  type AppLanguage,
  type MessageKey,
  type Translate,
  type Vars,
} from './translate';

export type { AppLanguage, MessageKey, Translate, Vars };
export {
  APP_LANGUAGES,
  holidayLabel,
  dowKey,
  dowShortKey,
  monthKey,
  deviceLanguage,
  languageOption,
  nextLanguage,
  LANGUAGE_STORAGE_KEY,
} from './translate';

type LanguageContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  cycle: () => void;
  t: Translate;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(deviceLanguage);

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (isAppLanguage(saved)) setLanguageState(saved);
    });
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  const cycle = useCallback(() => {
    setLanguage(nextLanguage(language).id);
  }, [language, setLanguage]);

  const t = useCallback<Translate>((key, vars) => translateLang(language, key, vars), [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, cycle, t }),
    [language, setLanguage, cycle, t],
  );

  return createElement(LanguageContext.Provider, { value }, children);
}

export function useI18n(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useI18n must be used inside LanguageProvider');
  return ctx;
}

export function catKey(id: CategoryId, field: 'label' | 'short' | 'blurb'): MessageKey {
  return `cat.${id}.${field}` as MessageKey;
}

export function certKey(id: string, field: 'label' | 'short'): MessageKey {
  return `cert.${id}.${field}` as MessageKey;
}

export function areaMessage(area: Area | 'All' | 'Unincorporated'): MessageKey {
  if (area === 'All') return 'area.larimerCounty';
  if (area === 'Fort Collins') return 'area.fortCollins';
  if (area === 'Loveland') return 'area.loveland';
  if (area === 'Estes Park') return 'area.estesPark';
  if (area === 'Berthoud') return 'area.berthoud';
  if (area === 'Wellington') return 'area.wellington';
  if (area === 'Larimer County') return 'area.larimerCounty';
  if (area === 'Colorado (statewide)') return 'area.statewide';
  if (area === 'National') return 'area.national';
  return 'area.unincorporated';
}
