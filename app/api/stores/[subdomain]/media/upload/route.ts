import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return apiResponse.badRequest('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return apiResponse.badRequest('Invalid file type');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return apiResponse.badRequest('File too large (max 10MB)');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${subdomain}-${timestamp}-${sanitizedFileName}`;
    
    // Create subdirectory for the store
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdomain);
    
    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    const filepath = path.join(uploadDir, filename);
    
    // Write file
    await writeFile(filepath, buffer);

    // Return the URL path
    const url = `/uploads/${subdomain}/${filename}`;

    // Also save to media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let mediaLibrary: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        // Handle both JSON string and array formats
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
    const newMedia = {
      id: `media_${timestamp}_${randomString}`,
      fileName: file.name,
      storedFileName: filename,
      fileUrl: url,
      thumbnailUrl: url,
      mimeType: file.type,
      fileSize: file.size,
      fileExtension: file.name.split('.').pop()?.toLowerCase(),
      context: 'theme',
      metadata: {},
      uploadedBy: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usage: []
    };

    mediaLibrary.push(newMedia);

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

    return NextResponse.json({ 
      url,
      media: newMedia
    });
  } catch (error) {
    console.error('[MEDIA UPLOAD API] Error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}