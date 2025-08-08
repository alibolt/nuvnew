import { prisma } from '../lib/prisma';

async function reorderSections() {
  // Find the store
  const store = await prisma.store.findFirst();
  
  if (!store) {
    console.error('No store found');
    return;
  }

  // Get all sections
  const sections = await prisma.storeSectionInstance.findMany({
    where: { storeId: store.id },
    orderBy: { createdAt: 'asc' }
  });

  console.log('Current sections:');
  sections.forEach(s => {
    console.log(`- ${s.sectionType} (position: ${s.position})`);
  });

  // Define desired order
  const desiredOrder = [
    'hero',
    'featured-products', 
    'collections',
    'image-with-text',
    'newsletter'
  ];

  // Sort sections according to desired order
  const sortedSections = sections.sort((a, b) => {
    const aIndex = desiredOrder.indexOf(a.sectionType);
    const bIndex = desiredOrder.indexOf(b.sectionType);
    
    // If both are in desired order, sort by that
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in desired order, it comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Otherwise keep existing order
    return a.position - b.position;
  });

  // Update positions
  console.log('\nUpdating positions:');
  for (let i = 0; i < sortedSections.length; i++) {
    await prisma.storeSectionInstance.update({
      where: { id: sortedSections[i].id },
      data: { position: i }
    });
    console.log(`- ${sortedSections[i].sectionType} -> position ${i}`);
  }

  console.log('\nSection order updated successfully');
}

reorderSections()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });