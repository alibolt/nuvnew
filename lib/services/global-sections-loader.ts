import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('GlobalSectionsLoader');

export interface GlobalSections {
  announcementBar: any | null;
  header: any | null;
  footer: any | null;
}

export class GlobalSectionsLoader {
  private cache: Map<string, GlobalSections> = new Map();
  
  /**
   * Get global header, footer and announcement bar sections for a store
   * These are ALWAYS found by looking for these section types in the homepage template
   */
  async getGlobalSections(subdomain: string, themeCode: string, pageType?: string): Promise<GlobalSections> {
    // IMPORTANT: Always use 'homepage' for cache key to ensure consistency
    // Global sections should be the same across all pages
    const cacheKey = `${subdomain}:${themeCode}:homepage`;
    
    console.log('[GlobalSectionsLoader] Loading global sections:', { subdomain, themeCode, pageType });
    logger.debug('Loading global sections:', { subdomain, themeCode });
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('[GlobalSectionsLoader] Returning from cache');
      logger.debug('Returning from cache');
      return this.cache.get(cacheKey)!;
    }
    
    try {
      // Get store with homepage template
      // Global sections MUST always come from homepage template
      const store = await prisma.store.findUnique({
        where: { subdomain },
        include: {
          templates: {
            where: {
              templateType: 'homepage',
              enabled: true
            },
            include: {
              sections: {
                where: {
                  sectionType: {
                    in: ['announcement-bar', 'header', 'footer']
                  }
                  // Remove enabled filter to include all global sections
                },
                include: {
                  blocks: {
                    // Also remove enabled filter for blocks
                    orderBy: { position: 'asc' }
                  }
                },
                orderBy: { position: 'asc' }
              }
            }
          }
        }
      });
      
      if (!store) {
        logger.debug('Store not found');
        return { announcementBar: null, header: null, footer: null };
      }
      
      const template = store.templates[0];
      
      if (!template) {
        logger.debug('Template not found');
        return { announcementBar: null, header: null, footer: null };
      }
      
      logger.debug('Found template sections:', template.sections.length);
      
      // Extract global sections from template
      let announcementSection = null;
      let headerSection = null;
      let footerSection = null;
      
      for (const section of template.sections) {
        const sectionData = {
          id: section.id,
          type: section.sectionType,
          sectionType: section.sectionType,
          settings: section.settings || {},
          enabled: section.enabled,
          position: section.position,
          blocks: section.blocks || []
        };
        
        switch (section.sectionType) {
          case 'announcement-bar':
            announcementSection = sectionData;
            break;
          case 'header':
            headerSection = sectionData;
            break;
          case 'footer':
            footerSection = sectionData;
            break;
        }
      }
      
      const globalSections = {
        announcementBar: announcementSection,
        header: headerSection,
        footer: footerSection
      };
      
      console.log('[GlobalSectionsLoader] Global sections found:', {
        announcementBar: !!announcementSection,
        header: headerSection,
        footer: !!footerSection,
        headerBlocks: headerSection?.blocks?.length || 0
      });
      
      logger.debug('Global sections found:', {
        announcementBar: !!announcementSection,
        header: !!headerSection,
        footer: !!footerSection
      });
      
      // Cache the result
      this.cache.set(cacheKey, globalSections);
      
      return globalSections;
    } catch (error) {
      logger.error('Error loading global sections:', error);
      return { announcementBar: null, header: null, footer: null };
    }
  }
  
  
  /**
   * Clear cache
   */
  clearCache() {
    console.log('[GlobalSectionsLoader] Clearing cache');
    this.cache.clear();
  }
}

// Create singleton instance
export const globalSectionsLoader = new GlobalSectionsLoader();

// Export helper functions for RSC
export const getGlobalSections = (subdomain: string, themeCode: string, pageType?: string) =>
  globalSectionsLoader.getGlobalSections(subdomain, themeCode, pageType);