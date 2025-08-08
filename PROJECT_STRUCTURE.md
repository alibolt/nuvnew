# Nuvi SaaS Project Structure

## Root Files
```
.eslintrc.json
.puppeteerrc.cjs
.gitignore
.env
.env.development
.env.example
.env.local
CLAUDE.md
README.md
CURRENCY_LANGUAGE_INTEGRATION_STATUS.md
DASHBOARD_ANALYSIS.md
Dockerfile.puppeteer
FIX_COMPLETE.md
FIX_THEME_SETTINGS.md
LOCALIZATION_INTEGRATION_PLAN.md
NUVIDESIGN_COMPONENTS.md
SCHEMA_CLEANUP_COMPLETE.md
SCHEMA_CLEANUP_GUIDE.md
middleware.ts
next.config.mjs
package.json
pnpm-lock.yaml
postcss.config.mjs
tailwind.config.ts
tsconfig.json
nuvi-checkout.tsx
check-images.mjs
```

## .vscode/
```
settings.json
```

## .claude/
```
settings.local.json
```

## app/ Structure

### (marketing)/
```
layout.tsx
page.tsx
about/page.tsx
beauty-cosmetics/page.tsx
blog/page.tsx
compare/page.tsx
contact/
  - contact-client.tsx
  - page.tsx
electronics-technology/page.tsx
enterprise/page.tsx
fashion-stores/page.tsx
features/page.tsx
food-beverage/page.tsx
health-wellness/page.tsx
pricing/page.tsx
privacy/page.tsx
start-free-trial/
  - page.tsx
  - start-free-trial-client.tsx
switch-from-shopify/
  - page.tsx
  - switch-from-shopify-client.tsx
terms/page.tsx
```

### admin/
```
dashboard.tsx
page.tsx
blog/
  - page.tsx
  - posts/[id]/edit/page.tsx
  - posts/new/page.tsx
email-packages/
  - page.tsx
  - analytics/
    - email-analytics-client.tsx
    - page.tsx
  - settings/page.tsx
finance/page.tsx
pricing/
  - page.tsx
  - [id]/edit/page.tsx
  - new/page.tsx
settings/page.tsx
stores/
  - page.tsx
  - [id]/page.tsx
users/
  - page.tsx
  - [id]/page.tsx
```

### api/ Structure
```
actions.ts
auth/
  - [...nextauth]/route.ts
  - check/route.ts
admin/
  - email-packages/route.ts
  - email-plans/route.ts
  - email-stats/route.ts
ai/
  - route.ts
  - actions/route.ts
  - chat/route.ts
  - groq/route.ts
  - insights/route.ts
  - product-description/route.ts
  - together/route.ts
  - translate/route.ts
blocks/
  - library/route.ts
  - library/[blockId]/route.ts
  - presets/route.ts
  - presets/[presetId]/route.ts
  - targeting/route.ts
cart/
  - items/route.ts
  - items/[variantId]/route.ts
checkout/route.ts
debug/
  - session/route.ts
  - stores/route.ts
debug-header/route.ts
debug-sections/[sectionId]/route.ts
google/callback/route.ts
orders/route.ts
placeholder/[width]/[height]/route.ts
register/route.ts
stores/route.ts
templates/route.ts
test-auth/route.ts
test-db/route.ts
test-nuvi-checkout/route.ts
test-theme-studio/route.ts
themes/
  - [themeId]/sections/route.ts
  - sections/route.ts
upload/route.ts
webhooks/
  - nuvi/route.ts
  - search-index/route.ts
  - stripe/route.ts
```

