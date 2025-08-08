import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicateSections() {
  try {
    // Find templates with duplicate sections
    const templates = await prisma.storeTemplate.findMany({
      include: {
        sections: {
          orderBy: { position: 'asc' }
        }
      }
    });

    console.log(`Found ${templates.length} templates`);

    for (const template of templates) {
      console.log(`\nTemplate: ${template.name} (${template.templateType})`);
      console.log(`Sections: ${template.sections.length}`);

      // Group sections by type and position
      const sectionGroups = template.sections.reduce((acc, section) => {
        const key = `${section.sectionType}-${section.position}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(section);
        return acc;
      }, {} as Record<string, any[]>);

      // Find duplicates
      let duplicatesRemoved = 0;
      for (const [key, sections] of Object.entries(sectionGroups)) {
        if (sections.length > 1) {
          console.log(`  Found ${sections.length} duplicates for ${key}`);
          
          // Keep the first one, delete the rest
          const toDelete = sections.slice(1);
          for (const section of toDelete) {
            await prisma.storeSectionInstance.delete({
              where: { id: section.id }
            });
            duplicatesRemoved++;
          }
        }
      }

      if (duplicatesRemoved > 0) {
        console.log(`  Removed ${duplicatesRemoved} duplicate sections`);
      } else {
        console.log(`  No duplicates found`);
      }
    }

    console.log('\n✅ Cleanup completed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDuplicateSections();