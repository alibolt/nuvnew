/**
 * Theme Dependency Management System
 * Handles theme dependencies and compatibility checks
 */

import { z } from 'zod';
import semver from 'semver';

// Dependency schema
export const DependencySchema = z.record(z.string());

export interface DependencyCheck {
  satisfied: boolean;
  missing: string[];
  incompatible: string[];
  warnings: string[];
}

export interface InstalledPackage {
  name: string;
  version: string;
}

// Platform-provided dependencies
const PLATFORM_PROVIDED: Record<string, string> = {
  'react': '18.3.1',
  'react-dom': '18.3.1',
  'next': '15.4.5',
  'tailwindcss': '3.4.17',
  '@radix-ui/react-dialog': '1.1.4',
  '@radix-ui/react-dropdown-menu': '2.1.4',
  '@radix-ui/react-label': '2.1.1',
  '@radix-ui/react-popover': '1.1.4',
  '@radix-ui/react-select': '2.1.4',
  '@radix-ui/react-separator': '1.1.1',
  '@radix-ui/react-slot': '1.1.1',
  '@radix-ui/react-switch': '1.1.2',
  '@radix-ui/react-tabs': '1.1.2',
  '@radix-ui/react-tooltip': '1.1.6',
  'class-variance-authority': '0.7.1',
  'clsx': '2.1.1',
  'date-fns': '4.1.0',
  'framer-motion': '11.15.0',
  'lucide-react': '0.469.0',
  'tailwind-merge': '2.6.0',
  'zod': '3.24.1'
};

// Allowed external dependencies (that themes can require)
const ALLOWED_EXTERNAL: string[] = [
  'classnames',
  'dayjs',
  'lodash',
  'axios',
  '@emotion/react',
  '@emotion/styled',
  'styled-components',
  'react-spring',
  'react-intersection-observer',
  'react-hook-form',
  'swr',
  'react-query',
  '@tanstack/react-query'
];

// Blocked dependencies (security risk or incompatible)
const BLOCKED_DEPENDENCIES: string[] = [
  'fs',
  'path',
  'child_process',
  'crypto',
  'os',
  'net',
  'eval',
  'vm',
  'cluster',
  'worker_threads'
];

export class ThemeDependencyManager {
  private themeId: string;
  private dependencies: Record<string, string>;
  private peerDependencies: Record<string, string>;

  constructor(
    themeId: string,
    dependencies: Record<string, string> = {},
    peerDependencies: Record<string, string> = {}
  ) {
    this.themeId = themeId;
    this.dependencies = dependencies;
    this.peerDependencies = peerDependencies;
  }

  /**
   * Check if all dependencies are satisfied
   */
  checkDependencies(): DependencyCheck {
    const result: DependencyCheck = {
      satisfied: true,
      missing: [],
      incompatible: [],
      warnings: []
    };

    // Check regular dependencies
    for (const [pkg, requiredVersion] of Object.entries(this.dependencies)) {
      const check = this.checkDependency(pkg, requiredVersion);
      if (!check.satisfied) {
        result.satisfied = false;
        if (check.reason === 'missing') {
          result.missing.push(`${pkg}@${requiredVersion}`);
        } else if (check.reason === 'incompatible') {
          result.incompatible.push(`${pkg}@${requiredVersion} (have: ${check.installedVersion})`);
        } else if (check.reason === 'blocked') {
          result.incompatible.push(`${pkg} (blocked for security reasons)`);
        }
      } else if (check.warning) {
        result.warnings.push(check.warning);
      }
    }

    // Check peer dependencies
    for (const [pkg, requiredVersion] of Object.entries(this.peerDependencies)) {
      const check = this.checkDependency(pkg, requiredVersion, true);
      if (!check.satisfied) {
        result.satisfied = false;
        if (check.reason === 'incompatible') {
          result.warnings.push(
            `Peer dependency ${pkg}@${requiredVersion} may be incompatible (platform provides ${check.installedVersion})`
          );
        }
      }
    }

    return result;
  }

