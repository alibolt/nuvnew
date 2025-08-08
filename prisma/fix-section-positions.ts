import { prisma } from '../lib/prisma';

async function fixSectionPositions() {
  // Find the store
  const store = await prisma.store.findFirst();
  
  if (!store) {
    console.error('No store found');
    return;
  }

  // Get all sections ordered by current position
  const sections = await prisma.storeSectionInstance.findMany({
    where: { storeId: store.id },
    orderBy: { position: 'asc' }
  });

  console.log(`Found ${sections.length} sections`);

  // Update positions to ensure they are sequential starting from 0
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].position !== i) {
      await prisma.storeSectionInstance.update({
        where: { id: sections[i].id },
        data: { position: i }
      });
      console.log(`Updated section ${sections[i].id} position from ${sections[i].position} to ${i}`);
    }
  }

  console.log('Section positions fixed');
}

fixSectionPositions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });