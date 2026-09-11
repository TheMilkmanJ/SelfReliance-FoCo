import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';

export type ThemeColors = {
  purple: string;
  purpleDark: string;
  purpleLight: string;
  gold: string;
  ink: string;
  body: string;
  muted: string;
  line: string;
  bg: string;
  card: string;
  green: string;
  red: string;
  actionInk: string;
  headerText: string;
  headerSub: string;
  onPurple: string;
};

export const lightColors: ThemeColors = {
  purple: '#522f81',
  purpleDark: '#3d2261',
  purpleLight: '#ede7f6',
  gold: '#f5a623',
  ink: '#1f1a2e',
  body: '#4a4458',
  muted: '#7b7488',
  line: '#e6e1ee',
  bg: '#f7f5fb',
  card: '#ffffff',
  green: '#2e7d32',
  red: '#b71c1c',
  actionInk: '#1f1a2e',
  headerText: '#ffffff',
  headerSub: '#e9dffb',
  onPurple: '#ffffff',
};

export const darkColors: ThemeColors = {
  purple: '#b79ad6',
  purpleDark: '#d4c2ea',
  purpleLight: '#2c2340',
  gold: '#f5a623',
  ink: '#f4eefc',
  body: '#d2c8e0',
  muted: '#a396b6',
  line: '#3a314c',
  bg: '#14111c',
  card: '#1f1a2c',
  green: '#4caf50',
  red: '#ef6b6b',
  actionInk: '#3d2261',
  headerText: '#ffffff',
  headerSub: '#e9dffb',
  onPurple: '#ffffff',
};

/** Header bar stays the FoCo purple in both modes. */
export const HEADER_PURPLE = '#522f81';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

export function cardShadow(isDark: boolean) {
  return {
    boxShadow: isDark ? '0 4px 14px rgba(0, 0, 0, 0.45)' : '0 4px 10px rgba(42, 27, 74, 0.08)',
    elevation: isDark ? 4 : 2,
  };
}

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: ThemeColors;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'foco-theme-preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') setPreferenceState(saved);
      })
      .finally(() => setReady(true));
  }, []);

  const setPreference = (p: ThemePreference) => {
    setPreferenceState(p);
    void AsyncStorage.setItem(STORAGE_KEY, p);
  };

  const isDark = preference === 'system' ? system === 'dark' : preference === 'dark';
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    if (!ready) return;
    const next = preference === 'system' ? 'unspecified' : preference;
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(next);
    }
  }, [preference, ready]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      isDark,
      preference,
      setPreference,
      toggle: () => setPreference(isDark ? 'light' : 'dark'),
    }),
    [colors, isDark, preference],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

/** Fallback for files that still import a static palette (tests, etc.). */
export const colors = lightColors;
export const shadow = { card: cardShadow(false) };
