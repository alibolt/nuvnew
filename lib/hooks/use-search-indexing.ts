import { useEffect } from 'react';
import { SearchIndexingService } from '@/lib/services/search-indexing.service';

/**
 * Hook to automatically index content when it changes
 * This is a client-side hook for demonstration purposes
 * In production, you'd want to handle this server-side via webhooks or database triggers
 */
export function useSearchIndexing(
  entityType: 'product' | 'category' | 'page' | 'blog_post',
  entityData: any,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !entityData) return;

    const indexContent = async () => {
      try {
        switch (entityType) {
          case 'product':
            await SearchIndexingService.indexProduct(entityData);
            break;
          case 'category':
            await SearchIndexingService.indexCategory(entityData);
            break;
          case 'page':
            await SearchIndexingService.indexPage(entityData);
            break;
          case 'blog_post':
            await SearchIndexingService.indexBlogPost(entityData);
            break;
        }
      } catch (error) {
        console.error(`Error indexing ${entityType}:`, error);
      }
    };

    // Debounce indexing to avoid too many updates
    const timeoutId = setTimeout(indexContent, 1000);

    return () => clearTimeout(timeoutId);
  }, [entityType, entityData, enabled]);
}