### api/stores/[subdomain]/ Structure
```
route.ts
abandoned-carts/
  - route.ts
  - [cartId]/recover/route.ts
activity-logs/route.ts
analytics/
  - route.ts
  - customers/route.ts
  - overview/route.ts
  - products/route.ts
  - search/route.ts
api-keys/route.ts
apps/
  - route.ts
  - available/route.ts
  - [appId]/route.ts
  - shopify-import/
    - analyze/route.ts
    - import-collections/route.ts
    - import-pages/route.ts
    - import-products/route.ts
    - import-store/route.ts
    - import-theme/route.ts
billing/route.ts
blog-posts/
  - route.ts
  - [postId]/route.ts
blogs/
  - route.ts
  - [blogId]/posts/route.ts
cache/clear/route.ts
categories/
  - route.ts
  - [categoryId]/route.ts
  - [categoryId]/products/route.ts
checkout/route.ts
collections/
  - route.ts
  - [handle]/route.ts
content-translations/
  - route.ts
  - export/route.ts
  - import/route.ts
currency/route.ts
customer-groups/
  - route.ts
  - assign/route.ts
  - pricing/route.ts
customers/
  - route.ts
  - [customerId]/route.ts
  - auth/
    - login/route.ts
    - logout/route.ts
    - me/route.ts
    - register/route.ts
discounts/
  - route.ts
  - apply/route.ts
  - usage/route.ts
  - validate/route.ts
domains/route.ts
email/
  - package/route.ts
  - settings/route.ts
  - test/route.ts
email-templates/route.ts
exports/route.ts
gdpr/route.ts
gift-cards/
  - route.ts
  - redeem/route.ts
  - settings/route.ts
  - validate/route.ts
global-sections/route.ts
google/
  - auth/route.ts
  - disconnect/route.ts
  - ads/configure/route.ts
  - analytics/configure/route.ts
  - business-profile/
    - configure/route.ts
    - verify/route.ts
  - merchant-center/
    - configure/route.ts
    - sync/route.ts
  - search-console/
    - configure/route.ts
    - verify/route.ts
imports/route.ts
inventory/route.ts
languages/route.ts
localization/
  - route.ts
  - auto-translate/route.ts
  - export/route.ts
  - import/route.ts
logo/
  - route.ts
  - debug/route.ts
marketing/
  - automations/
    - route.ts
    - [automationId]/route.ts
  - campaigns/
    - route.ts
    - [campaignId]/route.ts
    - [campaignId]/duplicate/route.ts
    - [campaignId]/send/route.ts
media/
  - route.ts
  - [mediaId]/route.ts
  - bulk/route.ts
  - upload/route.ts
menus/
  - route.ts
  - [menuId]/route.ts
  - by-handle/[handle]/route.ts
metafields/
  - route.ts
  - definitions/route.ts
monitoring/
  - alerts/route.ts
  - dashboard/route.ts
  - health/route.ts
  - performance/route.ts
newsletter/
  - subscribe/route.ts
  - subscribers/count/route.ts
orders/
  - route.ts
  - [orderId]/
    - route.ts
    - fulfill/route.ts
    - notifications/route.ts
    - refund/route.ts
    - returns/route.ts
    - status/route.ts
pages/
  - route.ts
  - [pageId]/route.ts
payment-intent/route.ts
payment-methods/route.ts
payments/route.ts
policies/route.ts
products/
  - route.ts
  - route.refactored.ts
  - bestsellers/route.ts
  - recommendations/route.ts
  - [productId]/
    - route.ts
    - reviews/route.ts
    - variants/
      - route.ts
      - [variantId]/route.ts
public/route.ts
returns/
  - route.ts
  - [returnId]/route.ts
reviews/
  - route.ts
  - public/route.ts
  - settings/route.ts
search/
  - route.ts
  - debug/route.ts
  - filters/route.ts
  - settings/route.ts
  - suggestions/route.ts
  - synonyms/route.ts
  - test/route.ts
  - index/
    - rebuild/route.ts
    - stats/route.ts
sections/
  - route.ts
  - available/route.ts
  - cleanup/route.ts
  - reorder/route.ts
  - [sectionId]/
    - route.ts
    - blocks/
      - route.ts
      - [blockId]/
        - route.ts
        - duplicate/route.ts
seo/
  - route.ts
  - robots/route.ts
  - sitemap/route.ts
settings/route.ts
shipping/
  - calculator/route.ts
  - test/route.ts
shipping-zones/route.ts
shipping/zones/route.ts
social-channels/
  - route.ts
  - callback/route.ts
staff/
  - route.ts
  - check-permission/route.ts
  - verify-access/route.ts
  - [staffId]/
    - route.ts
    - two-factor/route.ts
tax/calculate/route.ts
tax-settings/route.ts
templates/
  - route.ts
  - apply-preset/route.ts
  - cleanup/route.ts
  - sync/route.ts
  - by-type/[type]/route.ts
  - [templateId]/
    - route.ts
    - sections/
      - route.ts
      - [sectionId]/
        - route.ts
        - blocks/[blockId]/route.ts
theme-instance/
  - route.ts
  - settings/route.ts
theme-settings/route.ts
theme-studio/sections/route.ts
webhooks/route.ts
```

