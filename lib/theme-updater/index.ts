/**
 * Theme Update Mechanism
 * Handles theme updates, version checking, and safe rollbacks
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ThemeVersionManager, compareVersions, isBreakingChange } from '../theme-version';
import { ThemeValidator } from '../theme-validator';
import { ThemeBackupManager } from '../theme-backup';
import { ThemeDependencyManager } from '../theme-dependencies';
import { ThemeSecurityScanner } from '../theme-security';

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  releaseNotes?: string;
  breaking: boolean;
  publishedAt?: Date;
  downloadUrl?: string;
  size?: number;
}

export interface UpdateResult {
  success: boolean;
  version: string;
  backupId?: string;
  warnings: string[];
  errors: string[];
  rollbackAvailable: boolean;
}

export interface UpdateOptions {
  createBackup?: boolean;
  validateSecurity?: boolean;
  checkDependencies?: boolean;
  autoMigrate?: boolean;
  dryRun?: boolean;
}

export interface UpdateSource {
  type: 'github' | 'npm' | 'url' | 'local';
  location: string;
  branch?: string;
  tag?: string;
}

export class ThemeUpdater {
  private themeId: string;
  private themePath: string;
  private currentVersion: string;
  private updateSource?: UpdateSource;
  private tempDir: string;

  constructor(themeId: string, currentVersion: string, updateSource?: UpdateSource) {
    this.themeId = themeId;
    this.currentVersion = currentVersion;
    this.updateSource = updateSource;
    this.themePath = path.join(process.cwd(), 'themes', themeId);
    this.tempDir = path.join(process.cwd(), '.tmp', 'theme-updates', themeId);
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateInfo> {
    try {
      let latestVersion = this.currentVersion;
      let releaseNotes = '';
      let downloadUrl = '';
      let publishedAt: Date | undefined;

      if (this.updateSource) {
        switch (this.updateSource.type) {
          case 'github':
            const githubInfo = await this.checkGithubUpdates();
            latestVersion = githubInfo.version;
            releaseNotes = githubInfo.releaseNotes;
            downloadUrl = githubInfo.downloadUrl;
            publishedAt = githubInfo.publishedAt;
            break;

          case 'npm':
            const npmInfo = await this.checkNpmUpdates();
            latestVersion = npmInfo.version;
            break;

          case 'url':
            const urlInfo = await this.checkUrlUpdates();
            latestVersion = urlInfo.version;
            downloadUrl = urlInfo.downloadUrl;
            break;

          case 'local':
            // Check local directory for updates
            const localInfo = await this.checkLocalUpdates();
            latestVersion = localInfo.version;
            break;
        }
      }

      const updateAvailable = compareVersions(latestVersion, this.currentVersion) > 0;
      const breaking = isBreakingChange(this.currentVersion, latestVersion);

      return {
        available: updateAvailable,
        currentVersion: this.currentVersion,
        latestVersion,
        releaseNotes,
        breaking,
        publishedAt,
        downloadUrl
      };
    } catch (error) {
      console.error('[Theme Updater] Failed to check for updates:', error);
      return {
        available: false,
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        breaking: false
      };
    }
  }

  /**
   * Perform theme update
   */
  async update(targetVersion?: string, options: UpdateOptions = {}): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: false,
      version: this.currentVersion,
      warnings: [],
      errors: [],
      rollbackAvailable: false
    };

    try {
      // Check for updates if no target version specified
      if (!targetVersion) {
        const updateInfo = await this.checkForUpdates();
        if (!updateInfo.available) {
          result.warnings.push('No updates available');
          return result;
        }
        targetVersion = updateInfo.latestVersion;
      }

      console.log(`[Theme Updater] Updating ${this.themeId} from ${this.currentVersion} to ${targetVersion}`);

      // Create backup if requested
      let backupId: string | undefined;
      if (options.createBackup !== false) {
        const backup = await this.createBackup();
        backupId = backup.id;
        result.backupId = backupId;
        result.rollbackAvailable = true;
        console.log(`[Theme Updater] Created backup: ${backupId}`);
      }

      // Download update
      const updatePath = await this.downloadUpdate(targetVersion);
      
      // Validate update
      if (options.validateSecurity !== false) {
        const securityResult = await this.validateSecurity(updatePath);
        if (!securityResult.safe) {
          result.errors.push('Security validation failed');
          result.warnings.push(...securityResult.threats.map(t => t.message));
          
          if (!options.dryRun) {
            await this.cleanup(updatePath);
            return result;
          }
        }
      }

      // Check dependencies
      if (options.checkDependencies !== false) {
        const depResult = await this.checkUpdateDependencies(updatePath);
        if (!depResult.satisfied) {
          result.warnings.push(...depResult.warnings);
          if (depResult.missing.length > 0) {
            result.errors.push(`Missing dependencies: ${depResult.missing.join(', ')}`);
            
            if (!options.dryRun) {
              await this.cleanup(updatePath);
              return result;
            }
          }
        }
      }

      // Perform dry run if requested
      if (options.dryRun) {
        result.success = true;
        result.version = targetVersion;
        result.warnings.push('Dry run completed - no changes were made');
        await this.cleanup(updatePath);
        return result;
      }

      // Apply update
      const applied = await this.applyUpdate(updatePath, targetVersion, options);
      
      if (!applied.success) {
        result.errors.push(...applied.errors);
        
        // Rollback if backup exists
        if (backupId) {
          await this.rollback(backupId);
          result.warnings.push('Update failed - rolled back to previous version');
        }
        
        return result;
      }

      // Run migrations if needed
      if (options.autoMigrate !== false && isBreakingChange(this.currentVersion, targetVersion)) {
        const migrationResult = await this.runMigrations(this.currentVersion, targetVersion);
        if (!migrationResult.success) {
          result.warnings.push(...migrationResult.warnings);
        }
      }

      // Cleanup
      await this.cleanup(updatePath);

      // Update version
      await this.updateVersionInfo(targetVersion);

      result.success = true;
      result.version = targetVersion;
      console.log(`[Theme Updater] Successfully updated to ${targetVersion}`);

      return result;
    } catch (error) {
      console.error('[Theme Updater] Update failed:', error);
      result.errors.push(`Update failed: ${error}`);
      
      // Attempt rollback if backup exists
      if (result.backupId) {
        try {
          await this.rollback(result.backupId);
          result.warnings.push('Update failed - rolled back to previous version');
        } catch (rollbackError) {
          result.errors.push(`Rollback failed: ${rollbackError}`);
        }
      }
      
      return result;
    }
  }

  /**
   * Rollback to a previous version using backup
   */
  async rollback(backupId: string): Promise<boolean> {
    try {
      console.log(`[Theme Updater] Rolling back using backup ${backupId}`);
      
      const backupManager = new ThemeBackupManager(this.themeId);
      const result = await backupManager.restoreBackup(backupId, {
        overwrite: true,
        validateChecksum: true
      });

      return result.success;
    } catch (error) {
      console.error('[Theme Updater] Rollback failed:', error);
      return false;
    }
  }

  /**
   * Check GitHub for updates
   */
  private async checkGithubUpdates(): Promise<any> {
    if (!this.updateSource || this.updateSource.type !== 'github') {
      throw new Error('GitHub source not configured');
    }

    // Parse GitHub repo from location (e.g., "owner/repo")
    const [owner, repo] = this.updateSource.location.split('/');
    
    try {
      // Check latest release
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch GitHub releases');
      }

      const release = await response.json();
      
      return {
        version: release.tag_name.replace(/^v/, ''), // Remove 'v' prefix if present
        releaseNotes: release.body || '',
        downloadUrl: release.zipball_url || release.tarball_url,
        publishedAt: new Date(release.published_at)
      };
    } catch (error) {
      console.error('[Theme Updater] GitHub check failed:', error);
      throw error;
    }
  }

  /**
   * Check npm registry for updates
   */
  private async checkNpmUpdates(): Promise<any> {
    if (!this.updateSource || this.updateSource.type !== 'npm') {
      throw new Error('npm source not configured');
    }

    try {
      const response = await fetch(`https://registry.npmjs.org/${this.updateSource.location}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch npm package info');
      }

      const data = await response.json();
      const latestVersion = data['dist-tags']?.latest || this.currentVersion;

      return {
        version: latestVersion
      };
    } catch (error) {
      console.error('[Theme Updater] npm check failed:', error);
      throw error;
    }
  }

  /**
   * Check URL for updates
   */
  private async checkUrlUpdates(): Promise<any> {
    if (!this.updateSource || this.updateSource.type !== 'url') {
      throw new Error('URL source not configured');
    }

    try {
      const response = await fetch(this.updateSource.location);
      
      if (!response.ok) {
        throw new Error('Failed to fetch update info from URL');
      }

      const data = await response.json();
      
      return {
        version: data.version || this.currentVersion,
        downloadUrl: data.downloadUrl || this.updateSource.location
      };
    } catch (error) {
      console.error('[Theme Updater] URL check failed:', error);
      throw error;
    }
  }

  /**
   * Check local directory for updates
   */
  private async checkLocalUpdates(): Promise<any> {
    if (!this.updateSource || this.updateSource.type !== 'local') {
      throw new Error('Local source not configured');
    }

    try {
      const manifestPath = path.join(this.updateSource.location, 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
      
      return {
        version: manifest.version || this.currentVersion
      };
    } catch (error) {
      console.error('[Theme Updater] Local check failed:', error);
      throw error;
    }
  }

  /**
   * Download theme update
   */
  private async downloadUpdate(version: string): Promise<string> {
    // Create temp directory
    await fs.mkdir(this.tempDir, { recursive: true });
    
    const updatePath = path.join(this.tempDir, version);
    
    // In production, this would download and extract the update
    // For now, we'll simulate by copying current theme
    await this.copyDirectory(this.themePath, updatePath);
    
    return updatePath;
  }

  /**
   * Validate security of update
   */
  private async validateSecurity(updatePath: string): Promise<any> {
    const scanner = new ThemeSecurityScanner(this.themeId);
    return scanner.scan();
  }

  /**
   * Check update dependencies
   */
  private async checkUpdateDependencies(updatePath: string): Promise<any> {
    try {
      const manifestPath = path.join(updatePath, 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
      
      const depManager = new ThemeDependencyManager(
        this.themeId,
        manifest.dependencies || {},
        manifest.peerDependencies || {}
      );
      
      return depManager.checkDependencies();
    } catch (error) {
      return {
        satisfied: true,
        warnings: [`Could not check dependencies: ${error}`]
      };
    }
  }

  /**
   * Apply update to theme
   */
  private async applyUpdate(
    updatePath: string, 
    version: string,
    options: UpdateOptions
  ): Promise<{ success: boolean; errors: string[] }> {
    try {
      // Validate update structure
      const validator = new ThemeValidator(this.themeId);
      const validation = await validator.validate();
      
      if (!validation.valid && validation.errors.length > 0) {
        return {
          success: false,
          errors: validation.errors.map(e => e.message)
        };
      }

      // Backup current theme
      const backupPath = `${this.themePath}.backup`;
      await this.copyDirectory(this.themePath, backupPath);

      try {
        // Apply update files
        await this.copyDirectory(updatePath, this.themePath);
        
        // Verify update
        const newManifest = JSON.parse(
          await fs.readFile(path.join(this.themePath, 'manifest.json'), 'utf-8')
        );
        
        if (newManifest.version !== version) {
          throw new Error('Version mismatch after update');
        }

        // Remove backup
        await this.removeDirectory(backupPath);
        
        return { success: true, errors: [] };
      } catch (error) {
        // Restore from backup
        await this.copyDirectory(backupPath, this.themePath);
        await this.removeDirectory(backupPath);
        throw error;
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to apply update: ${error}`]
      };
    }
  }

  /**
   * Run migrations between versions
   */
  private async runMigrations(fromVersion: string, toVersion: string): Promise<{
    success: boolean;
    warnings: string[];
  }> {
    try {
      const versionManager = new ThemeVersionManager(this.themeId, toVersion);
      
      // Load current settings
      const settingsPath = path.join(this.themePath, 'theme-settings.json');
      const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
      
      // Run migrations
      const migrated = versionManager.migrateSettings(settings, fromVersion, toVersion);
      
      // Save migrated settings
      await fs.writeFile(settingsPath, JSON.stringify(migrated, null, 2));
      
      return {
        success: true,
        warnings: []
      };
    } catch (error) {
      return {
        success: false,
        warnings: [`Migration failed: ${error}`]
      };
    }
  }

  /**
   * Create backup before update
   */
  private async createBackup(): Promise<{ id: string }> {
    const backupManager = new ThemeBackupManager(this.themeId);
    
    // Load current settings
    const settingsPath = path.join(this.themePath, 'theme-settings.json');
    const settings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));
    
    const backup = await backupManager.createBackup(
      settings,
      {},
      {
        name: `Pre-update backup (${this.currentVersion})`,
        description: `Automatic backup before updating to new version`
      }
    );
    
    return { id: backup.id };
  }

  /**
   * Update version info in manifest
   */
  private async updateVersionInfo(version: string): Promise<void> {
    const manifestPath = path.join(this.themePath, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    
    manifest.version = version;
    manifest.updatedAt = new Date().toISOString();
    
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(updatePath: string): Promise<void> {
    try {
      await this.removeDirectory(updatePath);
      await this.removeDirectory(this.tempDir);
    } catch (error) {
      console.error('[Theme Updater] Cleanup failed:', error);
    }
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Remove directory recursively
   */
  private async removeDirectory(dir: string): Promise<void> {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist
    }
  }
}

/**
 * Check for theme updates
 */
export async function checkThemeUpdates(
  themeId: string,
  currentVersion: string,
  source?: UpdateSource
): Promise<UpdateInfo> {
  const updater = new ThemeUpdater(themeId, currentVersion, source);
  return updater.checkForUpdates();
}

/**
 * Update theme to latest version
 */
export async function updateTheme(
  themeId: string,
  currentVersion: string,
  targetVersion?: string,
  options?: UpdateOptions
): Promise<UpdateResult> {
  const updater = new ThemeUpdater(themeId, currentVersion);
  return updater.update(targetVersion, options);
}