// Block styling system with responsive design support
export interface StyleSetting {
  type: 'spacing' | 'color' | 'typography' | 'layout' | 'border' | 'shadow' | 'background';
  property: string;
  value: string | number;
  responsive?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface ResponsiveStyles {
  default: StyleSetting[];
  sm?: StyleSetting[];
  md?: StyleSetting[];
  lg?: StyleSetting[];
  xl?: StyleSetting[];
  '2xl'?: StyleSetting[];
}

export interface BlockStyleSchema {
  spacing: {
    margin: ResponsiveStyleOption;
    padding: ResponsiveStyleOption;
  };
  colors: {
    text: ColorOption;
    background: ColorOption;
    border: ColorOption;
  };
  typography: {
    fontSize: ResponsiveStyleOption;
    fontWeight: StyleOption;
    lineHeight: StyleOption;
    letterSpacing: StyleOption;
    textAlign: ResponsiveStyleOption;
  };
  layout: {
    width: ResponsiveStyleOption;
    height: ResponsiveStyleOption;
    display: ResponsiveStyleOption;
    flexDirection: ResponsiveStyleOption;
    justifyContent: ResponsiveStyleOption;
    alignItems: ResponsiveStyleOption;
    gap: ResponsiveStyleOption;
  };
  border: {
    width: StyleOption;
    style: StyleOption;
    radius: StyleOption;
  };
  shadow: {
    size: StyleOption;
    color: ColorOption;
  };
  background: {
    type: StyleOption;
    color: ColorOption;
    image: StyleOption;
    position: StyleOption;
    size: StyleOption;
    repeat: StyleOption;
  };
}

export interface StyleOption {
  type: 'select' | 'text' | 'number' | 'range';
  label: string;
  options?: Array<{ value: string; label: string; preview?: string }>;
  default?: string | number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface ResponsiveStyleOption extends StyleOption {
  responsive: true;
  breakpoints: ('sm' | 'md' | 'lg' | 'xl' | '2xl')[];
}

export interface ColorOption extends StyleOption {
  type: 'color';
  presets?: Array<{ color: string; name: string }>;
  allowCustom?: boolean;
}

// Default style schema for blocks
export const DEFAULT_BLOCK_STYLE_SCHEMA: BlockStyleSchema = {
  spacing: {
    margin: {
      type: 'select',
      label: 'Margin',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'm-0', label: 'None' },
        { value: 'm-1', label: 'XS' },
        { value: 'm-2', label: 'SM' },
        { value: 'm-4', label: 'MD' },
        { value: 'm-6', label: 'LG' },
        { value: 'm-8', label: 'XL' },
        { value: 'm-12', label: '2XL' },
        { value: 'm-16', label: '3XL' },
        { value: 'm-24', label: '4XL' }
      ],
      default: 'm-0'
    },
    padding: {
      type: 'select',
      label: 'Padding',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'p-0', label: 'None' },
        { value: 'p-1', label: 'XS' },
        { value: 'p-2', label: 'SM' },
        { value: 'p-4', label: 'MD' },
        { value: 'p-6', label: 'LG' },
        { value: 'p-8', label: 'XL' },
        { value: 'p-12', label: '2XL' },
        { value: 'p-16', label: '3XL' },
        { value: 'p-24', label: '4XL' }
      ],
      default: 'p-0'
    }
  },
  colors: {
    text: {
      type: 'color',
      label: 'Text Color',
      presets: [
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray 700' },
        { color: '#6B7280', name: 'Gray 500' },
        { color: '#9CA3AF', name: 'Gray 400' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#EF4444', name: 'Red' },
        { color: '#F59E0B', name: 'Yellow' },
        { color: '#10B981', name: 'Green' },
        { color: '#3B82F6', name: 'Blue' },
        { color: '#8B5CF6', name: 'Purple' }
      ],
      allowCustom: true,
      default: '#000000'
    },
    background: {
      type: 'color',
      label: 'Background Color',
      presets: [
        { color: 'transparent', name: 'Transparent' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#F9FAFB', name: 'Gray 50' },
        { color: '#F3F4F6', name: 'Gray 100' },
        { color: '#E5E7EB', name: 'Gray 200' },
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray 700' },
        { color: '#FEF2F2', name: 'Red 50' },
        { color: '#FEF3C7', name: 'Yellow 50' },
        { color: '#ECFDF5', name: 'Green 50' },
        { color: '#EFF6FF', name: 'Blue 50' },
        { color: '#F5F3FF', name: 'Purple 50' }
      ],
      allowCustom: true,
      default: 'transparent'
    },
    border: {
      type: 'color',
      label: 'Border Color',
      presets: [
        { color: 'transparent', name: 'Transparent' },
        { color: '#E5E7EB', name: 'Gray 200' },
        { color: '#D1D5DB', name: 'Gray 300' },
        { color: '#9CA3AF', name: 'Gray 400' },
        { color: '#6B7280', name: 'Gray 500' },
        { color: '#374151', name: 'Gray 700' },
        { color: '#EF4444', name: 'Red' },
        { color: '#F59E0B', name: 'Yellow' },
        { color: '#10B981', name: 'Green' },
        { color: '#3B82F6', name: 'Blue' },
        { color: '#8B5CF6', name: 'Purple' }
      ],
      allowCustom: true,
      default: 'transparent'
    }
  },
  typography: {
    fontSize: {
      type: 'select',
      label: 'Font Size',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'text-xs', label: 'XS (12px)' },
        { value: 'text-sm', label: 'SM (14px)' },
        { value: 'text-base', label: 'Base (16px)' },
        { value: 'text-lg', label: 'LG (18px)' },
        { value: 'text-xl', label: 'XL (20px)' },
        { value: 'text-2xl', label: '2XL (24px)' },
        { value: 'text-3xl', label: '3XL (30px)' },
        { value: 'text-4xl', label: '4XL (36px)' },
        { value: 'text-5xl', label: '5XL (48px)' },
        { value: 'text-6xl', label: '6XL (60px)' }
      ],
      default: 'text-base'
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      options: [
        { value: 'font-thin', label: 'Thin (100)' },
        { value: 'font-extralight', label: 'Extra Light (200)' },
        { value: 'font-light', label: 'Light (300)' },
        { value: 'font-normal', label: 'Normal (400)' },
        { value: 'font-medium', label: 'Medium (500)' },
        { value: 'font-semibold', label: 'Semi Bold (600)' },
        { value: 'font-bold', label: 'Bold (700)' },
        { value: 'font-extrabold', label: 'Extra Bold (800)' },
        { value: 'font-black', label: 'Black (900)' }
      ],
      default: 'font-normal'
    },
    lineHeight: {
      type: 'select',
      label: 'Line Height',
      options: [
        { value: 'leading-none', label: 'None (1)' },
        { value: 'leading-tight', label: 'Tight (1.25)' },
        { value: 'leading-snug', label: 'Snug (1.375)' },
        { value: 'leading-normal', label: 'Normal (1.5)' },
        { value: 'leading-relaxed', label: 'Relaxed (1.625)' },
        { value: 'leading-loose', label: 'Loose (2)' }
      ],
      default: 'leading-normal'
    },
    letterSpacing: {
      type: 'select',
      label: 'Letter Spacing',
      options: [
        { value: 'tracking-tighter', label: 'Tighter' },
        { value: 'tracking-tight', label: 'Tight' },
        { value: 'tracking-normal', label: 'Normal' },
        { value: 'tracking-wide', label: 'Wide' },
        { value: 'tracking-wider', label: 'Wider' },
        { value: 'tracking-widest', label: 'Widest' }
      ],
      default: 'tracking-normal'
    },
    textAlign: {
      type: 'select',
      label: 'Text Align',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'text-left', label: 'Left' },
        { value: 'text-center', label: 'Center' },
        { value: 'text-right', label: 'Right' },
        { value: 'text-justify', label: 'Justify' }
      ],
      default: 'text-left'
    }
  },
  layout: {
    width: {
      type: 'select',
      label: 'Width',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'w-auto', label: 'Auto' },
        { value: 'w-full', label: 'Full' },
        { value: 'w-1/2', label: '50%' },
        { value: 'w-1/3', label: '33%' },
        { value: 'w-2/3', label: '67%' },
        { value: 'w-1/4', label: '25%' },
        { value: 'w-3/4', label: '75%' },
        { value: 'w-1/5', label: '20%' },
        { value: 'w-2/5', label: '40%' },
        { value: 'w-3/5', label: '60%' },
        { value: 'w-4/5', label: '80%' }
      ],
      default: 'w-auto'
    },
    height: {
      type: 'select',
      label: 'Height',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'h-auto', label: 'Auto' },
        { value: 'h-full', label: 'Full' },
        { value: 'h-screen', label: 'Screen' },
        { value: 'h-16', label: '64px' },
        { value: 'h-24', label: '96px' },
        { value: 'h-32', label: '128px' },
        { value: 'h-48', label: '192px' },
        { value: 'h-64', label: '256px' },
        { value: 'h-96', label: '384px' }
      ],
      default: 'h-auto'
    },
    display: {
      type: 'select',
      label: 'Display',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'block', label: 'Block' },
        { value: 'inline-block', label: 'Inline Block' },
        { value: 'inline', label: 'Inline' },
        { value: 'flex', label: 'Flex' },
        { value: 'inline-flex', label: 'Inline Flex' },
        { value: 'grid', label: 'Grid' },
        { value: 'inline-grid', label: 'Inline Grid' },
        { value: 'hidden', label: 'Hidden' }
      ],
      default: 'block'
    },
    flexDirection: {
      type: 'select',
      label: 'Flex Direction',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'flex-row', label: 'Row' },
        { value: 'flex-row-reverse', label: 'Row Reverse' },
        { value: 'flex-col', label: 'Column' },
        { value: 'flex-col-reverse', label: 'Column Reverse' }
      ],
      default: 'flex-row'
    },
    justifyContent: {
      type: 'select',
      label: 'Justify Content',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'justify-start', label: 'Start' },
        { value: 'justify-end', label: 'End' },
        { value: 'justify-center', label: 'Center' },
        { value: 'justify-between', label: 'Between' },
        { value: 'justify-around', label: 'Around' },
        { value: 'justify-evenly', label: 'Evenly' }
      ],
      default: 'justify-start'
    },
    alignItems: {
      type: 'select',
      label: 'Align Items',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'items-start', label: 'Start' },
        { value: 'items-end', label: 'End' },
        { value: 'items-center', label: 'Center' },
        { value: 'items-baseline', label: 'Baseline' },
        { value: 'items-stretch', label: 'Stretch' }
      ],
      default: 'items-start'
    },
    gap: {
      type: 'select',
      label: 'Gap',
      responsive: true,
      breakpoints: ['sm', 'md', 'lg', 'xl', '2xl'],
      options: [
        { value: 'gap-0', label: 'None' },
        { value: 'gap-1', label: 'XS' },
        { value: 'gap-2', label: 'SM' },
        { value: 'gap-4', label: 'MD' },
        { value: 'gap-6', label: 'LG' },
        { value: 'gap-8', label: 'XL' },
        { value: 'gap-12', label: '2XL' },
        { value: 'gap-16', label: '3XL' }
      ],
      default: 'gap-0'
    }
  },
  border: {
    width: {
      type: 'select',
      label: 'Border Width',
      options: [
        { value: 'border-0', label: 'None' },
        { value: 'border', label: '1px' },
        { value: 'border-2', label: '2px' },
        { value: 'border-4', label: '4px' },
        { value: 'border-8', label: '8px' }
      ],
      default: 'border-0'
    },
    style: {
      type: 'select',
      label: 'Border Style',
      options: [
        { value: 'border-solid', label: 'Solid' },
        { value: 'border-dashed', label: 'Dashed' },
        { value: 'border-dotted', label: 'Dotted' },
        { value: 'border-double', label: 'Double' },
        { value: 'border-none', label: 'None' }
      ],
      default: 'border-solid'
    },
    radius: {
      type: 'select',
      label: 'Border Radius',
      options: [
        { value: 'rounded-none', label: 'None' },
        { value: 'rounded-sm', label: 'Small' },
        { value: 'rounded', label: 'Default' },
        { value: 'rounded-md', label: 'Medium' },
        { value: 'rounded-lg', label: 'Large' },
        { value: 'rounded-xl', label: 'Extra Large' },
        { value: 'rounded-2xl', label: '2X Large' },
        { value: 'rounded-3xl', label: '3X Large' },
        { value: 'rounded-full', label: 'Full' }
      ],
      default: 'rounded-none'
    }
  },
  shadow: {
    size: {
      type: 'select',
      label: 'Shadow Size',
      options: [
        { value: 'shadow-none', label: 'None' },
        { value: 'shadow-sm', label: 'Small' },
        { value: 'shadow', label: 'Default' },
        { value: 'shadow-md', label: 'Medium' },
        { value: 'shadow-lg', label: 'Large' },
        { value: 'shadow-xl', label: 'Extra Large' },
        { value: 'shadow-2xl', label: '2X Large' },
        { value: 'shadow-inner', label: 'Inner' }
      ],
      default: 'shadow-none'
    },
    color: {
      type: 'color',
      label: 'Shadow Color',
      presets: [
        { color: 'transparent', name: 'Transparent' },
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray' },
        { color: '#EF4444', name: 'Red' },
        { color: '#F59E0B', name: 'Yellow' },
        { color: '#10B981', name: 'Green' },
        { color: '#3B82F6', name: 'Blue' },
        { color: '#8B5CF6', name: 'Purple' }
      ],
      allowCustom: true,
      default: 'transparent'
    }
  },
  background: {
    type: {
      type: 'select',
      label: 'Background Type',
      options: [
        { value: 'none', label: 'None' },
        { value: 'color', label: 'Color' },
        { value: 'gradient', label: 'Gradient' },
        { value: 'image', label: 'Image' }
      ],
      default: 'none'
    },
    color: {
      type: 'color',
      label: 'Background Color',
      presets: [
        { color: 'transparent', name: 'Transparent' },
        { color: '#FFFFFF', name: 'White' },
        { color: '#F9FAFB', name: 'Gray 50' },
        { color: '#F3F4F6', name: 'Gray 100' },
        { color: '#E5E7EB', name: 'Gray 200' },
        { color: '#000000', name: 'Black' },
        { color: '#374151', name: 'Gray 700' }
      ],
      allowCustom: true,
      default: 'transparent'
    },
    image: {
      type: 'text',
      label: 'Background Image URL',
      default: ''
    },
    position: {
      type: 'select',
      label: 'Background Position',
      options: [
        { value: 'bg-center', label: 'Center' },
        { value: 'bg-top', label: 'Top' },
        { value: 'bg-bottom', label: 'Bottom' },
        { value: 'bg-left', label: 'Left' },
        { value: 'bg-right', label: 'Right' },
        { value: 'bg-left-top', label: 'Left Top' },
        { value: 'bg-right-top', label: 'Right Top' },
        { value: 'bg-left-bottom', label: 'Left Bottom' },
        { value: 'bg-right-bottom', label: 'Right Bottom' }
      ],
      default: 'bg-center'
    },
    size: {
      type: 'select',
      label: 'Background Size',
      options: [
        { value: 'bg-auto', label: 'Auto' },
        { value: 'bg-cover', label: 'Cover' },
        { value: 'bg-contain', label: 'Contain' }
      ],
      default: 'bg-cover'
    },
    repeat: {
      type: 'select',
      label: 'Background Repeat',
      options: [
        { value: 'bg-repeat', label: 'Repeat' },
        { value: 'bg-no-repeat', label: 'No Repeat' },
        { value: 'bg-repeat-x', label: 'Repeat X' },
        { value: 'bg-repeat-y', label: 'Repeat Y' }
      ],
      default: 'bg-no-repeat'
    }
  }
};

