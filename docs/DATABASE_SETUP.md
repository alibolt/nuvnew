# Database Setup Guide

## Option 1: Local PostgreSQL

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb nuvi

# Connect to verify
psql -d nuvi -c "SELECT version();"
```

### Connection string for local PostgreSQL:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nuvi"
```

## Option 2: Cloud Database Services (Recommended)

### Supabase (Free tier available)
1. Create account at https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Replace in .env.local:
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

### Neon (Free tier available)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string from dashboard
4. Add to .env.local:
```
DATABASE_URL="postgresql://[user]:[password]@[endpoint]/neondb?sslmode=require"
```

### Railway
1. Create account at https://railway.app
2. Create new PostgreSQL service
3. Copy DATABASE_URL from service variables
4. Add to .env.local

## Verify Database Connection

After setting up your database:

```bash
# Test connection
node check-env.js

# Run migrations
pnpm prisma migrate dev

# Open Prisma Studio to view database
pnpm prisma studio
```

## Common Issues

### "invalid port number in database URL"
- Check that port is a number (usually 5432)
- No extra characters or spaces in URL

### "P1001: Can't reach database server"
- Ensure PostgreSQL is running
- Check host and port are correct
- For cloud services, check firewall/IP allowlist

### "P1000: Authentication failed"
- Verify username and password
- Check user has database permissions

## Quick Start with Docker

```bash
# Run PostgreSQL in Docker
docker run --name nuvi-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# Connection string:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
```