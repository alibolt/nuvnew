import { NextRequest, NextResponse } from 'next/server';
import { getOptionalAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PUT /api/stores/[storeId]/sections/reorder - Reorder sections
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getOptionalAuth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { sections } = await req.json();

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { error: 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}