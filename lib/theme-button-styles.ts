// Centralized button styles for themes
export interface ButtonStyle {
  base: string;
  hover: string;
  focus: string;
  disabled: string;
}

export interface ThemeButtonStyles {
  primary: ButtonStyle;
  secondary: ButtonStyle;
}

export interface ThemeButtonSettings {
  // Primary button
  primaryStyle?: 'filled' | 'gradient' | 'shadow';
  primaryBackgroundColor?: string;
  primaryHoverColor?: string;
  primaryTextColor?: string;
  
  // Secondary button
  secondaryStyle?: 'filled' | 'outline' | 'ghost';
  secondaryBackgroundColor?: string;
  secondaryBorderColor?: string;
  secondaryTextColor?: string;
  secondaryHoverBackgroundColor?: string;
  secondaryHoverTextColor?: string;
  
  // Common settings
  buttonRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  buttonPadding?: 'sm' | 'md' | 'lg';
  buttonFontWeight?: '400' | '500' | '600' | '700';
  buttonTransition?: boolean;
}

// Get button styles from theme settings
export function getThemeButtonStyles(settings: ThemeButtonSettings): ThemeButtonStyles {
  const radiusMap = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full'
  };
  
  const paddingMap = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3'
  };
  
  const radius = radiusMap[settings.buttonRadius || 'md'];
  const padding = paddingMap[settings.buttonPadding || 'md'];
  const fontWeight = `font-${settings.buttonFontWeight || '600'}`;
  const transition = settings.buttonTransition !== false ? 'transition-all duration-200' : '';
  
  // Primary button styles
  let primaryBase = '';
  let primaryHover = '';
  
  if (settings.primaryStyle === 'gradient') {
    primaryBase = `bg-gradient-to-r from-[${settings.primaryBackgroundColor}] to-[${settings.primaryHoverColor}] text-[${settings.primaryTextColor}]`;
    primaryHover = `hover:shadow-lg hover:scale-105`;
  } else if (settings.primaryStyle === 'shadow') {
    primaryBase = `bg-[${settings.primaryBackgroundColor}] text-[${settings.primaryTextColor}] shadow-lg`;
    primaryHover = `hover:bg-[${settings.primaryHoverColor}] hover:shadow-xl`;
  } else {
    // Default filled
    primaryBase = `bg-[${settings.primaryBackgroundColor}] text-[${settings.primaryTextColor}]`;
    primaryHover = `hover:bg-[${settings.primaryHoverColor}]`;
  }
  
  // Secondary button styles
  let secondaryBase = '';
  let secondaryHover = '';
  
  if (settings.secondaryStyle === 'outline') {
    secondaryBase = `bg-[${settings.secondaryBackgroundColor}] text-[${settings.secondaryTextColor}] border-2 border-[${settings.secondaryBorderColor}]`;
    secondaryHover = `hover:bg-[${settings.secondaryHoverBackgroundColor}] hover:text-[${settings.secondaryHoverTextColor}] hover:border-[${settings.secondaryHoverBackgroundColor}]`;
  } else if (settings.secondaryStyle === 'ghost') {
    secondaryBase = `bg-transparent text-[${settings.secondaryTextColor}]`;
    secondaryHover = `hover:bg-[${settings.secondaryHoverBackgroundColor}]/10 hover:text-[${settings.secondaryHoverBackgroundColor}]`;
  } else {
    // Default filled
    secondaryBase = `bg-[${settings.secondaryBackgroundColor}] text-[${settings.secondaryTextColor}]`;
    secondaryHover = `hover:bg-[${settings.secondaryHoverBackgroundColor}] hover:text-[${settings.secondaryHoverTextColor}]`;
  }
  
  return {
    primary: {
      base: `${primaryBase} ${radius} ${padding} ${fontWeight} ${transition}`,
      hover: primaryHover,
      focus: `focus:ring-2 focus:ring-[${settings.primaryBackgroundColor}]/50 focus:ring-offset-2`,
      disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
    },
    secondary: {
      base: `${secondaryBase} ${radius} ${padding} ${fontWeight} ${transition}`,
      hover: secondaryHover,
      focus: `focus:ring-2 focus:ring-[${settings.secondaryBorderColor || settings.secondaryBackgroundColor}]/50 focus:ring-offset-2`,
      disabled: `disabled:opacity-50 disabled:cursor-not-allowed`
    }
  };
}

