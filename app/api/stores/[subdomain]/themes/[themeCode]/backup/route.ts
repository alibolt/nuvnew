import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';

// Create a backup of the theme
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

    // Check if theme exists
    const themePath = path.join(process.cwd(), 'themes', themeCode);
    
    try {
      await fs.access(themePath);
    } catch {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    // Create backup directory
    const backupDir = path.join(process.cwd(), '.theme-backups', store.id, themeCode);
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const backupPath = path.join(backupDir, backupName);
    
    // Copy theme to backup directory
    await copyDirectory(themePath, backupPath);
    
    // Save backup metadata
    const metadata = {
      id: backupName,
      themeCode,
      createdAt: new Date().toISOString(),
      store: {
        id: store.id,
        subdomain: store.subdomain,
        name: store.name
      },
      description: request.nextUrl.searchParams.get('description') || 'Manual backup'
    };
    
    await fs.writeFile(
      path.join(backupPath, 'backup.meta.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    return NextResponse.json({ 
      success: true,
      backupId: backupName,
      message: 'Backup created successfully' 
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// List all backups for a theme
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

    // List backups
    const backupDir = path.join(process.cwd(), '.theme-backups', store.id, themeCode);
    
    try {
      await fs.access(backupDir);
    } catch {
      // No backups yet
      return NextResponse.json({ backups: [] });
    }
    
    const backupDirs = await fs.readdir(backupDir, { withFileTypes: true });
    const backups = [];
    
    for (const dir of backupDirs) {
      if (dir.isDirectory()) {
        try {
          const metaPath = path.join(backupDir, dir.name, 'backup.meta.json');
          const metaContent = await fs.readFile(metaPath, 'utf-8');
          const metadata = JSON.parse(metaContent);
          
          // Get backup size
          const stats = await fs.stat(path.join(backupDir, dir.name));
          
          backups.push({
            ...metadata,
            size: stats.size,
            path: dir.name
          });
        } catch (error) {
          console.warn(`Failed to read backup metadata for ${dir.name}:`, error);
        }
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ backups });
  } catch (error) {
    console.error('Error listing backups:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

async function copyDirectory(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}