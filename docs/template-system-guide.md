# Store Template System Guide

## Overview

The new template system enables Shopify-like flexibility where each page type can have multiple templates, and each template can have its own section configuration. This allows stores to have different layouts for different products, collections, or pages.

## Key Concepts

### 1. StoreTemplate
A template defines the structure and sections for a specific page type in a store.

- **templateType**: Identifies the page type (e.g., `product.default`, `product.alternate`, `collection.grid`, `page.about`)
- **name**: User-friendly name for the template
- **isDefault**: Whether this is the default template for its type
- **sections**: The sections that make up this template

### 2. Template Types

Templates follow a naming convention: `{pageType}.{variant}`

Examples:
- `homepage` - Main homepage
- `product.default` - Default product page
- `product.minimal` - Minimal product page layout
- `product.detailed` - Detailed product page with extra sections
- `collection.default` - Default collection page
- `collection.grid` - Grid-focused collection layout
- `collection.list` - List-style collection layout
- `page.default` - Default content page
- `page.about` - About us page template
- `page.contact` - Contact page template

### 3. Template Assignment

Templates can be assigned at different levels:
- **Store Level**: Default templates for each page type
- **Entity Level**: Specific products, categories, or pages can override the default

## Database Schema Changes

### New Models

```prisma
model StoreTemplate {
  id           String                 @id
  storeId      String
  themeId      String
  templateType String                 // e.g., "product.default"
  name         String                 // e.g., "Default Product"
  description  String?
  isDefault    Boolean                @default(false)
  enabled      Boolean                @default(true)
  settings     Json?                  // Template-specific settings
  seoSettings  Json?                  // SEO overrides
  sections     StoreSectionInstance[] // Sections in this template
}

model StoreSectionInstance {
  id          String         @id
  templateId  String         // Links to StoreTemplate instead of Store
  sectionType String
  position    Int
  enabled     Boolean
  settings    Json
}
```

### Updated Models

- **Product**: Added `templateId` field for template override
- **Category**: Added `templateId` field for template override
- **Page**: Added `templateId` field for template override
- **Store**: Removed `homepageSections`, added `templates` relation

## Usage Examples

### 1. Creating a New Template

```typescript
const newTemplate = await prisma.storeTemplate.create({
  data: {
    storeId: 'store123',
    themeId: 'theme456',
    templateType: 'product.premium',
    name: 'Premium Product Layout',
    description: 'Enhanced layout for premium products',
    isDefault: false,
    enabled: true,
    settings: {
      showReviews: true,
      showRelatedProducts: true,
      galleryStyle: 'carousel'
    }
  }
});
```

### 2. Adding Sections to a Template

```typescript
const sections = [
  { type: 'product-gallery', position: 1, settings: { style: 'carousel' } },
  { type: 'product-info', position: 2, settings: { showSku: true } },
  { type: 'product-reviews', position: 3, settings: { limit: 10 } },
  { type: 'related-products', position: 4, settings: { count: 8 } }
];

for (const section of sections) {
  await prisma.storeSectionInstance.create({
    data: {
      templateId: newTemplate.id,
      sectionType: section.type,
      position: section.position,
      enabled: true,
      settings: section.settings
    }
  });
}
```

### 3. Assigning a Template to a Product

```typescript
await prisma.product.update({
  where: { id: 'product123' },
  data: { templateId: 'template456' }
});
```

### 4. Getting the Template for a Page

```typescript
async function getTemplateForProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      template: {
        include: {
          sections: {
            where: { enabled: true },
            orderBy: { position: 'asc' }
          }
        }
      },
      store: {
        include: {
          templates: {
            where: {
              templateType: 'product.default',
              isDefault: true
            }
          }
        }
      }
    }
  });

  // Use product's specific template or fall back to store's default
  return product.template || product.store.templates[0];
}
```

## Migration Path

1. Run the migration script to create default templates for existing stores
2. Existing homepage sections will be migrated to the homepage template
3. Products and categories will be assigned default templates
4. Gradually create new templates as needed

## Benefits

1. **Flexibility**: Different products can have completely different layouts
2. **Reusability**: Templates can be shared across multiple entities
3. **Theme Independence**: Templates are tied to themes but customizable per store
4. **Better Organization**: Sections are grouped by template rather than mixed together
5. **Shopify-like Experience**: Familiar pattern for users coming from Shopify

## Best Practices

1. Always create default templates for core page types
2. Use descriptive template names and types
3. Consider SEO implications when creating templates
4. Test templates thoroughly before making them default
5. Document which sections are required vs optional for each template type