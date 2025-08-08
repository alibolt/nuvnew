
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify user owns this store
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { themeSettings: true },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json(store.themeSettings || {});
  } catch (error) {
    console.error('Failed to get theme settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Verify user owns this store
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });
  
  if (!store) {
    return NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 });
  }

  try {
    const themeSettings = await request.json();
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: { themeSettings },
    });

    return NextResponse.json(updatedStore.themeSettings);
  } catch (error) {
    console.error('Failed to update theme settings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
