import { prisma } from '@/lib/prisma';

/**
 * Get store by subdomain
 */
export async function getStore(subdomain: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        storeSettings: true,
      }
    });
    
    return store;
  } catch (error) {
    console.error('Error fetching store:', error);
    return null;
  }
}

/**
 * Get store with all relations
 */
export async function getStoreWithRelations(subdomain: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        storeSettings: true,
        products: {
          where: { published: true },
          take: 20,
          orderBy: { createdAt: 'desc' }
        },
        categories: {
          where: { enabled: true },
          orderBy: { position: 'asc' }
        },
        templates: {
          where: { enabled: true }
        }
      }
    });
    
    return store;
  } catch (error) {
    console.error('Error fetching store with relations:', error);
    return null;
  }
}