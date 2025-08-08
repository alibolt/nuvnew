// Page Template System - Shopify benzeri tema yapısı
// Her sayfa tipinin kendi section'ları ve ayarları olacak

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  defaultSettings: any;
  requiredData?: string[];
  seoDefaults?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Template kategorileri
export type PageTemplateCategory = 'product' | 'collection' | 'content' | 'system';

// Her tema için sayfa template'leri
export const pageTemplates: Record<PageTemplateCategory, PageTemplate[]> = {
  // Ürün sayfaları
  product: [
    {
      id: 'product',
      name: 'Product Page',
      description: 'Clean product page with flexible container-based layout',
      sections: [
        'product'
      ],
      defaultSettings: {
        'product': {
          containerWidth: 'default',
          paddingTop: 'medium',
          paddingBottom: 'medium'
        }
      },
      requiredData: ['product'],
      seoDefaults: {
        title: '{{product.title}} | {{store.name}}',
        description: '{{product.description}}',
      }
    }
  ],

  // Koleksiyon sayfaları  
  collection: [
    {
      id: 'collection-listing',
      name: 'All Collections',
      description: 'Page showing all available collections',
      sections: [
        'collection-header',
        'collection-grid'
      ],
      defaultSettings: {
        'collection-header': {
          title: 'Shop by Collection',
          subtitle: 'Discover our curated product collections'
        },
        'collection-grid': {
          columnsDesktop: 3,
          columnsTablet: 2,
          columnsMobile: 1,
          showDescription: true,
          showProductCount: true
        }
      },
      requiredData: ['collections'],
      seoDefaults: {
        title: 'Collections | {{store.name}}',
        description: 'Browse our product collections at {{store.name}}'
      }
    },
    {
      id: 'collection-products',
      name: 'Collection Products',
      description: 'Products within a specific collection',
      sections: [
        'collection-banner',
        'collection-filters',
        'collection-toolbar',
        'collection-products',
        'collection-pagination'
      ],
      defaultSettings: {
        'collection-banner': {
          showImage: true,
          showDescription: true,
          overlayEnabled: false
        },
        'collection-filters': {
          enabled: true,
          filterBy: ['price', 'vendor', 'size', 'color'],
          style: 'sidebar'
        },
        'collection-products': {
          productsPerPage: 24,
          columnsDesktop: 4,
          columnsTablet: 3,
          columnsMobile: 2,
          showQuickView: true
        }
      },
      requiredData: ['collection', 'products', 'filters'],
      seoDefaults: {
        title: '{{collection.title}} | {{store.name}}',
        description: '{{collection.description}}'
      }
    }
  ],

  // İçerik sayfaları
  content: [
    {
      id: 'search-results',
      name: 'Search Results',
      description: 'Search results page with filters',
      sections: [
        'search-header',
        'search-filters',
        'search-results',
        'search-suggestions'
      ],
      defaultSettings: {
        'search-header': {
          showResultCount: true,
          showQuery: true
        },
        'search-filters': {
          enabled: true,
          filterBy: ['type', 'price', 'vendor']
        },
        'search-results': {
          resultsPerPage: 24,
          columnsDesktop: 4,
          columnsMobile: 2
        }
      },
      requiredData: ['query', 'results', 'filters'],
      seoDefaults: {
        title: 'Search: {{query}} | {{store.name}}',
        description: 'Search results for {{query}} at {{store.name}}'
      }
    },
    {
      id: 'cart-page',
      name: 'Shopping Cart',
      description: 'Full cart page with recommendations',
      sections: [
        'cart-header',
        'cart-items',
        'cart-summary',
        'cart-recommendations',
        'cart-policies'
      ],
      defaultSettings: {
        'cart-items': {
          showProductImages: true,
          allowQuantityEdit: true,
          showRemoveButton: true
        },
        'cart-summary': {
          showShipping: true,
          showTax: true,
          showDiscount: true
        },
        'cart-recommendations': {
          title: 'You might also like',
          productCount: 4,
          algorithm: 'frequently-bought-together'
        }
      },
      requiredData: ['cartItems', 'totals'],
      seoDefaults: {
        title: 'Shopping Cart | {{store.name}}',
        description: 'Review your cart and checkout'
      }
    },
    {
      id: 'about-page',
      name: 'About Us',
      description: 'Company about page',
      sections: [
        'page-header',
        'about-hero',
        'about-story',
        'about-team',
        'about-values',
        'about-contact'
      ],
      defaultSettings: {
        'about-hero': {
          layout: 'centered',
          showImage: true
        },
        'about-team': {
          layout: 'grid',
          columnsDesktop: 3,
          showSocial: true
        }
      },
      requiredData: ['page'],
      seoDefaults: {
        title: 'About Us | {{store.name}}',
        description: 'Learn more about {{store.name}} and our story'
      }
    },
    {
      id: 'contact-page',
      name: 'Contact Us',
      description: 'Contact page with form and info',
      sections: [
        'page-header',
        'contact-hero',
        'contact-form',
        'contact-info',
        'contact-map',
        'contact-hours'
      ],
      defaultSettings: {
        'contact-form': {
          fields: ['name', 'email', 'subject', 'message'],
          showPhone: false,
          enableCaptcha: true
        },
        'contact-info': {
          showAddress: true,
          showPhone: true,
          showEmail: true,
          showSocial: true
        }
      },
      requiredData: ['page', 'store'],
      seoDefaults: {
        title: 'Contact Us | {{store.name}}',
        description: 'Get in touch with {{store.name}}'
      }
    }
  ],

  // Sistem sayfaları
  system: [
    {
      id: 'not-found',
      name: '404 Not Found',
      description: '404 error page',
      sections: [
        '404-hero',
        '404-suggestions',
        '404-search'
      ],
      defaultSettings: {
        '404-hero': {
          title: 'Page not found',
          subtitle: "The page you're looking for doesn't exist"
        },
        '404-suggestions': {
          showPopularProducts: true,
          showCollections: true
        }
      },
      requiredData: ['store'],
      seoDefaults: {
        title: 'Page Not Found | {{store.name}}',
        description: 'The page you are looking for was not found'
      }
    }
  ]
};

