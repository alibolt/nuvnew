import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET: Get app installation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, appId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get app installation
    const installation = await prisma.appInstall.findFirst({
      where: {
        storeId: storeId,
        appId: appId,
      },
      include: {
        app: true,
      },
    });

    if (!installation) {
      return NextResponse.json(
        { error: 'App installation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ installation });
  } catch (error) {
    console.error('Error fetching app installation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app installation' },
      { status: 500 }
    );
  }
}

// PUT: Update app settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, appId } = await params;
    const body = await request.json();
    const { settings, status } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update app installation
    const installation = await prisma.appInstall.update({
      where: {
        storeId_appId: {
          storeId: storeId,
          appId: appId,
        },
      },
      data: {
        ...(settings && { settings }),
        ...(status && { status }),
        lastUsedAt: new Date(),
      },
      include: {
        app: true,
      },
    });

    return NextResponse.json({ installation });
  } catch (error) {
    console.error('Error updating app installation:', error);
    return NextResponse.json(
      { error: 'Failed to update app installation' },
      { status: 500 }
    );
  }
}

// DELETE: Uninstall app
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, appId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Delete app installation
    await prisma.appInstall.delete({
      where: {
        storeId_appId: {
          storeId: storeId,
          appId: appId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uninstalling app:', error);
    return NextResponse.json(
      { error: 'Failed to uninstall app' },
      { status: 500 }
    );
  }
}