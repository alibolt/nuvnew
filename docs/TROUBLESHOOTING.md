# Troubleshooting Guide - Nuvi Platform

## Internal Server Error Solutions

### 1. Check Environment Variables

Make sure `.env.local` file exists with all required variables:

```bash
# Required variables
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
KV_REST_API_URL="your-upstash-url"
KV_REST_API_TOKEN="your-upstash-token"
```

### 2. Database Setup

Run these commands in order:

```bash
# Install dependencies
pnpm install

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Verify database connection
pnpm prisma studio
```

### 3. Quick Setup Script

Run the automated setup:

```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### 4. Check Console Logs

The API now includes detailed logging. Check your terminal for:
- `[STORES API]` messages
- Session information
- Error details

### 5. Common Fixes

**Missing user.id in session:**
- Added NextAuth callbacks to include user ID in JWT
- Created type definitions in `types/next-auth.d.ts`

**Prisma Client errors:**
- Using singleton pattern in `lib/prisma.ts`
- Prevents multiple instances in development

**Redis connection issues:**
- Verify Upstash credentials are correct
- Check if Redis instance is active

### 6. Manual Database Check

```bash
# Check if database is accessible
pnpm prisma db pull

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

### 7. Testing Authentication

1. Register a new user at `/register`
2. Check database: `pnpm prisma studio`
3. Verify user exists with hashed password
4. Try logging in at `/login`

### 8. Debug Mode

The app now logs:
- API request details
- Session information
- Error stack traces

Check browser console and terminal output.

## Still Having Issues?

1. Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
2. Clear Next.js cache: `rm -rf .next`
3. Restart development server: `pnpm dev`

## Error Details in API Response

API now returns error details in development:
```json
{
  "error": "Internal Server Error",
  "details": "Actual error message here"
}
```

Check Network tab in browser DevTools for these details.