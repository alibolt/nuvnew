import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';
import { nestBlocks } from '@/lib/utils/nest-blocks';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('TEMPLATE_BY_TYPE_API');

// GET /api/stores/[subdomain]/templates/by-type/[type]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; type: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, type } = await params;
    logger.debug('Request for:', { subdomain, type });
    logger.debug('Session user ID:', session.user.id);

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

    // Use hybrid template loader with store's actual theme
    const themeCode = store.themeCode || 'base';
    logger.debug('Using theme:', themeCode);
    
    // Clear cache to ensure fresh data
    const cacheKey = `${store.id}:${type}`;
    (hybridTemplateLoader as any).templateCache?.delete(cacheKey);
    logger.debug('Cleared cache for:', cacheKey);
    
    const compiledTemplate = await hybridTemplateLoader.getCompiledTemplate(subdomain, themeCode, type);
    logger.debug('Compiled template sections:', compiledTemplate?.sections?.length || 0);

    if (compiledTemplate) {
      // Get the template with its sections from database (already synced by hybrid loader)
      // Force fresh query without any caching
      const templateWithSections = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType: type,
          isDefault: true,
        },
        include: {
          sections: {
            include: {
              blocks: {
                orderBy: { position: 'asc' }
              }
            },
            orderBy: { position: 'asc' }
          }
        }
      });
      
      logger.debug('Raw template query result:', {
        templateFound: !!templateWithSections,
        sectionsCount: templateWithSections?.sections?.length || 0,
        firstSectionBlocks: templateWithSections?.sections?.[0]?.blocks?.length || 0,
        firstSection: templateWithSections?.sections?.[0] ? {
          id: templateWithSections.sections[0].id,
          type: templateWithSections.sections[0].sectionType,
          hasBlocks: !!templateWithSections.sections[0].blocks,
          blocksCount: templateWithSections.sections[0].blocks?.length || 0,
          firstBlock: templateWithSections.sections[0].blocks?.[0]
        } : null
      });
      
      if (!templateWithSections) {
        logger.warn('Template not found in database after sync');
        return apiResponse.notFound('Template ');
      }

      // Use database sections (they should be synced at this point)
      const sections = templateWithSections.sections.map((section: any) => {
        logger.debug('Section blocks count:', section.blocks?.length || 0);
        logger.debug('Section blocks data:', section.blocks);
        
        return {
          id: section.id,
          type: section.sectionType,
          sectionType: section.sectionType,
          title: (section.sectionType || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
          settings: section.settings || {},
          enabled: section.enabled !== false,
          position: section.position,
          blocks: section.blocks?.map((block: any) => {
            // Return the block as-is, maintaining the structure from database
            // Don't move nested blocks from settings.blocks to blocks array
            // The frontend components expect nested blocks to be in settings.blocks
            logger.debug('Processing block:', {
              blockId: block.id,
              type: block.type,
              hasSettingsBlocks: !!(block.settings?.blocks),
              settingsBlocksCount: block.settings?.blocks?.length || 0
            });
            
            return {
              ...block
            };
          }) || []
        };
      });
      
      logger.debug('Returning', sections.length, 'sections from database');
      logger.debug('First section example:', sections?.[0]);
      
      // Return template with sections
      const responseData = {
        id: templateWithSections.id,
        storeId: templateWithSections.storeId,
        templateType: templateWithSections.templateType,
        name: templateWithSections.name,
        isDefault: templateWithSections.isDefault,
        enabled: templateWithSections.enabled,
        sections: sections
      };
      
      logger.debug('Final response data:', {
        ...responseData,
        sectionsCount: responseData.sections?.length || 0
      });
      
      // Add debug header to see what's being returned
      console.log('[TEMPLATE_BY_TYPE_API] Store:', store.subdomain, 'Template:', type);
      console.log('[TEMPLATE_BY_TYPE_API] Store ID:', store.id);
      console.log('[TEMPLATE_BY_TYPE_API] Template ID:', templateWithSections.id);
      console.log('[TEMPLATE_BY_TYPE_API] Returning sections for type:', type);
      console.log('[TEMPLATE_BY_TYPE_API] Section count:', responseData.sections.length);
      console.log('[TEMPLATE_BY_TYPE_API] Section types:', responseData.sections.map((s: any) => s.sectionType));
      console.log('[TEMPLATE_BY_TYPE_API] Section IDs:', responseData.sections.map((s: any) => s.id));
      
      return apiResponse.success(responseData);
    }

    // Fallback to DB-only template
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId: store.id,
        templateType: type,
        isDefault: true,
      },
      include: {
        sections: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!template) {
      logger.warn('No template found in database');
      return apiResponse.notFound('Template ');
    }
    
    logger.debug('Fallback to DB template with sections:', template.sections?.length || 0);

    // Ensure sections have all required properties for the UI
    const mappedSections = template.sections.map((section: any) => ({
      id: section.id,
      type: section.type || section.sectionType,
      sectionType: section.sectionType || section.type,
      title: (section.sectionType || section.type || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      settings: section.settings || {},
      enabled: section.enabled !== false,
      position: section.position,
      blocks: section.blocks || []
    }));

    return apiResponse.success({
      ...template,
      sections: mappedSections
    });
  } catch (error) {
    logger.error('Error fetching template:', error);
    return handleApiError(error, 'template-by-type');
  }
}