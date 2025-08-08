# Schema Cleanup Guide

## Current Status

Schema files have been organized into two locations:
- `/lib/section-schemas/` - Platform level schemas (authentication, checkout, core forms)
- `/themes/commerce/schemas/` - Theme specific schemas (design and content sections)

## ✅ Files Already Moved to Theme (14 files)
These files have been successfully moved from lib to themes/commerce/schemas/:
- best-sellers.ts
- collection-list.ts
- contact-form.ts
- countdown.ts
- image-with-text.ts
- instagram-feed.ts
- logo-list.ts
- product-categories.ts
- product-recommendations.ts
- recently-viewed.ts
- related-products.ts
- rich-text.ts
- search-header.ts
- testimonials.ts

## 🗑️ Files to Delete from lib (23 files)
Run this single command to remove all unnecessary files:

```bash
cd /Users/ali/Desktop/nuvi-saas && rm -f lib/section-schemas/announcement-bar.ts lib/section-schemas/collections.ts lib/section-schemas/featured-products.ts lib/section-schemas/footer.ts lib/section-schemas/header.ts lib/section-schemas/hero-banner.ts lib/section-schemas/hero.ts lib/section-schemas/newsletter.ts lib/section-schemas/product.ts lib/section-schemas/best-sellers.ts lib/section-schemas/collection-list.ts lib/section-schemas/contact-form.ts lib/section-schemas/countdown.ts lib/section-schemas/image-with-text.ts lib/section-schemas/instagram-feed.ts lib/section-schemas/logo-list.ts lib/section-schemas/product-categories.ts lib/section-schemas/product-recommendations.ts lib/section-schemas/recently-viewed.ts lib/section-schemas/related-products.ts lib/section-schemas/rich-text.ts lib/section-schemas/search-header.ts lib/section-schemas/testimonials.ts
```

## ✅ Files to Keep in lib (7 files)
These are platform-level schemas that should remain:
- cart.ts (shopping cart functionality)
- checkout-form.ts (checkout process)
- login-form.ts (user authentication)
- order-summary.ts (order display)
- payment-method.ts (payment processing)
- register-form.ts (user registration)
- shipping-methods.ts (shipping options)

## After Cleanup
Update the theme's schemas/index.ts to export all schemas:
```typescript
// themes/commerce/schemas/index.ts
export { headerSchema } from './header';
export { footerSchema } from './footer';
// ... add all other schemas
```

## Update lib/section-schemas.ts
Remove imports for moved schemas and update builtInSchemas object to only include platform schemas.