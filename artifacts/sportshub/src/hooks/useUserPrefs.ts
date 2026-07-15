import { useState, useEffect, useCallback } from 'react';

export interface UserPrefs {
  sports: string[];
  leagues: string[];
  refreshInterval: number; // seconds
  theme: 'dark' | 'light';
  language: string;
}

const defaultPrefs: UserPrefs = {
  sports: [],
  leagues: [],
  refreshInterval: 30,
  theme: 'dark',
  language: 'en',
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
    setPrefs((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('sportshub_prefs', JSON.stringify(next));
      return next;
    });
  }, []);

  return { prefs, updatePrefs };
}
