import { prisma } from '@/lib/prisma';

export async function checkSearchAppInstalled(storeId: string): Promise<{
  installed: boolean;
  enabled: boolean;
  settings?: any;
}> {
  try {
    // Get Smart Search app
    const smartSearchApp = await prisma.app.findUnique({
      where: { code: 'smart-search' }
    });

    if (!smartSearchApp) {
      return { installed: false, enabled: false };
    }

    // Check if app is installed for this store
    const appInstall = await prisma.appInstall.findUnique({
      where: {
        storeId_appId: {
          storeId: storeId,
          appId: smartSearchApp.id
        }
      }
    });

    if (!appInstall || appInstall.status !== 'active') {
      return { installed: false, enabled: false };
    }

    // Get search settings
    const searchSettings = await prisma.searchSettings.findUnique({
      where: { storeId }
    });

    return {
      installed: true,
      enabled: true,
      settings: searchSettings
    };
  } catch (error) {
    console.error('Error checking search app installation:', error);
    return { installed: false, enabled: false };
  }
}