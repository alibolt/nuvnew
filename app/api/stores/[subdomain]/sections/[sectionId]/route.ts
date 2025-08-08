import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { hybridTemplateLoader } from '@/lib/services/hybrid-template-loader';
import { globalSectionsLoader } from '@/lib/services/global-sections-loader';

// Helper function to generate section titles
function getSectionTitle(sectionType: string): string {
  const titles: Record<string, string> = {
    'hero': 'Hero Section',
    'product-grid': 'Product Grid',
    'featured-products': 'Featured Products',
    'newsletter': 'Newsletter',
    'header': 'Header',
    'footer': 'Footer',
    'announcement-bar': 'Announcement Bar',
    'image-text': 'Image with Text',
    'testimonials': 'Testimonials',
    'collections': 'Collections',
    'logo-list': 'Logo List',
    'rich-text': 'Rich Text',
    'instagram': 'Instagram Feed',
    'contact-form': 'Contact Form',
    'product': 'Product',
    'related-products': 'Related Products',
    'recently-viewed': 'Recently Viewed',
    'product-main': 'Product Main Section'
  };
  
  return titles[sectionType] || sectionType.charAt(0).toUpperCase() + sectionType.slice(1).replace(/-/g, ' ');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string, sectionId: string }> }
) {
  const { subdomain, sectionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });

  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    const body = await request.json();
    console.log('Update section request:', { sectionId, body });
    
    const updateData: any = {};
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.enabled !== undefined) updateData.enabled = body.enabled;
    
    // Handle nested blocks update
    if (body.blocks !== undefined) {
      console.log('[API] Updating blocks structure:', {
        blocksCount: body.blocks.length,
        blocks: body.blocks.map(b => ({
          id: b.id,
          type: b.type,
          hasNestedBlocks: b.type === 'container' ? b.blocks?.length : 0
        }))
      });
      
      // Process blocks to ensure nested blocks are stored in container settings
      const processBlocks = (blocks: any[]): any[] => {
        return blocks.map(block => {
          if (block.type === 'container' && block.blocks) {
            // Store nested blocks in settings.blocks while keeping them at top level too
            return {
              ...block,
              settings: {
                ...block.settings,
                blocks: processBlocks(block.blocks)
              },
              // Keep blocks at top level for compatibility
              blocks: block.blocks
            };
          }
          return block;
        });
      };
      
      const processedBlocks = processBlocks(body.blocks);
      
      console.log('[API] Processed blocks:', {
        processedCount: processedBlocks.length,
        processedBlocks: processedBlocks.map(b => ({
          id: b.id,
          type: b.type,
          hasSettingsBlocks: b.type === 'container' ? b.settings?.blocks?.length : 0
        }))
      });
      
      // Update all blocks in a transaction
      await prisma.$transaction(async (tx) => {
        // Delete existing blocks
        await tx.sectionBlock.deleteMany({
          where: { sectionId: sectionId }
        });
        
        // Create new blocks with updated structure
        for (let i = 0; i < processedBlocks.length; i++) {
          const block = processedBlocks[i];
          console.log(`[API] Creating block ${i}:`, {
            type: block.type,
            hasSettings: !!block.settings,
            settingsBlocksCount: block.settings?.blocks?.length || 0
          });
          
          await tx.sectionBlock.create({
            data: {
              sectionId: sectionId,
              type: block.type,
              position: i,
              enabled: block.enabled !== false,
              settings: block.settings || {}
            }
          });
        }
      });
    }
    
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { id: sectionId },
      data: updateData,
    });

    // Get the template this section belongs to
    const template = await prisma.storeTemplate.findFirst({
      where: {
        sections: {
          some: { id: sectionId }
        }
      }
    });

    if (template) {
      // Track customization in hybrid system
      await hybridTemplateLoader.saveTemplateCustomization(
        subdomain,
        template.templateType,
        'update',
        updatedSection
      );
    }
    
    // Get updated blocks with nested structure
    const updatedBlocks = await prisma.sectionBlock.findMany({
      where: { sectionId: sectionId },
      orderBy: { position: 'asc' }
    });
    
    // Transform blocks to include nested structure from settings
    const transformBlocks = (blocks: any[]): any[] => {
      return blocks.map(block => {
        if (block.type === 'container' && block.settings?.blocks) {
          // Extract nested blocks from settings and keep them in both places
          console.log('[API] Transforming container block:', {
            blockId: block.id,
            settingsBlocksCount: block.settings.blocks.length,
            settingsBlocks: block.settings.blocks
          });
          
          return {
            id: block.id,
            type: block.type,
            position: block.position,
            enabled: block.enabled,
            settings: block.settings, // Keep blocks in settings for container-block.tsx
            blocks: block.settings.blocks // Also expose at top level for UI
          };
        }
        return block;
      });
    };
    
    // Transform the response to match UI expectations
    const transformedSection = {
      id: updatedSection.id,
      type: updatedSection.sectionType,
      sectionType: updatedSection.sectionType,
      title: getSectionTitle(updatedSection.sectionType),
      settings: updatedSection.settings,
      enabled: updatedSection.enabled,
      position: updatedSection.position,
      blocks: transformBlocks(updatedBlocks)
    };
    
    // Clear global sections cache if this is a global section
    if (['header', 'footer', 'announcement-bar'].includes(updatedSection.sectionType)) {
      console.log(`[SECTION API] PUT: Clearing global sections cache for ${subdomain}`);
      globalSectionsLoader.clearCache();
    }
    
    console.log('Section updated successfully:', transformedSection);
    return apiResponse.success(transformedSection);
  } catch (error) {
    console.error('Failed to update section:', error);
    return handleApiError(error, 'Failed to update section');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string, sectionId: string }> }
) {
  const { subdomain, sectionId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return apiResponse.unauthorized();
  }

  // Verify store ownership
  const store = await prisma.store.findFirst({
    where: {
      subdomain: subdomain,
      userId: session.user.id
    }
  });

  if (!store) {
    return apiResponse.notFound('Store not found or unauthorized');
  }

  try {
    // Get the template this section belongs to before deleting
    const template = await prisma.storeTemplate.findFirst({
      where: {
        sections: {
          some: { id: sectionId }
        }
      }
    });

    await prisma.storeSectionInstance.delete({
      where: { id: sectionId },
    });

    if (template) {
      // Track customization in hybrid system
      await hybridTemplateLoader.saveTemplateCustomization(
        subdomain,
        template.templateType,
        'remove',
        { id: sectionId }
      );
    }

    return apiResponse.success({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Failed to delete section:', error);
    return handleApiError(error, 'Failed to delete section');
  }
}