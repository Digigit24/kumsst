import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';
type Font = 'inter' | 'roboto' | 'system';

interface ThemeColors {
  primary: string;
  secondary: string;
}

interface ThemeContextType {
  theme: Theme;
  font: Font;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
  setColors: (colors: ThemeColors) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultColors: ThemeColors = {
  primary: '221.2 83.2% 53.3%',
  secondary: '210 40% 96.1%',
};

// 🔧 SYNC WITH SETTINGS PROVIDER - Read from the same storage
const SETTINGS_STORAGE_KEY = 'app_settings_v1';

const getThemeFromSettings = (): Theme => {
  try {
    const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (settingsJson) {
      const settings = JSON.parse(settingsJson);
      if (settings.theme === 'dark' || settings.theme === 'light') {
        return settings.theme;
      }
    }
  } catch {
    // corrupted storage — ignore
  }
  // Fallback to legacy storage or default
  const legacyTheme = localStorage.getItem('theme') as Theme;
  return legacyTheme || 'light';
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => getThemeFromSettings());

  const [font, setFontState] = useState<Font>(() => {
    const saved = localStorage.getItem('font') as Font;
    return saved || 'inter';
  });

  const [colors, setColorsState] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('colors');
    return saved ? JSON.parse(saved) : defaultColors;
  });

  // 🔧 Listen for changes from SettingsProvider (storage events)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          if (settings.theme && (settings.theme === 'dark' || settings.theme === 'light')) {
            setThemeState(settings.theme);
          }
        } catch {
          // corrupted storage — ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // 🔧 Update both storage locations for backward compatibility
    localStorage.setItem('theme', theme);

    // Also update SettingsProvider storage
    try {
      const settingsJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        settings.theme = theme;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      }
    } catch {
      // corrupted storage — ignore
    }
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--font-family', font);
    localStorage.setItem('font', font);

    // Apply font class
    root.classList.remove('font-inter', 'font-roboto', 'font-system');
    root.classList.add(`font-${font}`);
  }, [font]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    localStorage.setItem('colors', JSON.stringify(colors));
  }, [colors]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const setFont = useCallback((newFont: Font) => {
    setFontState(newFont);
  }, []);

  const setColors = useCallback((newColors: ThemeColors) => {
    setColorsState(newColors);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  const value = useMemo(() => ({
    theme, font, colors, setTheme, setFont, setColors, toggleTheme,
  }), [theme, font, colors, setTheme, setFont, setColors, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