### checkout/
```
page.tsx
checkout-client.tsx
success/
  - page.tsx
  - success-client.tsx
```

### dashboard/
```
page.tsx
store-list.tsx
settings/
  - page.tsx
  - settings-content.tsx
```

### dashboard/stores/[subdomain]/ Structure
```
page.tsx
layout.tsx
dashboard-client.tsx
edit/
  - page.tsx
  - settings-form.tsx
analytics/
  - page.tsx
  - analytics-client.tsx
  - analytics-content.tsx
  - search-analytics.tsx
  - search/page.tsx
apps/
  - page.tsx
  - apps-content.tsx
  - app-store-modal.tsx
  - google-integration/
    - page.tsx
    - google-integration-client.tsx
    - components/
      - google-ads-tab.tsx
      - google-analytics-tab.tsx
      - google-business-profile-tab.tsx
      - google-merchant-center-tab.tsx
      - google-search-console-tab.tsx
  - shopify-import/
    - page.tsx
    - shopify-import-client.tsx
  - smart-search/
    - page.tsx
    - smart-search-client.tsx
    - components/
      - filter-configuration.tsx
      - index-management.tsx
      - search-analytics.tsx
      - search-preview.tsx
      - search-settings.tsx
      - synonym-manager.tsx
categories/
  - page.tsx
  - category-form.tsx
  - category-manager-v2.tsx
  - category-manager.tsx
  - category-manager-products-style.tsx
  - new/page.tsx
  - [categoryId]/edit/page.tsx
  - components/
    - condition-builder.tsx
    - product-selection-modal.tsx
components/
  - categories-tab-content.tsx
  - content-tab-content.tsx
  - media-tab-content.tsx
  - product-form-panel.tsx
  - products-tab-content.tsx
content/
  - page.tsx
  - blog-form.tsx
  - page-form.tsx
  - blogs/
    - page.tsx
    - blogs-manager.tsx
    - [blogId]/posts/
      - page.tsx
      - posts-manager.tsx
  - pages/
    - page.tsx
    - pages-manager.tsx
    - [pageId]/
      - page.tsx
      - page-editor.tsx
customers/
  - page.tsx
  - customer-form.tsx
  - customer-list.tsx
  - customers-content.tsx
  - [customerId]/
    - page.tsx
    - customer-detail-view.tsx
marketing/
  - page.tsx
  - marketing-content.tsx
orders/
  - page.tsx
  - order-list.tsx
  - order-status-badge.tsx
  - order-timeline.tsx
  - order-actions-menu.tsx
  - advanced-filters.tsx
  - email-button.tsx
  - notification-modal.tsx
  - [orderId]/
    - page.tsx
    - order-detail-view.tsx
  - analytics/
    - page.tsx
    - order-analytics-dashboard.tsx
  - create/
    - page.tsx
    - create-order-form.tsx
overview/
  - page.tsx
  - overview-content.tsx
products/
  - page.tsx
  - product-list.tsx
  - new/
    - page.tsx
    - product-form.tsx
  - [productId]/edit/page.tsx
returns/
  - page.tsx
  - returns-management.tsx
  - returns-analytics.tsx
  - create-return-modal.tsx
  - return-details-modal.tsx
settings/
  - page.tsx
  - settings-client.tsx
  - settings-navigation-unified.tsx
  - general-settings-form-v2.tsx
  - billing/
    - page.tsx
    - billing-form-v2.tsx
  - checkout/
    - page.tsx
    - checkout-form-v2.tsx
  - currency/
    - page.tsx
    - currency-form-v2.tsx
  - custom-data/
    - page.tsx
    - custom-data-form-v2.tsx
  - domains/
    - page.tsx
    - domains-form-v2.tsx
  - emails/
    - page.tsx
    - email-settings-form.tsx
    - email-package-manager.tsx
  - gift-cards/
    - page.tsx
    - gift-cards-form-v2.tsx
  - languages/
    - page.tsx
    - languages-form-v2.tsx
  - locations/
    - page.tsx
    - locations-form-v2.tsx
  - payments/
    - page.tsx
    - payments-form-v2.tsx
  - plan/
    - page.tsx
    - plan-form-v2.tsx
  - policies/
    - page.tsx
    - policies-form-v2.tsx
  - shipping/
    - page.tsx
    - shipping-form-v2.tsx
  - store-details/
    - page.tsx
    - store-details-form-v2.tsx
  - taxes/
    - page.tsx
    - taxes-form-v2.tsx
  - users/
    - page.tsx
    - users-form-v2.tsx
templates/
  - page.tsx
  - templates-client.tsx
theme-settings/
  - page.tsx
  - theme-settings-client.tsx
  - components/global-theme-settings.tsx
theme-studio/
  - page.tsx
  - theme-studio-next.tsx
  - theme-studio-fixes.css
  - debug-panel.tsx
  - components/
    - enhanced-block-item.tsx
    - google-font-picker.tsx
    - history-panel.tsx
    - nested-sortable-block.tsx
    - preview-frame-next.tsx
    - section-inspector.tsx
    - section-item-minimal.tsx
    - section-list-inline.tsx
    - sortable-block-with-container.tsx
    - theme-inspector.tsx
  - hooks/
    - use-drag-state.ts
    - use-editor-state.ts
    - use-history.ts
    - use-nested-blocks.ts
    - use-pages-state.ts
    - use-realtime-sections.ts
    - use-sections-state.ts
    - use-theme-studio-state.ts
    - use-ui-state.ts
  - utils/
    - block-helpers.ts
    - nested-blocks.ts
themes/page.tsx
```

