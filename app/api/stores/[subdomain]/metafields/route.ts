import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for metafield
const metafieldSchema = z.object({
  namespace: z.string().min(1),
  key: z.string().min(1),
  value: z.string().min(1),
  type: z.string(),
  ownerType: z.enum(['Product', 'Customer', 'Order', 'Collection']),
  ownerId: z.string().min(1),
  definitionId: z.string().optional()
});

// GET - Get metafields with optional filters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const ownerType = searchParams.get('ownerType');
    const ownerId = searchParams.get('ownerId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // Find store and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ 
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Build query filters
    const where: any = {
      storeId: store.id
    };

    if (ownerType) {
      where.ownerType = ownerType;
    }

    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Get metafields
    const metafields = await prisma.metafield.findMany({
      where,
      include: {
        definition: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      metafields
    });
  } catch (error) {
    console.error('[METAFIELDS API] GET Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load metafields'
    }, { status: 500 });
  }
}

// POST - Create a new metafield
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { subdomain } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = metafieldSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid input',
        details: validation.error.format()
      }, { status: 400 });
    }

    // Find store and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ 
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Check if metafield already exists for this resource
    const existing = await prisma.metafield.findFirst({
      where: {
        storeId: store.id,
        namespace: validation.data.namespace,
        key: validation.data.key,
        ownerType: validation.data.ownerType,
        ownerId: validation.data.ownerId
      }
    });

    if (existing) {
      // Update existing metafield
      const updated = await prisma.metafield.update({
        where: {
          id: existing.id
        },
        data: {
          value: validation.data.value,
          type: validation.data.type,
          definitionId: validation.data.definitionId
        },
        include: {
          definition: true
        }
      });

      return NextResponse.json({
        success: true,
        metafield: updated,
        message: 'Metafield updated'
      });
    }

    // Create new metafield
    const metafield = await prisma.metafield.create({
      data: {
        storeId: store.id,
        ...validation.data
      },
      include: {
        definition: true
      }
    });

    return NextResponse.json({
      success: true,
      metafield
    });
  } catch (error) {
    console.error('[METAFIELDS API] POST Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create metafield'
    }, { status: 500 });
  }
}

// PUT - Update a metafield
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { id, value, type } = body;
    
    if (!id || !value) {
      return NextResponse.json({ 
        success: false,
        error: 'ID and value are required'
      }, { status: 400 });
    }

    // Find store and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ 
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Update the metafield
    const metafield = await prisma.metafield.update({
      where: {
        id: id,
        storeId: store.id
      },
      data: {
        value,
        ...(type && { type })
      },
      include: {
        definition: true
      }
    });

    return NextResponse.json({
      success: true,
      metafield
    });
  } catch (error) {
    console.error('[METAFIELDS API] PUT Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update metafield'
    }, { status: 500 });
  }
}

// DELETE - Delete a metafield
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const metafieldId = searchParams.get('id');
    
    if (!metafieldId) {
      return NextResponse.json({ 
        success: false,
        error: 'Metafield ID is required'
      }, { status: 400 });
    }

    // Find store and verify ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ 
        success: false,
        error: 'Store not found'
      }, { status: 404 });
    }

    // Delete the metafield
    await prisma.metafield.delete({
      where: {
        id: metafieldId,
        storeId: store.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Metafield deleted successfully'
    });
  } catch (error) {
    console.error('[METAFIELDS API] DELETE Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete metafield'
    }, { status: 500 });
  }
}