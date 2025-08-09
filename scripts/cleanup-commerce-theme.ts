/**
 * Script to clean up commerce theme references from database
 * Run with: npx tsx scripts/cleanup-commerce-theme.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupCommerceTheme() {
  console.log('Starting cleanup of commerce theme references...');
  
  try {
    // Update stores using commerce theme to use base theme instead
    const result = await prisma.store.updateMany({
      where: {
        themeCode: 'commerce'
      },
      data: {
        themeCode: 'base'
      }
    });
    
    console.log(`Updated ${result.count} stores from commerce to base theme`);
    
    console.log('Cleanup completed successfully!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCommerceTheme();