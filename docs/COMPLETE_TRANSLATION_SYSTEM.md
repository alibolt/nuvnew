# Complete Translation System Overview

## 🌐 System Components

### 1. Theme Translations (Static UI)
Handles all static text in your theme:
- Buttons, labels, navigation
- Error messages, form validations
- Shopping cart, checkout text
- 250+ predefined translation keys

### 2. Content Translations (Dynamic Data)
Handles all dynamic content from database:
- **Products**: names, descriptions, SEO metadata
- **Categories**: names, descriptions
- **Pages**: titles, content, SEO metadata
- **Blog Posts**: titles, excerpts, content, SEO

## 📁 Database Structure

### Translation Tables Added:
```prisma
ProductTranslation {
  productId, language, name, description, 
  metaTitle, metaDescription
}

CategoryTranslation {
  categoryId, language, name, description
}

PageTranslation {
  pageId, language, title, content,
  seoTitle, seoDescription
}

BlogPostTranslation {
  blogPostId, language, title, excerpt, content,
  seoTitle, seoDescription
}

Translation {
  storeId, language, namespace, key, value
  (for theme/UI translations)
}
```

## 🔄 Translation Workflow

### Step 1: Enable Languages
Settings > Languages > Add languages you want to support

### Step 2: Export Translations
Three export options available:
1. **Export Theme Translations** - UI elements (buttons, labels)
2. **Export Theme Template** - Empty template with all keys
3. **Export Content Translations** - Products, pages, categories

### Step 3: Translate
Open CSV in Excel/Google Sheets and fill translations

### Step 4: Import
Upload completed CSV files back to the system

## 📊 Export/Import Formats

### Theme Translation CSV:
```csv
Language,Namespace,Key,Value
en,common,add_to_cart,"Add to Cart"
tr,common,add_to_cart,"Sepete Ekle"
```

### Content Translation CSV:
```csv
Type,ID,Field,Language,Original,Translation
Product,abc123,name,tr,"Cotton T-Shirt","Pamuklu Tişört"
Product,abc123,description,tr,"Comfortable cotton","Rahat pamuklu"
```

## 🛠 API Endpoints

### Theme Translations
- `GET /api/stores/[subdomain]/languages` - Get translations
- `POST /api/stores/[subdomain]/languages` - Save translations

### Content Translations
- `GET /api/stores/[subdomain]/content-translations` - Get content
- `POST /api/stores/[subdomain]/content-translations` - Save translation
- `GET /api/stores/[subdomain]/content-translations/export` - Export CSV
- `POST /api/stores/[subdomain]/content-translations/import` - Import CSV

## 🎨 Frontend Usage

### Theme Components
```tsx
import { useTranslation } from '@/lib/hooks/use-translations';

function CartComponent() {
  const { t } = useTranslation();
  
  return (
    <button>{t('add_to_cart', 'common')}</button>
  );
}
```

### Content Display
```tsx
// Automatically uses translation based on current locale
const product = await getProduct(slug, locale);

// Returns translated content if available, 
// falls back to original if not
return {
  name: product.translations[0]?.name || product.name,
  description: product.translations[0]?.description || product.description
};
```

## 🚀 Quick Start

1. **For Theme Translations:**
   - Click "Export Theme Template"
   - Fill translations for your languages
   - Import back
   - Theme automatically uses translations

2. **For Content Translations:**
   - Add your products/pages/categories
   - Click "Export Content Translations"
   - Translate in CSV
   - Import back
   - Content displays in selected language

## ✅ What's Implemented

- ✅ Complete translation database schema
- ✅ Theme translation system (250+ keys)
- ✅ Content translation system (products, categories, pages, blogs)
- ✅ Export/Import functionality for both systems
- ✅ Language switcher component
- ✅ Automatic locale detection
- ✅ Translation context and hooks
- ✅ API endpoints for all operations
- ✅ UI in Languages settings page

## 🔮 Future Enhancements

- AI-powered automatic translations
- Translation memory for consistency
- Real-time collaborative translation
- Translation progress tracking
- Version control for translations
- A/B testing for different translations

## 📚 Documentation

- Theme Translation Guide: `/docs/COMMERCE_THEME_TRANSLATION_GUIDE.md`
- Content Translation Guide: `/docs/CONTENT_TRANSLATION_GUIDE.md`
- Theme Export Guide: `/docs/THEME_TRANSLATION_EXPORT_GUIDE.md`

The system is designed to be progressive - you can start with basic translations and expand over time.