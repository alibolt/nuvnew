import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// PUT - Update block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string; blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId, blockId } = await params;
    const updates = await request.json();

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      return apiResponse.badRequest('Cannot update blocks in temporary sections');
    }
    
    // First check if we have proper access to the section
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId: templateId,
        template: {
          store: {
            subdomain: subdomain,
            userId: session.user.id
          }
        }
      }
    });
    
    if (!section) {
      return apiResponse.notFound('Section not found or unauthorized');
    }

    // For container nested blocks, we need to update the parent container
    // First, check if this is a direct block
    const directBlock = await prisma.sectionBlock.findFirst({
      where: {
        id: blockId,
        sectionId: sectionId
      }
    });

    if (directBlock) {
      // Update direct block
      await prisma.sectionBlock.update({
        where: { id: blockId },
        data: {
          settings: updates.settings || directBlock.settings,
          enabled: updates.enabled !== undefined ? updates.enabled : directBlock.enabled,
          position: updates.position !== undefined ? updates.position : directBlock.position
        }
      });
    } else {
      // This might be a nested block inside a container
      // Find all container blocks in the section (including icon-group, mega-menu, etc.)
      const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
      console.log('[Block Update API] Looking for nested block in containers:', {
        blockId,
        sectionId,
        containerTypes
      });
      
      const containerBlocks = await prisma.sectionBlock.findMany({
        where: {
          sectionId: sectionId,
          type: { in: containerTypes }
        }
      });
      
      console.log('[Block Update API] Found container blocks:', containerBlocks.map(c => ({
        id: c.id,
        type: c.type,
        hasBlocks: !!(c.settings as any)?.blocks,
        blocksCount: (c.settings as any)?.blocks?.length || 0
      })));
      
      // Also log the block we're looking for
      console.log('[Block Update API] Looking for block:', {
        blockId,
        blockIdType: typeof blockId,
        blockIdLength: blockId.length
      });

      let blockUpdated = false;
      let updatePath: string[] = [];
      
      // Recursive function to search and update nested blocks
      async function searchAndUpdateNestedBlock(blocks: any[], path: string[] = []): Promise<boolean> {
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          
          // Check if this is the block we're looking for
          if (block.id === blockId) {
            console.log('[Block Update API] Found block at path:', path.join(' > '));
            blocks[i] = {
              ...block,
              settings: updates.settings !== undefined ? updates.settings : block.settings,
              enabled: updates.enabled !== undefined ? updates.enabled : block.enabled,
              position: updates.position !== undefined ? updates.position : block.position
            };
            updatePath = [...path];
            return true;
          }
          
          // Check nested blocks in settings
          if (block.settings?.blocks && Array.isArray(block.settings.blocks)) {
            const newPath = [...path, `${block.type}(${block.id})`];
            if (await searchAndUpdateNestedBlock(block.settings.blocks, newPath)) {
              return true;
            }
          }
          
          // Check nested blocks in blocks property
          if (block.blocks && Array.isArray(block.blocks)) {
            const newPath = [...path, `${block.type}(${block.id})`];
            if (await searchAndUpdateNestedBlock(block.blocks, newPath)) {
              // Update the settings.blocks to match
              if (!block.settings) block.settings = {};
              block.settings.blocks = block.blocks;
              return true;
            }
          }
        }
        return false;
      }
      
      // Search through all container blocks
      for (const container of containerBlocks) {
        const containerSettings = container.settings as any;
        if (containerSettings?.blocks && Array.isArray(containerSettings.blocks)) {
          console.log('[Block Update API] Deep searching in container:', {
            containerId: container.id,
            containerType: container.type
          });
          
          // Deep copy to avoid mutation issues
          const blocksCopy = JSON.parse(JSON.stringify(containerSettings.blocks));
          
          if (await searchAndUpdateNestedBlock(blocksCopy, [`${container.type}(${container.id})`])) {
            console.log('[Block Update API] Block found and updated, saving container');
            
            // Update the container with the modified blocks
            containerSettings.blocks = blocksCopy;
            await prisma.sectionBlock.update({
              where: { id: container.id },
              data: { settings: containerSettings }
            });
            
            blockUpdated = true;
            console.log('[Block Update API] Container saved successfully, update path:', updatePath.join(' > '));
            break;
          }
        }
      }
      
      if (!blockUpdated) {
        console.log('[Block Update API] Block not found in any container');
        return apiResponse.notFound('Block');
      }
    }

    // Return updated block
    return apiResponse.success({
      id: blockId,
      ...updates
    });

  } catch (error) {
    console.error('Error updating block:', error);
    return handleApiError(error, 'Failed to update block');
  }
}

