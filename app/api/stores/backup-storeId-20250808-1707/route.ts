import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { deleteSubdomain } from '@/lib/subdomains';

// GET - Get store details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    console.log('[STORE API] Request for storeId:', storeId);
    
    const session = await getServerSession(authOptions);
    console.log('[STORE API] Session:', session ? `User: ${session.user?.email}` : 'Not authenticated');
    
    if (!session?.user?.id) {
      console.log('[STORE API] Returning 401 Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[STORE API] Looking for store:', storeId, 'for user:', session.user.id);

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      },
      include: {
        activeTheme: true
      }
    });

    console.log('[STORE API] Store found:', store ? store.subdomain : 'NOT FOUND');
    console.log('[STORE API] Active theme:', store?.activeTheme ? `${store.activeTheme.code} (${store.activeThemeId})` : 'NONE');

    if (!store) {
      console.log('[STORE API] Store not found, returning 404');
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('[STORE API] GET_STORE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update store
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { 
      name, 
      description, 
      logo, 
      primaryColor,
      email,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      metaTitle,
      metaDescription,
      keywords,
      bannerImage,
      bannerTitle,
      bannerSubtitle
    } = body;

    // Check if store exists and belongs to user
    const existingStore = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!existingStore) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: {
        name,
        description,
        logo,
        primaryColor,
        email,
        phone,
        address,
        facebook,
        instagram,
        twitter,
        youtube,
        metaTitle,
        metaDescription,
        keywords,
        bannerImage,
        bannerTitle,
        bannerSubtitle
      }
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error('UPDATE_STORE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;

    // Check if store exists and belongs to user
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Delete from database
    await prisma.store.delete({
      where: { id: storeId }
    });

    // Delete from Redis
    await deleteSubdomain(store.subdomain);

    return NextResponse.json({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('DELETE_STORE_ERROR', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}