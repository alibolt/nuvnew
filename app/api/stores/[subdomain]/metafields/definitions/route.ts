import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for metafield definition
const metafieldDefinitionSchema = z.object({
  name: z.string().min(1),
  namespace: z.string().min(1),
  key: z.string().min(1),
  type: z.enum(['text', 'number', 'date', 'boolean', 'json']),
  description: z.string().optional(),
  appliesTo: z.enum(['products', 'customers', 'orders', 'collections'])
});

// GET - Get all metafield definitions for a store
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

    // Get all metafield definitions for this store
    const definitions = await prisma.metafieldDefinition.findMany({
      where: {
        storeId: store.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      definitions
    });
  } catch (error) {
    console.error('[METAFIELD DEFINITIONS API] GET Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to load metafield definitions'
    }, { status: 500 });
  }
}

// POST - Create a new metafield definition
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
    const validation = metafieldDefinitionSchema.safeParse(body);
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

    // Check if definition already exists
    const existing = await prisma.metafieldDefinition.findFirst({
      where: {
        storeId: store.id,
        namespace: validation.data.namespace,
        key: validation.data.key
      }
    });

    if (existing) {
      return NextResponse.json({ 
        success: false,
        error: 'A definition with this namespace and key already exists'
      }, { status: 409 });
    }

    // Create the metafield definition
    const definition = await prisma.metafieldDefinition.create({
      data: {
        storeId: store.id,
        ...validation.data
      }
    });

    return NextResponse.json({
      success: true,
      definition
    });
  } catch (error) {
    console.error('[METAFIELD DEFINITIONS API] POST Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create metafield definition'
    }, { status: 500 });
  }
}

// DELETE - Delete a metafield definition
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
    const definitionId = searchParams.get('id');
    
    if (!definitionId) {
      return NextResponse.json({ 
        success: false,
        error: 'Definition ID is required'
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

    // Delete the definition
    await prisma.metafieldDefinition.delete({
      where: {
        id: definitionId,
        storeId: store.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Metafield definition deleted successfully'
    });
  } catch (error) {
    console.error('[METAFIELD DEFINITIONS API] DELETE Error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete metafield definition'
    }, { status: 500 });
  }
}