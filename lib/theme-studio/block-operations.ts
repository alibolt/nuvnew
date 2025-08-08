import { Block } from '@/app/dashboard/stores/[subdomain]/theme-studio/types';

/**
 * Centralized block operations to eliminate duplicate logic
 * across theme studio components
 */
export class BlockOperations {
  /**
   * Updates a block in a nested block tree structure
   */
  static updateBlockInTree(blocks: Block[], blockId: string, updates: Partial<Block>): Block[] {
    return blocks.map(block => {
      if (block.id === blockId) {
        return { ...block, ...updates };
      }
      
      // Handle nested blocks in container
      if (block.type === 'container' && block.settings?.blocks) {
        return {
          ...block,
          settings: {
            ...block.settings,
            blocks: this.updateBlockInTree(block.settings.blocks, blockId, updates)
          }
        };
      }
      
      return block;
    });
  }

  /**
   * Adds a new block to the tree at the specified position
   */
  static addBlockToTree(
    blocks: Block[], 
    newBlock: Block, 
    targetId?: string, 
    position: 'before' | 'after' | 'inside' = 'after'
  ): Block[] {
    if (!targetId) {
      // Add to the end of the root level
      return [...blocks, newBlock];
    }

    // If adding inside a container
    if (position === 'inside') {
      return blocks.map(block => {
        if (block.id === targetId && block.type === 'container') {
          return {
            ...block,
            settings: {
              ...block.settings,
              blocks: [...(block.settings?.blocks || []), newBlock]
            }
          };
        }
        
        // Check nested containers
        if (block.type === 'container' && block.settings?.blocks) {
          return {
            ...block,
            settings: {
              ...block.settings,
              blocks: this.addBlockToTree(block.settings.blocks, newBlock, targetId, position)
            }
          };
        }
        
        return block;
      });
    }

    // Add before or after at the same level
    const result: Block[] = [];
    let added = false;

    for (const block of blocks) {
      if (block.id === targetId) {
        if (position === 'before') {
          result.push(newBlock);
          result.push(block);
        } else {
          result.push(block);
          result.push(newBlock);
        }
        added = true;
      } else {
        // Check in nested blocks
        if (block.type === 'container' && block.settings?.blocks) {
          const nestedBlocks = this.addBlockToTree(block.settings.blocks, newBlock, targetId, position);
          result.push({
            ...block,
            settings: {
              ...block.settings,
              blocks: nestedBlocks
            }
          });
        } else {
          result.push(block);
        }
      }
    }

    return result;
  }

  /**
   * Deletes a block from the tree
   */
  static deleteBlockFromTree(blocks: Block[], blockId: string): Block[] {
    return blocks.filter(block => {
      if (block.id === blockId) {
        return false;
      }
      
      // Handle nested blocks
      if (block.type === 'container' && block.settings?.blocks) {
        const filteredBlocks = this.deleteBlockFromTree(block.settings.blocks, blockId);
        block.settings.blocks = filteredBlocks;
      }
      
      return true;
    });
  }

  /**
   * Reorders blocks based on provided order
   */
  static reorderBlocksInTree(blocks: Block[], blockIds: string[]): Block[] {
    const blockMap = new Map(blocks.map(block => [block.id, block]));
    const reordered: Block[] = [];
    
    // Add blocks in the specified order
    for (const id of blockIds) {
      const block = blockMap.get(id);
      if (block) {
        reordered.push({
          ...block,
          position: reordered.length
        });
      }
    }
    
    // Add any blocks that weren't in the order list (shouldn't happen, but safety check)
    for (const block of blocks) {
      if (!blockIds.includes(block.id)) {
        reordered.push({
          ...block,
          position: reordered.length
        });
      }
    }
    
    return reordered;
  }

  /**
   * Finds a block by ID in the tree
   */
  static findBlockInTree(blocks: Block[], blockId: string): Block | null {
    for (const block of blocks) {
      if (block.id === blockId) {
        return block;
      }
      
      // Search in nested blocks
      if (block.type === 'container' && block.settings?.blocks) {
        const found = this.findBlockInTree(block.settings.blocks, blockId);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }

  /**
   * Gets the parent block of a given block
   */
  static getParentBlock(blocks: Block[], blockId: string, parent: Block | null = null): Block | null {
    for (const block of blocks) {
      if (block.id === blockId) {
        return parent;
      }
      
      // Search in nested blocks
      if (block.type === 'container' && block.settings?.blocks) {
        const found = this.getParentBlock(block.settings.blocks, blockId, block);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }

  /**
   * Duplicates a block with a new ID
   */
  static duplicateBlock(block: Block): Block {
    const newId = `${block.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const duplicated: Block = {
      ...block,
      id: newId,
      settings: { ...block.settings }
    };
    
    // Handle nested blocks
    if (block.type === 'container' && block.settings?.blocks) {
      duplicated.settings.blocks = block.settings.blocks.map(b => this.duplicateBlock(b));
    }
    
    return duplicated;
  }

  /**
   * Validates block structure
   */
  static validateBlock(block: Block): boolean {
    if (!block.id || !block.type) {
      return false;
    }
    
    // Validate nested blocks
    if (block.type === 'container' && block.settings?.blocks) {
      return block.settings.blocks.every(b => this.validateBlock(b));
    }
    
    return true;
  }

  /**
   * Counts total blocks including nested ones
   */
  static countBlocks(blocks: Block[]): number {
    let count = blocks.length;
    
    for (const block of blocks) {
      if (block.type === 'container' && block.settings?.blocks) {
        count += this.countBlocks(block.settings.blocks);
      }
    }
    
    return count;
  }

  /**
   * Flattens nested blocks into a single array
   */
  static flattenBlocks(blocks: Block[]): Block[] {
    const flattened: Block[] = [];
    
    for (const block of blocks) {
      flattened.push(block);
      
      if (block.type === 'container' && block.settings?.blocks) {
        flattened.push(...this.flattenBlocks(block.settings.blocks));
      }
    }
    
    return flattened;
  }
}