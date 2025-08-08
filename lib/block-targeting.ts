// Block targeting system for section-specific filtering
export interface BlockTarget {
  sectionTypes: string[];
  themeTypes?: string[];
  excludeSections?: string[];
  maxPerSection?: number;
  requiredBlocks?: string[];
  incompatibleBlocks?: string[];
}

export interface BlockTargetingRule {
  blockType: string;
  target: BlockTarget;
  priority?: number;
  conditions?: BlockCondition[];
}

export interface BlockCondition {
  type: 'setting' | 'theme' | 'section' | 'context';
  field: string;
  operator: 'equals' | 'contains' | 'exists' | 'greater' | 'less';
  value: any;
}

// Block targeting rules
export const BLOCK_TARGETING_RULES: Record<string, BlockTargetingRule> = {
  // Header specific blocks
  logo: {
    blockType: 'logo',
    target: {
      sectionTypes: ['header', 'footer'],
      maxPerSection: 1
    },
    priority: 10
  },
  
  navigation: {
    blockType: 'navigation',
    target: {
      sectionTypes: ['header', 'footer'],
      maxPerSection: 1
    },
    priority: 9
  },
  
  search: {
    blockType: 'search',
    target: {
      sectionTypes: ['header', 'hero', 'search-results'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  cart: {
    blockType: 'cart',
    target: {
      sectionTypes: ['header', 'cart', 'checkout'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  // Hero specific blocks
  'hero-text': {
    blockType: 'hero-text',
    target: {
      sectionTypes: ['hero', 'banner'],
      maxPerSection: 1
    },
    priority: 10
  },
  
  // Product specific blocks
  'product-card': {
    blockType: 'product-card',
    target: {
      sectionTypes: ['featured-products', 'product-grid', 'collection', 'recommendations'],
      excludeSections: ['header', 'footer']
    },
    priority: 5
  },
  
  'product-gallery': {
    blockType: 'product-gallery',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 9
  },
  
  'product-info': {
    blockType: 'product-info',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  'product-form': {
    blockType: 'product-form',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 7
  },
  
  'product-variants': {
    blockType: 'product-variants',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 6
  },
  
  'add-to-cart': {
    blockType: 'add-to-cart',
    target: {
      sectionTypes: ['product', 'cart'],
      maxPerSection: 1
    },
    priority: 6
  },
  
  'product-title': {
    blockType: 'product-title',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 9
  },
  
  'product-price': {
    blockType: 'product-price',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  'product-description': {
    blockType: 'product-description',
    target: {
      sectionTypes: ['product'],
      maxPerSection: 1
    },
    priority: 7
  },
  
  breadcrumbs: {
    blockType: 'breadcrumbs',
    target: {
      sectionTypes: ['product', 'collection', 'page'],
      maxPerSection: 1
    },
    priority: 10
  },
  
  'category-item': {
    blockType: 'category-item',
    target: {
      sectionTypes: ['categories', 'collection-list'],
      excludeSections: ['header', 'footer']
    },
    priority: 5
  },
  
  'category': {
    blockType: 'category',
    target: {
      sectionTypes: ['product-categories'],
      excludeSections: ['header', 'footer']
    },
    priority: 10
  },
  
  'value-prop': {
    blockType: 'value-prop',
    target: {
      sectionTypes: ['hero', 'features', 'benefits', 'footer'],
      maxPerSection: 6
    },
    priority: 6
  },
  
  // Content blocks (flexible)
  heading: {
    blockType: 'heading',
    target: {
      sectionTypes: ['*'], // Available in all sections
      maxPerSection: 3
    },
    priority: 7
  },
  
  text: {
    blockType: 'text',
    target: {
      sectionTypes: ['*'], // Available in all sections
    },
    priority: 7
  },
  
  image: {
    blockType: 'image',
    target: {
      sectionTypes: ['*'], // Available in all sections
      maxPerSection: 5
    },
    priority: 6
  },
  
  button: {
    blockType: 'button',
    target: {
      sectionTypes: ['*'], // Available in all sections
      maxPerSection: 3
    },
    priority: 6
  },
  
  // Layout blocks
  container: {
    blockType: 'container',
    target: {
      sectionTypes: ['*'], // Available in all sections
    },
    priority: 9
  },
  
  columns: {
    blockType: 'columns',
    target: {
      sectionTypes: ['*'], // Available in all sections
      maxPerSection: 2
    },
    priority: 8
  },
  
  grid: {
    blockType: 'grid',
    target: {
      sectionTypes: ['*'], // Available in all sections
      maxPerSection: 2
    },
    priority: 8
  },
  
  // Utility blocks
  spacer: {
    blockType: 'spacer',
    target: {
      sectionTypes: ['*'], // Available in all sections
    },
    priority: 3
  },
  
  divider: {
    blockType: 'divider',
    target: {
      sectionTypes: ['*'], // Available in all sections
    },
    priority: 3
  },
  
  // Announcement text block
  'announcement-text': {
    blockType: 'announcement-text',
    target: {
      sectionTypes: ['announcement-bar'],
      maxPerSection: 5
    },
    priority: 8
  },
  
  // Language and Currency blocks
  'language-selector': {
    blockType: 'language-selector',
    target: {
      sectionTypes: ['header', 'footer'],
      maxPerSection: 1
    },
    priority: 7
  },
  
  'currency-selector': {
    blockType: 'currency-selector',
    target: {
      sectionTypes: ['header', 'footer'],
      maxPerSection: 1
    },
    priority: 7
  },
  
  // Footer specific blocks
  'footer-column': {
    blockType: 'footer-column',
    target: {
      sectionTypes: ['footer'],
      maxPerSection: 6
    },
    priority: 7
  },
  
  // Newsletter blocks
  newsletter: {
    blockType: 'newsletter',
    target: {
      sectionTypes: ['newsletter', 'footer', 'hero', 'cta'],
      maxPerSection: 1
    },
    priority: 6
  },
  
  // Artisan Craft Theme Header Blocks
  'artisan-logo': {
    blockType: 'artisan-logo',
    target: {
      sectionTypes: ['header'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 10
  },
  
  'artisan-navigation': {
    blockType: 'artisan-navigation',
    target: {
      sectionTypes: ['header'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 9
  },
  
  'artisan-search': {
    blockType: 'artisan-search',
    target: {
      sectionTypes: ['header'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  'artisan-cart': {
    blockType: 'artisan-cart',
    target: {
      sectionTypes: ['header'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  'artisan-account': {
    blockType: 'artisan-account',
    target: {
      sectionTypes: ['header'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 7
  },
  
  // Artisan Craft Hero Blocks
  'artisan-hero-title': {
    blockType: 'artisan-hero-title',
    target: {
      sectionTypes: ['hero'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 10
  },
  
  'artisan-hero-subtitle': {
    blockType: 'artisan-hero-subtitle',
    target: {
      sectionTypes: ['hero'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 9
  },
  
  'artisan-hero-button': {
    blockType: 'artisan-hero-button',
    target: {
      sectionTypes: ['hero'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 2
    },
    priority: 8
  },
  
  // Artisan Craft Footer Blocks
  'artisan-footer-newsletter': {
    blockType: 'artisan-footer-newsletter',
    target: {
      sectionTypes: ['footer'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 8
  },
  
  'artisan-footer-links': {
    blockType: 'artisan-footer-links',
    target: {
      sectionTypes: ['footer'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 4
    },
    priority: 7
  },
  
  'artisan-footer-social': {
    blockType: 'artisan-footer-social',
    target: {
      sectionTypes: ['footer'],
      themeTypes: ['artisan-craft'],
      maxPerSection: 1
    },
    priority: 6
  }
};

// Block targeting service
export class BlockTargeting {
  // Get available blocks for a section
  static getAvailableBlocks(sectionType: string, theme?: string): string[] {
    const availableBlocks: string[] = [];
    
    Object.entries(BLOCK_TARGETING_RULES).forEach(([blockType, rule]) => {
      if (this.isBlockAvailableForSection(blockType, sectionType, theme)) {
        availableBlocks.push(blockType);
      }
    });
    
    // Sort by priority (higher priority first)
    return availableBlocks.sort((a, b) => {
      const priorityA = BLOCK_TARGETING_RULES[a]?.priority || 0;
      const priorityB = BLOCK_TARGETING_RULES[b]?.priority || 0;
      return priorityB - priorityA;
    });
  }
  
  // Check if a block is available for a section
  static isBlockAvailableForSection(blockType: string, sectionType: string, theme?: string): boolean {
    const rule = BLOCK_TARGETING_RULES[blockType];
    if (!rule) return false;
    
    const { target } = rule;
    
    // Check if block is excluded from this section
    if (target.excludeSections?.includes(sectionType)) {
      return false;
    }
    
    // Check if block is allowed in this section
    if (target.sectionTypes.includes('*') || target.sectionTypes.includes(sectionType)) {
      // Check theme compatibility if specified
      if (target.themeTypes && theme && !target.themeTypes.includes(theme)) {
        return false;
      }
      
      return true;
    }
    
    return false;
  }
  
  // Get block limit for a section
  static getBlockLimit(blockType: string, sectionType: string): number | null {
    const rule = BLOCK_TARGETING_RULES[blockType];
    if (!rule || !this.isBlockAvailableForSection(blockType, sectionType)) {
      return null;
    }
    
    return rule.target.maxPerSection || null;
  }
  
  // Check if adding a block would exceed the limit
  static canAddBlock(blockType: string, sectionType: string, currentCount: number): boolean {
    const limit = this.getBlockLimit(blockType, sectionType);
    if (limit === null) return true;
    
    return currentCount < limit;
  }
  
  // Get required blocks for a section
  static getRequiredBlocks(sectionType: string): string[] {
    const requiredBlocks: string[] = [];
    
    Object.entries(BLOCK_TARGETING_RULES).forEach(([blockType, rule]) => {
      if (rule.target.requiredBlocks?.includes(sectionType)) {
        requiredBlocks.push(blockType);
      }
    });
    
    return requiredBlocks;
  }
  
  // Get incompatible blocks for a block type
  static getIncompatibleBlocks(blockType: string): string[] {
    const rule = BLOCK_TARGETING_RULES[blockType];
    return rule?.target.incompatibleBlocks || [];
  }
  
  // Check if two blocks are compatible
  static areBlocksCompatible(blockType1: string, blockType2: string): boolean {
    const incompatible1 = this.getIncompatibleBlocks(blockType1);
    const incompatible2 = this.getIncompatibleBlocks(blockType2);
    
    return !incompatible1.includes(blockType2) && !incompatible2.includes(blockType1);
  }
  
  // Filter blocks by section compatibility
  static filterBlocksBySection(blocks: string[], sectionType: string, theme?: string): string[] {
    return blocks.filter(blockType => this.isBlockAvailableForSection(blockType, sectionType, theme));
  }
  
  // Get blocks by category for a section
  static getBlocksByCategory(sectionType: string, category: string, theme?: string): string[] {
    const availableBlocks = this.getAvailableBlocks(sectionType, theme);
    
    // This would need to be integrated with the block types registry
    // For now, return basic categorization
    const categoryBlocks: Record<string, string[]> = {
      content: ['heading', 'text', 'image', 'button'],
      layout: ['container', 'columns', 'grid'],
      product: ['product-card', 'category-item', 'value-prop'],
      navigation: ['logo', 'navigation', 'search', 'cart'],
      social: ['newsletter'],
      utility: ['spacer', 'divider']
    };
    
    const blocksInCategory = categoryBlocks[category] || [];
    return availableBlocks.filter(block => blocksInCategory.includes(block));
  }
  
  // Validate block configuration
  static validateBlockConfiguration(blocks: Array<{type: string, settings: any}>, sectionType: string): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Count blocks by type
    const blockCounts: Record<string, number> = {};
    blocks.forEach(block => {
      blockCounts[block.type] = (blockCounts[block.type] || 0) + 1;
    });
    
    // Check limits and availability
    Object.entries(blockCounts).forEach(([blockType, count]) => {
      if (!this.isBlockAvailableForSection(blockType, sectionType)) {
        errors.push(`Block type '${blockType}' is not available in section '${sectionType}'`);
      }
      
      const limit = this.getBlockLimit(blockType, sectionType);
      if (limit !== null && count > limit) {
        errors.push(`Too many '${blockType}' blocks in section '${sectionType}' (${count}/${limit})`);
      }
    });
    
    // Check for required blocks
    const requiredBlocks = this.getRequiredBlocks(sectionType);
    requiredBlocks.forEach(requiredBlock => {
      if (!blockCounts[requiredBlock]) {
        warnings.push(`Section '${sectionType}' should have a '${requiredBlock}' block`);
      }
    });
    
    // Check for incompatible blocks
    const blockTypes = Object.keys(blockCounts);
    for (let i = 0; i < blockTypes.length; i++) {
      for (let j = i + 1; j < blockTypes.length; j++) {
        if (!this.areBlocksCompatible(blockTypes[i], blockTypes[j])) {
          errors.push(`Blocks '${blockTypes[i]}' and '${blockTypes[j]}' are incompatible`);
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  // Get suggested blocks for a section
  static getSuggestedBlocks(sectionType: string, existingBlocks: string[] = [], theme?: string): string[] {
    const availableBlocks = this.getAvailableBlocks(sectionType, theme);
    const requiredBlocks = this.getRequiredBlocks(sectionType);
    
    // Filter out existing blocks (unless they can have multiple instances)
    const suggestions = availableBlocks.filter(blockType => {
      const limit = this.getBlockLimit(blockType, sectionType);
      const currentCount = existingBlocks.filter(b => b === blockType).length;
      
      return limit === null || currentCount < limit;
    });
    
    // Prioritize required blocks
    const prioritizedSuggestions = [
      ...requiredBlocks.filter(block => !existingBlocks.includes(block)),
      ...suggestions.filter(block => !requiredBlocks.includes(block))
    ];
    
    return [...new Set(prioritizedSuggestions)]; // Remove duplicates
  }
}

export default BlockTargeting;