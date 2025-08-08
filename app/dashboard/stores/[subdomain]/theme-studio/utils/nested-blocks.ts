// Utility functions for handling nested block structures
// This is the canonical source for all nested block utilities

import { Block, ContainerBlock } from '@/types/block';

export interface FlattenedBlock extends Block {
  parentId?: string;
  depth: number;
  path: string[]; // Array of parent IDs from root to this block
}

/**
 * Flatten a nested block structure into a flat array with metadata
 */
export function flattenBlocks(
  blocks: Block[], 
  parentId?: string, 
  depth = 0,
  path: string[] = []
): FlattenedBlock[] {
  const flattened: FlattenedBlock[] = [];
  
  blocks.forEach((block, index) => {
    const flatBlock: FlattenedBlock = {
      ...block,
      parentId,
      depth,
      path,
      position: index
    };
    
    flattened.push(flatBlock);
    
    // If this is a container with child blocks, recursively flatten them
    if (block.type === 'container' && block.blocks && block.blocks.length > 0) {
      const childBlocks = flattenBlocks(
        block.blocks,
        block.id,
        depth + 1,
        [...path, block.id]
      );
      flattened.push(...childBlocks);
    }
  });
  
  return flattened;
}

/**
 * Reconstruct nested structure from flat array
 */
export function unflattenBlocks(flatBlocks: FlattenedBlock[]): Block[] {
  const blockMap = new Map<string, Block>();
  const rootBlocks: Block[] = [];
  
  // First pass: create all blocks
  flatBlocks.forEach(flatBlock => {
    const { parentId, depth, path, ...block } = flatBlock;
    blockMap.set(block.id, { ...block, blocks: [] });
  });
  
  // Second pass: establish parent-child relationships
  flatBlocks.forEach(flatBlock => {
    const block = blockMap.get(flatBlock.id)!;
    
    if (flatBlock.parentId) {
      const parent = blockMap.get(flatBlock.parentId);
      if (parent) {
        if (!parent.blocks) parent.blocks = [];
        parent.blocks.push(block);
      }
    } else {
      rootBlocks.push(block);
    }
  });
  
  return rootBlocks;
}

/**
 * Update block order after drag and drop
 */
export function reorderBlocks(
  blocks: Block[],
  activeId: string,
  overId: string,
  overParentId?: string
): Block[] {
  const flatBlocks = flattenBlocks(blocks);
  const activeBlock = flatBlocks.find(b => b.id === activeId);
  const overBlock = flatBlocks.find(b => b.id === overId);
  
  if (!activeBlock || !overBlock) return blocks;
  
  // Remove active block from its current position
  const removeFromParent = (blocks: Block[], blockId: string): Block | null => {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === blockId) {
        return blocks.splice(i, 1)[0];
      }
      if (blocks[i].blocks) {
        const removed = removeFromParent(blocks[i].blocks, blockId);
        if (removed) return removed;
      }
    }
    return null;
  };
  
  // Add block to new position
  const addToParent = (blocks: Block[], block: Block, targetId: string, parentId?: string): boolean => {
    if (!parentId) {
      // Add to root level
      const targetIndex = blocks.findIndex(b => b.id === targetId);
      if (targetIndex !== -1) {
        blocks.splice(targetIndex, 0, block);
        return true;
      }
    } else {
      // Add to specific parent
      const parent = findBlockById(blocks, parentId);
      if (parent) {
        if (!parent.blocks) parent.blocks = [];
        const targetIndex = parent.blocks.findIndex(b => b.id === targetId);
        if (targetIndex !== -1) {
          parent.blocks.splice(targetIndex, 0, block);
        } else {
          parent.blocks.push(block);
        }
        return true;
      }
    }
    return false;
  };
  
  // Clone the blocks array to avoid mutations
  const newBlocks = JSON.parse(JSON.stringify(blocks));
  
  // Remove and re-add the block
  const removedBlock = removeFromParent(newBlocks, activeId);
  if (removedBlock) {
    // Clear child blocks if moving into a container
    if (overBlock.type === 'container' && overId === overBlock.id) {
      if (!removedBlock.blocks) removedBlock.blocks = [];
      addToParent(newBlocks, removedBlock, '', overId);
    } else {
      addToParent(newBlocks, removedBlock, overId, overParentId);
    }
  }
  
  return newBlocks;
}

/**
 * Find a block by ID in nested structure
 */
export function findBlockById(blocks: Block[], id: string): Block | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.blocks) {
      const found = findBlockById(block.blocks, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Check if a block can accept children
 */
export function canAcceptChildren(blockType: string): boolean {
  return ['container', 'columns', 'grid', 'flex-group'].includes(blockType);
}

/**
 * Check if dropping would create a circular reference
 */
export function wouldCreateCircularReference(
  blocks: Block[],
  draggedId: string,
  targetId: string
): boolean {
  const isDescendant = (parentId: string, childId: string): boolean => {
    const parent = findBlockById(blocks, parentId);
    if (!parent || !parent.blocks) return false;
    
    for (const block of parent.blocks) {
      if (block.id === childId) return true;
      if (block.blocks && isDescendant(block.id, childId)) return true;
    }
    
    return false;
  };
  
  return isDescendant(draggedId, targetId);
}