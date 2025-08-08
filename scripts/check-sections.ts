import { prisma } from '@/lib/prisma';

async function checkSections() {
  try {
    console.log('Checking database sections...\n');

    // Get all stores
    const stores = await prisma.store.findMany({
      include: {
        activeTheme: true
      }
    });

    console.log(`Found ${stores.length} stores\n`);

    for (const store of stores) {
      console.log(`Store: ${store.name} (${store.subdomain})`);
      console.log(`  ID: ${store.id}`);
      console.log(`  Theme: ${store.activeTheme?.code || 'none'}`);
      
      // Get templates
      const templates = await prisma.storeTemplate.findMany({
        where: { storeId: store.id },
        include: {
          sections: true
        }
      });

      console.log(`  Templates: ${templates.length}`);
      
      for (const template of templates) {
        console.log(`    - ${template.templateType}: ${template.sections.length} sections`);
        if (template.sections.length > 0) {
          console.log(`      First section: ${template.sections[0].sectionType} (ID: ${template.sections[0].id})`);
        }
      }
      
      console.log('');
    }

    // Check total sections
    const totalSections = await prisma.storeSectionInstance.count();
    console.log(`Total sections in database: ${totalSections}`);

  } catch (error) {
    console.error('Error checking sections:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSections();