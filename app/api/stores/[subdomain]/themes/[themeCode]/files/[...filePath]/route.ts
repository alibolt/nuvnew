import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string; filePath: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode, filePath } = await params;
    
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

    // Build file path
    const requestedFile = filePath.join('/');
    
    // Prioritize source themes directory for code files
    const srcThemePath = path.join(process.cwd(), 'themes', themeCode);
    const publicThemePath = path.join(process.cwd(), 'public', 'themes', themeCode);
    
    let themePath: string;
    try {
      // Check source themes first (has all the code files)
      await fs.access(srcThemePath);
      themePath = srcThemePath;
    } catch {
      try {
        // Fallback to public themes (usually only has JSON configs)
        await fs.access(publicThemePath);
        themePath = publicThemePath;
      } catch {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
    }

    const fullPath = path.join(themePath, requestedFile);
    
    // Security: Ensure the path is within the theme directory
    if (!fullPath.startsWith(themePath)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Read file content
    const content = await fs.readFile(fullPath, 'utf-8');
    
    return NextResponse.json({ content, path: requestedFile });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json(
      { error: 'Failed to read file' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string; filePath: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode, filePath } = await params;
    const { content, message } = await request.json();
    
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

    // Build file path
    const requestedFile = filePath.join('/');
    
    // Only allow editing themes in the themes directory (not public/themes)
    const themePath = path.join(process.cwd(), 'themes', themeCode);
    const fullPath = path.join(themePath, requestedFile);
    
    // Security: Ensure the path is within the theme directory
    if (!fullPath.startsWith(themePath)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Save original content to history
    let originalContent = '';
    let changeType = 'update';
    try {
      originalContent = await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      // File doesn't exist, this is a create operation
      changeType = 'create';
    }

    // Save to file history in database
    try {
      // Calculate diff if it's an update
      let diff = null;
      if (changeType === 'update' && originalContent !== content) {
        // Simple diff: show lines added/removed count
        const originalLines = originalContent.split('\n').length;
        const newLines = content.split('\n').length;
        diff = `Lines: ${originalLines} → ${newLines} (${newLines - originalLines >= 0 ? '+' : ''}${newLines - originalLines})`;
      }

      await prisma.themeFileHistory.create({
        data: {
          storeId: store.id,
          themeCode,
          filePath: requestedFile,
          content: changeType === 'update' ? originalContent : '', // Store previous content
          changeType,
          userId: session.user.id,
          userName: session.user.name || session.user.email || 'Unknown',
          message: message || `${changeType === 'create' ? 'Created' : 'Updated'} ${requestedFile}`,
          diff,
          fileSize: Buffer.byteLength(content, 'utf-8')
        }
      });
    } catch (error) {
      console.warn('Failed to save file history:', error);
    }

    // Write new content
    await fs.writeFile(fullPath, content, 'utf-8');
    
    return NextResponse.json({ success: true, message: 'File saved successfully' });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json(
      { error: 'Failed to save file' },
      { status: 500 }
    );
  }
}