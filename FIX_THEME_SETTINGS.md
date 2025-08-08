# Theme Settings Error Fix

## Error
```
Error: Failed to load theme configuration: Not Found
```

## Cause
The theme.json file is not accessible via HTTP because it's not in the public directory.

## Solution

Run this command to fix:

```bash
cd /Users/ali/Desktop/nuvi-saas
mkdir -p public/themes/commerce
cp themes/commerce/theme.json public/themes/commerce/
```

## Alternative (Already Applied)
Updated `lib/theme-utils.ts` to:
1. Try to load from public directory first
2. If not found, import directly from themes folder
3. If that fails, return a minimal default config

## Why This Happens
- Next.js can only serve static files from the `public` directory
- The fetch(`/themes/commerce/theme.json`) tries to load via HTTP
- Since the file is in `themes/` (not `public/themes/`), it returns 404

## Permanent Fix
Either:
1. Keep theme.json in public folder (recommended for production)
2. Or import it as a module (what we did as fallback)