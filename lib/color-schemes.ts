export interface ColorScheme {
  name: string;
  label: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
    success: string;
    error: string;
  };
}

export const colorSchemes: Record<string, ColorScheme> = {
  default: {
    name: 'default',
    label: 'Default',
    colors: {
      primary: '#8B9F7E',
      secondary: '#2B2B2B',
      accent: '#666666',
      background: '#FFFFFF',
      text: '#2B2B2B',
      border: '#E5E5E5',
      success: '#10B981',
      error: '#EF4444'
    }
  },
  dark: {
    name: 'dark',
    label: 'Dark Mode',
    colors: {
      primary: '#A0B090',
      secondary: '#E5E5E5',
      accent: '#9CA3AF',
      background: '#1F2937',
      text: '#F3F4F6',
      border: '#374151',
      success: '#34D399',
      error: '#F87171'
    }
  },
  ocean: {
    name: 'ocean',
    label: 'Ocean Blue',
    colors: {
      primary: '#0EA5E9',
      secondary: '#1E40AF',
      accent: '#06B6D4',
      background: '#F0F9FF',
      text: '#0C4A6E',
      border: '#BAE6FD',
      success: '#10B981',
      error: '#EF4444'
    }
  },
  forest: {
    name: 'forest',
    label: 'Forest Green',
    colors: {
      primary: '#16A34A',
      secondary: '#15803D',
      accent: '#84CC16',
      background: '#F0FDF4',
      text: '#14532D',
      border: '#BBF7D0',
      success: '#22C55E',
      error: '#DC2626'
    }
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset Orange',
    colors: {
      primary: '#F97316',
      secondary: '#EA580C',
      accent: '#FACC15',
      background: '#FFF7ED',
      text: '#7C2D12',
      border: '#FED7AA',
      success: '#16A34A',
      error: '#DC2626'
    }
  }
};

export function getColorScheme(schemeName: string): ColorScheme | null {
  return colorSchemes[schemeName] || null;
}

export function applyColorScheme(schemeName: string, currentSettings: Record<string, any>): Record<string, any> {
  const scheme = getColorScheme(schemeName);
  if (!scheme) return currentSettings;

  const newSettings = { ...currentSettings };
  
  // Apply color scheme colors
  Object.entries(scheme.colors).forEach(([colorKey, colorValue]) => {
    newSettings[`colors.${colorKey}`] = colorValue;
  });

  // Set the active scheme
  newSettings['colors.activeScheme'] = schemeName;

  return newSettings;
}