  /**
   * Check a single dependency
   */
  private checkDependency(
    pkg: string,
    requiredVersion: string,
    isPeer: boolean = false
  ): {
    satisfied: boolean;
    reason?: 'missing' | 'incompatible' | 'blocked';
    installedVersion?: string;
    warning?: string;
  } {
    // Check if blocked
    if (BLOCKED_DEPENDENCIES.includes(pkg)) {
      return {
        satisfied: false,
        reason: 'blocked'
      };
    }

    // Check if provided by platform
    if (PLATFORM_PROVIDED[pkg]) {
      const installedVersion = PLATFORM_PROVIDED[pkg];
      
      try {
        if (semver.satisfies(installedVersion, requiredVersion)) {
          return { satisfied: true, installedVersion };
        } else {
          return {
            satisfied: !isPeer, // Peer dependencies are warnings only
            reason: 'incompatible',
            installedVersion
          };
        }
      } catch (error) {
        // Invalid semver range
        return {
          satisfied: false,
          reason: 'incompatible',
          installedVersion,
          warning: `Invalid version range: ${requiredVersion}`
        };
      }
    }

    // Check if it's an allowed external dependency
    const isAllowed = ALLOWED_EXTERNAL.some(allowed => {
      if (allowed.includes('*')) {
        return pkg.startsWith(allowed.replace('*', ''));
      }
      return pkg === allowed;
    });

    if (!isAllowed) {
      return {
        satisfied: false,
        reason: 'missing',
        warning: `Package ${pkg} is not in the allowed list`
      };
    }

    // For allowed external deps, we assume they need to be installed
    return {
      satisfied: false,
      reason: 'missing'
    };
  }

  /**
   * Get list of platform-provided packages
   */
  static getPlatformProvided(): InstalledPackage[] {
    return Object.entries(PLATFORM_PROVIDED).map(([name, version]) => ({
      name,
      version
    }));
  }

  /**
   * Check if a package is safe to use
   */
  static isPackageSafe(pkg: string): boolean {
    return !BLOCKED_DEPENDENCIES.includes(pkg);
  }

  /**
   * Get recommended dependencies for common use cases
   */
  static getRecommendedDependencies(useCase: 'minimal' | 'full' | 'animated'): Record<string, string> {
    const base = {
      'react': '^18.0.0',
      'react-dom': '^18.0.0',
      'next': '^15.0.0',
      'tailwindcss': '^3.0.0'
    };

    switch (useCase) {
      case 'minimal':
        return base;
      
      case 'animated':
        return {
          ...base,
          'framer-motion': '^11.0.0',
          'react-spring': '^9.0.0'
        };
      
      case 'full':
        return {
          ...base,
          'framer-motion': '^11.0.0',
          'date-fns': '^4.0.0',
          'clsx': '^2.0.0',
          'lucide-react': '^0.400.0'
        };
      
      default:
        return base;
    }
  }

  /**
   * Validate dependency version string
   */
  static isValidVersionRange(version: string): boolean {
    try {
      // Check if it's a valid semver range
      return semver.validRange(version) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Resolve dependency conflicts
   */
  resolveConflicts(otherThemeDeps: Record<string, string>): {
    conflicts: Array<{ package: string; versions: string[] }>;
    resolutions: Record<string, string>;
  } {
    const conflicts: Array<{ package: string; versions: string[] }> = [];
    const resolutions: Record<string, string> = {};

    for (const [pkg, version] of Object.entries(this.dependencies)) {
      if (otherThemeDeps[pkg] && otherThemeDeps[pkg] !== version) {
        conflicts.push({
          package: pkg,
          versions: [version, otherThemeDeps[pkg]]
        });

        // Try to find a version that satisfies both
        try {
          const range = `${version} || ${otherThemeDeps[pkg]}`;
          const platformVersion = PLATFORM_PROVIDED[pkg];
          
          if (platformVersion && semver.satisfies(platformVersion, range)) {
            resolutions[pkg] = platformVersion;
          }
        } catch {
          // Can't resolve automatically
        }
      }
    }

    return { conflicts, resolutions };
  }
}

// Utility function to check dependencies before installing theme
export async function checkThemeDependencies(
  manifest: any
): Promise<DependencyCheck> {
  const manager = new ThemeDependencyManager(
    manifest.id,
    manifest.dependencies || {},
    manifest.peerDependencies || {}
  );
  
  return manager.checkDependencies();
}

// Install npm packages into a theme
// Note: This is a placeholder - actual implementation would need
// to handle npm/yarn/pnpm installation in a sandboxed environment
export async function installThemeDependencies(
  themeId: string,
  dependencies: Record<string, string>
): Promise<{ success: boolean; installed: string[]; failed: string[] }> {
  console.log(`[Dependency Manager] Would install dependencies for ${themeId}:`, dependencies);
  
  // In production, this would:
  // 1. Create a sandboxed environment
  // 2. Run npm/yarn/pnpm install
  // 3. Verify installed packages
  // 4. Update lock file
  
  return {
    success: false,
    installed: [],
    failed: Object.keys(dependencies)
  };
}