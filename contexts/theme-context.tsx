'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextValue {
  themeSettings: Record<string, any>;
  updateThemeSettings: (newSettings: Record<string, any>) => void;
  borderRadius: string;
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: string;
    lineHeight: string;
  };
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeSettings?: Record<string, any>;
}

export function ThemeProvider({ children, initialThemeSettings = {} }: ThemeProviderProps) {
  const [themeSettings, setThemeSettings] = useState<Record<string, any>>(initialThemeSettings);

  // Extract commonly used values for easy access
  const borderRadius = React.useMemo(() => {
    const radiusValue = themeSettings['layout.borderRadius'] || 'md';
    const radiusMap: Record<string, string> = {
      'none': '0',
      'sm': '4px',
      'md': '8px',
      'lg': '12px',
      'xl': '16px',
      '2xl': '24px',
      'full': '9999px'
    };
    return radiusMap[radiusValue] || '8px';
  }, [themeSettings]);

  const typography = React.useMemo(() => ({
    headingFont: themeSettings['typography.headingFont'] || 'Inter',
    bodyFont: themeSettings['typography.bodyFont'] || 'Inter',
    baseFontSize: themeSettings['typography.baseFontSize'] ? `${themeSettings['typography.baseFontSize']}px` : '16px',
    lineHeight: themeSettings['typography.lineHeight'] || '1.5'
  }), [themeSettings]);

  const updateThemeSettings = React.useCallback((newSettings: Record<string, any>) => {
    console.log('[ThemeContext] Updating theme settings:', newSettings);
    setThemeSettings(newSettings);
  }, []);

  // Listen for theme updates from postMessage
  useEffect(() => {
    const handleThemeUpdate = (event: MessageEvent) => {
      if (event.data.type === 'THEME_SETTINGS_UPDATE') {
        const { settings } = event.data;
        if (settings) {
          console.log('[ThemeContext] Received theme update via postMessage:', settings);
          updateThemeSettings(settings);
        }
      }
    };

    window.addEventListener('message', handleThemeUpdate);
    return () => window.removeEventListener('message', handleThemeUpdate);
  }, [updateThemeSettings]);

  const value: ThemeContextValue = {
    themeSettings,
    updateThemeSettings,
    borderRadius,
    typography
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for specific theme values
export function useThemeValue(key: string, defaultValue: any = undefined) {
  const { themeSettings } = useTheme();
  return themeSettings[key] ?? defaultValue;
}