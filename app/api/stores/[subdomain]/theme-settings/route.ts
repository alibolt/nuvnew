import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Theme settings update schema
const updateThemeSettingsSchema = z.record(z.any());

/**
 * GET /api/stores/[subdomain]/theme-settings
 * Get theme settings for a store
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    // Find the store
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: {
        id: true,
        themeSettings: true,
        themeCode: true
      }
    });

    if (!store) {
      return apiResponse.error('Store not found', 404);
    }

    return apiResponse.success({
      themeSettings: store.themeSettings || {},
      theme: store.themeCode || 'commerce'
    });

  } catch (error) {
    return handleApiError(error, 'Failed to get theme settings');
  }
}

/**
 * PUT /api/stores/[subdomain]/theme-settings
 * Update theme settings for a store
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    console.log('[Theme Settings API] PUT request received for subdomain:', subdomain);
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('[Theme Settings API] Unauthorized - no session');
      return apiResponse.error('Unauthorized', 401);
    }
    const body = await request.json();
    console.log('[Theme Settings API] Request body:', body);

    // Validate request body
    const validatedData = updateThemeSettingsSchema.parse(body);
    console.log('[Theme Settings API] Validated data:', validatedData);

    // Find the store and verify ownership
    const store = await prisma.store.findUnique({
      where: { subdomain },
      select: {
        id: true,
        userId: true,
        themeSettings: true
      }
    });

    if (!store) {
      console.log('[Theme Settings API] Store not found:', subdomain);
      return apiResponse.error('Store not found', 404);
    }

    if (store.userId !== session.user.id) {
      console.log('[Theme Settings API] Forbidden - user mismatch');
      return apiResponse.error('Forbidden', 403);
    }

    // Update theme settings
    console.log('[Theme Settings API] Updating store with data:', validatedData);
    
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        themeSettings: validatedData,
        updatedAt: new Date()
      },
      select: {
        themeSettings: true
      }
    });

    console.log('[Theme Settings API] Updated theme settings for store:', subdomain);
    console.log('[Theme Settings API] Updated data:', updatedStore.themeSettings);

    return apiResponse.success({
      themeSettings: updatedStore.themeSettings,
      message: 'Theme settings updated successfully'
    });

  } catch (error) {
    console.error('[Theme Settings API] Error:', error);
    if (error instanceof z.ZodError) {
      console.log('[Theme Settings API] Zod validation error:', error.errors);
      return apiResponse.error('Invalid theme settings data', 400);
    }
    return handleApiError(error, 'Failed to update theme settings');
  }
}