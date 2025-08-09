/**
 * Theme Restore API Route
 * POST /api/stores/[subdomain]/theme/restore - Restore from backup
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThemeBackupManager } from '@/lib/theme-backup';

// Restore from backup
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
      backupId,
      overwrite = false,
      mergeSettings = true,
      validateChecksum = true 
    } = body;

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Get backup from database
    const backup = await prisma.themeBackup.findUnique({
      where: {
        id: backupId,
        storeId: store.id
      }
    });

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Restore backup
    const backupManager = new ThemeBackupManager(backup.themeId);
    const result = await backupManager.restoreBackup(backupId, {
      overwrite,
      mergeSettings,
      validateChecksum
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to restore backup',
          warnings: result.warnings 
        },
        { status: 500 }
      );
    }

    // Update database with restored settings
    if (result.settings) {
      await prisma.themeSettings.upsert({
        where: {
          storeId_themeId: {
            storeId: store.id,
            themeId: backup.themeId
          }
        },
        update: {
          settings: result.settings as any,
          updatedAt: new Date()
        },
        create: {
          storeId: store.id,
          themeId: backup.themeId,
          settings: result.settings as any
        }
      });
    }

    // Update customizations if included
    if (result.customizations) {
      // Clear existing customizations if overwriting
      if (overwrite) {
        await prisma.themeCustomization.deleteMany({
          where: {
            storeId: store.id,
            themeId: backup.themeId
          }
        });
      }

      // Apply customizations
      const customizationPromises = [];

      // Templates
      if (result.customizations.templates) {
        for (const [key, value] of Object.entries(result.customizations.templates)) {
          customizationPromises.push(
            prisma.themeCustomization.upsert({
              where: {
                storeId_themeId_type_key: {
                  storeId: store.id,
                  themeId: backup.themeId,
                  type: 'template',
                  key
                }
              },
              update: {
                value: value as any,
                updatedAt: new Date()
              },
              create: {
                storeId: store.id,
                themeId: backup.themeId,
                type: 'template',
                key,
                value: value as any
              }
            })
          );
        }
      }

      // Sections
      if (result.customizations.sections) {
        for (const [key, value] of Object.entries(result.customizations.sections)) {
          customizationPromises.push(
            prisma.themeCustomization.upsert({
              where: {
                storeId_themeId_type_key: {
                  storeId: store.id,
                  themeId: backup.themeId,
                  type: 'section',
                  key
                }
              },
              update: {
                value: value as any,
                updatedAt: new Date()
              },
              create: {
                storeId: store.id,
                themeId: backup.themeId,
                type: 'section',
                key,
                value: value as any
              }
            })
          );
        }
      }

      // Styles
      if (result.customizations.styles) {
        for (const [key, value] of Object.entries(result.customizations.styles)) {
          customizationPromises.push(
            prisma.themeCustomization.upsert({
              where: {
                storeId_themeId_type_key: {
                  storeId: store.id,
                  themeId: backup.themeId,
                  type: 'style',
                  key
                }
              },
              update: {
                value: value as any,
                updatedAt: new Date()
              },
              create: {
                storeId: store.id,
                themeId: backup.themeId,
                type: 'style',
                key,
                value: value as any
              }
            })
          );
        }
      }

      await Promise.all(customizationPromises);
    }

    // Record restore event
    await prisma.themeRestoreLog.create({
      data: {
        storeId: store.id,
        backupId: backup.id,
        themeId: backup.themeId,
        restoredAt: new Date(),
        success: true,
        warnings: result.warnings
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      warnings: result.warnings
    });
  } catch (error) {
    console.error('[Restore API] Failed to restore backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}

// Delete a backup
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await context.params;
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('backupId');

    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

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

    // Check backup exists and belongs to store
    const backup = await prisma.themeBackup.findUnique({
      where: {
        id: backupId,
        storeId: store.id
      }
    });

    if (!backup) {
      return NextResponse.json(
        { error: 'Backup not found' },
        { status: 404 }
      );
    }

    // Delete from filesystem
    const backupManager = new ThemeBackupManager(backup.themeId);
    await backupManager.deleteBackup(backupId);

    // Delete from database
    await prisma.themeBackup.delete({
      where: { id: backupId }
    });

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('[Restore API] Failed to delete backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}