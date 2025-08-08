import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET /api/stores/[subdomain]/blog-posts/[postId] - Get a single blog post
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; postId: string }> }
) {
  try {
    const { subdomain, postId } = await params;
    
    // Get store first
    const store = await prisma.store.findFirst({
      where: { subdomain }
    });

    if (!store) {
      return apiResponse.notFound('Store');
    }

    const post = await prisma.blogPost.findFirst({
      where: {
        id: postId,
        storeId: store.id
      },
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

    if (!post) {
      return apiResponse.notFound('Post');
    }

    return apiResponse.success(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return handleApiError(error, 'Failed to fetch post');
  }
}

// PUT /api/stores/[subdomain]/blog-posts/[postId] - Update a blog post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain, postId } = await params;
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

    // Check if post exists
    const existingPost = await prisma.blogPost.findFirst({
      where: {
        id: postId,
        storeId: store.id
      }
    });

    if (!existingPost) {
      return apiResponse.notFound('Post');
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== existingPost.slug) {
      const duplicateSlug = await prisma.blogPost.findFirst({
        where: {
          storeId: store.id,
          slug,
          id: { not: postId }
        }
      });

      if (duplicateSlug) {
        return apiResponse.conflict('A post with this slug already exists');
      }
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id: postId },
      data: {
        title,
        slug: slug || existingPost.slug,
        excerpt: excerpt || '',
        content: content || '',
        featuredImage,
        author: author || existingPost.author,
        tags: Array.isArray(tags) ? tags.join(',') : tags || existingPost.tags,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        isPublished: isPublished ?? existingPost.isPublished,
        publishedAt: isPublished && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
      }
    });

    return apiResponse.success(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return handleApiError(error, 'Failed to update post');
  }
}

// DELETE /api/stores/[subdomain]/blog-posts/[postId] - Delete a blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string; postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain, postId } = await params;

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

    // Check if post exists
    const post = await prisma.blogPost.findFirst({
      where: {
        id: postId,
        storeId: store.id
      }
    });

    if (!post) {
      return apiResponse.notFound('Post');
    }

    await prisma.blogPost.delete({
      where: { id: postId }
    });

    return apiResponse.success({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return handleApiError(error, 'Failed to delete post');
  }
}