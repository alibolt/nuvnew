import { promises as fs } from 'fs';
import path from 'path';
import { ThemeManifest, ThemeRegistryEntry, ThemeModule } from './types';

/**
 * Theme Registry - Manages theme discovery and registration
 */
export class ThemeRegistry {
  private static instance: ThemeRegistry;
  private themes: Map<string, ThemeRegistryEntry> = new Map();
  private initialized = false;

  private constructor() {}

  static getInstance(): ThemeRegistry {
    if (!ThemeRegistry.instance) {
      ThemeRegistry.instance = new ThemeRegistry();
    }
    return ThemeRegistry.instance;
  }

  /**
   * Initialize registry and discover themes
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    await this.discoverThemes();
    this.initialized = true;
  }

  /**
   * Discover themes in themes directory
   */
  async discoverThemes(): Promise<void> {
    const themesDir = path.join(process.cwd(), 'themes');
    
    try {
      const entries = await fs.readdir(themesDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        
        const themePath = path.join(themesDir, entry.name);
        const manifestPath = path.join(themePath, 'manifest.json');
        
        try {
          // Check if manifest exists
          await fs.access(manifestPath);
          
          // Read and parse manifest
          const manifestContent = await fs.readFile(manifestPath, 'utf-8');
          const manifest: ThemeManifest = JSON.parse(manifestContent);
          
          // Register theme
          this.registerTheme(manifest, themePath);
          
          console.log(`[ThemeRegistry] Discovered theme: ${manifest.id} v${manifest.version}`);
        } catch (error) {
          // If no manifest, try to create one from existing structure
          const fallbackManifest = await this.createFallbackManifest(entry.name, themePath);
          if (fallbackManifest) {
            this.registerTheme(fallbackManifest, themePath);
            console.log(`[ThemeRegistry] Created fallback manifest for: ${entry.name}`);
          }
        }
      }
    } catch (error) {
      console.error('[ThemeRegistry] Failed to discover themes:', error);
    }
  }

  /**
   * Create fallback manifest for themes without manifest.json
   */
  private async createFallbackManifest(themeId: string, themePath: string): Promise<ThemeManifest | null> {
    try {
      // Check if theme has basic structure
      const indexPath = path.join(themePath, 'index.ts');
      await fs.access(indexPath);
      
      return {
        id: themeId,
        name: themeId.charAt(0).toUpperCase() + themeId.slice(1) + ' Theme',
        version: '1.0.0',
        description: `${themeId} theme for the platform`,
        entryPoints: {
          main: 'index.ts',
          sections: 'sections',
          blocks: 'blocks',
          styles: 'styles/theme-styles.js',
          config: 'theme.json'
        }
      };
    } catch {
      return null;
    }
  }

  /**
   * Register a theme
   */
  registerTheme(manifest: ThemeManifest, themePath: string): void {
    this.themes.set(manifest.id, {
      manifest,
      path: themePath,
      loaded: false
    });
  }

  /**
   * Unregister a theme
   */
  unregisterTheme(themeId: string): boolean {
    return this.themes.delete(themeId);
  }

  /**
   * Get theme by ID
   */
  getTheme(themeId: string): ThemeRegistryEntry | undefined {
    return this.themes.get(themeId);
  }

  /**
   * List all registered themes
   */
  listThemes(): ThemeManifest[] {
    return Array.from(this.themes.values()).map(entry => entry.manifest);
  }

  /**
   * Check if theme exists
   */
  hasTheme(themeId: string): boolean {
    return this.themes.has(themeId);
  }

  /**
   * Get theme path
   */
  getThemePath(themeId: string): string | undefined {
    return this.themes.get(themeId)?.path;
  }

  /**
   * Clear registry
   */
  clear(): void {
    this.themes.clear();
    this.initialized = false;
  }
}

// Export singleton instance
export const themeRegistry = ThemeRegistry.getInstance();