import { unstable_cache } from 'next/cache';
import { cache } from 'react';

// React cache for request-level caching
export const getStoreData = cache(async (subdomain: string) => {
  const { prisma } = await import('@/lib/prisma');
  
  return prisma.store.findUnique({
    where: { subdomain },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          categories: true,
        }
      }
    }
  });
});

// Next.js cache for cross-request caching (5 minutes)
export const getCachedCategories = unstable_cache(
  async (storeId: string) => {
    const { prisma } = await import('@/lib/prisma');
    
    return prisma.category.findMany({
      where: { storeId },
      orderBy: { name: 'asc' }
    });
  },
  ['categories'],
  {
    revalidate: 300, // 5 minutes
    tags: ['categories']
  }
);

// Cache for product count by category
export const getCachedProductCount = unstable_cache(
  async (categoryId: string) => {
    const { prisma } = await import('@/lib/prisma');
    
    return prisma.product.count({
      where: { 
        categoryId,
        isActive: true 
      }
    });
  },
  ['product-count'],
  {
    revalidate: 60, // 1 minute
    tags: ['products']
  }
);

// Cache for store settings
export const getCachedStoreSettings = unstable_cache(
  async (storeId: string) => {
    const { prisma } = await import('@/lib/prisma');
    
    return prisma.storeSettings.findUnique({
      where: { storeId }
    });
  },
  ['store-settings'],
  {
    revalidate: 600, // 10 minutes
    tags: ['settings']
  }
);

// Invalidate cache functions
export async function invalidateCategories() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('categories');
}

export async function invalidateProducts() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('products');
}

export async function invalidateSettings() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('settings');
}