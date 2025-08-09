/**
 * Server-only theme registry functions
 * These functions can only be called from server components or API routes
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ThemeManifest } from './types';

/**
 * Discover all themes in the themes directory
 */
export async function discoverThemes(): Promise<ThemeManifest[]> {
  const themesDir = path.join(process.cwd(), 'themes');
  const themes: ThemeManifest[] = [];
  
  try {
    const entries = await fs.readdir(themesDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const themePath = path.join(themesDir, entry.name);
      const manifestPath = path.join(themePath, 'manifest.json');
      
      try {
        // Try to read manifest
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const manifest: ThemeManifest = JSON.parse(manifestContent);
        themes.push(manifest);
        
        console.log(`[ServerThemeRegistry] Discovered theme: ${manifest.id} v${manifest.version}`);
      } catch (error) {
        // Create fallback manifest if none exists
        const fallbackManifest = await createFallbackManifest(entry.name, themePath);
        if (fallbackManifest) {
          themes.push(fallbackManifest);
          console.log(`[ServerThemeRegistry] Created fallback manifest for: ${entry.name}`);
        }
      }
    }
  } catch (error) {
    console.error('[ServerThemeRegistry] Failed to discover themes:', error);
  }
  
  return themes;
}

/**
 * Create fallback manifest for themes without manifest.json
 */
async function createFallbackManifest(themeId: string, themePath: string): Promise<ThemeManifest | null> {
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
 * Get a specific theme manifest
 */
export async function getThemeManifest(themeId: string): Promise<ThemeManifest | null> {
  const themes = await discoverThemes();
  return themes.find(t => t.id === themeId) || null;
}

/**
 * Check if a theme exists
 */
export async function themeExists(themeId: string): Promise<boolean> {
  const themes = await discoverThemes();
  return themes.some(t => t.id === themeId);
}

/**
 * Get available sections from a theme
 */
export async function getThemeAvailableSections(themeId: string): Promise<any[] | null> {
  try {
    const sectionsPath = path.join(process.cwd(), 'themes', themeId, 'available-sections.ts');
    
    // Check if file exists
    try {
      await fs.access(sectionsPath);
    } catch {
      // File doesn't exist, return null
      return null;
    }
    
    // For server-side, we can't directly import TypeScript files
    // We need to read and parse them differently or use a build step
    // For MVP, we'll return a hardcoded list based on theme
    
    if (themeId === 'base') {
      return [
        { id: 'header', type: 'header', name: 'Header' },
        { id: 'hero', type: 'hero', name: 'Hero' },
        { id: 'footer', type: 'footer', name: 'Footer' },
        { id: 'product-grid', type: 'product-grid', name: 'Product Grid' },
        { id: 'categories', type: 'categories', name: 'Categories' },
        { id: 'features', type: 'features', name: 'Features' },
        { id: 'testimonials', type: 'testimonials', name: 'Testimonials' },
        { id: 'cta', type: 'cta', name: 'Call to Action' }
      ];
    } else if (themeId === 'skateshop') {
      return [
        { id: 'header', type: 'header', name: 'Skateshop Header' },
        { id: 'hero-skateshop', type: 'hero-skateshop', name: 'Skateshop Hero' },
        { id: 'hero', type: 'hero', name: 'Hero Alternative' },
        { id: 'categories', type: 'categories', name: 'Skateboard Categories' },
        { id: 'product-grid', type: 'product-grid', name: 'Skateboard Products' },
        { id: 'features', type: 'features', name: 'Why Skateshop' },
        { id: 'testimonials', type: 'testimonials', name: 'Skater Reviews' },
        { id: 'newsletter', type: 'newsletter', name: 'Skate Newsletter' },
        { id: 'footer', type: 'footer', name: 'Skateshop Footer' }
      ];
    }
    
    return [];
  } catch (error) {
    console.error(`[ServerThemeRegistry] Failed to get available sections for ${themeId}:`, error);
    return null;
  }
}