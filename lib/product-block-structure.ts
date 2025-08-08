// Helper to determine where to add a block in the product section
export function getProductBlockTargetContainer(
  sectionBlocks: any[],
  blockType: string
): { containerId: string | null; containerPath: string[] } {
  
  // Product blocks that should go in the main container's right column
  const rightColumnBlocks = [
    'product-title',
    'product-price',
    'product-description',
    'product-variants',
    'product-form',
    'product-info',
    'product-rating',
    'product-availability',
    'product-sku',
    'product-vendor',
    'product-tags',
    'social-share'
  ];
  
  // Product blocks that should go in the main container's left column
  const leftColumnBlocks = [
    'product-gallery'
  ];
  
  // Find the main horizontal container (usually at position 1)
  const mainContainer = sectionBlocks.find(
    block => block.type === 'container' && 
    block.settings?.layout === 'horizontal' &&
    block.position === 1
  );
  
  if (!mainContainer) {
    // No main container found, add to section level
    return { containerId: null, containerPath: [] };
  }
  
  // Get the nested blocks from container
  const containerBlocks = mainContainer.settings?.blocks || [];
  
  if (leftColumnBlocks.includes(blockType)) {
    // This should go in the left column (usually position 0)
    return { 
      containerId: mainContainer.id, 
      containerPath: ['left'] 
    };
  }
  
  if (rightColumnBlocks.includes(blockType)) {
    // Find the right column container (usually position 1)
    const rightContainer = containerBlocks.find(
      (block: any) => block.type === 'container' && block.position === 1
    );
    
    if (rightContainer) {
      return { 
        containerId: rightContainer.id, 
        containerPath: ['main', 'right'] 
      };
    }
  }
  
  // Default: add to section level for non-product specific blocks
  return { containerId: null, containerPath: [] };
}

// Helper to add a block to the correct position in product section
export function addBlockToProductSection(
  sectionBlocks: any[],
  newBlock: any,
  targetContainerId: string | null
): any[] {
  if (!targetContainerId) {
    // Add to section level
    return [...sectionBlocks, newBlock];
  }
  
  // Recursive function to find and update the target container
  const updateBlocks = (blocks: any[]): any[] => {
    return blocks.map(block => {
      if (block.id === targetContainerId) {
        // Found the target container
        const currentBlocks = block.settings?.blocks || [];
        const updatedBlocks = [...currentBlocks, {
          ...newBlock,
          position: currentBlocks.length
        }];
        
        return {
          ...block,
          settings: {
            ...block.settings,
            blocks: updatedBlocks
          }
        };
      }
      
      // Check nested containers
      if (block.type === 'container' && block.settings?.blocks) {
        const updatedNestedBlocks = updateBlocks(block.settings.blocks);
        if (updatedNestedBlocks !== block.settings.blocks) {
          // Found and updated in nested container
          return {
            ...block,
            settings: {
              ...block.settings,
              blocks: updatedNestedBlocks
            }
          };
        }
      }
      
      return block;
    });
  };
  
  return updateBlocks(sectionBlocks);
}