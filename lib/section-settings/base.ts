// Base Section Settings - Shared across all sections
// This file defines the core settings structure that all sections inherit

// Responsive setting type for different breakpoints
export type ResponsiveSetting<T> = T | {
  mobile?: T;
  tablet?: T;
  desktop?: T;
};

// Base settings that every section has
export interface BaseSectionSettings {
  // Core
  enabled: boolean;
  
  // Visibility controls
  visibility?: {
    mobile?: boolean;
    tablet?: boolean;
    desktop?: boolean;
  };
  
  // Scheduling (for promotional sections)
  scheduling?: {
    startDate?: string;
    endDate?: string;
    timezone?: string;
  };
  
  // Advanced
  advanced?: {
    customClass?: string;
    customId?: string;
    animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-down' | 'zoom-in';
    animationDelay?: number;
  };
}

// Common layout settings that can be inherited
export interface CommonLayoutSettings {
  spacing?: {
    top?: ResponsiveSetting<'none' | 'small' | 'medium' | 'large' | 'xl'>;
    bottom?: ResponsiveSetting<'none' | 'small' | 'medium' | 'large' | 'xl'>;
  };
  containerWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  contentAlignment?: 'left' | 'center' | 'right';
}

// Common style overrides
export interface CommonStyleOverrides {
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// Section preset type
export interface SectionPreset<T = any> {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category?: string;
  settings: Partial<T>;
}

// Spacing values mapping
export const SPACING_VALUES = {
  none: '0',
  small: '1rem',
  medium: '2rem',
  large: '4rem',
  xl: '6rem',
} as const;

// Helper to get responsive value
export function getResponsiveValue<T>(
  value: ResponsiveSetting<T>,
  breakpoint: 'mobile' | 'tablet' | 'desktop'
): T {
  if (typeof value === 'object' && value !== null) {
    return (value as any)[breakpoint] ?? (value as any).mobile ?? value;
  }
  return value;
}

// Smart defaults based on section position
export function getSmartDefaults(
  sectionType: string,
  position: number,
  previousSection?: { type: string; settings: any }
): Partial<BaseSectionSettings & CommonLayoutSettings> {
  const defaults: Partial<BaseSectionSettings & CommonLayoutSettings> = {
    enabled: true,
  };

  // First section (usually hero) gets no top spacing
  if (position === 0) {
    defaults.spacing = { top: 'none', bottom: 'large' };
  } 
  // Section after hero gets extra spacing
  else if (position === 1) {
    defaults.spacing = { top: 'xl', bottom: 'large' };
  }
  // Default spacing for other sections
  else {
    defaults.spacing = { top: 'large', bottom: 'large' };
  }

  // Adjust spacing if previous section has similar background
  if (previousSection?.type === sectionType) {
    defaults.spacing = { top: 'medium', bottom: 'medium' };
  }

  return defaults;
}