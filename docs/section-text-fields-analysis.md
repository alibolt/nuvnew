# Section Text Fields Analysis - Minimal Theme

## Overview
This document analyzes all sections in the minimal theme and their text fields to identify duplicates and understand the data structure.

## Data Structure
- All text fields are saved in `section.settings` object
- Fields are accessed via `section.settings[fieldName]`
- The section-inspector-v2.tsx component handles all field updates

## Section Types and Their Text Fields

### 1. Hero Section (`hero`)
**Text Input Fields:**
- `image` - Image URL (input)
- `heading` - Main heading text (input)
- `subheading` - Subheading text (textarea)
- `buttonText` - Button label (input)
- `buttonLink` - Button URL (input)

**Inconsistency Found:** 
- Schema defines `title` and `subtitle` 
- Component uses `heading` and `subheading`
- This is a naming mismatch!

### 2. Header Section (`header`)
**Text Input Fields:**
- `logoImage` - Logo image URL (input, conditional)
- `logoText` - Text logo content (input, conditional)

### 3. Footer Section (`footer`)
**Text Input Fields:**
- `description` - Footer description text (schema only, not in component)
- `privacyPolicyUrl` - Privacy policy URL (schema only)
- `termsOfServiceUrl` - Terms of service URL (schema only)
- `quickLinks[]` - Array of links with label/url (schema only)

**Note:** Footer section has no UI implementation in section-inspector-v2.tsx

### 4. Product Grid / Featured Products (`product-grid`, `featured-products`)
**Text Input Fields:**
- `title` - Section title (input)

**Inconsistency:** Both sections share the same settings UI

### 5. Newsletter Section (`newsletter`)
**Text Input Fields:**
- `title` - Newsletter title (input)
- `subtitle` - Newsletter subtitle (textarea)
- `buttonText` - Subscribe button text (input)
- `successMessage` - Success message text (input)

### 6. Image with Text (`image-with-text`, `image-text`)
**Text Input Fields:**
- `image` - Image URL (input)
- `title` - Section title (input)
- `text` - Body text content (textarea)

**Note:** Two section types (`image-with-text` and `image-text`) use the same UI

### 7. Rich Text Section (`rich-text`)
**Text Input Fields:**
- `content` - HTML content (textarea)

### 8. Instagram Feed (`instagram-feed`)
**Text Input Fields:**
- `title` - Section title (input)
- `subtitle` - Section subtitle (input)
- `username` - Instagram username (input)
- `buttonText` - Follow button text (input)
- `buttonLink` - Instagram profile URL (input)

### 9. FAQ Section (`faq`)
**Text Input Fields:**
- `title` - Section title (input)
- `subtitle` - Section subtitle (textarea)

### 10. Contact Form (`contact-form`)
**Text Input Fields:**
- `title` - Form title (input)
- `subtitle` - Form subtitle (textarea)
- `successMessage` - Success message (input)

### 11. Collections Section (`collections`)
**Text Input Fields:**
- `title` - Section title (input)

### 12. Testimonials Section (`testimonials`)
**Text Input Fields:**
- `title` - Section title (input)

### 13. Logo List Section (`logo-list`)
**Text Input Fields:**
- `title` - Section title (input)

## Identified Issues and Duplicates

### 1. Title Field Inconsistencies
- **Hero section**: Uses `heading` in UI but `title` in schema
- **Most sections**: Use `title` consistently
- **Recommendation**: Standardize to use `title` across all sections

### 2. Subtitle Field Inconsistencies  
- **Hero section**: Uses `subheading` in UI but `subtitle` in schema
- **Newsletter, Instagram, FAQ, Contact**: Use `subtitle` consistently
- **Recommendation**: Standardize to use `subtitle` across all sections

### 3. Missing UI Implementation
Several sections defined in schema have no UI in section-inspector-v2.tsx:
- Footer (complex settings in schema)
- Product Gallery
- Product Info
- Product Description
- Product Reviews
- Related Products
- Recently Viewed
- Announcement Bar (defined in schema)

### 4. Duplicate Section Types
- `image-with-text` and `image-text` - Same UI implementation
- `product-grid` and `featured-products` - Same UI implementation

## Recommendations

1. **Standardize Field Names:**
   - Change Hero section to use `title` instead of `heading`
   - Change Hero section to use `subtitle` instead of `subheading`

2. **Implement Missing UIs:**
   - Add UI for Footer section settings
   - Add UI for product-specific sections
   - Add UI for Announcement Bar

3. **Consolidate Duplicate Types:**
   - Merge `image-with-text` and `image-text` into one
   - Consider differentiating `product-grid` and `featured-products`

4. **Common Fields Pattern:**
   - Most sections have a `title` field
   - Many have `subtitle` for additional context
   - Button sections have `buttonText` and `buttonLink`

## Data Storage Pattern
All fields are stored flat in `section.settings` except for nested objects:
- `productsPerRow: { mobile, tablet, desktop }`
- `columns: { mobile, tablet, desktop }`
- Arrays like `testimonials[]`, `collections[]`, `logos[]`