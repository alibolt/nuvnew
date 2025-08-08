import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanThemes() {
  try {
    // First, delete tech-store and fresh-market themes
    const deletedThemes = await prisma.theme.deleteMany({
      where: {
        OR: [
          { code: 'tech-store' },
          { code: 'fresh-market' }
        ]
      }
    });
    
    console.log(`Deleted ${deletedThemes.count} unused themes`);

    // Update the minimal theme
    const updated = await prisma.theme.update({
      where: {
        code: 'minimal'
      },
      data: {
        name: 'Minimal',
        description: 'A versatile theme perfect for all types of stores',
        category: 'general',
        previewUrl: '/themes/minimal/preview.svg'
      }
    });

    console.log('Updated Minimal theme:', {
      name: updated.name,
      code: updated.code,
      description: updated.description
    });

  } catch (error) {
    console.error('Error cleaning themes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanThemes();