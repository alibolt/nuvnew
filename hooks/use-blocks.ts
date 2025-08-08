'use client';

import { useState, useEffect, useCallback } from 'react';
import { Block, UseBlocksResult } from '@/types/blocks';
import { toast } from 'sonner';

export function useBlocks(subdomain: string, sectionId: string): UseBlocksResult {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blocks from API
  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Don't fetch blocks for temporary sections or invalid parameters
      if (!subdomain || !sectionId || sectionId.startsWith('temp-')) {
        setBlocks([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks`);
      
      if (!response.ok) {
        // Don't throw error for 404 - just return empty blocks
        if (response.status === 404) {
          setBlocks([]);
          return;
        }
        throw new Error(`Failed to fetch blocks: ${response.statusText}`);
      }

      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch blocks';
      setError(message);
      console.error('Error fetching blocks:', err);
      setBlocks([]); // Set empty blocks on error
    } finally {
      setLoading(false);
    }
  }, [subdomain, sectionId]);

  // Add a new block
  const addBlock = useCallback(async (type: string, position?: number): Promise<Block> => {
    try {
      // Don't add blocks to temporary sections or invalid parameters
      if (!subdomain || !sectionId || sectionId.startsWith('temp-')) {
        throw new Error('Cannot add blocks to temporary sections');
      }

      const apiUrl = `/api/stores/${subdomain}/sections/${sectionId}/blocks`;
      console.log('useBlocks: Making API call to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          type,
          position: position ?? blocks.length
        })
      });

      console.log('useBlocks: API Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Failed to add block: ${response.status} ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.error('useBlocks: API Error response:', errorText);
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error || errorMessage;
            } catch (e) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          console.error('useBlocks: Could not read error response');
        }
        
        throw new Error(errorMessage);
      }

      const newBlock = await response.json();
      console.log('useBlocks: Block successfully added:', newBlock);
      setBlocks(prev => [...prev, newBlock]);
      
      return newBlock;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add block';
      console.error('useBlocks: Error adding block:', err);
      setError(message);
      toast.error(message);
      throw err;
    }
  }, [subdomain, sectionId, blocks.length]);

  // Update a block
  const updateBlock = useCallback(async (blockId: string, updates: Partial<Block>): Promise<Block> => {
    try {
      // Don't update blocks in temporary sections or invalid parameters
      if (!subdomain || !sectionId || sectionId.startsWith('temp-')) {
        throw new Error('Cannot update blocks in temporary sections');
      }

      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update block: ${response.statusText}`);
      }

      const updatedBlock = await response.json();
      setBlocks(prev => prev.map(block => 
        block.id === blockId ? updatedBlock : block
      ));
      
      return updatedBlock;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update block';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, [subdomain, sectionId]);

  // Delete a block
  const deleteBlock = useCallback(async (blockId: string): Promise<void> => {
    try {
      // Don't delete blocks in temporary sections or invalid parameters
      if (!subdomain || !sectionId || sectionId.startsWith('temp-')) {
        throw new Error('Cannot delete blocks in temporary sections');
      }

      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks/${blockId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete block: ${response.statusText}`);
      }

      setBlocks(prev => prev.filter(block => block.id !== blockId));
      toast.success('Block deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete block';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, [subdomain, sectionId]);

  // Reorder blocks
  const reorderBlocks = useCallback(async (newOrder: string[]): Promise<void> => {
    try {
      // Don't reorder blocks in temporary sections or invalid parameters
      if (!subdomain || !sectionId || sectionId.startsWith('temp-')) {
        throw new Error('Cannot reorder blocks in temporary sections');
      }

      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}/blocks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: newOrder })
      });

      if (!response.ok) {
        throw new Error(`Failed to reorder blocks: ${response.statusText}`);
      }

      const result = await response.json();
      setBlocks(result.blocks);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder blocks';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, [subdomain, sectionId]);

  // Refresh blocks
  const refresh = useCallback(async (): Promise<void> => {
    await fetchBlocks();
  }, [fetchBlocks]);

  // Initial fetch
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return {
    blocks,
    loading,
    error,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    refresh
  };
}

// Hook for managing section with blocks
export function useSection(subdomain: string, sectionId: string) {
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch section: ${response.statusText}`);
      }

      const data = await response.json();
      setSection(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch section';
      setError(message);
      console.error('Error fetching section:', err);
    } finally {
      setLoading(false);
    }
  }, [subdomain, sectionId]);

  const updateSection = useCallback(async (updates: any): Promise<any> => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update section: ${response.statusText}`);
      }

      const updatedSection = await response.json();
      setSection(updatedSection);
      
      return updatedSection;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update section';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, [subdomain, sectionId]);

  const updateSectionSettings = useCallback(async (settings: Record<string, any>): Promise<any> => {
    return updateSection({ settings });
  }, [updateSection]);

  const refresh = useCallback(async (): Promise<void> => {
    await fetchSection();
  }, [fetchSection]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  return {
    section,
    loading,
    error,
    updateSection,
    updateSectionSettings,
    refresh
  };
}