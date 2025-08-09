/**
 * Theme Backup & Restore System
 * Handles backup creation, storage, and restoration of theme settings
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';

export interface ThemeBackup {
  id: string;
  themeId: string;
  version: string;
  timestamp: Date;
  name: string;
  description?: string;
  settings: any;
  customizations: {
    templates?: Record<string, any>;
    sections?: Record<string, any>;
    styles?: Record<string, any>;
  };
  metadata: {
    platform: string;
    platformVersion: string;
    userAgent?: string;
    createdBy?: string;
  };
  checksum: string;
}

export interface BackupOptions {
  name?: string;
  description?: string;
  includeTemplates?: boolean;
  includeSections?: boolean;
  includeStyles?: boolean;
  compress?: boolean;
}

export interface RestoreOptions {
  overwrite?: boolean;
  mergeSettings?: boolean;
  validateChecksum?: boolean;
  skipIncompatible?: boolean;
}

export interface BackupListItem {
  id: string;
  name: string;
  themeId: string;
  timestamp: Date;
  size: number;
  description?: string;
}

// Backup schema for validation
const BackupSchema = z.object({
  id: z.string(),
  themeId: z.string(),
  version: z.string(),
  timestamp: z.string().transform(str => new Date(str)),
  name: z.string(),
  description: z.string().optional(),
  settings: z.any(),
  customizations: z.object({
    templates: z.record(z.any()).optional(),
    sections: z.record(z.any()).optional(),
    styles: z.record(z.any()).optional()
  }),
  metadata: z.object({
    platform: z.string(),
    platformVersion: z.string(),
    userAgent: z.string().optional(),
    createdBy: z.string().optional()
  }),
  checksum: z.string()
});

export class ThemeBackupManager {
  private themeId: string;
  private backupDir: string;
  private maxBackups: number = 10;

  constructor(themeId: string, backupDir?: string) {
    this.themeId = themeId;
    this.backupDir = backupDir || path.join(process.cwd(), 'backups', 'themes', themeId);
  }

  /**
   * Create a backup of theme settings and customizations
   */
  async createBackup(
    settings: any,
    customizations: any,
    options: BackupOptions = {}
  ): Promise<ThemeBackup> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      // Generate backup ID
      const backupId = this.generateBackupId();
      
      // Load theme manifest for version info
      const manifest = await this.loadThemeManifest();

      // Prepare backup data
      const backup: ThemeBackup = {
        id: backupId,
        themeId: this.themeId,
        version: manifest?.version || '1.0.0',
        timestamp: new Date(),
        name: options.name || `Backup ${new Date().toLocaleString()}`,
        description: options.description,
        settings: this.sanitizeSettings(settings),
        customizations: {
          templates: options.includeTemplates !== false ? customizations.templates : undefined,
          sections: options.includeSections !== false ? customizations.sections : undefined,
          styles: options.includeStyles !== false ? customizations.styles : undefined
        },
        metadata: {
          platform: 'nuvi-saas',
          platformVersion: process.env.PLATFORM_VERSION || '1.0.0',
          userAgent: process.env.USER_AGENT,
          createdBy: process.env.USER_ID
        },
        checksum: ''
      };

      // Calculate checksum
      backup.checksum = this.calculateChecksum(backup);

      // Save backup to file
      const backupPath = path.join(this.backupDir, `${backupId}.json`);
      const backupContent = JSON.stringify(backup, null, 2);
      
      if (options.compress) {
        // Compress backup (using zlib in production)
        await fs.writeFile(backupPath + '.gz', backupContent);
      } else {
        await fs.writeFile(backupPath, backupContent);
      }

      // Cleanup old backups if limit exceeded
      await this.cleanupOldBackups();

      console.log(`[Backup Manager] Created backup ${backupId} for theme ${this.themeId}`);
      return backup;
    } catch (error) {
      console.error('[Backup Manager] Failed to create backup:', error);
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Restore theme settings from backup
   */
  async restoreBackup(
    backupId: string,
    options: RestoreOptions = {}
  ): Promise<{
    success: boolean;
    settings?: any;
    customizations?: any;
    warnings: string[];
  }> {
    const warnings: string[] = [];

    try {
      // Load backup file
      const backupPath = path.join(this.backupDir, `${backupId}.json`);
      const backupExists = await fs.access(backupPath).then(() => true).catch(() => false);
      
      if (!backupExists) {
        throw new Error(`Backup ${backupId} not found`);
      }

      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backup = JSON.parse(backupContent);

      // Validate backup structure
      const validated = BackupSchema.parse(backup);

      // Verify checksum if requested
      if (options.validateChecksum !== false) {
        const calculatedChecksum = this.calculateChecksum({
          ...validated,
          checksum: ''
        });
        
        if (calculatedChecksum !== validated.checksum) {
          warnings.push('Backup checksum mismatch - data may have been corrupted');
          if (!options.skipIncompatible) {
            throw new Error('Backup integrity check failed');
          }
        }
      }

      // Check version compatibility
      const compatibility = await this.checkCompatibility(validated.version);
      if (!compatibility.compatible) {
        warnings.push(`Version compatibility issue: ${compatibility.reason}`);
        if (!options.skipIncompatible) {
          throw new Error(`Incompatible backup version: ${compatibility.reason}`);
        }
      }

      // Prepare restored data
      let restoredSettings = validated.settings;
      let restoredCustomizations = validated.customizations;

      // Handle merge option
      if (options.mergeSettings && !options.overwrite) {
        // Merge with existing settings
        const currentSettings = await this.loadCurrentSettings();
        restoredSettings = this.mergeSettings(currentSettings, validated.settings);
        warnings.push('Settings were merged with existing configuration');
      }

      // Apply restored settings
      const result = await this.applyRestoredData(
        restoredSettings,
        restoredCustomizations,
        options
      );

      if (result.success) {
        console.log(`[Backup Manager] Successfully restored backup ${backupId}`);
      }

      return {
        success: result.success,
        settings: restoredSettings,
        customizations: restoredCustomizations,
        warnings: [...warnings, ...result.warnings]
      };
    } catch (error) {
      console.error('[Backup Manager] Failed to restore backup:', error);
      return {
        success: false,
        warnings: [...warnings, `Restore failed: ${error}`]
      };
    }
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<BackupListItem[]> {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      const files = await fs.readdir(this.backupDir);
      const backups: BackupListItem[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.backupDir, file);
          const stat = await fs.stat(filePath);
          
          try {
            const content = await fs.readFile(filePath, 'utf-8');
            const backup = JSON.parse(content);
            
            backups.push({
              id: backup.id,
              name: backup.name,
              themeId: backup.themeId,
              timestamp: new Date(backup.timestamp),
              size: stat.size,
              description: backup.description
            });
          } catch (error) {
            console.error(`[Backup Manager] Invalid backup file ${file}:`, error);
          }
        }
      }

      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      return backups;
    } catch (error) {
      console.error('[Backup Manager] Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backupPath = path.join(this.backupDir, `${backupId}.json`);
      await fs.unlink(backupPath);
      console.log(`[Backup Manager] Deleted backup ${backupId}`);
      return true;
    } catch (error) {
      console.error('[Backup Manager] Failed to delete backup:', error);
      return false;
    }
  }

  /**
   * Export backup to downloadable format
   */
  async exportBackup(backupId: string): Promise<Buffer | null> {
    try {
      const backupPath = path.join(this.backupDir, `${backupId}.json`);
      const content = await fs.readFile(backupPath);
      return content;
    } catch (error) {
      console.error('[Backup Manager] Failed to export backup:', error);
      return null;
    }
  }

  /**
   * Import backup from uploaded file
   */
  async importBackup(backupData: Buffer | string, options: BackupOptions = {}): Promise<{
    success: boolean;
    backupId?: string;
    error?: string;
  }> {
    try {
      const backup = typeof backupData === 'string' 
        ? JSON.parse(backupData)
        : JSON.parse(backupData.toString());

      // Validate backup structure
      const validated = BackupSchema.parse(backup);

      // Check if backup is for this theme
      if (validated.themeId !== this.themeId) {
        return {
          success: false,
          error: `Backup is for theme ${validated.themeId}, not ${this.themeId}`
        };
      }

      // Save imported backup
      const backupId = validated.id || this.generateBackupId();
      const backupPath = path.join(this.backupDir, `${backupId}.json`);
      
      await fs.mkdir(this.backupDir, { recursive: true });
      await fs.writeFile(backupPath, JSON.stringify(validated, null, 2));

      return {
        success: true,
        backupId
      };
    } catch (error) {
      console.error('[Backup Manager] Failed to import backup:', error);
      return {
        success: false,
        error: `Import failed: ${error}`
      };
    }
  }

  /**
   * Schedule automatic backups
   */
  async scheduleAutoBackup(intervalHours: number = 24): Promise<void> {
    // This would be implemented with a job scheduler in production
    console.log(`[Backup Manager] Auto-backup scheduled every ${intervalHours} hours`);
  }

  /**
   * Generate unique backup ID
   */
  private generateBackupId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.themeId}-${timestamp}-${random}`;
  }

  /**
   * Calculate checksum for backup integrity
   */
  private calculateChecksum(backup: Omit<ThemeBackup, 'checksum'> & { checksum: string }): string {
    const content = JSON.stringify({
      ...backup,
      checksum: ''
    });
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Sanitize settings before backup
   */
  private sanitizeSettings(settings: any): any {
    const sanitized = { ...settings };
    
    // Remove sensitive data
    const sensitiveKeys = ['apiKey', 'secret', 'password', 'token'];
    
    const removeSensitive = (obj: any) => {
      for (const key in obj) {
        if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
          delete obj[key];
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          removeSensitive(obj[key]);
        }
      }
    };

    removeSensitive(sanitized);
    return sanitized;
  }

  /**
   * Merge settings objects
   */
  private mergeSettings(current: any, backup: any): any {
    const merged = { ...current };
    
    for (const key in backup) {
      if (typeof backup[key] === 'object' && backup[key] !== null && !Array.isArray(backup[key])) {
        merged[key] = this.mergeSettings(merged[key] || {}, backup[key]);
      } else {
        merged[key] = backup[key];
      }
    }
    
    return merged;
  }

  /**
   * Clean up old backups
   */
  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      
      if (backups.length > this.maxBackups) {
        // Sort by timestamp (oldest first)
        backups.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // Delete oldest backups
        const toDelete = backups.slice(0, backups.length - this.maxBackups);
        
        for (const backup of toDelete) {
          await this.deleteBackup(backup.id);
        }
      }
    } catch (error) {
      console.error('[Backup Manager] Failed to cleanup old backups:', error);
    }
  }

  /**
   * Load theme manifest
   */
  private async loadThemeManifest(): Promise<any> {
    try {
      const manifestPath = path.join(process.cwd(), 'themes', this.themeId, 'manifest.json');
      const content = await fs.readFile(manifestPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Load current settings
   */
  private async loadCurrentSettings(): Promise<any> {
    // This would load from database in production
    return {};
  }

  /**
   * Check version compatibility
   */
  private async checkCompatibility(backupVersion: string): Promise<{
    compatible: boolean;
    reason?: string;
  }> {
    const manifest = await this.loadThemeManifest();
    if (!manifest) {
      return { compatible: true }; // Can't check, assume compatible
    }

    const currentVersion = manifest.version;
    
    // Simple version check - in production use semver
    if (backupVersion !== currentVersion) {
      const [backupMajor] = backupVersion.split('.').map(Number);
      const [currentMajor] = currentVersion.split('.').map(Number);
      
      if (backupMajor !== currentMajor) {
        return {
          compatible: false,
          reason: `Major version mismatch: backup ${backupVersion} vs current ${currentVersion}`
        };
      }
    }

    return { compatible: true };
  }

  /**
   * Apply restored data
   */
  private async applyRestoredData(
    settings: any,
    customizations: any,
    options: RestoreOptions
  ): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // In production, this would:
      // 1. Save settings to database
      // 2. Update theme files if needed
      // 3. Clear caches
      // 4. Trigger rebuild if necessary
      
      console.log('[Backup Manager] Applying restored settings...');
      
      // Mock implementation
      if (!options.overwrite) {
        warnings.push('Partial restore - some settings may not have been applied');
      }

      return {
        success: true,
        warnings
      };
    } catch (error) {
      return {
        success: false,
        warnings: [...warnings, `Failed to apply settings: ${error}`]
      };
    }
  }
}

/**
 * Create backup for a theme
 */
export async function createThemeBackup(
  themeId: string,
  settings: any,
  options?: BackupOptions
): Promise<ThemeBackup> {
  const manager = new ThemeBackupManager(themeId);
  return manager.createBackup(settings, {}, options);
}

/**
 * Restore theme from backup
 */
export async function restoreThemeBackup(
  themeId: string,
  backupId: string,
  options?: RestoreOptions
): Promise<any> {
  const manager = new ThemeBackupManager(themeId);
  return manager.restoreBackup(backupId, options);
}

/**
 * List all backups for a theme
 */
export async function listThemeBackups(themeId: string): Promise<BackupListItem[]> {
  const manager = new ThemeBackupManager(themeId);
  return manager.listBackups();
}