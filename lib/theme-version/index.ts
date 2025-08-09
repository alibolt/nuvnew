/**
 * Theme Version Management System
 * Handles version checking, compatibility, and migrations
 */

export const PLATFORM_VERSION = '1.0.0';

export interface VersionInfo {
  current: string;
  min?: string;
  max?: string;
}

export interface MigrationScript {
  from: string;
  to: string;
  migrate: (settings: any) => any;
  description?: string;
}

export class ThemeVersionManager {
  private themeId: string;
  private currentVersion: string;
  private migrations: MigrationScript[] = [];

  constructor(themeId: string, currentVersion: string) {
    this.themeId = themeId;
    this.currentVersion = currentVersion;
  }

  /**
   * Register a migration script
   */
  registerMigration(migration: MigrationScript) {
    this.migrations.push(migration);
    // Sort migrations by version
    this.migrations.sort((a, b) => this.compareVersions(a.from, b.from));
  }

  /**
   * Check if theme is compatible with platform
   */
  checkCompatibility(minVersion?: string, maxVersion?: string): {
    compatible: boolean;
    reason?: string;
  } {
    if (minVersion && this.compareVersions(PLATFORM_VERSION, minVersion) < 0) {
      return {
        compatible: false,
        reason: `Platform version ${PLATFORM_VERSION} is below minimum required version ${minVersion}`
      };
    }

    if (maxVersion && this.compareVersions(PLATFORM_VERSION, maxVersion) > 0) {
      return {
        compatible: false,
        reason: `Platform version ${PLATFORM_VERSION} exceeds maximum supported version ${maxVersion}`
      };
    }

    return { compatible: true };
  }

  /**
   * Check if update is available
   */
  async checkForUpdate(registryUrl?: string): Promise<{
    updateAvailable: boolean;
    latestVersion?: string;
    changelog?: string;
  }> {
    if (!registryUrl) {
      // Default to checking local manifest
      try {
        const manifest = await this.getLatestManifest();
        if (manifest && this.compareVersions(manifest.version, this.currentVersion) > 0) {
          return {
            updateAvailable: true,
            latestVersion: manifest.version,
            changelog: manifest.changelog
          };
        }
      } catch (error) {
        console.error('[Version Manager] Failed to check for updates:', error);
      }
    }

    return { updateAvailable: false };
  }

  /**
   * Migrate settings from one version to another
   */
  migrateSettings(settings: any, fromVersion: string, toVersion: string): any {
    let currentSettings = { ...settings };
    const migrationsToRun = this.getMigrationPath(fromVersion, toVersion);

    for (const migration of migrationsToRun) {
      console.log(`[Version Manager] Running migration from ${migration.from} to ${migration.to}`);
      try {
        currentSettings = migration.migrate(currentSettings);
      } catch (error) {
        console.error(`[Version Manager] Migration failed:`, error);
        throw new Error(`Failed to migrate from ${migration.from} to ${migration.to}`);
      }
    }

    return currentSettings;
  }

  /**
   * Get migration path between versions
   */
  private getMigrationPath(fromVersion: string, toVersion: string): MigrationScript[] {
    const path: MigrationScript[] = [];
    
    for (const migration of this.migrations) {
      if (this.compareVersions(migration.from, fromVersion) >= 0 &&
          this.compareVersions(migration.to, toVersion) <= 0) {
        path.push(migration);
      }
    }

    return path;
  }

  /**
   * Check if version is breaking change
   */
  isBreakingChange(fromVersion: string, toVersion: string): boolean {
    const [fromMajor] = fromVersion.split('.').map(Number);
    const [toMajor] = toVersion.split('.').map(Number);
    return toMajor > fromMajor;
  }

  /**
   * Compare two version strings
   */
  compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 > p2) return 1;
      if (p1 < p2) return -1;
    }
    
    return 0;
  }

  /**
   * Get version info
   */
  getVersionInfo(): VersionInfo {
    return {
      current: this.currentVersion,
      min: undefined,
      max: undefined
    };
  }

  /**
   * Parse version from string
   */
  static parseVersion(version: string): {
    major: number;
    minor: number;
    patch: number;
  } | null {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) return null;

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  }

  /**
   * Format version for display
   */
  static formatVersion(version: string): string {
    const parsed = this.parseVersion(version);
    if (!parsed) return version;
    
    return `v${parsed.major}.${parsed.minor}.${parsed.patch}`;
  }

  /**
   * Get latest manifest (mock for now)
   */
  private async getLatestManifest(): Promise<any> {
    // In production, this would fetch from a registry
    // For now, return null to indicate no update
    return null;
  }
}

/**
 * Version compatibility checker
 */
export function checkThemeCompatibility(
  themeVersion: string,
  minPlatform?: string,
  maxPlatform?: string
): { compatible: boolean; reason?: string } {
  // Check minimum platform version
  if (minPlatform && compareVersions(PLATFORM_VERSION, minPlatform) < 0) {
    return {
      compatible: false,
      reason: `Platform ${PLATFORM_VERSION} is below theme's minimum requirement ${minPlatform}`
    };
  }

  // Check maximum platform version
  if (maxPlatform && compareVersions(PLATFORM_VERSION, maxPlatform) > 0) {
    return {
      compatible: false,
      reason: `Platform ${PLATFORM_VERSION} exceeds theme's maximum support ${maxPlatform}`
    };
  }

  return { compatible: true };
}

/**
 * Compare version strings
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < 3; i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  
  return 0;
}

/**
 * Check if update is breaking change
 */
export function isBreakingChange(fromVersion: string, toVersion: string): boolean {
  const from = ThemeVersionManager.parseVersion(fromVersion);
  const to = ThemeVersionManager.parseVersion(toVersion);
  
  if (!from || !to) return false;
  
  return to.major > from.major;
}