### dashboard/stores/new/
```
page.tsx
create-store-form.tsx
```

### dashboard/stores/backup-storeId/
```
theme-settings/
  - page.tsx
  - theme-settings-client.tsx
  - components/global-theme-settings.tsx
```

### dashboard/stores/backup-storeId-20250808-1705/
```
[Full backup of old storeId structure - contains all old files]
```

### dashboard/stores/backup-storeId-20250808-1707/
```
[Full backup of old API routes - contains all old API files]
```

### s/[subdomain]/ Structure
```
layout.tsx
page.tsx
page-renderer.tsx
page-with-global-sections.tsx
section-renderer.tsx
template-renderer.tsx
theme-provider.tsx
product-grid.tsx
cart-button.tsx
cart-drawer.tsx
account/
  - page.tsx
  - login/page.tsx
  - register/page.tsx
  - forgot-password/page.tsx
  - reset-password/page.tsx
  - addresses/page.tsx
  - orders/
    - page.tsx
    - [orderId]/page.tsx
  - preview/page.tsx
cart/
  - page.tsx
  - preview/page.tsx
checkout/
  - page.tsx
  - section-based/page.tsx
collections/
  - page.tsx
  - [categorySlug]/page.tsx
  - all/preview/page.tsx
pages/
  - [slug]/page.tsx
  - sample/preview/page.tsx
preview/
  - page.tsx
  - realtime-preview-wrapper.tsx
products/
  - [productSlug]/page.tsx
  - sample-product/preview/page.tsx
  - latest/preview/page.tsx
search/
  - page.tsx
  - preview/page.tsx
themes/
  - commerce/
    - blocks/
      - button.tsx
      - image.tsx
      - text.tsx
    - sections/
      - announcement-bar.tsx
      - best-sellers.tsx
      - cart.tsx
      - checkout-form.tsx
      - collections.tsx
      - contact-form.tsx
      - featured-products.tsx
      - footer.tsx
      - header.css
      - header.tsx
      - hero-banner.tsx
      - hero.tsx
      - image-with-text.tsx
      - instagram-feed.tsx
      - login-form.tsx
      - logo-list.tsx
      - logo.css
      - newsletter.tsx
      - order-summary.tsx
      - payment-method.tsx
      - product-categories.tsx
      - product-recommendations.tsx
      - product.tsx
      - recently-viewed.tsx
      - register-form.tsx
      - related-products.tsx
      - rich-text.tsx
      - shipping-methods.tsx
      - testimonials.tsx
    - utils/
      - helpers.ts
      - layout.ts
      - styles.ts
  - minimal/
    - footer.tsx
    - header.tsx
    - hero.tsx
    - product-gallery.tsx
    - product-info.tsx
    - product-main.tsx
    - product-recommendations.tsx
```

### login/
```
page.tsx
```

### providers.tsx

### globals.css

### layout.tsx

### not-found.tsx

### favicon.ico

