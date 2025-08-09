import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode } = await params;
    const url = new URL(request.url);
    const filePath = url.searchParams.get('filePath');
    
    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 });
    }
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get file history
    const history = await prisma.themeFileHistory.findMany({
      where: {
        storeId: store.id,
        themeCode,
        filePath
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50, // Limit to last 50 versions
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ 
      history,
      filePath,
      totalVersions: history.length 
    });
  } catch (error) {
    console.error('Error loading file history:', error);
    return NextResponse.json(
      { error: 'Failed to load file history' },
      { status: 500 }
    );
  }
}

// Restore a specific version
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode } = await params;
    const { historyId, filePath } = await request.json();
    
    if (!filePath || !historyId) {
      return NextResponse.json({ error: 'File path and history ID are required' }, { status: 400 });
    }
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get the history entry
    const historyEntry = await prisma.themeFileHistory.findFirst({
      where: {
        id: historyId,
        storeId: store.id,
        themeCode,
        filePath
      }
    });

    if (!historyEntry) {
      return NextResponse.json({ error: 'History entry not found' }, { status: 404 });
    }

    // Restore the file content
    const fs = require('fs/promises');
    const path = require('path');
    
    const themePath = path.join(process.cwd(), 'themes', themeCode);
    const fullPath = path.join(themePath, filePath);
    
    // Read current content for new history entry
    let currentContent = '';
    try {
      currentContent = await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      // File doesn't exist
    }

    // Write the restored content
    await fs.writeFile(fullPath, historyEntry.content, 'utf-8');

    // Create a new history entry for the restore operation
    await prisma.themeFileHistory.create({
      data: {
        storeId: store.id,
        themeCode,
        filePath,
        content: currentContent,
        changeType: 'update',
        userId: session.user.id,
        userName: session.user.name || session.user.email || 'Unknown',
        message: `Restored to version from ${new Date(historyEntry.createdAt).toLocaleString()}`,
        fileSize: Buffer.byteLength(historyEntry.content, 'utf-8')
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'File restored successfully' 
    });
  } catch (error) {
    console.error('Error restoring file version:', error);
    return NextResponse.json(
      { error: 'Failed to restore file version' },
      { status: 500 }
    );
  }
}