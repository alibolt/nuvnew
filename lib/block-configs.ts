import {
  Text,
  Image,
  Navigation,
  ShoppingCart,
  Search,
  User,
  Globe,
  Menu,
  Heart,
  DollarSign,
  Languages,
  Smartphone,
  Layout,
  Star,
  Package,
  Type,
  MapPin,
  Calendar,
  ChevronDown,
  Grid3x3,
  FileText,
  Share2,
  TrendingUp,
  BarChart,
  MessageSquare,
  AlertCircle,
  Layers,
  Box,
  ShoppingBag,
  Truck,
  Clock
} from 'lucide-react';

export interface BlockConfig {
  id: string;
  name: string;
  description?: string;
  icon: any;
  category: 'navigation' | 'commerce' | 'content' | 'layout' | 'product' | 'collection' | 'checkout' | 'account';
  maxPerSection?: number;
  allowedInContainers?: boolean;
  allowedSections?: string[];
  excludedSections?: string[];
  defaultSettings?: Record<string, any>;
}

// Define all available blocks
export const blockConfigs: Record<string, BlockConfig> = {
  // Navigation blocks
  logo: {
    id: 'logo',
    name: 'Logo',
    description: 'Brand logo',
    icon: Image,
    category: 'navigation',
    maxPerSection: 1,
    allowedInContainers: true,
    defaultSettings: {
      logoHeight: '40',
      mobileLogoHeight: '32'
    }
  },
  
  // Navigation blocks
  'navigation-menu': {
    id: 'navigation-menu',
    name: 'Navigation Menu',
    description: 'Simple navigation menu with optional dropdowns',
    icon: Navigation,
    category: 'navigation',
    allowedInContainers: true,
    allowedSections: ['header', 'footer'],
    defaultSettings: {
      alignment: 'horizontal',
      textSize: 'base',
      spacing: 'normal'
    }
  },
  
  // Commerce blocks
  cart: {
    id: 'cart',
    name: 'Cart',
    description: 'Shopping cart icon',
    icon: ShoppingCart,
    category: 'commerce',
    maxPerSection: 1,
    allowedInContainers: true
  },
  wishlist: {
    id: 'wishlist',
    name: 'Wishlist',
    description: 'Wishlist icon',
    icon: Heart,
    category: 'commerce',
    maxPerSection: 1,
    allowedInContainers: true
  },
  search: {
    id: 'search',
    name: 'Search',
    description: 'Search bar',
    icon: Search,
    category: 'commerce',
    maxPerSection: 1,
    allowedInContainers: true
  },
  'currency-selector': {
    id: 'currency-selector',
    name: 'Currency Selector',
    description: 'Currency switcher',
    icon: DollarSign,
    category: 'commerce',
    maxPerSection: 1
  },
  'language-selector': {
    id: 'language-selector',
    name: 'Language Selector',
    description: 'Language switcher',
    icon: Languages,
    category: 'commerce',
    maxPerSection: 1
  },
  
  // Content blocks
  heading: {
    id: 'heading',
    name: 'Heading',
    description: 'Heading text',
    icon: Type,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      text: 'Heading',
      level: 'h2',
      size: '2xl',
      textAlign: 'left'
    }
  },
  text: {
    id: 'text',
    name: 'Text',
    description: 'Text content',
    icon: Type,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      content: 'Add your text here',
      textAlign: 'left',
      fontSize: 'base'
    }
  },
  button: {
    id: 'button',
    name: 'Button',
    description: 'Action button',
    icon: Smartphone,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      text: 'Click me',
      url: '#',
      style: 'primary',
      size: 'medium'
    }
  },
  image: {
    id: 'image',
    name: 'Image',
    description: 'Image block',
    icon: Image,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      src: '',
      alt: 'Image',
      width: '100%',
      height: 'auto'
    }
  },
  'hero-text': {
    id: 'hero-text',
    name: 'Hero Text',
    description: 'Hero banner text with title and subtitle',
    icon: Type,
    category: 'content',
    allowedSections: ['hero', 'hero-banner'],
    defaultSettings: {
      title: 'Welcome to Our Store',
      subtitle: 'Discover amazing products',
      alignment: 'center',
      titleSize: '5xl',
      subtitleSize: 'xl'
    }
  },
  spacer: {
    id: 'spacer',
    name: 'Spacer',
    description: 'Add vertical space',
    icon: Layout,
    category: 'layout',
    allowedInContainers: true,
    defaultSettings: {
      height: '40'
    }
  },
  columns: {
    id: 'columns',
    name: 'Columns',
    description: 'Multi-column layout',
    icon: Grid3x3,
    category: 'layout',
    allowedInContainers: false,
    defaultSettings: {
      columns: 2,
      gap: '4'
    }
  },
  pattern: {
    id: 'pattern',
    name: 'Pattern',
    description: 'Background pattern',
    icon: Grid3x3,
    category: 'content',
    allowedSections: ['hero', 'hero-banner'],
    defaultSettings: {
      pattern: 'dots',
      opacity: 0.1
    }
  },
  video: {
    id: 'video',
    name: 'Video',
    description: 'Video player',
    icon: FileText,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      src: '',
      autoplay: false,
      muted: true,
      loop: true
    }
  },
  countdown: {
    id: 'countdown',
    name: 'Countdown',
    description: 'Countdown timer',
    icon: Clock,
    category: 'content',
    allowedInContainers: true,
    defaultSettings: {
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      label: 'Sale ends in:'
    }
  },
  'announcement-text': {
    id: 'announcement-text',
    name: 'Announcement Text',
    description: 'Announcement bar text',
    icon: AlertCircle,
    category: 'content',
    allowedSections: ['announcement-bar'],
    defaultSettings: {
      text: 'Free shipping on orders over $50!',
      link: ''
    }
  },
  
  // Layout blocks
  container: {
    id: 'container',
    name: 'Container',
    description: 'Group blocks together',
    icon: Box,
    category: 'layout',
    allowedInContainers: false, // Prevent nested containers
    maxPerSection: 5, // Limit containers per section to prevent performance issues
    defaultSettings: {
      layout: 'horizontal',
      alignment: 'left',
      gap: '4',
      padding: '0',
      maxWidth: 'none'
    }
  },
  
  // Account blocks
  account: {
    id: 'account',
    name: 'Account',
    description: 'User account menu',
    icon: User,
    category: 'account',
    maxPerSection: 1,
    allowedInContainers: true
  },
  'user-menu': {
    id: 'user-menu',
    name: 'User Menu',
    description: 'Dropdown user menu',
    icon: User,
    category: 'account',
    maxPerSection: 1
  },
  
  'social-share': {
    id: 'social-share',
    name: 'Social Share',
    description: 'Share content on social media',
    icon: Share2,
    category: 'content',
    allowedInContainers: true
  },
  'icon-group': {
    id: 'icon-group',
    name: 'Icon Group',
    description: 'Icon with optional text',
    icon: Box,
    category: 'content',
    allowedInContainers: true
  },
  'breadcrumbs': {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    description: 'Navigation breadcrumbs',
    icon: Navigation,
    category: 'navigation',
    allowedSections: ['collection-header'],
    allowedInContainers: true
  },
  
  // Collection blocks
  'collection-header': {
    id: 'collection-header',
    name: 'Collection Header',
    description: 'Category title & description',
    icon: Type,
    category: 'collection',
    allowedSections: ['collection-header'],
    maxPerSection: 1
  },
  'collection-sort': {
    id: 'collection-sort',
    name: 'Sort Options',
    description: 'Product sorting',
    icon: TrendingUp,
    category: 'collection',
    allowedSections: ['collection-header']
  },
  'collection-filters': {
    id: 'collection-filters',
    name: 'Filters',
    description: 'Product filters',
    icon: BarChart,
    category: 'collection',
    allowedSections: ['collection-header']
  },
  
  // Checkout blocks
  'checkout-header': {
    id: 'checkout-header',
    name: 'Checkout Header',
    description: 'Checkout page header',
    icon: ShoppingBag,
    category: 'checkout',
    allowedSections: ['checkout-header'],
    maxPerSection: 1
  },
  
  // Product-specific blocks
  'product-gallery': {
    id: 'product-gallery',
    name: 'Product Gallery',
    description: 'Product image gallery with thumbnails',
    icon: Image,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    maxPerSection: 1,
    defaultSettings: {
      showThumbnails: true,
      thumbnailPosition: 'bottom',
      enableZoom: true,
      aspectRatio: 'square'
    }
  },
  'product-title': {
    id: 'product-title',
    name: 'Product Title',
    description: 'Product name and vendor',
    icon: Type,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    maxPerSection: 1,
    defaultSettings: {
      fontSize: '3xl',
      fontWeight: 'bold',
      showVendor: false
    }
  },
  'product-price': {
    id: 'product-price',
    name: 'Product Price',
    description: 'Price with compare price and discount',
    icon: DollarSign,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    maxPerSection: 1,
    defaultSettings: {
      fontSize: '2xl',
      showComparePrice: true,
      showCurrency: true
    }
  },
  'product-description': {
    id: 'product-description',
    name: 'Product Description',
    description: 'Product description with collapsible option',
    icon: FileText,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    defaultSettings: {
      showTitle: true,
      collapsible: false
    }
  },
  'product-variants': {
    id: 'product-variants',
    name: 'Product Variants',
    description: 'Product options selector',
    icon: Layers,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    maxPerSection: 1,
    defaultSettings: {
      style: 'buttons',
      showLabel: true,
      showPrice: true
    }
  },
  'product-form': {
    id: 'product-form',
    name: 'Add to Cart',
    description: 'Add to cart button with quantity',
    icon: ShoppingCart,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    maxPerSection: 1,
    defaultSettings: {
      buttonText: 'Add to Cart',
      buttonStyle: 'primary',
      buttonSize: 'large',
      showQuantity: true
    }
  },
  'product-info': {
    id: 'product-info',
    name: 'Product Info',
    description: 'SKU, availability, shipping info',
    icon: Package,
    category: 'product',
    allowedSections: ['product'],
    allowedInContainers: true,
    defaultSettings: {
      showSku: true,
      showAvailability: true,
      showShipping: true
    }
  },
  
  // Countdown block
  'countdown': {
    id: 'countdown',
    name: 'Countdown Timer',
    description: 'Create urgency with countdown timers',
    icon: Clock,
    category: 'content',
    allowedInContainers: true,
    maxPerSection: 3,
    defaultSettings: {
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Limited Time Offer',
      description: "Don't miss out on this exclusive deal",
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true
    }
  }
};

