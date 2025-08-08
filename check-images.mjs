import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Find the cottonyarn store
    const store = await prisma.store.findFirst({
      where: {
        subdomain: 'cottonyarn'
      }
    });

    if (!store) {
      console.log('Store cottonyarn not found');
      return;
    }

    console.log('Found store:', store.subdomain);

    // Get some products from this store
    const products = await prisma.product.findMany({
      where: {
        storeId: store.id
      },
      take: 3,
      include: {
        variants: true
      }
    });

    console.log(`\nFound ${products.length} products\n`);

    products.forEach((product, index) => {
      console.log(`\n===== Product ${index + 1}: ${product.name} =====`);
      console.log('ID:', product.id);
      console.log('Images field type:', typeof product.images);
      console.log('Images raw value:', JSON.stringify(product.images, null, 2));
      
      // Also check variant images
      if (product.variants.length > 0) {
        console.log('\nVariant images:');
        product.variants.slice(0, 2).forEach((variant, vIndex) => {
          console.log(`  Variant ${vIndex + 1} (${variant.name}):`);
          console.log('  Image field type:', typeof variant.image);
          console.log('  Image value:', variant.image);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();