## components/ Structure
```
admin/
  - admin-dashboard-content.tsx
  - platform-blog-list.tsx
  - platform-blog-post-form.tsx
  - platform-settings-form.tsx
  - pricing-plan-form.tsx
  - pricing-plans-list.tsx
  - store-details.tsx
  - stores-list.tsx
  - user-details.tsx
  - users-list.tsx
analytics/
  - device-card.tsx
  - keyword-card.tsx
  - location-card.tsx
  - page-card.tsx
  - performance-card.tsx
  - product-card.tsx
  - realtime-card.tsx
  - referrer-card.tsx
  - time-card.tsx
  - traffic-card.tsx
category/
  - category-breadcrumb.tsx
  - category-card.tsx
  - category-filters.tsx
  - category-grid.tsx
  - category-page.tsx
dashboard/
  - dashboard-shell.tsx
  - dashboard-wrapper.tsx
editor/
  - rich-text-editor.tsx
extension/
  - extension-details.tsx
  - extension-list.tsx
  - extension-settings.tsx
layout/
  - header-menu.tsx
  - header.tsx
  - page-transition.tsx
marketing/
  - cta-section.tsx
  - feature-card.tsx
  - hero-section.tsx
  - pricing-card.tsx
  - stats-section.tsx
  - template-showcase.tsx
  - testimonial-card.tsx
media/
  - media-edit-form.tsx
  - media-library.tsx
  - media-upload.tsx
menu/
  - menu-builder.tsx
  - menu-item.tsx
navigation/
  - nested-menu-item-compact.tsx
  - nested-menu-item.tsx
  - nested-menu-manager.tsx
  - simple-menu-manager.tsx
  - sortable-menu-item.tsx
product/
  - ai-description-generator.tsx
  - price-display.tsx
  - product-card.tsx
  - product-form.tsx
  - product-grid.tsx
  - product-preview.tsx
  - product-slider.tsx
  - variant-selector.tsx
search/
  - search-bar.tsx
  - search-facets.tsx
  - search-filters.tsx
  - search-pagination.tsx
  - search-provider.tsx
  - search-refinements.tsx
  - search-results.tsx
  - search-results-card.tsx
  - search-results-grid.tsx
  - search-results-list.tsx
  - search-sort-dropdown.tsx
store/
  - store-footer.tsx
  - store-header.tsx
template/
  - template-preview.tsx
theme-button.tsx
theme-styles-provider.tsx
ui/
  - accordion.tsx
  - alert-dialog.tsx
  - alert.tsx
  - aspect-ratio.tsx
  - avatar.tsx
  - badge.tsx
  - button.tsx
  - calendar.tsx
  - card.tsx
  - carousel.tsx
  - chart.tsx
  - checkbox.tsx
  - collapsible.tsx
  - color-picker.tsx
  - command.tsx
  - confirmation-modal.tsx
  - context-menu.tsx
  - dialog.tsx
  - drawer.tsx
  - dropdown-menu.tsx
  - enhanced-typography-picker.tsx
  - form.tsx
  - hover-card.tsx
  - image-picker-modal.tsx
  - input.tsx
  - label.tsx
  - menubar.tsx
  - navigation-menu.tsx
  - popover.tsx
  - progress.tsx
  - radio-group.tsx
  - resizable.tsx
  - scroll-area.tsx
  - select.tsx
  - separator.tsx
  - sheet.tsx
  - skeleton.tsx
  - slider.tsx
  - sonner.tsx
  - switch.tsx
  - table.tsx
  - tabs.tsx
  - textarea.tsx
  - toast.tsx
  - toaster.tsx
  - toggle-group.tsx
  - toggle.tsx
  - tooltip.tsx
  - use-toast.ts
```

## contexts/
```
product-context.tsx
```

## docs/
```
PRODUCT_DETAIL_STRUCTURE.md
PRODUCT_GALLERY_IMPROVEMENTS.md
PRODUCT_PAGE_FLOW.md
THEME_DEVELOPMENT_GUIDE.md
THEME_FONT_IMPLEMENTATION.md
product-variant-system-guide.md
theme-studio-analysis.md
```

## hooks/
```
use-blocks.ts
use-cart.ts
use-debounce.ts
use-loading-state.ts
use-media-query.ts
use-mobile.ts
use-product.ts
use-search.ts
use-seo.ts
use-sidebar.ts
use-store.ts
use-theme.ts
```

