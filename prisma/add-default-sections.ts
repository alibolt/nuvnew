import { prisma } from '../lib/prisma';

async function addDefaultSections() {
  // Find the store
  const store = await prisma.store.findFirst();
  
  if (!store) {
    console.error('No store found');
    return;
  }

  console.log(`Adding default sections to store: ${store.name}`);

  // Check if store already has sections
  const existingSections = await prisma.storeSectionInstance.count({
    where: { storeId: store.id }
  });

  if (existingSections > 1) {
    console.log('Store already has sections');
    return;
  }

  // Default sections to add
  const defaultSections = [
    {
      sectionType: 'hero',
      position: 0,
      enabled: true,
      settings: {
        heading: 'Welcome to Our Store',
        subheading: 'Discover amazing products at great prices',
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
      sectionType: 'image-with-text',
      position: 2,
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
      position: 3,
      enabled: true,
      settings: {
        heading: 'Stay Updated',
        subheading: 'Subscribe to our newsletter and get 10% off your first order',
        buttonText: 'Subscribe',
        backgroundColor: '#000000'
      }
    }
  ];

  // Add sections
  for (const section of defaultSections) {
    await prisma.storeSectionInstance.create({
      data: {
        storeId: store.id,
        ...section
      }
    });
  }

  console.log('Default sections added successfully');
}

addDefaultSections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });