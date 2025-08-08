// Central block library for managing reusable blocks
import { BlockPreset } from './block-presets';

export interface ReusableBlock {
  id: string;
  name: string;
  description: string;
  blockType: string;
  settings: Record<string, any>;
  category: string;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isGlobal: boolean; // Available across all stores
  storeId?: string; // Store-specific blocks
  usageCount: number;
  version: number;
}

export interface BlockLibraryOptions {
  includeGlobal?: boolean;
  includeStoreSpecific?: boolean;
  storeId?: string;
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'name' | 'usage' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Mock data for reusable blocks (would be stored in database)
const REUSABLE_BLOCKS: ReusableBlock[] = [
  {
    id: 'rb-1',
    name: 'Company Logo Header',
    description: 'Standard company logo configuration',
    blockType: 'logo',
    category: 'header',
    tags: ['logo', 'header', 'branding'],
    settings: {
      type: 'image',
      src: '/company-logo.svg',
      alt: 'Company Logo',
      width: 140,
      height: 45,
      alignment: 'left',
      link: '/'
    },
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isGlobal: true,
    usageCount: 152,
    version: 1
  },
  {
    id: 'rb-2',
    name: 'Main Navigation Menu',
    description: 'Primary site navigation',
    blockType: 'navigation',
    category: 'header',
    tags: ['navigation', 'menu', 'header'],
    settings: {
      items: [
        { text: 'Home', href: '/' },
        { text: 'Shop', href: '/shop' },
        { text: 'Collections', href: '/collections' },
        { text: 'About', href: '/about' },
        { text: 'Contact', href: '/contact' }
      ],
      layout: 'horizontal',
      alignment: 'center',
      spacing: 'space-x-8',
      fontSize: 'text-base',
      fontWeight: 'font-medium'
    },
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    isGlobal: true,
    usageCount: 89,
    version: 2
  },
  {
    id: 'rb-3',
    name: 'Newsletter Signup Footer',
    description: 'Email subscription form for footer',
    blockType: 'newsletter',
    category: 'footer',
    tags: ['newsletter', 'email', 'footer', 'subscription'],
    settings: {
      title: 'Stay in the Loop',
      description: 'Subscribe to our newsletter for exclusive offers and updates',
      placeholder: 'Enter your email address',
      buttonText: 'Subscribe',
      layout: 'vertical',
      backgroundColor: 'bg-gray-900',
      titleColor: 'text-white',
      descriptionColor: 'text-gray-300',
      buttonVariant: 'primary'
    },
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isGlobal: true,
    usageCount: 67,
    version: 1
  },
  {
    id: 'rb-4',
    name: 'Sale Banner Hero',
    description: 'Promotional banner for sales',
    blockType: 'hero-text',
    category: 'hero',
    tags: ['hero', 'banner', 'sale', 'promotion'],
    settings: {
      headline: 'FLASH SALE - 48 Hours Only!',
      subheading: 'Up to 70% off on selected items. Limited time offer.',
      ctaText: 'Shop Sale Now',
      ctaHref: '/sale',
      alignment: 'center',
      headlineSize: 'text-3xl md:text-4xl lg:text-5xl',
      headlineColor: 'text-red-600',
      subheadingColor: 'text-gray-700',
      ctaVariant: 'primary',
      ctaSize: 'large'
    },
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isGlobal: true,
    usageCount: 23,
    version: 1
  },
  {
    id: 'rb-5',
    name: 'Free Shipping Badge',
    description: 'Free shipping value proposition',
    blockType: 'value-prop',
    category: 'product',
    tags: ['shipping', 'value', 'proposition', 'badge'],
    settings: {
      icon: 'truck',
      title: 'Free Shipping',
      description: 'Free delivery on orders over $75',
      iconColor: 'text-[#8B9F7E]',
      titleColor: 'text-gray-900',
      descriptionColor: 'text-gray-600',
      alignment: 'center',
      backgroundColor: 'bg-[#8B9F7E]/10',
      borderRadius: 'rounded-lg'
    },
    createdBy: 'system',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    isGlobal: true,
    usageCount: 91,
    version: 1
  }
];

// Block library service
export class BlockLibrary {
  // Get blocks from library
  static async getBlocks(options: BlockLibraryOptions = {}): Promise<{
    blocks: ReusableBlock[];
    total: number;
    hasMore: boolean;
  }> {
    let blocks = [...REUSABLE_BLOCKS];

    // Filter by global/store-specific
    if (options.includeGlobal === false) {
      blocks = blocks.filter(block => !block.isGlobal);
    }
    if (options.includeStoreSpecific === false) {
      blocks = blocks.filter(block => block.isGlobal);
    }
    if (options.storeId && options.includeStoreSpecific !== false) {
      blocks = blocks.filter(block => block.isGlobal || block.storeId === options.storeId);
    }

    // Filter by category
    if (options.category) {
      blocks = blocks.filter(block => block.category === options.category);
    }

    // Filter by tags
    if (options.tags && options.tags.length > 0) {
      blocks = blocks.filter(block => 
        options.tags!.some(tag => block.tags.includes(tag))
      );
    }

    // Search filter
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      blocks = blocks.filter(block => 
        block.name.toLowerCase().includes(searchLower) ||
        block.description.toLowerCase().includes(searchLower) ||
        block.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Sort blocks
    const sortBy = options.sortBy || 'usage';
    const sortOrder = options.sortOrder || 'desc';
    
    blocks.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'usage':
          aValue = a.usageCount;
          bValue = b.usageCount;
          break;
        case 'created':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        default:
          aValue = a.usageCount;
          bValue = b.usageCount;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    const total = blocks.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    
    blocks = blocks.slice(offset, offset + limit);

    return {
      blocks,
      total,
      hasMore: offset + blocks.length < total
    };
  }

  // Get block by ID
  static async getBlockById(id: string): Promise<ReusableBlock | null> {
    return REUSABLE_BLOCKS.find(block => block.id === id) || null;
  }

  // Save block to library
  static async saveBlock(block: Omit<ReusableBlock, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'version'>): Promise<ReusableBlock> {
    const newBlock: ReusableBlock = {
      ...block,
      id: `rb-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      version: 1
    };

    REUSABLE_BLOCKS.push(newBlock);
    return newBlock;
  }

  // Update block in library
  static async updateBlock(id: string, updates: Partial<ReusableBlock>): Promise<ReusableBlock | null> {
    const index = REUSABLE_BLOCKS.findIndex(block => block.id === id);
    if (index === -1) return null;

    const updatedBlock = {
      ...REUSABLE_BLOCKS[index],
      ...updates,
      updatedAt: new Date(),
      version: REUSABLE_BLOCKS[index].version + 1
    };

    REUSABLE_BLOCKS[index] = updatedBlock;
    return updatedBlock;
  }

  // Delete block from library
  static async deleteBlock(id: string): Promise<boolean> {
    const index = REUSABLE_BLOCKS.findIndex(block => block.id === id);
    if (index === -1) return false;

    REUSABLE_BLOCKS.splice(index, 1);
    return true;
  }

  // Increment usage count
  static async incrementUsage(id: string): Promise<void> {
    const block = REUSABLE_BLOCKS.find(block => block.id === id);
    if (block) {
      block.usageCount++;
      block.updatedAt = new Date();
    }
  }

  // Get popular blocks
  static async getPopularBlocks(limit = 10): Promise<ReusableBlock[]> {
    return REUSABLE_BLOCKS
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Get recent blocks
  static async getRecentBlocks(limit = 10): Promise<ReusableBlock[]> {
    return REUSABLE_BLOCKS
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Get blocks by category
  static async getBlocksByCategory(category: string): Promise<ReusableBlock[]> {
    return REUSABLE_BLOCKS.filter(block => block.category === category);
  }

  // Search blocks
  static async searchBlocks(query: string): Promise<ReusableBlock[]> {
    const searchLower = query.toLowerCase();
    return REUSABLE_BLOCKS.filter(block => 
      block.name.toLowerCase().includes(searchLower) ||
      block.description.toLowerCase().includes(searchLower) ||
      block.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  // Get available categories
  static async getCategories(): Promise<string[]> {
    const categories = new Set(REUSABLE_BLOCKS.map(block => block.category));
    return Array.from(categories).sort();
  }

  // Get available tags
  static async getTags(): Promise<string[]> {
    const tags = new Set(REUSABLE_BLOCKS.flatMap(block => block.tags));
    return Array.from(tags).sort();
  }
}

export default BlockLibrary;