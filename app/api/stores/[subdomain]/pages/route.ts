import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/pages - Get all pages
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiResponse.unauthorized();
    }
    
    const { subdomain } = await params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }
    
    const pages = await prisma.page.findMany({
      where: { 
        storeId: store.id
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

    return apiResponse.success(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return handleApiError(error, 'Failed to fetch pages');
  }
}

// POST /api/stores/[subdomain]/pages - Create a new page
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
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

    // Create slug from title if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: finalSlug
        }
      }
    });

    if (existingPage) {
      return apiResponse.badRequest('A page with this slug already exists');
    }

    const page = await prisma.page.create({
      data: {
        storeId: store.id,
        title,
        slug: finalSlug,
        content: content || '',
        seoTitle,
        seoDescription,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    });

    return apiResponse.success(page);
  } catch (error) {
    console.error('Error creating page:', error);
    return handleApiError(error, 'Failed to create page');
  }
}