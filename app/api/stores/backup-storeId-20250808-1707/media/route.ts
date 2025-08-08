import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema for media metadata
const mediaMetadataSchema = z.object({
  title: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folder: z.string().optional()
});

// Schema for media upload
const mediaUploadSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().min(1),
  fileData: z.string().optional(), // Base64 encoded
  fileUrl: z.string().url().optional(),
  metadata: mediaMetadataSchema.optional(),
  context: z.enum(['product', 'blog', 'page', 'general', 'theme']).default('general'),
  contextId: z.string().optional()
});

// Allowed file types and size limits
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

// GET - List media files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    
    // Filters
    const type = searchParams.get('type'); // image, video, document
    const context = searchParams.get('context');
    const contextId = searchParams.get('contextId');
    const folder = searchParams.get('folder');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags')?.split(',');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get media files from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let mediaFiles = (storeSettings?.mediaLibrary as any[]) || [];

    // Apply filters
    if (type) {
      const typeMap: Record<string, string[]> = {
        image: ALLOWED_IMAGE_TYPES,
        video: ALLOWED_VIDEO_TYPES,
        document: ALLOWED_DOCUMENT_TYPES
      };
      
      if (typeMap[type]) {
        mediaFiles = mediaFiles.filter(file => typeMap[type].includes(file.mimeType));
      }
    }
    
    if (context) {
      mediaFiles = mediaFiles.filter(file => file.context === context);
    }
    
    if (contextId) {
      mediaFiles = mediaFiles.filter(file => file.contextId === contextId);
    }
    
    if (folder) {
      mediaFiles = mediaFiles.filter(file => file.metadata?.folder === folder);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      mediaFiles = mediaFiles.filter(file =>
        file.fileName.toLowerCase().includes(searchLower) ||
        file.metadata?.title?.toLowerCase().includes(searchLower) ||
        file.metadata?.alt?.toLowerCase().includes(searchLower) ||
        file.metadata?.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }
    
    if (tags && tags.length > 0) {
      mediaFiles = mediaFiles.filter(file =>
        tags.some(tag => file.metadata?.tags?.includes(tag))
      );
    }

    // Sort files
    mediaFiles.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'fileName') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Get folder structure
    const folders = [...new Set(mediaFiles
      .map(file => file.metadata?.folder)
      .filter(Boolean)
    )].sort();

    // Calculate storage usage
    const storageUsage = {
      totalSize: mediaFiles.reduce((sum, file) => sum + file.fileSize, 0),
      totalFiles: mediaFiles.length,
      byType: {
        images: mediaFiles.filter(f => ALLOWED_IMAGE_TYPES.includes(f.mimeType)).length,
        videos: mediaFiles.filter(f => ALLOWED_VIDEO_TYPES.includes(f.mimeType)).length,
        documents: mediaFiles.filter(f => ALLOWED_DOCUMENT_TYPES.includes(f.mimeType)).length
      }
    };

    // Apply pagination
    const total = mediaFiles.length;
    const startIndex = (page - 1) * limit;
    const paginatedFiles = mediaFiles.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      files: paginatedFiles,
      folders,
      storageUsage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[MEDIA API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Upload media file
export async function POST(
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
    
    // Validate input
    const validation = mediaUploadSchema.safeParse(body);
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
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Validate file type
    const fileExtension = validation.data.fileName.split('.').pop()?.toLowerCase();
    const mimeType = validation.data.fileType;
    
    const isAllowedType = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_VIDEO_TYPES,
      ...ALLOWED_DOCUMENT_TYPES
    ].includes(mimeType);

    if (!isAllowedType) {
      return NextResponse.json({ 
        error: 'File type not allowed' 
      }, { status: 400 });
    }

    // Validate file size
    let maxSize = MAX_DOCUMENT_SIZE;
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      maxSize = MAX_IMAGE_SIZE;
    } else if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      maxSize = MAX_VIDEO_SIZE;
    }

    if (validation.data.fileSize > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)` 
      }, { status: 400 });
    }

    // Generate unique file name and URL
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const sanitizedFileName = validation.data.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const storedFileName = `${uniqueId}-${sanitizedFileName}`;
    
    // In production, you would upload to S3/Cloudinary/etc
    const fileUrl = `https://storage.nuvi.com/${store.id}/media/${storedFileName}`;
    const thumbnailUrl = ALLOWED_IMAGE_TYPES.includes(mimeType) 
      ? `https://storage.nuvi.com/${store.id}/media/thumb_${storedFileName}`
      : null;

    // Create media record
    const newMedia = {
      id: `media_${Date.now()}`,
      fileName: validation.data.fileName,
      storedFileName,
      fileUrl,
      thumbnailUrl,
      mimeType,
      fileSize: validation.data.fileSize,
      fileExtension,
      context: validation.data.context,
      contextId: validation.data.contextId,
      metadata: validation.data.metadata || {},
      uploadedBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: [] // Track where this media is used
    };

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const mediaLibrary = (storeSettings?.mediaLibrary as any[]) || [];
    mediaLibrary.push(newMedia);

    // Update store settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { mediaLibrary },
      create: {
        storeId: store.id,
        mediaLibrary
      }
    });

    // TODO: In production, actually upload the file to storage service
    // if (validation.data.fileData) {
    //   const buffer = Buffer.from(validation.data.fileData, 'base64');
    //   await uploadToS3(buffer, storedFileName);
    // }

    return NextResponse.json({ 
      message: 'File uploaded successfully',
      file: newMedia
    });
  } catch (error) {
    console.error('[MEDIA API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update media metadata
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
    const { mediaId, metadata } = await request.json();
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Validate metadata
    const validation = mediaMetadataSchema.safeParse(metadata);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid metadata', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const mediaLibrary = (storeSettings?.mediaLibrary as any[]) || [];
    const mediaIndex = mediaLibrary.findIndex(file => file.id === mediaId);

    if (mediaIndex === -1) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // Update metadata
    mediaLibrary[mediaIndex] = {
      ...mediaLibrary[mediaIndex],
      metadata: {
        ...mediaLibrary[mediaIndex].metadata,
        ...validation.data
      },
      updatedAt: new Date().toISOString()
    };

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { mediaLibrary }
    });

    return NextResponse.json({ 
      message: 'Media metadata updated successfully',
      file: mediaLibrary[mediaIndex]
    });
  } catch (error) {
    console.error('[MEDIA API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete media file
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
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const mediaLibrary = (storeSettings?.mediaLibrary as any[]) || [];
    const mediaFile = mediaLibrary.find(file => file.id === mediaId);

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 });
    }

    // Check if file is in use
    if (mediaFile.usage && mediaFile.usage.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete file that is in use',
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
    // await deleteFromS3(mediaFile.storedFileName);

    return NextResponse.json({ 
      message: 'Media file deleted successfully'
    });
  } catch (error) {
    console.error('[MEDIA API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}