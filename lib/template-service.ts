import { PrismaClient, StoreTemplate, Prisma } from '@prisma/client';
import { 
  TemplateType, 
  PageType, 
  StoreTemplateWithRelations, 
  CreateTemplateInput,
  TemplateSelectionResult,
  getPageTypeFromTemplate 
} from '@/types/template';

export class TemplateService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get template for a specific entity (product, category, or page)
   */
  async getTemplateForEntity(
    entityType: 'product' | 'category' | 'page',
    entityId: string
  ): Promise<TemplateSelectionResult | null> {
    let entity: any;
    let defaultTemplateType: string;

    switch (entityType) {
      case 'product':
        entity = await this.prisma.product.findUnique({
          where: { id: entityId },
          include: {
            template: {
              include: {
                sections: {
                  where: { enabled: true },
                  orderBy: { position: 'asc' }
                },
                theme: true,
                store: true
              }
            },
            store: true
          }
        });
        defaultTemplateType = 'product.default';
        break;

      case 'category':
        entity = await this.prisma.category.findUnique({
          where: { id: entityId },
          include: {
            template: {
              include: {
                sections: {
                  where: { enabled: true },
                  orderBy: { position: 'asc' }
                },
                theme: true,
                store: true
              }
            },
            store: true
          }
        });
        defaultTemplateType = 'collection.default';
        break;

      case 'page':
        entity = await this.prisma.page.findUnique({
          where: { id: entityId },
          include: {
            template: {
              include: {
                sections: {
                  where: { enabled: true },
                  orderBy: { position: 'asc' }
                },
                theme: true,
                store: true
              }
            },
            store: true
          }
        });
        defaultTemplateType = 'page.default';
        break;
    }

    if (!entity) return null;

    // If entity has a specific template, use it
    if (entity.template) {
      return {
        template: entity.template as StoreTemplateWithRelations,
        isDefault: false,
        source: 'entity'
      };
    }

    // Otherwise, get the default template for this type
    const defaultTemplate = await this.getDefaultTemplate(
      entity.storeId,
      defaultTemplateType
    );

    if (defaultTemplate) {
      return {
        template: defaultTemplate,
        isDefault: true,
        source: 'store-default'
      };
    }

    return null;
  }

  /**
   * Get the default template for a specific type in a store
   */
  async getDefaultTemplate(
    storeId: string,
    templateType: string
  ): Promise<StoreTemplateWithRelations | null> {
    // First try to find a default template with exact type match
    let template = await this.prisma.storeTemplate.findFirst({
      where: {
        storeId,
        templateType,
        isDefault: true,
        enabled: true
      },
      include: {
        sections: {
          where: { enabled: true },
          orderBy: { position: 'asc' }
        },
        theme: true,
        store: true
      }
    });

    // If no exact match, try to find a default for the base page type
    if (!template) {
      const pageType = getPageTypeFromTemplate(templateType);
      template = await this.prisma.storeTemplate.findFirst({
        where: {
          storeId,
          templateType: {
            startsWith: `${pageType}.`
          },
          isDefault: true,
          enabled: true
        },
        include: {
          sections: {
            where: { enabled: true },
            orderBy: { position: 'asc' }
          },
          theme: true,
          store: true
        }
      });
    }

    return template as StoreTemplateWithRelations | null;
  }

  /**
   * Create a new template
   */
  async createTemplate(input: CreateTemplateInput): Promise<StoreTemplateWithRelations> {
    const template = await this.prisma.storeTemplate.create({
      data: {
        storeId: input.storeId,
        themeId: input.themeId,
        templateType: input.templateType,
        name: input.name,
        description: input.description,
        isDefault: input.isDefault ?? false,
        enabled: input.enabled ?? true,
        settings: input.settings || {},
        seoSettings: input.seoSettings || {}
      },
      include: {
        sections: true,
        theme: true,
        store: true
      }
    });

    // If this is set as default, unset other defaults of the same type
    if (template.isDefault) {
      await this.prisma.storeTemplate.updateMany({
        where: {
          storeId: input.storeId,
          templateType: input.templateType,
          id: { not: template.id }
        },
        data: { isDefault: false }
      });
    }

    return template as StoreTemplateWithRelations;
  }

  /**
   * Duplicate an existing template
   */
  async duplicateTemplate(
    templateId: string,
    newName: string
  ): Promise<StoreTemplateWithRelations> {
    const source = await this.prisma.storeTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: true
      }
    });

    if (!source) {
      throw new Error('Source template not found');
    }

    // Create the new template
    const newTemplate = await this.prisma.storeTemplate.create({
      data: {
        storeId: source.storeId,
        themeId: source.themeId,
        templateType: source.templateType,
        name: newName,
        description: source.description,
        isDefault: false,
        enabled: true,
        settings: source.settings || {},
        seoSettings: source.seoSettings || {}
      }
    });

    // Copy all sections
    if (source.sections.length > 0) {
      const sectionData = source.sections.map(section => ({
        templateId: newTemplate.id,
        sectionType: section.sectionType,
        position: section.position,
        enabled: section.enabled,
        settings: section.settings
      }));

      await this.prisma.storeSectionInstance.createMany({
        data: sectionData
      });
    }

    return this.getTemplateById(newTemplate.id) as Promise<StoreTemplateWithRelations>;
  }

  /**
   * Get template by ID with all relations
   */
  async getTemplateById(templateId: string): Promise<StoreTemplateWithRelations | null> {
    const template = await this.prisma.storeTemplate.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { position: 'asc' }
        },
        theme: true,
        store: true,
        pages: true,
        products: true,
        categories: true
      }
    });

    return template as StoreTemplateWithRelations | null;
  }

  /**
   * List all templates for a store
   */
  async listTemplates(
    storeId: string,
    options?: {
      templateType?: string;
      enabled?: boolean;
      themeId?: string;
    }
  ): Promise<StoreTemplateWithRelations[]> {
    const where: Prisma.StoreTemplateWhereInput = {
      storeId,
      ...(options?.templateType && { templateType: options.templateType }),
      ...(options?.enabled !== undefined && { enabled: options.enabled }),
      ...(options?.themeId && { themeId: options.themeId })
    };

    const templates = await this.prisma.storeTemplate.findMany({
      where,
      include: {
        sections: {
          orderBy: { position: 'asc' }
        },
        theme: true,
        store: true
      },
      orderBy: [
        { templateType: 'asc' },
        { isDefault: 'desc' },
        { name: 'asc' }
      ]
    });

    return templates as StoreTemplateWithRelations[];
  }

  /**
   * Update template settings
   */
  async updateTemplate(
    templateId: string,
    data: Partial<Omit<StoreTemplate, 'id' | 'storeId' | 'themeId' | 'createdAt' | 'updatedAt'>>
  ): Promise<StoreTemplateWithRelations> {
    const template = await this.prisma.storeTemplate.update({
      where: { id: templateId },
      data,
      include: {
        sections: {
          orderBy: { position: 'asc' }
        },
        theme: true,
        store: true
      }
    });

    // If setting as default, unset other defaults
    if (data.isDefault === true) {
      await this.prisma.storeTemplate.updateMany({
        where: {
          storeId: template.storeId,
          templateType: template.templateType,
          id: { not: template.id }
        },
        data: { isDefault: false }
      });
    }

    return template as StoreTemplateWithRelations;
  }

  /**
   * Delete a template (only if not in use)
   */
  async deleteTemplate(templateId: string): Promise<void> {
    // Check if template is in use
    const usageCount = await this.prisma.$transaction([
      this.prisma.product.count({ where: { templateId } }),
      this.prisma.category.count({ where: { templateId } }),
      this.prisma.page.count({ where: { templateId } })
    ]);

    const totalUsage = usageCount.reduce((sum, count) => sum + count, 0);

    if (totalUsage > 0) {
      throw new Error(`Template is in use by ${totalUsage} entities and cannot be deleted`);
    }

    // Delete the template (sections will be cascade deleted)
    await this.prisma.storeTemplate.delete({
      where: { id: templateId }
    });
  }

  /**
   * Get template usage statistics
   */
  async getTemplateUsage(templateId: string) {
    const [products, categories, pages] = await this.prisma.$transaction([
      this.prisma.product.count({ where: { templateId } }),
      this.prisma.category.count({ where: { templateId } }),
      this.prisma.page.count({ where: { templateId } })
    ]);

    return {
      products,
      categories,
      pages,
      total: products + categories + pages
    };
  }
}