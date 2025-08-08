import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;
  
  try {
    // Get section with blocks
    const section = await prisma.storeSectionInstance.findUnique({
      where: { id: sectionId },
      include: {
        blocks: {
          orderBy: { position: 'asc' }
        }
      }
    });
    
    if (!section) {
      return apiResponse.notFound('Section ');
    }
    
    // Transform to show nested structure
    const transformedSection = {
      id: section.id,
      type: section.sectionType,
      settings: section.settings,
      blocks: section.blocks.map(block => ({
        id: block.id,
        type: block.type,
        position: block.position,
        enabled: block.enabled,
        settings: block.settings,
        // Show nested blocks if container
        nestedBlocks: block.type === 'container' ? block.settings?.blocks : undefined
      }))
    };
    
    return NextResponse.json({
      section: transformedSection,
      raw: section
    });
  } catch (error) {
    console.error('Debug section error:', error);
    return apiResponse.serverError();
  }
}