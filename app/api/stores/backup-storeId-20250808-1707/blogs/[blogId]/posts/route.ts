import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[storeId]/blogs/[blogId]/posts - Get all posts in a blog
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; blogId: string }> }
) {
  try {
    const { storeId, blogId } = await params;
    const { searchParams } = new URL(req.url);
    const published = searchParams.get('published');
    
    const where: any = {
      blogId,
      storeId
    };

    if (published === 'true') {
      where.isPublished = true;
    }
    
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        featuredImage: true,
        author: true,
        tags: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/stores/[storeId]/blogs/[blogId]/posts - Create a new post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string; blogId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, blogId } = await params;
    const body = await req.json();
    const { 
      title, slug, excerpt, content, featuredImage, 
      author, tags, seoTitle, seoDescription, isPublished 
    } = body;

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

    // Verify blog exists
    const blog = await prisma.blog.findFirst({
      where: {
        id: blogId,
        storeId
      }
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Create slug from title if not provided
    const finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: {
        blogId_slug: {
          blogId,
          slug: finalSlug
        }
      }
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }

    const post = await prisma.blogPost.create({
      data: {
        blogId,
        storeId,
        title,
        slug: finalSlug,
        excerpt,
        content: content || '',
        featuredImage,
        author: author || session.user.name || 'Anonymous',
        tags: tags ? tags.join(',') : null,
        seoTitle,
        seoDescription,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}