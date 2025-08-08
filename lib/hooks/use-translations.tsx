'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';

interface Translation {
  [namespace: string]: {
    [key: string]: string;
  };
}

interface TranslationContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, namespace?: string) => string;
  translations: { [locale: string]: Translation };
  availableLocales: string[];
  isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ 
  children, 
  subdomain,
  initialTranslations = {},
  initialLocale = 'en' 
}: { 
  children: React.ReactNode;
  subdomain: string;
  initialTranslations?: { [locale: string]: Translation };
  initialLocale?: string;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [translations, setTranslations] = useState<{ [locale: string]: Translation }>(initialTranslations);
  const [availableLocales, setAvailableLocales] = useState<string[]>(['en']);
  const [isLoading, setIsLoading] = useState(true);

  // Load translations and language settings
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Get language settings
        const settingsResponse = await fetch(`/api/stores/${subdomain}/languages`);
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          const enabledLanguages = settingsData.languageSettings?.enabledLanguages || ['en'];
          setAvailableLocales(enabledLanguages);
          
          // Check stored locale preference
          const storedLocale = localStorage.getItem(`locale-${subdomain}`);
          if (storedLocale && enabledLanguages.includes(storedLocale)) {
            setLocale(storedLocale);
          } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (enabledLanguages.includes(browserLang)) {
              setLocale(browserLang);
            }
          }
        }

        // Get translations
        const translationsResponse = await fetch(`/api/stores/${subdomain}/languages?type=translations`);
        if (translationsResponse.ok) {
          const translationsData = await translationsResponse.json();
          setTranslations(translationsData.translations || {});
        }
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [subdomain]);

  // Save locale preference
  useEffect(() => {
    localStorage.setItem(`locale-${subdomain}`, locale);
  }, [locale, subdomain]);

  // Translation function
  const t = (key: string, namespace: string = 'common'): string => {
    // Try to get translation for current locale
    const translation = translations[locale]?.[namespace]?.[key];
    if (translation) return translation;

    // Fallback to English
    const englishTranslation = translations['en']?.[namespace]?.[key];
    if (englishTranslation) return englishTranslation;

    // Return key if no translation found
    return `${namespace}.${key}`;
  };

  const value = {
    locale,
    setLocale,
    t,
    translations,
    availableLocales,
    isLoading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}

// Language switcher component
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale, availableLocales } = useTranslation();

  if (availableLocales.length <= 1) return null;

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value)}
      className={`text-sm px-3 py-1 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      {availableLocales.map((lang) => (
        <option key={lang} value={lang}>
          {lang.toUpperCase()}
        </option>
      ))}
    </select>
  );
}