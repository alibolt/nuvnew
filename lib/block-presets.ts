// Block presets for common configurations
export interface BlockPreset {
  id: string;
  name: string;
  description: string;
  blockType: string;
  settings: Record<string, any>;
  category: 'header' | 'hero' | 'content' | 'product' | 'footer' | 'cta';
  preview?: string;
}

// Predefined block presets
export const BLOCK_PRESETS: Record<string, BlockPreset[]> = {
  // Header Presets
  header: [
    {
      id: 'header-logo-left',
      name: 'Logo Left',
      description: 'Logo positioned on the left side',
      blockType: 'logo',
      category: 'header',
      settings: {
        type: 'image',
        alignment: 'left',
        width: 120,
        height: 40
      }
    },
    {
      id: 'header-logo-center',
      name: 'Logo Center',
      description: 'Logo centered in header',
      blockType: 'logo',
      category: 'header',
      settings: {
        type: 'image',
        alignment: 'center',
        width: 150,
        height: 50
      }
    },
    {
      id: 'header-nav-horizontal',
      name: 'Horizontal Navigation',
      description: 'Standard horizontal navigation menu',
      blockType: 'navigation',
      category: 'header',
      settings: {
        layout: 'horizontal',
        alignment: 'left',
        spacing: 'space-x-8',
        fontSize: 'text-base',
        fontWeight: 'font-medium'
      }
    },
    {
      id: 'header-search-bar',
      name: 'Search Bar',
      description: 'Product search with icon',
      blockType: 'search',
      category: 'header',
      settings: {
        placeholder: 'Search products...',
        showIcon: true,
        iconPosition: 'left',
        size: 'medium',
        width: 'w-64'
      }
    },
    {
      id: 'header-cart-icon',
      name: 'Cart Icon',
      description: 'Shopping cart with item count',
      blockType: 'cart',
      category: 'header',
      settings: {
        showIcon: true,
        showCount: true,
        showText: false,
        size: 'medium'
      }
    }
  ],

  // Hero Section Presets
  hero: [
    {
      id: 'hero-welcome',
      name: 'Welcome Hero',
      description: 'Welcome message with call-to-action',
      blockType: 'hero-text',
      category: 'hero',
      settings: {
        headline: 'Welcome to Our Store',
        subheading: 'Discover amazing products at great prices',
        ctaText: 'Shop Now',
        ctaHref: '/products',
        alignment: 'center',
        headlineSize: 'text-4xl md:text-5xl lg:text-6xl',
        ctaVariant: 'primary',
        ctaSize: 'large'
      }
    },
    {
      id: 'hero-sale',
      name: 'Sale Banner',
      description: 'Promotional hero for sales',
      blockType: 'hero-text',
      category: 'hero',
      settings: {
        headline: 'Summer Sale - Up to 50% Off',
        subheading: 'Limited time offer on selected items',
        ctaText: 'Shop Sale',
        ctaHref: '/sale',
        alignment: 'center',
        headlineSize: 'text-3xl md:text-4xl lg:text-5xl',
        ctaVariant: 'primary',
        ctaSize: 'large'
      }
    },
    {
      id: 'hero-image-banner',
      name: 'Image Banner',
      description: 'Full-width hero image',
      blockType: 'image',
      category: 'hero',
      settings: {
        aspectRatio: 'aspect-[21/9]',
        objectFit: 'object-cover',
        alignment: 'center',
        borderRadius: 'rounded-none',
        width: 'w-full'
      }
    }
  ],

  // Content Presets
  content: [
    {
      id: 'content-heading-large',
      name: 'Large Heading',
      description: 'Main section heading',
      blockType: 'heading',
      category: 'content',
      settings: {
        level: 'h2',
        size: 'text-3xl',
        fontWeight: 'font-bold',
        alignment: 'center',
        margin: 'mb-8'
      }
    },
    {
      id: 'content-heading-small',
      name: 'Small Heading',
      description: 'Subsection heading',
      blockType: 'heading',
      category: 'content',
      settings: {
        level: 'h3',
        size: 'text-xl',
        fontWeight: 'font-semibold',
        alignment: 'left',
        margin: 'mb-4'
      }
    },
    {
      id: 'content-paragraph',
      name: 'Paragraph Text',
      description: 'Standard paragraph content',
      blockType: 'text',
      category: 'content',
      settings: {
        text: 'This is a paragraph of text content. Edit this to add your own content.',
        size: 'text-base',
        alignment: 'left',
        lineHeight: 'leading-relaxed'
      }
    },
    {
      id: 'content-feature-image',
      name: 'Feature Image',
      description: 'Highlighted content image',
      blockType: 'image',
      category: 'content',
      settings: {
        aspectRatio: 'aspect-video',
        objectFit: 'object-cover',
        alignment: 'center',
        borderRadius: 'rounded-lg',
        margin: 'mb-8'
      }
    },
    {
      id: 'content-cta-button',
      name: 'Call to Action Button',
      description: 'Primary action button',
      blockType: 'button',
      category: 'content',
      settings: {
        text: 'Learn More',
        variant: 'primary',
        size: 'large',
        alignment: 'center',
        margin: 'my-8'
      }
    }
  ],

  // Product Presets
  product: [
    {
      id: 'product-card-default',
      name: 'Standard Product Card',
      description: 'Default product card with all features',
      blockType: 'product-card',
      category: 'product',
      settings: {
        showImage: true,
        showTitle: true,
        showPrice: true,
        showRating: true,
        showWishlist: true,
        showAddToCart: true,
        imageAspectRatio: 'aspect-square',
        cardHover: 'hover:shadow-lg'
      }
    },
    {
      id: 'product-card-minimal',
      name: 'Minimal Product Card',
      description: 'Clean product card with essential info',
      blockType: 'product-card',
      category: 'product',
      settings: {
        showImage: true,
        showTitle: true,
        showPrice: true,
        showRating: false,
        showWishlist: false,
        showAddToCart: true,
        imageAspectRatio: 'aspect-square',
        cardBorder: 'border-0',
        cardHover: 'hover:opacity-80'
      }
    },
    {
      id: 'category-grid-item',
      name: 'Category Grid Item',
      description: 'Category card for grid layout',
      blockType: 'category-item',
      category: 'product',
      settings: {
        showImage: true,
        showTitle: true,
        showDescription: false,
        showProductCount: true,
        imageAspectRatio: 'aspect-square',
        textAlignment: 'text-center',
        cardHover: 'hover:shadow-lg'
      }
    },
    {
      id: 'value-prop-shipping',
      name: 'Free Shipping',
      description: 'Free shipping value proposition',
      blockType: 'value-prop',
      category: 'product',
      settings: {
        icon: 'truck',
        title: 'Free Shipping',
        description: 'Free shipping on orders over $50',
        iconColor: 'text-[#8B9F7E]',
        alignment: 'center'
      }
    },
    {
      id: 'value-prop-returns',
      name: 'Easy Returns',
      description: 'Return policy value proposition',
      blockType: 'value-prop',
      category: 'product',
      settings: {
        icon: 'return',
        title: 'Easy Returns',
        description: '30-day return policy',
        iconColor: 'text-blue-600',
        alignment: 'center'
      }
    },
    {
      id: 'value-prop-support',
      name: '24/7 Support',
      description: 'Customer support value proposition',
      blockType: 'value-prop',
      category: 'product',
      settings: {
        icon: 'support',
        title: '24/7 Support',
        description: 'Customer support available anytime',
        iconColor: 'text-purple-600',
        alignment: 'center'
      }
    }
  ],

  // Footer Presets
  footer: [
    {
      id: 'footer-links-quick',
      name: 'Quick Links',
      description: 'Essential site navigation',
      blockType: 'footer-column',
      category: 'footer',
      settings: {
        title: 'Quick Links',
        links: [
          { text: 'Home', href: '/' },
          { text: 'About', href: '/about' },
          { text: 'Products', href: '/products' },
          { text: 'Contact', href: '/contact' }
        ]
      }
    },
    {
      id: 'footer-links-help',
      name: 'Help & Support',
      description: 'Customer service links',
      blockType: 'footer-column',
      category: 'footer',
      settings: {
        title: 'Help & Support',
        links: [
          { text: 'FAQ', href: '/faq' },
          { text: 'Shipping', href: '/shipping' },
          { text: 'Returns', href: '/returns' },
          { text: 'Contact Us', href: '/contact' }
        ]
      }
    },
    {
      id: 'footer-links-legal',
      name: 'Legal',
      description: 'Legal and policy links',
      blockType: 'footer-column',
      category: 'footer',
      settings: {
        title: 'Legal',
        links: [
          { text: 'Privacy Policy', href: '/privacy' },
          { text: 'Terms of Service', href: '/terms' },
          { text: 'Cookie Policy', href: '/cookies' }
        ]
      }
    },
    {
      id: 'footer-newsletter',
      name: 'Newsletter Signup',
      description: 'Email subscription form',
      blockType: 'newsletter',
      category: 'footer',
      settings: {
        title: 'Stay Updated',
        description: 'Subscribe to get updates on new products and offers',
        placeholder: 'Your email address',
        buttonText: 'Subscribe',
        layout: 'vertical',
        backgroundColor: 'bg-gray-800',
        titleColor: 'text-white',
        descriptionColor: 'text-gray-300'
      }
    }
  ],

  // Call-to-Action Presets
  cta: [
    {
      id: 'cta-primary',
      name: 'Primary CTA',
      description: 'Main call-to-action button',
      blockType: 'button',
      category: 'cta',
      settings: {
        text: 'Shop Now',
        href: '/products',
        variant: 'primary',
        size: 'large',
        alignment: 'center',
        fullWidth: false
      }
    },
    {
      id: 'cta-secondary',
      name: 'Secondary CTA',
      description: 'Secondary action button',
      blockType: 'button',
      category: 'cta',
      settings: {
        text: 'Learn More',
        href: '/about',
        variant: 'outline',
        size: 'medium',
        alignment: 'center',
        fullWidth: false
      }
    },
    {
      id: 'cta-newsletter',
      name: 'Newsletter CTA',
      description: 'Newsletter subscription form',
      blockType: 'newsletter',
      category: 'cta',
      settings: {
        title: 'Join Our Newsletter',
        description: 'Get exclusive offers and updates',
        placeholder: 'Enter your email',
        buttonText: 'Join Now',
        layout: 'horizontal',
        backgroundColor: 'bg-blue-50',
        titleColor: 'text-blue-900',
        descriptionColor: 'text-blue-700'
      }
    }
  ]
};

// Helper function to get presets by category
export function getPresetsByCategory(category: string): BlockPreset[] {
  return BLOCK_PRESETS[category] || [];
}

// Helper function to get all presets
export function getAllPresets(): BlockPreset[] {
  return Object.values(BLOCK_PRESETS).flat();
}

// Helper function to get preset by ID
export function getPresetById(id: string): BlockPreset | null {
  const allPresets = getAllPresets();
  return allPresets.find(preset => preset.id === id) || null;
}

// Helper function to get presets by block type
export function getPresetsByBlockType(blockType: string): BlockPreset[] {
  const allPresets = getAllPresets();
  return allPresets.filter(preset => preset.blockType === blockType);
}

export default BLOCK_PRESETS;