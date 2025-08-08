'use client';

import { useEffect } from 'react';
import { generateButtonCSS } from '@/lib/theme-button-styles';
import { generateThemeCSSVariables } from '@/lib/theme-utils';

interface ThemeStylesProps {
  settings?: Record<string, any>;
}

export function ThemeStyles({ settings }: ThemeStylesProps) {
  useEffect(() => {
    if (!settings) return;

    // Generate and apply CSS variables
    const cssVariables = generateThemeCSSVariables(settings);
    
    // Generate button styles
    const buttonStyles = generateButtonCSS(settings);
    
    // Combine all styles
    const combinedStyles = `
      :root {
        ${cssVariables}
      }
      
      ${buttonStyles}
      
      /* Additional theme styles */
      body {
        font-family: var(--theme-typography-body-font, 'Inter'), sans-serif;
        font-size: var(--theme-typography-base-font-size, 16px);
        line-height: var(--theme-typography-body-line-height, 1.5);
        color: var(--theme-colors-text, #1E293B);
        background-color: var(--theme-colors-background, #ffffff);
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-family: var(--theme-typography-heading-font, 'Inter'), serif;
        font-weight: var(--theme-typography-heading-font-weight, 700);
        line-height: var(--theme-typography-heading-line-height, 1.2);
        color: var(--theme-colors-text, #1E293B);
      }
      
      a {
        color: var(--theme-colors-primary, #2563eb);
        text-decoration: none;
        transition: color 0.2s ease;
      }
      
      a:hover {
        color: var(--theme-colors-primary-hover, #1d4ed8);
      }
      
      .container {
        max-width: var(--theme-layout-container-width, 1280px);
        margin: 0 auto;
        padding: 0 var(--theme-layout-container-padding, 16px);
      }
      
      /* Component-specific styles */
      .announcement-bar {
        background-color: var(--theme-colors-announcement-bg, #1a202c);
        color: var(--theme-colors-announcement-text, #ffffff);
        font-size: var(--theme-typography-announcement-font-size, 14px);
      }
      
      .product-card {
        border-radius: var(--theme-layout-border-radius, 8px) !important;
        transition: all var(--theme-animations-duration, 300ms) var(--theme-animations-easing, ease);
      }
      
      .product-card:hover {
        transform: var(--theme-animations-hover-transform) translateY(-4px);
        box-shadow: var(--theme-product-card-hover-shadow, 0 10px 30px rgba(0,0,0,0.1));
      }
      
      /* Global border radius enforcement */
      .btn,
      button[class*="btn"],
      input[type="text"],
      input[type="email"],
      input[type="password"],
      input[type="search"],
      input[type="tel"],
      input[type="url"],
      input[type="number"],
      textarea,
      select,
      .rounded-lg,
      .rounded-md,
      .rounded-xl,
      .rounded-2xl {
        border-radius: var(--theme-layout-border-radius, 8px) !important;
      }
      
      /* Override Tailwind rounded utilities */
      .rounded-none {
        border-radius: 0 !important;
      }
      
      .rounded-full {
        border-radius: 9999px !important;
      }
      
      /* Ensure search inputs respect theme border radius */
      .search-input,
      input[type="search"] {
        border-radius: var(--theme-layout-border-radius, 8px) !important;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
      }
    `;

    // Create or update style element
    let styleEl = document.getElementById('theme-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'theme-styles';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = combinedStyles;

    // Cleanup on unmount
    return () => {
      const el = document.getElementById('theme-styles');
      if (el) {
        el.remove();
      }
    };
  }, [settings]);

  return null;
}

// Re-export for backward compatibility
export { ThemeStyles as ThemeGlobalStyles };