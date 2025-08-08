/**
 * Transforms a flat array of blocks into a nested structure based on container relationships
 * This is needed because blocks are stored flat in the database but need to be nested for the UI
 */

interface Block {
  id: string;
  type: string;
  position: number;
  enabled: boolean;
  settings: any;
  parentBlockId?: string; // If this block belongs to a container
  blocks?: Block[]; // For container blocks
}

export function nestBlocks(flatBlocks: Block[]): Block[] {
  // Create a map for quick lookup
  const blockMap = new Map<string, Block>();
  const rootBlocks: Block[] = [];
  
  // First pass: initialize all blocks and identify containers
  flatBlocks.forEach(block => {
    const blockCopy = { ...block };
    
    // Initialize blocks array for containers
    if (blockCopy.type === 'container') {
      blockCopy.blocks = [];
    }
    
    blockMap.set(blockCopy.id, blockCopy);
  });
  
  // Second pass: determine parent-child relationships based on position
  const sortedBlocks = [...flatBlocks].sort((a, b) => a.position - b.position);
  
  // For now, use a simple approach: all blocks are root blocks
  // TODO: Implement proper parent-child relationships when database schema supports it
  sortedBlocks.forEach(block => {
    const blockInstance = blockMap.get(block.id)!;
    rootBlocks.push(blockInstance);
  });
  
  // Re-number positions within containers
  rootBlocks.forEach((block, index) => {
    block.position = index;
    if (block.blocks) {
      block.blocks.forEach((child, childIndex) => {
        child.position = childIndex;
      });
    }
  });
  
  return rootBlocks;
}

/**
 * Flattens a nested block structure back to a flat array
 * Used when saving blocks back to the database
 */
export function flattenBlocks(nestedBlocks: Block[], sectionId?: string): Block[] {
  const flatBlocks: Block[] = [];
  let globalPosition = 0;
  
  function processBlock(block: Block, parentId?: string) {
    const flatBlock = { ...block };
    
    // Remove the blocks array from the copy
    delete flatBlock.blocks;
    
    // Set parent relationship if needed
    if (parentId) {
      flatBlock.parentBlockId = parentId;
    }
    
    // Set global position
    flatBlock.position = globalPosition++;
    
    flatBlocks.push(flatBlock);
    
    // Process children if this is a container
    if (block.type === 'container' && block.blocks) {
      block.blocks.forEach(child => processBlock(child, block.id));
    }
  }
  
  nestedBlocks.forEach(block => processBlock(block));
  
  return flatBlocks;
}