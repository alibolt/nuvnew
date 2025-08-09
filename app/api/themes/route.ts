import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { discoverThemes } from '@/lib/theme-registry/server-theme-registry';
import { apiResponse } from '@/lib/api/response';

// GET /api/themes - List all available themes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Discover themes from filesystem
    const themes = await discoverThemes();
    
    // Add installation status and other metadata
    const themesWithStatus = themes.map(theme => ({
      ...theme,
      installed: true, // All discovered themes are considered installed in MVP
      active: false, // Can be determined by checking store's current theme
      canUninstall: theme.id !== 'base' // Base theme cannot be uninstalled
    }));
    
    return NextResponse.json({
      success: true,
      data: themesWithStatus
    });
  } catch (error) {
    console.error('[Themes API] Error listing themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list themes' },
      { status: 500 }
    );
  }
}