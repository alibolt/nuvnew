// Simplified block settings that match actual component usage

export const simplifiedBlockSettings = {
  container: {
    layout: {
      type: 'icon_select',
      label: 'Layout',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' }
      ]
    },
    columnRatio: {
      type: 'column_ratio',
      label: 'Column Ratio',
      default: '50-50',
      showIf: 'layout:horizontal'
    },
    mobileLayout: {
      type: 'icon_select',
      label: 'Mobile Layout',
      default: 'stacked',
      options: [
        { value: 'stacked', label: 'Stacked' },
        { value: 'horizontal', label: 'Keep Horizontal' }
      ]
    },
    alignment: {
      type: 'icon_select',
      label: 'Content Alignment',
      default: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'between', label: 'Space Between' },
        { value: 'around', label: 'Space Around' },
        { value: 'stretch', label: 'Stretch' }
      ]
    },
    verticalAlignment: {
      type: 'icon_select', 
      label: 'Vertical Alignment',
      default: 'start',
      options: [
        { value: 'start', label: 'Top' },
        { value: 'center', label: 'Center' },
        { value: 'end', label: 'Bottom' }
      ]
    },
    gap: {
      type: 'select',
      label: 'Gap',
      default: '4',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'Small' },
        { value: '4', label: 'Medium' },
        { value: '6', label: 'Large' },
        { value: '8', label: 'Extra Large' }
      ]
    },
    mobileGap: {
      type: 'select',
      label: 'Mobile Gap',
      default: '4',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'Small' },
        { value: '4', label: 'Medium' },
        { value: '6', label: 'Large' },
        { value: '8', label: 'Extra Large' }
      ]
    },
    padding: {
      type: 'select',
      label: 'Padding',
      default: '0',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'Small' },
        { value: '4', label: 'Medium' },
        { value: '6', label: 'Large' },
        { value: '8', label: 'Extra Large' },
        { value: '10', label: '2X Large' },
        { value: '12', label: '3X Large' }
      ]
    },
    marginTop: {
      type: 'select',
      label: 'Margin Top',
      default: '0',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'Small' },
        { value: '4', label: 'Medium' },
        { value: '6', label: 'Large' },
        { value: '8', label: 'Extra Large' },
        { value: '10', label: '2X Large' },
        { value: '12', label: '3X Large' }
      ]
    },
    marginBottom: {
      type: 'select',
      label: 'Margin Bottom',
      default: '0',
      options: [
        { value: '0', label: 'None' },
        { value: '2', label: 'Small' },
        { value: '4', label: 'Medium' },
        { value: '6', label: 'Large' },
        { value: '8', label: 'Extra Large' },
        { value: '10', label: '2X Large' },
        { value: '12', label: '3X Large' }
      ]
    },
    maxWidth: {
      type: 'select',
      label: 'Max Width',
      default: 'none',
      options: [
        { value: 'none', label: 'Full Width' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: 'container', label: 'Container' }
      ]
    },
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      default: 'transparent'
    },
    borderRadius: {
      type: 'icon_select',
      label: 'Border Radius',
      default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: '2xl', label: '2X Large' },
        { value: 'full', label: 'Full' }
      ]
    },
    border: {
      type: 'select',
      label: 'Border',
      default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'thin', label: 'Thin' },
        { value: 'medium', label: 'Medium' },
        { value: 'thick', label: 'Thick' }
      ]
    }
  },
  navigation: {
    menuId: {
      type: 'select',
      label: 'Menu',
      default: 'main-menu',
      dynamic: 'menus',
      options: [
        { value: 'main-menu', label: 'Main Menu' },
        { value: 'footer-menu', label: 'Footer Menu' }
      ]
    }
  },

  'navigation-menu': {
    menuSource: {
      type: 'select',
      label: 'Menu Source',
      default: 'dashboard',
      options: [
        { value: 'dashboard', label: 'From Dashboard' },
        { value: 'custom', label: 'Custom Menu' }
      ]
    },
    menuHandle: {
      type: 'select',
      label: 'Select Menu',
      default: 'main-menu',
      dynamic: 'menus',
      options: [
        { value: 'main-menu', label: 'Main Menu' },
        { value: 'footer-menu', label: 'Footer Menu' }
      ],
      condition: (settings: any) => settings.menuSource === 'dashboard'
    },
    menuItems: {
      type: 'array',
      label: 'Custom Menu Items',
      default: [],
      condition: (settings: any) => settings.menuSource === 'custom',
      item: {
        id: {
          type: 'text',
          label: 'ID',
          default: ''
        },
        title: {
          type: 'text',
          label: 'Title',
          default: 'Menu Item'
        },
        href: {
          type: 'link',
          label: 'Link',
          default: '/',
          placeholder: 'Select or enter URL'
        },
        type: {
          type: 'select',
          label: 'Type',
          default: 'link',
          options: [
            { value: 'link', label: 'Link' },
            { value: 'dropdown', label: 'Dropdown' },
            { value: 'megamenu', label: 'Mega Menu' }
          ]
        }
      }
    },
    alignment: {
      type: 'select',
      label: 'Alignment',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' }
      ]
    },
    textSize: {
      type: 'select',
      label: 'Text Size',
      default: 'base',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'base', label: 'Base' },
        { value: 'large', label: 'Large' }
      ]
    },
    spacing: {
      type: 'select',
      label: 'Spacing',
      default: 'normal',
      options: [
        { value: 'compact', label: 'Compact' },
        { value: 'normal', label: 'Normal' },
        { value: 'spacious', label: 'Spacious' }
      ]
    },
    hoverEffect: {
      type: 'select',
      label: 'Hover Effect',
      default: 'underline',
      options: [
        { value: 'none', label: 'None' },
        { value: 'underline', label: 'Underline' },
        { value: 'color', label: 'Color' },
        { value: 'background', label: 'Background' }
      ]
    }
  },

  search: {
    displayMode: {
      type: 'select',
      label: 'Display',
      default: 'icon-only',
      options: [
        { value: 'expanded', label: 'Expanded' },
        { value: 'icon-only', label: 'Icon' }
      ]
    },
    placeholder: {
      type: 'text',
      label: 'Placeholder',
      default: 'Search...',
      condition: (settings: any) => settings.displayMode === 'expanded'
    }
  },

  cart: {
    showCount: {
      type: 'checkbox',
      label: 'Show Count Badge',
      default: true
    }
  },

  wishlist: {
    showCount: {
      type: 'checkbox',
      label: 'Show Count Badge',
      default: true
    }
  },


  account: {
    showLabel: {
      type: 'checkbox',
      label: 'Show "Account" Label',
      default: false
    }
  },

  logo: {
    type: {
      type: 'select',
      label: 'Type',
      default: 'image',
      options: [
        { value: 'image', label: 'Image' },
        { value: 'text', label: 'Text' }
      ]
    },
    src: {
      type: 'image',
      label: 'Logo',
      default: '/logo.svg',
      condition: (settings: any) => settings.type === 'image'
    },
    srcWhite: {
      type: 'image',
      label: 'Logo (White/Transparent Mode)',
      placeholder: 'Select white logo for transparent header',
      condition: (settings: any) => settings.type === 'image'
    },
    text: {
      type: 'text',
      label: 'Text',
      default: 'STORE',
      condition: (settings: any) => settings.type === 'text'
    },
    size: {
      type: 'select',
      label: 'Size',
      default: 'medium',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ]
    }
  },

  text: {
    content: {
      type: 'textarea',
      label: 'Text Content',
      default: 'Add your text here'
    },
    alignment: {
      type: 'icon_select',
      label: 'Text Alignment',
      default: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
        { value: 'justify', label: 'Justify' }
      ]
    },
    fontSize: {
      type: 'select',
      label: 'Font Size',
      default: 'base',
      options: [
        { value: 'xs', label: 'Extra Small' },
        { value: 'sm', label: 'Small' },
        { value: 'base', label: 'Normal' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: '2xl', label: '2X Large' }
      ]
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      default: 'normal',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'normal', label: 'Normal' },
        { value: 'medium', label: 'Medium' },
        { value: 'semibold', label: 'Semibold' },
        { value: 'bold', label: 'Bold' }
      ]
    },
    color: {
      type: 'color',
      label: 'Text Color',
      default: '#374151'
    }
  },

  heading: {
    text: {
      type: 'text',
      label: 'Heading Text',
      default: 'Heading'
    },
    level: {
      type: 'select',
      label: 'Heading Level',
      default: 'h2',
      options: [
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' },
        { value: 'h4', label: 'H4' },
        { value: 'h5', label: 'H5' },
        { value: 'h6', label: 'H6' }
      ]
    },
    alignment: {
      type: 'icon_select',
      label: 'Text Alignment',
      default: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ]
    },
    size: {
      type: 'select',
      label: 'Font Size',
      default: '2xl',
      options: [
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: '2xl', label: '2X Large' },
        { value: '3xl', label: '3X Large' },
        { value: '4xl', label: '4X Large' },
        { value: '5xl', label: '5X Large' }
      ]
    },
    fontWeight: {
      type: 'select',
      label: 'Font Weight',
      default: 'bold',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'medium', label: 'Medium' },
        { value: 'semibold', label: 'Semibold' },
        { value: 'bold', label: 'Bold' }
      ]
    },
    color: {
      type: 'color',
      label: 'Text Color',
      default: '#111827'
    }
  },

  button: {
    text: {
      type: 'text',
      label: 'Button Text',
      default: 'Button'
    },
    href: {
      type: 'link',
      label: 'Link URL',
      default: '#',
      placeholder: 'Select or enter URL'
    },
    variant: {
      type: 'select',
      label: 'Button Style',
      default: 'primary',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'outline', label: 'Outline' },
        { value: 'ghost', label: 'Ghost' }
      ]
    },
    size: {
      type: 'select',
      label: 'Button Size',
      default: 'medium',
      options: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ]
    },
    alignment: {
      type: 'icon_select',
      label: 'Button Alignment',
      default: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ]
    },
    fullWidth: {
      type: 'checkbox',
      label: 'Full Width',
      default: false
    },
    openInNewTab: {
      type: 'checkbox',
      label: 'Open in New Tab',
      default: false
    }
  },

  image: {
    src: {
      type: 'image',
      label: 'Image',
      default: '/placeholder-image.svg'
    },
    alt: {
      type: 'text',
      label: 'Alt Text',
      default: 'Image',
      placeholder: 'Describe the image for accessibility'
    },
    objectFit: {
      type: 'icon_select',
      label: 'Image Fit',
      default: 'cover',
      options: [
        { value: 'contain', label: 'Contain' },
        { value: 'cover', label: 'Cover' },
        { value: 'fill', label: 'Fill' },
        { value: 'none', label: 'None' }
      ]
    },
    alignment: {
      type: 'icon_select',
      label: 'Image Alignment',
      default: 'center',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' }
      ]
    },
    aspectRatio: {
      type: 'select',
      label: 'Aspect Ratio',
      default: 'auto',
      options: [
        { value: 'auto', label: 'Auto' },
        { value: 'square', label: 'Square (1:1)' },
        { value: 'video', label: 'Video (16:9)' },
        { value: 'portrait', label: 'Portrait (3:4)' },
        { value: 'landscape', label: 'Landscape (4:3)' }
      ]
    },
    borderRadius: {
      type: 'select',
      label: 'Border Radius',
      default: 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' },
        { value: 'full', label: 'Full' }
      ]
    }
  }
};

