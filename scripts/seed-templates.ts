import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
  try {
    // Get all stores
    const stores = await prisma.store.findMany({
      include: { activeTheme: true }
    });

    for (const store of stores) {
      console.log(`Creating templates for store: ${store.name}`);

      // Homepage template
      const homepageTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'homepage',
            name: 'Default Homepage'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'homepage',
          name: 'Default Homepage',
          isDefault: true,
          settings: {}
        }
      });

      // Collection template
      const collectionTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'collection',
            name: 'Default Collection'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'collection',
          name: 'Default Collection',
          isDefault: true,
          settings: {}
        }
      });

      // Product template
      const productTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'product',
            name: 'Default Product'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'product',
          name: 'Default Product',
          isDefault: true,
          settings: {}
        }
      });

      // Search template
      const searchTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'search',
            name: 'Default Search'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'search',
          name: 'Default Search',
          isDefault: true,
          settings: {}
        }
      });

      // Account templates
      const accountDashboardTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'account.dashboard',
            name: 'Account Dashboard'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'account.dashboard',
          name: 'Account Dashboard',
          isDefault: true,
          settings: {}
        }
      });

      const accountLoginTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'account.login',
            name: 'Login Page'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'account.login',
          name: 'Login Page',
          isDefault: true,
          settings: {}
        }
      });

      const accountRegisterTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'account.register',
            name: 'Register Page'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'account.register',
          name: 'Register Page',
          isDefault: true,
          settings: {}
        }
      });

      // Cart template
      const cartTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'cart',
            name: 'Default Cart'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'cart',
          name: 'Default Cart',
          isDefault: true,
          settings: {}
        }
      });

      // Page template (for static pages)
      const pageTemplate = await prisma.storeTemplate.upsert({
        where: {
          storeId_templateType_name: {
            storeId: store.id,
            templateType: 'page',
            name: 'Default Page'
          }
        },
        update: {},
        create: {
          storeId: store.id,
          themeId: store.activeThemeId || 'commerce',
          templateType: 'page',
          name: 'Default Page',
          isDefault: true,
          settings: {}
        }
      });

      // Add default sections to templates
      // Homepage sections
      try {
        await prisma.storeSectionInstance.createMany({
          data: [
            {
              templateId: homepageTemplate.id,
              sectionType: 'hero',
              position: 0,
              enabled: true,
              settings: {
                title: 'Welcome to Our Store',
                subtitle: 'Discover amazing products',
                buttonText: 'Shop Now',
                buttonLink: '/collections/all'
              }
            },
            {
              templateId: homepageTemplate.id,
              sectionType: 'featured-products',
              position: 1,
              enabled: true,
              settings: {
                title: 'Featured Products',
                productCount: 4
              }
            },
            {
              templateId: homepageTemplate.id,
              sectionType: 'collections',
              position: 2,
              enabled: true,
              settings: {
                title: 'Shop by Category'
              }
            }
          ]
        });
      } catch (error) {
        // Sections may already exist, ignore error
      }

      // Collection sections
      try {
        await prisma.storeSectionInstance.createMany({
          data: [
            {
              templateId: collectionTemplate.id,
              sectionType: 'collection-header',
              position: 0,
              enabled: true,
              settings: {}
            },
            {
              templateId: collectionTemplate.id,
              sectionType: 'collection-filters',
              position: 1,
              enabled: true,
              settings: {}
            },
            {
              templateId: collectionTemplate.id,
              sectionType: 'product-grid',
              position: 2,
              enabled: true,
              settings: {
                productsPerPage: 12,
                showFilters: true
              }
            }
          ]
        });
      } catch (error) {
        // Sections may already exist, ignore error
      }

      // Product sections
      try {
        await prisma.storeSectionInstance.createMany({
          data: [
            {
              templateId: productTemplate.id,
              sectionType: 'product-details',
              position: 0,
              enabled: true,
              settings: {}
            },
            {
              templateId: productTemplate.id,
              sectionType: 'product-recommendations',
              position: 1,
              enabled: true,
              settings: {
                title: 'You May Also Like',
                productCount: 4
              }
            }
          ]
        });
      } catch (error) {
        // Sections may already exist, ignore error
      }

      console.log(`Templates created for store: ${store.name}`);
    }

    console.log('All templates seeded successfully!');
  } catch (error) {
    console.error('Error seeding templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTemplates();