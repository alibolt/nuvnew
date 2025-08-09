import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain } = await context.params;
    const { themeCode } = await request.json();

    if (!themeCode) {
      return NextResponse.json({ error: 'Theme code is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Update store's theme code
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: { 
        themeCode,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      themeCode: updatedStore.themeCode 
    });
  } catch (error) {
    console.error('Failed to update store theme:', error);
    return NextResponse.json(
      { error: 'Failed to update store theme' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain } = await context.params;

    // Get store's current theme
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id
      },
      select: {
        themeCode: true,
        themeSettings: true
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      themeCode: store.themeCode || 'base',
      themeSettings: store.themeSettings || {}
    });
  } catch (error) {
    console.error('Failed to get store theme:', error);
    return NextResponse.json(
      { error: 'Failed to get store theme' },
      { status: 500 }
    );
  }
}