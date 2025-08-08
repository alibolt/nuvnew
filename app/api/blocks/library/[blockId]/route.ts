import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { BlockLibrary } from '@/lib/block-library';
import { z } from 'zod';

// Request validation schemas
const updateBlockSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  blockType: z.string().min(1).optional(),
  settings: z.record(z.any()).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isGlobal: z.boolean().optional()
});

// GET - Get single block from library
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { blockId } = await params;

    const block = await BlockLibrary.getBlockById(blockId);
    if (!block) {
      return apiResponse.notFound('Block ');
    }

    return NextResponse.json(block);
  } catch (error) {
    console.error('[BLOCK LIBRARY API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update block in library
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { blockId } = await params;
    const body = await request.json();

    // Validate request body
    const validation = updateBlockSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.format()
      }, { status: 400 });
    }

    const updates = validation.data;

    // Update block in library
    const updatedBlock = await BlockLibrary.updateBlock(blockId, updates);
    if (!updatedBlock) {
      return apiResponse.notFound('Block ');
    }

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('[BLOCK LIBRARY API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete block from library
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { blockId } = await params;

    const deleted = await BlockLibrary.deleteBlock(blockId);
    if (!deleted) {
      return apiResponse.notFound('Block ');
    }

    return NextResponse.json({ 
      message: 'Block deleted successfully',
      deletedBlockId: blockId 
    });
  } catch (error) {
    console.error('[BLOCK LIBRARY API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Use block (increment usage count)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ blockId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { blockId } = await params;

    await BlockLibrary.incrementUsage(blockId);

    return NextResponse.json({ 
      message: 'Block usage incremented successfully',
      blockId 
    });
  } catch (error) {
    console.error('[BLOCK LIBRARY API] POST Error:', error);
    return apiResponse.serverError();
  }
}