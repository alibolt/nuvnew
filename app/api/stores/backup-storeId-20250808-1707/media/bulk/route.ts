import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for bulk operations
const bulkOperationSchema = z.object({
  action: z.enum(['delete', 'move', 'tag', 'update']),
  mediaIds: z.array(z.string()).min(1),
  data: z.object({
    folder: z.string().optional(),
    tags: z.array(z.string()).optional(),
    addTags: z.array(z.string()).optional(),
    removeTags: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional()
  }).optional()
});

// Schema for folder operations
const folderOperationSchema = z.object({
  action: z.enum(['create', 'rename', 'delete']),
  folderName: z.string().min(1),
  newName: z.string().optional()
});

// POST - Bulk operations on media files
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
    const validation = bulkOperationSchema.safeParse(body);
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

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let mediaLibrary = (storeSettings?.mediaLibrary as any[]) || [];
    const { action, mediaIds, data } = validation.data;
    
    let affectedCount = 0;
    const results = {
      success: [] as string[],
      failed: [] as { id: string; reason: string }[]
    };

    switch (action) {
      case 'delete':
        // Check if any files are in use
        for (const mediaId of mediaIds) {
          const file = mediaLibrary.find(f => f.id === mediaId);
          if (file) {
            if (file.usage && file.usage.length > 0) {
              results.failed.push({ 
                id: mediaId, 
                reason: 'File is in use' 
              });
            } else {
              results.success.push(mediaId);
              affectedCount++;
            }
          }
        }
        
        // Remove successful deletions
        if (results.success.length > 0) {
          mediaLibrary = mediaLibrary.filter(f => !results.success.includes(f.id));
        }
        break;
        
      case 'move':
        if (!data?.folder) {
          return NextResponse.json({ 
            error: 'Folder name is required for move operation' 
          }, { status: 400 });
        }
        
        for (const mediaId of mediaIds) {
          const fileIndex = mediaLibrary.findIndex(f => f.id === mediaId);
          if (fileIndex !== -1) {
            mediaLibrary[fileIndex] = {
              ...mediaLibrary[fileIndex],
              metadata: {
                ...mediaLibrary[fileIndex].metadata,
                folder: data.folder
              },
              updatedAt: new Date().toISOString()
            };
            results.success.push(mediaId);
            affectedCount++;
          } else {
            results.failed.push({ 
              id: mediaId, 
              reason: 'File not found' 
            });
          }
        }
        break;
        
      case 'tag':
        for (const mediaId of mediaIds) {
          const fileIndex = mediaLibrary.findIndex(f => f.id === mediaId);
          if (fileIndex !== -1) {
            let currentTags = mediaLibrary[fileIndex].metadata?.tags || [];
            
            // Add tags
            if (data?.addTags) {
              currentTags = [...new Set([...currentTags, ...data.addTags])];
            }
            
            // Remove tags
            if (data?.removeTags) {
              currentTags = currentTags.filter(tag => !data.removeTags!.includes(tag));
            }
            
            // Replace tags
            if (data?.tags) {
              currentTags = data.tags;
            }
            
            mediaLibrary[fileIndex] = {
              ...mediaLibrary[fileIndex],
              metadata: {
                ...mediaLibrary[fileIndex].metadata,
                tags: currentTags
              },
              updatedAt: new Date().toISOString()
            };
            results.success.push(mediaId);
            affectedCount++;
          } else {
            results.failed.push({ 
              id: mediaId, 
              reason: 'File not found' 
            });
          }
        }
        break;
        
      case 'update':
        if (!data?.metadata) {
          return NextResponse.json({ 
            error: 'Metadata is required for update operation' 
          }, { status: 400 });
        }
        
        for (const mediaId of mediaIds) {
          const fileIndex = mediaLibrary.findIndex(f => f.id === mediaId);
          if (fileIndex !== -1) {
            mediaLibrary[fileIndex] = {
              ...mediaLibrary[fileIndex],
              metadata: {
                ...mediaLibrary[fileIndex].metadata,
                ...data.metadata
              },
              updatedAt: new Date().toISOString()
            };
            results.success.push(mediaId);
            affectedCount++;
          } else {
            results.failed.push({ 
              id: mediaId, 
              reason: 'File not found' 
            });
          }
        }
        break;
    }

    // Update store settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { mediaLibrary }
    });

    return NextResponse.json({ 
      message: `Bulk ${action} completed`,
      affectedCount,
      results
    });
  } catch (error) {
    console.error('[MEDIA BULK API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Folder operations
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
    const body = await request.json();
    
    // Validate input
    const validation = folderOperationSchema.safeParse(body);
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

    // Get current media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const mediaLibrary = (storeSettings?.mediaLibrary as any[]) || [];
    const { action, folderName, newName } = validation.data;
    
    switch (action) {
      case 'create':
        // Folder is created implicitly when files are moved to it
        return NextResponse.json({ 
          message: 'Folder created successfully',
          folder: folderName
        });
        
      case 'rename':
        if (!newName) {
          return NextResponse.json({ 
            error: 'New name is required for rename operation' 
          }, { status: 400 });
        }
        
        // Check if folder exists
        const filesInFolder = mediaLibrary.filter(f => f.metadata?.folder === folderName);
        if (filesInFolder.length === 0) {
          return NextResponse.json({ 
            error: 'Folder not found or is empty' 
          }, { status: 404 });
        }
        
        // Update all files in the folder
        let updatedCount = 0;
        for (let i = 0; i < mediaLibrary.length; i++) {
          if (mediaLibrary[i].metadata?.folder === folderName) {
            mediaLibrary[i] = {
              ...mediaLibrary[i],
              metadata: {
                ...mediaLibrary[i].metadata,
                folder: newName
              },
              updatedAt: new Date().toISOString()
            };
            updatedCount++;
          }
        }
        
        await prisma.storeSettings.update({
          where: { storeId: store.id },
          data: { mediaLibrary }
        });
        
        return NextResponse.json({ 
          message: 'Folder renamed successfully',
          oldName: folderName,
          newName,
          filesUpdated: updatedCount
        });
        
      case 'delete':
        // Check if folder has files
        const folderFiles = mediaLibrary.filter(f => f.metadata?.folder === folderName);
        if (folderFiles.length > 0) {
          return NextResponse.json({ 
            error: 'Cannot delete folder that contains files. Move or delete files first.',
            fileCount: folderFiles.length
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          message: 'Folder deleted successfully',
          folder: folderName
        });
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('[MEDIA FOLDER API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}