// DELETE - Delete block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; templateId: string; sectionId: string; blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, templateId, sectionId, blockId } = await params;
    
    console.log('[DELETE BLOCK API] Request params:', {
      subdomain,
      templateId,
      sectionId,
      blockId,
      userId: session.user.id
    });
    
    // Log if IDs have unexpected format
    if (!blockId || typeof blockId !== 'string') {
      console.error('[DELETE BLOCK API] Invalid blockId:', blockId);
      return apiResponse.badRequest('Invalid block ID');
    }
    
    if (!sectionId || typeof sectionId !== 'string') {
      console.error('[DELETE BLOCK API] Invalid sectionId:', sectionId);
      return apiResponse.badRequest('Invalid section ID');
    }

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      return apiResponse.badRequest('Cannot delete blocks in temporary sections');
    }

    // First check if we have proper access to the section
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        templateId: templateId,
        template: {
          store: {
            subdomain: subdomain,
            userId: session.user.id
          }
        }
      }
    });
    
    console.log('[DELETE BLOCK API] Section found:', !!section);
    
    if (!section) {
      console.error('[DELETE BLOCK API] Section not found with params:', {
        sectionId,
        templateId,
        subdomain,
        userId: session.user.id
      });
      return apiResponse.notFound('Section not found or unauthorized');
    }
    
    // First try to delete as direct block
    const directBlock = await prisma.sectionBlock.findFirst({
      where: {
        id: blockId,
        sectionId: sectionId
      }
    });

    console.log('[DELETE BLOCK API] Direct block found:', !!directBlock);
    
    if (directBlock) {
      console.log('[DELETE BLOCK API] Deleting direct block:', directBlock.id);
      // Delete direct block
      await prisma.sectionBlock.delete({
        where: { id: blockId }
      });
      
      // Reorder remaining blocks
      const remainingBlocks = await prisma.sectionBlock.findMany({
        where: {
          sectionId: sectionId,
          position: { gt: directBlock.position }
        },
        orderBy: { position: 'asc' }
      });

      for (const block of remainingBlocks) {
        await prisma.sectionBlock.update({
          where: { id: block.id },
          data: { position: block.position - 1 }
        });
      }
    } else {
      // This might be a nested block inside a container
      const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
      const containerBlocks = await prisma.sectionBlock.findMany({
        where: {
          sectionId: sectionId,
          type: { in: containerTypes }
        }
      });

      console.log('[DELETE BLOCK API] Checking container blocks:', containerBlocks.length);
      let blockDeleted = false;
      let deletePath: string[] = [];
      
      // Recursive function to search and delete nested blocks
      async function searchAndDeleteNestedBlock(blocks: any[], path: string[] = []): Promise<boolean> {
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          
          // Check if this is the block we're looking for
          if (block.id === blockId) {
            console.log('[DELETE BLOCK API] Found block to delete at path:', path.join(' > '));
            blocks.splice(i, 1);
            
            // Update positions of remaining blocks
            blocks.forEach((b: any, index: number) => {
              b.position = index;
            });
            
            deletePath = [...path];
            return true;
          }
          
          // Check nested blocks in settings
          if (block.settings?.blocks && Array.isArray(block.settings.blocks)) {
            const newPath = [...path, `${block.type}(${block.id})`];
            if (await searchAndDeleteNestedBlock(block.settings.blocks, newPath)) {
              return true;
            }
          }
          
          // Check nested blocks in blocks property
          if (block.blocks && Array.isArray(block.blocks)) {
            const newPath = [...path, `${block.type}(${block.id})`];
            if (await searchAndDeleteNestedBlock(block.blocks, newPath)) {
              // Update the settings.blocks to match
              if (!block.settings) block.settings = {};
              block.settings.blocks = block.blocks;
              return true;
            }
          }
        }
        return false;
      }
      
      // Search through all container blocks
      for (const container of containerBlocks) {
        const containerSettings = container.settings as any;
        if (containerSettings?.blocks && Array.isArray(containerSettings.blocks)) {
          console.log('[DELETE BLOCK API] Deep searching in container:', {
            containerId: container.id,
            containerType: container.type
          });
          
          // Deep copy to avoid mutation issues
          const blocksCopy = JSON.parse(JSON.stringify(containerSettings.blocks));
          
          if (await searchAndDeleteNestedBlock(blocksCopy, [`${container.type}(${container.id})`])) {
            console.log('[DELETE BLOCK API] Block found and deleted, saving container');
            
            // Update the container with the modified blocks
            containerSettings.blocks = blocksCopy;
            await prisma.sectionBlock.update({
              where: { id: container.id },
              data: { settings: containerSettings }
            });
            
            blockDeleted = true;
            console.log('[DELETE BLOCK API] Container saved successfully, delete path:', deletePath.join(' > '));
            break;
          }
        }
      }
      
      if (!blockDeleted) {
        console.error('[DELETE BLOCK API] Block not found in any container:', {
          blockId,
          sectionId,
          containersChecked: containerBlocks.length
        });
        return apiResponse.notFound('Block');
      }
    }

    return apiResponse.success({ success: true });

  } catch (error) {
    console.error('Error deleting block:', error);
    return handleApiError(error, 'Failed to delete block');
  }
}