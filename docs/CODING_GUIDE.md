# Nuvi Platform Coding Guide

## Proje Genel Bakış

Nuvi, Next.js 15 ve modern web teknolojileri kullanılarak geliştirilmiş bir multi-tenant e-ticaret platformudur. Her kullanıcı kendi subdomain'ine sahip bir online mağaza açabilir.

## Teknoloji Stack'i

### Core Framework
- **Next.js 15**: App Router kullanılıyor
- **React 19**: En son React özellikleri
- **TypeScript**: Tip güvenliği için

### Veritabanı & Storage
- **PostgreSQL**: Ana veritabanı (Prisma ORM üzerinden)
- **Upstash Redis**: Tenant verileri için hızlı cache
- **Prisma**: ORM ve veritabanı yönetimi

### Authentication
- **NextAuth.js v4**: Authentication yönetimi
- **Providers**: Google OAuth ve Credentials (email/password)
- **bcrypt**: Şifre hashleme

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **Radix UI**: Headless UI components
- **lucide-react**: Icon library

## Proje Yapısı

```
nuvi-saas/
├── app/                      # Next.js App Router dizini
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   └── register/        # Kullanıcı kayıt endpoint'i
│   ├── admin/               # Admin paneli
│   ├── login/               # Giriş sayfası
│   ├── register/            # Kayıt sayfası
│   ├── s/[subdomain]/       # Tenant store sayfaları
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Ana sayfa
├── components/              # Reusable UI components
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utility functions ve helpers
├── prisma/                  # Veritabanı schema ve migrations
├── docs/                    # Dokümantasyon
└── middleware.ts            # Subdomain routing logic
```

## Kod Standartları

### 1. TypeScript Kullanımı

- **Strict Mode**: tsconfig.json'da `strict: true` aktif
- **Type Safety**: Tüm değişkenler ve fonksiyonlar için type tanımları kullanın
- **Interface vs Type**: Component props için interface, utility types için type alias kullanın

```typescript
// İyi
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  onClick: () => void;
}

// İyi
type UserRole = 'admin' | 'user' | 'store_owner';
```

### 2. Component Yazımı

- **Functional Components**: Class components kullanmayın
- **Server Components**: Mümkün olduğunca server component kullanın
- **Client Components**: Sadece interaktivite gerektiğinde `'use client'` ekleyin

```typescript
// Server Component (default)
export default function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Client Component
'use client';

export default function AddToCartButton({ productId }: { productId: string }) {
  const handleClick = () => {
    // Client-side logic
  };
  
  return <button onClick={handleClick}>Sepete Ekle</button>;
}
```

### 3. File Naming Conventions

- **Components**: PascalCase (`ProductCard.tsx`)
- **Utilities**: camelCase (`formatPrice.ts`)
- **Pages**: kebab-case (klasör adları)
- **API Routes**: kebab-case

### 4. Import Order

```typescript
// 1. React/Next imports
import { useState } from 'react';
import { redirect } from 'next/navigation';

// 2. Third-party libraries
import { z } from 'zod';
import { format } from 'date-fns';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 4. Types
import type { Product } from '@/types';
```

### 5. API Routes Best Practices

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

// Request validation schema
const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    // Business logic
    const product = await createProduct(validatedData);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### 6. Database Queries (Prisma)

```typescript
// Efficient queries with proper error handling
import { prisma } from '@/lib/prisma';

export async function getStoreProducts(storeId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { storeId },
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        // Only select needed fields
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw new Error('Database query failed');
  }
}
```

### 7. Error Handling

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage in API routes
try {
  // ... logic
} catch (error) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  // Log unexpected errors
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 8. Environment Variables

```typescript
// lib/env.ts - Centralized env validation
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  KV_REST_API_URL: z.string().url(),
  KV_REST_API_TOKEN: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
```

### 9. Multi-Tenant Architecture Guidelines

```typescript
// Always filter by tenant/store
export async function getProducts(subdomain: string) {
  const store = await getStoreBySubdomain(subdomain);
  if (!store) {
    throw new AppError('Store not found', 404);
  }

  return prisma.product.findMany({
    where: { storeId: store.id }, // Always filter by store
  });
}

// Middleware subdomain extraction
export function getSubdomain(request: NextRequest): string | null {
  // Implementation in middleware.ts
}
```

### 10. Performance Best Practices

- **Image Optimization**: Next.js Image component kullanın
- **Code Splitting**: Dynamic imports kullanın
- **Data Fetching**: Server Components'de veri çekin
- **Caching**: Redis'i etkili kullanın

```typescript
// Redis caching example
import { redis } from '@/lib/redis';

export async function getCachedStore(subdomain: string) {
  const cacheKey = `store:${subdomain}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const store = await prisma.store.findUnique({
    where: { subdomain },
  });

  if (store) {
    // Cache for 1 hour
    await redis.set(cacheKey, JSON.stringify(store), { ex: 3600 });
  }

  return store;
}
```

## Git Workflow

### Branch Naming
- `feature/feature-name`
- `fix/bug-description`
- `refactor/component-name`
- `docs/documentation-update`

### Commit Messages
```
feat: Add product search functionality
fix: Resolve subdomain routing issue
refactor: Optimize database queries
docs: Update API documentation
style: Format code with prettier
test: Add unit tests for auth
```

## Testing Guidelines

### Unit Tests
```typescript
// __tests__/utils/formatPrice.test.ts
import { formatPrice } from '@/lib/utils';

describe('formatPrice', () => {
  it('should format price in TL', () => {
    expect(formatPrice(100)).toBe('₺100,00');
    expect(formatPrice(1234.56)).toBe('₺1.234,56');
  });
});
```

### Integration Tests
```typescript
// __tests__/api/products.test.ts
import { POST } from '@/app/api/products/route';

describe('POST /api/products', () => {
  it('should create a product', async () => {
    const request = new Request('http://localhost:3000/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Product',
        price: 99.99,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
  });
});
```

## Security Best Practices

1. **Input Validation**: Zod kullanarak tüm inputları valide edin
2. **SQL Injection**: Prisma parametreli sorgular kullanır
3. **XSS Prevention**: React otomatik olarak escape eder
4. **CSRF Protection**: NextAuth CSRF koruması sağlar
5. **Authentication**: Her API route'da session kontrolü
6. **Authorization**: Role-based access control

```typescript
// Authorization middleware
export async function requireStoreOwner(request: NextRequest, storeId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AppError('Unauthorized', 401);
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId, userId: session.user.id },
  });

  if (!store) {
    throw new AppError('Forbidden', 403);
  }

  return store;
}
```

## Deployment Checklist

- [ ] Environment variables ayarlandı
- [ ] Database migrations çalıştırıldı
- [ ] Redis bağlantısı test edildi
- [ ] NextAuth secret key ayarlandı
- [ ] Error tracking kuruldu
- [ ] Performance monitoring aktif
- [ ] SSL sertifikası kontrol edildi
- [ ] Subdomain wildcard DNS ayarlandı

## Faydalı Kaynaklar

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)