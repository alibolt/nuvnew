import { useState, useCallback } from 'react';
import { Block } from '@/types/block';
import { 
  flattenBlocks, 
  unflattenBlocks, 
  reorderBlocks, 
  findBlockById,
  canAcceptChildren,
  wouldCreateCircularReference 
} from '../utils/nested-blocks';

export function useNestedBlocks(initialBlocks: Block[] = []) {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  // Add a new block
  const addBlock = useCallback((blockType: string, parentId?: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: blockType,
      settings: {},
      enabled: true,
      position: 0
    };

    setBlocks(prev => {
      if (!parentId) {
        // Add to root level
        return [...prev, newBlock];
      }

      // Add to specific parent
      const updated = JSON.parse(JSON.stringify(prev));
      const parent = findBlockById(updated, parentId);
      
      if (parent && canAcceptChildren(parent.type)) {
        if (!parent.blocks) parent.blocks = [];
        parent.blocks.push(newBlock);
      }
      
      return updated;
    });

    return newBlock.id;
  }, []);

  // Update a block
  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const block = findBlockById(updated, blockId);
      
      if (block) {
        Object.assign(block, updates);
      }
      
      return updated;
    });
  }, []);

  // Delete a block
  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => {
      const deleteFromTree = (blocks: Block[]): Block[] => {
        return blocks.filter(block => {
          if (block.id === blockId) return false;
          if (block.blocks) {
            block.blocks = deleteFromTree(block.blocks);
          }
          return true;
        });
      };
      
      return deleteFromTree(prev);
    });
  }, []);

  // Move a block (drag and drop)
  const moveBlock = useCallback((activeId: string, overId: string, overType?: 'container' | 'block') => {
    setBlocks(prev => {
      if (wouldCreateCircularReference(prev, activeId, overId)) {
        // Cannot move block: would create circular reference
        return prev;
      }

      return reorderBlocks(prev, activeId, overId);
    });
  }, []);

  // Reorder child blocks within a container
  const reorderChildBlocks = useCallback((parentId: string, newOrder: string[]) => {
    setBlocks(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      const parent = findBlockById(updated, parentId);
      
      if (parent && parent.blocks) {
        const blockMap = new Map(parent.blocks.map(b => [b.id, b]));
        parent.blocks = newOrder.map(id => blockMap.get(id)).filter(Boolean) as Block[];
      }
      
      return updated;
    });
  }, []);

  // Get flattened blocks for display
  const getFlattenedBlocks = useCallback(() => {
    return flattenBlocks(blocks);
  }, [blocks]);

  return {
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    reorderChildBlocks,
    getFlattenedBlocks
  };
}