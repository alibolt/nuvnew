import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { migrateThemeSettings } from '@/lib/theme-settings-migration';

// POST /api/stores/[storeId]/themes/[themeId]/activate - Activate a theme
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; themeId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, themeId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current theme for migration
    const currentTheme = store.activeThemeId ? await prisma.theme.findUnique({
      where: { id: store.activeThemeId }
    }) : null;

    // Verify theme exists
    const theme = await prisma.theme.findUnique({
      where: {
        id: themeId,
      },
    });

    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    // Parse theme settings
    const newThemeDefaults = JSON.parse(theme.settings as string);
    const currentSettings = store.themeSettings || {};
    
    // Migrate settings if switching between different themes
    let migratedSettings = newThemeDefaults;
    if (currentTheme && currentTheme.code !== theme.code) {
      migratedSettings = migrateThemeSettings(
        currentSettings,
        newThemeDefaults,
        currentTheme.code,
        theme.code
      );
    } else if (currentTheme && currentTheme.code === theme.code) {
      // Same theme, keep current settings
      migratedSettings = currentSettings;
    }

    // Activate the theme
    const updatedStore = await prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        activeThemeId: themeId,
        themeSettings: migratedSettings,
      },
      include: {
        activeTheme: true,
      },
    });

    return NextResponse.json({
      success: true,
      activeTheme: {
        ...updatedStore.activeTheme,
        features: JSON.parse(updatedStore.activeTheme?.features as string || '[]'),
        settings: JSON.parse(updatedStore.activeTheme?.settings as string || '{}'),
        styles: updatedStore.activeTheme?.styles 
          ? JSON.parse(updatedStore.activeTheme.styles as string)
          : null,
      },
    });
  } catch (error) {
    console.error('Error activating theme:', error);
    return NextResponse.json(
      { error: 'Failed to activate theme' },
      { status: 500 }
    );
  }
}