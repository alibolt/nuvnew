import { useState, useCallback } from 'react';
import { Block, Section } from '../types';

export interface SectionsState {
  sections: Section[];
  selectedSection: Section | null;
  selectedBlockId: string | null;
  currentTemplate: any;
  activeSectionId: string | null;
}

export interface SectionsActions {
  setSections: (sections: Section[]) => void;
  setSelectedSection: (section: Section | null) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  setCurrentTemplate: (template: any) => void;
  setActiveSectionId: (sectionId: string | null) => void;
  clearSelection: () => void;
  selectSection: (sectionId: string) => void;
  updateSectionInState: (sectionId: string, updates: Partial<Section>) => void;
  addSectionToState: (section: Section) => void;
  removeSectionFromState: (sectionId: string) => void;
  reorderSectionsInState: (fromIndex: number, toIndex: number) => void;
}

export function useSectionsState(): SectionsState & SectionsActions {
  const [sections, setSectionsInternal] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedBlockId, setSelectedBlockIdInternal] = useState<string | null>(null);
  
  // Wrapper to debug block selection
  const setSelectedBlockId = useCallback((blockId: string | null) => {
    setSelectedBlockIdInternal(blockId);
  }, []);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  
  // Wrapper function to add validation
  const setSections = useCallback((newSections: Section[]) => {
    // Force a new array reference to ensure React detects the change
    setSectionsInternal([...newSections]);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSection(null);
    setSelectedBlockId(null);
    setActiveSectionId(null);
  }, []);

  const selectSection = useCallback((sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
      setActiveSectionId(sectionId);
      setSelectedBlockId(null); // Clear block selection when section changes
    }
  }, [sections]);

  const updateSectionInState = useCallback((sectionId: string, updates: Partial<Section>) => {
    setSectionsInternal(current => 
      current.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              ...updates,
              // Special handling for blocks array to ensure it's properly updated
              blocks: updates.blocks !== undefined ? (() => {
                // Ensure container blocks have their nested blocks in settings.blocks
                const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
                const processedBlocks = updates.blocks.map((block: any) => {
                  if (containerTypes.includes(block.type) && block.blocks) {
                    return {
                      ...block,
                      settings: {
                        ...block.settings,
                        blocks: block.blocks
                      }
                    };
                  }
                  return block;
                });
                return processedBlocks;
              })() : section.blocks
            }
          : section
      )
    );
    
    // Update selected section if it's the one being updated
    setSelectedSection(current => 
      current?.id === sectionId 
        ? { 
            ...current, 
            ...updates,
            // Special handling for blocks array to ensure it's properly updated
            blocks: updates.blocks !== undefined ? updates.blocks : current.blocks
          }
        : current
    );
  }, []);

  const addSectionToState = useCallback((section: Section) => {
    setSectionsInternal(current => [...current, section]);
  }, []);

  const removeSectionFromState = useCallback((sectionId: string) => {
    setSectionsInternal(current => current.filter(s => s.id !== sectionId));
    
    // Clear selection if removed section was selected
    if (selectedSection?.id === sectionId) {
      clearSelection();
    }
  }, [selectedSection?.id, clearSelection]);

  const reorderSectionsInState = useCallback((fromIndex: number, toIndex: number) => {
    setSectionsInternal(current => {
      const newSections = [...current];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      
      // Update positions
      return newSections.map((section, index) => ({
        ...section,
        position: index
      }));
    });
  }, []);

  return {
    // State
    sections,
    selectedSection,
    selectedBlockId,
    currentTemplate,
    activeSectionId,
    
    // Actions
    setSections,
    setSelectedSection,
    setSelectedBlockId,
    setCurrentTemplate,
    setActiveSectionId,
    clearSelection,
    selectSection,
    updateSectionInState,
    addSectionToState,
    removeSectionFromState,
    reorderSectionsInState,
  };
}