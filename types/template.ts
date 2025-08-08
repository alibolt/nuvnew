import { Store, Theme, StoreSectionInstance, Product, Category, Page } from '@prisma/client';

// Template types following Shopify-like naming convention
export type TemplateType = 
  | 'homepage'
  | 'product.default'
  | 'product.alternate'
  | 'product.commerce'
  | 'product.detailed'
  | 'product.premium'
  | 'collection.default'
  | 'collection.grid'
  | 'collection.list'
  | 'collection.filtered'
  | 'page.default'
  | 'page.about'
  | 'page.contact'
  | 'page.faq'
  | 'page.terms'
  | 'page.privacy'
  | 'blog.default'
  | 'blog.grid'
  | 'blog.list'
  | 'article.default'
  | 'article.featured'
  | 'account.dashboard'
  | 'account.login'
  | 'account.register'
  | 'search'
  | 'cart'
  | '404'
  | '401'
  | '500';

// Extract base page type from template type
export type PageType = 'homepage' | 'product' | 'collection' | 'page' | 'blog' | 'article' | 'account' | 'search' | 'cart' | '404' | '401' | '500';

// Template settings that can be customized per template
export interface TemplateSettings {
  layout?: 'full-width' | 'container' | 'narrow';
  sidebar?: 'left' | 'right' | 'none';
  headerStyle?: 'default' | 'commerce' | 'transparent';
  footerStyle?: 'default' | 'commerce' | 'none';
  customCSS?: string;
  customJS?: string;
  [key: string]: any;
}

// SEO settings that can override defaults
export interface TemplateSeoSettings {
  titleTemplate?: string;
  descriptionTemplate?: string;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalUrl?: string;
  structuredData?: Record<string, any>;
}

// Extended template type with relations
export interface StoreTemplateWithRelations {
  id: string;
  storeId: string;
  themeId: string;
  templateType: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  enabled: boolean;
  settings: TemplateSettings | null;
  seoSettings: TemplateSeoSettings | null;
  createdAt: Date;
  updatedAt: Date;
  store: Store;
  theme: Theme;
  sections: StoreSectionInstance[];
  pages?: Page[];
  products?: Product[];
  categories?: Category[];
}

// Helper to extract page type from template type
export function getPageTypeFromTemplate(templateType: string): PageType {
  const [pageType] = templateType.split('.');
  return pageType as PageType;
}

// Helper to get template variant
export function getTemplateVariant(templateType: string): string {
  const parts = templateType.split('.');
  return parts[1] || 'default';
}

// Template creation input
export interface CreateTemplateInput {
  storeId: string;
  themeId: string;
  templateType: TemplateType | string;
  name: string;
  description?: string;
  isDefault?: boolean;
  enabled?: boolean;
  settings?: TemplateSettings;
  seoSettings?: TemplateSeoSettings;
}

// Section instance with template context
export interface SectionInstanceWithTemplate extends StoreSectionInstance {
  template: {
    id: string;
    templateType: string;
    name: string;
  };
}

// Template selector result
export interface TemplateSelectionResult {
  template: StoreTemplateWithRelations;
  isDefault: boolean;
  source: 'entity' | 'store-default' | 'theme-default';
}