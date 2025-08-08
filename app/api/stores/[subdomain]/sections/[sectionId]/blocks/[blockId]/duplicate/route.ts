import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// POST - Duplicate block
export async function POST(
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
      return apiResponse.badRequest('Cannot duplicate blocks in temporary sections');
    }

    // Verify store ownership and block exists
    const originalBlock = await prisma.sectionBlock.findFirst({
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

    if (!originalBlock) {
      return apiResponse.notFound('Block ');
    }

    // Create duplicate
    let newBlock;
    await prisma.$transaction(async (tx) => {
      const newPosition = originalBlock.position + 1;

      // Shift existing blocks down
      await tx.sectionBlock.updateMany({
        where: {
          sectionId: sectionId,
          position: { gte: newPosition }
        },
        data: {
          position: { increment: 1 }
        }
      });

      // Create duplicate block
      const createData: any = {
        sectionId: sectionId,
        type: originalBlock.type,
        position: newPosition,
        enabled: originalBlock.enabled
      };
      
      if (originalBlock.settings !== null) {
        createData.settings = originalBlock.settings;
      }
      
      newBlock = await tx.sectionBlock.create({
        data: createData
      });
    });

    return apiResponse.success({
      message: 'Block duplicated successfully',
      block: newBlock
    });
  } catch (error) {
    console.error('[BLOCK API] POST (Duplicate) Error:', error);
    return apiResponse.serverError();
  }
}