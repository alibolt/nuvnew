#!/bin/bash

echo "🚀 Setting up Nuvi development environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your credentials before continuing!"
    echo "Press any key to continue after editing .env.local..."
    read -n 1 -s
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
pnpm prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
pnpm prisma migrate dev --name init

# Check if migrations were successful
if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
else
    echo "❌ Database migration failed. Please check your DATABASE_URL in .env.local"
    exit 1
fi

echo "🎉 Setup complete! You can now run 'pnpm dev' to start the development server."
echo ""
echo "📌 Next steps:"
echo "1. Make sure Redis credentials are set in .env.local"
echo "2. Run 'pnpm dev' to start the server"
echo "3. Visit http://localhost:3000"