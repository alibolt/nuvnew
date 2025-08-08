#!/bin/bash

echo "Setting up public themes directory..."

# Create directories
mkdir -p public/themes/commerce

# Copy theme.json
cp themes/commerce/theme.json public/themes/commerce/

echo "Done! Theme configuration is now accessible."