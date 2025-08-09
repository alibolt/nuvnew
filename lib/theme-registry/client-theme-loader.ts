/**
 * Client-safe theme loader - works in both server and client environments
 */

import { ThemeModule } from './types';

export class ClientThemeLoader {
  private static instance: ClientThemeLoader;
  private loadedModules: Map<string, ThemeModule> = new Map();

  private constructor() {}

  static getInstance(): ClientThemeLoader {
    if (!ClientThemeLoader.instance) {
      ClientThemeLoader.instance = new ClientThemeLoader();
    }
    return ClientThemeLoader.instance;
  }

  /**
   * Load theme module (client-safe)
   */
  async loadTheme(themeId: string): Promise<ThemeModule | null> {
    // Check cache
    if (this.loadedModules.has(themeId)) {
      return this.loadedModules.get(themeId)!;
    }

    try {
      // Dynamic import of theme module
      const themeModule = await import(`@/themes/${themeId}`);
      
      // Get the actual module (handle default exports)
      const module = themeModule.theme || themeModule.default || themeModule;
      
      // Cache the module
      this.loadedModules.set(themeId, module);
      
      return module;
    } catch (error) {
      console.error(`[ClientThemeLoader] Failed to load theme ${themeId}:`, error);
      
      // Try fallback to base theme
      if (themeId !== 'base') {
        console.log(`[ClientThemeLoader] Falling back to base theme`);
        return this.loadTheme('base');
      }
      
      return null;
    }
  }

  /**
   * Load theme section component
   */
  async loadSection(themeId: string, sectionType: string): Promise<React.ComponentType<any> | null> {
    const theme = await this.loadTheme(themeId);
    if (!theme) return null;

    try {
      // Check if section loader exists
      if (theme.sections && typeof theme.sections[sectionType] === 'function') {
        const sectionModule = await theme.sections[sectionType]();
        return sectionModule.default || sectionModule;
      }
      
      // Fallback: try direct import
      const sectionModule = await import(`@/themes/${themeId}/sections/${sectionType}`);
      return sectionModule.default || sectionModule;
    } catch (error) {
      console.error(`[ClientThemeLoader] Failed to load section ${sectionType} from theme ${themeId}:`, error);
      
      // Try fallback to base theme
      if (themeId !== 'base') {
        return this.loadSection('base', sectionType);
      }
      
      return null;
    }
  }

  /**
   * Load theme block component
   */
  async loadBlock(themeId: string, blockType: string): Promise<React.ComponentType<any> | null> {
    const theme = await this.loadTheme(themeId);
    if (!theme) return null;

    try {
      // Check if block loader exists
      if (theme.blocks && typeof theme.blocks[blockType] === 'function') {
        const blockModule = await theme.blocks[blockType]();
        return blockModule.default || blockModule;
      }
      
      // Fallback: try direct import
      const blockModule = await import(`@/themes/${themeId}/blocks/${blockType}`);
      return blockModule.default || blockModule;
    } catch (error) {
      console.error(`[ClientThemeLoader] Failed to load block ${blockType} from theme ${themeId}:`, error);
      
      // Try fallback to base theme
      if (themeId !== 'base') {
        return this.loadBlock('base', blockType);
      }
      
      return null;
    }
  }

  /**
   * Load theme styles
   */
  async loadStyles(themeId: string): Promise<{ themeStyles?: string; componentStyles?: string } | null> {
    try {
      const stylesModule = await import(`@/themes/${themeId}/styles/theme-styles`);
      return {
        themeStyles: stylesModule.themeStyles || '',
        componentStyles: stylesModule.componentStyles || ''
      };
    } catch (error) {
      console.error(`[ClientThemeLoader] Failed to load styles from theme ${themeId}:`, error);
      
      // Try fallback to base theme
      if (themeId !== 'base') {
        return this.loadStyles('base');
      }
      
      return null;
    }
  }

  /**
   * Clear cache for a theme
   */
  clearCache(themeId?: string): void {
    if (themeId) {
      this.loadedModules.delete(themeId);
    } else {
      this.loadedModules.clear();
    }
  }

  /**
   * Check if theme is loaded
   */
  isLoaded(themeId: string): boolean {
    return this.loadedModules.has(themeId);
  }
}

// Export singleton instance
export const clientThemeLoader = ClientThemeLoader.getInstance();