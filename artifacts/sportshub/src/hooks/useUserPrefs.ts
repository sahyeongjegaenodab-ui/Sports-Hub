import { useState, useEffect, useCallback } from 'react';

export interface UserPrefs {
  sports: string[];
  leagues: string[];
  refreshInterval: number; // seconds
  theme: 'dark' | 'light';
  language: string;
  onboardingComplete: boolean;
  notifications: boolean;
  notifyBefore: number; // minutes before game start
}

const defaultPrefs: UserPrefs = {
  sports: [],
  leagues: [],
  refreshInterval: 30,
  theme: 'dark',
  language: 'en',
  onboardingComplete: false,
  notifications: false,
  notifyBefore: 30,
};

export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(() => {
    try {
      const stored = localStorage.getItem('sportshub_prefs');
      if (stored) return { ...defaultPrefs, ...JSON.parse(stored) };
    } catch (e) {
      // ignore
    }
    return defaultPrefs;
  });

  const updatePrefs = useCallback((updates: Partial<UserPrefs>) => {
    // Write to localStorage SYNCHRONOUSLY so it's available before any navigation
    const stored = localStorage.getItem('sportshub_prefs');
    const current = stored ? { ...defaultPrefs, ...JSON.parse(stored) } : defaultPrefs;
    const next = { ...current, ...updates };
    localStorage.setItem('sportshub_prefs', JSON.stringify(next));
    setPrefs(next);
  }, []);

  return { prefs, updatePrefs };
}