// Type definitions for block settings
export interface BlockSetting {
  type: 'text' | 'number' | 'select' | 'checkbox' | 'array' | 'color' | 'image' | 'textarea' | 'icon_select' | 'column_ratio' | 'visual_range';
  label: string;
  default?: any;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  item?: Record<string, Omit<BlockSetting, 'item'>>;
  condition?: (settings: any) => boolean;
  placeholder?: string;
  showIf?: string;
  dynamic?: string;
  rangeType?: 'padding' | 'margin' | 'gap';
}

export type BlockSettings = Record<string, BlockSetting>;

// Helper function to get default values for a block
export function getBlockDefaults(blockType: keyof typeof simplifiedBlockSettings): Record<string, any> {
  const settings = simplifiedBlockSettings[blockType];
  const defaults: Record<string, any> = {};
  
  for (const [key, setting] of Object.entries(settings)) {
    if ('default' in setting) {
      defaults[key] = setting.default;
    }
  }
  
  return defaults;
}

// Helper function to get simplified block settings for a block type
export function getSimplifiedBlockSettings(blockType: string): BlockSettings | undefined {
  return simplifiedBlockSettings[blockType as keyof typeof simplifiedBlockSettings];
}

// Helper function to validate block settings
export function validateBlockSettings(blockType: keyof typeof simplifiedBlockSettings, settings: Record<string, any>): boolean {
  const schema = simplifiedBlockSettings[blockType];
  
  for (const [key, schemaValue] of Object.entries(schema)) {
    // Check if conditional field should be validated
    if (schemaValue.condition && !schemaValue.condition(settings)) {
      continue;
    }
    
    const value = settings[key];
    
    // Check required fields (all fields with defaults are considered required)
    if ('default' in schemaValue && value === undefined) {
      console.warn(`Missing required field: ${key} in ${blockType} block`);
      return false;
    }
    
    // Type validation
    if (value !== undefined) {
      switch (schemaValue.type) {
        case 'number':
          if (typeof value !== 'number') {
            console.warn(`Invalid type for ${key}: expected number, got ${typeof value}`);
            return false;
          }
          if (schemaValue.min !== undefined && value < schemaValue.min) {
            console.warn(`Value for ${key} is below minimum: ${value} < ${schemaValue.min}`);
            return false;
          }
          if (schemaValue.max !== undefined && value > schemaValue.max) {
            console.warn(`Value for ${key} is above maximum: ${value} > ${schemaValue.max}`);
            return false;
          }
          break;
          
        case 'checkbox':
          if (typeof value !== 'boolean') {
            console.warn(`Invalid type for ${key}: expected boolean, got ${typeof value}`);
            return false;
          }
          break;
          
        case 'select':
          if (schemaValue.options && !schemaValue.options.some(opt => opt.value === value)) {
            console.warn(`Invalid value for ${key}: ${value} is not in options`);
            return false;
          }
          break;
          
        case 'array':
          if (!Array.isArray(value)) {
            console.warn(`Invalid type for ${key}: expected array, got ${typeof value}`);
            return false;
          }
          break;
      }
    }
  }
  
  return true;
}