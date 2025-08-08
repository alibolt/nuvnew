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

// Cache loaded themes to avoid re-importing
const themeCache = new Map<string, ThemeModule>();

// Load theme module
export const loadTheme = cache(async (themeCode: string): Promise<ThemeModule> => {
  // Check cache first
  if (themeCache.has(themeCode)) {
    return themeCache.get(themeCode)!;
  }

  try {
    // Dynamic import of theme
    const theme = await import(`@/themes/${themeCode}`);
    
    // Validate theme structure
    if (!theme.sections || !theme.blocks || !theme.manifest) {
      throw new Error(`Invalid theme structure for ${themeCode}`);
    }
    
    // Cache the loaded theme
    themeCache.set(themeCode, theme);
    
    return theme;
  } catch (error) {
    console.error(`Failed to load theme ${themeCode}:`, error);
    throw new Error(`Theme ${themeCode} not found or invalid`);
  }
});

// Load a specific section from theme
export async function loadThemeSection(themeCode: string, sectionType: string) {
  const theme = await loadTheme(themeCode);
  const sectionLoader = theme.sections[sectionType];
  
  if (!sectionLoader) {
    console.warn(`Section ${sectionType} not found in theme ${themeCode}`);
    return null;
  }
  
  try {
    const sectionModule = await sectionLoader();
    // Always use default export
    return sectionModule.default;
  } catch (error) {
    console.error(`Failed to load section ${sectionType} from theme ${themeCode}:`, error);
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