import { prisma } from '@/lib/prisma';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';

async function initializeThemeSections() {
  try {
    console.log('Starting theme sections initialization...');

    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        activeTheme: true
      }
    });

    console.log(`Found ${stores.length} stores to process`);

    for (const store of stores) {
      console.log(`\nProcessing store: ${store.name} (${store.subdomain})`);
      
      const themeCode = store.activeTheme?.code || 'minimal';
      const templateTypes = ['homepage', 'collection', 'product', 'search', 'page'];

      for (const templateType of templateTypes) {
        console.log(`  - Checking template: ${templateType}`);
        
        // Get or create template
        let template = await prisma.storeTemplate.findFirst({
          where: {
            storeId: store.id,
            templateType,
            isDefault: true,
          }
        });

        if (!template) {
          template = await prisma.storeTemplate.create({
            data: {
              storeId: store.id,
              themeId: store.activeThemeId || '',
              templateType,
              name: templateType.charAt(0).toUpperCase() + templateType.slice(1),
              isDefault: true,
              enabled: true,
              settings: {}
            }
          });
          console.log(`    Created template: ${templateType}`);
        }

        // Check if template has sections
        const sectionCount = await prisma.storeSectionInstance.count({
          where: { templateId: template.id }
        });

        if (sectionCount === 0) {
          // Load sections from JSON template
          const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(
            store.id,
            themeCode,
            templateType
          );

          if (compiledTemplate && compiledTemplate.sections.length > 0) {
            // Create section instances
            const sectionInstances = compiledTemplate.sections.map((section, index) => ({
              templateId: template.id,
              sectionType: section.type,
              position: index,
              enabled: true,
              settings: section.settings || {}
            }));

            await prisma.storeSectionInstance.createMany({
              data: sectionInstances
            });

            console.log(`    Created ${sectionInstances.length} sections for ${templateType}`);
          } else {
            console.log(`    No sections found in JSON template for ${templateType}`);
          }
        } else {
          console.log(`    Template already has ${sectionCount} sections`);
        }
      }
    }

    console.log('\nTheme sections initialization completed!');
  } catch (error) {
    console.error('Error initializing theme sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the initialization
initializeThemeSections();