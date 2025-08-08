import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateThemeName() {
  try {
    // Update theme name from Minimal Fashion to Minimal
    const updated = await prisma.theme.updateMany({
      where: {
        code: 'minimal'
      },
      data: {
        name: 'Minimal',
        description: 'A versatile theme perfect for all types of stores'
      }
    });

    console.log(`Updated ${updated.count} theme(s)`);

    // Also update any minimal-fashion code references to minimal
    const updatedOldCode = await prisma.theme.updateMany({
      where: {
        code: 'minimal-fashion'
      },
      data: {
        code: 'minimal',
        name: 'Minimal',
        description: 'A versatile theme perfect for all types of stores'
      }
    });

    if (updatedOldCode.count > 0) {
      console.log(`Updated ${updatedOldCode.count} theme(s) with old code`);
    }

  } catch (error) {
    console.error('Error updating theme name:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateThemeName();