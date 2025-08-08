import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/pages/[pageId] - Get a single page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; pageId: string }> }
) {
  try {
    const { storeId, pageId } = await params;
    
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        storeId
      }
    });

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page' },
      { status: 500 }
    );
  }
}

// PUT /api/stores/[storeId]/pages/[pageId] - Update a page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; pageId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, pageId } = await params;
    const body = await req.json();
    const { title, slug, content, seoTitle, seoDescription, isPublished } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if page exists
    const existingPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        storeId
      }
    });

    if (!existingPage) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // If changing slug, check if new slug already exists
    if (slug && slug !== existingPage.slug) {
      const slugConflict = await prisma.page.findUnique({
        where: {
          storeId_slug: {
            storeId,
            slug
          }
        }
      });

      if (slugConflict) {
        return NextResponse.json(
          { error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update publishedAt if publishing status changes
    const publishedAt = isPublished && !existingPage.isPublished 
      ? new Date() 
      : existingPage.publishedAt;

    const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
        title,
        slug,
        content,
        seoTitle,
        seoDescription,
        isPublished,
        publishedAt,
      }
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

// DELETE /api/stores/[storeId]/pages/[pageId] - Delete a page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; pageId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, pageId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Delete the page
    await prisma.page.delete({
      where: { id: pageId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}