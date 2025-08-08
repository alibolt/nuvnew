#!/bin/bash

# Script to apply theme settings to all sections

SECTIONS_DIR="themes/commerce/sections"

# List of sections to update
SECTIONS=(
  "footer.tsx"
  "hero.tsx"
  "collections.tsx"
  "testimonials.tsx"
  "instagram-feed.tsx"
  "best-sellers.tsx"
  "product-recommendations.tsx"
  "rich-text.tsx"
  "image-with-text.tsx"
  "logo-list.tsx"
  "countdown.tsx"
  "contact-form.tsx"
  "product-categories.tsx"
  "related-products.tsx"
  "recently-viewed.tsx"
  "trending-products.tsx"
)

echo "Applying theme settings to sections..."

# Add import statement for theme layout utils
for section in "${SECTIONS[@]}"; do
  if [ -f "$SECTIONS_DIR/$section" ]; then
    echo "Updating $section..."
    
    # Check if import already exists
    if ! grep -q "theme-layout-utils" "$SECTIONS_DIR/$section"; then
      # Add import after theme-animations import
      sed -i '' "/import.*theme-animations/a\\
import { getSectionLayoutStyles, getElementSpacingClass, getBorderRadiusStyles, getContentAlignmentClass } from '@/lib/theme-layout-utils';" "$SECTIONS_DIR/$section"
    fi
  fi
done

echo "✅ Theme settings have been applied to sections!"
echo ""
echo "Manual steps needed:"
echo "1. Update container divs to use: style={getSectionLayoutStyles({ includeContainer: true, includePadding: false })}"
echo "2. Update section divs to use: style={{...getSectionLayoutStyles({ includePadding: true, includeContainer: false }), ...animationStyles}}"
echo "3. Replace 'gap-6' with getElementSpacingClass() in grid layouts"
echo "4. Add getBorderRadiusStyles() to buttons, cards, and images"
echo "5. Add getContentAlignmentClass() to headings and text content"