// Template'e göre sayfa oluşturma helper'ı
export function getPageTemplate(templateId: string): PageTemplate | undefined {
  for (const category of Object.values(pageTemplates)) {
    const template = category.find(t => t.id === templateId);
    if (template) return template;
  }
  return undefined;
}

// Tema için kullanılabilir template'leri getir
export function getTemplatesForTheme(themeCode: string): PageTemplate[] {
  // Şimdilik tüm template'leri döndür, gelecekte tema-specific olabilir
  return Object.values(pageTemplates).flat();
}

// SEO meta tag'lerini oluştur
export function generateSeoTags(
  template: PageTemplate, 
  data: any, 
  store: any
): { title: string; description: string; keywords?: string[] } {
  const seo = template.seoDefaults || {};
  
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\{\{store\.name\}\}/g, store.name || '')
      .replace(/\{\{product\.title\}\}/g, data.product?.title || '')
      .replace(/\{\{product\.description\}\}/g, data.product?.description || '')
      .replace(/\{\{collection\.title\}\}/g, data.collection?.title || '')
      .replace(/\{\{collection\.description\}\}/g, data.collection?.description || '')
      .replace(/\{\{query\}\}/g, data.query || '');
  };

  return {
    title: replacePlaceholders(seo.title || `{{store.name}}`),
    description: replacePlaceholders(seo.description || ''),
    keywords: seo.keywords
  };
}

// Sayfa verilerini doğrula
export function validatePageData(template: PageTemplate, data: any): boolean {
  if (!template.requiredData) return true;
  
  return template.requiredData.every(key => {
    const value = data[key];
    return value !== undefined && value !== null;
  });
}