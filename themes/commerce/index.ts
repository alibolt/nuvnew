// Commerce Pro Theme Configuration
const themeConfig = {
  name: 'Commerce Pro',
  version: '1.0.0',
  description: 'Professional e-commerce theme with advanced features',
  author: 'Nuvi',
  
  // Theme sections
  sections: {
    'header': () => import('./sections/header'),
    'hero-banner': () => import('./sections/hero-banner'),
    'hero': () => import('./sections/hero'),
    'featured-products': () => import('./sections/featured-products'),
    'best-sellers': () => import('./sections/best-sellers'),
    'collections': () => import('./sections/collections'),
    'product-categories': () => import('./sections/product-categories'),
    'testimonials': () => import('./sections/testimonials'),
    'newsletter': () => import('./sections/newsletter'),
    'footer': () => import('./sections/footer'),
    'announcement-bar': () => import('./sections/announcement-bar'),
    'image-with-text': () => import('./sections/image-with-text'),
    'instagram-feed': () => import('./sections/instagram-feed'),
    'contact-form': () => import('./sections/contact-form'),
    'cart': () => import('./sections/cart'),
    'checkout-form': () => import('./sections/checkout-form'),
    'login-form': () => import('./sections/login-form'),
    'register-form': () => import('./sections/register-form'),
    'logo-list': () => import('./sections/logo-list'),
    'order-summary': () => import('./sections/order-summary'),
    'payment-method': () => import('./sections/payment-method'),
    'product': () => import('./sections/product'),
    'product-recommendations': () => import('./sections/product-recommendations'),
    'recently-viewed': () => import('./sections/recently-viewed'),
    'related-products': () => import('./sections/related-products'),
    'rich-text': () => import('./sections/rich-text'),
    'shipping-methods': () => import('./sections/shipping-methods'),
  },
  
  // Theme blocks
  blocks: {
    'text': () => import('./blocks/text'),
    'button': () => import('./blocks/button'),
    'image': () => import('./blocks/image'),
  },
  
  // Theme settings schema
  settings: {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#0066FF',
      background: '#FFFFFF',
      text: '#333333',
      border: '#E5E5E5',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      baseFontSize: 16,
      headingSizes: {
        h1: 48,
        h2: 36,
        h3: 28,
        h4: 24,
        h5: 20,
        h6: 18
      }
    },
    layout: {
      containerWidth: 1280,
      gridColumns: 12,
      gridGap: 24,
      sectionPadding: {
        desktop: 80,
        mobile: 40
      }
    },
    buttons: {
      borderRadius: 4,
      padding: {
        x: 24,
        y: 12
      },
      fontSize: 16,
      fontWeight: 500
    },
    cards: {
      borderRadius: 8,
      padding: 24,
      shadow: 'sm'
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'ease-in-out'
    }
  }
};

// Export in the format expected by theme loader
export const sections = themeConfig.sections;
export const blocks = themeConfig.blocks;
export const settings = themeConfig.settings;

export const manifest = {
  name: themeConfig.name,
  version: themeConfig.version,
  settings: themeConfig.settings,
  supportedFeatures: ['cart', 'checkout', 'search', 'filters', 'wishlist']
};

export const config = {
  name: themeConfig.name,
  version: themeConfig.version,
  settings: themeConfig.settings,
  supportedFeatures: ['cart', 'checkout', 'search', 'filters', 'wishlist']
};

export function initTheme() {
  // Theme initialization logic if needed
}

export default themeConfig;