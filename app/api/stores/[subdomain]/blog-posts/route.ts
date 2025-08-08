import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/blog-posts - Get all blog posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { searchParams } = new URL(req.url);
    const published = searchParams.get('published');
    
    // Get store first
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store');
    }

    const where: any = {
      storeId: store.id
    };

    if (published === 'true') {
      where.isPublished = true;
    }
    
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        blog: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return apiResponse.success(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return handleApiError(error, 'Failed to fetch posts');
  }
}

// POST /api/stores/[subdomain]/blog-posts - Create a new post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await req.json();
    const { 
      title, slug, excerpt, content, featuredImage, 
      author, tags, metaTitle, metaDescription, isPublished 
    } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store');
    }

    // Get or create default blog
    let blog = await prisma.blog.findFirst({
      where: {
        storeId: store.id
      }
    });

    if (!blog) {
      // Create default blog if none exists
      blog = await prisma.blog.create({
        data: {
          storeId: store.id,
          title: 'Blog',
          slug: 'blog',
          description: 'Main blog for the store'
        }
      });
    }

    // Create slug from title if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists in the blog
    const existingPost = await prisma.blogPost.findUnique({
      where: {
        blogId_slug: {
          blogId: blog.id,
          slug: finalSlug
        }
      }
    });

    if (existingPost) {
      return apiResponse.conflict('A post with this slug already exists');
    }

    const post = await prisma.blogPost.create({
      data: {
        storeId: store.id,
        blogId: blog.id,
        title,
        slug: finalSlug,
        excerpt: excerpt || '',
        content: content || '',
        featuredImage,
        author: author || session.user.name || 'Admin',
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    });

    return apiResponse.success(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return handleApiError(error, 'Failed to create post');
  }
}