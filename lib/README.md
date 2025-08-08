# /lib Directory Structure

This directory contains shared utilities, services, and configurations for the Nuvi SaaS application.

## Directory Organization

### Core Services
- `prisma.ts` - Prisma client singleton
- `prisma-client.ts` - Client-safe Prisma stub for browser
- `auth-options.ts` - NextAuth configuration
- `auth.ts` - Authentication utilities
- `stripe.ts` - Stripe configuration

### API Utilities
- `api/` - API-related utilities
  - `response.ts` - Standardized API responses
  - `auth.ts` - API authentication helpers
  - `database.ts` - Database utilities
  - `validation.ts` - Request validation

### Block System
- `block-types.ts` - All block type definitions (~4000 lines)
- `block-configs.ts` - Block configuration helpers
- `block-defaults.ts` - Default block settings
- `block-library.ts` - Block library management
- `block-presets.ts` - Pre-configured block combinations
- `block-styles.ts` - Block styling utilities
- `block-targeting.ts` - Block targeting rules
- `dynamic-block-options.ts` - Dynamic block options
- `simplified-block-settings.ts` - Simplified block settings

### Section System
- `section-schemas.ts` - Section schema definitions
- `section-schemas/` - Individual section schemas
- `section-settings/` - Section setting utilities
  - `base.ts` - Base section settings
  - `header.ts` - Header section settings
  - `hero.ts` - Hero section settings
  - `schema.ts` - Settings schema definitions
- `section-presets.ts` - Pre-configured sections

### Theme System
- `theme-utils.ts` - Theme utilities and CSS variables
- `theme-global-styles.tsx` - Global theme styles
- `theme-font-loader.tsx` - Font loading utilities
- `theme-button-styles.ts` - Button style utilities
- `theme-icons.tsx` - Icon components
- `theme-loader.ts` - Theme loading service

### Template System
- `templates.ts` - Template definitions
- `template-presets.ts` - Template preset definitions
- `template-presets/` - Individual preset files
  - `modern-fashion.ts`
  - `tech-electronics.ts`
  - `luxury-fashion.ts`

### Services
- `services/`
  - `hybrid-template-loader.ts` - Template loading service
  - `global-sections-loader.ts` - Global section loader
  - `search-indexing.service.ts` - Search indexing service
  - `search-index-trigger.ts` - Search index update triggers
  - `search-synonym-expansion.ts` - Search synonym expansion
  - `collection-matcher.ts` - Collection matching
  - `logo-sync-service.ts` - Logo synchronization
  - `template-service.ts` - Template management
  - `shopify-scraper-basic.ts` - Shopify data scraping

### Utilities
- `utils.ts` - General utilities (cn, formatters)

### Context Providers
- `cart-context.tsx` - Shopping cart context
- `customer-context.tsx` - Customer context

### Other Utilities
- `constants.ts` - Application constants
- `price-utils.ts` - Price formatting utilities
- `seo-utils.ts` - SEO utilities
- `search-utils.ts` - Search utilities
- `stores.ts` - Store utilities
- `subdomains.ts` - Subdomain handling

### Design System
- `design-system/`
  - `colors.ts` - Color definitions
  - `typography.ts` - Typography settings
  - `spacing.ts` - Spacing system
  - `buttons.ts` - Button styles
  - `z-index.ts` - Z-index management

### Email
- `email/`
  - `resend-service.ts` - Resend email service
  - `send-email.ts` - Email sending utilities

### External Services
- `google-fonts-list.ts` - Google Fonts list
- `redis.ts` & `redis-mock.ts` - Redis configuration

### Hooks
- `hooks/`
  - `use-search-indexing.ts` - Search indexing hook
- `use-intersection-observer.ts` - Intersection observer hook

### Middleware
- `middleware/`
  - `check-search-app.ts` - Search app middleware

## Notes

- Keep files focused on a single responsibility
- Use TypeScript for type safety
- Follow existing naming conventions
- Add tests for new utilities
- Document complex functions