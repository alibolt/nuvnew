import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/pages/[pageId] - Get a single page
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; pageId: string }> }
) {
  try {
    const { subdomain, pageId } = await params;
    
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
        store: {
          subdomain
        }
      }
    });

    if (!page) {
      return apiResponse.notFound('Page ');
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

// PUT /api/stores/[subdomain]/pages/[pageId] - Update a page
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; pageId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain, pageId } = await params;
    const body = await req.json();
    const { title, slug, content, seoTitle, seoDescription, isPublished } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if page exists
    const existingPage = await prisma.page.findFirst({
      where: {
        id: pageId,
        storeId: store.id
      }
    });

    if (!existingPage) {
      return apiResponse.notFound('Page ');
    }

    // If changing slug, check if new slug already exists
    if (slug && slug !== existingPage.slug) {
      const slugConflict = await prisma.page.findUnique({
        where: {
          storeId_slug: {
            storeId: store.id,
            slug
          }
        }
      });

      if (slugConflict) {
        return apiResponse.badRequest('A page with this slug already exists');
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

// DELETE /api/stores/[subdomain]/pages/[pageId] - Delete a page
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; pageId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain, pageId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Delete the page
    await prisma.page.delete({
      where: { id: pageId }
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}