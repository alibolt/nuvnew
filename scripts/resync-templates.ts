import { PrismaClient } from '@prisma/client';
import { hybridTemplateLoader } from '../lib/services/hybrid-template-loader';

const prisma = new PrismaClient();

async function resyncTemplates() {
  console.log('Starting template resync...');
  
  try {
    // Get all stores
    const stores = await prisma.store.findMany();
    
    console.log(`Found ${stores.length} stores to process`);
    
    for (const store of stores) {
      console.log(`\nProcessing store: ${store.subdomain}`);
      
      // Clear all templates for this store
      await prisma.sectionBlock.deleteMany({
        where: {
          section: {
            template: {
              storeId: store.id
            }
          }
        }
      });
      
      await prisma.storeSectionInstance.deleteMany({
        where: {
          template: {
            storeId: store.id
          }
        }
      });
      
      await prisma.storeTemplate.deleteMany({
        where: {
          storeId: store.id
        }
      });
      
      console.log('  Cleared existing templates');
      
      // Clear hybrid template loader cache
      hybridTemplateLoader.clearCache();
      
      // Sync templates
      const templateTypes = ['homepage', 'product', 'collection', 'search'];
      const themeCode = 'commerce';
      
      for (const templateType of templateTypes) {
        console.log(`  Syncing ${templateType} template...`);
        
        try {
          // This will trigger the sync process
          await hybridTemplateLoader.getCompiledTemplate(store.subdomain, themeCode, templateType);
          console.log(`    ✓ ${templateType} synced`);
        } catch (error) {
          console.error(`    ✗ Failed to sync ${templateType}:`, error);
        }
      }
    }
    
    console.log('\nTemplate resync completed!');
  } catch (error) {
    console.error('Error during resync:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
resyncTemplates();