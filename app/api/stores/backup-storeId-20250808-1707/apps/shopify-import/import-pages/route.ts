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
    const { pages } = body;

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Pages array is required' },
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

    // Import pages
    const importedPages = [];
    for (const page of pages) {
      try {
        const newPage = await prisma.page.create({
          data: {
            storeId: storeId,
            title: page.title,
            slug: page.handle || page.title.toLowerCase().replace(/\s+/g, '-'),
            content: page.content || page.body_html || '',
            isPublished: true,
            seoTitle: page.metaTitle || page.title,
            seoDescription: page.metaDescription || null,
            publishedAt: page.published_at ? new Date(page.published_at) : new Date(),
          },
        });

        importedPages.push(newPage);
      } catch (error) {
        console.error('Error importing page:', page.title, error);
        // Continue with next page
      }
    }

    return NextResponse.json({
      success: true,
      imported: importedPages.length,
      total: pages.length,
      pages: importedPages,
    });
  } catch (error) {
    console.error('Error importing pages:', error);
    return NextResponse.json(
      { error: 'Failed to import pages' },
      { status: 500 }
    );
  }
}