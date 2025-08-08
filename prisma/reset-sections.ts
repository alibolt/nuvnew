import { prisma } from '../lib/prisma';

async function resetSections() {
  const store = await prisma.store.findFirst();
  if (!store) {
    console.error('No store found');
    return;
  }

  console.log(`Resetting sections for store: ${store.name}`);

  // Delete all existing sections
  await prisma.storeSectionInstance.deleteMany({
    where: { storeId: store.id }
  });

  // Add default sections in correct order
  const sections = [
    {
      sectionType: 'hero',
      position: 0,
      enabled: true,
      settings: {
        heading: 'Summer Collection',
        subheading: 'Discover our latest arrivals',
        buttonText: 'Shop Now',
        buttonLink: '/collections/all',
        image: '/api/placeholder/1920/800',
        height: 'large',
        textAlignment: 'center',
        overlayOpacity: 20,
        showButton: true
      }
    },
    {
      sectionType: 'featured-products',
      position: 1,
      enabled: true,
      settings: {
        title: 'Featured Products',
        subtitle: 'Check out our hand-picked selection',
        productCount: 6,
        columns: '3'
      }
    },
    {
      sectionType: 'collections',
      position: 2,
      enabled: true,
      settings: {
        title: 'Shop by Collection',
        collections: []
      }
    },
    {
      sectionType: 'image-with-text',
      position: 3,
      enabled: true,
      settings: {
        heading: 'Our Story',
        content: '<p>We are passionate about bringing you the best products. Our journey started with a simple idea: make quality accessible to everyone.</p>',
        buttonText: 'Learn More',
        buttonLink: '/about',
        image: '/api/placeholder/800/600',
        imagePosition: 'left'
      }
    },
    {
      sectionType: 'newsletter',
      position: 4,
      enabled: true,
      settings: {
        heading: 'Stay Updated',
        subheading: 'Subscribe to our newsletter and get 10% off your first order',
        buttonText: 'Subscribe',
        backgroundColor: '#000000'
      }
    }
  ];

  for (const section of sections) {
    await prisma.storeSectionInstance.create({
      data: {
        storeId: store.id,
        ...section
      }
    });
  }

  console.log(`${sections.length} sections added successfully`);
}

resetSections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });