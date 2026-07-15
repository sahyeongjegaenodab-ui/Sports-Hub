import { useEffect } from 'react';
import { useUserPrefs } from './useUserPrefs';

export function useTheme() {
  const { prefs, updatePrefs } = useUserPrefs();
  const theme = prefs.theme;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    updatePrefs({ theme: theme === 'dark' ? 'light' : 'dark' });
  };

  return { theme, toggleTheme };
}
