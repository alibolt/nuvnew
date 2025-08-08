import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const settings = await req.json();

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

    // Update all templates' settings for this store
    await prisma.storeTemplate.updateMany({
      where: { storeId: store.id },
      data: {
        settings: settings
      }
    });

    return apiResponse.success({ success: true, settings });
  } catch (error) {
    return handleApiError(error, 'theme-instance-settings-put');
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;

    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
      include: {
        templates: {
          where: { enabled: true },
          take: 1,
          orderBy: { updatedAt: 'desc' }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Return settings from the most recent enabled template
    const settings = store.templates[0]?.settings || {};
    return apiResponse.success(settings);
  } catch (error) {
    return handleApiError(error, 'theme-instance-settings-get');
  }
}