/**
 * Centralized theme utilities to avoid code duplication
 */

import { toast } from 'sonner';

export interface ThemeSettingField {
  type: 'color' | 'select' | 'range' | 'text' | 'number' | 'font-picker' | 'toggle' | 'boolean' | 'url';
  label: string;
  default: any;
  description?: string;
  placeholder?: string;
  options?: string[] | { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  category?: string;
  showCategories?: boolean;
  showWeights?: boolean;
}

export interface ThemeSettings {
  [category: string]: {
    [key: string]: ThemeSettingField;
  };
}

/**
 * Generate CSS variables from theme settings
 * Single source of truth for CSS variable generation
 */
export function generateThemeCSSVariables(values: Record<string, any>): string {
  const cssVars: Record<string, string> = {};
  
  // First, convert dot notation to nested structure
  const nestedValues: Record<string, any> = {};
  Object.entries(values).forEach(([key, value]) => {
    if (key.includes('.')) {
      const parts = key.split('.');
      let current = nestedValues;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      nestedValues[key] = value;
    }
  });
  
  // Helper function to process nested objects
  const processObject = (obj: Record<string, any>, prefix: string = '') => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}-${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Recursively process nested objects
        processObject(value, fullKey);
      } else {
        // Convert to kebab-case and replace dots with dashes
        const kebabKey = fullKey
          .replace(/\./g, '-') // Replace dots with dashes
          .replace(/([a-z])([A-Z])/g, '$1-$2')
          .toLowerCase();
        
        const cssVarName = `--theme-${kebabKey}`;
        let cssValue = value;
        
        // Handle border radius values
        if (key.includes('Radius')) {
          const radiusMap: Record<string, string> = {
            'none': '0',
            'sm': '4px',
            'md': '8px',
            'lg': '12px',
            'xl': '16px',
            '2xl': '24px',
            'full': '9999px'
          };
          if (radiusMap[value]) {
            cssValue = radiusMap[value];
          }
          console.log('[ThemeUtils] Border radius mapping:', { key, value, cssValue, cssVarName });
        }
        // Handle special cases for units
        else if (key.includes('Width') || key.includes('Height') || key.includes('Size') || key.includes('Gap') || key.includes('Padding') || key.includes('Margin')) {
          const numValue = Number(value);
          if (value === '100%' || value === 'auto' || value === 'none') {
            cssValue = value;
          } else if (!isNaN(numValue) && typeof value !== 'string') {
            cssValue = `${numValue}px`;
          } else if (typeof value === 'string' && !value.includes('px') && !value.includes('%') && !value.includes('rem') && !value.includes('em') && !isNaN(Number(value))) {
            cssValue = `${value}px`;
          }
        }
        // Handle fullWidth layout setting
        if (key === 'fullWidth' && prefix === 'layout' && value === true) {
          // Override container width when full width is enabled
          cssVars['--theme-layout-container-width'] = '100%';
          console.log('[ThemeUtils] Full width enabled, setting container width to 100%');
        }
        
        // Handle animation duration
        if (key.includes('Duration') && !value.toString().includes('ms')) {
          cssValue = `${value}ms`;
        }
        
        cssVars[cssVarName] = cssValue;
        
        // Debug log for layout settings
        if (cssVarName.includes('layout-container-width') || cssVarName.includes('layout-full-width')) {
          console.log('[ThemeUtils] Setting CSS var:', cssVarName, '=', cssValue);
        }
      }
    });
  };
  
  processObject(nestedValues);
  
  // Generate CSS string
  return Object.entries(cssVars)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');
}

/**
 * Load theme configuration from JSON file
 */
export async function loadThemeConfig(themeName: string): Promise<any> {
  try {
    // Try to fetch from public directory first
    const response = await fetch(`/themes/${themeName}/theme.json`);
    if (!response.ok) {
      // If not found in public, return the default commerce theme config
      if (themeName === 'commerce') {
        // Import the theme config directly
        const { default: themeConfig } = await import('@/themes/commerce/theme.json');
        console.log('[ThemeUtils] Loaded theme config from import:', {
          sectionPaddingMin: themeConfig.settings?.layout?.sectionPadding?.min,
          elementSpacingMin: themeConfig.settings?.layout?.elementSpacing?.min
        });
        return themeConfig;
      }
      throw new Error(`Failed to load theme configuration: ${response.statusText}`);
    }
    const config = await response.json();
    console.log('[ThemeUtils] Loaded theme config from fetch:', {
      sectionPaddingMin: config.settings?.layout?.sectionPadding?.min,
      elementSpacingMin: config.settings?.layout?.elementSpacing?.min
    });
    return config;
  } catch (error) {
    console.error('[ThemeUtils] Failed to load theme config:', error);
    // Return a minimal default config as fallback
    if (themeName === 'commerce') {
      return {
        name: 'Commerce Pro',
        version: '1.0.0',
        settings: {
          colors: {
            primary: { type: 'color', label: 'Primary Color', default: '#2563EB' },
            secondary: { type: 'color', label: 'Secondary Color', default: '#64748B' },
            accent: { type: 'color', label: 'Accent Color', default: '#F59E0B' },
            background: { type: 'color', label: 'Background Color', default: '#FFFFFF' },
            text: { type: 'color', label: 'Text Color', default: '#1E293B' }
          },
          typography: {
            headingFont: { type: 'font-picker', label: 'Heading Font', default: 'Inter' },
            bodyFont: { type: 'font-picker', label: 'Body Font', default: 'Inter' },
            baseFontSize: { type: 'range', label: 'Base Font Size', min: 14, max: 20, default: 16, unit: 'px' }
          },
          layout: {
            sectionPadding: { type: 'range', label: 'Section Padding', default: 80, min: 0, max: 120, step: 5, unit: 'px' },
            elementSpacing: { type: 'range', label: 'Element Spacing', default: 20, min: 0, max: 60, step: 5, unit: 'px' }
          },
          buttons: {
            primaryBackgroundColor: { type: 'color', label: 'Primary Button Background', default: '#2563EB' },
            primaryTextColor: { type: 'color', label: 'Primary Button Text', default: '#FFFFFF' },
            buttonRadius: { type: 'select', label: 'Button Border Radius', default: 'md', options: [
              { value: 'none', label: 'None' },
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium' },
              { value: 'lg', label: 'Large' },
              { value: 'full', label: 'Pill' }
            ]}
          }
        }
      };
    }
    throw error;
  }
}

