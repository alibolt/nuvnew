import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listStores() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        subdomain: true,
        name: true
      }
    });
    
    console.log('Available stores:');
    stores.forEach(store => {
      console.log(`- ${store.name} (subdomain: ${store.subdomain})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listStores();
