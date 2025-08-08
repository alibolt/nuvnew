/**
 * Utility functions for applying theme layout settings to sections
 */

interface ThemeLayoutSettings {
  fullWidth?: boolean;
  containerWidth?: number;
  sectionPadding?: number;
  elementSpacing?: number;
  borderRadius?: string;
  contentAlignment?: 'left' | 'center' | 'right';
}

/**
 * Get container styles based on theme settings
 */
export function getContainerStyles(themeSettings?: Record<string, any>) {
  return {
    maxWidth: 'var(--theme-layout-container-width, 1200px)',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    '@media (min-width: 640px)': {
      paddingLeft: '1.5rem',
      paddingRight: '1.5rem',
    },
    '@media (min-width: 1024px)': {
      paddingLeft: '2rem',
      paddingRight: '2rem',
    }
  };
}

/**
 * Get section padding styles
 */
export function getSectionPadding() {
  return {
    paddingTop: 'var(--theme-layout-section-padding, 80px)',
    paddingBottom: 'var(--theme-layout-section-padding, 80px)'
  };
}

/**
 * Get element spacing as a className
 */
export function getElementSpacingClass(): string {
  return 'gap-[var(--theme-layout-element-spacing,20px)]';
}

/**
 * Get border radius styles
 */
export function getBorderRadiusStyles(element?: 'button' | 'card' | 'input' | 'image') {
  const base = 'var(--theme-layout-border-radius, 8px)';
  
  // Different elements might need different radius values
  switch (element) {
    case 'button':
      return { borderRadius: base };
    case 'card':
      return { borderRadius: base };
    case 'input':
      return { borderRadius: base };
    case 'image':
      return { borderRadius: base };
    default:
      return { borderRadius: base };
  }
}

/**
 * Get content alignment classes
 */
export function getContentAlignmentClass(override?: 'left' | 'center' | 'right'): string {
  if (override) {
    return `text-${override}`;
  }
  
  // Use CSS custom property with JavaScript
  return 'text-[var(--theme-layout-content-alignment,left)]';
}

/**
 * Combined function to get all layout styles for a section
 */
export function getSectionLayoutStyles(options?: {
  includeContainer?: boolean;
  includePadding?: boolean;
  customPadding?: { top?: string; bottom?: string };
}) {
  const {
    includeContainer = true,
    includePadding = true,
    customPadding
  } = options || {};

  let styles: Record<string, any> = {};

  if (includeContainer) {
    styles.maxWidth = 'var(--theme-layout-container-width, 1200px)';
  }

  if (includePadding) {
    if (customPadding) {
      styles.paddingTop = customPadding.top || 'var(--theme-layout-section-padding, 80px)';
      styles.paddingBottom = customPadding.bottom || 'var(--theme-layout-section-padding, 80px)';
    } else {
      styles.paddingTop = 'var(--theme-layout-section-padding, 80px)';
      styles.paddingBottom = 'var(--theme-layout-section-padding, 80px)';
    }
  }

  return styles;
}