/**
 * Theme Validation System
 * Validates theme structure, security, and compatibility
 */

import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

// Theme manifest schema
export const ThemeManifestSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/, 'ID must be lowercase alphanumeric with dashes'),
  name: z.string().min(1).max(50),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (x.y.z)'),
  author: z.string().optional(),
  description: z.string().max(200).optional(),
  preview: z.string().optional(),
  minPlatformVersion: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  maxPlatformVersion: z.string().regex(/^\d+\.\d+\.\d+$/).optional(),
  entryPoints: z.object({
    main: z.string().optional(),
    sections: z.string().optional(),
    blocks: z.string().optional(),
    styles: z.string().optional(),
    config: z.string().optional(),
  }).optional(),
  dependencies: z.record(z.string()).optional(),
  peerDependencies: z.record(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  settings: z.object({
    colors: z.array(z.string()).optional(),
    typography: z.array(z.string()).optional(),
    layout: z.array(z.string()).optional(),
  }).optional(),
});

// Validation result type
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata?: {
    filesChecked: number;
    sectionsFound: number;
    blocksFound: number;
    totalSize: number;
  };
}

export interface ValidationError {
  type: 'structure' | 'security' | 'compatibility' | 'dependency' | 'performance';
  message: string;
  file?: string;
  line?: number;
}

export interface ValidationWarning {
  type: string;
  message: string;
  file?: string;
}

export class ThemeValidator {
  private themeId: string;
  private themePath: string;
  private errors: ValidationError[] = [];
  private warnings: ValidationWarning[] = [];

  constructor(themeId: string) {
    this.themeId = themeId;
    this.themePath = path.join(process.cwd(), 'themes', themeId);
  }

  /**
   * Main validation method
   */
  async validate(): Promise<ValidationResult> {
    this.errors = [];
    this.warnings = [];

    try {
      // 1. Check if theme directory exists
      await this.checkThemeExists();

      // 2. Validate manifest
      const manifest = await this.validateManifest();

      // 3. Validate file structure
      await this.validateFileStructure();

      // 4. Security scan
      await this.securityScan();

      // 5. Check dependencies
      if (manifest?.dependencies || manifest?.peerDependencies) {
        await this.validateDependencies(manifest);
      }

      // 6. Performance checks
      await this.performanceCheck();

      // 7. Compatibility check
      if (manifest?.minPlatformVersion || manifest?.maxPlatformVersion) {
        await this.checkCompatibility(manifest);
      }

      // Get metadata
      const metadata = await this.getThemeMetadata();

      return {
        valid: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings,
        metadata
      };
    } catch (error) {
      this.errors.push({
        type: 'structure',
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      return {
        valid: false,
        errors: this.errors,
        warnings: this.warnings
      };
    }
  }

  /**
   * Check if theme directory exists
   */
  private async checkThemeExists() {
    try {
      await fs.access(this.themePath);
    } catch {
      throw new Error(`Theme directory not found: ${this.themePath}`);
    }
  }

  /**
   * Validate theme manifest
   */
  private async validateManifest() {
    const manifestPath = path.join(this.themePath, 'manifest.json');
    
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifest = JSON.parse(manifestContent);
      
      // Validate against schema
      const result = ThemeManifestSchema.safeParse(manifest);
      
      if (!result.success) {
        result.error.errors.forEach(err => {
          this.errors.push({
            type: 'structure',
            message: `Manifest validation: ${err.path.join('.')} - ${err.message}`,
            file: 'manifest.json'
          });
        });
        return null;
      }

      return result.data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        this.errors.push({
          type: 'structure',
          message: 'Invalid JSON in manifest.json',
          file: 'manifest.json'
        });
      } else {
        this.errors.push({
          type: 'structure',
          message: 'manifest.json not found or unreadable',
          file: 'manifest.json'
        });
      }
      return null;
    }
  }

  /**
   * Validate file structure
   */
  private async validateFileStructure() {
    const requiredDirs = ['sections', 'blocks'];
    const requiredFiles = ['index.ts'];

    for (const dir of requiredDirs) {
      const dirPath = path.join(this.themePath, dir);
      try {
        const stat = await fs.stat(dirPath);
        if (!stat.isDirectory()) {
          this.errors.push({
            type: 'structure',
            message: `Required directory not found: ${dir}`
          });
        }
      } catch {
        this.warnings.push({
          type: 'structure',
          message: `Optional directory not found: ${dir}`
        });
      }
    }

    for (const file of requiredFiles) {
      const filePath = path.join(this.themePath, file);
      try {
        await fs.access(filePath);
      } catch {
        this.errors.push({
          type: 'structure',
          message: `Required file not found: ${file}`
        });
      }
    }
  }

