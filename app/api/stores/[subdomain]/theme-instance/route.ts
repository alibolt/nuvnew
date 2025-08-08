import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { apiResponse } from '@/lib/api/response';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/stores/[subdomain]/theme-instance
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return apiResponse.unauthorized();
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
      select: {
        id: true,
        themeCode: true,
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Return current theme instance
    return apiResponse.success({
      themeCode: store.themeCode || 'commerce',
      availableThemes: ['commerce', 'cotton-yarn']
    });
  } catch (error) {
    console.error('[THEME_INSTANCE_GET]', error);
    return apiResponse.error('Failed to get theme instance');
  }
}

// POST /api/stores/[subdomain]/theme-instance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const { themeCode } = body;

    if (!themeCode || !['commerce', 'cotton-yarn'].includes(themeCode)) {
      return apiResponse.badRequest('Invalid theme code');
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Verify theme exists
    const themePath = path.join(process.cwd(), 'themes', themeCode, 'theme.json');
    try {
      await fs.access(themePath);
    } catch (error) {
      return apiResponse.badRequest('Theme not found');
    }

    // Update store theme
    await prisma.store.update({
      where: { id: store.id },
      data: { themeCode }
    });

    // If the store has template presets applied, we need to update theme references
    // but preserve the user's customizations
    await prisma.storeTemplate.updateMany({
      where: { storeId: store.id },
      data: {
        settings: {
          // Preserve existing settings but update theme reference
          ...(await prisma.storeTemplate.findFirst({
            where: { storeId: store.id },
            select: { settings: true }
          }))?.settings as object || {},
          themeCode
        }
      }
    });

    return apiResponse.success({
      themeCode,
      message: 'Theme applied successfully'
    });
  } catch (error) {
    console.error('[THEME_INSTANCE_POST]', error);
    return apiResponse.error('Failed to apply theme');
  }
}