/**
 * Load theme instance settings for a store
 */
export async function loadThemeInstanceSettings(subdomain: string): Promise<Record<string, any> | null> {
  try {
    // First try to get theme settings from the store directly
    const response = await fetch(`/api/stores/${subdomain}/theme-settings`);
    if (response.ok) {
      const result = await response.json();
      // Handle standardized API response format
      if (result.data?.themeSettings) {
        return result.data.themeSettings;
      }
    }
    
    // Fallback to theme-instance settings
    const instanceResponse = await fetch(`/api/stores/${subdomain}/theme-instance/settings`);
    if (instanceResponse.ok) {
      const instanceResult = await instanceResponse.json();
      return instanceResult.data || instanceResult;
    }
    
    return null;
  } catch (error) {
    console.error('[ThemeUtils] Failed to load theme instance settings:', error);
    return null;
  }
}

/**
 * Save theme instance settings
 */
export async function saveThemeInstanceSettings(
  subdomain: string, 
  settings: Record<string, any>
): Promise<void> {
  const response = await fetch(`/api/stores/${subdomain}/theme-instance/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save settings');
  }
}

/**
 * Extract default values from theme settings
 */
export function extractDefaultValues(themeSettings: ThemeSettings): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  Object.entries(themeSettings).forEach(([category, fields]) => {
    Object.entries(fields).forEach(([key, field]) => {
      const fullKey = `${category}.${key}`;
      defaults[fullKey] = field.default;
    });
  });
  
  return defaults;
}

/**
 * Send theme update to preview iframe
 */
export function sendThemeUpdateToPreview(settings: Record<string, any>, cssVariables: string) {
  // Try multiple selectors to find the preview iframe
  const iframe = document.querySelector('iframe[src*="preview"]') || 
                 document.querySelector('iframe[src*="/s/"]') || 
                 document.querySelector('iframe');
  
  if (iframe?.contentWindow) {
    try {
      iframe.contentWindow.postMessage({
        type: 'THEME_SETTINGS_UPDATE',
        settings,
        cssVariables
      }, '*');
      console.log('[ThemeUtils] Sent theme update to preview:', { 
        settings, 
        cssVariables: cssVariables.substring(0, 200) + '...'
      });
    } catch (error) {
      console.error('[ThemeUtils] Failed to send theme update:', error);
    }
  } else {
    console.warn('[ThemeUtils] No iframe found for theme preview update');
  }
}

/**
 * Standard theme loading hook pattern
 */
export async function loadThemeSettings(
  themeName: string,
  subdomain: string
): Promise<{
  themeSettings: ThemeSettings | null;
  currentValues: Record<string, any>;
  savedValues: Record<string, any>;
}> {
  try {
    // Load theme configuration
    const themeConfig = await loadThemeConfig(themeName);
    
    if (!themeConfig.settings) {
      return {
        themeSettings: null,
        currentValues: {},
        savedValues: {}
      };
    }
    
    // Load saved values or use defaults
    const savedSettings = await loadThemeInstanceSettings(subdomain);
    
    if (savedSettings) {
      return {
        themeSettings: themeConfig.settings,
        currentValues: savedSettings,
        savedValues: savedSettings
      };
    } else {
      // Use defaults
      const defaults = extractDefaultValues(themeConfig.settings);
      return {
        themeSettings: themeConfig.settings,
        currentValues: defaults,
        savedValues: defaults
      };
    }
  } catch (error) {
    console.error('[ThemeUtils] Failed to load theme settings:', error);
    toast.error('Failed to load theme settings');
    return {
      themeSettings: null,
      currentValues: {},
      savedValues: {}
    };
  }
}