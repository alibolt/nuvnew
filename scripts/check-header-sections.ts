import { prisma } from '../lib/prisma';

async function checkHeaderSections() {
  try {
    const stores = await prisma.store.findMany();
    
    for (const store of stores) {
      console.log(`\nStore: ${store.name} (${store.id})`);
      
      const sections = await prisma.storeSectionInstance.findMany({
        where: { 
          storeId: store.id,
          sectionType: 'header'
        }
      });
      
      console.log(`Header sections found: ${sections.length}`);
      
      sections.forEach(section => {
        console.log({
          id: section.id,
          sectionType: section.sectionType,
          enabled: section.enabled,
          position: section.position,
          settings: section.settings
        });
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHeaderSections();