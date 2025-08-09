import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string; backupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode, backupId } = await params;
    
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

    // Check if backup exists
    const backupPath = path.join(process.cwd(), '.theme-backups', store.id, themeCode, backupId);
    
    try {
      await fs.access(backupPath);
    } catch {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Create a backup of current state before restoring
    const themePath = path.join(process.cwd(), 'themes', themeCode);
    const preRestoreBackupDir = path.join(process.cwd(), '.theme-backups', store.id, themeCode);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreBackupName = `pre-restore-${timestamp}`;
    const preRestoreBackupPath = path.join(preRestoreBackupDir, preRestoreBackupName);
    
    await copyDirectory(themePath, preRestoreBackupPath);
    
    // Save pre-restore backup metadata
    const preRestoreMetadata = {
      id: preRestoreBackupName,
      themeCode,
      createdAt: new Date().toISOString(),
      store: {
        id: store.id,
        subdomain: store.subdomain,
        name: store.name
      },
      description: `Auto-backup before restoring to ${backupId}`
    };
    
    await fs.writeFile(
      path.join(preRestoreBackupPath, 'backup.meta.json'),
      JSON.stringify(preRestoreMetadata, null, 2)
    );

    // Clear current theme directory
    await fs.rm(themePath, { recursive: true, force: true });
    
    // Restore from backup
    await copyDirectory(backupPath, themePath);
    
    // Remove backup metadata file from restored theme
    try {
      await fs.unlink(path.join(themePath, 'backup.meta.json'));
    } catch {
      // File might not exist
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Theme restored successfully',
      preRestoreBackupId: preRestoreBackupName
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}

// Delete a backup
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; themeCode: string; backupId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subdomain, themeCode, backupId } = await params;
    
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

    // Delete backup
    const backupPath = path.join(process.cwd(), '.theme-backups', store.id, themeCode, backupId);
    
    try {
      await fs.rm(backupPath, { recursive: true, force: true });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete backup' }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
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