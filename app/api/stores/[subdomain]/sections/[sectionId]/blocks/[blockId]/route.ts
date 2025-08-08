import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { globalSectionsLoader } from '@/lib/services/global-sections-loader';

// Request validation schemas
const updateBlockSchema = z.object({
  settings: z.record(z.any()).optional(),
  position: z.number().int().min(0).optional(),
  enabled: z.boolean().optional()
});

// GET - Get single block
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string; blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, sectionId, blockId } = await params;

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      return apiResponse.badRequest('Cannot access blocks in temporary sections');
    }

    // Verify store ownership and block exists
    const block = await prisma.sectionBlock.findFirst({
      where: {
        id: blockId,
        sectionId: sectionId,
        section: {
          template: {
            store: {
              subdomain: subdomain,
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!block) {
      return apiResponse.notFound('Block ');
    }

    return apiResponse.success(block);
  } catch (error) {
    console.error('[BLOCK API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update block
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string; blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, sectionId, blockId } = await params;

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      return apiResponse.badRequest('Cannot update blocks in temporary sections');
    }

    const body = await request.json();

    // Validate request
    const validation = updateBlockSchema.safeParse(body);
    if (!validation.success) {
      return apiResponse.badRequest('Invalid input', validation.error.format());
    }

    const { settings, position, enabled } = validation.data;

    // Verify store ownership and block exists
    const existingBlock = await prisma.sectionBlock.findFirst({
      where: {
        id: blockId,
        sectionId: sectionId,
        section: {
          template: {
            store: {
              subdomain: subdomain,
              userId: session.user.id
            }
          }
        }
      }
    });

    if (!existingBlock) {
      return apiResponse.notFound('Block ');
    }

    // Handle position change if specified
    if (position !== undefined && position !== existingBlock.position) {
      await prisma.$transaction(async (tx) => {
        const oldPosition = existingBlock.position;
        const newPosition = position;

        if (newPosition > oldPosition) {
          // Moving down: shift blocks up between old and new positions
          await tx.sectionBlock.updateMany({
            where: {
              sectionId: sectionId,
              position: {
                gt: oldPosition,
                lte: newPosition
              }
            },
            data: {
              position: { decrement: 1 }
            }
          });
        } else {
          // Moving up: shift blocks down between new and old positions
          await tx.sectionBlock.updateMany({
            where: {
              sectionId: sectionId,
              position: {
                gte: newPosition,
                lt: oldPosition
              }
            },
            data: {
              position: { increment: 1 }
            }
          });
        }

        // Update the block itself
        await tx.sectionBlock.update({
          where: { id: blockId },
          data: {
            position: newPosition,
            ...(settings && { settings }),
            ...(enabled !== undefined && { enabled }),
            updatedAt: new Date()
          }
        });
      });
    } else {
      // Update without position change
      await prisma.sectionBlock.update({
        where: { id: blockId },
        data: {
          ...(settings && { settings }),
          ...(enabled !== undefined && { enabled }),
          updatedAt: new Date()
        }
      });
    }

    // Return updated block
    const updatedBlock = await prisma.sectionBlock.findUnique({
      where: { id: blockId }
    });

    // Check if this is a global section and clear cache
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

    if (sectionInstance && ['header', 'footer', 'announcement-bar'].includes(sectionInstance.sectionType)) {
      const store = sectionInstance.template.store;
      console.log(`[BLOCK API] PUT: Clearing global sections cache for ${store.subdomain}`);
      globalSectionsLoader.clearCache();
    }

    return apiResponse.success(updatedBlock);
  } catch (error) {
    console.error('[BLOCK API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete block
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; sectionId: string; blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[BLOCK API] DELETE: Unauthorized - no session');
      return apiResponse.unauthorized();
    }

    const { subdomain, sectionId, blockId } = await params;
    console.log('[BLOCK API] DELETE: Request for subdomain:', subdomain, 'sectionId:', sectionId, 'blockId:', blockId);

    // Skip temporary sections
    if (sectionId.startsWith('temp-')) {
      console.log('[BLOCK API] DELETE: Rejected temporary section');
      return apiResponse.badRequest('Cannot delete blocks in temporary sections');
    }

    // Verify store ownership and block exists
    console.log('[BLOCK API] DELETE: Looking for block with:', { blockId, sectionId, subdomain, userId: session.user.id });
    const existingBlock = await prisma.sectionBlock.findFirst({
      where: {
        id: blockId,
        sectionId: sectionId,
        section: {
          template: {
            store: {
              subdomain: subdomain,
              userId: session.user.id
            }
          }
        }
      }
    });

    console.log('[BLOCK API] DELETE: Found block:', existingBlock ? 'Yes' : 'No');
    if (!existingBlock) {
      console.log('[BLOCK API] DELETE: Block not found');
      return apiResponse.notFound('Block ');
    }

    console.log('[BLOCK API] DELETE: Deleting block at position:', existingBlock.position);
    // Delete block and adjust positions
    await prisma.$transaction(async (tx) => {
      // Delete the block
      await tx.sectionBlock.delete({
        where: { id: blockId }
      });

      // Shift remaining blocks up
      await tx.sectionBlock.updateMany({
        where: {
          sectionId: sectionId,
          position: { gt: existingBlock.position }
        },
        data: {
          position: { decrement: 1 }
        }
      });
    });

    // Check if this is a global section and clear cache
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

    if (sectionInstance && ['header', 'footer', 'announcement-bar'].includes(sectionInstance.sectionType)) {
      const store = sectionInstance.template.store;
      console.log(`[BLOCK API] DELETE: Clearing global sections cache for ${store.subdomain}`);
      globalSectionsLoader.clearCache();
    }

    console.log('[BLOCK API] DELETE: Block deleted successfully');
    return apiResponse.success({ 
      message: 'Block deleted successfully',
      deletedBlockId: blockId
    });
  } catch (error) {
    console.error('[BLOCK API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}

