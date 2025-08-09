// Base Theme Entry Point
export const theme = {
  name: 'Base Theme',
  code: 'base',
  version: '1.0.0',
  
  // Lazy load sections
  sections: {
    header: () => import('./sections/header'),
    hero: () => import('./sections/hero'),
    categories: () => import('./sections/categories'),
    'product-grid': () => import('./sections/product-grid'),
    'product-detail': () => import('./sections/product-detail'),
    cart: () => import('./sections/cart'),
    'search-results': () => import('./sections/search-results'),
    features: () => import('./sections/features'),
    testimonials: () => import('./sections/testimonials'),
    cta: () => import('./sections/cta'),
    footer: () => import('./sections/footer'),
  },
  
  // Lazy load blocks
  blocks: {
    button: () => import('./blocks/button'),
    'product-card': () => import('./blocks/product-card'),
    'category-card': () => import('./blocks/category-card'),
    'feature-card': () => import('./blocks/feature-card'),
    'testimonial-card': () => import('./blocks/testimonial-card'),
    text: () => import('./blocks/text'),
    image: () => import('./blocks/image'),
    logo: () => import('./blocks/logo'),
    navigation: () => import('./blocks/navigation'),
    'search-bar': () => import('./blocks/search-bar'),
  },
  
  // Theme schemas for Theme Studio
  schemas: {
    sections: () => import('./schemas/sections'),
    blocks: () => import('./schemas/blocks'),
  }
};

export default theme;