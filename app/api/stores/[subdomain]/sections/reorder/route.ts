import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/stores/[subdomain]/sections/reorder - Reorder sections
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { sections } = await req.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Update all section positions in a transaction
    await prisma.$transaction(
      sections.map((section: { id: string; position: number }) =>
        prisma.storeSectionInstance.update({
          where: { id: section.id },
          data: { position: section.position }
        })
      )
    );

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return handleApiError(error, 'Failed to reorder sections');
  }
}