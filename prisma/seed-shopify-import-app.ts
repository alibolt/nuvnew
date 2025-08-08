import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Shopify Import app...');

  // Create the Shopify Import app
  const app = await prisma.app.upsert({
    where: { code: 'shopify-import' },
    update: {},
    create: {
      code: 'shopify-import',
      name: 'Shopify Import',
      description: 'Import products, collections, and pages from your existing Shopify store',
      icon: '🛍️',
      category: 'Migration',
      developer: 'Nuvi',
      version: '1.0.0',
      pricing: { type: 'free' },
      features: [
        'Import products with variants',
        'Import collections and categories',
        'Import pages and content',
        'Import theme settings',
        'Bulk import with progress tracking'
      ],
      permissions: [
        'read_products',
        'write_products',
        'read_collections',
        'write_collections',
        'read_pages',
        'write_pages'
      ],
      settings: {
        maxProducts: 250,
        supportedFormats: ['json', 'xml'],
        rateLimiting: true
      },
      isActive: true,
      isPublic: true
    }
  });

  console.log(`App '${app.name}' created with id: ${app.id}`);

  // Get all stores and install the app for them
  const stores = await prisma.store.findMany();
  
  for (const store of stores) {
    const appInstall = await prisma.appInstall.upsert({
      where: { 
        storeId_appId: { 
          storeId: store.id, 
          appId: app.id 
        } 
      },
      update: {},
      create: {
        storeId: store.id,
        appId: app.id,
        status: 'active',
        settings: {},
        permissions: [
          'read_products',
          'write_products',
          'read_collections',
          'write_collections',
          'read_pages',
          'write_pages'
        ],
        data: {}
      }
    });

    console.log(`App installed for store '${store.name}' with install id: ${appInstall.id}`);
  }

  console.log('Shopify Import app seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });