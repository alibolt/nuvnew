import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getThemeAvailableSections } from '@/lib/theme-registry/server-theme-registry';
import { apiResponse } from '@/lib/api/response';

// GET /api/themes/[themeId]/sections - Get available sections for a theme
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { themeId } = await params;

    // Load available sections for the theme
    const sections = await getThemeAvailableSections(themeId);
    
    if (!sections) {
      // Return empty array instead of error for MVP
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    return NextResponse.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('[Theme Sections API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load theme sections' },
      { status: 500 }
    );
  }
}