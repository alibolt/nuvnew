'use client';

import { useEffect } from 'react';
import { buildGoogleFontsUrl } from '@/lib/google-fonts-list';

interface FontLoaderProps {
  fonts: string[];
}

export function ThemeFontLoader({ fonts }: FontLoaderProps) {
  useEffect(() => {
    // Remove existing font links to avoid duplicates
    const existingFontLinks = document.querySelectorAll('link[data-theme-font="true"]');
    existingFontLinks.forEach(link => link.remove());

    // Get unique fonts
    const uniqueFonts = [...new Set(fonts)].filter(Boolean);
    
    if (uniqueFonts.length === 0) return;

    // Build fonts with default weights
    const fontConfigs = uniqueFonts.map(fontName => ({
      name: fontName,
      weights: [300, 400, 500, 600, 700, 800, 900]
    }));

    // Create and append link element
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://fonts.googleapis.com';
    document.head.appendChild(link);

    const link2 = document.createElement('link');
    link2.rel = 'preconnect';
    link2.href = 'https://fonts.gstatic.com';
    link2.crossOrigin = 'anonymous';
    document.head.appendChild(link2);

    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = buildGoogleFontsUrl(fontConfigs);
    fontLink.setAttribute('data-theme-font', 'true');
    document.head.appendChild(fontLink);

    console.log('[ThemeFontLoader] Loaded fonts:', uniqueFonts);
    console.log('[ThemeFontLoader] Font URL:', fontLink.href);

  }, [fonts]);

  return null;
}

// Hook to extract fonts from theme settings
export function useThemeFonts(themeSettings: Record<string, any>): string[] {
  const fonts: string[] = [];
  
  // Extract font families from theme settings
  // Handle both flat and nested structures
  Object.entries(themeSettings).forEach(([key, value]) => {
    // Handle flat structure (legacy)
    if (key.includes('Font') && typeof value === 'string' && value) {
      fonts.push(value);
    }
    // Handle nested structure (new format)
    else if (key.includes('.') && key.includes('Font')) {
      const parts = key.split('.');
      if (parts[parts.length - 1].includes('Font') && typeof value === 'string' && value) {
        fonts.push(value);
      }
    }
  });

  return fonts;
}