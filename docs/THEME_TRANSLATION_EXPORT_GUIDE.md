# Theme Translation Export Guide

## Overview
Export translations feature now includes theme translation keys automatically. This ensures your Commerce theme can be fully translated.

## How It Works

### 1. Regular Export (Export Translations Button)
When you click "Export Translations":
- If translations exist in the database, they will be exported
- If NO translations exist yet, the system automatically includes ALL theme translation keys as a template
- This includes 250+ translation keys from the Commerce theme

### 2. Theme Template Export (Export Theme Template Button)
This specialized button:
- Always exports a complete theme translation template
- Includes all Commerce theme keys organized by namespace
- Provides English defaults and placeholders for other languages
- Adds helpful descriptions for translators

## Export Format

### Regular Export CSV:
```csv
Language,Namespace,Key,Value
en,common,add_to_cart,"Add to Cart"
tr,common,add_to_cart,"[TR] Add to Cart"
es,common,add_to_cart,"[ES] Add to Cart"
```

### Theme Template CSV:
```csv
Language,Namespace,Key,Value,Description
en,common,add_to_cart,"Add to Cart","Default"
tr,common,add_to_cart,"","Translate: Add to Cart"
es,common,add_to_cart,"","Translate: Add to Cart"
```

## Translation Namespaces

The Commerce theme uses these namespaces:
- `common` - General UI elements (buttons, navigation)
- `cart` - Shopping cart functionality
- `product` - Product pages and details
- `collection` - Category and collection pages
- `account` - User account management
- `checkout` - Checkout process
- `footer` - Footer content
- `search` - Search functionality
- `forms` - Form validations and messages
- `errors` - Error messages
- `promotions` - Promotional content

## Workflow

1. **Initial Setup**
   - Enable languages in Language Settings
   - Click "Export Translations" or "Export Theme Template"
   - You'll get a CSV with all theme keys

2. **Translation Process**
   - Open CSV in spreadsheet software
   - Fill in translations for each language
   - Save as CSV (UTF-8 encoding)

3. **Import Back**
   - Click "Import Translations"
   - Upload your translated CSV
   - Theme will immediately use new translations

4. **Theme Integration**
   The theme automatically uses translations via:
   ```tsx
   const { t } = useTranslation();
   return <button>{t('add_to_cart', 'common')}</button>;
   ```

## Example Theme Components Using Translations

### Cart Component
```tsx
// Shows "Your cart is empty" in selected language
{settings.emptyCartMessage || t('cart_empty', 'cart')}
```

### Header Component
Already prepared with translation hook import, ready for implementation.

### Product Component
Ready for translation implementation with all necessary keys defined.

## Tips

1. **Start with Core Components**
   - Header/Footer (visible on all pages)
   - Cart/Checkout (critical for conversion)
   - Product pages (most visited)

2. **Use Placeholders**
   - For untranslated content, use `[LANG] Original Text`
   - This makes it easy to spot untranslated content

3. **Test Thoroughly**
   - Switch languages in your store
   - Check all pages and components
   - Verify fallbacks work correctly

## Current Status

✅ Translation system implemented
✅ Theme translation keys defined (250+ keys)
✅ Export includes theme translations
✅ Import/Export fully functional
✅ Cart component uses translations
🔄 Other theme components ready for translation implementation

## Next Steps

To fully translate your theme:
1. Export theme template
2. Translate all keys
3. Import translations
4. Test in your store

The system is designed to be progressive - you can translate components one at a time while maintaining functionality.