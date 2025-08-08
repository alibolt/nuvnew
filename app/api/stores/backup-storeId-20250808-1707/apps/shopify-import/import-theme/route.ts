import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { theme, sections } = body;

    if (!theme) {
      return NextResponse.json(
        { error: 'Theme data is required' },
        { status: 400 }
      );
    }

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

    // Extract theme settings
    const themeSettings = {
      name: theme.name || 'Imported Theme',
      colors: theme.colors || {},
      fonts: theme.fonts || {},
      socialLinks: theme.socialLinks || {},
      announcement: theme.announcement || {},
      footer: theme.footer || {},
    };

    // Process sections
    const importedSections = sections?.map((section: any, index: number) => ({
      type: section.type,
      content: section.content,
      position: index,
    })) || [];

    // Return summary
    return NextResponse.json({
      success: true,
      theme: themeSettings,
      sectionsImported: importedSections.length,
      message: 'Theme data processed successfully. In production, this would be saved to the database.',
    });
  } catch (error) {
    console.error('Error importing theme:', error);
    return NextResponse.json(
      { error: 'Failed to import theme' },
      { status: 500 }
    );
  }
}