#!/bin/bash

echo "Cleaning up duplicate schemas..."

# Remove duplicate schemas from lib
DUPLICATES=(
  "announcement-bar.ts"
  "collections.ts"
  "featured-products.ts"
  "footer.ts"
  "header.ts"
  "hero-banner.ts"
  "hero.ts"
  "newsletter.ts"
  "product.ts"
)

# Move theme-specific schemas to commerce theme
TO_MOVE=(
  "best-sellers.ts"
  "collection-list.ts"
  "countdown.ts"
  "image-with-text.ts"
  "instagram-feed.ts"
  "logo-list.ts"
  "product-categories.ts"
  "product-recommendations.ts"
  "recently-viewed.ts"
  "related-products.ts"
  "rich-text.ts"
  "testimonials.ts"
)

echo "Removing duplicates from lib/section-schemas..."
for file in "${DUPLICATES[@]}"; do
  echo "Removing lib/section-schemas/$file"
  rm -f "lib/section-schemas/$file"
done

echo "Moving theme-specific schemas to themes/commerce/schemas..."
for file in "${TO_MOVE[@]}"; do
  echo "Moving $file to theme folder"
  mv "lib/section-schemas/$file" "themes/commerce/schemas/" 2>/dev/null || echo "  Already moved or doesn't exist: $file"
done

echo "Done!"