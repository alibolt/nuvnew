import { promises as fs } from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('HybridTemplateLoader');

export interface TemplateDefinition {
  name: string;
  type: string;
  sections: Array<{
    id: string;
    type: string;
    settings: any;
    blocks?: Array<{
      id: string;
      type: string;
      position: number;
      enabled: boolean;
      settings: any;
    }>;
  }>;
  settings_schema?: any[];
}

export interface CompiledTemplate {
  definition: TemplateDefinition;
  customizations: any;
  sections: Array<{
    id: string;
    sectionType: string;
    type: string;
    settings: any;
    enabled: boolean;
    position: number;
    blocks?: Array<{
      id: string;
      type: string;
      position: number;
      enabled: boolean;
      settings: any;
    }>;
  }>;
}

export class HybridTemplateLoader {
  private themesDir: string;
  private templateCache: Map<string, TemplateDefinition>;
  private syncMutex: Map<string, Promise<void>>;

  constructor() {
    this.themesDir = path.join(process.cwd(), 'themes');
    this.templateCache = new Map();
    this.syncMutex = new Map();
  }

  /**
   * Load template definition from JSON file
   */
  async loadTemplateDefinition(themeCode: string, templateType: string): Promise<TemplateDefinition | null> {
    const cacheKey = `${themeCode}:${templateType}`;
    
    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey)!;
    }

    try {
      // Use the theme code directly (no mapping)
      const actualThemeCode = themeCode;
      
      // First try public/themes directory
      const publicThemePath = path.join(process.cwd(), 'public', 'themes', actualThemeCode, 'templates', `${templateType}.json`);
      logger.debug(`Checking public theme path: ${publicThemePath}`);
      
      try {
        const fileContent = await fs.readFile(publicThemePath, 'utf-8');
        const definition = JSON.parse(fileContent) as TemplateDefinition;
        this.templateCache.set(cacheKey, definition);
        logger.debug(`Loaded template from public/themes: ${actualThemeCode}/${templateType}`);
        return definition;
      } catch (publicError) {
        // If not found in public, try themes directory
        const themePath = path.join(this.themesDir, actualThemeCode, 'templates', `${templateType}.json`);
        logger.debug(`Checking themes path: ${themePath}`);
        
        const fileContent = await fs.readFile(themePath, 'utf-8');
        const definition = JSON.parse(fileContent) as TemplateDefinition;
        this.templateCache.set(cacheKey, definition);
        logger.debug(`Loaded template from themes: ${actualThemeCode}/${templateType}`);
        return definition;
      }
    } catch (error) {
      logger.error(`Failed to load template: ${themeCode}/${templateType}`, error);
      return null;
    }
  }

  /**
   * Load theme manifest
   */
  async loadThemeManifest(themeCode: string): Promise<any | null> {
    // Theme system has been removed - return default manifest
    logger.debug(`Theme manifest not needed - using default settings`);
    return {
      name: 'Default',
      version: '1.0.0',
      description: 'Default template system'
    };
  }

  /**
   * Get user customizations from database
   */
  async getUserCustomizations(subdomain: string, templateType: string, includeDisabled: boolean = false) {
    try {
      // First get store by subdomain
      const store = await prisma.store.findUnique({
        where: { subdomain },
        select: { id: true }
      });
      
      if (!store) return null;

      const storeTemplate = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType,
          enabled: true,
        },
        include: {
          sections: {
            include: {
              blocks: {
                orderBy: { position: 'asc' },
                ...(includeDisabled ? {} : { where: { enabled: true } })
              }
            },
            orderBy: { position: 'asc' },
            ...(includeDisabled ? {} : { where: { enabled: true } })
          }
        }
      });

      return storeTemplate;
    } catch (error) {
      logger.error('Failed to load user customizations:', error);
      return null;
    }
  }

  /**
   * Save template customization (for tracking user changes)
   */
  async saveTemplateCustomization(
    subdomain: string, 
    templateType: string, 
    action: 'add' | 'update' | 'remove' | 'reorder',
    data: any
  ) {
    try {
      // First get store by subdomain
      const store = await prisma.store.findUnique({
        where: { subdomain },
        select: { id: true }
      });
      
      if (!store) return false;

      // Ensure template exists in DB
      let template = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType,
          isDefault: true,
        }
      });

      if (!template) {
        // Create template record
        template = await prisma.storeTemplate.create({
          data: {
            storeId: store.id,
            templateType,
            name: templateType.charAt(0).toUpperCase() + templateType.slice(1),
            isDefault: true,
            enabled: true,
            settings: {}
          }
        });
      }

      // Clear cache for this template
      const cacheKey = `${store.id}:${templateType}`;
      this.templateCache.delete(cacheKey);

      // Track customization metadata
      await prisma.storeTemplate.update({
        where: { id: template.id },
        data: {
          settings: {
            ...template.settings as object,
            lastCustomized: new Date().toISOString(),
            customizationAction: action,
          }
        }
      });

      return true;
    } catch (error) {
      logger.error('Error saving template customization:', error);
      return false;
    }
  }

  /**
   * Merge template definition with user customizations
   */
  mergeTemplateData(
    definition: TemplateDefinition, 
    customizations: any | null,
    excludeGlobalSections: boolean = true
  ): CompiledTemplate {
    // If we have database customizations, use them as the primary source
    if (customizations && customizations.sections && customizations.sections.length > 0) {
      logger.debug('Using database sections as primary source');
      
      let sections = customizations.sections.map((dbSection: any) => {
        // Transform blocks to handle container nested blocks
        const transformBlocks = (blocks: any[]): any[] => {
          return blocks.map(block => {
            if (block.type === 'container' && block.settings?.blocks) {
              // Container blocks store nested blocks in settings.blocks
              return {
                ...block,
                blocks: block.settings.blocks,
                settings: block.settings
              };
            }
            return block;
          });
        };
        
        return {
          id: dbSection.id,
          type: dbSection.sectionType,
          sectionType: dbSection.sectionType,
          settings: dbSection.settings || {},
          enabled: dbSection.enabled !== false,
          position: dbSection.position,
          blocks: transformBlocks(dbSection.blocks || []), // Transform blocks
        };
      });

      // Filter out global sections if requested
      if (excludeGlobalSections) {
        sections = sections.filter((s: any) => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar');
      }

      // Sort by position
      sections.sort((a, b) => a.position - b.position);
      
      logger.debug('Compiled template sections:', sections.map(s => ({
        id: s.id,
        type: s.type,
        hasBlocks: !!s.blocks && s.blocks.length > 0,
        blocksCount: s.blocks?.length || 0,
        blocks: s.blocks?.map(b => ({
          id: b.id,
          type: b.type,
          hasNestedBlocks: b.type === 'container' ? !!b.blocks : false,
          nestedCount: b.type === 'container' ? b.blocks?.length : 0
        }))
      })));

      return {
        definition,
        customizations,
        sections,
      };
    }

    // Fallback to JSON template sections (should not happen after sync)
    logger.debug('Falling back to JSON template sections');
    let sections = definition.sections.map((section, index) => ({
      ...section,
      id: section.id || `${section.type}-${index}`, // Ensure each section has an ID
      sectionType: section.type,
      enabled: true,
      position: index,
      blocks: section.blocks || [], // Include blocks from JSON template
    }));

    // Filter out global sections if requested
    if (excludeGlobalSections) {
      sections = sections.filter(s => s.type !== 'header' && s.type !== 'footer' && s.type !== 'announcement-bar');
    }

    logger.debug('Initial sections from JSON:', sections.map(s => ({
      id: s.id,
      type: s.type,
      blocksCount: s.blocks?.length || 0,
      firstBlock: s.blocks?.[0]
    })));

    return {
      definition,
      customizations,
      sections,
    };
  }

  /**
   * Sync JSON template sections to database with proper duplicate prevention
   */
  async syncTemplateToDatabase(
    subdomain: string, 
    themeCode: string, 
    templateType: string,
    definition: TemplateDefinition
  ): Promise<void> {
    // Use mutex to prevent concurrent sync operations
    const mutexKey = `${subdomain}:${templateType}`;
    
    if (this.syncMutex.has(mutexKey)) {
      logger.debug('Sync already in progress, waiting...');
      await this.syncMutex.get(mutexKey);
      return;
    }

    const syncPromise = this.performSync(subdomain, themeCode, templateType, definition);
    this.syncMutex.set(mutexKey, syncPromise);
    
    try {
      await syncPromise;
    } finally {
      this.syncMutex.delete(mutexKey);
    }
  }

  private async performSync(
    subdomain: string, 
    themeCode: string, 
    templateType: string,
    definition: TemplateDefinition
  ): Promise<void> {
    try {
      // Get store by subdomain
      const store = await prisma.store.findUnique({
        where: { subdomain },
        select: { id: true }
      });
      
      if (!store) {
        logger.debug('Store not found for subdomain:', subdomain);
        return;
      }

      // Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // Get or create DB template record
        let dbTemplate = await tx.storeTemplate.findFirst({
          where: {
            storeId: store.id,
            templateType,
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

        if (!dbTemplate) {
          // Create template record
          dbTemplate = await tx.storeTemplate.create({
            data: {
              storeId: store.id,
              templateType,
              name: templateType.charAt(0).toUpperCase() + templateType.slice(1),
              isDefault: true,
              enabled: true,
              settings: {}
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
        }

        // Check if sync is needed
        const existingSections = dbTemplate.sections || [];
        const jsonSections = definition.sections || [];

        // More robust check for sync necessity
        const needsSync = this.shouldSyncSections(existingSections, jsonSections);

        if (needsSync) {
          logger.info('Syncing sections to database...', {
            existingCount: existingSections.length,
            jsonCount: jsonSections.length,
            reason: this.getSyncReason(existingSections, jsonSections)
          });

          // Clear existing sections and blocks atomically
          await tx.sectionBlock.deleteMany({
            where: {
              section: {
                templateId: dbTemplate.id
              }
            }
          });

          await tx.storeSectionInstance.deleteMany({
            where: { templateId: dbTemplate.id }
          });

          // Create new sections from JSON template
          for (let i = 0; i < jsonSections.length; i++) {
            const jsonSection = jsonSections[i];
            
            // Check if this is a global section and not on homepage
            const isGlobalSection = ['header', 'footer', 'announcement-bar'].includes(jsonSection.type);
            
            if (isGlobalSection && templateType !== 'homepage') {
              // Skip creating global sections for non-homepage templates
              // They will be loaded from homepage template via GlobalSectionsLoader
              logger.debug(`Skipping global section ${jsonSection.type} for ${templateType} template`);
              continue;
            }
            
            // Create section instance
            const sectionInstance = await tx.storeSectionInstance.create({
              data: {
                templateId: dbTemplate.id,
                sectionType: jsonSection.type,
                position: i,
                enabled: true,
                settings: jsonSection.settings || {}
              }
            });

            // Create blocks if they exist in JSON
            if (jsonSection.blocks && jsonSection.blocks.length > 0) {
              // Only create top-level blocks, not nested ones
              const blocksData = jsonSection.blocks.map((block, index) => {
                const blockSettings = { ...block.settings };
                
                // If this is a container with nested blocks, keep them in settings
                // but DON'T create separate database records for them
                if (block.type === 'container' && block.blocks) {
                  blockSettings.blocks = block.blocks;
                }
                // Also handle legacy childBlocks property
                if (block.type === 'container' && block.settings?.childBlocks) {
                  blockSettings.blocks = block.settings.childBlocks;
                  delete blockSettings.childBlocks; // Remove legacy property
                }
                
                return {
                  sectionId: sectionInstance.id,
                  type: block.type,
                  position: index,
                  enabled: block.enabled !== false,
                  settings: blockSettings
                };
              });

              await tx.sectionBlock.createMany({
                data: blocksData
              });
            }
          }

          logger.info('Successfully synced', jsonSections.length, 'sections with blocks to database');
        } else {
          logger.debug('Sections already in sync, skipping database sync');
          logger.debug('User customizations found:', existingSections.length !== jsonSections.length);
        }
      });
    } catch (error) {
      logger.error('Error syncing template to database:', error);
      throw error;
    }
  }

  private shouldSyncSections(existingSections: any[], jsonSections: any[]): boolean {
    // If no existing sections, always sync
    if (existingSections.length === 0) {
      return true;
    }

    // Check for duplicate sections (this is the key fix)
    const sectionTypeCount = new Map<string, number>();
    for (const section of existingSections) {
      const key = `${section.sectionType}-${section.position}`;
      sectionTypeCount.set(key, (sectionTypeCount.get(key) || 0) + 1);
    }

    // If any section type+position appears more than once, we have duplicates
    for (const [key, count] of sectionTypeCount) {
      if (count > 1) {
        logger.warn(`Duplicate detected: ${key} appears ${count} times`);
        return true;
      }
    }

    // Check if product section exists but has no blocks
    // This is a special case where we need to sync to add default blocks
    const productSection = existingSections.find(s => s.sectionType === 'product');
    if (productSection) {
      const jsonProductSection = jsonSections.find(s => s.type === 'product');
      // If JSON has blocks but database doesn't, sync is needed
      if (jsonProductSection?.blocks?.length > 0 && (!productSection.blocks || productSection.blocks.length === 0)) {
        logger.info('Product section missing blocks, sync needed');
        return true;
      }
    }

    // Otherwise, don't override user customizations
    return false;
  }

  private getSyncReason(existingSections: any[], jsonSections: any[]): string {
    if (existingSections.length === 0) return 'No existing sections';
    
    // Check for duplicates
    const sectionTypeCount = new Map<string, number>();
    for (const section of existingSections) {
      const key = `${section.sectionType}-${section.position}`;
      sectionTypeCount.set(key, (sectionTypeCount.get(key) || 0) + 1);
    }

    for (const [key, count] of sectionTypeCount) {
      if (count > 1) {
        return `Duplicate sections detected: ${key} appears ${count} times`;
      }
    }

    // Check for product without blocks
    const productSection = existingSections.find(s => s.sectionType === 'product');
    if (productSection) {
      const jsonProductSection = jsonSections.find(s => s.type === 'product');
      if (jsonProductSection?.blocks?.length > 0 && (!productSection.blocks || productSection.blocks.length === 0)) {
        return 'Product section missing blocks';
      }
    }

    return 'Section type mismatch';
  }

  /**
   * Get compiled template (main entry point)
   */
  async getCompiledTemplate(
    subdomain: string, 
    themeCode: string, 
    templateType: string,
    includeDisabled: boolean = false
  ): Promise<CompiledTemplate | null> {
    logger.debug('getCompiledTemplate called:', { subdomain, themeCode, templateType, includeDisabled });
    
    // Load template definition from JSON
    const definition = await this.loadTemplateDefinition(themeCode, templateType);
    if (!definition) {
      logger.warn('No template definition found');
      return null;
    }

    // Debug: Log template definition sections
    logger.debug('Template definition sections:', definition.sections.map(s => ({
      id: s.id,
      type: s.type,
      hasBlocks: !!(s as any).blocks,
      blocksCount: (s as any).blocks?.length || 0
    })));

    // Sync JSON template to database
    await this.syncTemplateToDatabase(subdomain, themeCode, templateType, definition);

    // Get user customizations from DB  
    const customizations = await this.getUserCustomizations(subdomain, templateType, includeDisabled);
    logger.debug('User customizations found:', !!customizations);
    if (customizations) {
      logger.debug('DB sections:', customizations.sections?.map((s: any) => ({
        id: s.id,
        type: s.sectionType,
        hasBlocks: !!s.blocks,
        blocksCount: s.blocks?.length || 0
      })));
    }

    // Merge and return
    const compiled = this.mergeTemplateData(definition, customizations, true);
    logger.debug('Compiled template sections:', compiled.sections.map(s => ({
      id: s.id,
      type: s.type,
      hasBlocks: !!(s as any).blocks,
      blocksCount: (s as any).blocks?.length || 0
    })));
    return compiled;
  }

  /**
   * List all available templates for a theme
   */
  async listThemeTemplates(themeCode: string): Promise<string[]> {
    try {
      const templatesDir = path.join(this.themesDir, themeCode, 'templates');
      const files = await fs.readdir(templatesDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));
    } catch (error) {
      logger.error(`Failed to list templates for theme: ${themeCode}`, error);
      return [];
    }
  }

  /**
   * Clear template cache
   */
  clearCache() {
    this.templateCache.clear();
  }

  /**
   * Initialize default templates in database if they don't exist
   */
  async initializeStoreTemplates(subdomain: string) {
    // First get store by subdomain
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: { id: true }
    });
    
    if (!store) return;

    const themeCode = 'brand'; // Updated to match available theme
    const templateTypes = await this.listThemeTemplates(themeCode);

    for (const templateType of templateTypes) {
      // Check if template already exists
      const existing = await prisma.storeTemplate.findFirst({
        where: {
          storeId: store.id,
          templateType,
        }
      });

      if (!existing) {
        // Create template record in DB
        await prisma.storeTemplate.create({
          data: {
            storeId: store.id,
            templateType,
            name: templateType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            isDefault: true,
            enabled: true,
            settings: {},
          }
        });
      }
    }
  }
}

// Create a cached version of the loader
export const hybridTemplateLoader = new HybridTemplateLoader();

// Functions for use in React Server Components
export const getCompiledTemplate = (subdomain: string, themeCode: string, templateType: string, includeDisabled: boolean = false) =>
  hybridTemplateLoader.getCompiledTemplate(subdomain, themeCode, templateType, includeDisabled);

export const loadThemeManifest = (themeCode: string) => 
  hybridTemplateLoader.loadThemeManifest(themeCode);