// Utility function to get button classes
export function getButtonClasses(
  variant: keyof ThemeButtonStyles = 'primary',
  themeSettings: ThemeButtonSettings
): string {
  const styles = getThemeButtonStyles(themeSettings);
  const variantStyles = styles[variant] || styles.primary;
  
  // Common classes
  const commonClasses = 'inline-flex items-center justify-center';
  
  return `${commonClasses} ${variantStyles.base} ${variantStyles.hover} ${variantStyles.focus} ${variantStyles.disabled}`;
}

// CSS Variables approach for dynamic theming
export function generateButtonCSS(settings: any): string {
  const radiusMap: Record<string, string> = {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px'
  };
  
  const paddingMap: Record<string, string> = {
    sm: '0.375rem 0.75rem',
    md: '0.625rem 1.25rem',
    lg: '0.75rem 1.5rem'
  };
  
  // Use global layout.borderRadius if available, otherwise fall back to button-specific radius
  const globalRadius = settings.layout?.borderRadius || settings.buttonRadius || 'md';
  const radius = radiusMap[globalRadius] || radiusMap.md;
  const padding = paddingMap[settings.buttonPadding || 'md'];
  const fontWeight = settings.buttonFontWeight || '600';
  const transition = settings.buttonTransition !== false ? 'all 200ms' : 'none';
  
  // Generate gradient styles for primary button
  const primaryGradient = settings.primaryStyle === 'gradient' 
    ? `background-image: linear-gradient(to right, ${settings.primaryBackgroundColor}, ${settings.primaryHoverColor});`
    : '';
  
  const primaryShadow = settings.primaryStyle === 'shadow'
    ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);'
    : '';
  
  return `
    /* Button Styles from Theme Settings */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: ${fontWeight};
      border-radius: var(--theme-layout-border-radius, ${radius});
      padding: ${padding};
      transition: ${transition};
      cursor: pointer;
      border: none;
      text-decoration: none;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Primary Button */
    .btn-primary {
      ${settings.primaryStyle === 'gradient' ? primaryGradient : `background-color: ${settings.primaryBackgroundColor || 'var(--theme-colors-primary, #2563EB)'};`}
      color: ${settings.primaryTextColor || '#FFFFFF'};
      ${primaryShadow}
    }
    
    .btn-primary:hover:not(:disabled) {
      ${settings.primaryStyle === 'gradient' 
        ? 'box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); transform: scale(1.05);' 
        : `background-color: ${settings.primaryHoverColor};`}
      ${settings.primaryStyle === 'shadow' ? 'box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
    }
    
    .btn-primary:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px ${settings.primaryBackgroundColor}33;
    }
    
    /* Secondary Button */
    ${settings.secondaryStyle === 'outline' ? `
    .btn-secondary {
      background-color: ${settings.secondaryBackgroundColor};
      color: ${settings.secondaryTextColor};
      border: 2px solid ${settings.secondaryBorderColor};
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: ${settings.secondaryHoverBackgroundColor};
      color: ${settings.secondaryHoverTextColor};
      border-color: ${settings.secondaryHoverBackgroundColor};
    }` : ''}
    
    ${settings.secondaryStyle === 'ghost' ? `
    .btn-secondary {
      background-color: transparent;
      color: ${settings.secondaryTextColor};
      border: none;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: ${settings.secondaryHoverBackgroundColor}1A;
      color: ${settings.secondaryHoverBackgroundColor};
    }` : ''}
    
    ${settings.secondaryStyle === 'filled' ? `
    .btn-secondary {
      background-color: ${settings.secondaryBackgroundColor};
      color: ${settings.secondaryTextColor};
    }
    
    .btn-secondary:hover:not(:disabled) {
      background-color: ${settings.secondaryHoverBackgroundColor};
      color: ${settings.secondaryHoverTextColor};
    }` : ''}
    
    .btn-secondary:focus {
      outline: 2px solid transparent;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px ${settings.secondaryBorderColor || settings.secondaryBackgroundColor}33;
    }
  `;
}