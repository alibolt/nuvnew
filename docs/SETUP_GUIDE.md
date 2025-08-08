# Nuvi Platform Setup Guide

This guide provides a comprehensive walkthrough for setting up the Nuvi platform for local development.

## Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended)
- A PostgreSQL database
- An Upstash Redis instance

## 1. Database Setup (Choose One)

We recommend using a free cloud database provider for a smoother setup experience.

### Option A: Cloud Database (Recommended)

#### Supabase (Easiest)
1.  Go to [Supabase](https://supabase.com) and create a free account.
2.  Create a new project.
3.  Navigate to **Settings** > **Database**.
4.  Copy the **connection string** (URI) and save it for the next step.

#### Neon
1.  Go to [Neon](https://neon.tech) and create a free account.
2.  Create a new project.
3.  Copy the connection string from the dashboard.

### Option B: Local PostgreSQL (macOS)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start the service
brew services start postgresql@15

# Create the database
createdb nuvi
```
The default connection string for this setup is: `postgresql://postgres:postgres@localhost:5432/nuvi`

## 2. Redis Setup (Upstash)

1.  Go to [Upstash](https://upstash.com/) and create a free account.
2.  Click **"Create Database"**.
3.  From the database dashboard, copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

## 3. Environment Variables

1.  Create a `.env.local` file in the root directory:
    ```bash
    cp .env.example .env.local
    ```
2.  Open `.env.local` and fill in the credentials you obtained:

    ```env
    # Database - Use the connection string from Supabase, Neon, or your local setup
    DATABASE_URL="postgresql://..."

    # Redis - From Upstash
    KV_REST_API_URL="https://..."
    KV_REST_API_TOKEN="..."

    # NextAuth - Generate a secret with: openssl rand -base64 32
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-generated-secret-here"

    # Public variables
    NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
    ```

## 4. Installation & Setup

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```
2.  **Generate Prisma client**:
    ```bash
    pnpm prisma generate
    ```
3.  **Run database migrations**:
    ```bash
    pnpm prisma migrate dev
    ```

## 5. Running the Application

1.  **Start the development server**:
    ```bash
    pnpm dev
    ```
2.  **Open the application**:
    -   **Main Page**: [http://localhost:3000](http://localhost:3000)
    -   **After Login**: You will be redirected to the dashboard to create your first store.

## 6. Common Issues & Troubleshooting

If you encounter issues, please refer to the [**Troubleshooting Guide**](./TROUBLESHOOTING.md). You can also use the built-in test endpoints:

```bash
# Test database connection
curl http://localhost:3000/api/test-db

# Test auth setup
curl http://localhost:3000/api/test-auth
```

## Production Deployment (Vercel)

1.  Push your repository to GitHub.
2.  Import the project in Vercel.
3.  Add all environment variables from your `.env.local` file to the Vercel project settings.
4.  Deploy.
5.  For custom subdomains to work, configure a wildcard DNS record (`*.yourdomain.com`) on your domain provider, pointing to Vercel.
