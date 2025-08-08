# Content Translation Guide

## Overview
This guide explains how to translate dynamic content (products, pages, categories, blog posts) in your e-commerce store.

## Translation System Architecture

### 1. Database Structure
We've added translation tables for all content types:
- `ProductTranslation` - Product names, descriptions, SEO data
- `CategoryTranslation` - Category names and descriptions  
- `PageTranslation` - Page titles, content, SEO data
- `BlogPostTranslation` - Blog post titles, excerpts, content, SEO

### 2. Content Types

#### Products
Translatable fields:
- `name` - Product name
- `description` - Product description
- `metaTitle` - SEO title
- `metaDescription` - SEO description

#### Categories
Translatable fields:
- `name` - Category name
- `description` - Category description

#### Pages
Translatable fields:
- `title` - Page title
- `content` - Page content (HTML/Markdown)
- `seoTitle` - SEO title
- `seoDescription` - SEO description

#### Blog Posts
Translatable fields:
- `title` - Post title
- `excerpt` - Post excerpt/summary
- `content` - Post content
- `seoTitle` - SEO title
- `seoDescription` - SEO description

## Export/Import Workflow

### 1. Export Content for Translation

**API Endpoint:** `GET /api/stores/[subdomain]/content-translations/export`

This will download a CSV file with format:
```csv
Type,ID,Field,Language,Original,Translation
Product,abc123,name,en,"Cotton T-Shirt",""
Product,abc123,name,tr,"Cotton T-Shirt",""
Product,abc123,description,en,"Comfortable cotton t-shirt",""
Product,abc123,description,tr,"Comfortable cotton t-shirt",""
```

### 2. Fill in Translations

Open the CSV in Excel or Google Sheets and fill the "Translation" column:
```csv
Type,ID,Field,Language,Original,Translation
Product,abc123,name,en,"Cotton T-Shirt","Cotton T-Shirt"
Product,abc123,name,tr,"Cotton T-Shirt","Pamuklu Tişört"
Product,abc123,description,en,"Comfortable cotton t-shirt","Comfortable cotton t-shirt"
Product,abc123,description,tr,"Comfortable cotton t-shirt","Rahat pamuklu tişört"
```

### 3. Import Translations

**API Endpoint:** `POST /api/stores/[subdomain]/content-translations/import`

Upload the completed CSV file to import translations.

## API Usage

### Get Translations
```javascript
// Get all content translations
GET /api/stores/[subdomain]/content-translations

// Get specific type
GET /api/stores/[subdomain]/content-translations?type=products

// Get specific language
GET /api/stores/[subdomain]/content-translations?language=tr
```

### Save Translation
```javascript
POST /api/stores/[subdomain]/content-translations
{
  "contentType": "product",
  "contentId": "abc123",
  "language": "tr",
  "translations": {
    "name": "Pamuklu Tişört",
    "description": "Rahat pamuklu tişört"
  }
}
```

### Delete Translation
```javascript
DELETE /api/stores/[subdomain]/content-translations?id=translation123&type=product
```

## Frontend Implementation

### Using Translations in Theme

```tsx
// Product page example
const ProductPage = ({ product, locale }) => {
  // Get translation for current locale
  const translation = product.translations?.find(t => t.language === locale);
  
  return (
    <div>
      <h1>{translation?.name || product.name}</h1>
      <p>{translation?.description || product.description}</p>
    </div>
  );
};
```

### API Route to Get Translated Content
```typescript
// app/api/stores/[subdomain]/products/[slug]/route.ts
const product = await prisma.product.findFirst({
  where: { slug, storeId },
  include: {
    translations: {
      where: { language: locale }
    }
  }
});

// Return merged data
return {
  ...product,
  name: product.translations[0]?.name || product.name,
  description: product.translations[0]?.description || product.description
};
```

## Best Practices

### 1. Translation Keys
- Always maintain original content as fallback
- Use language codes consistently (ISO 639-1)
- Handle missing translations gracefully

### 2. SEO Considerations
- Translate meta titles and descriptions
- Use hreflang tags for different language versions
- Maintain URL structure consistency

### 3. Content Management
- Export regularly for translation updates
- Keep track of untranslated content
- Use translation memory tools for consistency

### 4. Performance
- Cache translated content
- Use database indexes on language fields
- Consider CDN for multilingual assets

## Integration with Theme Translations

Content translations work alongside theme translations:
- **Theme translations**: UI elements, buttons, labels
- **Content translations**: Product data, pages, blog posts

Both systems use the same language settings from the Languages page.

## Bulk Operations

### Export All Content
```bash
curl -X GET https://yourstore.com/api/stores/subdomain/content-translations/export \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o content-translations.csv
```

### Import Translations
```bash
curl -X POST https://yourstore.com/api/stores/subdomain/content-translations/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@translated-content.csv"
```

## Translation Progress Tracking

The system automatically calculates translation progress:
- Products: (translated fields / total fields) × 100
- Categories: (translated fields / total fields) × 100
- Pages: (translated fields / total fields) × 100
- Blog Posts: (translated fields / total fields) × 100

## Next Steps

1. Enable languages in Settings > Languages
2. Export content for translation
3. Translate content in CSV
4. Import completed translations
5. Test in your storefront

The translation system is designed to be flexible and scalable, supporting unlimited languages and content types.