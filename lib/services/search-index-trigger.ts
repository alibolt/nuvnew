/**
 * Trigger search index update via internal webhook
 * This is called from API routes when entities are created/updated/deleted
 */
export async function triggerSearchIndexUpdate(
  storeId: string,
  entityType: 'product' | 'collection' | 'page' | 'blog_post',
  entityId: string,
  action: 'create' | 'update' | 'delete'
) {
  try {
    // In development, call the service directly
    if (process.env.NODE_ENV === 'development') {
      const { SearchIndexingService } = await import('@/lib/services/search-indexing.service');
      const { prisma } = await import('@/lib/prisma');
      
      if (action === 'delete') {
        await SearchIndexingService.removeFromIndex(storeId, entityType, entityId);
      } else {
        switch (entityType) {
          case 'product':
            const product = await prisma.product.findUnique({
              where: { id: entityId },
              include: { variants: true, category: true }
            });
            if (product) await SearchIndexingService.indexProduct(product);
            break;
          case 'collection':
            const category = await prisma.category.findUnique({
              where: { id: entityId }
            });
            if (category) await SearchIndexingService.indexCategory(category);
            break;
          case 'page':
            const page = await prisma.page.findUnique({
              where: { id: entityId }
            });
            if (page) await SearchIndexingService.indexPage(page);
            break;
          case 'blog_post':
            const blogPost = await prisma.blogPost.findUnique({
              where: { id: entityId }
            });
            if (blogPost) await SearchIndexingService.indexBlogPost(blogPost);
            break;
        }
      }
      return;
    }

    // In production, call the webhook
    const webhookUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/search-index`
      : 'http://localhost:3000/api/webhooks/search-index';

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_WEBHOOK_SECRET}`
      },
      body: JSON.stringify({
        storeId,
        entityType,
        entityId,
        action
      })
    });
  } catch (error) {
    console.error('Failed to trigger search index update:', error);
  }
}