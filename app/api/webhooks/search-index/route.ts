import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { SearchIndexingService } from '@/lib/services/search-indexing.service';

// This webhook can be called internally when entities are created/updated
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storeId, entityType, entityId, action } = body;

    if (!storeId || !entityType || !entityId || !action) {
      return apiResponse.badRequest('Missing required fields');
    }

    // Verify the request is coming from our own system
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.INTERNAL_WEBHOOK_SECRET}`) {
      return apiResponse.unauthorized();
    }

    if (action === 'delete') {
      await SearchIndexingService.removeFromIndex(storeId, entityType, entityId);
    } else {
      // For create/update, fetch the entity and index it
      switch (entityType) {
        case 'product':
          const product = await prisma.product.findUnique({
            where: { id: entityId },
            include: {
              variants: true,
              category: true
            }
          });
          if (product) {
            await SearchIndexingService.indexProduct(product);
          }
          break;

        case 'collection':
          const category = await prisma.category.findUnique({
            where: { id: entityId }
          });
          if (category) {
            await SearchIndexingService.indexCategory(category);
          }
          break;

        case 'page':
          const page = await prisma.page.findUnique({
            where: { id: entityId }
          });
          if (page) {
            await SearchIndexingService.indexPage(page);
          }
          break;

        case 'blog_post':
          const blogPost = await prisma.blogPost.findUnique({
            where: { id: entityId }
          });
          if (blogPost) {
            await SearchIndexingService.indexBlogPost(blogPost);
          }
          break;
      }
    }

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Search index webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}