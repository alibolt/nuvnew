import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { themeExists } from '@/lib/theme-registry/server-theme-registry';
import { apiResponse } from '@/lib/api/response';

// POST /api/themes/[themeId]/activate - Activate a theme for a store
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
    const { storeId } = await request.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Check if theme exists
    const exists = await themeExists(themeId);
    if (!exists) {
      return apiResponse.notFound('Theme not found');
    }

    // Update store's active theme
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { themeCode: themeId }
    });

    return NextResponse.json({
      success: true,
      data: {
        storeId: updatedStore.id,
        themeCode: updatedStore.themeCode,
        message: `Theme ${themeId} activated successfully`
      }
    });
  } catch (error) {
    console.error('[Theme Activate API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to activate theme' },
      { status: 500 }
    );
  }
}