/**
 * Migration utilities for transitioning from store.primaryColor to theme settings colors
 */

import { prisma } from '@/lib/prisma';

/**
 * Syncs store.primaryColor with theme settings colors.primary
 * This ensures backward compatibility while encouraging use of theme settings
 */
export async function syncStorePrimaryColorWithThemeSettings(subdomain: string) {
  try {
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return null;
    }

    // Get active template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'homepage',
        enabled: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (!template) {
      // Create default homepage template if doesn't exist
      const newTemplate = await prisma.storeTemplate.create({
        data: {
          storeId: store.id,
          templateType: 'homepage',
          name: 'Default Homepage',
          isDefault: true,
          enabled: true,
          settings: {}
        }
      });
      return {};
    }

    let themeSettings = template.settings || {};

    // Check if colors.primary exists in theme settings
    const colorsPrimary = (themeSettings as any)['colors.primary'];
    
    if (!colorsPrimary && store.primaryColor) {
      // Migrate store.primaryColor to theme settings
      const updatedSettings = {
        ...themeSettings,
        'colors.primary': store.primaryColor,
        'colors.secondary': store.primaryColor, // Use same color for secondary initially
        'colors.accent': store.primaryColor,
        'buttons.primaryBackgroundColor': store.primaryColor,
        'buttons.primaryTextColor': '#FFFFFF', // White text for primary buttons
        'buttons.primaryHoverColor': darkenColor(store.primaryColor, 10),
        'buttons.secondaryBorderColor': store.primaryColor,
        'buttons.secondaryTextColor': store.primaryColor,
        'buttons.secondaryHoverBackgroundColor': store.primaryColor
      };

      // Update template with new settings
      await prisma.storeTemplate.update({
        where: { id: template.id },
        data: {
          settings: updatedSettings
        }
      });

      console.log(`Migrated primaryColor ${store.primaryColor} to theme settings for store ${subdomain}`);
      return updatedSettings;
    } else if (colorsPrimary && colorsPrimary !== store.primaryColor) {
      // Sync theme settings primary color back to store (for backward compatibility)
      await prisma.store.update({
        where: { id: store.id },
        data: {
          primaryColor: colorsPrimary
        }
      });

      console.log(`Synced theme settings primary color ${colorsPrimary} to store.primaryColor for ${subdomain}`);
    }

    return themeSettings;
  } catch (error) {
    console.error('Error syncing primary color:', error);
    return null;
  }
}

/**
 * Darken a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const num = parseInt(hex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  
  // Darken
  const newR = Math.max(0, Math.floor(r * (1 - percent / 100)));
  const newG = Math.max(0, Math.floor(g * (1 - percent / 100)));
  const newB = Math.max(0, Math.floor(b * (1 - percent / 100)));
  
  // Convert back to hex
  const newHex = ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
  return `#${newHex}`;
}

/**
 * Batch migrate all stores from primaryColor to theme settings
 */
export async function migrateAllStoresToThemeColors() {
  try {
    const stores = await prisma.store.findMany({
      where: {
        primaryColor: { not: null }
      },
      select: {
        subdomain: true,
        primaryColor: true
      }
    });

    console.log(`Found ${stores.length} stores to migrate`);

    for (const store of stores) {
      await syncStorePrimaryColorWithThemeSettings(store.subdomain);
    }

    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

/**
 * Get effective primary color for a store (theme settings takes precedence)
 */
export async function getEffectivePrimaryColor(subdomain: string): Promise<string> {
  const DEFAULT_PRIMARY_COLOR = '#2563EB';
  
  try {
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return DEFAULT_PRIMARY_COLOR;
    }

    // Check template settings first
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: 'homepage',
        enabled: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    if (template?.settings) {
      const themeColorsPrimary = (template.settings as any)['colors.primary'];
      if (themeColorsPrimary) {
        return themeColorsPrimary;
      }
    }

    // Fall back to store.primaryColor
    if (store.primaryColor) {
      return store.primaryColor;
    }

    return DEFAULT_PRIMARY_COLOR;
  } catch (error) {
    console.error('Error getting effective primary color:', error);
    return DEFAULT_PRIMARY_COLOR;
  }
}