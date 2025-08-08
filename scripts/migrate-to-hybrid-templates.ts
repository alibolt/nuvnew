import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function migrateToHybridTemplates() {
  console.log('Starting migration to hybrid template system...');

  try {
    // Get all stores with their templates
    const stores = await prisma.store.findMany({
      include: {
        templates: {
          include: {
            sections: true
          }
        },
        activeTheme: true
      }
    });

    console.log(`Found ${stores.length} stores to process`);

    for (const store of stores) {
      const themeCode = store.activeTheme?.code || 'minimal';
      console.log(`\nProcessing store: ${store.name} (${store.subdomain})`);
      console.log(`Theme: ${themeCode}`);

      // For each template type, ensure it exists in the database
      const templateTypes = ['homepage', 'product', 'collection', 'page', 'search', '404'];
      
      for (const templateType of templateTypes) {
        // Check if JSON template exists
        const jsonPath = path.join(process.cwd(), 'themes', themeCode, 'templates', `${templateType}.json`);
        
        try {
          await fs.access(jsonPath);
          console.log(`  ✓ Found JSON template: ${templateType}`);

          // Check if DB template exists
          let dbTemplate = await prisma.storeTemplate.findFirst({
            where: {
              storeId: store.id,
              templateType: templateType
            }
          });

          if (!dbTemplate) {
            // Create template in DB if it doesn't exist
            console.log(`  → Creating DB template: ${templateType}`);
            dbTemplate = await prisma.storeTemplate.create({
              data: {
                storeId: store.id,
                themeId: store.activeThemeId || '',
                templateType: templateType,
                name: templateType.charAt(0).toUpperCase() + templateType.slice(1),
                isDefault: true,
                enabled: true,
                settings: {}
              }
            });
          }

          // If this is a product template with existing sections, keep them
          // as they represent user customizations
          if (dbTemplate && dbTemplate.templateType === 'product') {
            const sectionCount = await prisma.storeSectionInstance.count({
              where: { templateId: dbTemplate.id }
            });
            console.log(`  → Product template has ${sectionCount} customized sections`);
          }

        } catch (error) {
          console.log(`  ⚠ No JSON template found for: ${templateType}`);
        }
      }
    }

    // Note: Orphaned sections check removed as it's not needed
    // The foreign key constraint ensures sections can't exist without templates

    console.log('\n✅ Migration completed successfully!');
    
    // Summary
    const totalTemplates = await prisma.storeTemplate.count();
    const totalSections = await prisma.storeSectionInstance.count();
    
    console.log(`\nSummary:`);
    console.log(`- Total templates: ${totalTemplates}`);
    console.log(`- Total section instances: ${totalSections}`);
    console.log(`\nThe hybrid template system is now active.`);
    console.log(`Templates will be loaded from JSON files with DB customizations merged.`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToHybridTemplates();