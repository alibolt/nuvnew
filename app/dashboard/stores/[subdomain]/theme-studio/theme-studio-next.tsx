'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import {
  Layout,
  ShoppingBag,
  Image,
  Type,
  Mail,
  MessageSquare,
  Users,
  Instagram,
  Palette,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { SectionListInline } from './components/section-list-inline';
import { getSimplifiedBlockSettings } from '@/lib/simplified-block-settings';
import { AddItemSidebarInline } from './components/add-item-sidebar-inline';
import { HistoryPanel } from './components/history-panel';
import { DebugPanel } from './components/debug-panel';
import { ThemeStudioToolbar } from './components/theme-studio-toolbar';
import { PageSelector } from './components/page-selector';
import { ThemeStudioSidebar } from './components/theme-studio-sidebar';
import { ThemeStudioPreview } from './components/theme-studio-preview';
import { ThemeStudioInspector } from './components/theme-studio-inspector';
import { useHistory } from './hooks/use-history';
import { useRealtimeSections } from './hooks/use-realtime-sections';
import { useThemeStudioState } from './hooks/use-theme-studio-state';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useConfirmationModal } from '@/components/ui/confirmation-modal';
import { getProductBlockTargetContainer, addBlockToProductSection } from '@/lib/product-block-structure';
import { loadThemeSettings } from '@/lib/theme-utils';
import { ThemeStudioAPI } from '@/lib/theme-studio/api';
import { ThemeStudioMessageBus } from '@/lib/theme-studio/message-bus';
import { BlockOperations } from '@/lib/theme-studio/block-operations';
import { Block, Section, Page, Store } from './types';

interface ThemeStudioNextProps {
  store: Store;
}

// Section type icons mapping
const sectionIcons: Record<string, any> = {
  'hero': Layout,
  'header': Layout,
  'footer': Layout,
  'featured-products': ShoppingBag,
  'product-grid': ShoppingBag,
  'image-with-text': Image,
  'rich-text': Type,
  'newsletter': Mail,
  'testimonials': MessageSquare,
  'logo-list': Users,
  'instagram-feed': Instagram,
  'collections': Palette,
};

