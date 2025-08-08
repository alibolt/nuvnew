// Section Presets System - Central management of all section presets
import { SectionPreset } from './section-settings-base';
import { HEADER_PRESETS, HeaderSectionSettings } from './section-settings-header';
import { HERO_PRESETS, HeroSectionSettings } from './section-settings-hero';

// Preset categories for better organization
export interface PresetCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  {
    id: 'simple',
    name: 'Simple',
    description: 'Clean and minimal designs',
    icon: '🎯',
  },
  {
    id: 'visual',
    name: 'Visual',
    description: 'Image and media focused',
    icon: '🖼️',
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Contemporary and trendy',
    icon: '✨',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Business and enterprise',
    icon: '💼',
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated and refined',
    icon: '👑',
  },
  {
    id: 'immersive',
    name: 'Immersive',
    description: 'Full experience designs',
    icon: '🌟',
  },
];

// All section presets organized by type
export const SECTION_PRESETS = {
  header: HEADER_PRESETS,
  hero: HERO_PRESETS,
  // Future sections can be added here
  // 'featured-products': PRODUCT_GRID_PRESETS,
  // 'text-block': TEXT_BLOCK_PRESETS,
  // 'footer': FOOTER_PRESETS,
} as const;

// Type for section types
export type SectionType = keyof typeof SECTION_PRESETS;

// Preset manager class
export class PresetManager {
  // Get presets for a specific section type
  static getPresetsForSection<T = any>(sectionType: SectionType): SectionPreset<T>[] {
    return (SECTION_PRESETS[sectionType] || []) as SectionPreset<T>[];
  }

  // Get presets by category
  static getPresetsByCategory<T = any>(
    sectionType: SectionType,
    categoryId: string
  ): SectionPreset<T>[] {
    const presets = this.getPresetsForSection<T>(sectionType);
    return presets.filter(preset => preset.category === categoryId);
  }

  // Get a specific preset
  static getPreset<T = any>(sectionType: SectionType, presetId: string): SectionPreset<T> | null {
    const presets = this.getPresetsForSection<T>(sectionType);
    return presets.find(preset => preset.id === presetId) || null;
  }

  // Apply preset to section settings
  static applyPreset<T extends Record<string, any>>(
    currentSettings: T,
    preset: SectionPreset<T>
  ): T {
    return {
      ...currentSettings,
      ...preset.settings,
    };
  }

  // Get recommended presets based on context
  static getRecommendedPresets<T = any>(
    sectionType: SectionType,
    context: {
      position?: number;
      previousSection?: { type: string; settings: any };
      storeType?: 'ecommerce' | 'blog' | 'portfolio' | 'business';
    }
  ): SectionPreset<T>[] {
    const allPresets = this.getPresetsForSection<T>(sectionType);
    
    // If it's the first section (hero), recommend immersive presets
    if (context.position === 0 && sectionType === 'hero') {
      return allPresets.filter(preset => 
        ['image-overlay', 'video-background', 'gradient-modern'].includes(preset.id)
      );
    }

    // For headers, recommend based on store type
    if (sectionType === 'header') {
      switch (context.storeType) {
        case 'ecommerce':
          return allPresets.filter(preset => preset.id === 'ecommerce');
        case 'blog':
          return allPresets.filter(preset => preset.id === 'minimal');
        case 'portfolio':
          return allPresets.filter(preset => preset.id === 'transparent');
        default:
          return allPresets.filter(preset => preset.category === 'simple');
      }
    }

    // Default: return simple presets
    return allPresets.filter(preset => preset.category === 'simple');
  }

  // Search presets
  static searchPresets<T = any>(
    sectionType: SectionType,
    query: string
  ): SectionPreset<T>[] {
    const presets = this.getPresetsForSection<T>(sectionType);
    const lowercaseQuery = query.toLowerCase();
    
    return presets.filter(preset =>
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Hook for using presets in React components
export function usePresets<T = any>(sectionType: SectionType) {
  const presets = PresetManager.getPresetsForSection<T>(sectionType);
  
  return {
    presets,
    categories: PRESET_CATEGORIES,
    getByCategory: (categoryId: string) => 
      PresetManager.getPresetsByCategory<T>(sectionType, categoryId),
    getById: (presetId: string) => 
      PresetManager.getPreset<T>(sectionType, presetId),
    applyPreset: (currentSettings: T, presetId: string) => {
      const preset = PresetManager.getPreset<T>(sectionType, presetId);
      return preset ? PresetManager.applyPreset(currentSettings, preset) : currentSettings;
    },
    getRecommended: (context: Parameters<typeof PresetManager.getRecommendedPresets>[1]) =>
      PresetManager.getRecommendedPresets<T>(sectionType, context),
    search: (query: string) => 
      PresetManager.searchPresets<T>(sectionType, query),
  };
}