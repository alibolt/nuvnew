import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';
import { FILE_SIZE_LIMITS, ACCEPTED_FILE_TYPES } from '@/lib/constants';

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

// Using centralized constants from @/lib/constants
const ALLOWED_IMAGE_TYPES = [...ACCEPTED_FILE_TYPES.IMAGE, 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = [...ACCEPTED_FILE_TYPES.VIDEO, 'video/quicktime'];
const ALLOWED_DOCUMENT_TYPES = [...ACCEPTED_FILE_TYPES.DOCUMENT, 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
const MAX_IMAGE_SIZE = FILE_SIZE_LIMITS.IMAGE;
const MAX_VIDEO_SIZE = FILE_SIZE_LIMITS.VIDEO;
const MAX_DOCUMENT_SIZE = FILE_SIZE_LIMITS.DOCUMENT;

// GET - List media files
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get media files from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    // Ensure mediaLibrary is an array
    let mediaFiles: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        // Handle both JSON string and array formats
        if (typeof storeSettings.mediaLibrary === 'string') {
          mediaFiles = JSON.parse(storeSettings.mediaLibrary) || [];
        } else if (Array.isArray(storeSettings.mediaLibrary)) {
          mediaFiles = storeSettings.mediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaFiles = [];
      }
    }

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

    return apiResponse.success({
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
    return apiResponse.serverError();
  }
}

// POST - Upload media file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
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
      return apiResponse.badRequest('File type not allowed');
    }

    // Validate file size
    let maxSize = MAX_DOCUMENT_SIZE;
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      maxSize = MAX_IMAGE_SIZE;
    } else if (ALLOWED_VIDEO_TYPES.includes(mimeType)) {
      maxSize = MAX_VIDEO_SIZE;
    }

    if (validation.data.fileSize > maxSize) {
      return apiResponse.badRequest('File size exceeds maximum allowed (${maxSize / 1024 / 1024}MB)');
    }

    // Generate unique file name and URL
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const sanitizedFileName = validation.data.fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();
    const storedFileName = `${uniqueId}-${sanitizedFileName}`;
    
    // For now, use data URL (in production, upload to S3/Cloudinary)
    const fileUrl = validation.data.fileData 
      ? `data:${mimeType};base64,${validation.data.fileData}`
      : validation.data.fileUrl || `https://storage.nuvi.com/${store.id}/media/${storedFileName}`;
    const thumbnailUrl = ALLOWED_IMAGE_TYPES.includes(mimeType) ? fileUrl : null;

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
    
    mediaLibrary.push(newMedia);

    // Update store settings - stringify the array
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: { 
        mediaLibrary: JSON.stringify(mediaLibrary) 
      },
      create: {
        storeId: store.id,
        mediaLibrary: JSON.stringify(mediaLibrary)
      }
    });

    // Auto-sync logo if uploaded to logos folder or marked as logo
    const isLogo = validation.data.metadata?.folder === 'logos' || 
                   validation.data.fileName?.toLowerCase().includes('logo') ||
                   validation.data.metadata?.title?.toLowerCase().includes('logo');
    
    if (isLogo && ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      // Update store logo
      await prisma.store.update({
        where: { id: store.id },
        data: { logo: fileUrl }
      });

      // Update all header sections
      const headerSections = await prisma.storeSectionInstance.findMany({
        where: {
          template: {
            storeId: store.id
          },
          sectionType: 'header'
        }
      });

      for (const section of headerSections) {
        const currentSettings = section.settings as any || {};
        await prisma.storeSectionInstance.update({
          where: { id: section.id },
          data: {
            settings: {
              ...currentSettings,
              logo_image: fileUrl
            }
          }
        });
      }

      console.log(`✅ Auto-synced logo across store and header sections: ${fileUrl}`);
    }

    // TODO: In production, actually upload the file to storage service
    // if (validation.data.fileData) {
    //   const buffer = Buffer.from(validation.data.fileData, 'base64');
    //   await uploadToS3(buffer, storedFileName);
    // }

    return apiResponse.success({ 
      message: 'File uploaded successfully',
      file: newMedia,
      logoSynced: isLogo
    });
  } catch (error) {
    console.error('[MEDIA API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update media metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { mediaId, metadata } = await request.json();
    
    if (!mediaId) {
      return apiResponse.badRequest('Media ID is required');
    }

    // Validate metadata
    const validation = mediaMetadataSchema.safeParse(metadata);
    if (!validation.success) {
      return apiResponse.validationError(validation.error.format());
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

    // Update metadata
    mediaLibrary[mediaIndex] = {
      ...mediaLibrary[mediaIndex],
      metadata: {
        ...mediaLibrary[mediaIndex].metadata,
        ...validation.data
      },
      updatedAt: new Date().toISOString()
    };

    // Update store settings - stringify the array
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { 
        mediaLibrary: JSON.stringify(mediaLibrary) 
      }
    });

    return apiResponse.success({ 
      message: 'Media metadata updated successfully',
      file: mediaLibrary[mediaIndex]
    });
  } catch (error) {
    console.error('[MEDIA API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    
    if (!mediaId) {
      return apiResponse.badRequest('Media ID is required');
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

    const mediaFile = mediaLibrary.find(file => file.id === mediaId);

    if (!mediaFile) {
      return apiResponse.notFound('Media file ');
    }

    // Check if file is in use
    if (mediaFile.usage && mediaFile.usage.length > 0) {
      return apiResponse.badRequest('Cannot delete file that is in use', mediaFile.usage);
    }

    // Remove from library
    const filteredLibrary = mediaLibrary.filter(file => file.id !== mediaId);

    // Update store settings - stringify the array
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { 
        mediaLibrary: JSON.stringify(filteredLibrary) 
      }
    });

    // TODO: In production, also delete from storage service
    // await deleteFromS3(mediaFile.storedFileName);

    return apiResponse.success({ message: 'Media file deleted successfully' });
  } catch (error) {
    console.error('[MEDIA API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}