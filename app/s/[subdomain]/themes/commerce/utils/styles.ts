// Commerce theme utility functions for styling and CSS generation

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  monospaceFont: string;
  headingWeight: string;
  bodyWeight: string;
  sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeStyles {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Generate CSS custom properties from theme styles
export function generateCSSVariables(styles: ThemeStyles): string {
  const cssVariables: string[] = [':root {'];

  // Colors
  Object.entries(styles.colors).forEach(([key, value]) => {
    cssVariables.push(`  --color-${kebabCase(key)}: ${value};`);
  });

  // Typography
  cssVariables.push(`  --font-heading: ${styles.typography.headingFont};`);
  cssVariables.push(`  --font-body: ${styles.typography.bodyFont};`);
  cssVariables.push(`  --font-mono: ${styles.typography.monospaceFont};`);
  cssVariables.push(`  --font-weight-heading: ${styles.typography.headingWeight};`);
  cssVariables.push(`  --font-weight-body: ${styles.typography.bodyWeight};`);

  Object.entries(styles.typography.sizes).forEach(([key, value]) => {
    cssVariables.push(`  --font-size-${key}: ${value};`);
  });

  // Spacing
  Object.entries(styles.spacing).forEach(([key, value]) => {
    cssVariables.push(`  --spacing-${key}: ${value};`);
  });

  // Border radius
  Object.entries(styles.borderRadius).forEach(([key, value]) => {
    cssVariables.push(`  --border-radius-${key}: ${value};`);
  });

  // Shadows
  Object.entries(styles.shadows).forEach(([key, value]) => {
    cssVariables.push(`  --shadow-${key}: ${value};`);
  });

  cssVariables.push('}');
  
  return cssVariables.join('\n');
}

// Convert camelCase to kebab-case
export function kebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

// Convert kebab-case to camelCase
export function camelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Generate Tailwind classes for dynamic styling
export function generateTailwindClasses(styles: ThemeStyles) {
  return {
    // Color classes
    primary: {
      bg: 'bg-[var(--color-primary)]',
      text: 'text-[var(--color-primary)]',
      border: 'border-[var(--color-primary)]'
    },
    secondary: {
      bg: 'bg-[var(--color-secondary)]',
      text: 'text-[var(--color-secondary)]',
      border: 'border-[var(--color-secondary)]'
    },
    accent: {
      bg: 'bg-[var(--color-accent)]',
      text: 'text-[var(--color-accent)]',
      border: 'border-[var(--color-accent)]'
    },
    // Typography classes
    heading: 'font-[var(--font-heading)] font-[var(--font-weight-heading)]',
    body: 'font-[var(--font-body)] font-[var(--font-weight-body)]',
    mono: 'font-[var(--font-mono)]',
    // Spacing utilities
    spacing: Object.keys(styles.spacing).reduce((acc, key) => {
      acc[key] = {
        p: `p-[var(--spacing-${key})]`,
        m: `m-[var(--spacing-${key})]`,
        px: `px-[var(--spacing-${key})]`,
        py: `py-[var(--spacing-${key})]`,
        pt: `pt-[var(--spacing-${key})]`,
        pb: `pb-[var(--spacing-${key})]`,
        pl: `pl-[var(--spacing-${key})]`,
        pr: `pr-[var(--spacing-${key})]`
      };
      return acc;
    }, {} as Record<string, Record<string, string>>)
  };
}

// Utility for responsive design breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;

// Generate responsive classes
export function responsive<T>(classes: T): Record<keyof typeof breakpoints | 'base', T> {
  return {
    base: classes,
    sm: classes,
    md: classes,
    lg: classes,
    xl: classes,
    '2xl': classes
  };
}

// Animation utilities
export const animations = {
  fadeIn: 'animate-[fadeIn_0.5s_ease-in-out]',
  fadeOut: 'animate-[fadeOut_0.5s_ease-in-out]',
  slideInUp: 'animate-[slideInUp_0.5s_ease-out]',
  slideInDown: 'animate-[slideInDown_0.5s_ease-out]',
  slideInLeft: 'animate-[slideInLeft_0.5s_ease-out]',
  slideInRight: 'animate-[slideInRight_0.5s_ease-out]',
  scaleIn: 'animate-[scaleIn_0.3s_ease-out]',
  scaleOut: 'animate-[scaleOut_0.3s_ease-out]',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
} as const;

// Common component styles
export const componentStyles = {
  button: {
    base: 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    sizes: {
      sm: 'px-3 py-1.5 text-sm rounded-md',
      md: 'px-4 py-2 text-base rounded-md',
      lg: 'px-6 py-3 text-lg rounded-lg',
      xl: 'px-8 py-4 text-xl rounded-lg'
    },
    variants: {
      primary: 'bg-[var(--color-primary)] text-white hover:opacity-90 focus:ring-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)] text-white hover:opacity-90 focus:ring-[var(--color-secondary)]',
      outline: 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus:ring-[var(--color-primary)]',
      ghost: 'text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:ring-[var(--color-primary)]',
      link: 'text-[var(--color-primary)] hover:underline focus:ring-[var(--color-primary)]'
    }
  },
  card: {
    base: 'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-sm',
    hover: 'hover:shadow-md transition-shadow duration-200',
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8'
    }
  },
  input: {
    base: 'w-full px-3 py-2 border border-[var(--color-border)] rounded-md focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-[var(--color-background)] text-[var(--color-text)]',
    error: 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
    success: 'border-[var(--color-success)] focus:ring-[var(--color-success)]'
  }
} as const;

// Theme validation
export function validateThemeStyles(styles: Partial<ThemeStyles>): string[] {
  const errors: string[] = [];

  // Check required color properties
  const requiredColors = ['primary', 'secondary', 'background', 'text'];
  requiredColors.forEach(color => {
    if (!styles.colors?.[color as keyof ThemeColors]) {
      errors.push(`Missing required color: ${color}`);
    }
  });

  // Validate color format (hex, rgb, hsl)
  if (styles.colors) {
    Object.entries(styles.colors).forEach(([key, value]) => {
      if (!isValidColor(value)) {
        errors.push(`Invalid color format for ${key}: ${value}`);
      }
    });
  }

  return errors;
}

// Check if a color value is valid
function isValidColor(color: string): boolean {
  // Check hex colors
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    return true;
  }
  
  // Check rgb/rgba colors
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  // Check hsl/hsla colors
  if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+)?\s*\)$/.test(color)) {
    return true;
  }
  
  return false;
}

// Default theme styles for Commerce theme
export const defaultCommerceStyles: ThemeStyles = {
  colors: {
    primary: '#2563EB',
    secondary: '#64748B',
    accent: '#F59E0B',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    textSecondary: '#64748B',
    border: '#E2E8F0'
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    monospaceFont: 'JetBrains Mono',
    headingWeight: '700',
    bodyWeight: '400',
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
      '6xl': '60px'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px'
  },
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};