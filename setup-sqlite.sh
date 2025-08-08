#!/bin/bash

echo "🚀 SQLite ile hızlı kurulum..."

# .env.local oluştur
if [ ! -f .env.local ]; then
    echo "📝 .env.local oluşturuluyor..."
    cat > .env.local << 'EOF'
# SQLite database (otomatik oluşturulur)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-key-12345"

# Redis (şimdilik boş bırakabilirsin)
KV_REST_API_URL=""
KV_REST_API_TOKEN=""

# Public
NEXT_PUBLIC_ROOT_DOMAIN="localhost:3000"
EOF
fi

echo "📦 Dependencies yükleniyor..."
pnpm install

echo "🔧 Prisma Client oluşturuluyor..."
pnpm prisma generate

echo "🗄️  Database oluşturuluyor..."
pnpm prisma migrate dev --name init

echo "✅ Kurulum tamamlandı!"
echo ""
echo "🚀 Başlatmak için: pnpm dev"
echo "📍 Tarayıcıda aç: http://localhost:3000"