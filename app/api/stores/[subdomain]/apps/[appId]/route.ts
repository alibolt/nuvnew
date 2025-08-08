import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// GET: Get app installation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, appId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get app installation
    const installation = await prisma.appInstall.findFirst({
      where: {
        storeId: store.id,
        appId: appId,
      },
      include: {
        app: true,
      },
    });

    if (!installation) {
      return apiResponse.notFound('App installation ');
    }

    return apiResponse.success(installation);
  } catch (error) {
    console.error('Error fetching app installation:', error);
    return handleApiError(error);
  }
}

// PUT: Update app settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, appId } = await params;
    const body = await request.json();
    const { settings, status } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Update app installation
    const installation = await prisma.appInstall.update({
      where: {
        storeId_appId: {
          storeId: store.id,
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

    return apiResponse.success(installation);
  } catch (error) {
    console.error('Error updating app installation:', error);
    return handleApiError(error);
  }
}

// DELETE: Uninstall app
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; appId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, appId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Delete app installation
    await prisma.appInstall.delete({
      where: {
        storeId_appId: {
          storeId: store.id,
          appId: appId,
        },
      },
    });

    return apiResponse.success({ success: true });
  } catch (error) {
    console.error('Error uninstalling app:', error);
    return handleApiError(error);
  }
}