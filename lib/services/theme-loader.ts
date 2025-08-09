import { cache } from 'react';

export interface ThemeModule {
  sections: Record<string, () => Promise<any>>;
  blocks: Record<string, () => Promise<any>>;
  schemas?: Record<string, () => Promise<any>>;
  manifest: {
    name: string;
    version: string;
    settings: {
      colors: Record<string, string>;
      typography: Record<string, any>;
      layout: Record<string, string>;
    };
    supportedFeatures: string[];
  };
  config: {
    name: string;
    version: string;
    settings: any;
    supportedFeatures: string[];
  };
  initTheme: () => void;
}

// Import client-safe theme loader
import { clientThemeLoader } from '@/lib/theme-registry/client-theme-loader';

// Cache loaded themes to avoid re-importing
const themeCache = new Map<string, ThemeModule>();

// Load theme module using dynamic loader
export const loadTheme = cache(async (themeCode: string): Promise<ThemeModule> => {
  // Check cache first
  if (themeCache.has(themeCode)) {
    return themeCache.get(themeCode)!;
  }

  try {
    // Use client-safe theme loader
    const themeModule = await clientThemeLoader.loadTheme(themeCode);
    
    if (!themeModule) {
      // Fallback to direct import for backwards compatibility
      const theme = await import(`@/themes/${themeCode}`);
      const module = theme.theme || theme.default || theme;
      
      if (!module.sections || !module.blocks) {
        throw new Error(`Invalid theme structure for ${themeCode}`);
      }
      
      themeCache.set(themeCode, module);
      return module;
    }
    
    // Cache the loaded theme
    themeCache.set(themeCode, themeModule);
    
    return themeModule;
  } catch (error) {
    console.error(`Failed to load theme ${themeCode}:`, error);
    // Try to fallback to base theme
    if (themeCode !== 'base') {
      console.log(`Falling back to base theme`);
      return loadTheme('base');
    }
    throw new Error(`Theme ${themeCode} not found or invalid`);
  }
});

// Load a specific section from theme
export async function loadThemeSection(themeCode: string, sectionType: string) {
  try {
    // Try using client-safe loader first
    const section = await clientThemeLoader.loadSection(themeCode, sectionType);
    if (section) {
      return section;
    }
    
    // Fallback to old method
    const theme = await loadTheme(themeCode);
    const sectionLoader = theme.sections[sectionType];
    
    if (!sectionLoader) {
      console.warn(`Section ${sectionType} not found in theme ${themeCode}`);
      // Try fallback to base theme
      if (themeCode !== 'base') {
        console.log(`Trying to load section from base theme`);
        return loadThemeSection('base', sectionType);
      }
      return null;
    }
    
    const sectionModule = await sectionLoader();
    // Always use default export
    return sectionModule.default;
  } catch (error) {
    console.error(`Failed to load section ${sectionType} from theme ${themeCode}:`, error);
    // Try fallback to base theme
    if (themeCode !== 'base') {
      return loadThemeSection('base', sectionType);
    }
    return null;
  }
}

// Load a specific schema from theme
export async function loadThemeSchema(themeCode: string, sectionType: string) {
  const theme = await loadTheme(themeCode);
  
  // Check if theme has schemas
  if (!theme.schemas) {
    console.warn(`Theme ${themeCode} does not have schemas defined`);
    return null;
  }
  
  const schemaLoader = theme.schemas[sectionType];
  
  if (!schemaLoader) {
    console.warn(`Schema for ${sectionType} not found in theme ${themeCode}`);
    return null;
  }
  
  try {
    const schema = await schemaLoader();
    return schema;
  } catch (error) {
    console.error(`Failed to load schema ${sectionType} from theme ${themeCode}:`, error);
    return null;
  }
}

// Load a specific block from theme
export async function loadThemeBlock(themeCode: string, blockType: string) {
  const theme = await loadTheme(themeCode);
  const blockLoader = theme.blocks[blockType];
  
  if (!blockLoader) {
    console.warn(`Block ${blockType} not found in theme ${themeCode}`);
    return null;
  }
  
  try {
    const blockModule = await blockLoader();
    // Always use default export
    return blockModule.default;
  } catch (error) {
    console.error(`Failed to load block ${blockType} from theme ${themeCode}:`, error);
    return null;
  }
}

// Get theme manifest
export async function getThemeManifest(themeCode: string) {
  const theme = await loadTheme(themeCode);
  return theme.manifest;
}

// Initialize theme (set CSS variables, load fonts, etc.)
export async function initializeTheme(themeCode: string) {
  const theme = await loadTheme(themeCode);
  
  if (theme.initTheme) {
    theme.initTheme();
  }
}

// Get available sections for a theme
export async function getThemeSections(themeCode: string) {
  const theme = await loadTheme(themeCode);
  return Object.keys(theme.sections);
}

// Get available blocks for a theme
export async function getThemeBlocks(themeCode: string) {
  const theme = await loadTheme(themeCode);
  return Object.keys(theme.blocks);
}

// Validate if a section exists in theme
export async function hasThemeSection(themeCode: string, sectionType: string) {
  const theme = await loadTheme(themeCode);
  return sectionType in theme.sections;
}

// Validate if a block exists in theme
export async function hasThemeBlock(themeCode: string, blockType: string) {
  const theme = await loadTheme(themeCode);
  return blockType in theme.blocks;
}

// Clear theme cache (useful for development)
export function clearThemeCache() {
  themeCache.clear();
}