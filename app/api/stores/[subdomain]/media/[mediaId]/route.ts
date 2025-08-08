import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for media metadata updates
const mediaUpdateSchema = z.object({
  originalName: z.string().optional(),
  alt: z.string().optional(),
  metadata: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    folder: z.string().optional()
  }).optional()
});

// GET - Get single media file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, mediaId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get media library from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Parse mediaLibrary - it's stored as JSON string
    let mediaLibrary: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        if (typeof storeSettings.mediaLibrary === 'string') {
          mediaLibrary = JSON.parse(storeSettings.mediaLibrary) || [];
        } else if (Array.isArray(storeSettings.mediaLibrary)) {
          mediaLibrary = storeSettings.mediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaLibrary = [];
      }
    }
    const mediaFile = mediaLibrary.find(file => file.id === mediaId);

    if (!mediaFile) {
      return apiResponse.notFound('Media file ');
    }

    return NextResponse.json(mediaFile);
  } catch (error) {
    console.error('[MEDIA API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update media file metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, mediaId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = mediaUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Parse mediaLibrary - it's stored as JSON string
    let mediaLibrary: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        if (typeof storeSettings.mediaLibrary === 'string') {
          mediaLibrary = JSON.parse(storeSettings.mediaLibrary) || [];
        } else if (Array.isArray(storeSettings.mediaLibrary)) {
          mediaLibrary = storeSettings.mediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaLibrary = [];
      }
    }
    const mediaIndex = mediaLibrary.findIndex(file => file.id === mediaId);

    if (mediaIndex === -1) {
      return apiResponse.notFound('Media file ');
    }

    // Update media file
    const updatedFile = {
      ...mediaLibrary[mediaIndex],
      ...validation.data,
      metadata: {
        ...mediaLibrary[mediaIndex].metadata,
        ...validation.data.metadata
      },
      updatedAt: new Date().toISOString()
    };

    mediaLibrary[mediaIndex] = updatedFile;

    // Update store settings - stringify the array
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { 
        mediaLibrary: JSON.stringify(mediaLibrary) 
      }
    });

    return NextResponse.json({
      message: 'Media file updated successfully',
      file: updatedFile
    });
  } catch (error) {
    console.error('[MEDIA API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, mediaId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Parse mediaLibrary - it's stored as JSON string
    let mediaLibrary: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        if (typeof storeSettings.mediaLibrary === 'string') {
          mediaLibrary = JSON.parse(storeSettings.mediaLibrary) || [];
        } else if (Array.isArray(storeSettings.mediaLibrary)) {
          mediaLibrary = storeSettings.mediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaLibrary = [];
      }
    }
    const mediaFile = mediaLibrary.find(file => file.id === mediaId);

    if (!mediaFile) {
      return apiResponse.notFound('Media file ');
    }

    // Check if file is in use (optional - can be overridden)
    const forceDelete = request.nextUrl.searchParams.get('force') === 'true';
    
    if (!forceDelete && mediaFile.usage && mediaFile.usage.length > 0) {
      return NextResponse.json({ 
        error: 'File is in use. Add ?force=true to delete anyway.',
        usage: mediaFile.usage
      }, { status: 400 });
    }

    // Remove from library
    const filteredLibrary = mediaLibrary.filter(file => file.id !== mediaId);

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { mediaLibrary: filteredLibrary }
    });

    // TODO: In production, also delete from storage service
    // await deleteFromStorage(mediaFile.fileUrl);

    return apiResponse.success({ message: 'Media file deleted successfully' });
  } catch (error) {
    console.error('[MEDIA API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}