import { prisma } from '../lib/prisma';

async function seedDefaultMenus() {
  try {
    // Get all stores
    const stores = await prisma.store.findMany();

    for (const store of stores) {
      // Check if main menu exists
      const mainMenuExists = await prisma.menu.findUnique({
        where: {
          storeId_handle: {
            storeId: store.id,
            handle: 'main-menu'
          }
        }
      });

      if (!mainMenuExists) {
        // Create main menu
        await prisma.menu.create({
          data: {
            name: 'Main Menu',
            handle: 'main-menu',
            storeId: store.id,
            items: {
              create: [
                { label: 'Shop', link: '/', position: 0 },
                { label: 'Collections', link: '/collections', position: 1 },
                { label: 'About', link: '/about', position: 2 },
                { label: 'Contact', link: '/contact', position: 3 }
              ]
            }
          }
        });
        console.log(`Created main menu for store: ${store.name}`);
      }

      // Check if footer menu exists
      const footerMenuExists = await prisma.menu.findUnique({
        where: {
          storeId_handle: {
            storeId: store.id,
            handle: 'footer-menu'
          }
        }
      });

      if (!footerMenuExists) {
        // Create footer menu
        await prisma.menu.create({
          data: {
            name: 'Footer Menu',
            handle: 'footer-menu',
            storeId: store.id,
            items: {
              create: [
                { label: 'Privacy Policy', link: '/privacy', position: 0 },
                { label: 'Terms of Service', link: '/terms', position: 1 },
                { label: 'Shipping Info', link: '/shipping', position: 2 },
                { label: 'Returns', link: '/returns', position: 3 },
                { label: 'FAQ', link: '/faq', position: 4 }
              ]
            }
          }
        });
        console.log(`Created footer menu for store: ${store.name}`);
      }
    }

    console.log('Default menus seeded successfully!');
  } catch (error) {
    console.error('Error seeding default menus:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDefaultMenus();