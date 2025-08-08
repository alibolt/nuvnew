import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/blogs - Get all blogs
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    
    // Get store first
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const blogs = await prisma.blog.findMany({
      where: { storeId: store.id },
      include: {
        _count: {
          select: { posts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[subdomain]/blogs - Create a new blog
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await req.json();
    const { title, slug, description } = body;

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
    const existingBlog = await prisma.blog.findUnique({
      where: {
        storeId_slug: {
          storeId: store.id,
          slug: finalSlug
        }
      }
    });

    if (existingBlog) {
      return apiResponse.badRequest('A blog with this slug already exists');
    }

    const blog = await prisma.blog.create({
      data: {
        storeId: store.id,
        title,
        slug: finalSlug,
        description,
      }
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}