'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/safeStorage';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Always start from the same deterministic default on server and first
  // client render — reading localStorage/matchMedia here would make the
  // client's initial render diverge from the server-rendered HTML and
  // trigger a hydration mismatch. The real theme is resolved after mount.
  const [theme, setThemeState] = useState<Theme>('light');

  // Resolve the actual theme (saved choice or system preference) once,
  // after hydration completes.
  useEffect(() => {
    try {
      const savedTheme = getStorageItem('theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(savedTheme);
        return;
      }
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeState(systemPrefersDark ? 'dark' : 'light');
    } catch {
      // keep default 'light'
    }
  }, []);

  // Apply theme to document element and persist choice
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    setStorageItem('theme', theme);
  }, [theme]);

  // Listen to system theme preference changes when no explicit choice stored
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // No stored theme (unset, or storage unavailable) — follow the system.
      if (!getStorageItem('theme')) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const value = React.useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};