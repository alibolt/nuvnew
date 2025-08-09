/**
 * Theme Backup API Routes
 * POST /api/stores/[subdomain]/theme/backup - Create a backup
 * GET /api/stores/[subdomain]/theme/backup - List backups
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThemeBackupManager } from '@/lib/theme-backup';

// Create a new backup
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      name, 
      description, 
      includeTemplates = true,
      includeSections = true,
      includeStyles = true 
    } = body;

    // Get current theme settings
    const themeSettings = await prisma.themeSettings.findFirst({
      where: { 
        storeId: store.id,
        themeId: store.themeCode || 'base'
      }
    });

    // Get theme customizations
    const customizations = await prisma.themeCustomization.findMany({
      where: {
        storeId: store.id,
        themeId: store.themeCode || 'base'
      }
    });

    // Organize customizations by type
    const customizationData = {
      templates: {},
      sections: {},
      styles: {}
    };

    customizations.forEach(custom => {
      if (custom.type === 'template') {
        customizationData.templates[custom.key] = custom.value;
      } else if (custom.type === 'section') {
        customizationData.sections[custom.key] = custom.value;
      } else if (custom.type === 'style') {
        customizationData.styles[custom.key] = custom.value;
      }
    });

    // Create backup
    const backupManager = new ThemeBackupManager(store.themeCode || 'base');
    const backup = await backupManager.createBackup(
      themeSettings?.settings || {},
      customizationData,
      {
        name,
        description,
        includeTemplates,
        includeSections,
        includeStyles
      }
    );

    // Save backup reference to database
    await prisma.themeBackup.create({
      data: {
        id: backup.id,
        storeId: store.id,
        themeId: store.themeCode || 'base',
        name: backup.name,
        description: backup.description,
        settings: backup.settings as any,
        customizations: backup.customizations as any,
        metadata: backup.metadata as any,
        checksum: backup.checksum,
        createdAt: backup.timestamp
      }
    });

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        name: backup.name,
        timestamp: backup.timestamp,
        description: backup.description
      }
    });
  } catch (error) {
    console.error('[Backup API] Failed to create backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// List backups
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    
    // Get store
    const store = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (!store) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Get backups from database
    const backups = await prisma.themeBackup.findMany({
      where: {
        storeId: store.id,
        themeId: store.themeCode || 'base'
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        themeId: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limit to last 20 backups
    });

    return NextResponse.json({
      success: true,
      backups: backups.map(backup => ({
        id: backup.id,
        name: backup.name,
        description: backup.description,
        timestamp: backup.createdAt,
        themeId: backup.themeId
      }))
    });
  } catch (error) {
    console.error('[Backup API] Failed to list backups:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}