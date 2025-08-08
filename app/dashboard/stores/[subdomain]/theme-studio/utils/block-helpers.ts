import { BLOCK_TYPES } from '@/lib/block-types';

export function canBlockContainChildren(blockType: string): boolean {
  // Currently only container blocks can have children
  return blockType === 'container';
}

export function getMaxDepth(): number {
  // Maximum nesting depth to prevent infinite nesting
  return 3;
}

export function canDropIntoBlock(
  targetBlockType: string,
  draggedBlockType: string,
  currentDepth: number
): boolean {
  // Check if target can contain children
  if (!canBlockContainChildren(targetBlockType)) {
    return false;
  }
  
  // Check depth limit
  if (currentDepth >= getMaxDepth()) {
    return false;
  }
  
  // Prevent containers from being nested in themselves (avoid infinite loops)
  if (targetBlockType === 'container' && draggedBlockType === 'container' && currentDepth > 0) {
    return false;
  }
  
  return true;
}