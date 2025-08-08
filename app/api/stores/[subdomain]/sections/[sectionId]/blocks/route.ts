import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getDefaultBlockSettings } from '@/lib/block-defaults';
import { globalSectionsLoader } from '@/lib/services/global-sections-loader';

// Request validation schemas
const createBlockSchema = z.object({
  type: z.string().min(1),
  position: z.number().int().min(0).optional(),
  settings: z.record(z.any()).optional()
});

const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string())
});

// GET - List all blocks for a section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string }> }
) {
  try {
    const { subdomain, sectionId } = await params;

    // Skip temporary sections or invalid section IDs
    if (sectionId.startsWith('temp-') || !sectionId || sectionId === 'undefined') {
      return apiResponse.success({ blocks: [], total: 0 });
    }

    // Check if this is a preview request
    const url = new URL(request.url);
    const isPreview = url.searchParams.get('preview') === 'true';
    
    let section;
    
    if (isPreview) {
      // For preview mode, allow public access to blocks
      section = await prisma.storeSectionInstance.findFirst({
        where: {
          id: sectionId,
          template: {
            store: {
              subdomain: subdomain
            }
          }
        },
        include: {
          blocks: {
            orderBy: { position: 'asc' }
          }
        }
      });
    } else {
      // For authenticated requests, check session
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return apiResponse.unauthorized();
      }

      // Verify store ownership and section exists
      section = await prisma.storeSectionInstance.findFirst({
        where: {
          id: sectionId,
          template: {
            store: {
              subdomain: subdomain,
              userId: session.user.id
            }
          }
        },
        include: {
          blocks: {
            orderBy: { position: 'asc' }
          }
        }
      });
    }

    if (!section) {
      console.log('[BLOCKS API] Section not found:', { subdomain, sectionId, isPreview });
      return apiResponse.notFound('Section ');
    }

    return apiResponse.success({
      blocks: section.blocks,
      total: section.blocks.length
    });
  } catch (error) {
    console.error('[BLOCKS API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Create a new block
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[BLOCKS API] POST: Unauthorized - no session');
      return apiResponse.unauthorized();
    }

    const { subdomain, sectionId } = await params;
    console.log('[BLOCKS API] POST: Request for subdomain:', subdomain, 'sectionId:', sectionId);

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      console.log('[BLOCKS API] POST: Rejected temporary section');
      return apiResponse.badRequest('Cannot create blocks in temporary sections');
    }

    const body = await request.json();
    console.log('[BLOCKS API] POST: Request body:', body);

    // Validate request
    const validation = createBlockSchema.safeParse(body);
    if (!validation.success) {
      console.log('[BLOCKS API] POST: Validation failed:', validation.error.format());
      return apiResponse.badRequest('Invalid input', validation.error.format());
    }

    const { type, position, settings } = validation.data;
    console.log('[BLOCKS API] POST: Validated data:', { type, position, settings });

    // Verify store ownership and section exists
    console.log('[BLOCKS API] POST: Looking for section with:', { sectionId, subdomain, userId: session.user.id });
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        template: {
          store: {
            subdomain: subdomain,
            userId: session.user.id
          }
        }
      },
      include: {
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });

    console.log('[BLOCKS API] POST: Found section:', section ? 'Yes' : 'No');
    if (!section) {
      console.log('[BLOCKS API] POST: Section not found');
      return apiResponse.notFound('Section ');
    }

    // Determine position for new block
    let newPosition = position;
    if (newPosition === undefined) {
      // Add to end
      newPosition = section.blocks.length;
    } else {
      // Shift existing blocks if needed
      console.log('[BLOCKS API] POST: Shifting existing blocks at position:', newPosition);
      await prisma.sectionBlock.updateMany({
        where: {
          sectionId: sectionId,
          position: { gte: newPosition }
        },
        data: {
          position: { increment: 1 }
        }
      });
    }

    // Get default settings for block type
    console.log('[BLOCKS API] POST: Getting default settings for block type:', type);
    const defaultSettings = getDefaultBlockSettings(type);
    const finalSettings = { ...defaultSettings, ...settings };
    console.log('[BLOCKS API] POST: Final settings:', finalSettings);

    // Create the block
    console.log('[BLOCKS API] POST: Creating block with data:', {
      sectionId,
      type,
      position: newPosition,
      settings: finalSettings
    });
    const newBlock = await prisma.sectionBlock.create({
      data: {
        sectionId: sectionId,
        type: type,
        position: newPosition,
        enabled: true,
        settings: finalSettings
      }
    });

    // Check if this is a global section and clear cache
    if (section && ['header', 'footer', 'announcement-bar'].includes(section.sectionType)) {
      console.log(`[BLOCKS API] POST: Clearing global sections cache for ${subdomain}`);
      globalSectionsLoader.clearCache();
    }

    console.log('[BLOCKS API] POST: Block created successfully:', newBlock);
    return apiResponse.success(newBlock);
  } catch (error) {
    console.error('[BLOCKS API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Reorder blocks
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, sectionId } = await params;

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      return apiResponse.badRequest('Cannot reorder blocks in temporary sections');
    }

    const body = await request.json();

    // Validate request
    const validation = reorderBlocksSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse.badRequest('Invalid input', validation.error.format());
    }

    const { blockIds } = validation.data;

    // Verify store ownership and section exists
    const section = await prisma.storeSectionInstance.findFirst({
      where: {
        id: sectionId,
        template: {
          store: {
            subdomain: subdomain,
            userId: session.user.id
          }
        }
      },
      include: {
        blocks: true
      }
    });

    if (!section) {
      return apiResponse.notFound('Section ');
    }

    // Verify all blockIds belong to this section
    const sectionBlockIds = section.blocks.map(b => b.id);
    const invalidIds = blockIds.filter(id => !sectionBlockIds.includes(id));
    
    if (invalidIds.length > 0) {
      return apiResponse.badRequest('Invalid block IDs', { invalidIds });
    }

    // Update positions in transaction
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < blockIds.length; i++) {
        await tx.sectionBlock.update({
          where: { id: blockIds[i] },
          data: { position: i }
        });
      }
    });

    // Check if this is a global section (header, footer, announcement-bar)
    const sectionInstance = await prisma.storeSectionInstance.findUnique({
      where: { id: sectionId },
      select: { 
        sectionType: true,
        template: {
          select: {
            store: {
              select: {
                subdomain: true
              }
            }
          }
        }
      }
    });

    // Clear global sections cache if this is a global section
    if (sectionInstance && ['header', 'footer', 'announcement-bar'].includes(sectionInstance.sectionType)) {
      const store = sectionInstance.template.store;
      console.log(`[BLOCKS API] Clearing global sections cache for ${store.subdomain}`);
      globalSectionsLoader.clearCache();
    }

    // Return updated blocks
    const updatedBlocks = await prisma.sectionBlock.findMany({
      where: { sectionId: sectionId },
      orderBy: { position: 'asc' }
    });

    return apiResponse.success({
      blocks: updatedBlocks,
      total: updatedBlocks.length
    });
  } catch (error) {
    console.error('[BLOCKS API] PUT Error:', error);
    return apiResponse.serverError();
  }
}