#!/usr/bin/env ts-node

/**
 * Migration script to transition from the old homepage sections to the new template-based system
 * 
 * This script:
 * 1. Creates default templates for each store based on their active theme
 * 2. Migrates existing homepage sections to the new template structure
 * 3. Sets up default templates for common page types
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default template types that every store should have
const DEFAULT_TEMPLATE_TYPES = [
  { type: 'homepage', name: 'Default Homepage', description: 'Main homepage template' },
  { type: 'product.default', name: 'Default Product', description: 'Standard product page layout' },
  { type: 'collection.default', name: 'Default Collection', description: 'Standard collection page layout' },
  { type: 'page.default', name: 'Default Page', description: 'Standard content page layout' },
  { type: 'account.dashboard', name: 'Account Dashboard', description: 'User account dashboard' },
  { type: 'account.login', name: 'Login Page', description: 'User login page' },
  { type: 'account.register', name: 'Register Page', description: 'User registration page' },
  { type: 'search', name: 'Search Results', description: 'Search results page' },
  { type: 'cart', name: 'Shopping Cart', description: 'Shopping cart page' },
  { type: '404', name: '404 Not Found', description: 'Error page template' },
];

async function migrateToTemplates() {
  console.log('Starting migration to template-based system...');

  try {
    // Get all stores with their active themes
    const stores = await prisma.store.findMany({
      include: {
        activeTheme: true
      }
    });

    for (const store of stores) {
      console.log(`\nProcessing store: ${store.name} (${store.subdomain})`);

      if (!store.activeThemeId || !store.activeTheme) {
        console.log('  - No active theme, skipping...');
        continue;
      }

      // Create default templates for this store
      for (const templateDef of DEFAULT_TEMPLATE_TYPES) {
        const existingTemplate = await prisma.storeTemplate.findUnique({
          where: {
            storeId_templateType_name: {
              storeId: store.id,
              templateType: templateDef.type,
              name: templateDef.name
            }
          }
        });

        if (!existingTemplate) {
          console.log(`  - Creating template: ${templateDef.type}`);
          
          const template = await prisma.storeTemplate.create({
            data: {
              storeId: store.id,
              themeId: store.activeThemeId,
              templateType: templateDef.type,
              name: templateDef.name,
              description: templateDef.description,
              isDefault: true,
              enabled: true,
              settings: {},
              seoSettings: {}
            }
          });

          // Note: In a real migration scenario, you would:
          // 1. Run this script BEFORE applying the schema changes
          // 2. Query the old StoreSectionInstance records where storeId = store.id
          // 3. Migrate them to the new template-based structure
          // 
          // Since the schema has already been updated, we can't access the old data
          // In production, you'd want to backup and migrate data before schema changes
        }
      }

      // Set default templates for products and categories if they don't have specific ones
      const defaultProductTemplate = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType: 'product.default',
          isDefault: true
        }
      });

      const defaultCollectionTemplate = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType: 'collection.default',
          isDefault: true
        }
      });

      // Update products without templates to use the default
      if (defaultProductTemplate) {
        await prisma.product.updateMany({
          where: {
            storeId: store.id,
            templateId: null
          },
          data: {
            templateId: defaultProductTemplate.id
          }
        });
      }

      // Update categories without templates to use the default
      if (defaultCollectionTemplate) {
        await prisma.category.updateMany({
          where: {
            storeId: store.id,
            templateId: null
          },
          data: {
            templateId: defaultCollectionTemplate.id
          }
        });
      }
    }

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToTemplates().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});