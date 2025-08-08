import { useCallback } from 'react';
import { toast } from 'sonner';
import { useThemeStudio } from '../context/theme-studio-context';
import { Block, Section } from '../types';
import { findNestedBlockById, updateNestedBlock, removeNestedBlock } from '@/lib/nested-block-utils';

interface UseBlockOperationsProps {
  subdomain: string;
  templateType: string;
  onSectionUpdate?: () => void;
}

export function useBlockOperations({ subdomain, templateType, onSectionUpdate }: UseBlockOperationsProps) {
  const { state, dispatch } = useThemeStudio();

  // Update block
  const handleUpdateBlock = useCallback(async (sectionId: string, blockId: string, updates: any) => {
    try {
      console.log('[useBlockOperations] Updating block:', { sectionId, blockId, updates });
      
      const section = state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      let updatedBlocks: Block[] = [];
      const isContainerUpdate = updates.settings?.blocks !== undefined;

      if (isContainerUpdate) {
        // For container updates, find and update the container block
        updatedBlocks = updateNestedBlock(section.blocks || [], blockId, updates);
      } else {
        // For regular block updates
        updatedBlocks = updateNestedBlock(section.blocks || [], blockId, updates);
      }

      // Update section in state
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          sectionId,
          updates: { blocks: updatedBlocks }
        }
      });

      // Save to database
      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/${blockId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update block');
      }

      dispatch({ type: 'SET_DRAFT', payload: true });
      
      if (onSectionUpdate) {
        onSectionUpdate();
      }
    } catch (error) {
      console.error('Failed to update block:', error);
      toast.error('Failed to update block');
    }
  }, [state.sections, subdomain, dispatch, onSectionUpdate]);

  // Delete block
  const handleDeleteBlock = useCallback(async (sectionId: string, blockId: string) => {
    try {
      console.log('[useBlockOperations] Deleting block:', { sectionId, blockId });
      
      const section = state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      // Check if this is a nested block
      const parentBlock = section.blocks?.find(b => 
        b.blocks?.some(child => child.id === blockId)
      );

      if (parentBlock) {
        // Nested block - update parent's structure
        const updatedBlocks = parentBlock.blocks?.filter(b => b.id !== blockId) || [];
        await handleUpdateBlock(sectionId, parentBlock.id, {
          settings: {
            ...parentBlock.settings,
            blocks: updatedBlocks
          }
        });
      } else {
        // Top-level block - remove directly
        const updatedBlocks = removeNestedBlock(section.blocks || [], blockId);
        
        // Update section in state
        dispatch({
          type: 'UPDATE_SECTION',
          payload: {
            sectionId,
            updates: { blocks: updatedBlocks }
          }
        });

        // Delete from database
        const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/${blockId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete block');
        }

        dispatch({ type: 'SET_DRAFT', payload: true });
        
        if (onSectionUpdate) {
          onSectionUpdate();
        }
      }

      // Clear selection if deleted block was selected
      if (state.selectedBlockId === blockId) {
        dispatch({ type: 'SELECT_BLOCK', payload: null });
      }

      toast.success('Block deleted');
    } catch (error) {
      console.error('Failed to delete block:', error);
      toast.error('Failed to delete block');
    }
  }, [state.sections, state.selectedBlockId, subdomain, dispatch, handleUpdateBlock, onSectionUpdate]);

  // Add block
  const handleAddBlock = useCallback(async (sectionId: string, blockType: string, targetContainerId?: string) => {
    try {
      console.log('[useBlockOperations] Adding block:', { sectionId, blockType, targetContainerId });
      
      const section = state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      // Create new block
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type: blockType,
        position: targetContainerId 
          ? (findNestedBlockById(section.blocks || [], targetContainerId)?.blocks?.length || 0)
          : (section.blocks?.length || 0),
        enabled: true,
        settings: {}
      };

      let updatedBlocks: Block[] = [];

      if (targetContainerId) {
        // Add to container
        const container = findNestedBlockById(section.blocks || [], targetContainerId);
        if (container) {
          const updatedContainer = {
            ...container,
            blocks: [...(container.blocks || []), newBlock]
          };
          updatedBlocks = updateNestedBlock(section.blocks || [], targetContainerId, {
            blocks: updatedContainer.blocks
          });
        }
      } else {
        // Add to section
        updatedBlocks = [...(section.blocks || []), newBlock];
      }

      // Update section in state
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          sectionId,
          updates: { blocks: updatedBlocks }
        }
      });

      // Save to database
      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: blockType,
          settings: {},
          parentId: targetContainerId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add block');
      }

      const savedBlock = await response.json();
      
      // Update with saved block data
      if (targetContainerId) {
        const container = findNestedBlockById(updatedBlocks, targetContainerId);
        if (container && container.blocks) {
          container.blocks[container.blocks.length - 1] = savedBlock;
        }
      } else {
        updatedBlocks[updatedBlocks.length - 1] = savedBlock;
      }

      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          sectionId,
          updates: { blocks: updatedBlocks }
        }
      });

      dispatch({ type: 'SET_DRAFT', payload: true });
      
      if (onSectionUpdate) {
        onSectionUpdate();
      }

      toast.success('Block added');
      return savedBlock;
    } catch (error) {
      console.error('Failed to add block:', error);
      toast.error('Failed to add block');
    }
  }, [state.sections, subdomain, dispatch, onSectionUpdate]);

  // Reorder blocks
  const handleReorderBlocks = useCallback(async (sectionId: string, blockIds: string[]) => {
    try {
      console.log('[useBlockOperations] Reordering blocks:', { sectionId, blockIds });
      
      const section = state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      // Create a map of block IDs to blocks
      const blockMap = new Map<string, Block>();
      section.blocks?.forEach(block => {
        blockMap.set(block.id, block);
      });

      // Reorder blocks based on new order
      const reorderedBlocks = blockIds
        .map(id => blockMap.get(id))
        .filter((block): block is Block => block !== undefined)
        .map((block, index) => ({ ...block, position: index }));

      // Update section in state
      dispatch({
        type: 'UPDATE_SECTION',
        payload: {
          sectionId,
          updates: { blocks: reorderedBlocks }
        }
      });

      // Save to database
      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder blocks');
      }

      dispatch({ type: 'SET_DRAFT', payload: true });
      
      if (onSectionUpdate) {
        onSectionUpdate();
      }
    } catch (error) {
      console.error('Failed to reorder blocks:', error);
      toast.error('Failed to reorder blocks');
    }
  }, [state.sections, subdomain, dispatch, onSectionUpdate]);

  // Duplicate block
  const handleDuplicateBlock = useCallback(async (sectionId: string, blockId: string) => {
    try {
      const section = state.sections.find(s => s.id === sectionId);
      if (!section) {
        console.error('Section not found:', sectionId);
        return;
      }

      const blockToDuplicate = findNestedBlockById(section.blocks || [], blockId);
      if (!blockToDuplicate) {
        console.error('Block not found:', blockId);
        return;
      }

      // Create duplicate with new ID
      const duplicateBlock: Block = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
        position: blockToDuplicate.position + 1
      };

      // Find parent container if nested
      const parentBlock = section.blocks?.find(b => 
        b.blocks?.some(child => child.id === blockId)
      );

      if (parentBlock) {
        // Duplicate within container
        const blockIndex = parentBlock.blocks?.findIndex(b => b.id === blockId) || 0;
        const updatedBlocks = [...(parentBlock.blocks || [])];
        updatedBlocks.splice(blockIndex + 1, 0, duplicateBlock);
        
        await handleUpdateBlock(sectionId, parentBlock.id, {
          settings: {
            ...parentBlock.settings,
            blocks: updatedBlocks
          }
        });
      } else {
        // Duplicate at section level
        const blockIndex = section.blocks?.findIndex(b => b.id === blockId) || 0;
        const updatedBlocks = [...(section.blocks || [])];
        updatedBlocks.splice(blockIndex + 1, 0, duplicateBlock);
        
        // Update positions
        updatedBlocks.forEach((block, index) => {
          block.position = index;
        });

        dispatch({
          type: 'UPDATE_SECTION',
          payload: {
            sectionId,
            updates: { blocks: updatedBlocks }
          }
        });

        // Save to database
        const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/${blockId}/duplicate`, {
          method: 'POST'
        });

        if (!response.ok) {
          throw new Error('Failed to duplicate block');
        }

        dispatch({ type: 'SET_DRAFT', payload: true });
        
        if (onSectionUpdate) {
          onSectionUpdate();
        }
      }

      toast.success('Block duplicated');
    } catch (error) {
      console.error('Failed to duplicate block:', error);
      toast.error('Failed to duplicate block');
    }
  }, [state.sections, subdomain, dispatch, handleUpdateBlock, onSectionUpdate]);

  return {
    handleUpdateBlock,
    handleDeleteBlock,
    handleAddBlock,
    handleReorderBlocks,
    handleDuplicateBlock
  };
}