// Block style utilities
export class BlockStyleUtils {
  // Generate CSS classes from style settings
  static generateClasses(styles: Record<string, any>, breakpoint?: string): string {
    const classes: string[] = [];
    
    Object.entries(styles).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        // Add breakpoint prefix if specified
        if (breakpoint && breakpoint !== 'default') {
          classes.push(`${breakpoint}:${value}`);
        } else {
          classes.push(value);
        }
      }
    });
    
    return classes.join(' ');
  }
  
  // Generate responsive classes
  static generateResponsiveClasses(responsiveStyles: ResponsiveStyles): string {
    const allClasses: string[] = [];
    
    // Add default styles
    if (responsiveStyles.default) {
      allClasses.push(this.generateClasses(responsiveStyles.default));
    }
    
    // Add breakpoint-specific styles
    (['sm', 'md', 'lg', 'xl', '2xl'] as const).forEach(breakpoint => {
      if (responsiveStyles[breakpoint]) {
        allClasses.push(this.generateClasses(responsiveStyles[breakpoint], breakpoint));
      }
    });
    
    return allClasses.join(' ');
  }
  
  // Get style schema for a specific block type
  static getStyleSchema(blockType: string): BlockStyleSchema {
    // Block-specific style schemas can be added here
    // For now, return the default schema
    return DEFAULT_BLOCK_STYLE_SCHEMA;
  }
  
  // Validate style values
  static validateStyles(styles: Record<string, any>, schema: BlockStyleSchema): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Basic validation - can be extended
    Object.entries(styles).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return; // Skip null/undefined values
      }
      
      // Validate color values
      if (key.includes('color') || key.includes('Color')) {
        if (typeof value === 'string' && value.startsWith('#')) {
          const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          if (!hexRegex.test(value)) {
            errors.push(`Invalid color format for ${key}: ${value}`);
          }
        }
      }
      
      // Validate numeric values
      if (key.includes('width') || key.includes('height') || key.includes('size')) {
        if (typeof value === 'number' && (value < 0 || value > 9999)) {
          errors.push(`Invalid numeric value for ${key}: ${value}`);
        }
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  // Merge default styles with custom styles
  static mergeStyles(defaultStyles: Record<string, any>, customStyles: Record<string, any>): Record<string, any> {
    return {
      ...defaultStyles,
      ...customStyles
    };
  }
  
  // Convert hex color to Tailwind class
  static hexToTailwindClass(hex: string, type: 'text' | 'bg' | 'border' = 'text'): string {
    // This is a simplified conversion - in a real app, you'd have a more comprehensive mapping
    const colorMap: Record<string, string> = {
      '#000000': 'black',
      '#FFFFFF': 'white',
      '#374151': 'gray-700',
      '#6B7280': 'gray-500',
      '#9CA3AF': 'gray-400',
      '#E5E7EB': 'gray-200',
      '#F3F4F6': 'gray-100',
      '#F9FAFB': 'gray-50',
      '#EF4444': 'red-500',
      '#F59E0B': 'yellow-500',
      '#10B981': 'green-500',
      '#3B82F6': 'blue-500',
      '#8B5CF6': 'purple-500'
    };
    
    const colorName = colorMap[hex] || 'gray-500';
    return `${type}-${colorName}`;
  }
  
  // Get CSS custom properties for dynamic colors
  static getCSSCustomProperties(styles: Record<string, any>): Record<string, string> {
    const customProperties: Record<string, string> = {};
    
    Object.entries(styles).forEach(([key, value]) => {
      if (key.includes('color') || key.includes('Color')) {
        if (typeof value === 'string' && value.startsWith('#')) {
          customProperties[`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value;
        }
      }
    });
    
    return customProperties;
  }
}

export default BlockStyleUtils;