export function ThemeStudioNext({ store }: ThemeStudioNextProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Consolidated state management
  const state = useThemeStudioState();
  
  // Theme settings state
  const [themeSettings, setThemeSettings] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref for theme inspector
  const themeInspectorRef = useRef<{ saveSettings: () => Promise<void> }>(null);
  
  // Initialize message bus
  useEffect(() => {
    ThemeStudioMessageBus.init();
    return () => {
      ThemeStudioMessageBus.cleanup();
    };
  }, []);
  
  // Debug: Log sections state changes
  useEffect(() => {
    console.log('[ThemeStudioNext] Sections in state changed:', {
      count: state.sections.length,
      sections: state.sections.map(s => ({ id: s.id, type: s.sectionType, title: s.title })),
      selectedPage: state.selectedPage
    });
  }, [state.sections, state.selectedPage]);
  
  // Preview frame ref for realtime updates
  const previewFrameRef = useRef<{ scrollToSection: (sectionId: string) => void; contentWindow: Window | null }>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Helper to get content window
  const getContentWindow = () => {
    return previewFrameRef.current?.contentWindow || iframeRef.current?.contentWindow;
  };
  
  // Read page from URL on mount
  useEffect(() => {
    const pageFromUrl = searchParams.get('page');
    if (pageFromUrl) {
      console.log('[ThemeStudio] Setting initial page from URL:', pageFromUrl);
      state.setSelectedPage(pageFromUrl);
    }
  }, [searchParams, state.setSelectedPage]);
  
  // Update URL when page changes
  useEffect(() => {
    const currentPageInUrl = searchParams.get('page');
    if (state.selectedPage !== currentPageInUrl) {
      const params = new URLSearchParams(searchParams.toString());
      if (state.selectedPage === 'homepage') {
        params.delete('page');
      } else {
        params.set('page', state.selectedPage);
      }
      
      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.replace(`/dashboard/stores/${store.subdomain}/theme-studio${newUrl}`, { scroll: false });
    }
  }, [state.selectedPage, searchParams, router, store.subdomain]);
  
  // History management
  const {
    currentState: historySections,
    pushState: pushHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
    withoutRecording,
    clearHistory,
    goToHistory,
    historyEntries,
    currentIndex: historyIndex
  } = useHistory<Section[]>(state.sections, 5); // Maximum 5 history kaydı
  
  // Track if we're in the middle of an update
  const isUpdatingRef = useRef(false);
  
  // Realtime section updates
  const {
    updateSection: realtimeUpdateSection,
    addSection: realtimeAddSection,
    deleteSection: realtimeDeleteSection,
    reorderSections: realtimeReorderSections,
    updateBlock: realtimeUpdateBlock,
    addBlock: realtimeAddBlock,
    deleteBlock: realtimeDeleteBlock,
    reorderBlocks: realtimeReorderBlocks,
    sendInitialSections
  } = useRealtimeSections(previewFrameRef, state.sections);

  // Confirmation modal
  const { openModal: openConfirmationModal, ConfirmationModal } = useConfirmationModal();

  // Computed state
  const hasChanges = state.isDraft || JSON.stringify(state.sections) !== JSON.stringify(historySections);


  // Section drag sensors - defined at component level to avoid hooks rule violations
  const sectionDragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
      // Only activate on section drag handles, not on form elements
      shouldHandleEvent: (event: any) => {
        const target = event.target as HTMLElement;
        
        // Don't activate on form elements
        if (target.tagName === 'SELECT' || 
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.tagName === 'BUTTON' ||
            target.closest('select') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('button') ||
            target.closest('.section-inspector-simplified') ||
            target.closest('.theme-studio-right-sidebar')) {
          return false;
        }
        
        // Only activate on section drag handles (not block handles)
        const isDragHandle = target.getAttribute('data-section-drag-handle') === 'true' ||
                           target.closest('[data-section-drag-handle="true"]') !== null;
        console.log('[DRAG] Should handle event?', isDragHandle, 'Target:', target);
        return isDragHandle;
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Debug sections state - commented out to reduce noise
  // useEffect(() => {
  //   console.log('[Theme Studio] Sections state changed:', sections);
  //   console.log('[Theme Studio] Number of sections:', sections.length);
  //   if (sections.length > 0) {
  //     console.log('[Theme Studio] First section:', sections[0]);
  //   }
  // }, [sections]);

  // Track if sections have been loaded initially
  const sectionsLoadedRef = useRef(false);
  
  // Initialize with default template if provided
  useEffect(() => {
    if (store.defaultTemplateId && !state.currentTemplate) {
      console.log('[Theme Studio] Loading default template:', store.defaultTemplateId);
      // Load the default template
      fetch(`/api/stores/${store.subdomain}/templates/${store.defaultTemplateId}`, {
        credentials: 'include'
      })
        .then(response => response.json())
        .then(result => {
          const template = result.data || result;
          console.log('[Theme Studio] Default template loaded:', template);
          state.setCurrentTemplate(template);
          if (template.sections) {
            state.setSections(template.sections);
            sectionsLoadedRef.current = true;
          }
        })
        .catch(error => {
          console.error('[Theme Studio] Failed to load default template:', error);
        });
    }
  }, [store.defaultTemplateId, store.subdomain, state.currentTemplate, state.setCurrentTemplate, state.setSections]);
  
  // Keep a ref to current sections for event handlers
  const sectionsRef = useRef(state.sections);
  useEffect(() => {
    sectionsRef.current = state.sections;
    
    // Debug log when sections change
    if (state.sections.length > 0 || sectionsLoadedRef.current) {
      console.log('[Theme Studio] Sections state updated:', {
        length: state.sections.length,
        loaded: sectionsLoadedRef.current,
        firstSection: state.sections[0]?.id,
        sectionIds: state.sections.map(s => s.id)
      });
    }
  }, [state.sections]);
  
  // Keep refs for functions used in callbacks
  const clearHistoryRef = useRef(clearHistory);
  useEffect(() => {
    clearHistoryRef.current = clearHistory;
  }, [clearHistory]);
  
  const realtimeReorderSectionsRef = useRef(realtimeReorderSections);
  useEffect(() => {
    realtimeReorderSectionsRef.current = realtimeReorderSections;
  }, [realtimeReorderSections]);
  
  // Keep ref for pages
  const pagesRef = useRef(state.pages);
  useEffect(() => {
    pagesRef.current = state.pages;
  }, [state.pages]);
  
  // Sync sections when history changes (only for undo/redo operations)
  useEffect(() => {
    // Skip if we're in the middle of an update
    if (isUpdatingRef.current) return;
    
    // Skip if sections haven't been loaded yet
    if (!sectionsLoadedRef.current && state.sections.length === 0) return;
    
    // Skip if historySections is empty or undefined (this can cause sections to disappear)
    if (!historySections || historySections.length === 0) {
      console.log('[Theme Studio] History sync: skipping empty history sections');
      return;
    }
    
    // This effect should only run when history actually changes due to undo/redo
    // Not when sections change due to normal updates
    const historyJSON = JSON.stringify(historySections);
    const currentSectionsJSON = JSON.stringify(sectionsRef.current);
    
    if (historySections && historyJSON !== currentSectionsJSON) {
      console.log('[Theme Studio] History sync: setting sections from history', historySections.length);
      
      // Additional safety check: don't overwrite valid sections with empty history
      if (historySections.length === 0 && sectionsRef.current.length > 0) {
        console.warn('[Theme Studio] Preventing overwrite of valid sections with empty history');
        return;
      }
      
      // Use withoutRecording to prevent triggering history update
      withoutRecording(() => {
        state.setSections(historySections);
      });
      // Only send realtime update if sections actually changed
      if (historySections.length > 0) {
        realtimeReorderSectionsRef.current(historySections);
      }
    }
  }, [historySections]); // Remove withoutRecording from dependencies to prevent unnecessary re-runs

  // Removed preview-frame-loaded listener - using THEME_STUDIO_PREVIEW_READY message instead

  // Listen for force scroll messages from section list
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'THEME_STUDIO_FORCE_SCROLL' && event.data.sectionId) {
        console.log('[ThemeStudio] Force scroll message received:', event.data.sectionId);
        // Use imperative handle to force scroll
        if (previewFrameRef.current?.scrollToSection) {
          previewFrameRef.current.scrollToSection(event.data.sectionId);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Removed duplicate initial sections sending - handled by preview ready message

  // Close page selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (state.showPageSelector) {
        const target = event.target as HTMLElement;
        // Check if click is outside page selector and not on the toggle button
        if (!target.closest('[data-page-selector]') && !target.closest('[data-page-selector-toggle]')) {
          state.setShowPageSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [state.showPageSelector, state.setShowPageSelector]);

  // Listen for section selection from preview
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data.type === 'SECTION_SELECTED') {
        const { sectionId, sectionType } = event.data;
        
        // Find the section by ID
        const section = sectionsRef.current.find(s => s.id === sectionId);
        
        if (section) {
          // Only update if it's a different section
          if (state.selectedSection?.id !== section.id) {
            // Select the new section
            state.setSelectedSection(section);
            
            // Show a brief toast to indicate selection
            toast.success(`Selected ${sectionType.replace(/-/g, ' ')} section`, {
              duration: 1500,
            });
          }
          
          // Auto-scroll to the selected section in sidebar (with slight delay for UI updates)
          setTimeout(() => {
            const sectionElement = document.querySelector(`[data-section-sidebar-id="${sectionId}"]`);
            if (sectionElement) {
              sectionElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
              });
            }
          }, 100);
          
          console.log('Section selected from preview:', {
            id: sectionId,
            type: sectionType,
            section
          });
        }
      }
      
      // Handle block selection from preview
      if (event.data.type === 'BLOCK_SELECTED') {
        const { sectionId, sectionType, blockId, blockType } = event.data;
        
        console.log('[ThemeStudio] BLOCK_SELECTED received:', {
          sectionId,
          sectionType,
          blockId,
          blockType
        });
        
        // Find the section by ID
        const section = sectionsRef.current.find(s => s.id === sectionId);
        
        if (section) {
          console.log('[ThemeStudio] Found section, selecting block:', blockId);
          
          // Select the section first
          state.setSelectedSection(section);
          
          // Select the specific block
          state.setSelectedBlockId(blockId);
          
          // Also ensure the section is properly selected (same logic as handleSelectBlock)
          // This is important for nested blocks
          const findBlockInSection = (blocks: any[]): boolean => {
            for (const block of blocks) {
              if (block.id === blockId) {
                return true;
              }
              // Check in container blocks
              const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
              if (containerTypes.includes(block.type) && (block.blocks || block.settings?.blocks)) {
                const nestedBlocks = block.blocks || block.settings?.blocks || [];
                if (findBlockInSection(nestedBlocks)) {
                  return true;
                }
              }
            }
            return false;
          };
          
          // Double-check that the correct section is selected
          const sectionWithBlock = sectionsRef.current.find(s => 
            s.blocks && findBlockInSection(s.blocks)
          );
          
          if (sectionWithBlock && sectionWithBlock.id !== section.id) {
            state.setSelectedSection(sectionWithBlock);
          }
          
          // Open the inspector panel to show block settings
          state.openInspector();
          
          console.log('[ThemeStudio] State after block selection:', {
            selectedSectionId: section.id,
            selectedBlockId: blockId
          });
          
          // Show a brief toast to indicate block selection
          toast.success(`Selected ${blockType} block`, {
            duration: 1500,
          });
          
          // Auto-scroll to the selected section in sidebar (with slight delay for UI updates)
          setTimeout(() => {
            const sectionElement = document.querySelector(`[data-section-sidebar-id="${sectionId}"]`);
            if (sectionElement) {
              sectionElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest',
                inline: 'nearest'
              });
            }
          }, 100);
          
          console.log('Block selected from preview:', {
            sectionId,
            sectionType,
            blockId,
            blockType,
            section
          });
        }
      }
      
      // Handle section blocks loaded from preview
      if (event.data.type === 'SECTION_BLOCKS_LOADED') {
        const { sectionId, blocks } = event.data;
        console.log('[ThemeStudio] Section blocks loaded:', { sectionId, blocksCount: blocks.length });
        
        // Update the section with the loaded blocks
        const updatedSections = sectionsRef.current.map(section => 
          section.id === sectionId 
            ? { ...section, blocks: blocks }
            : section
        );
        
        state.setSections(updatedSections);
        
        // If this is the currently selected section, update it
        if (state.selectedSection?.id === sectionId) {
          const updatedSection = updatedSections.find(s => s.id === sectionId);
          if (updatedSection) {
            state.setSelectedSection(updatedSection);
          }
        }
      }
      
      // Handle preview ready signal
      if (event.data.type === 'THEME_STUDIO_PREVIEW_READY') {
        console.log('[ThemeStudio] Preview is ready, received sections:', event.data.sections?.length || 0);
        console.log('[ThemeStudio] Current sections in ref:', sectionsRef.current.length);
        console.log('[ThemeStudio] Sections loaded flag:', sectionsLoadedRef.current);
        
        // If we have sections already loaded from API, send them to preview
        if (sectionsLoadedRef.current && sectionsRef.current.length > 0) {
          console.log('[ThemeStudio] Sending existing sections to preview');
          sendInitialSections();
        } else if (event.data.sections && event.data.sections.length > 0 && !sectionsLoadedRef.current) {
          // Only use preview sections if we haven't loaded from API yet
          console.log('[ThemeStudio] No sections loaded from API, using preview sections');
          state.setSections(event.data.sections);
          sectionsRef.current = event.data.sections;
          sectionsLoadedRef.current = true;
          
          // Initialize history with these sections
          clearHistoryRef.current(event.data.sections, 'Loaded from preview');
        }
      }
    };
    
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [state.selectedSection?.id, sendInitialSections]);

  const loadSections = useCallback(async () => {
    state.setLoading(true);
    console.log('[Theme Studio] Loading sections...');
    
    try {
      // Determine template type based on selected page
      let templateType = 'homepage';
      if (state.selectedPage === 'collection') templateType = 'collection';
      else if (state.selectedPage === 'product') templateType = 'product';
      else if (state.selectedPage === 'search') templateType = 'search';
      else if (state.selectedPage === 'account') templateType = 'account';
      else if (state.selectedPage === 'cart') templateType = 'cart';
      else if (state.selectedPage === 'login') templateType = 'login';
      else if (state.selectedPage === 'register') templateType = 'register';
      else if (state.selectedPage !== 'homepage' && pagesRef.current.find(p => p.id === state.selectedPage)) {
        templateType = 'page';
      }
      
      console.log('[Theme Studio] Template type:', templateType);
      console.log('[Theme Studio] Store subdomain:', store.subdomain);
      console.log('[Theme Studio] Fetching from:', `/api/stores/${store.subdomain}/templates/by-type/${templateType}`);

      // Load template with sections
      const response = await fetch(`/api/stores/${store.subdomain}/templates/by-type/${templateType}`, {
        credentials: 'include'
      });
      console.log('[Theme Studio] Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        const template = result.data || result; // Handle both old and new response formats
        console.log('[Theme Studio] Template loaded:', template);
        console.log('[Theme Studio] Sections in template:', template.sections?.length || 0);
        state.setCurrentTemplate(template);
        
        // Load theme settings
        try {
          const { themeSettings: settings, currentValues, savedValues } = await loadThemeSettings(store.themeCode || 'commerce', store.subdomain);
          console.log('[Theme Studio] Theme settings loaded:', { settings, currentValues, savedValues });
          
          // Merge template settings with theme settings
          const mergedSettings = {
            themeConfig: settings,
            values: template.settings || currentValues || {}
          };
          setThemeSettings(mergedSettings);
        } catch (error) {
          console.error('[Theme Studio] Failed to load theme settings:', error);
        }
        
        console.log('[Theme Studio] Checking template:', {
          hasTemplate: !!template,
          hasSections: !!template?.sections,
          isArray: Array.isArray(template?.sections),
          sectionsLength: template?.sections?.length
        });
        
        if (template && template.sections && Array.isArray(template.sections)) {
          console.log('[Theme Studio] Sections received:', template.sections);
          console.log('[Theme Studio] First section example:', template.sections[0]);
          
          // Debug container blocks
          template.sections.forEach((section: any) => {
            if (section.blocks) {
              section.blocks.forEach((block: any) => {
                const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
                if (containerTypes.includes(block.type)) {
                  console.log('[Theme Studio] Container block found:', {
                    blockId: block.id,
                    blockType: block.type,
                    hasBlocks: !!block.blocks,
                    hasSettingsBlocks: !!block.settings?.blocks,
                    blocksCount: block.blocks?.length || 0,
                    settingsBlocksCount: block.settings?.blocks?.length || 0,
                    settingsBlocks: block.settings?.blocks
                  });
                }
              });
            }
          });
          
          // Sections are now properly mapped in the API
          const sortedSections = template.sections.sort((a: Section, b: Section) => a.position - b.position);
          
          // Validate sections before setting state
          if (sortedSections.length === 0) {
            console.warn('[Theme Studio] Empty sections array received from API');
          }
          
          state.setSections(sortedSections);
          sectionsLoadedRef.current = true;
          console.log('[Theme Studio] Set sections state with:', sortedSections.length, 'sections');
          console.log('[Theme Studio] First section blocks:', sortedSections[0]?.blocks);
          
          // Initialize history with loaded sections - only if we have sections
          if (sortedSections.length > 0) {
            clearHistoryRef.current(sortedSections, 'Loaded template');
          }
          
          // Log success
          console.log('[Theme Studio] Successfully set sections in state');
          
          // State verification will happen in useEffect
        } else {
          console.log('[Theme Studio] No sections in template - condition failed');
          console.log('[Theme Studio] Template object:', JSON.stringify(template, null, 2));
          console.log('[Theme Studio] Template sections length:', template.sections?.length || 0);
          console.log('[Theme Studio] Template sections:', template.sections);
          // Don't immediately set empty sections, let's debug what's happening
          console.warn('[Theme Studio] PREVENTING SECTIONS CLEAR - this might be the issue');
          // state.setSections([]);
          sectionsLoadedRef.current = true; // Still mark as loaded to prevent infinite loops
        }
      } else if (response.status === 404) {
        // Template doesn't exist yet, create it
        const createResponse = await fetch(`/api/stores/${store.subdomain}/templates`, {
          credentials: 'include',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: templateType,
            name: templateType.replace('.', ' ').replace(/-/g, ' '),
            isDefault: true
          })
        });
        
        if (createResponse.ok) {
          const createResult = await createResponse.json();
          const newTemplate = createResult.data || createResult; // Handle both old and new response formats
          state.setCurrentTemplate(newTemplate);
          
          // Load theme settings for new template
          try {
            const { themeSettings: settings, currentValues, savedValues } = await loadThemeSettings(store.themeCode || 'commerce', store.subdomain);
            console.log('[Theme Studio] Theme settings loaded for new template:', { settings, currentValues, savedValues });
            
            // Merge template settings with theme settings
            const mergedSettings = {
              themeConfig: settings,
              values: newTemplate.settings || currentValues || {}
            };
            setThemeSettings(mergedSettings);
          } catch (error) {
            console.error('[Theme Studio] Failed to load theme settings for new template:', error);
          }
          
          // If the new template has sections (from our API enhancement), use them
          if (newTemplate && newTemplate.sections && Array.isArray(newTemplate.sections)) {
            const sortedSections = newTemplate.sections.sort((a: Section, b: Section) => a.position - b.position);
            state.setSections(sortedSections);
            sectionsLoadedRef.current = true;
            clearHistoryRef.current(sortedSections, 'Created new template');
          } else {
            console.warn('[Theme Studio] PREVENTING SECTIONS CLEAR on template creation - this might be the issue');
            console.log('[Theme Studio] New template sections:', newTemplate.sections);
            // state.setSections([]);
            sectionsLoadedRef.current = true;
            // clearHistoryRef.current([], 'Created empty template');
          }
        }
      } else {
        try {
          const errorResult = await response.json();
          const errorMessage = errorResult.error || 'Failed to load template';
          console.error('Failed to load template:', errorMessage);
          toast.error(errorMessage);
        } catch {
          const error = await response.text();
          console.error('Failed to load template:', error);
          toast.error('Failed to load template');
        }
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      toast.error('Failed to load sections');
    } finally {
      state.setLoading(false);
    }
  }, [state.selectedPage, store.id]);

  const handleAddSection = async (sectionData: any) => {
    if (!state.currentTemplate?.id) {
      toast.error('Template not loaded. Please refresh the page.');
      return;
    }
    
    try {
      // Get current sections from state, not ref
      const currentSections = state.sections;
      
      // Calculate position - use provided position or add at end
      const targetPosition = sectionData.position !== undefined ? sectionData.position : currentSections.length;
      
      // Save current state to history before change
      pushHistoryState(currentSections, 'Added section', `Adding ${sectionData.title} at position ${targetPosition + 1}`);

      // Save to server first, then update UI
      const response = await fetch(`/api/stores/${store.subdomain}/templates/${state.currentTemplate?.id}/sections`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionData,
          position: targetPosition
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const serverSection = result.data || result;
        
        // Update current sections with new section from server
        const newSections = [...currentSections];
        
        // Shift existing sections if inserting in middle
        if (targetPosition < currentSections.length) {
          newSections.forEach(section => {
            if (section.position >= targetPosition) {
              section.position += 1;
            }
          });
        }
        
        // Insert the new section
        newSections.push(serverSection);
        newSections.sort((a, b) => a.position - b.position);
        
        // Update state with server data
        state.setSections(newSections);
        
        // Send single realtime update with server data
        realtimeAddSection(serverSection);
        
        // Delay selection to ensure state is updated
        setTimeout(() => {
          state.selectSection(serverSection.id);
        }, 100);
        
        toast.success('Section added');
      } else {
        const errorText = await response.text();
        console.error('Failed to add section:', errorText);
        toast.error('Failed to add section');
      }
    } catch (error) {
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  const handleUpdateSection = useCallback(async (sectionId: string, updates: any, skipHistory = false) => {
    // Ensure updates is not undefined
    if (!updates || typeof updates !== 'object') {
      console.error('[Theme Studio] Invalid updates parameter:', updates);
      return;
    }
    
    console.log('[Theme Studio] handleUpdateSection called:', { 
      sectionId, 
      updates, 
      skipHistory,
      hasBlocks: !!updates?.blocks,
      blocksCount: updates?.blocks?.length
    });
    
    try {
      // Mark that we're updating to prevent history sync
      isUpdatingRef.current = true;
      
      // Get current sections from state, not ref (to avoid stale closure)
      const currentSections = state.sections;
      
      // Only save to history for significant changes (position, visibility, etc)
      // Skip history for text input changes to prevent history pollution
      const isTextChange = updates.settings && Object.keys(updates).length === 1;
      const isTextUpdateOnly = skipHistory || isTextChange;
      
      if (!skipHistory && !isTextChange) {
        const section = currentSections.find(s => s.id === sectionId);
        const action = updates.enabled !== undefined ? 
          (updates.enabled ? 'Showed section' : 'Hid section') : 
          'Updated section';
        const details = section ? `${section.title || section.type}` : 'Section';
        pushHistoryState(currentSections, action, details);
      }
      
      // Check if there are actual changes
      const currentSection = currentSections.find(s => s.id === sectionId);
      if (!currentSection) {
        console.log('[Theme Studio] Section not found:', sectionId);
        isUpdatingRef.current = false;
        return;
      }
      
      // Deep compare to check if updates are needed
      const hasChanges = JSON.stringify(currentSection.settings) !== JSON.stringify(updates.settings) ||
                        currentSection.enabled !== updates.enabled ||
                        currentSection.position !== updates.position ||
                        updates.blocks !== undefined; // Always process block updates
      
      if (!hasChanges) {
        console.log('[Theme Studio] No changes detected, skipping update');
        isUpdatingRef.current = false;
        return;
      }
      
      // Store current block selection before update
      const currentBlockId = state.selectedBlockId;
      const preserveView = updates._preserveInspectorView;
      
      // Remove internal flag before processing
      const cleanUpdates = { ...updates };
      delete cleanUpdates._preserveInspectorView;
      
      // Use the state hook's updateSectionInState which properly handles both sections and selectedSection
      state.updateSectionInState(sectionId, cleanUpdates);
      
      // Only restore block selection if it's a settings-only update
      // This prevents unwanted view changes when user is editing section settings
      if (preserveView && state.selectedSection?.id === sectionId) {
        // Don't change any selection - user is editing section settings
        console.log('[Theme Studio] Preserving inspector view - section settings update');
      } else if (state.selectedSection?.id === sectionId && currentBlockId && !updates.blocks) {
        // Restore block selection for other updates if needed
        setTimeout(() => {
          state.setSelectedBlockId(currentBlockId);
        }, 0);
      }
      
      // Mark as having changes for the publish button
      state.setIsDraft(true);
      
      // Send realtime update instead of full refresh
      console.log('[Theme Studio] Sending realtime section update');
      realtimeUpdateSection(sectionId, updates);
      
      // Reset update flag after state is set
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
      
      // Save to server in background
      
      const response = await fetch(`/api/stores/${store.subdomain}/templates/${state.currentTemplate?.id}/sections/${sectionId}`, {
        credentials: 'include',
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Theme Studio] Server error:', response.status, errorText);
        // Rollback on error - use current state sections
        state.setSections(currentSections);
        toast.error('Failed to update section');
      } else {
        // Use server response to ensure nested blocks structure is preserved
        const updateResult = await response.json();
        const updatedSection = updateResult.data || updateResult;
        console.log('[Theme Studio] Server response for section update:', {
          sectionId: updatedSection.id,
          blocksCount: updatedSection.blocks?.length,
          blocks: updatedSection.blocks?.map((b: any) => ({
            id: b.id,
            type: b.type,
            hasNestedBlocks: !!b.blocks,
            nestedBlocksCount: b.blocks?.length || 0,
            hasSettingsBlocks: !!b.settings?.blocks,
            settingsBlocksCount: b.settings?.blocks?.length || 0
          }))
        });
        
        // Update state with server response to ensure consistency
        const sectionsWithServerUpdate = currentSections.map(section => 
          section.id === sectionId ? {
            ...section,
            ...updatedSection,
            // Ensure blocks array is properly structured
            blocks: updatedSection.blocks || []
          } : section
        );
        
        state.setSections(sectionsWithServerUpdate);
        
        // Also update selected section if it's the one being updated
        if (state.selectedSection?.id === sectionId) {
          // Store current block selection
          const currentBlockId = state.selectedBlockId;
          
          state.setSelectedSection({
            ...state.selectedSection,
            ...updatedSection,
            blocks: updatedSection.blocks || []
          });
          
          // Restore block selection after section update
          if (currentBlockId) {
            setTimeout(() => {
              state.setSelectedBlockId(currentBlockId);
            }, 0);
          }
        }
        
        // Send realtime update with server response to ensure preview is in sync
        if (updates.blocks) {
          console.log('[Theme Studio] Sending realtime update with server response blocks');
          realtimeUpdateSection(sectionId, {
            ...updates,
            blocks: updatedSection.blocks || []
          });
        }
      }
    } catch (error) {
      console.error('[Theme Studio] Update error:', error);
      // Rollback on error - use current state sections
      state.setSections(state.sections);
      toast.error('Failed to update section');
    } finally {
      // Ensure flag is reset
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [pushHistoryState, realtimeUpdateSection, store.id, state.currentTemplate?.id, state.sections, state.updateSectionInState, state.setIsDraft]);

  const handleToggleVisibility = async (sectionId: string, enabled: boolean) => {
    await handleUpdateSection(sectionId, { enabled });
  };

  const handleDuplicateSection = async (section: Section) => {
    const duplicatedSection = {
      type: section.sectionType || section.type,
      title: `${section.title} (Copy)`,
      settings: { ...section.settings }
    };
    await handleAddSection(duplicatedSection);
  };

  const handleDeleteSection = async (sectionId: string) => {
    // Direct delete - confirmation is now handled in sidebar
    await performDeleteSection(sectionId);
  };

  const performDeleteSection = async (sectionId: string) => {
    try {
      // Get current sections from state, not ref
      const currentSections = state.sections;
      
      // Save current state to history before change
      const sectionToDelete = currentSections.find(s => s.id === sectionId);
      pushHistoryState(
        currentSections, 
        'Deleted section', 
        sectionToDelete ? `Deleted ${sectionToDelete.title || sectionToDelete.type}` : 'Deleted section'
      );
      
      // Delete from server first
      const response = await fetch(`/api/stores/${store.subdomain}/templates/${state.currentTemplate?.id}/sections/${sectionId}`, {
        credentials: 'include',
        method: 'DELETE',
      });

      if (response.ok) {
        const deleteResult = await response.json();
        console.log('[Theme Studio] Section delete response:', deleteResult);
        
        // Update UI after successful deletion
        const deletedSection = currentSections.find(s => s.id === sectionId);
        const filteredSections = currentSections.filter(section => section.id !== sectionId);
        
        // Reorder positions after deletion
        if (deletedSection) {
          filteredSections.forEach(section => {
            if (section.position > deletedSection.position) {
              section.position -= 1;
            }
          });
        }
        
        // Ensure positions are sequential
        filteredSections.forEach((section, index) => {
          section.position = index;
        });
        
        console.log('[Theme Studio] Section delete - updating state:', {
          currentLength: state.sections.length,
          newLength: filteredSections.length,
          deletedSectionId: sectionId
        });
        state.setSections(filteredSections);
        
        if (state.selectedSection?.id === sectionId) {
          state.setSelectedSection(null);
        }
        console.log('[Theme Studio] Section delete - state updated, new length:', state.sections.length);
        
        // Send realtime update after successful deletion
        console.log('[Theme Studio] Sending realtime delete for section');
        realtimeDeleteSection(sectionId);
        
        // Show success toast with undo option
        toast.success(`"${deletedSection?.title || 'Section'}" section deleted`, {
          action: {
            label: 'Undo',
            onClick: () => {
              // Add the section back using history
              if (canUndo) {
                undo();
                toast.success('Section restored');
              }
            },
          },
          duration: 5000, // Give user time to undo
        });
      } else {
        const errorText = await response.text();
        console.error('[Theme Studio] Delete error:', errorText);
        
        let errorMessage = 'Failed to delete section';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (e) {
          // If it's not JSON, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete section');
    }
  };

  // Block management functions
  const handleAddBlock = async (sectionId: string, blockType: string) => {
    try {
      const targetSection = state.sections.find(s => s.id === sectionId);
      if (!targetSection) {
        toast.error('Section not found');
        return;
      }

      console.log('Adding block:', { sectionId, blockType, subdomain: store.subdomain });
      console.log('Target section before update:', targetSection);
      console.log('Current sections before update:', state.sections.length);

      // Get default settings for the block type
      const blockSettings = getSimplifiedBlockSettings(blockType);
      const defaultSettings: any = {};
      
      // Extract default values from the settings schema
      if (blockSettings?.sections) {
        blockSettings.sections.forEach(section => {
          section.settings.forEach(setting => {
            if (setting.default !== undefined) {
              defaultSettings[setting.id] = setting.default;
            }
          });
        });
      }
      
      // For temporary sections, just add to local state
      if (sectionId.startsWith('temp-')) {
        const newBlock = {
          id: Math.random().toString(36).substr(2, 9),
          type: blockType,
          position: (targetSection.blocks?.length || 0),
          enabled: true,
          settings: defaultSettings
        };

        // Check if this is a product section and needs special handling
        let updatedBlocks: any[];
        if (targetSection.sectionType === 'product') {
          const { containerId } = getProductBlockTargetContainer(targetSection.blocks || [], blockType);
          updatedBlocks = addBlockToProductSection(targetSection.blocks || [], newBlock, containerId);
        } else {
          updatedBlocks = [...(targetSection.blocks || []), newBlock];
        }

        // Update section with new block
        const updatedSections = state.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              blocks: updatedBlocks
            };
          }
          return section;
        });

        state.setSections(updatedSections);
        
        // Update selected section if it's the one being modified
        if (state.selectedSection?.id === sectionId) {
          const updatedSection = updatedSections.find(s => s.id === sectionId);
          if (updatedSection) {
            state.setSelectedSection(updatedSection);
          }
        }
        
        // Temporary section block added successfully
        console.log('Temporary section block added successfully');
        
        state.setSelectedBlockId(newBlock.id);
        
        // Send realtime add to preview
        realtimeAddBlock(sectionId, newBlock);
        
        toast.success(`${blockType} block added`);
        return;
      }

      // Show loading state instead of optimistic update to prevent conflicts
      console.log('Starting block creation process...');

      // For real sections, save to backend
      try {
        const apiUrl = `/api/stores/${store.subdomain}/sections/${sectionId}/blocks`;
        console.log('Making API call to:', apiUrl);
        
        const response = await fetch(apiUrl, {
          credentials: 'include',
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            type: blockType,
            position: (targetSection.blocks?.length || 0)
          })
        });

        if (!response.ok) {
          // No optimistic update to rollback - just show error
          console.error('Block creation failed:', response.status);
          
          let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
          try {
            const errorText = await response.text();
            if (errorText) {
              try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error || errorMessage;
              } catch (e) {
                errorMessage = errorText;
              }
            }
          } catch (e) {
            console.error('Could not read error response');
          }
          throw new Error(errorMessage);
        }

        const blockResult = await response.json();
        const serverBlock = blockResult.data || blockResult;
        console.log('Block successfully added via API:', serverBlock);

        // Add server block to current sections (no optimistic update to replace)
        const finalSections = state.sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              blocks: [...(section.blocks || []), serverBlock]
            };
          }
          return section;
        });

        state.setSections(finalSections);
        console.log('Sections updated with server block:', finalSections.find(s => s.id === sectionId)?.blocks?.length);
        
        // Update selected section if it's the one being modified
        if (state.selectedSection?.id === sectionId) {
          const updatedSection = finalSections.find(s => s.id === sectionId);
          if (updatedSection) {
            state.setSelectedSection(updatedSection);
          }
        }
        
        // Server block successfully integrated - React will handle re-renders
        console.log('Server block integrated successfully');
        
        state.setSelectedBlockId(serverBlock.id);
        
        // Send realtime add to preview
        console.log('[Theme Studio] Sending realtime block add to preview');
        realtimeAddBlock(sectionId, serverBlock);
        
        toast.success(`${blockType} block added`);
      } catch (apiError) {
        console.error('Failed to add block to backend:', apiError);
        
        // No optimistic update to rollback - just show error message
        console.error('Block creation failed - no changes to revert');
        
        toast.error(`Failed to add block: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding block:', error);
      toast.error('Failed to add block');
    }
  };

  const handleUpdateBlock = async (sectionId: string, blockId: string, updates: any) => {
    console.log('HandleUpdateBlock called:', { sectionId, blockId, updates });
    
    try {
      // Check if we have a current template
      if (!state.currentTemplate?.id) {
        console.error('[Theme Studio] No template loaded - cannot update block');
        toast.error('Please wait for the template to load');
        return;
      }
      
      // Find the block to get its type
      let blockType: string | undefined;
      const findBlockType = (blocks: any[]): string | undefined => {
        for (const block of blocks) {
          if (block.id === blockId) {
            return block.type;
          }
          if (block.settings?.blocks) {
            const found = findBlockType(block.settings.blocks);
            if (found) return found;
          }
        }
        return undefined;
      };
      
      const section = state.sections.find(s => s.id === sectionId);
      if (section) {
        blockType = findBlockType(section.blocks || []);
      }
      
      // Check if this is a product-gallery block and mainImageAspectRatio is being changed
      if (blockType === 'product-gallery' && updates.settings?.mainImageAspectRatio) {
        console.log('[Theme Studio] Product gallery aspect ratio changed, syncing to cart settings');
        
        // Update cart theme settings
        const newAspectRatio = updates.settings.mainImageAspectRatio;
        
        // Send message to theme inspector to update cart settings
        window.postMessage({
          type: 'THEME_SETTINGS_UPDATE_FROM_BLOCK',
          settings: {
            'cart.imageAspectRatio': newAspectRatio
          }
        }, '*');
        
        // Also update via API if we have a template ID
        if (state.currentTemplate?.id) {
          try {
            // First fetch the current template to get its settings
            const templateResponse = await fetch(`/api/stores/${store.subdomain}/templates/${state.currentTemplate.id}`);
            const templateResult = await templateResponse.json();
            const currentTemplate = templateResult.data || templateResult;
            
            const currentSettings = currentTemplate.settings || {};
            const updatedSettings = {
              ...currentSettings,
              'cart.imageAspectRatio': newAspectRatio
            };
            
            await fetch(`/api/stores/${store.subdomain}/templates/${state.currentTemplate.id}`, {
              credentials: 'include',
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: currentTemplate.name,
                settings: updatedSettings,
                isDefault: currentTemplate.isDefault
              })
            });
            
            console.log('[Theme Studio] Cart aspect ratio synced with product gallery');
          } catch (error) {
            console.error('[Theme Studio] Failed to sync cart aspect ratio:', error);
          }
        }
      }
      // Helper function to update nested blocks in containers
      const updateBlockInStructure = (blocks: any[]): any[] => {
        return blocks.map(block => {
          // Direct match
          if (block.id === blockId) {
            // Special handling for product-gallery to clean up old aspectRatio field
            if (block.type === 'product-gallery' && updates.settings) {
              const cleanedSettings = { ...updates.settings };
              // Remove old aspectRatio field if mainImageAspectRatio is being set
              if ('mainImageAspectRatio' in cleanedSettings && 'aspectRatio' in cleanedSettings) {
                delete cleanedSettings.aspectRatio;
              }
              return { ...block, ...updates, settings: cleanedSettings };
            }
            return { ...block, ...updates };
          }
          
          // Check if this is a container with nested blocks
          const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
          if (containerTypes.includes(block.type) && block.settings?.blocks) {
            const updatedNestedBlocks = updateBlockInStructure(block.settings.blocks);
            return {
              ...block,
              settings: {
                ...block.settings,
                blocks: updatedNestedBlocks
              }
            };
          }
          
          return block;
        });
      };
      
      const updatedSections = state.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            blocks: updateBlockInStructure(section.blocks || [])
          };
        }
        return section;
      });

      console.log('Updating sections state with block changes');
      state.setSections(updatedSections);
      
      // Mark as having changes for the publish button
      state.setIsDraft(true);
      
      // Update selected section if it's the one containing the modified block
      if (state.selectedSection?.id === sectionId) {
        const updatedSection = updatedSections.find(s => s.id === sectionId);
        if (updatedSection) {
          state.setSelectedSection(updatedSection);
        }
      }
      
      // Send realtime update instead of full refresh
      console.log('[Theme Studio] Sending realtime block update');
      console.log('[Theme Studio] ContentWindow available:', !!getContentWindow());
      
      // Find the updated block to send the complete block data
      let updatedBlock: any = null;
      const findUpdatedBlock = (blocks: any[]): any => {
        for (const block of blocks) {
          if (block.id === blockId) {
            return block;
          }
          if (block.settings?.blocks) {
            const found = findUpdatedBlock(block.settings.blocks);
            if (found) return found;
          }
        }
        return null;
      };
      
      const updatedSection = updatedSections.find(s => s.id === sectionId);
      if (updatedSection) {
        updatedBlock = findUpdatedBlock(updatedSection.blocks || []);
      }
      
      console.log('[Theme Studio] Sending updated block:', updatedBlock);
      realtimeUpdateBlock(sectionId, blockId, updatedBlock);
      
      // For non-temporary sections, save to backend
      if (!sectionId.startsWith('temp-')) {
        console.log('Saving block update to backend');
        console.log('[Theme Studio] Current state sections:', state.sections.map(s => ({ id: s.id, blocksCount: s.blocks?.length })));
        console.log('[Theme Studio] Looking for section with ID:', sectionId);
        console.log('[Theme Studio] Block to update:', { blockId, blockType, updates });
        
        // Check if this is a nested block by looking at the current state
        // A block is nested if it's inside a container block's settings.blocks array
        const section = state.sections.find(s => s.id === sectionId);
        console.log('[Theme Studio] Found section:', { 
          sectionId, 
          found: !!section, 
          blocksInSection: section?.blocks?.length,
          blocks: section?.blocks?.map(b => ({ 
            id: b.id, 
            type: b.type, 
            hasNestedBlocks: !!(b.settings?.blocks || b.blocks),
            nestedCount: (b.settings?.blocks || b.blocks || []).length
          }))
        });
        
        let isActuallyNested = false;
        let parentContainerId: string | null = null;
        
        // Search through all blocks in the section to find if this block is nested
        if (section?.blocks) {
          console.log('[Theme Studio] Searching for nested block in section blocks:', {
            sectionId,
            totalBlocks: section.blocks.length,
            blockIdToFind: blockId
          });
          
          for (const block of section.blocks) {
            const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
            if (containerTypes.includes(block.type)) {
              // Check both block.blocks and block.settings.blocks
              const nestedBlocks = block.blocks || block.settings?.blocks || [];
              console.log('[Theme Studio] Checking container:', {
                containerId: block.id,
                containerType: block.type,
                hasDirectBlocks: !!block.blocks,
                hasSettingsBlocks: !!block.settings?.blocks,
                nestedBlocksCount: nestedBlocks.length,
                nestedBlockIds: nestedBlocks.map((nb: any) => nb.id)
              });
              
              if (Array.isArray(nestedBlocks) && nestedBlocks.length > 0) {
                const isInThisContainer = nestedBlocks.some((nb: any) => nb.id === blockId);
                if (isInThisContainer) {
                  isActuallyNested = true;
                  parentContainerId = block.id;
                  console.log('[Theme Studio] Found nested block in container:', {
                    blockId,
                    parentContainerId,
                    containerType: block.type
                  });
                  break;
                }
              }
            }
          }
        }
        
        console.log('[Theme Studio] Block update details:', {
          blockId,
          sectionId,
          blockType,
          isActuallyNested,
          parentContainerId,
          subdomain: store.subdomain,
          templateId: state.currentTemplate?.id
        });
        
        const shouldTreatAsNested = isActuallyNested;
        
        // For nested blocks, we need to update the parent container block
        if (shouldTreatAsNested && parentContainerId) {
          // Use the parent container we already found
          const containerBlock = section?.blocks?.find(b => b.id === parentContainerId);
          console.log('[Theme Studio] Using parent container:', {
            containerId: parentContainerId,
            containerFound: !!containerBlock,
            containerType: containerBlock?.type
          });
          
          if (containerBlock) {
            // Get nested blocks from either location
            const nestedBlocks = containerBlock.blocks || containerBlock.settings?.blocks || [];
            console.log('[Theme Studio] Found parent container:', {
              containerId: containerBlock.id,
              containerType: containerBlock.type,
              hasDirectBlocks: !!containerBlock.blocks,
              hasSettingsBlocks: !!containerBlock.settings?.blocks,
              nestedBlocksCount: nestedBlocks.length
            });
            // Update the container block's settings
            const updatedContainerSettings = {
              ...containerBlock.settings,
              blocks: nestedBlocks.map((nb: any) => 
                nb.id === blockId ? updatedBlock : nb
              )
            };
            
            // Check if we have a template ID
            if (!state.currentTemplate?.id) {
              console.error('[Theme Studio] No current template ID available for container update');
              toast.error('Template not loaded. Please refresh the page.');
              return;
            }
            
            const apiUrl = `/api/stores/${store.subdomain}/templates/${state.currentTemplate.id}/sections/${sectionId}/blocks/${containerBlock.id}`;
            console.log('[Theme Studio] Updating container block:', apiUrl);
            
            try {
              const response = await fetch(apiUrl, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: updatedContainerSettings })
              });
              
              if (!response.ok) {
                throw new Error(`Container update failed: ${response.status}`);
              }
              
              console.log('Container block successfully updated');
              return;
            } catch (error) {
              console.error('Failed to update container block:', error);
              toast.error('Failed to save block changes');
              return;
            }
          } else {
            console.warn('[Theme Studio] Container block not found for nested block:', blockId);
          }
        }
        
        // Check if we have a template ID
        if (!state.currentTemplate?.id) {
          console.error('[Theme Studio] No current template ID available');
          toast.error('Template not loaded. Please refresh the page.');
          return;
        }
        
        // Always use template-based API endpoint since we checked for template above
        const apiUrl = `/api/stores/${store.subdomain}/templates/${state.currentTemplate.id}/sections/${sectionId}/blocks/${blockId}`;
        console.log('[Theme Studio] Block update API URL:', apiUrl);
        console.log('[Theme Studio] Block update context:', {
          subdomain: store.subdomain,
          templateId: state.currentTemplate.id,
          sectionId: sectionId,
          blockId: blockId,
          blockType: blockType,
          updates: updates,
          isActuallyNested: isActuallyNested,
          parentContainerId: parentContainerId
        });
        
        // Clean up product-gallery settings before sending to API
        let cleanedUpdates = updates;
        if (blockType === 'product-gallery' && updates.settings) {
          const cleanedSettings = { ...updates.settings };
          // Remove old aspectRatio field if mainImageAspectRatio is being set
          if ('mainImageAspectRatio' in cleanedSettings && 'aspectRatio' in cleanedSettings) {
            delete cleanedSettings.aspectRatio;
          }
          cleanedUpdates = { ...updates, settings: cleanedSettings };
        }
        
        console.log('[Theme Studio] Block update data:', cleanedUpdates);
        try {
          const response = await fetch(apiUrl, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanedUpdates)
          });

          if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = errorText;
            }
            console.error('[Theme Studio] Block update API error:', 
              'Status:', response.status,
              'StatusText:', response.statusText,
              'ErrorText:', errorText,
              'ErrorData:', errorData,
              'URL:', apiUrl,
              'BlockId:', blockId,
              'SectionId:', sectionId,
              'TemplateId:', state.currentTemplate?.id
            );
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
          }

          const updateBlockResult = await response.json();
          const updatedBlock = updateBlockResult.data || updateBlockResult;
          console.log('Block successfully updated via API:', updatedBlock);
        } catch (apiError) {
          console.error('Failed to save block to backend:', apiError);
          toast.error('Failed to save block changes');
        }
      }
    } catch (error) {
      console.error('Error updating block:', error);
      toast.error('Failed to update block');
    }
  };

  const handleDeleteBlock = async (sectionId: string, blockId: string) => {
    // Find the block type for the undo toast
    const currentSection = state.sections.find(s => s.id === sectionId);
    let blockToDelete = currentSection?.blocks?.find(b => b.id === blockId);
    let blockType = blockToDelete?.type;
    
    // If not found as direct block, check if it's nested inside a container
    if (!blockToDelete && currentSection?.blocks) {
      for (const block of currentSection.blocks) {
        const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
        if (containerTypes.includes(block.type) && block.settings?.blocks && Array.isArray(block.settings.blocks)) {
          const nestedBlock = block.settings.blocks.find((nb: any) => nb.id === blockId);
          if (nestedBlock) {
            blockToDelete = nestedBlock;
            blockType = nestedBlock.type;
            break;
          }
        }
      }
    }
    
    if (!blockToDelete) {
      console.log('Block already deleted or does not exist:', blockId);
      return;
    }
    
    // Direct delete - confirmation is now handled in sidebar
    await performDeleteBlock(sectionId, blockId, blockType || 'block');
  };

  const performDeleteBlock = async (sectionId: string, blockId: string, blockType: string) => {
    try {
      console.log('Deleting block:', { sectionId, blockId });

      // Check if block exists to prevent duplicate deletes
      const currentSection = state.sections.find(s => s.id === sectionId);
      let blockExists = currentSection?.blocks?.some(b => b.id === blockId);
      
      // If not found as direct block, check if it's nested inside a container
      let isNestedBlock = false;
      let parentContainerId: string | null = null;
      let parentContainer: any = null;
      
      if (!blockExists && currentSection?.blocks) {
        for (const block of currentSection.blocks) {
          const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
          if (containerTypes.includes(block.type) && block.settings?.blocks && Array.isArray(block.settings.blocks)) {
            const hasBlock = block.settings.blocks.some((nb: any) => nb.id === blockId);
            if (hasBlock) {
              isNestedBlock = true;
              parentContainerId = block.id;
              parentContainer = block;
              blockExists = true;
              break;
            }
          }
        }
      }
      
      if (!blockExists) {
        console.log('Block already deleted or does not exist:', blockId);
        return;
      }

      console.log('Starting block deletion process...', {
        isNestedBlock,
        parentContainerId,
        parentContainerType: parentContainer?.type
      });

      // For temporary sections, just remove from local state
      if (sectionId.startsWith('temp-')) {
        const updatedSections = state.sections.map(section => {
          if (section.id === sectionId) {
            if (isNestedBlock && parentContainer) {
              // Remove from parent container's nested blocks
              const updatedBlocks = section.blocks?.map(block => {
                if (block.id === parentContainerId && block.settings?.blocks) {
                  return {
                    ...block,
                    settings: {
                      ...block.settings,
                      blocks: block.settings.blocks.filter((nb: any) => nb.id !== blockId)
                    }
                  };
                }
                return block;
              });
              return {
                ...section,
                blocks: updatedBlocks
              };
            } else {
              // Remove direct block
              return {
                ...section,
                blocks: section.blocks?.filter(block => block.id !== blockId)
              };
            }
          }
          return section;
        });
        
        state.setSections(updatedSections);
        
        // Update selected section if it's the one being modified
        if (state.selectedSection?.id === sectionId) {
          const updatedSection = updatedSections.find(s => s.id === sectionId);
          if (updatedSection) {
            state.setSelectedSection(updatedSection);
          }
        }
        
        if (state.selectedBlockId === blockId) {
          state.setSelectedBlockId(null);
        }
        
        // Send realtime delete to preview
        console.log('[Theme Studio] Sending realtime block delete to preview');
        realtimeDeleteBlock(sectionId, blockId);
        
        // Show success toast with undo option
        toast.success(`${blockType} block deleted`, {
          action: {
            label: 'Undo',
            onClick: () => {
              if (canUndo) {
                undo();
                toast.success('Block restored');
              }
            },
          },
          duration: 5000,
        });
        return;
      }

      // For real sections, save to backend
      if (!state.currentTemplate?.id) {
        console.error('[Theme Studio] No current template ID for delete operation');
        toast.error('Failed to delete block: No template selected');
        return;
      }
      
      try {
        const apiUrl = `/api/stores/${store.subdomain}/templates/${state.currentTemplate.id}/sections/${sectionId}/blocks/${blockId}`;
        console.log('[Theme Studio] Delete block API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
          credentials: 'include',
          method: 'DELETE'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[Theme Studio] Block delete API error:', 
            '\nStatus:', response.status,
            '\nStatus Text:', response.statusText,
            '\nError Text:', errorText,
            '\nURL:', apiUrl
          );
          
          // Try to parse error as JSON if possible
          let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error) {
              errorMessage = errorJson.error;
            }
          } catch (e) {
            // If not JSON, use the text as is
            if (errorText) {
              errorMessage = errorText;
            }
          }
          
          throw new Error(errorMessage);
        }

        const deleteBlockResult = await response.json();
        console.log('Block successfully deleted via API:', deleteBlockResult);
        
        // Update local state after successful API call
        const updatedSections = state.sections.map(section => {
          if (section.id === sectionId) {
            if (isNestedBlock && parentContainer) {
              // Remove from parent container's nested blocks
              const updatedBlocks = section.blocks?.map(block => {
                if (block.id === parentContainerId && block.settings?.blocks) {
                  return {
                    ...block,
                    settings: {
                      ...block.settings,
                      blocks: block.settings.blocks.filter((nb: any) => nb.id !== blockId)
                    }
                  };
                }
                return block;
              });
              return {
                ...section,
                blocks: updatedBlocks
              };
            } else {
              // Remove direct block
              return {
                ...section,
                blocks: section.blocks?.filter(block => block.id !== blockId)
              };
            }
          }
          return section;
        });
        
        state.setSections(updatedSections);
        
        // Update selected section if it's the one being modified
        if (state.selectedSection?.id === sectionId) {
          const updatedSection = updatedSections.find(s => s.id === sectionId);
          if (updatedSection) {
            state.setSelectedSection(updatedSection);
          }
        }
        
        if (state.selectedBlockId === blockId) {
          state.setSelectedBlockId(null);
        }
        
        // Send realtime delete to preview after successful deletion
        console.log('[Theme Studio] Sending realtime block delete to preview');
        realtimeDeleteBlock(sectionId, blockId);
        
        // Show success toast with undo option
        toast.success(`${blockType} block deleted`, {
          action: {
            label: 'Undo',
            onClick: () => {
              // Restore using history
              if (canUndo) {
                undo();
                toast.success('Block restored');
              }
            },
          },
          duration: 5000,
        });
        
      } catch (apiError) {
        console.error('Failed to delete block from backend:', apiError);
        
        // Rollback optimistic update on error
        const rollbackSections = state.sections.map(section => {
          if (section.id === sectionId) {
            const blockToRestore = currentSection?.blocks?.find(b => b.id === blockId);
            if (blockToRestore) {
              return {
                ...section,
                blocks: [...(section.blocks || []), blockToRestore].sort((a, b) => a.position - b.position)
              };
            }
          }
          return section;
        });
        
        state.setSections(rollbackSections);
        
        // Show more specific error message
        const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to delete block';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error deleting block:', error);
      toast.error('Failed to delete block');
    }
  };

  const handleSelectBlock = useCallback((blockId: string | null) => {
    console.log('[handleSelectBlock] Selecting block:', blockId);
    state.setSelectedBlockId(blockId);
    
    // If selecting a block (not clearing selection), ensure the section is also selected
    if (blockId) {
      // Helper function to search for blocks recursively
      const findBlockInSection = (blocks: any[]): boolean => {
        for (const block of blocks) {
          if (block.id === blockId) {
            return true;
          }
          // Check in container blocks
          const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
          if (containerTypes.includes(block.type) && (block.blocks || block.settings?.blocks)) {
            const nestedBlocks = block.blocks || block.settings?.blocks || [];
            if (findBlockInSection(nestedBlocks)) {
              return true;
          }
        }
      }
      return false;
    };
    
    // Find and select the section that contains this block
    const sectionWithBlock = state.sections.find(section => 
      section.blocks && findBlockInSection(section.blocks)
    );
    
      if (sectionWithBlock) {
        console.log('[handleSelectBlock] Found section containing block:', sectionWithBlock.id);
        state.setSelectedSection(sectionWithBlock);
      }
    }
  }, [state]);

  const handleReorderBlocks = useCallback(async (sectionId: string, blockIds: string[]) => {
    // Save original state for rollback
    const originalSections = state.sections;
    
    try {
      console.log('[handleReorderBlocks] Starting reorder:', { sectionId, blockIds });
      console.log('[handleReorderBlocks] Original sections count:', originalSections.length);
      
      // Update local state immediately for optimistic UI
      const updatedSections = state.sections.map((section: any) => {
          if (section.id === sectionId) {
            const blockMap = new Map(section.blocks?.map((b: any) => [b.id, b]));
            const reorderedBlocks = blockIds.map((id, index) => {
              const block = blockMap.get(id);
              return block ? { ...block, position: index } : null;
            }).filter(Boolean);
            
            console.log('[handleReorderBlocks] Reordered blocks:', reorderedBlocks.length);
            
            return {
              ...section,
              blocks: reorderedBlocks
            };
          }
          return section;
        });
      
      console.log('[handleReorderBlocks] Updated sections count:', updatedSections.length);
      console.log('[handleReorderBlocks] About to call setSections');
      
      state.setSections(updatedSections);
      
      // Update selected section if it's the one being modified
      if (state.selectedSection?.id === sectionId) {
        const updatedSection = updatedSections.find(s => s.id === sectionId);
        if (updatedSection) {
          state.setSelectedSection(updatedSection);
        }
      }
      
      console.log('[handleReorderBlocks] setSections called successfully');
      
      // Send realtime reorder
      realtimeReorderBlocks(sectionId, blockIds);
      
      // Save to backend if not temporary section
      if (!sectionId.startsWith('temp-')) {
        const response = await fetch(`/api/stores/${store.subdomain}/sections/${sectionId}/blocks`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blockIds }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder blocks: ${response.statusText}`);
        }
        
        toast.success('Blocks reordered');
      }
    } catch (error) {
      console.error('[handleReorderBlocks] Failed to reorder blocks:', error);
      console.log('[handleReorderBlocks] Rolling back to original state');
      console.log('[handleReorderBlocks] Original sections count for rollback:', originalSections.length);
      // Rollback to original state on error
      state.setSections(originalSections);
      toast.error('Failed to reorder blocks');
    }
  }, [store.subdomain, state.sections, state.setSections, realtimeReorderBlocks]);

  // Section drag and drop handlers
  const handleSectionDragStart = (event: DragStartEvent) => {
    console.log('[DRAG] Section drag started:', event.active.id);
    const section = sectionsRef.current.find(s => s.id === event.active.id);
    state.setDraggedSection(section || null);
  };

  const handleSectionDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('[DRAG] Section drag ended:', { activeId: active.id, overId: over?.id });
    state.setDraggedSection(null);

    if (!over || active.id === over.id) {
      console.log('[DRAG] No drag action needed');
      return;
    }

    const activeIndex = state.sections.findIndex(section => section.id === active.id);
    const overIndex = state.sections.findIndex(section => section.id === over.id);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    try {
      // Optimistic update for smooth UX
      const reorderedSections = arrayMove(state.sections, activeIndex, overIndex).map((section, index) => ({
        ...section,
        position: index
      }));

      state.setSections(reorderedSections);
      
      // Add to history
      pushHistoryState(state.sections, 'Reordered sections', 'Sections reordered');
      
      // Send realtime update
      realtimeReorderSections(reorderedSections);

      // Update each section's position individually
      const updatePromises = reorderedSections.map(section => 
        fetch(`/api/stores/${store.subdomain}/sections/${section.id}`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            position: section.position
          }),
        })
      );

      const results = await Promise.all(updatePromises);
      
      if (results.some(r => !r.ok)) {
        // Rollback on error
        state.setSections(state.sections);
        toast.error('Failed to reorder sections');
      } else {
        toast.success('Sections reordered');
      }
    } catch (error) {
      console.error('Error reordering sections:', error);
      // Rollback on error
      state.setSections(state.sections);
      toast.error('Failed to reorder sections');
    }
  }, [state.sections, pushHistoryState, realtimeReorderSections, store.subdomain]);


  const handleSaveDraft = useCallback(async () => {
    state.setSaving(true);
    try {
      // Helper function to save blocks recursively
      const saveBlocks = async (sectionId: string, blocks: any[]) => {
        for (const block of blocks) {
          // Save the block
          await fetch(`/api/stores/${store.subdomain}/sections/${sectionId}/blocks/${block.id}`, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: block.settings,
              enabled: block.enabled,
              position: block.position
            }),
          });
          
          // If it's a container with nested blocks, save those too
          if (block.type === 'container' && block.settings?.blocks) {
            await saveBlocks(sectionId, block.settings.blocks);
          }
        }
      };

      // Save all sections and their blocks as draft
      await Promise.all(
        sectionsRef.current.map(async section => {
          // Save section
          await fetch(`/api/stores/${store.subdomain}/sections/${section.id}`, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: section.settings,
              enabled: section.enabled,
              position: section.position,
              isDraft: true
            }),
          });
          
          // Save blocks
          if (section.blocks && section.blocks.length > 0) {
            await saveBlocks(section.id, section.blocks);
          }
        })
      );

      state.updateLastSaved();
      clearHistoryRef.current(sectionsRef.current, 'Saved draft'); // Reset history after successful save
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    } finally {
      state.setSaving(false);
    }
  }, [store.subdomain]);

  const handlePublish = useCallback(async () => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to publish these changes? This will make them live on your website.')) {
      return;
    }
    
    state.setIsPublishing(true);
    try {
      // Helper function to save blocks recursively
      const saveBlocks = async (sectionId: string, blocks: any[]) => {
        for (const block of blocks) {
          // Save the block
          await fetch(`/api/stores/${store.subdomain}/sections/${sectionId}/blocks/${block.id}`, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: block.settings,
              enabled: block.enabled,
              position: block.position
            }),
          });
          
          // If it's a container with nested blocks, save those too
          if (block.type === 'container' && block.settings?.blocks) {
            await saveBlocks(sectionId, block.settings.blocks);
          }
        }
      };

      // Publish all sections and their blocks
      await Promise.all(
        sectionsRef.current.map(async section => {
          // Save section
          await fetch(`/api/stores/${store.subdomain}/sections/${section.id}`, {
            credentials: 'include',
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: section.settings,
              enabled: section.enabled,
              position: section.position,
              isDraft: false
            }),
          });
          
          // Save blocks
          if (section.blocks && section.blocks.length > 0) {
            await saveBlocks(section.id, section.blocks);
          }
        })
      );

      // Save theme settings if they exist
      if (themeInspectorRef.current) {
        try {
          await themeInspectorRef.current.saveSettings();
        } catch (error) {
          console.error('Failed to save theme settings during publish:', error);
          // Don't fail the entire publish operation if theme settings fail
        }
      }

      // Update store's theme code
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/theme`, {
          credentials: 'include',
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            themeCode: store.themeCode
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to update store theme:', await response.text());
        }
      } catch (error) {
        console.error('Failed to update store theme:', error);
      }

      state.setIsDraft(false);
      state.updateLastSaved();
      clearHistoryRef.current(sectionsRef.current, 'Published changes');
      toast.success('Changes published successfully');
    } catch (error) {
      console.error('Failed to publish changes:', error);
      toast.error('Failed to publish changes');
    } finally {
      state.setIsPublishing(false);
    }
  }, [store.id]);

  const handlePreview = () => {
    let previewUrl = `http://${store.subdomain}.lvh.me:3000`;
    
    // Add the appropriate path based on selected page
    if (state.selectedPage === 'collection') {
      previewUrl += '/collections/all';
    } else if (state.selectedPage === 'product') {
      previewUrl += '/products/sample-product';
    } else if (state.selectedPage === 'cart') {
      previewUrl += '/cart';
    } else if (state.selectedPage === 'search') {
      previewUrl += '/search';
    } else if (state.selectedPage === 'account') {
      previewUrl += '/account';
    } else if (state.selectedPage === 'login') {
      previewUrl += '/account/login';
    } else if (state.selectedPage === 'register') {
      previewUrl += '/account/register';
    } else if (state.selectedPage !== 'homepage') {
      // For custom pages, try to find the page slug
      const customPage = pagesRef.current.find(p => p.id === state.selectedPage);
      if (customPage?.slug) {
        previewUrl += `/pages/${customPage.slug}`;
      }
    }
    // Homepage is the default, no path needed
    
    window.open(previewUrl, '_blank');
  };

  const loadPages = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/pages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const pagesResult = await response.json();
        const data = pagesResult.data || pagesResult;
        const pagesArray = Array.isArray(data) ? data : data.pages || [];
        state.setPages(pagesArray);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  }, [store.id]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const section = sectionsRef.current.find(s => s.id === active.id);
    state.setDraggedSection(section || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    state.setDraggedSection(null);

    if (over && active.id !== over.id) {
      // Mark that we're updating to prevent history sync
      isUpdatingRef.current = true;
      
      const newSections = (items: Section[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        return newItems.map((item, index) => ({
          ...item,
          position: index,
        }));
      };
      
      const reorderedSections = newSections(sectionsRef.current);
      
      // Save to history AFTER sections are reordered (with NEW order)
      const activeSection = reorderedSections.find(s => s.id === active.id);
      pushHistoryState(
        reorderedSections, 
        'Reordered sections', 
        activeSection ? `Moved ${activeSection.title || activeSection.type}` : 'Reordered sections'
      );
      
      state.setSections(reorderedSections);
      
      // Mark as having changes for the publish button
      state.setIsDraft(true);
      
      // Send realtime update
      realtimeReorderSections(reorderedSections);
      
      // Reset update flag after state is set
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
      
      // Update positions in the database sequentially to avoid race conditions
      const updatePositions = async () => {
        for (let index = 0; index < reorderedSections.length; index++) {
          const section = reorderedSections[index];
          if (section.position !== index) {
            await handleUpdateSection(section.id, { position: index }, true); // Skip history for position updates
          }
        }
      };
      
      updatePositions();
    }
  };

  // Fix section positions to match current visual order
  const handleFixSectionOrder = useCallback(async () => {
    try {
      isUpdatingRef.current = true;
      
      // Get sections sorted by position (this is the current sidebar order)
      const sortedSections = [...sectionsRef.current].sort((a, b) => a.position - b.position);
      
      // Reassign positions sequentially
      const fixedSections = sortedSections.map((section, index) => ({
        ...section,
        position: index
      }));
      
      state.setSections(fixedSections);
      realtimeReorderSections(fixedSections);
      
      // Update positions in database
      for (let index = 0; index < fixedSections.length; index++) {
        const section = fixedSections[index];
        await handleUpdateSection(section.id, { position: index }, true);
      }
      
      toast.success('Section order synchronized');
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
      
    } catch (error) {
      console.error('Failed to fix section order:', error);
      toast.error('Failed to synchronize section order');
      isUpdatingRef.current = false;
    }
  }, [realtimeReorderSections, handleUpdateSection]);

  // Initialize - must be after function definitions
  useEffect(() => {
    console.log('[Theme Studio] Component mounted');
    console.log('[Theme Studio] Initial sections state:', state.sections.length);
    console.log('[Theme Studio] Sections loaded ref:', sectionsLoadedRef.current);
    
    // Set the current theme from store's active theme
    // Default to store's theme or 'commerce' if no active theme
    const defaultTheme = store.themeCode || 'commerce';
    console.log('[Theme Studio] Setting current theme to:', defaultTheme);
    state.setCurrentTheme(defaultTheme);
    
    // Only run once on mount
    if (!sectionsLoadedRef.current) {
      console.log('[Theme Studio] Loading sections for first time');
      loadSections();
      loadPages();
    }
    
    return () => {
      console.log('[Theme Studio] Component unmounting');
    };
  }, [store.subdomain]); // Subdomain as dependency

  // Keyboard shortcuts - must be after function definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveDraft();
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              if (canRedo) redo();
            } else {
              e.preventDefault();
              if (canUndo) undo();
            }
            break;
          case 'y':
            e.preventDefault();
            if (canRedo) redo();
            break;
          case 'd':
            e.preventDefault();
            console.log('[Debug] Toggling debug panel, current state:', state.showDebugPanel);
            state.toggleDebugPanel();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleSaveDraft, state.toggleDebugPanel]);

  // Reload sections when page changes - must be after function definitions
  useEffect(() => {
    if (sectionsLoadedRef.current && state.selectedPage) {
      console.log('[Theme Studio] Page changed, reloading sections for:', state.selectedPage);
      loadSections();
    }
  }, [state.selectedPage, store.subdomain, loadSections]); // Reduce dependencies to prevent remount
  
  // Add a safeguard to prevent accidental section clearing
  useEffect(() => {
    if (sectionsLoadedRef.current && state.sections.length === 0) {
      console.warn('[Theme Studio] Sections were cleared after loading! This might be normal during component updates.');
      // Don't automatically recover - let the user refresh if needed
    }
  }, [state.sections.length]);

  const getDeviceIcon = () => {
    switch (state.previewDevice) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  if (state.loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading Theme Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Toolbar */}
      <ThemeStudioToolbar
        subdomain={store.subdomain}
        themeCode={store.themeCode}
        saving={state.saving}
        isPublishing={state.isPublishing}
        hasChanges={hasChanges}
        canUndo={canUndo}
        canRedo={canRedo}
        previewDevice={state.previewDevice}
        showThemeSettings={state.showThemeSettings}
        showHistoryPanel={state.showHistoryPanel}
        selectorMode={state.selectorMode}
        selectedPage={state.selectedPage}
        showPageSelector={state.showPageSelector}
        pages={state.pages}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        onUndo={undo}
        onRedo={redo}
        onDeviceChange={state.setPreviewDevice}
        onPreview={handlePreview}
        onToggleHistoryPanel={() => state.toggleHistoryPanel()}
        onThemeSettingsToggle={() => {
          state.toggleThemeSettings();
          if (!state.showThemeSettings) {
            state.clearSelection();
          }
        }}
        onRefreshPreview={state.refreshPreview}
        onToggleSelectorMode={state.toggleSelectorMode}
        onTogglePageSelector={() => state.setShowPageSelector(!state.showPageSelector)}
        onSelectPage={(pageId) => {
          state.setSelectedPage(pageId);
          state.setShowPageSelector(false);
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleSectionDragStart}
          onDragEnd={handleSectionDragEnd}
          sensors={sectionDragSensors}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <ThemeStudioSidebar
            sections={state.sections}
            selectedSection={state.selectedSection}
            selectedSectionId={state.selectedSection?.id || null}
            selectedBlockId={state.selectedBlockId}
            selectedPage={state.selectedPage}
            sidebarVisible={state.sidebarVisible}
            showHistoryPanel={state.showHistoryPanel}
            searchTerm={searchTerm}
            subdomain={store.subdomain}
            theme={state.currentTheme || store.themeCode || 'commerce'}
            onToggleSidebar={() => state.toggleSidebar()}
            onToggleHistoryPanel={() => state.toggleHistoryPanel()}
            onSelectSection={(section) => state.selectSection(section.id)}
            onSelectBlock={handleSelectBlock}
            onAddSection={handleAddSection}
            onDuplicateSection={handleDuplicateSection}
            onDeleteSection={handleDeleteSection}
            onUpdateSection={handleUpdateSection}
            onAddBlock={handleAddBlock}
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
            onReorderBlocks={handleReorderBlocks}
            onReorderSections={(sections) => {
              state.setSections(sections);
              pushHistoryState(sections, 'Reorder sections');
              realtimeReorderSections(sections);
            }}
            onSearchChange={setSearchTerm}
          />
          
          {/* Drag Overlay for sections */}
          <DragOverlay>
            {state.draggedSection?.id ? (
              <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg">
                <div className="text-sm font-medium">
                  {state.sections.find(s => s.id === state.draggedSection?.id)?.title || 'Section'}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Preview */}
        <div className="flex-1 flex">
          <ThemeStudioPreview
            ref={previewFrameRef}
            storeSubdomain={store.subdomain}
            device={state.previewDevice}
            sections={state.sections}
            refreshKey={state.previewRefreshKey}
            pageType={state.selectedPage}
            selectorMode={state.selectorMode}
            selectedSectionId={state.selectedSection?.id || null}
            theme={state.currentTheme || store.themeCode || 'commerce'}
            sidebarVisible={state.sidebarVisible}
            showInspector={state.activePanelId === 'inspector' || state.showThemeSettings}
            isImagePickerOpen={state.isImagePickerOpen}
          />
        </div>

        {/* Inspector */}
        <ThemeStudioInspector
          showInspector={state.activePanelId === 'inspector' || state.showThemeSettings}
          showThemeSettings={state.showThemeSettings}
          selectedSection={state.selectedSection}
          selectedBlockId={state.selectedBlockId}
          subdomain={store.subdomain}
          theme={state.currentTheme || store.themeCode || 'commerce'}
          themeInspectorRef={themeInspectorRef}
          onClose={() => {
            state.setActivePanelId(null);
            state.setShowThemeSettings(false);
          }}
          onImagePickerToggle={(isOpen) => {
            // Update preview width when image picker opens/closes
            state.setIsImagePickerOpen(isOpen);
          }}
          onUpdateSection={(updates, skipHistory) => {
            if (state.selectedSection) {
              handleUpdateSection(state.selectedSection.id, updates, skipHistory);
            }
          }}
          onUpdateBlock={(blockUpdates) => {
            if (state.selectedSection && state.selectedBlockId && blockUpdates.settings) {
              handleUpdateBlock(state.selectedSection.id, state.selectedBlockId, { settings: blockUpdates.settings });
            }
          }}
          onDeleteSection={() => {
            if (state.selectedSection) {
              handleDeleteSection(state.selectedSection.id);
            }
          }}
          onDuplicateSection={() => {
            if (state.selectedSection) {
              handleDuplicateSection(state.selectedSection);
            }
          }}
          onThemeSettingsChange={(settings) => {
            console.log('Theme settings updated:', settings);
            setThemeSettings(settings);
          }}
        />
      </div>
      
      {/* History Panel */}
      <HistoryPanel
        isOpen={state.showHistoryPanel}
        onClose={() => state.setShowHistoryPanel(false)}
        historyItems={historyEntries.map((entry, index) => ({
          timestamp: entry.timestamp,
          action: entry.action,
          details: entry.details
        }))}
        currentIndex={historyIndex}
        onSelectHistory={(index) => {
          goToHistory(index);
          state.setShowHistoryPanel(false);
        }}
      />
      
      {/* Debug Button - Temporary */}
      <button
        onClick={() => {
          console.log('[Debug] Button clicked, toggling debug panel');
          state.toggleDebugPanel();
        }}
        className="fixed bottom-4 left-4 z-50 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-600"
      >
        Toggle Debug (Ctrl+D)
      </button>

      {/* Debug Panel */}
      <DebugPanel 
        sections={state.sections}
        selectedSection={state.selectedSection}
        selectedBlock={state.sections.find(s => s.id === state.selectedSection?.id)?.blocks?.find(b => b.id === state.selectedBlockId)}
        themeSettings={themeSettings}
        templateData={state.currentTemplate}
        store={store}
        isVisible={state.showDebugPanel}
      />
      
      {/* Confirmation Modal */}
      {ConfirmationModal}
    </div>
  );
}