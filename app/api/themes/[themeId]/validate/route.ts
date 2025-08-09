import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { validateTheme } from '@/lib/theme-validator';
import { apiResponse } from '@/lib/api/response';

// POST /api/themes/[themeId]/validate - Validate a theme
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { themeId } = await params;

    // Run validation
    const validationResult = await validateTheme(themeId);

    // Log validation attempt
    console.log(`[Theme Validation] Theme: ${themeId}, Valid: ${validationResult.valid}`);
    if (!validationResult.valid) {
      console.log('[Theme Validation] Errors:', validationResult.errors);
    }
    if (validationResult.warnings.length > 0) {
      console.log('[Theme Validation] Warnings:', validationResult.warnings);
    }

    return NextResponse.json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    console.error('[Theme Validation API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate theme',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}