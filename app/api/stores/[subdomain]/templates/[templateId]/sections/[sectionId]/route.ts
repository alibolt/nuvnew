import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// PUT /api/stores/[subdomain]/templates/[templateId]/sections/[sectionId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId } = await params;
    const body = await request.json();

    // Verify ownership
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId,
        template: {
          store: {
            subdomain,
            userId: session.user.id,
          },
        },
      },
    });

    if (!section) {
      return apiResponse.notFound('Section ');
    }

    // Separate blocks and client-side flags from the rest of the data
    const { blocks, _preserveInspectorView, ...sectionData } = body;
    
    // Update section (without blocks)
    const updatedSection = await prisma.storeSectionInstance.update({
      where: { id: sectionId },
      data: sectionData,
    });
    
    // Handle blocks update if provided
    if (blocks !== undefined) {
      // Delete existing blocks
      await prisma.sectionBlock.deleteMany({
        where: { sectionId }
      });
      
      // Create new blocks - only create top-level blocks, not nested ones
      let position = 0;
      for (const block of blocks) {
        const blockSettings = { ...block.settings };
        
        // If this is a container with nested blocks, keep them in settings
        // but DON'T create separate database records for them
        const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
        if (containerTypes.includes(block.type) && block.blocks) {
          blockSettings.blocks = block.blocks;
        }
        
        // Only create database record for the top-level block
        await prisma.sectionBlock.create({
          data: {
            sectionId,
            type: block.type,
            position: position++,
            enabled: block.enabled !== false,
            settings: blockSettings
          }
        });
        
        // Skip creating database records for any nested blocks
        // They are already stored in the container's settings.blocks
      }
    }


    // Get updated section with blocks
    const sectionWithBlocks = await prisma.storeSectionInstance.findUnique({
      where: { id: sectionId },
      include: {
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
    
    // Format blocks for response (keeping nested structure from settings)
    const formattedBlocks = sectionWithBlocks!.blocks.map(block => {
      const formattedBlock: any = {
        id: block.id,
        type: block.type,
        position: block.position,
        enabled: block.enabled,
        settings: block.settings || {}
      };
      
      // If this is a container, include nested blocks from settings
      const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
      if (containerTypes.includes(block.type) && block.settings && typeof block.settings === 'object') {
        const settings = block.settings as any;
        if (settings.blocks) {
          formattedBlock.blocks = settings.blocks;
          // Log for debugging
          console.log('[Section Update API] Container block with nested blocks:', {
            containerId: block.id,
            containerType: block.type,
            nestedBlocksCount: settings.blocks.length,
            nestedBlockIds: settings.blocks.map((nb: any) => nb.id)
          });
        }
      }
      
      return formattedBlock;
    });
    
    // Format section for UI consistency
    const formattedSection = {
      id: sectionWithBlocks!.id,
      type: sectionWithBlocks!.sectionType,
      sectionType: sectionWithBlocks!.sectionType,
      title: sectionWithBlocks!.sectionType.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      settings: sectionWithBlocks!.settings || {},
      enabled: sectionWithBlocks!.enabled,
      position: sectionWithBlocks!.position,
      blocks: formattedBlocks
    };

    return apiResponse.success(formattedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return handleApiError(error, 'Failed to update section');
  }
}

// DELETE /api/stores/[subdomain]/templates/[templateId]/sections/[sectionId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId } = await params;
    
    console.log('[Section Delete] Attempting to delete section:', {
      sectionId,
      templateId,
      subdomain
    });

    // First verify the template exists and belongs to the user
    const template = await prisma.storeTemplate.findFirst({
      where: {
        id: templateId,
        store: {
          subdomain,
          userId: session.user.id,
        },
      },
    });

    if (!template) {
      console.log('[Section Delete] Template not found or unauthorized');
      return apiResponse.notFound('Template ');
    }

    // Try to find the section
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId,
      },
    });

    if (!section) {
      console.log('[Section Delete] Section not found:', sectionId);
      // Section might have been deleted already or never existed in DB
      // This could happen if the section is from a JSON template
      // Return success to avoid blocking UI
      return apiResponse.success({ success: true, message: 'Section already removed' });
    }

    // Delete section
    await prisma.storeSectionInstance.delete({
      where: { id: sectionId },
    });

    console.log('[Section Delete] Section deleted successfully');

    // Reorder remaining sections
    const remainingSections = await prisma.storeSectionInstance.findMany({
      where: {
        templateId,
        position: { gt: section.position }
      },
      orderBy: { position: 'asc' }
    });

    // Update positions
    for (const remainingSection of remainingSections) {
      await prisma.storeSectionInstance.update({
        where: { id: remainingSection.id },
        data: { position: remainingSection.position - 1 }
      });
    }

    // Check if this was the last section
    const sectionCount = await prisma.storeSectionInstance.count({
      where: { templateId }
    });

    // Update template flag if all sections are deleted
    if (sectionCount === 0) {
      await prisma.storeTemplate.update({
        where: { id: templateId },
        data: { hasEmptySections: true }
      });
    }

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('[Section Delete] Error deleting section:', error);
    return NextResponse.json(
      { error: 'Failed to delete section' },
      { status: 500 }
    );
  }
}