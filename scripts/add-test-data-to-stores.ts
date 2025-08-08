import { prisma } from '../lib/prisma';
import { createTestDataForStore } from '../lib/create-test-data';

async function main() {
  try {
    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            customers: true,
          }
        }
      }
    });

    console.log(`Found ${stores.length} stores`);

    for (const store of stores) {
      console.log(`\nChecking store: ${store.subdomain}`);
      console.log(`- Orders: ${store._count.orders}`);
      console.log(`- Customers: ${store._count.customers}`);

      // Only add test data if store has no orders or customers
      if (store._count.orders === 0 || store._count.customers === 0) {
        console.log(`Adding test data to store: ${store.subdomain}`);
        await createTestDataForStore(store.id);
      } else {
        console.log(`Store ${store.subdomain} already has data, skipping`);
      }
    }

    console.log('\nTest data addition completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();