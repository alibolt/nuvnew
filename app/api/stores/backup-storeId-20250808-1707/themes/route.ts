import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/themes - Get available themes
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;

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

    // Get all available themes
    const themes = await prisma.theme.findMany({
      orderBy: {
        category: 'asc',
      },
    });

    // Parse JSON fields
    const parsedThemes = themes.map(theme => ({
      ...theme,
      features: JSON.parse(theme.features as string),
      settings: JSON.parse(theme.settings as string),
      styles: theme.styles ? JSON.parse(theme.styles as string) : null,
    }));

    return NextResponse.json({
      themes: parsedThemes,
      activeThemeId: store.activeThemeId,
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}