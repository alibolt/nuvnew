import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function initStoreSections() {
  console.log('🌱 Initializing store sections from theme templates...');
  
  try {
    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        templates: {
          include: {
            sections: true
          }
        }
      }
    });

    console.log(`📊 Found ${stores.length} stores`);

    for (const store of stores) {
      console.log(`\n🏪 Processing store: ${store.name} (${store.subdomain})`);
      
      // Check if store already has sections
      const existingSections = store.templates.flatMap(t => t.sections);
      if (existingSections.length > 0) {
        console.log(`  ✅ Store already has ${existingSections.length} sections, skipping...`);
        continue;
      }

      // Get commerce theme ID
      const commerceTheme = await prisma.theme.findFirst({
        where: { code: 'commerce' }
      });

      if (!commerceTheme) {
        console.log(`  ❌ Commerce theme not found, skipping store ${store.subdomain}`);
        continue;
      }

      // Load theme templates from JSON files
      const themePath = path.join(process.cwd(), 'themes', 'commerce');
      const templatesPath = path.join(themePath, 'templates');

      // Process homepage template
      const homepageJsonPath = path.join(templatesPath, 'homepage.json');
      if (fs.existsSync(homepageJsonPath)) {
        const homepageData = JSON.parse(fs.readFileSync(homepageJsonPath, 'utf8'));
        
        // Find or create homepage template
        let homepageTemplate = await prisma.storeTemplate.findFirst({
          where: {
            storeId: store.id,
            templateType: 'homepage'
          }
        });

        if (!homepageTemplate) {
          homepageTemplate = await prisma.storeTemplate.create({
            data: {
              storeId: store.id,
              themeId: commerceTheme.id,
              templateType: 'homepage',
              name: 'Homepage',
              settings: homepageData
            }
          });
        }

        // Create sections for homepage
        if (homepageData.sections) {
          console.log(`  📄 Creating ${homepageData.sections.length} homepage sections...`);
          
          for (let i = 0; i < homepageData.sections.length; i++) {
            const section = homepageData.sections[i];
            
            await prisma.storeSectionInstance.create({
              data: {
                templateId: homepageTemplate.id,
                sectionType: section.type,
                settings: section.settings || {},
                position: i,
                enabled: true
              }
            });
            
            console.log(`    ✨ Created section: ${section.type}`);
          }
        }
      }

      // Process product template
      const productJsonPath = path.join(templatesPath, 'product.json');
      if (fs.existsSync(productJsonPath)) {
        const productData = JSON.parse(fs.readFileSync(productJsonPath, 'utf8'));
        
        // Find or create product template
        let productTemplate = await prisma.storeTemplate.findFirst({
          where: {
            storeId: store.id,
            templateType: 'product'
          }
        });

        if (!productTemplate) {
          productTemplate = await prisma.storeTemplate.create({
            data: {
              storeId: store.id,
              themeId: commerceTheme.id,
              templateType: 'product',
              name: 'Product',
              settings: productData
            }
          });
        }

        // Create sections for product page
        if (productData.sections) {
          console.log(`  📦 Creating ${productData.sections.length} product sections...`);
          
          for (let i = 0; i < productData.sections.length; i++) {
            const section = productData.sections[i];
            
            await prisma.storeSectionInstance.create({
              data: {
                templateId: productTemplate.id,
                sectionType: section.type,
                settings: section.settings || {},
                position: i,
                enabled: true
              }
            });
            
            console.log(`    ✨ Created section: ${section.type}`);
          }
        }
      }

      console.log(`  🎉 Store ${store.subdomain} sections initialized!`);
    }

    console.log('\n✅ All stores processed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing store sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
initStoreSections();