## lib/ Structure
```
api/
  - auth.ts
  - database.ts
  - response.ts
  - validation.ts
auth.ts
block-configs.ts
block-defaults.ts
block-library.ts
block-presets.ts
block-styles.ts
block-targeting.ts
block-types.ts
commerce-types.ts
currency.ts
design-system/
  - index.css
dynamic-block-options.ts
email/
  - resend-service.ts
  - send-email.ts
fonts.ts
google-fonts-list.ts
image-downloader.ts
metafields.ts
metaobjects.ts
nuvi-checkout.ts
order-utils.ts
payment-provider.ts
pricing.ts
prisma-client.ts
prisma.ts
product-block-structure.ts
section-presets.ts
section-schemas.ts
section-schemas/
  - cart.ts
  - checkout-form.ts
  - login-form.ts
  - order-summary.ts
  - payment-method.ts
  - register-form.ts
  - shipping-methods.ts
seo.ts
services/
  - collection-matcher.ts
  - global-sections-loader.ts
  - logo-sync-service.ts
  - theme-instance-migration.ts
  - theme-loader.ts
shopify-theme-mapper.ts
simplified-block-settings.ts
stores.ts
templates.ts
theme-button-styles.ts
theme-colors.ts
theme-defaults.ts
theme-loader.ts
theme-typography.ts
unified-search.ts
utils.ts
```

## nuvi-destek/
```
benioku.md
```

## prisma/
```
schema.prisma
dev.db
```

## public/
```
logo.svg
manifest.json
nuvi-banner.svg
nuvi-icon.svg
nuvi-logo.svg
placeholder-category.svg
placeholder-image.svg
placeholder-product.svg
themes/
  - commerce/theme.json
  - minimal/preview.svg
uploads/
```

## scripts/
```
generate-sitemaps.mjs
optimize-images.mjs
```

## styles/
```
admin.css
blocks.css
commerce.css
components.css
dashboard.css
globals.css
marketing.css
minimal.css
nuvi-checkout.css
shopify-dawn.css
theme-core.css
theme-studio.css
theme-variables.css
themes.css
```

## themes/commerce/
```
index.ts
blocks/
  - button.tsx
  - image.tsx
  - text.tsx
sections/
  - announcement-bar.tsx
  - best-sellers.tsx
  - cart.tsx
  - checkout-form.tsx
  - collections.tsx
  - contact-form.tsx
  - featured-products.tsx
  - footer.tsx
  - header.tsx
  - hero-banner.tsx
  - hero.tsx
  - image-with-text.tsx
  - instagram-feed.tsx
  - login-form.tsx
  - logo-list.tsx
  - newsletter.tsx
  - order-summary.tsx
  - payment-method.tsx
  - product-categories.tsx
  - product-recommendations.tsx
  - product.tsx
  - recently-viewed.tsx
  - register-form.tsx
  - related-products.tsx
  - rich-text.tsx
  - shipping-methods.tsx
  - testimonials.tsx
styles/
  - theme-styles.js
templates/
  - 404.json
  - cart.json
  - collection.json
  - homepage.json
  - page.json
  - product.json
  - search.json
theme.json
```

## types/
```
admin.ts
app.ts
blocks.ts
category.ts
checkout.ts
custom-data.ts
customer.ts
database.ts
discount.ts
email.ts
google.ts
localization.ts
marketing.ts
media.ts
menu.ts
metafield.ts
metaobject.ts
next-auth.d.ts
nuvi-checkout.ts
order.ts
page.ts
payment.ts
product.ts
search.ts
section.ts
seo.ts
shopify.ts
store.ts
templates.ts
theme.ts
user.ts
```

## Total Project Statistics:
- **Main Directories**: 15+ major directories
- **API Routes**: 200+ endpoints
- **React Components**: 150+ components
- **TypeScript Types**: 30+ type definition files
- **Themes**: 2 (Commerce Pro, Minimal)
- **Theme Sections**: 27 sections
- **UI Components**: 50+ reusable UI components
- **Dashboard Pages**: 50+ admin pages
- **Store Front Pages**: 20+ customer-facing pages

## Key Features:
- Multi-tenant SaaS architecture
- Theme customization system
- E-commerce functionality
- Analytics dashboard
- Email marketing
- SEO optimization
- Multi-language support
- Payment integration (Stripe)
- Shopify import
- Google integrations
- Smart search with AI
- Product management
- Order management
- Customer management
- Marketing automation
```