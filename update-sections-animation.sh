#!/bin/bash

# List of sections that need animation updates
sections=(
  "announcement-bar"
  "best-sellers"
  "cart"
  "checkout-form"
  "collection-list"
  "collections"
  "contact-form"
  "countdown"
  "featured-products"
  "footer"
  "hero"
  "image-with-text"
  "instagram-feed"
  "login-form"
  "logo-list"
  "newsletter"
  "order-summary"
  "payment-method"
  "product-categories"
  "product-recommendations"
  "product"
  "recently-viewed"
  "register-form"
  "related-products"
  "rich-text"
  "search-filters"
  "search-results"
  "search-suggestions"
  "shipping-methods"
  "testimonials"
  "trending-products"
)

echo "Updating sections with theme animation support..."

for section in "${sections[@]}"; do
  file="themes/commerce/sections/${section}.tsx"
  
  if [ -f "$file" ]; then
    echo "Processing $section..."
    
    # Check if animation imports already exist
    if ! grep -q "getSectionAnimationClasses" "$file"; then
      # Add animation imports after 'use client'
      sed -i '' "/^'use client';/a\\
import { getSectionAnimationClasses, getAnimationStyles } from '@/lib/theme-animations';" "$file"
    fi
    
    # Check if themeSettings is in interface
    if ! grep -q "themeSettings\?:" "$file"; then
      # Add themeSettings to interface (if interface exists)
      sed -i '' "/^interface.*Props.*{/,/^}/ s/}/  themeSettings?: Record<string, any>;\\
}/" "$file"
    fi
    
    echo "✓ Updated $section"
  else
    echo "✗ File not found: $file"
  fi
done

echo "Done! Please manually review and add animation classes to each section's render method."