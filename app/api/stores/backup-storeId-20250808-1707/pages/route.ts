import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/pages - Get all pages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await requireAuth();
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
    
    const pages = await prisma.page.findMany({
      where: { 
        storeId,
        isPublished: true 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/pages - Create a new page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await requireAuth();

    const { storeId } = await params;
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

    // Create slug from title if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: {
        storeId_slug: {
          storeId,
          slug: finalSlug
        }
      }
    });

    if (existingPage) {
      return NextResponse.json(
        { error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        storeId,
        title,
        slug: finalSlug,
        content: content || '',
        seoTitle,
        seoDescription,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}