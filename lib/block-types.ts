import { 
  Type, Image, Square, Minus, Code, Video, FileText, 
  ExternalLink, Calendar, Star, MapPin, Mail, Phone,
  Users, MessageSquare, Instagram, Facebook, Twitter,
  ChevronDown, Grid, List, Play, Pause, Heart, Search, UserPlus,
  Clock, Shield, Share2, DollarSign, Tag, Package, Filter,
  ArrowUpDown, ChevronRight, Megaphone, Plus, ShoppingBag, Info, Globe, Menu, User,
  Link, Columns
} from 'lucide-react';

// Block type interface
export interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: 'content' | 'media' | 'actions' | 'layout' | 'social' | 'advanced';
  maxPerSection?: number;
  settings: BlockSettings;
  preview?: string; // Preview image or description
}

// Block settings schema
export interface BlockSettings {
  [key: string]: BlockFieldSchema;
}

export interface BlockFieldSchema {
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'color' | 'number' | 'range' | 'url' | 'image' | 'media' | 'code';
  label: string;
  placeholder?: string;
  helperText?: string;
  default?: any;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: string | { field: string; value: any }; // Show only if another field has specific value
}

// Complete block type registry
export const BLOCK_TYPES: Record<string, BlockType> = {
  // BRAND BLOCKS
  logo: {
    id: 'logo',
    name: 'Logo',
    description: 'Store logo',
    icon: Image,
    category: 'content',
    maxPerSection: 1,
    settings: {
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
        placeholder: 'Select logo',
        conditional: { field: 'type', value: 'image' }
      },
      srcWhite: {
        type: 'image',
        label: 'Logo (White/Transparent Mode)',
        placeholder: 'Select white logo for transparent header',
        conditional: { field: 'type', value: 'image' }
      },
      text: {
        type: 'text',
        label: 'Text',
        default: 'STORE',
        conditional: { field: 'type', value: 'text' }
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
    }
  },

  // NAVIGATION BLOCKS
  navigation: {
    id: 'navigation',
    name: 'Navigation Menu',
    description: 'Main navigation menu',
    icon: List,
    category: 'content',
    maxPerSection: 1,
    settings: {
      menuId: {
        type: 'select',
        label: 'Menu',
        placeholder: 'Select menu',
        dynamic: 'menus',
        default: 'main-menu',
        options: [
          { value: 'main-menu', label: 'Main Menu' },
          { value: 'footer-menu', label: 'Footer Menu' }
        ]
      }
    }
  },

  // SEARCH BLOCK
  search: {
    id: 'search',
    name: 'Search',
    description: 'Product search',
    icon: MessageSquare,
    category: 'content',
    maxPerSection: 1,
    settings: {
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
        conditional: { field: 'displayMode', value: 'expanded' }
      }
    }
  },

  // CART BLOCK
  cart: {
    id: 'cart',
    name: 'Cart',
    description: 'Shopping cart icon',
    icon: Square,
    category: 'content',
    maxPerSection: 1,
    settings: {
      showCount: {
        type: 'checkbox',
        label: 'Show Count',
        default: true
      }
    }
  },

  // USER ACCOUNT BLOCK
  account: {
    id: 'account',
    name: 'Account Icon',
    description: 'User account access',
    icon: Users,
    category: 'content',
    maxPerSection: 1,
    settings: {
      showLabel: {
        type: 'checkbox',
        label: 'Show "Account" Label',
        default: false
      }
    }
  },

  // MENU ITEM BLOCK (Internal use only - not shown in block list)
  'menu-item': {
    id: 'menu-item',
    name: 'Menu Item',
    description: 'Simple navigation link',
    icon: Link,
    category: 'navigation',
    internal: true, // Hide from block selection
    settings: {
      text: {
        type: 'text',
        label: 'Link Text',
        default: 'Menu Item',
        validation: { required: true }
      },
      href: {
        type: 'url',
        label: 'Link URL',
        default: '/',
        placeholder: '/products, /about, etc.',
        validation: { required: true }
      }
    }
  },
  
  // MEGA MENU COLUMN BLOCK (Internal use only - not shown in block list)
  'mega-menu-column': {
    id: 'mega-menu-column',
    name: 'Menu Column',
    description: 'Column within mega menu',
    icon: Columns,
    category: 'navigation',
    internal: true, // Hide from block selection
    isContainer: true,
    allowedBlocks: ['link'],
    settings: {
      title: {
        type: 'text',
        label: 'Column Title',
        default: 'Category',
        placeholder: 'Enter column title'
      },
      showTitle: {
        type: 'checkbox',
        label: 'Show Title',
        default: true
      }
    }
  },
  
  // MEGA MENU BLOCK (Auto-generated by navigation - not shown in block list)
  'mega-menu': {
    id: 'mega-menu',
    name: 'Mega Menu',
    description: 'Dropdown menu with multiple columns',
    icon: Grid,
    category: 'navigation',
    internal: true, // Hide from block selection
    isContainer: true,
    allowedBlocks: ['mega-menu-column'],
    settings: {
      triggerText: {
        type: 'text',
        label: 'Menu Text',
        default: 'Products'
      },
      showIcon: {
        type: 'checkbox',
        label: 'Show Dropdown Icon',
        default: true
      },
      fullWidth: {
        type: 'checkbox',
        label: 'Full Width Dropdown',
        default: true
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'sm',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        default: 'light',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'normal', label: 'Normal' },
          { value: 'medium', label: 'Medium' },
          { value: 'semibold', label: 'Semibold' }
        ]
      },
      textTransform: {
        type: 'select',
        label: 'Text Transform',
        default: 'uppercase',
        options: [
          { value: 'none', label: 'None' },
          { value: 'uppercase', label: 'Uppercase' },
          { value: 'lowercase', label: 'Lowercase' },
          { value: 'capitalize', label: 'Capitalize' }
        ]
      },
      letterSpacing: {
        type: 'select',
        label: 'Letter Spacing',
        default: 'wide',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'wide', label: 'Wide' },
          { value: 'wider', label: 'Wider' },
          { value: 'widest', label: 'Widest' }
        ]
      }
    }
  },

  // WISHLIST BLOCK
  wishlist: {
    id: 'wishlist',
    name: 'Wishlist Icon',
    description: 'Customer wishlist access',
    icon: Heart,
    category: 'content',
    maxPerSection: 1,
    settings: {
      showCount: {
        type: 'checkbox',
        label: 'Show Item Count',
        default: true
      },
      iconStyle: {
        type: 'select',
        label: 'Icon Style',
        default: 'outline',
        options: [
          { value: 'outline', label: 'Outline' },
          { value: 'filled', label: 'Filled' }
        ]
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'md',
        options: [
          { value: 'sm', label: 'Small (16px)' },
          { value: 'md', label: 'Medium (20px)' },
          { value: 'lg', label: 'Large (24px)' }
        ]
      },
      color: {
        type: 'color',
        label: 'Icon Color',
        default: '#000000'
      },
      countColor: {
        type: 'color',
        label: 'Count Badge Color',
        default: '#ef4444'
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'right',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      }
    }
  },

  // LANGUAGE SELECTOR BLOCK
  'language-selector': {
    id: 'language-selector',
    name: 'Language Selector',
    description: 'Language selector dropdown',
    icon: Globe,
    category: 'content',
    maxPerSection: 1,
    settings: {}
  },

  // CURRENCY SELECTOR BLOCK
  'currency-selector': {
    id: 'currency-selector',
    name: 'Currency Selector',
    description: 'Currency selector dropdown',
    icon: DollarSign,
    category: 'content',
    maxPerSection: 1,
    settings: {}
  },

  // CONTENT BLOCKS
  heading: {
    id: 'heading',
    name: 'Heading',
    description: 'Add a title or heading',
    icon: Type,
    category: 'content',
    settings: {
      content: {
        type: 'text',
        label: 'Heading Text',
        placeholder: 'Enter your heading',
        default: 'Your heading here',
        validation: { required: true }
      },
      level: {
        type: 'select',
        label: 'Heading Level',
        default: 'h2',
        options: [
          { value: 'h1', label: 'H1 (Largest)' },
          { value: 'h2', label: 'H2 (Large)' },
          { value: 'h3', label: 'H3 (Medium)' },
          { value: 'h4', label: 'H4 (Small)' },
          { value: 'h5', label: 'H5 (Smaller)' },
          { value: 'h6', label: 'H6 (Smallest)' }
        ]
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'default',
        options: [
          { value: 'xs', label: 'Extra Small' },
          { value: 'sm', label: 'Small' },
          { value: 'default', label: 'Default' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' },
          { value: '2xl', label: '2X Large' },
          { value: '3xl', label: '3X Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        default: 'semibold',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'medium', label: 'Medium' },
          { value: 'semibold', label: 'Semi Bold' },
          { value: 'bold', label: 'Bold' }
        ]
      },
      textAlign: {
        type: 'select',
        label: 'Text Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      color: {
        type: 'color',
        label: 'Text Color',
        default: '#000000'
      },
      marginTop: {
        type: 'select',
        label: 'Margin Top',
        default: 'medium',
        options: [
          { value: 'none', label: 'None' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      marginBottom: {
        type: 'select',
        label: 'Margin Bottom',
        default: 'medium',
        options: [
          { value: 'none', label: 'None' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      }
    }
  },

  'hero-text': {
    id: 'hero-text',
    name: 'Hero Text',
    description: 'Hero title and subtitle',
    icon: Type,
    category: 'content',
    maxPerSection: 1,
    settings: {
      title: {
        type: 'text',
        label: 'Title',
        placeholder: 'Enter hero title',
        default: 'Welcome to Our Store',
        validation: { required: true }
      },
      subtitle: {
        type: 'textarea',
        label: 'Subtitle',
        placeholder: 'Enter hero subtitle',
        default: 'Discover amazing products'
      },
      alignment: {
        type: 'select',
        label: 'Text Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      titleSize: {
        type: 'select',
        label: 'Title Size',
        default: 'text-4xl md:text-5xl lg:text-6xl',
        options: [
          { value: 'text-3xl md:text-4xl lg:text-5xl', label: 'Medium' },
          { value: 'text-4xl md:text-5xl lg:text-6xl', label: 'Large' },
          { value: 'text-5xl md:text-6xl lg:text-7xl', label: 'Extra Large' }
        ]
      },
      subtitleSize: {
        type: 'select',
        label: 'Subtitle Size',
        default: 'text-lg md:text-xl',
        options: [
          { value: 'text-base md:text-lg', label: 'Small' },
          { value: 'text-lg md:text-xl', label: 'Medium' },
          { value: 'text-xl md:text-2xl', label: 'Large' }
        ]
      },
      titleColor: {
        type: 'color',
        label: 'Title Color',
        default: '#111827'
      },
      subtitleColor: {
        type: 'color',
        label: 'Subtitle Color',
        default: '#4B5563'
      },
      spacing: {
        type: 'select',
        label: 'Spacing Between Title and Subtitle',
        default: 'mb-4',
        options: [
          { value: 'mb-2', label: 'Small' },
          { value: 'mb-4', label: 'Medium' },
          { value: 'mb-6', label: 'Large' }
        ]
      }
    }
  },

  text: {
    id: 'text',
    name: 'Text',
    description: 'Add a paragraph of text',
    icon: FileText,
    category: 'content',
    settings: {
      content: {
        type: 'textarea',
        label: 'Text Content',
        placeholder: 'Enter your text content',
        default: 'Your text content here...',
        validation: { required: true }
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'base',
        options: [
          { value: 'xs', label: 'Extra Small' },
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Default' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        default: 'normal',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'medium', label: 'Medium' },
          { value: 'semibold', label: 'Semi Bold' },
          { value: 'bold', label: 'Bold' }
        ]
      },
      textAlign: {
        type: 'select',
        label: 'Text Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
          { value: 'justify', label: 'Justified' }
        ]
      },
      color: {
        type: 'color',
        label: 'Text Color',
        default: '#374151'
      },
      lineHeight: {
        type: 'select',
        label: 'Line Height',
        default: 'relaxed',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'normal', label: 'Normal' },
          { value: 'relaxed', label: 'Relaxed' },
          { value: 'loose', label: 'Loose' }
        ]
      }
    }
  },

  // MEDIA BLOCKS
  image: {
    id: 'image',
    name: 'Image',
    description: 'Add an image',
    icon: Image,
    category: 'media',
    settings: {
      src: {
        type: 'image',
        label: 'Image',
        placeholder: 'Upload or select an image',
        helperText: 'Upload or select an image'
      },
      alt: {
        type: 'text',
        label: 'Alt Text',
        default: 'Image',
        placeholder: 'Describe the image',
        helperText: 'Description for accessibility and SEO'
      },
      aspect_ratio: {
        type: 'select',
        label: 'Aspect Ratio',
        default: 'auto',
        options: [
          { value: 'auto', label: '🔧 Auto (Original)' },
          { value: 'square', label: '⬜ Square (1:1)' },
          { value: 'video', label: '📺 Video (16:9)' },
          { value: 'portrait', label: '📱 Portrait (3:4)' },
          { value: 'landscape', label: '🖼️ Landscape (4:3)' }
        ],
        helperText: 'Choose the image proportions'
      },
      object_fit: {
        type: 'select',
        label: 'Image Fit',
        default: 'cover',
        options: [
          { value: 'cover', label: 'Cover (Fill area)' },
          { value: 'contain', label: 'Contain (Fit inside)' },
          { value: 'fill', label: 'Fill (Stretch)' },
          { value: 'none', label: 'None (Original size)' }
        ],
        helperText: 'How the image should fit the container'
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: '⬅️ Left' },
          { value: 'center', label: '🎯 Center' },
          { value: 'right', label: '➡️ Right' }
        ],
        helperText: 'Image alignment within the section'
      },
      border_radius: {
        type: 'select',
        label: 'Corner Radius',
        default: 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'full', label: 'Full (Circle)' }
        ],
        helperText: 'Rounded corners for the image'
      },
      shadow: {
        type: 'select',
        label: 'Shadow',
        default: 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' }
        ],
        helperText: 'Drop shadow effect'
      },
      caption: {
        type: 'text',
        label: 'Caption',
        placeholder: 'Optional caption',
        helperText: 'Optional caption below the image'
      },
      overlay: {
        type: 'checkbox',
        label: 'Show Overlay',
        default: false,
        helperText: 'Add a color overlay on the image'
      },
      overlay_color: {
        type: 'color',
        label: 'Overlay Color',
        default: '#000000',
        helperText: 'Color of the overlay'
      },
      overlay_opacity: {
        type: 'range',
        label: 'Overlay Opacity',
        default: 20,
        validation: { min: 0, max: 100 },
        helperText: 'Opacity of the overlay (0-100%)'
      }
    }
  },

  // ACTION BLOCKS
  button: {
    id: 'button',
    name: 'Button',
    description: 'Add a clickable button',
    icon: Square,
    category: 'actions',
    maxPerSection: 3,
    settings: {
      text: {
        type: 'text',
        label: 'Button Text',
        placeholder: 'Click me',
        default: 'Button',
        validation: { required: true }
      },
      url: {
        type: 'url',
        label: 'Button URL',
        placeholder: 'https://example.com',
        validation: { required: true }
      },
      style: {
        type: 'select',
        label: 'Button Style',
        default: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' },
          { value: 'link', label: 'Link' }
        ]
      },
      size: {
        type: 'select',
        label: 'Button Size',
        default: 'md',
        options: [
          { value: 'xs', label: 'Extra Small' },
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' }
        ]
      },
      fullWidth: {
        type: 'checkbox',
        label: 'Full Width',
        default: false
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      openInNewTab: {
        type: 'checkbox',
        label: 'Open in new tab',
        default: false
      },
      icon: {
        type: 'select',
        label: 'Icon',
        default: 'none',
        options: [
          { value: 'none', label: 'No Icon' },
          { value: 'arrow-right', label: 'Arrow Right →' },
          { value: 'external-link', label: 'External Link ↗' },
          { value: 'download', label: 'Download ⬇' },
          { value: 'play', label: 'Play ▶' }
        ]
      }
    }
  },

  // LAYOUT BLOCKS
  spacer: {
    id: 'spacer',
    name: 'Spacer',
    description: 'Add vertical space',
    icon: Minus,
    category: 'layout',
    settings: {
      height: {
        type: 'select',
        label: 'Height',
        default: 'medium',
        options: [
          { value: 'xs', label: 'Extra Small (10px)' },
          { value: 'sm', label: 'Small (20px)' },
          { value: 'medium', label: 'Medium (40px)' },
          { value: 'lg', label: 'Large (60px)' },
          { value: 'xl', label: 'Extra Large (80px)' },
          { value: '2xl', label: '2X Large (120px)' },
          { value: 'custom', label: 'Custom' }
        ]
      },
      customHeight: {
        type: 'number',
        label: 'Custom Height (px)',
        placeholder: '40',
        default: 40,
        conditional: 'height',
        validation: { min: 1, max: 500 }
      }
    }
  },

  divider: {
    id: 'divider',
    name: 'Divider',
    description: 'Add a horizontal line',
    icon: Minus,
    category: 'layout',
    settings: {
      style: {
        type: 'select',
        label: 'Style',
        default: 'solid',
        options: [
          { value: 'solid', label: 'Solid Line' },
          { value: 'dashed', label: 'Dashed Line' },
          { value: 'dotted', label: 'Dotted Line' }
        ]
      },
      thickness: {
        type: 'select',
        label: 'Thickness',
        default: '1',
        options: [
          { value: '1', label: '1px' },
          { value: '2', label: '2px' },
          { value: '3', label: '3px' },
          { value: '4', label: '4px' }
        ]
      },
      color: {
        type: 'color',
        label: 'Color',
        default: '#e5e7eb'
      },
      width: {
        type: 'select',
        label: 'Width',
        default: '100%',
        options: [
          { value: '25%', label: '25%' },
          { value: '50%', label: '50%' },
          { value: '75%', label: '75%' },
          { value: '100%', label: '100%' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      }
    }
  },

  // DUPLICATE HEADER BLOCKS - COMMENTED OUT TO AVOID CONFLICTS
  /*
  logo: {
    id: 'logo',
    name: 'Logo',
    description: 'Store logo with link',
    icon: Image,
    category: 'content',
    maxPerSection: 1,
    settings: {
      src: {
        type: 'image',
        label: 'Logo Image',
        placeholder: 'Select logo image',
        validation: { required: true }
      },
      alt: {
        type: 'text',
        label: 'Alt Text',
        placeholder: 'Store name',
        default: 'Store Logo'
      },
      width: {
        type: 'number',
        label: 'Width (px)',
        default: 120,
        validation: { min: 50, max: 300 }
      },
      height: {
        type: 'number',
        label: 'Height (px)',
        default: 40,
        validation: { min: 20, max: 150 }
      },
      link: {
        type: 'url',
        label: 'Link URL',
        default: '/',
        placeholder: '/'
      }
    }
  },
  */

  /* DUPLICATE - COMMENTED OUT
  navigation: {
    id: 'navigation',
    name: 'Navigation Menu',
    description: 'Main navigation menu',
    icon: List,
    category: 'content',
    maxPerSection: 1,
    settings: {
      menuId: {
        type: 'select',
        label: 'Menu',
        placeholder: 'Select menu',
        options: [
          { value: 'main-menu', label: 'Main Menu' },
          { value: 'footer-menu', label: 'Footer Menu' }
        ]
      },
      style: {
        type: 'select',
        label: 'Style',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      showDropdowns: {
        type: 'checkbox',
        label: 'Show Dropdowns',
        default: true
      }
    }
  },
  */

  /* DUPLICATE - COMMENTED OUT
  search: {
    id: 'search',
    name: 'Search Bar',
    description: 'Product search functionality',
    icon: MessageSquare,
    category: 'content',
    maxPerSection: 1,
    settings: {
      placeholder: {
        type: 'text',
        label: 'Placeholder Text',
        default: 'Search products...',
        placeholder: 'Search products...'
      },
      showIcon: {
        type: 'checkbox',
        label: 'Show Search Icon',
        default: true
      },
      width: {
        type: 'select',
        label: 'Width',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'full', label: 'Full Width' }
        ]
      }
    }
  },
  */

  /* DUPLICATE - COMMENTED OUT
  cart: {
    id: 'cart',
    name: 'Cart Icon',
    description: 'Shopping cart with item count',
    icon: Square,
    category: 'content',
    maxPerSection: 1,
    settings: {
      showCount: {
        type: 'checkbox',
        label: 'Show Item Count',
        default: true
      },
      showTotal: {
        type: 'checkbox',
        label: 'Show Total Price',
        default: false
      },
      iconStyle: {
        type: 'select',
        label: 'Icon Style',
        default: 'outline',
        options: [
          { value: 'outline', label: 'Outline' },
          { value: 'filled', label: 'Filled' }
        ]
      }
    }
  },
  */


  // PRODUCT BLOCKS
  'product-card': {
    id: 'product-card',
    name: 'Product Card',
    description: 'Display individual product',
    icon: Square,
    category: 'content',
    settings: {
      productId: {
        type: 'select',
        label: 'Product',
        placeholder: 'Select a product',
        options: [] // Will be populated dynamically
      },
      showPrice: {
        type: 'checkbox',
        label: 'Show Price',
        default: true
      },
      showComparePrice: {
        type: 'checkbox',
        label: 'Show Compare At Price',
        default: true
      },
      showRating: {
        type: 'checkbox',
        label: 'Show Rating',
        default: true
      },
      showBadge: {
        type: 'checkbox',
        label: 'Show Sale Badge',
        default: true
      },
      showQuickView: {
        type: 'checkbox',
        label: 'Show Quick View',
        default: true
      },
      showAddToCart: {
        type: 'checkbox',
        label: 'Show Add to Cart',
        default: true
      },
      imageAspectRatio: {
        type: 'select',
        label: 'Image Aspect Ratio',
        default: 'square',
        options: [
          { value: 'square', label: 'Square (1:1)' },
          { value: 'portrait', label: 'Portrait (3:4)' },
          { value: 'landscape', label: 'Landscape (4:3)' },
          { value: 'auto', label: 'Auto' }
        ]
      },
      hoverEffect: {
        type: 'select',
        label: 'Hover Effect',
        default: 'zoom',
        options: [
          { value: 'none', label: 'None' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'fade', label: 'Fade' },
          { value: 'slide', label: 'Slide' }
        ]
      }
    }
  },

  'product-grid': {
    id: 'product-grid',
    name: 'Product Grid',
    description: 'Grid of multiple products',
    icon: Grid,
    category: 'content',
    settings: {
      source: {
        type: 'select',
        label: 'Product Source',
        default: 'featured',
        options: [
          { value: 'featured', label: 'Featured Products' },
          { value: 'newest', label: 'Newest Products' },
          { value: 'bestselling', label: 'Best Selling' },
          { value: 'collection', label: 'From Collection' },
          { value: 'manual', label: 'Manual Selection' }
        ]
      },
      collectionId: {
        type: 'select',
        label: 'Collection',
        placeholder: 'Select collection',
        conditional: 'source',
        options: [] // Will be populated dynamically
      },
      productCount: {
        type: 'number',
        label: 'Number of Products',
        default: 8,
        validation: { min: 1, max: 50 }
      },
      columns: {
        type: 'select',
        label: 'Columns',
        default: '4',
        options: [
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
          { value: '5', label: '5 Columns' },
          { value: '6', label: '6 Columns' }
        ]
      },
      gap: {
        type: 'select',
        label: 'Grid Gap',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      showPagination: {
        type: 'checkbox',
        label: 'Show Pagination',
        default: false
      },
      enableFiltering: {
        type: 'checkbox',
        label: 'Enable Filtering',
        default: false
      },
      enableSorting: {
        type: 'checkbox',
        label: 'Enable Sorting',
        default: false
      }
    }
  },

  // COLLECTION BLOCKS
  'collection-banner': {
    id: 'collection-banner',
    name: 'Collection Banner',
    description: 'Collection header with image and text',
    icon: Image,
    category: 'content',
    settings: {
      collectionId: {
        type: 'select',
        label: 'Collection',
        placeholder: 'Select collection',
        options: [] // Will be populated dynamically
      },
      showTitle: {
        type: 'checkbox',
        label: 'Show Collection Title',
        default: true
      },
      showDescription: {
        type: 'checkbox',
        label: 'Show Description',
        default: true
      },
      showProductCount: {
        type: 'checkbox',
        label: 'Show Product Count',
        default: true
      },
      backgroundImage: {
        type: 'image',
        label: 'Background Image',
        placeholder: 'Select background image'
      },
      overlay: {
        type: 'checkbox',
        label: 'Show Overlay',
        default: true
      },
      overlayOpacity: {
        type: 'range',
        label: 'Overlay Opacity',
        default: 50,
        validation: { min: 0, max: 100 },
        conditional: 'overlay'
      },
      textAlignment: {
        type: 'select',
        label: 'Text Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      height: {
        type: 'select',
        label: 'Banner Height',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small (200px)' },
          { value: 'medium', label: 'Medium (300px)' },
          { value: 'large', label: 'Large (400px)' },
          { value: 'xl', label: 'Extra Large (500px)' }
        ]
      }
    }
  },

  // SOCIAL BLOCKS
  'social-media': {
    id: 'social-media',
    name: 'Social Media Links',
    description: 'Social media icons and links',
    icon: Users,
    category: 'social',
    settings: {
      platforms: {
        type: 'checkbox',
        label: 'Platforms',
        default: ['facebook', 'instagram', 'twitter'],
        options: [
          { value: 'facebook', label: 'Facebook' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'twitter', label: 'Twitter' },
          { value: 'youtube', label: 'YouTube' },
          { value: 'tiktok', label: 'TikTok' },
          { value: 'pinterest', label: 'Pinterest' },
          { value: 'linkedin', label: 'LinkedIn' }
        ]
      },
      facebookUrl: {
        type: 'url',
        label: 'Facebook URL',
        placeholder: 'https://facebook.com/yourpage',
        conditional: 'platforms'
      },
      instagramUrl: {
        type: 'url',
        label: 'Instagram URL',
        placeholder: 'https://instagram.com/yourpage',
        conditional: 'platforms'
      },
      twitterUrl: {
        type: 'url',
        label: 'Twitter URL',
        placeholder: 'https://twitter.com/yourpage',
        conditional: 'platforms'
      },
      youtubeUrl: {
        type: 'url',
        label: 'YouTube URL',
        placeholder: 'https://youtube.com/yourchannel',
        conditional: 'platforms'
      },
      iconStyle: {
        type: 'select',
        label: 'Icon Style',
        default: 'outline',
        options: [
          { value: 'outline', label: 'Outline' },
          { value: 'filled', label: 'Filled' },
          { value: 'colored', label: 'Brand Colors' }
        ]
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'md',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      spacing: {
        type: 'select',
        label: 'Icon Spacing',
        default: 'medium',
        options: [
          { value: 'tight', label: 'Tight' },
          { value: 'medium', label: 'Medium' },
          { value: 'relaxed', label: 'Relaxed' }
        ]
      },
      openInNewTab: {
        type: 'checkbox',
        label: 'Open in New Tab',
        default: true
      }
    }
  },

  // FOOTER NAVIGATION BLOCK
  'footer-navigation': {
    id: 'footer-navigation',
    name: 'Footer Navigation',
    description: 'Navigation menu connected to dashboard',
    icon: List,
    category: 'content',
    maxPerSection: 5,
    settings: {
      title: {
        type: 'text',
        label: 'Section title',
        default: 'Quick Links',
        placeholder: 'Enter section title'
      },
      show_title: {
        type: 'checkbox',
        label: 'Show title',
        default: true
      },
      menu_handle: {
        type: 'select',
        label: 'Menu source',
        default: 'footer-menu',
        options: [
          { value: 'footer-menu', label: 'Footer Menu' },
          { value: 'main-menu', label: 'Main Menu' },
          { value: 'custom', label: 'Custom Menu Items' }
        ],
        helperText: 'Choose menu from Content > Navigation or use custom items'
      }
    }
  },
  // NAVIGATION MENU BLOCK (for footer)
  'navigation-menu': {
    id: 'navigation-menu',
    name: 'Navigation Menu',
    description: 'Navigation menu connected to your store menus',
    icon: List,
    category: 'content',
    maxPerSection: 10,
    settings: {
      title: {
        type: 'text',
        label: 'Menu Title',
        default: 'Quick Links',
        placeholder: 'Enter menu title (optional)',
        helperText: 'Leave empty to use menu name from dashboard'
      },
      menuHandle: {
        type: 'select',
        label: 'Select Menu',
        default: '',
        placeholder: 'Choose a menu',
        helperText: 'Create menus in Content > Navigation',
        options: [] // Will be populated dynamically
      },
      titleSize: {
        type: 'select',
        label: 'Title Size',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      showTitle: {
        type: 'checkbox',
        label: 'Show Title',
        default: true
      },
      linkStyle: {
        type: 'select',
        label: 'Link Style',
        default: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'underline', label: 'Underlined' },
          { value: 'bold', label: 'Bold' }
        ]
      }
    }
  },

  // NEWSLETTER BLOCK
  newsletter: {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Email newsletter subscription form',
    icon: Mail,
    category: 'content',
    maxPerSection: 1,
    settings: {
      title: {
        type: 'text',
        label: 'Title',
        default: 'Stay Updated',
        placeholder: 'Newsletter title'
      },
      description: {
        type: 'textarea',
        label: 'Description',
        default: 'Subscribe to our newsletter for the latest updates and exclusive offers.',
        placeholder: 'Newsletter description'
      },
      placeholder: {
        type: 'text',
        label: 'Email Placeholder',
        default: 'Enter your email address',
        placeholder: 'Email placeholder text'
      },
      buttonText: {
        type: 'text',
        label: 'Button Text',
        default: 'Subscribe',
        placeholder: 'Subscribe button text'
      },
      layout: {
        type: 'select',
        label: 'Form Layout',
        default: 'inline',
        options: [
          { value: 'inline', label: 'Inline (Side by Side)' },
          { value: 'stacked', label: 'Stacked (Vertical)' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Content Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      showPrivacyNote: {
        type: 'checkbox',
        label: 'Show Privacy Note',
        default: true
      },
      privacyText: {
        type: 'text',
        label: 'Privacy Note',
        default: 'We respect your privacy and will never share your email.',
        conditional: 'showPrivacyNote'
      }
    }
  },

  // TESTIMONIAL BLOCK
  testimonial: {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer testimonial or review',
    icon: MessageSquare,
    category: 'content',
    settings: {
      quote: {
        type: 'textarea',
        label: 'Testimonial Quote',
        placeholder: 'Enter the testimonial text',
        validation: { required: true }
      },
      authorName: {
        type: 'text',
        label: 'Author Name',
        placeholder: 'Customer name',
        validation: { required: true }
      },
      authorTitle: {
        type: 'text',
        label: 'Author Title/Company',
        placeholder: 'Job title or company'
      },
      authorImage: {
        type: 'image',
        label: 'Author Photo',
        placeholder: 'Select author photo'
      },
      rating: {
        type: 'number',
        label: 'Star Rating',
        default: 5,
        validation: { min: 1, max: 5 }
      },
      showRating: {
        type: 'checkbox',
        label: 'Show Star Rating',
        default: true
      },
      layout: {
        type: 'select',
        label: 'Layout Style',
        default: 'centered',
        options: [
          { value: 'centered', label: 'Centered' },
          { value: 'left-aligned', label: 'Left Aligned' },
          { value: 'card', label: 'Card Style' }
        ]
      },
      backgroundColor: {
        type: 'color',
        label: 'Background Color',
        default: '#f9fafb'
      },
      textColor: {
        type: 'color',
        label: 'Text Color',
        default: '#374151'
      }
    }
  },

  // CONTACT INFO BLOCK
  'contact-info': {
    id: 'contact-info',
    name: 'Contact Information',
    description: 'Display contact details',
    icon: Phone,
    category: 'content',
    settings: {
      showEmail: {
        type: 'checkbox',
        label: 'Show Email',
        default: true
      },
      email: {
        type: 'text',
        label: 'Email Address',
        placeholder: 'contact@store.com',
        conditional: 'showEmail'
      },
      showPhone: {
        type: 'checkbox',
        label: 'Show Phone',
        default: true
      },
      phone: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        conditional: 'showPhone'
      },
      showAddress: {
        type: 'checkbox',
        label: 'Show Address',
        default: true
      },
      address: {
        type: 'textarea',
        label: 'Address',
        placeholder: '123 Main St\nCity, State 12345',
        conditional: 'showAddress'
      },
      showHours: {
        type: 'checkbox',
        label: 'Show Business Hours',
        default: false
      },
      hours: {
        type: 'textarea',
        label: 'Business Hours',
        placeholder: 'Mon-Fri: 9AM-6PM\nSat-Sun: 10AM-4PM',
        conditional: 'showHours'
      },
      layout: {
        type: 'select',
        label: 'Layout',
        default: 'vertical',
        options: [
          { value: 'vertical', label: 'Vertical List' },
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'grid', label: 'Grid Layout' }
        ]
      },
      iconStyle: {
        type: 'select',
        label: 'Icon Style',
        default: 'outline',
        options: [
          { value: 'outline', label: 'Outline' },
          { value: 'filled', label: 'Filled' },
          { value: 'none', label: 'No Icons' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      }
    }
  },

  // VIDEO BLOCK
  video: {
    id: 'video',
    name: 'Video',
    description: 'Embed video content',
    icon: Video,
    category: 'media',
    settings: {
      source: {
        type: 'select',
        label: 'Video Source',
        default: 'youtube',
        options: [
          { value: 'youtube', label: 'YouTube' },
          { value: 'vimeo', label: 'Vimeo' },
          { value: 'upload', label: 'Upload Video' }
        ]
      },
      youtubeId: {
        type: 'text',
        label: 'YouTube Video ID',
        placeholder: 'dQw4w9WgXcQ',
        conditional: 'source'
      },
      vimeoId: {
        type: 'text',
        label: 'Vimeo Video ID',
        placeholder: '123456789',
        conditional: 'source'
      },
      videoFile: {
        type: 'media',
        label: 'Video File',
        placeholder: 'Upload video file',
        conditional: 'source'
      },
      aspectRatio: {
        type: 'select',
        label: 'Aspect Ratio',
        default: '16:9',
        options: [
          { value: '16:9', label: '16:9 (Widescreen)' },
          { value: '4:3', label: '4:3 (Standard)' },
          { value: '1:1', label: '1:1 (Square)' },
          { value: '9:16', label: '9:16 (Vertical)' }
        ]
      },
      autoplay: {
        type: 'checkbox',
        label: 'Autoplay Video',
        default: false
      },
      muted: {
        type: 'checkbox',
        label: 'Mute by Default',
        default: true
      },
      controls: {
        type: 'checkbox',
        label: 'Show Controls',
        default: true
      },
      loop: {
        type: 'checkbox',
        label: 'Loop Video',
        default: false
      },
      coverImage: {
        type: 'image',
        label: 'Cover Image',
        placeholder: 'Custom thumbnail image'
      }
    }
  },

  // ADVANCED BLOCKS
  html: {
    id: 'html',
    name: 'Custom HTML',
    description: 'Add custom HTML code',
    icon: Code,
    category: 'advanced',
    maxPerSection: 2,
    settings: {
      content: {
        type: 'code',
        label: 'HTML Content',
        placeholder: '<div>Your custom HTML here</div>',
        validation: { required: true },
        helperText: 'Be careful with custom HTML. Only use trusted code.'
      },
      allowScripts: {
        type: 'checkbox',
        label: 'Allow JavaScript',
        default: false,
        helperText: 'Enable only if you trust the source'
      }
    }
  },

  // ===============================
  // ARTISAN CRAFT THEME BLOCKS
  // ===============================

  // Artisan Craft Header Blocks
  'artisan-logo': {
    id: 'artisan-logo',
    name: 'Artisan Logo',
    description: 'Logo block for Artisan Craft theme',
    icon: Image,
    category: 'content',
    maxPerSection: 1,
    settings: {
      logo_image: {
        type: 'image',
        label: 'Logo Image',
        placeholder: 'Select logo image'
      },
      logo_text: {
        type: 'text',
        label: 'Logo Text',
        placeholder: 'Store Name',
        default: 'Artisan Craft'
      },
      logo_width: {
        type: 'number',
        label: 'Logo Width (px)',
        default: 150,
        validation: { min: 50, max: 300 }
      }
    }
  },

  'artisan-navigation': {
    id: 'artisan-navigation',
    name: 'Artisan Navigation',
    description: 'Navigation menu for Artisan Craft theme',
    icon: List,
    category: 'content',
    maxPerSection: 1,
    settings: {
      menu_items: {
        type: 'textarea',
        label: 'Menu Items (JSON)',
        default: '[{"title":"Yarns","url":"/yarns"},{"title":"Patterns","url":"/patterns"},{"title":"Tools","url":"/tools"},{"title":"About","url":"/about"}]'
      },
      show_dropdown: {
        type: 'checkbox',
        label: 'Show Dropdown',
        default: true
      }
    }
  },

  'artisan-search': {
    id: 'artisan-search',
    name: 'Artisan Search',
    description: 'Search bar for Artisan Craft theme',
    icon: Search,
    category: 'content',
    maxPerSection: 1,
    settings: {
      placeholder: {
        type: 'text',
        label: 'Placeholder Text',
        default: 'Search yarns, patterns...'
      },
      show_icon: {
        type: 'checkbox',
        label: 'Show Search Icon',
        default: true
      }
    }
  },

  'artisan-cart': {
    id: 'artisan-cart',
    name: 'Artisan Cart',
    description: 'Shopping cart for Artisan Craft theme',
    icon: Square,
    category: 'content',
    maxPerSection: 1,
    settings: {
      show_count: {
        type: 'checkbox',
        label: 'Show Item Count',
        default: true
      },
      cart_type: {
        type: 'select',
        label: 'Cart Type',
        default: 'drawer',
        options: [
          { value: 'page', label: 'Cart Page' },
          { value: 'drawer', label: 'Cart Drawer' }
        ]
      }
    }
  },

  'artisan-account': {
    id: 'artisan-account',
    name: 'Artisan Account',
    description: 'Account menu for Artisan Craft theme',
    icon: Users,
    category: 'content',
    maxPerSection: 1,
    settings: {
      show_login: {
        type: 'checkbox',
        label: 'Show Login Link',
        default: true
      },
      login_text: {
        type: 'text',
        label: 'Login Text',
        default: 'Sign In'
      }
    }
  },

  // Enhanced E-commerce Blocks
  'countdown': {
    id: 'countdown',
    name: 'Countdown Timer',
    description: 'Create urgency with countdown timers for sales and offers',
    icon: Clock,
    category: 'content',
    maxPerSection: 3,
    settings: {
      targetDate: {
        type: 'text',
        label: 'Target Date',
        placeholder: '2024-12-31T23:59:59',
        default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
        helperText: 'Format: YYYY-MM-DDTHH:mm:ss'
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Limited Time Offer',
        placeholder: 'Enter countdown title'
      },
      description: {
        type: 'text',
        label: 'Description',
        default: "Don't miss out on this exclusive deal",
        placeholder: 'Enter description'
      },
      showDays: {
        type: 'checkbox',
        label: 'Show Days',
        default: true
      },
      showHours: {
        type: 'checkbox',
        label: 'Show Hours',
        default: true
      },
      showMinutes: {
        type: 'checkbox',
        label: 'Show Minutes',
        default: true
      },
      showSeconds: {
        type: 'checkbox',
        label: 'Show Seconds',
        default: true
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
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      style: {
        type: 'select',
        label: 'Style',
        default: 'minimal',
        options: [
          { value: 'minimal', label: 'Minimal' },
          { value: 'boxed', label: 'Boxed' },
          { value: 'gradient', label: 'Gradient' }
        ]
      }
    }
  },

  'trust-badges': {
    id: 'trust-badges',
    name: 'Trust Badges',
    description: 'Display security certificates, guarantees, and trust indicators',
    icon: Shield,
    category: 'content',
    maxPerSection: 2,
    settings: {
      layout: {
        type: 'select',
        label: 'Layout',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'grid', label: 'Grid' },
          { value: 'vertical', label: 'Vertical' }
        ]
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
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      showIcons: {
        type: 'checkbox',
        label: 'Show Icons',
        default: true
      },
      showText: {
        type: 'checkbox',
        label: 'Show Text',
        default: true
      },
      style: {
        type: 'select',
        label: 'Style',
        default: 'minimal',
        options: [
          { value: 'minimal', label: 'Minimal' },
          { value: 'outlined', label: 'Outlined' },
          { value: 'filled', label: 'Filled' }
        ]
      }
    }
  },

  'gallery': {
    id: 'gallery',
    name: 'Image Gallery',
    description: 'Showcase multiple images with lightbox and various layouts',
    icon: Image,
    category: 'media',
    maxPerSection: 2,
    settings: {
      layout: {
        type: 'select',
        label: 'Layout',
        default: 'grid',
        options: [
          { value: 'grid', label: 'Grid' },
          { value: 'masonry', label: 'Masonry' },
          { value: 'carousel', label: 'Carousel' }
        ]
      },
      columns: {
        type: 'select',
        label: 'Columns',
        default: 3,
        options: [
          { value: 2, label: '2 Columns' },
          { value: 3, label: '3 Columns' },
          { value: 4, label: '4 Columns' },
          { value: 5, label: '5 Columns' }
        ]
      },
      aspectRatio: {
        type: 'select',
        label: 'Aspect Ratio',
        default: 'square',
        options: [
          { value: 'square', label: 'Square' },
          { value: 'landscape', label: 'Landscape' },
          { value: 'portrait', label: 'Portrait' },
          { value: 'auto', label: 'Auto' }
        ]
      },
      gap: {
        type: 'select',
        label: 'Gap',
        default: 'medium',
        options: [
          { value: 'none', label: 'None' },
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      showCaptions: {
        type: 'checkbox',
        label: 'Show Captions',
        default: true
      },
      enableLightbox: {
        type: 'checkbox',
        label: 'Enable Lightbox',
        default: true
      },
      hoverEffect: {
        type: 'select',
        label: 'Hover Effect',
        default: 'zoom',
        options: [
          { value: 'none', label: 'None' },
          { value: 'zoom', label: 'Zoom' },
          { value: 'fade', label: 'Fade' },
          { value: 'slide', label: 'Slide' }
        ]
      }
    }
  },

  // MISSING BLOCKS - Added for section compatibility
  
  accordion: {
    id: 'accordion',
    name: 'Accordion',
    description: 'Expandable/collapsible content sections',
    icon: ChevronDown,
    category: 'content',
    settings: {
      items: {
        type: 'textarea',
        label: 'Accordion Items (JSON)',
        placeholder: '[{"title": "Question 1", "content": "Answer 1"}]',
        default: '[{"title": "Question 1", "content": "Answer 1"}]',
        helperText: 'Add accordion items as JSON array'
      },
      expandFirst: {
        type: 'checkbox',
        label: 'Expand First Item',
        default: true
      },
      allowMultiple: {
        type: 'checkbox',
        label: 'Allow Multiple Open',
        default: false
      },
      style: {
        type: 'select',
        label: 'Style',
        default: 'bordered',
        options: [
          { value: 'bordered', label: 'Bordered' },
          { value: 'minimal', label: 'Minimal' },
          { value: 'filled', label: 'Filled' }
        ]
      }
    }
  },

  tabs: {
    id: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content sections',
    icon: Square,
    category: 'content',
    settings: {
      tabs: {
        type: 'textarea',
        label: 'Tab Items (JSON)',
        placeholder: '[{"label": "Tab 1", "content": "Content 1"}]',
        default: '[{"label": "Tab 1", "content": "Content 1"}]',
        helperText: 'Add tab items as JSON array'
      },
      defaultTab: {
        type: 'number',
        label: 'Default Active Tab',
        default: 0,
        validation: { min: 0 }
      },
      style: {
        type: 'select',
        label: 'Tab Style',
        default: 'underline',
        options: [
          { value: 'underline', label: 'Underline' },
          { value: 'pills', label: 'Pills' },
          { value: 'boxed', label: 'Boxed' }
        ]
      }
    }
  },

  'rating-stars': {
    id: 'rating-stars',
    name: 'Rating Stars',
    description: 'Display star ratings',
    icon: Star,
    category: 'content',
    settings: {
      rating: {
        type: 'range',
        label: 'Rating',
        default: 4.5,
        validation: { min: 0, max: 5 }
      },
      maxStars: {
        type: 'number',
        label: 'Maximum Stars',
        default: 5,
        validation: { min: 1, max: 10 }
      },
      showNumber: {
        type: 'checkbox',
        label: 'Show Rating Number',
        default: true
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
    }
  },

  'social-share': {
    id: 'social-share',
    name: 'Social Share',
    description: 'Social media sharing buttons',
    icon: Share2,
    category: 'social',
    settings: {
      platforms: {
        type: 'textarea',
        label: 'Platforms (JSON)',
        placeholder: '["facebook", "twitter", "pinterest", "email"]',
        default: '["facebook", "twitter", "pinterest", "email"]',
        helperText: 'Array of platform names'
      },
      style: {
        type: 'select',
        label: 'Button Style',
        default: 'solid',
        options: [
          { value: 'solid', label: 'Solid' },
          { value: 'outline', label: 'Outline' },
          { value: 'ghost', label: 'Ghost' }
        ]
      },
      showLabels: {
        type: 'checkbox',
        label: 'Show Labels',
        default: false
      }
    }
  },

  price: {
    id: 'price',
    name: 'Price',
    description: 'Product price display',
    icon: DollarSign,
    category: 'content',
    settings: {
      price: {
        type: 'number',
        label: 'Price',
        default: 99.99,
        validation: { min: 0 }
      },
      comparePrice: {
        type: 'number',
        label: 'Compare at Price',
        placeholder: 'Original price',
        validation: { min: 0 }
      },
      currency: {
        type: 'text',
        label: 'Currency Symbol',
        default: '$'
      },
      showSavings: {
        type: 'checkbox',
        label: 'Show Savings',
        default: true
      }
    }
  },

  'product-badge': {
    id: 'product-badge',
    name: 'Product Badge',
    description: 'Sale, new, or custom badges',
    icon: Tag,
    category: 'content',
    settings: {
      text: {
        type: 'text',
        label: 'Badge Text',
        default: 'SALE'
      },
      type: {
        type: 'select',
        label: 'Badge Type',
        default: 'sale',
        options: [
          { value: 'sale', label: 'Sale' },
          { value: 'new', label: 'New' },
          { value: 'hot', label: 'Hot' },
          { value: 'custom', label: 'Custom' }
        ]
      },
      position: {
        type: 'select',
        label: 'Position',
        default: 'top-left',
        options: [
          { value: 'top-left', label: 'Top Left' },
          { value: 'top-right', label: 'Top Right' },
          { value: 'bottom-left', label: 'Bottom Left' },
          { value: 'bottom-right', label: 'Bottom Right' }
        ]
      }
    }
  },

  'icon-box': {
    id: 'icon-box',
    name: 'Icon Box',
    description: 'Icon with text content',
    icon: Square,
    category: 'content',
    settings: {
      icon: {
        type: 'select',
        label: 'Icon',
        default: 'truck',
        options: [
          { value: 'truck', label: 'Shipping' },
          { value: 'shield', label: 'Security' },
          { value: 'refresh', label: 'Returns' },
          { value: 'headphones', label: 'Support' }
        ]
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Free Shipping'
      },
      description: {
        type: 'textarea',
        label: 'Description',
        default: 'On orders over $50'
      },
      layout: {
        type: 'select',
        label: 'Layout',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal' },
          { value: 'vertical', label: 'Vertical' }
        ]
      }
    }
  },

  'icon-group': {
    id: 'icon-group',
    name: 'Icon Group',
    description: 'Group of icons for social links, user actions, etc.',
    icon: Grid,
    category: 'layout',
    settings: {
      gap: {
        type: 'select',
        label: 'Gap Between Icons',
        default: 'gap-1',
        options: [
          { value: 'gap-0', label: 'None' },
          { value: 'gap-1', label: 'Small' },
          { value: 'gap-2', label: 'Medium' },
          { value: 'gap-3', label: 'Large' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'right',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      mobileAlignment: {
        type: 'select',
        label: 'Mobile Alignment',
        default: 'right',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      backgroundColor: {
        type: 'select',
        label: 'Background Color',
        default: 'bg-transparent',
        options: [
          { value: 'bg-transparent', label: 'Transparent' },
          { value: 'bg-white', label: 'White' },
          { value: 'bg-gray-100', label: 'Light Gray' },
          { value: 'bg-black', label: 'Black' }
        ]
      },
      padding: {
        type: 'select',
        label: 'Padding',
        default: 'p-0',
        options: [
          { value: 'p-0', label: 'None' },
          { value: 'p-1', label: 'Small' },
          { value: 'p-2', label: 'Medium' },
          { value: 'p-3', label: 'Large' }
        ]
      },
      borderRadius: {
        type: 'select',
        label: 'Border Radius',
        default: 'rounded-none',
        options: [
          { value: 'rounded-none', label: 'None' },
          { value: 'rounded', label: 'Small' },
          { value: 'rounded-md', label: 'Medium' },
          { value: 'rounded-lg', label: 'Large' },
          { value: 'rounded-full', label: 'Full' }
        ]
      },
      wrap: {
        type: 'select',
        label: 'Wrap Behavior',
        default: 'nowrap',
        options: [
          { value: 'nowrap', label: 'No Wrap (Single Line)' },
          { value: 'wrap', label: 'Wrap to Next Line' },
          { value: 'wrap-reverse', label: 'Wrap Reverse' }
        ]
      },
      minWidth: {
        type: 'text',
        label: 'Minimum Width',
        default: 'auto',
        placeholder: 'e.g., 200px, 50%, auto',
        helperText: 'Set minimum width to prevent wrapping'
      }
    }
  },

  'icon-item': {
    id: 'icon-item',
    name: 'Icon Item',
    description: 'Individual icon with title and description',
    icon: Info,
    category: 'content',
    settings: {
      icon: {
        type: 'select',
        label: 'Icon',
        default: 'truck',
        options: [
          { value: 'truck', label: 'Truck (Shipping)' },
          { value: 'shield', label: 'Shield (Security)' },
          { value: 'refresh', label: 'Refresh (Returns)' },
          { value: 'headphones', label: 'Headphones (Support)' },
          { value: 'gift', label: 'Gift' },
          { value: 'credit-card', label: 'Credit Card' },
          { value: 'lock', label: 'Lock' },
          { value: 'clock', label: 'Clock' },
          { value: 'package', label: 'Package' },
          { value: 'heart', label: 'Heart' },
          { value: 'star', label: 'Star' },
          { value: 'check', label: 'Check' }
        ]
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Free Shipping',
        placeholder: 'Enter title'
      },
      description: {
        type: 'text',
        label: 'Description',
        default: 'On orders over $50',
        placeholder: 'Enter description'
      },
      link: {
        type: 'url',
        label: 'Link (optional)',
        placeholder: '/pages/shipping-info'
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      },
      iconColor: {
        type: 'color',
        label: 'Icon Color',
        default: '#000000'
      },
      showTitle: {
        type: 'checkbox',
        label: 'Show Title',
        default: true
      },
      showDescription: {
        type: 'checkbox',
        label: 'Show Description',
        default: true
      }
    }
  },

  'product-filters': {
    id: 'product-filters',
    name: 'Product Filters',
    description: 'Filter products by various criteria',
    icon: Filter,
    category: 'content',
    settings: {
      filters: {
        type: 'textarea',
        label: 'Available Filters (JSON)',
        default: '["category", "price", "size", "color"]',
        helperText: 'Array of filter types'
      },
      showCount: {
        type: 'checkbox',
        label: 'Show Result Count',
        default: true
      },
      collapsible: {
        type: 'checkbox',
        label: 'Collapsible Sections',
        default: true
      }
    }
  },

  'sort-dropdown': {
    id: 'sort-dropdown',
    name: 'Sort Dropdown',
    description: 'Product sorting options',
    icon: ArrowUpDown,
    category: 'content',
    settings: {
      options: {
        type: 'textarea',
        label: 'Sort Options (JSON)',
        default: '[{"value": "name-asc", "label": "Name A-Z"}, {"value": "price-asc", "label": "Price Low-High"}]',
        helperText: 'Array of sort options'
      },
      defaultSort: {
        type: 'text',
        label: 'Default Sort',
        default: 'name-asc'
      }
    }
  },

  pagination: {
    id: 'pagination',
    name: 'Pagination',
    description: 'Page navigation controls',
    icon: ChevronRight,
    category: 'navigation',
    settings: {
      totalPages: {
        type: 'number',
        label: 'Total Pages',
        default: 5,
        validation: { min: 1 }
      },
      currentPage: {
        type: 'number',
        label: 'Current Page',
        default: 1,
        validation: { min: 1 }
      },
      showNumbers: {
        type: 'checkbox',
        label: 'Show Page Numbers',
        default: true
      },
      showPrevNext: {
        type: 'checkbox',
        label: 'Show Prev/Next',
        default: true
      }
    }
  },

  'announcement-text': {
    id: 'announcement-text',
    name: 'Announcement Text',
    description: 'Single announcement message',
    icon: Type,
    category: 'content',
    settings: {
      text: {
        type: 'text',
        label: 'Announcement Text',
        default: 'Free shipping on orders over $50',
        placeholder: 'Enter announcement text'
      },
      link: {
        type: 'url',
        label: 'Link URL (optional)',
        placeholder: '/shipping-info'
      }
    }
  },


  'product-variants': {
    id: 'product-variants',
    name: 'Product Variants',
    description: 'Size, color, and other options',
    icon: Package,
    category: 'content',
    settings: {
      showVariantImages: {
        type: 'checkbox',
        label: 'Show Variant Images',
        default: true
      },
      variantLayout: {
        type: 'select',
        label: 'Variant Layout',
        default: 'buttons',
        options: [
          { value: 'dropdown', label: 'Dropdown' },
          { value: 'buttons', label: 'Buttons' },
          { value: 'swatches', label: 'Color Swatches' }
        ]
      },
      colorSwatchSize: {
        type: 'select',
        label: 'Color Swatch Size',
        default: 'medium',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }
        ]
      }
    }
  },

  'product-info': {
    id: 'product-info',
    name: 'Product Information',
    description: 'Display product title, price, vendor and other basic info',
    icon: Info,
    category: 'content',
    maxPerSection: 1,
    settings: {
      show_vendor: {
        type: 'checkbox',
        label: 'Show Vendor',
        default: true
      },
      show_sku: {
        type: 'checkbox',
        label: 'Show SKU',
        default: true
      },
      show_availability: {
        type: 'checkbox',
        label: 'Show Availability',
        default: true
      },
      show_price: {
        type: 'checkbox',
        label: 'Show Price',
        default: true
      },
      show_compare_price: {
        type: 'checkbox',
        label: 'Show Compare Price',
        default: true
      },
      show_savings: {
        type: 'checkbox',
        label: 'Show Savings Amount',
        default: true
      },
      show_tags: {
        type: 'checkbox',
        label: 'Show Product Tags',
        default: false
      },
      price_size: {
        type: 'select',
        label: 'Price Size',
        default: 'large',
        options: [
          { value: 'small', label: 'Small' },
          { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' },
          { value: 'extra-large', label: 'Extra Large' }
        ]
      }
    }
  },

  'product-price': {
    id: 'product-price',
    name: 'Product Price',
    description: 'Display product pricing information',
    icon: DollarSign,
    category: 'content',
    maxPerSection: 1,
    settings: {
      show_compare_price: {
        type: 'checkbox',
        label: 'Show Compare Price',
        default: true
      },
      show_savings: {
        type: 'checkbox',
        label: 'Show Savings Amount',
        default: true
      },
      show_tax_info: {
        type: 'checkbox',
        label: 'Show Tax Info',
        default: false
      },
      price_size: {
        type: 'select',
        label: 'Price Size',
        default: 'text-2xl',
        options: [
          { value: 'text-lg', label: 'Small' },
          { value: 'text-xl', label: 'Medium' },
          { value: 'text-2xl', label: 'Large' },
          { value: 'text-3xl', label: 'Extra Large' }
        ]
      },
      compare_at_price_size: {
        type: 'select',
        label: 'Compare Price Size',
        default: 'text-lg',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Medium' },
          { value: 'text-lg', label: 'Large' },
          { value: 'text-xl', label: 'Extra Large' }
        ]
      },
      tax_info_text: {
        type: 'text',
        label: 'Tax Info Text',
        default: 'Tax included.'
      }
    }
  },

  'product-form': {
    id: 'product-form',
    name: 'Product Form',
    description: 'Product purchase form with variants and add to cart',
    icon: ShoppingBag,
    category: 'content',
    maxPerSection: 1,
    settings: {
      show_quantity: {
        type: 'checkbox',
        label: 'Show Quantity Selector',
        default: true
      },
      maxQuantity: {
        type: 'number',
        label: 'Max Quantity',
        default: 10,
        validation: {
          min: 1,
          max: 999
        }
      },
      addToCartText: {
        type: 'text',
        label: 'Add to Cart Text',
        default: 'Add to Cart'
      },
      show_buy_now: {
        type: 'checkbox',
        label: 'Show Buy Now Button',
        default: true
      },
      buyNowText: {
        type: 'text',
        label: 'Buy Now Text',
        default: 'Buy It Now'
      },
      enable_dynamic_checkout: {
        type: 'checkbox',
        label: 'Enable Dynamic Checkout',
        default: false
      },
      show_payment_icons: {
        type: 'checkbox',
        label: 'Show Payment Icons',
        default: true
      },
      button_style: {
        type: 'select',
        label: 'Button Style',
        default: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' }
        ]
      }
    }
  },

  'product-detail': {
    id: 'product-detail',
    name: 'Product Detail',
    description: 'Complete product detail section with gallery and info',
    icon: Package,
    category: 'content',
    maxPerSection: 1,
    settings: {
      layout: {
        type: 'select',
        label: 'Layout',
        default: 'default',
        options: [
          { value: 'default', label: 'Default' },
          { value: 'stacked', label: 'Stacked' },
          { value: 'sidebar', label: 'Sidebar' }
        ]
      },
      image_position: {
        type: 'select',
        label: 'Image Position',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ]
      },
      show_breadcrumbs: {
        type: 'checkbox',
        label: 'Show Breadcrumbs',
        default: true
      },
      show_thumbnails: {
        type: 'checkbox',
        label: 'Show Thumbnails',
        default: true
      },
      enable_zoom: {
        type: 'checkbox',
        label: 'Enable Image Zoom',
        default: true
      }
    }
  },

  'product-gallery': {
    id: 'product-gallery',
    name: 'Product Gallery',
    description: 'Product image gallery with multiple layout options',
    icon: Image,
    category: 'media',
    maxPerSection: 1,
    settings: {
      layout: {
        type: 'select',
        label: 'Gallery Layout',
        default: 'thumbnails-bottom',
        options: [
          { value: 'thumbnails-bottom', label: 'Thumbnails Bottom' },
          { value: 'thumbnails-left', label: 'Thumbnails Left' },
          { value: 'carousel', label: 'Carousel' },
          { value: 'grid', label: 'Grid' },
          { value: 'stacked', label: 'Stacked' }
        ]
      },
      enableZoom: {
        type: 'checkbox',
        label: 'Enable Zoom',
        default: true
      },
      showThumbnails: {
        type: 'checkbox',
        label: 'Show Thumbnails',
        default: true,
        conditional: { field: 'layout', value: ['thumbnails-bottom', 'thumbnails-left'] }
      },
      thumbnailsPerRow: {
        type: 'number',
        label: 'Thumbnails Per Row',
        default: 6,
        validation: { min: 3, max: 8 },
        conditional: { field: 'layout', value: 'thumbnails-bottom' }
      },
      mainImageAspectRatio: {
        type: 'select',
        label: 'Image Aspect Ratio',
        default: 'square',
        options: [
          { value: 'square', label: 'Square (1:1)' },
          { value: 'portrait', label: 'Portrait (3:4)' },
          { value: 'landscape', label: 'Landscape (4:3)' },
          { value: 'tall', label: 'Tall (2:3)' },
          { value: 'wide', label: 'Wide (16:9)' }
        ]
      }
    }
  },

  'add-to-cart': {
    id: 'add-to-cart',
    name: 'Add to Cart',
    description: 'Add to cart button',
    icon: ShoppingBag,
    category: 'actions',
    settings: {
      buttonText: {
        type: 'text',
        label: 'Button Text',
        default: 'Add to Cart'
      },
      showQuantity: {
        type: 'checkbox',
        label: 'Show Quantity Selector',
        default: true
      },
      style: {
        type: 'select',
        label: 'Button Style',
        default: 'primary',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' }
        ]
      }
    }
  },

  'quantity-selector': {
    id: 'quantity-selector',
    name: 'Quantity Selector',
    description: 'Product quantity input',
    icon: Plus,
    category: 'content',
    settings: {
      min: {
        type: 'number',
        label: 'Minimum Quantity',
        default: 1,
        validation: { min: 0 }
      },
      max: {
        type: 'number',
        label: 'Maximum Quantity',
        default: 10,
        validation: { min: 1 }
      },
      default: {
        type: 'number',
        label: 'Default Quantity',
        default: 1,
        validation: { min: 1 }
      }
    }
  },

  'stock-status': {
    id: 'stock-status',
    name: 'Stock Status',
    description: 'In stock/out of stock indicator',
    icon: Package,
    category: 'content',
    settings: {
      inStockText: {
        type: 'text',
        label: 'In Stock Text',
        default: 'In Stock'
      },
      outOfStockText: {
        type: 'text',
        label: 'Out of Stock Text',
        default: 'Out of Stock'
      },
      lowStockThreshold: {
        type: 'number',
        label: 'Low Stock Threshold',
        default: 5,
        validation: { min: 1 }
      },
      showQuantity: {
        type: 'checkbox',
        label: 'Show Remaining Quantity',
        default: false
      }
    }
  },

  // LAYOUT BLOCKS - For advanced positioning
  
  container: {
    id: 'container',
    name: 'Container',
    description: 'Flexible container for organizing blocks',
    icon: Square,
    category: 'layout',
    settings: {
      layout: {
        type: 'select',
        label: 'Layout Direction',
        default: 'horizontal',
        options: [
          { value: 'horizontal', label: 'Horizontal (Side by Side)' },
          { value: 'vertical', label: 'Vertical (Stacked)' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'End' },
          { value: 'between', label: 'Space Between' },
          { value: 'around', label: 'Space Around' }
        ]
      },
      gap: {
        type: 'select',
        label: 'Spacing',
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
          { value: '4', label: 'Small' },
          { value: '6', label: 'Medium' },
          { value: '8', label: 'Large' }
        ]
      },
      maxWidth: {
        type: 'select',
        label: 'Maximum Width',
        default: 'none',
        options: [
          { value: 'none', label: 'Full Width' },
          { value: 'sm', label: 'Small' },
          { value: 'md', label: 'Medium' },
          { value: 'lg', label: 'Large' },
          { value: 'xl', label: 'Extra Large' }
        ]
      }
    }
  },

  columns: {
    id: 'columns',
    name: 'Columns',
    description: 'Multi-column layout',
    icon: Grid,
    category: 'layout',
    settings: {
      columns: {
        type: 'select',
        label: 'Number of Columns',
        default: '2',
        options: [
          { value: '1', label: '1 Column' },
          { value: '2', label: '2 Columns' },
          { value: '3', label: '3 Columns' },
          { value: '4', label: '4 Columns' },
          { value: '5', label: '5 Columns' },
          { value: '6', label: '6 Columns' }
        ]
      },
      gap: {
        type: 'select',
        label: 'Column Gap',
        default: '6',
        options: [
          { value: '0', label: 'None' },
          { value: '4', label: 'Small' },
          { value: '6', label: 'Medium' },
          { value: '8', label: 'Large' },
          { value: '10', label: 'Extra Large' }
        ]
      },
      mobileColumns: {
        type: 'select',
        label: 'Mobile Columns',
        default: '1',
        options: [
          { value: '1', label: '1 Column' },
          { value: '2', label: '2 Columns' }
        ]
      },
      verticalAlignment: {
        type: 'select',
        label: 'Vertical Alignment',
        default: 'top',
        options: [
          { value: 'top', label: 'Top' },
          { value: 'center', label: 'Center' },
          { value: 'bottom', label: 'Bottom' },
          { value: 'stretch', label: 'Stretch' }
        ]
      },
      equalHeight: {
        type: 'checkbox',
        label: 'Equal Height Columns',
        default: false
      }
    }
  },

  'flex-group': {
    id: 'flex-group',
    name: 'Flex Group',
    description: 'Flexible group for responsive layouts',
    icon: Square,
    category: 'layout',
    settings: {
      direction: {
        type: 'select',
        label: 'Direction',
        default: 'row',
        options: [
          { value: 'row', label: 'Horizontal' },
          { value: 'column', label: 'Vertical' }
        ]
      },
      wrap: {
        type: 'checkbox',
        label: 'Allow Wrapping',
        default: true
      },
      justify: {
        type: 'select',
        label: 'Justify Content',
        default: 'start',
        options: [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'between', label: 'Space Between' },
          { value: 'around', label: 'Space Around' },
          { value: 'evenly', label: 'Space Evenly' }
        ]
      },
      align: {
        type: 'select',
        label: 'Align Items',
        default: 'center',
        options: [
          { value: 'start', label: 'Start' },
          { value: 'center', label: 'Center' },
          { value: 'end', label: 'End' },
          { value: 'stretch', label: 'Stretch' }
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
      }
    }
  },
  // CATEGORY BLOCK
  category: {
    id: 'category',
    name: 'Category',
    description: 'Display a product category',
    icon: Package,
    category: 'content',
    maxPerSection: 12,
    settings: {
      categoryId: {
        type: 'select',
        label: 'Select Collection',
        default: '',
        placeholder: 'Choose a collection',
        helperText: 'Select a collection from your store',
        options: [] // Will be populated dynamically
      },
      title: {
        type: 'text',
        label: 'Custom Title',
        placeholder: 'Leave empty to use collection name',
        helperText: 'Override the collection name'
      },
      customImage: {
        type: 'image',
        label: 'Custom Image',
        placeholder: 'Upload or select an image',
        helperText: 'Override the collection image'
      },
      showProductCount: {
        type: 'checkbox',
        label: 'Show Product Count',
        default: true,
        helperText: 'Display the number of products'
      },
      showDescription: {
        type: 'checkbox',
        label: 'Show Description',
        default: false,
        helperText: 'Display category description if available'
      },
      imagePosition: {
        type: 'select',
        label: 'Image Position',
        default: 'background',
        options: [
          { value: 'background', label: 'Background Image' },
          { value: 'top', label: 'Top Image' },
          { value: 'left', label: 'Left Image' }
        ],
        helperText: 'How to display the category image'
      },
      buttonText: {
        type: 'text',
        label: 'Button Text',
        default: 'Shop Now',
        placeholder: 'Enter button text'
      },
      buttonStyle: {
        type: 'select',
        label: 'Button Style',
        default: 'outline',
        options: [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'outline', label: 'Outline' }
        ]
      },
      height: {
        type: 'select',
        label: 'Block Height',
        default: '300',
        options: [
          { value: '200', label: 'Small (200px)' },
          { value: '300', label: 'Medium (300px)' },
          { value: '400', label: 'Large (400px)' },
          { value: '500', label: 'Extra Large (500px)' }
        ],
        helperText: 'Height of the category block'
      }
    }
  },

  'product-title': {
    id: 'product-title',
    name: 'Product Title',
    description: 'Product title and vendor',
    icon: Type,
    category: 'content',
    maxPerSection: 1,
    settings: {
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: '3xl',
        options: [
          { value: 'xl', label: 'Extra Large' },
          { value: '2xl', label: '2X Large' },
          { value: '3xl', label: '3X Large' },
          { value: '4xl', label: '4X Large' }
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
      showVendor: {
        type: 'checkbox',
        label: 'Show Vendor',
        default: true
      }
    }
  },

  'product-description': {
    id: 'product-description',
    name: 'Product Description',
    description: 'Product description text',
    icon: Type,
    category: 'content',
    settings: {
      showTitle: {
        type: 'checkbox',
        label: 'Show Title',
        default: true
      },
      title: {
        type: 'text',
        label: 'Title',
        default: 'Description',
        conditional: { field: 'showTitle', value: true }
      },
      collapsible: {
        type: 'checkbox',
        label: 'Collapsible',
        default: false
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'base',
        options: [
          { value: 'sm', label: 'Small' },
          { value: 'base', label: 'Base' },
          { value: 'lg', label: 'Large' }
        ]
      }
    }
  },


  'navigation': {
    id: 'navigation',
    name: 'Navigation Menu',
    description: 'Main navigation menu with optional mega menu support',
    icon: Menu,
    category: 'navigation',
    maxPerSection: 1,
    settings: {
      menuId: {
        type: 'text',
        label: 'Menu Handle',
        default: 'main-menu',
        placeholder: 'main-menu',
        helperText: 'The handle of the menu to display (create menus in Content > Navigation)'
      },
      megaMenuItems: {
        type: 'text',
        label: 'Mega Menu Items',
        default: '',
        placeholder: 'Shop, Products',
        helperText: 'Comma-separated list of menu items to convert to mega menus (e.g., Shop, Products)'
      },
      alignment: {
        type: 'select',
        label: 'Menu Alignment',
        default: 'center',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'text-base',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Base' },
          { value: 'text-lg', label: 'Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        default: 'font-medium',
        options: [
          { value: 'font-normal', label: 'Normal' },
          { value: 'font-medium', label: 'Medium' },
          { value: 'font-semibold', label: 'Semibold' },
          { value: 'font-bold', label: 'Bold' }
        ]
      },
      spacing: {
        type: 'select',
        label: 'Item Spacing',
        default: 'space-x-8',
        options: [
          { value: 'space-x-4', label: 'Small' },
          { value: 'space-x-6', label: 'Medium' },
          { value: 'space-x-8', label: 'Large' },
          { value: 'space-x-10', label: 'Extra Large' }
        ]
      },
      textColor: {
        type: 'text',
        label: 'Text Color',
        default: 'text-gray-700',
        helperText: 'Tailwind text color class'
      },
      hoverColor: {
        type: 'text',
        label: 'Hover Color',
        default: 'hover:text-gray-900',
        helperText: 'Tailwind hover color class'
      },
      activeColor: {
        type: 'text',
        label: 'Active Color',
        default: 'text-gray-900',
        helperText: 'Color for current page'
      }
    }
  },

  'breadcrumbs': {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    description: 'Navigation breadcrumbs',
    icon: ChevronRight,
    category: 'navigation',
    maxPerSection: 1,
    settings: {
      showHome: {
        type: 'checkbox',
        label: 'Show Home Link',
        default: true
      },
      separator: {
        type: 'select',
        label: 'Separator Style',
        default: 'chevron',
        options: [
          { value: 'chevron', label: 'Chevron (>)' },
          { value: 'slash', label: 'Slash (/)' },
          { value: 'dot', label: 'Dot (•)' },
          { value: 'arrow', label: 'Arrow (→)' }
        ]
      },
      textColor: {
        type: 'text',
        label: 'Text Color Class',
        default: 'text-gray-600',
        helperText: 'Tailwind text color class'
      },
      hoverColor: {
        type: 'text',
        label: 'Hover Color Class',
        default: 'hover:text-gray-900',
        helperText: 'Tailwind hover color class'
      }
    }
  },

  'dropdown-menu': {
    id: 'dropdown-menu',
    name: 'Dropdown Menu',
    description: 'Dropdown menu with items',
    icon: ChevronDown,
    category: 'navigation',
    settings: {
      text: {
        type: 'text',
        label: 'Menu Text',
        default: 'Menu'
      },
      fontSize: {
        type: 'select',
        label: 'Font Size',
        default: 'text-base',
        options: [
          { value: 'text-sm', label: 'Small' },
          { value: 'text-base', label: 'Base' },
          { value: 'text-lg', label: 'Large' }
        ]
      },
      fontWeight: {
        type: 'select',
        label: 'Font Weight',
        default: 'font-medium',
        options: [
          { value: 'font-normal', label: 'Normal' },
          { value: 'font-medium', label: 'Medium' },
          { value: 'font-semibold', label: 'Semibold' },
          { value: 'font-bold', label: 'Bold' }
        ]
      },
      showIcon: {
        type: 'checkbox',
        label: 'Show Dropdown Icon',
        default: true
      },
      iconPosition: {
        type: 'select',
        label: 'Icon Position',
        default: 'right',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ],
        conditional: { field: 'showIcon', value: true }
      },
      dropdownWidth: {
        type: 'select',
        label: 'Dropdown Width',
        default: 'w-48',
        options: [
          { value: 'w-40', label: 'Small (160px)' },
          { value: 'w-48', label: 'Medium (192px)' },
          { value: 'w-56', label: 'Large (224px)' },
          { value: 'w-64', label: 'Extra Large (256px)' }
        ]
      },
      dropdownAlignment: {
        type: 'select',
        label: 'Dropdown Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' }
        ]
      },
      showDividers: {
        type: 'checkbox',
        label: 'Show Dividers Between Items',
        default: false
      }
    }
  },

  'account': {
    id: 'account',
    name: 'Account',
    description: 'User account link/icon',
    icon: User,
    category: 'actions',
    settings: {
      showText: {
        type: 'checkbox',
        label: 'Show Text',
        default: false
      },
      text: {
        type: 'text',
        label: 'Text',
        default: 'Account',
        conditional: { field: 'showText', value: true }
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'w-5 h-5',
        options: [
          { value: 'w-4 h-4', label: 'Small' },
          { value: 'w-5 h-5', label: 'Medium' },
          { value: 'w-6 h-6', label: 'Large' }
        ]
      },
      loginLink: {
        type: 'text',
        label: 'Login Link',
        default: '/account/login'
      },
      accountLink: {
        type: 'text',
        label: 'Account Dashboard Link',
        default: '/account'
      }
    }
  },

  'user-menu': {
    id: 'user-menu',
    name: 'User Menu',
    description: 'Dropdown menu for user account actions',
    icon: User,
    category: 'actions',
    settings: {
      showAvatar: {
        type: 'checkbox',
        label: 'Show Avatar',
        default: true
      },
      showName: {
        type: 'checkbox',
        label: 'Show User Name',
        default: false
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'w-5 h-5',
        options: [
          { value: 'w-4 h-4', label: 'Small' },
          { value: 'w-5 h-5', label: 'Medium' },
          { value: 'w-6 h-6', label: 'Large' }
        ]
      },
      menuItems: {
        type: 'select',
        label: 'Menu Items',
        default: 'default',
        options: [
          { value: 'default', label: 'Default (Profile, Orders, Settings, Logout)' },
          { value: 'minimal', label: 'Minimal (Profile, Logout)' },
          { value: 'custom', label: 'Custom' }
        ]
      },
      loginLink: {
        type: 'text',
        label: 'Login Link',
        default: '/account/login'
      },
      accountLink: {
        type: 'text',
        label: 'Account Dashboard Link',
        default: '/account'
      }
    }
  },

  'cart': {
    id: 'cart',
    name: 'Cart',
    description: 'Shopping cart icon with count',
    icon: ShoppingBag,
    category: 'actions',
    settings: {
      showCount: {
        type: 'checkbox',
        label: 'Show Item Count',
        default: true
      },
      showText: {
        type: 'checkbox',
        label: 'Show Text',
        default: false
      },
      text: {
        type: 'text',
        label: 'Text',
        default: 'Cart',
        conditional: { field: 'showText', value: true }
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'w-5 h-5',
        options: [
          { value: 'w-4 h-4', label: 'Small' },
          { value: 'w-5 h-5', label: 'Medium' },
          { value: 'w-6 h-6', label: 'Large' }
        ]
      },
      cartLink: {
        type: 'text',
        label: 'Cart Link',
        default: '/cart'
      }
    }
  },

  'search': {
    id: 'search',
    name: 'Search',
    description: 'Search bar or icon',
    icon: Search,
    category: 'actions',
    settings: {
      style: {
        type: 'select',
        label: 'Search Style',
        default: 'icon-only',
        options: [
          { value: 'icon-only', label: 'Icon Only' },
          { value: 'inline', label: 'Inline Search Bar' },
          { value: 'expandable', label: 'Expandable Search' }
        ]
      },
      placeholder: {
        type: 'text',
        label: 'Placeholder Text',
        default: 'Search...',
        conditional: { field: 'style', value: ['inline', 'expandable'] }
      },
      showIcon: {
        type: 'checkbox',
        label: 'Show Search Icon',
        default: true
      },
      iconSize: {
        type: 'select',
        label: 'Icon Size',
        default: 'w-5 h-5',
        options: [
          { value: 'w-4 h-4', label: 'Small' },
          { value: 'w-5 h-5', label: 'Medium' },
          { value: 'w-6 h-6', label: 'Large' }
        ]
      },
      searchAction: {
        type: 'text',
        label: 'Search Page URL',
        default: '/search'
      }
    }
  },

  'mobile-menu-toggle': {
    id: 'mobile-menu-toggle',
    name: 'Mobile Menu Toggle',
    description: 'Hamburger menu button for mobile navigation',
    icon: Menu,
    category: 'navigation',
    settings: {
      mobileOnly: {
        type: 'checkbox',
        label: 'Show on Mobile Only',
        default: true
      }
    }
  },
  
  // FOOTER COLUMN BLOCK
  'footer-column': {
    id: 'footer-column',
    name: 'Footer Column',
    description: 'Footer column with title and links',
    icon: List,
    category: 'layout',
    settings: {
      title: {
        type: 'text',
        label: 'Column Title',
        default: 'Column Title',
        placeholder: 'Enter column title'
      },
      width: {
        type: 'select',
        label: 'Column Width',
        default: '25%',
        options: [
          { value: '20%', label: '20%' },
          { value: '25%', label: '25%' },
          { value: '30%', label: '30%' },
          { value: '33%', label: '33%' },
          { value: '40%', label: '40%' },
          { value: '50%', label: '50%' }
        ]
      },
      alignment: {
        type: 'select',
        label: 'Text Alignment',
        default: 'left',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ]
      }
    }
  },

  'link': {
    id: 'link',
    name: 'Link',
    description: 'Simple text link',
    icon: ExternalLink,
    category: 'basic',
    settings: {
      text: {
        type: 'text',
        label: 'Link Text',
        default: 'Link',
        placeholder: 'Enter link text'
      },
      url: {
        type: 'text',
        label: 'URL',
        default: '#',
        placeholder: 'Enter URL or path'
      },
      openInNewTab: {
        type: 'toggle',
        label: 'Open in New Tab',
        default: false
      }
    }
  }
};

// Block categories for organization
export const BLOCK_CATEGORIES = {
  content: {
    name: 'Content',
    icon: Type,
    description: 'Text, navigation, and content blocks'
  },
  media: {
    name: 'Media',
    icon: Image,
    description: 'Images, videos and media blocks'
  },
  actions: {
    name: 'Actions',
    icon: Square,
    description: 'Buttons and interactive elements'
  },
  layout: {
    name: 'Layout',
    icon: Grid,
    description: 'Spacing and layout blocks'
  },
  social: {
    name: 'Social',
    icon: Users,
    description: 'Social media and sharing blocks'
  },
  advanced: {
    name: 'Advanced',
    icon: Code,
    description: 'Custom code and advanced blocks'
  }
};

// Helper functions
export function getBlockType(id: string): BlockType | undefined {
  return BLOCK_TYPES[id];
}

export function getBlocksByCategory(category: string): BlockType[] {
  return Object.values(BLOCK_TYPES).filter(block => block.category === category);
}

export function getAllBlockTypes(): BlockType[] {
  return Object.values(BLOCK_TYPES);
}

// Default block settings
export function getDefaultBlockSettings(blockTypeId: string): Record<string, any> {
  const blockType = getBlockType(blockTypeId);
  if (!blockType) return {};

  const defaultSettings: Record<string, any> = {};
  
  Object.entries(blockType.settings).forEach(([key, field]) => {
    if (field.default !== undefined) {
      defaultSettings[key] = field.default;
    }
  });

  return defaultSettings;
}

// Create a new block
export function createBlock(type: string, position: number = 0): Omit<any, 'id' | 'sectionId' | 'createdAt' | 'updatedAt'> {
  return {
    type,
    position,
    enabled: true,
    settings: getDefaultBlockSettings(type)
  };
}