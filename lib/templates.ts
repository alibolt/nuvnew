import { prisma } from '@/lib/prisma';

/**
 * Get template by type for a store
 */
export async function getTemplateByType(storeId: string, type: string) {
  try {
    const template = await prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType: type,
        enabled: true
      },
      include: {
        sections: {
          where: { enabled: true },
          orderBy: { position: 'asc' },
          include: {
            blocks: {
              where: { enabled: true },
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    });
    
    return template;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

/**
 * Get all templates for a store
 */
export async function getStoreTemplates(storeId: string) {
  try {
    const templates = await prisma.storeTemplate.findMany({
      where: {
        storeId,
        enabled: true
      },
      include: {
        sections: {
          where: { enabled: true },
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return templates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

/**
 * Get default template for a type
 */
export async function getDefaultTemplate(storeId: string, type: string) {
  try {
    // First try to get store-specific template
    let template = await getTemplateByType(storeId, type);
    
    if (!template) {
      // Fallback to default system template
      template = await prisma.storeTemplate.findFirst({
        where: {
          type,
          isDefault: true,
          enabled: true
        },
        include: {
          sections: {
            where: { enabled: true },
            orderBy: { position: 'asc' },
            include: {
              blocks: {
                where: { enabled: true },
                orderBy: { position: 'asc' }
              }
            }
          }
        }
      });
    }
    
    return template;
  } catch (error) {
    console.error('Error fetching default template:', error);
    return null;
  }
}