// Get blocks for a specific section type
export function getBlocksForSection(
  sectionType: string, 
  isContainer: boolean = false,
  theme?: any
): BlockConfig[] {
  // Testimonials section için sadece testimonial bloğu
  if (sectionType === 'testimonials') {
    return [
      {
        id: 'testimonial',
        name: 'Testimonial',
        icon: MessageSquare,
        description: 'Customer testimonial',
        category: 'content'
      }
    ];
  }
  
  // Hero Banner section için uygun bloklar
  if (sectionType === 'hero-banner' || sectionType === 'hero') {
    return Object.values(blockConfigs).filter(block => {
      // Hero banner için uygun blok tipleri
      const allowedBlockTypes = [
        'heading', 'text', 'button', 'image', 'spacer', 
        'container', 'columns', 'hero-text', 'countdown',
        'pattern', 'video'
      ];
      
      // Sadece izin verilen blokları göster
      if (allowedBlockTypes.includes(block.id)) {
        return true;
      }
      
      // Commerce ve account kategorisindeki blokları hariç tut
      if (['commerce', 'account', 'navigation'].includes(block.category)) {
        return false;
      }
      
      return false;
    });
  }
  
  // Countdown section can use general content blocks
  if (sectionType === 'countdown') {
    // Return blocks suitable for countdown sections
    return Object.values(blockConfigs).filter(block => {
      // Allow general content blocks and layout blocks
      if (['content', 'layout'].includes(block.category)) {
        return true;
      }
      return false;
    });
  }
  
  return Object.values(blockConfigs).filter(block => {
    // Container-specific logic
    if (isContainer) {
      // Don't allow containers inside containers
      if (block.id === 'container') return false;
      
      // For containers, we need to check both:
      // 1. If the block is allowed in containers
      // 2. If the block is appropriate for the parent section type
      if (block.allowedInContainers !== true) return false;
      
      // Also apply section-specific filtering for container contents
      if (block.allowedSections && !block.allowedSections.includes(sectionType)) {
        return false;
      }
      
      if (block.excludedSections && block.excludedSections.includes(sectionType)) {
        return false;
      }
      
      return true;
    }
    
    // Check if block is allowed in this section
    if (block.allowedSections && !block.allowedSections.includes(sectionType)) {
      return false;
    }
    
    // Check if block is excluded from this section
    if (block.excludedSections && block.excludedSections.includes(sectionType)) {
      return false;
    }
    
    // Header section special rules
    if (sectionType === 'header') {
      // All navigation and commerce blocks are allowed
      if (['navigation', 'commerce', 'account'].includes(block.category)) {
        return true;
      }
      // Also allow text and container blocks
      if (['text', 'container'].includes(block.id)) {
        return true;
      }
      return block.allowedSections?.includes('header');
    }
    
    // For other sections, use default logic
    return !block.allowedSections || block.allowedSections.includes(sectionType);
  });
}

// Get block configuration by ID
export function getBlockConfig(blockId: string): BlockConfig | undefined {
  return blockConfigs[blockId];
}

// Check if a block can be added to a section
export function canAddBlock(
  blockId: string,
  sectionType: string,
  currentBlocks: any[],
  isContainer: boolean = false
): boolean {
  const config = blockConfigs[blockId];
  if (!config) return false;
  
  // Check container rules
  if (isContainer && !config.allowedInContainers) {
    return false;
  }
  
  // Check max per section limit
  if (config.maxPerSection) {
    const existingCount = currentBlocks.filter(b => b.type === blockId).length;
    if (existingCount >= config.maxPerSection) {
      return false;
    }
  }
  
  // Check allowed sections
  if (config.allowedSections && !config.allowedSections.includes(sectionType)) {
    return false;
  }
  
  return true;
}

// Get default settings for a block
export function getBlockDefaultSettings(blockId: string): Record<string, any> {
  const config = blockConfigs[blockId];
  return config?.defaultSettings || {};
}