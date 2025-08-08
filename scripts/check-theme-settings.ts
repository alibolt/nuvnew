import { prisma } from '../lib/prisma';

async function checkThemeSettings() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        themeSettings: true
      }
    });
    
    for (const store of stores) {
      console.log('\nStore:', store.name, '(' + store.subdomain + ')');
      console.log('Theme Settings:', JSON.stringify(store.themeSettings, null, 2));
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkThemeSettings();