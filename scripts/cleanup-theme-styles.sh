#!/bin/bash

echo "Cleaning up theme style files..."

# Remove duplicate files
rm -f themes/commerce/styles/theme-styles.ts
echo "Removed theme-styles.ts"

# Backup old theme.css
mv themes/commerce/styles/theme.css themes/commerce/styles/theme.css.backup
echo "Backed up old theme.css"

# Use new theme.css
mv themes/commerce/styles/theme-new.css themes/commerce/styles/theme.css
echo "Activated new theme.css"

echo "Done!"