  /**
   * Security scan for malicious code patterns
   */
  private async securityScan() {
    const dangerousPatterns = [
      { pattern: /eval\s*\(/, message: 'Use of eval() detected' },
      { pattern: /Function\s*\(/, message: 'Use of Function constructor detected' },
      { pattern: /document\.write/, message: 'Use of document.write detected' },
      { pattern: /innerHTML\s*=/, message: 'Direct innerHTML assignment detected' },
      { pattern: /<script[^>]*>/i, message: 'Script tag detected in template' },
      { pattern: /require\s*\(['"]child_process['"]/, message: 'Child process execution detected' },
      { pattern: /require\s*\(['"]fs['"]/, message: 'Filesystem access in client code' },
      { pattern: /process\.env/, message: 'Environment variable access detected' },
      { pattern: /window\.location\.href\s*=/, message: 'Direct location change detected' },
      { pattern: /localStorage|sessionStorage/, message: 'Direct storage access detected' }
    ];

    const filesToScan = await this.getThemeFiles();
    
    for (const file of filesToScan) {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        
        dangerousPatterns.forEach(({ pattern, message }) => {
          lines.forEach((line, index) => {
            if (pattern.test(line)) {
              this.warnings.push({
                type: 'security',
                message,
                file: path.relative(this.themePath, file),
                line: index + 1
              });
            }
          });
        });
      }
    }
  }

  /**
   * Validate dependencies
   */
  private async validateDependencies(manifest: any) {
    const allowedDependencies = [
      'react', 'react-dom', 'next', 'tailwindcss', 
      'classnames', 'clsx', 'date-fns', 'dayjs',
      'framer-motion', 'react-spring', '@radix-ui/*'
    ];

    if (manifest.dependencies) {
      Object.keys(manifest.dependencies).forEach(dep => {
        const isAllowed = allowedDependencies.some(allowed => {
          if (allowed.endsWith('*')) {
            return dep.startsWith(allowed.slice(0, -1));
          }
          return dep === allowed;
        });

        if (!isAllowed) {
          this.warnings.push({
            type: 'dependency',
            message: `Potentially unsafe dependency: ${dep}`
          });
        }
      });
    }
  }

  /**
   * Performance checks
   */
  private async performanceCheck() {
    const MAX_FILE_SIZE = 500 * 1024; // 500KB
    const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
    
    let totalSize = 0;
    const files = await this.getThemeFiles();
    
    for (const file of files) {
      const stat = await fs.stat(file);
      totalSize += stat.size;
      
      if (stat.size > MAX_FILE_SIZE) {
        this.warnings.push({
          type: 'performance',
          message: `Large file detected: ${path.relative(this.themePath, file)} (${Math.round(stat.size / 1024)}KB)`,
          file: path.relative(this.themePath, file)
        });
      }
    }
    
    if (totalSize > MAX_TOTAL_SIZE) {
      this.errors.push({
        type: 'performance',
        message: `Theme size exceeds limit: ${Math.round(totalSize / 1024 / 1024)}MB (max: 5MB)`
      });
    }
  }

  /**
   * Check platform compatibility
   */
  private async checkCompatibility(manifest: any) {
    const CURRENT_PLATFORM_VERSION = '1.0.0';
    
    if (manifest.minPlatformVersion) {
      if (this.compareVersions(CURRENT_PLATFORM_VERSION, manifest.minPlatformVersion) < 0) {
        this.errors.push({
          type: 'compatibility',
          message: `Theme requires platform version ${manifest.minPlatformVersion} or higher`
        });
      }
    }
    
    if (manifest.maxPlatformVersion) {
      if (this.compareVersions(CURRENT_PLATFORM_VERSION, manifest.maxPlatformVersion) > 0) {
        this.errors.push({
          type: 'compatibility',
          message: `Theme is not compatible with platform version above ${manifest.maxPlatformVersion}`
        });
      }
    }
  }

  /**
   * Get theme metadata
   */
  private async getThemeMetadata() {
    const files = await this.getThemeFiles();
    const sections = files.filter(f => f.includes('/sections/')).length;
    const blocks = files.filter(f => f.includes('/blocks/')).length;
    
    let totalSize = 0;
    for (const file of files) {
      const stat = await fs.stat(file);
      totalSize += stat.size;
    }
    
    return {
      filesChecked: files.length,
      sectionsFound: sections,
      blocksFound: blocks,
      totalSize
    };
  }

  /**
   * Get all theme files recursively
   */
  private async getThemeFiles(dir = this.themePath): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...await this.getThemeFiles(fullPath));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Compare version strings
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    
    return 0;
  }
}

// Export convenience function
export async function validateTheme(themeId: string): Promise<ValidationResult> {
  const validator = new ThemeValidator(themeId);
  return validator.validate();
}