'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  ArrowLeft, Save, Plus, Smartphone, Tablet, Monitor,
  Palette, Type, Layout, Sparkles, X, Check,
  ChevronLeft, ChevronRight, Loader2, Search,
  Command, Zap, Move, Layers, MoreHorizontal,
  Play, Pause, RotateCcw, RotateCw, Maximize2,
  Code, Coffee, Figma, MousePointer, FileText,
  ChevronDown, Home, Eye, EyeOff, Settings,
  Undo2, Redo2, Download, Upload, RefreshCw,
  ExternalLink, ShoppingBag, Image, Mail, Users,
  MessageSquare, Instagram, Clock, AlertCircle, Globe,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { SectionListInline } from './components/section-list-inline';
import { SectionInspector } from './components/section-inspector';
import { ThemeInspector } from './components/theme-inspector';
import { PreviewFrameNext } from './components/preview-frame-next';
import { HistoryPanel } from './components/history-panel';
import { useHistory } from './hooks/use-history';
import { useRealtimeSections } from './hooks/use-realtime-sections';
import { defaultThemeSettings } from '@/lib/theme-settings-schema';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { DebugPanel } from './debug-panel';

interface Section {
  id: string;
  sectionType: string;
  settings: any;
  enabled: boolean;
  position: number;
  // For UI display
  type: string;
  title: string;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ThemeStudioNextProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
  };
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
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [activePanelId, setActivePanelId] = useState<'sections' | 'inspector' | null>('sections');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [saving, setSaving] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [activePanel, setActivePanel] = useState<'sections'>('sections');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isDraft, setIsDraft] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date>();
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Preview frame ref for realtime updates
  const previewFrameRef = useRef<HTMLIFrameElement>(null);
  
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
  } = useHistory<Section[]>(sections, 5); // Maximum 5 history kaydı
  
  // Track if we're in the middle of an update
  const isUpdatingRef = useRef(false);
  
  // Realtime section updates
  const {
    updateSection: realtimeUpdateSection,
    addSection: realtimeAddSection,
    deleteSection: realtimeDeleteSection,
    reorderSections: realtimeReorderSections,
    sendInitialSections
  } = useRealtimeSections(previewFrameRef, sections);

  // Computed state
  const hasChanges = isDraft || JSON.stringify(sections) !== JSON.stringify(historySections);
  
  // Page management state
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<'homepage' | string>('homepage');
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [selectorMode, setSelectorMode] = useState(false);


  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
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
  
  // Keep a ref to current sections for event handlers
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);
  
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
  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  
  // Sync sections when history changes (only for undo/redo operations)
  useEffect(() => {
    // Skip if we're in the middle of an update
    if (isUpdatingRef.current) return;
    
    // Skip if sections haven't been loaded yet
    if (!sectionsLoadedRef.current && sections.length === 0) return;
    
    // This effect should only run when history actually changes due to undo/redo
    // Not when sections change due to normal updates
    const historyJSON = JSON.stringify(historySections);
    const currentSectionsJSON = JSON.stringify(sectionsRef.current);
    
    if (historySections && historyJSON !== currentSectionsJSON) {
      console.log('[Theme Studio] History sync: setting sections from history', historySections.length);
      setSections(historySections);
      // Only send realtime update if sections actually changed
      if (historySections.length > 0) {
        realtimeReorderSectionsRef.current(historySections);
      }
    }
  }, [historySections]); // Remove sections from dependencies

  // Send initial sections when preview loads
  useEffect(() => {
    if (sections.length > 0) {
      sendInitialSections();
    }
  }, [sections.length, sendInitialSections]);

  // Close page selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageSelector) {
        const target = event.target as HTMLElement;
        if (!target.closest('[data-page-selector]')) {
          setShowPageSelector(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPageSelector]);

  // Listen for section selection from preview
  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.data.type === 'SECTION_SELECTED') {
        const { sectionId, sectionType } = event.data;
        
        // Find the section by ID
        const section = sectionsRef.current.find(s => s.id === sectionId);
        
        if (section) {
          // Only update if it's a different section
          if (selectedSection?.id !== section.id) {
            // Select the new section
            setSelectedSection(section);
            
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
    };
    
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [selectedSection?.id]);

  const loadSections = useCallback(async () => {
    setLoading(true);
    console.log('[Theme Studio] Loading sections...');
    
    try {
      // Determine template type based on selected page
      let templateType = 'homepage';
      if (selectedPage === 'collection') templateType = 'collection';
      else if (selectedPage === 'product') templateType = 'product';
      else if (selectedPage === 'search') templateType = 'search';
      else if (selectedPage === 'account') templateType = 'account';
      else if (selectedPage === 'cart') templateType = 'cart';
      else if (selectedPage !== 'homepage' && pagesRef.current.find(p => p.id === selectedPage)) {
        templateType = 'page';
      }
      
      console.log('[Theme Studio] Template type:', templateType);
      console.log('[Theme Studio] Store ID:', store.id);
      console.log('[Theme Studio] Fetching from:', `/api/stores/${store.id}/templates/by-type/${templateType}`);

      // Load template with sections
      const response = await fetch(`/api/stores/${store.id}/templates/by-type/${templateType}`);
      console.log('[Theme Studio] Response status:', response.status);
      
      if (response.ok) {
        const template = await response.json();
        console.log('[Theme Studio] Template loaded:', template);
        console.log('[Theme Studio] Sections in template:', template.sections?.length || 0);
        setCurrentTemplate(template);
        
        console.log('[Theme Studio] Checking template:', {
          hasTemplate: !!template,
          hasSections: !!template?.sections,
          isArray: Array.isArray(template?.sections),
          sectionsLength: template?.sections?.length
        });
        
        if (template && template.sections && Array.isArray(template.sections)) {
          console.log('[Theme Studio] Sections received:', template.sections);
          console.log('[Theme Studio] First section example:', template.sections[0]);
          // Sections are now properly mapped in the API
          const sortedSections = template.sections.sort((a: Section, b: Section) => a.position - b.position);
          setSections(sortedSections);
          sectionsLoadedRef.current = true;
          console.log('[Theme Studio] Set sections state with:', sortedSections.length, 'sections');
          
          // Initialize history with loaded sections
          clearHistoryRef.current(sortedSections, 'Loaded template');
          
          // Log success
          console.log('[Theme Studio] Successfully set sections in state');
        } else {
          console.log('[Theme Studio] No sections in template - condition failed');
          console.log('[Theme Studio] Template object:', JSON.stringify(template, null, 2));
          setSections([]);
        }
      } else if (response.status === 404) {
        // Template doesn't exist yet, create it
        const createResponse = await fetch(`/api/stores/${store.id}/templates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: templateType,
            name: templateType.replace('.', ' ').replace(/-/g, ' '),
            isDefault: true
          })
        });
        
        if (createResponse.ok) {
          const newTemplate = await createResponse.json();
          setCurrentTemplate(newTemplate);
          
          // If the new template has sections (from our API enhancement), use them
          if (newTemplate && newTemplate.sections && Array.isArray(newTemplate.sections)) {
            const sortedSections = newTemplate.sections.sort((a: Section, b: Section) => a.position - b.position);
            setSections(sortedSections);
            sectionsLoadedRef.current = true;
            clearHistoryRef.current(sortedSections, 'Created new template');
          } else {
            setSections([]);
            sectionsLoadedRef.current = true;
            clearHistoryRef.current([], 'Created empty template');
          }
        }
      } else {
        const error = await response.text();
        console.error('Failed to load template:', error);
        toast.error('Failed to load template');
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  }, [selectedPage, store.id]);

  const handleAddSection = async (sectionData: any) => {
    console.log('Adding section:', sectionData);
    try {
      // Calculate position - use provided position or add at end
      const targetPosition = sectionData.position !== undefined ? sectionData.position : sectionsRef.current.length;
      
      // Optimistically update UI
      const tempId = 'temp-' + Date.now();
      const optimisticSection = {
        id: tempId,
        type: sectionData.type,
        sectionType: sectionData.type,
        title: sectionData.title,
        settings: sectionData.settings,
        enabled: true,
        position: targetPosition
      };
      
      // Insert at specific position and adjust other sections
      const newSections = [...sectionsRef.current];
      
      // Shift existing sections if inserting in middle
      if (targetPosition < sectionsRef.current.length) {
        newSections.forEach(section => {
          if (section.position >= targetPosition) {
            section.position += 1;
          }
        });
      }
      
      // Insert the new section
      newSections.push(optimisticSection);
      newSections.sort((a, b) => a.position - b.position);
      
      // Force update with new array reference
      setSections([...newSections]);
      pushHistoryState(sectionsRef.current, 'Added section', `Added ${sectionData.title} at position ${targetPosition + 1}`);
      setSelectedSection(optimisticSection);
      
      // Send realtime update
      realtimeAddSection(optimisticSection);

      // Save to server
      const response = await fetch(`/api/stores/${store.id}/templates/${currentTemplate?.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionData,
          position: targetPosition
        }),
      });

      if (response.ok) {
        const serverSection = await response.json();
        
        // Replace temp section with real one from server
        setSections(prev => {
          const updated = prev.map(s => s.id === tempId ? serverSection : s);
          // Ensure positions are correct
          return updated.sort((a, b) => a.position - b.position);
        });
        setSelectedSection(serverSection);
        
        // Update realtime with real data
        realtimeAddSection(serverSection);
        toast.success('Section added');
      } else {
        // Rollback on error
        setSections(sectionsRef.current);
        setSelectedSection(null);
        const errorText = await response.text();
        console.error('Failed to add section:', errorText);
        toast.error('Failed to add section');
      }
    } catch (error) {
      // Rollback on error
      setSections(sectionsRef.current);
      setSelectedSection(null);
      console.error('Error adding section:', error);
      toast.error('Failed to add section');
    }
  };

  const handleUpdateSection = useCallback(async (sectionId: string, updates: any, skipHistory = false) => {
    console.log('[Theme Studio] handleUpdateSection called:', { sectionId, updates, skipHistory });
    
    try {
      // Mark that we're updating to prevent history sync
      isUpdatingRef.current = true;
      
      // Get current sections from ref
      const currentSections = sectionsRef.current;
      
      // Only save to history for significant changes (position, visibility, etc)
      // Skip history for text input changes to prevent history pollution
      const isTextChange = updates.settings && Object.keys(updates).length === 1;
      const isTextUpdateOnly = skipHistory && isTextChange;
      
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
                        currentSection.position !== updates.position;
      
      if (!hasChanges) {
        console.log('[Theme Studio] No changes detected, skipping update');
        isUpdatingRef.current = false;
        return;
      }
      
      // Update sections (memoized to prevent unnecessary re-renders)
      const updatedSections = currentSections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );
      
      // Only update state if sections actually changed (for performance)
      // Skip state update for text-only changes to prevent re-renders and focus loss
      const hasActualChanges = JSON.stringify(currentSections) !== JSON.stringify(updatedSections);
      if (hasActualChanges && !isTextUpdateOnly) {
        setSections(updatedSections);
        // Mark as having changes for the publish button
        setIsDraft(true);
      }
      
      // Send realtime update (updateSection is already batched)
      realtimeUpdateSection(sectionId, updates);
      
      // Reset update flag after state is set
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
      
      // Save to server in background
      const response = await fetch(`/api/stores/${store.id}/templates/${currentTemplate?.id}/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        // Rollback on error
        setSections(currentSections);
        toast.error('Failed to update section');
      }
    } catch (error) {
      // Rollback on error
      setSections(currentSections);
      toast.error('Failed to update section');
    } finally {
      // Ensure flag is reset
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }
  }, [pushHistoryState, realtimeUpdateSection, store.id, currentTemplate?.id]);

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
    if (!confirm('Are you sure you want to delete this section?')) {
      return;
    }
    
    try {
      // Save current state to history before change
      const sectionToDelete = sectionsRef.current.find(s => s.id === sectionId);
      pushHistoryState(
        sectionsRef.current, 
        'Deleted section', 
        sectionToDelete ? `Deleted ${sectionToDelete.title || sectionToDelete.type}` : 'Deleted section'
      );
      
      // Optimistically update UI
      const previousSections = [...sectionsRef.current];
      const deletedSection = sectionsRef.current.find(s => s.id === sectionId);
      const filteredSections = sectionsRef.current.filter(section => section.id !== sectionId);
      
      // Reorder positions after deletion
      if (deletedSection) {
        filteredSections.forEach(section => {
          if (section.position > deletedSection.position) {
            section.position -= 1;
          }
        });
      }
      
      setSections(filteredSections);
      
      if (selectedSection?.id === sectionId) {
        setSelectedSection(null);
      }
      
      // Send realtime update
      realtimeDeleteSection(sectionId);

      const response = await fetch(`/api/stores/${store.id}/templates/${currentTemplate?.id}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Section deleted');
        
        // Update positions after successful deletion
        setSections(prev => {
          const updated = [...prev];
          // Ensure positions are sequential
          updated.forEach((section, index) => {
            section.position = index;
          });
          return updated;
        });
      } else {
        // Rollback on error
        setSections(previousSections);
        const error = await response.text();
        console.error('Delete error:', error);
        toast.error('Failed to delete section');
      }
    } catch (error) {
      // Rollback on error
      setSections(previousSections);
      console.error('Delete error:', error);
      toast.error('Failed to delete section');
    }
  };

  const loadThemeSettings = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/theme-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          // TODO: Implement theme settings state
          console.log('Theme settings loaded:', data);
        }
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
      toast.error('Failed to load theme settings');
    }
  };

  const handleSaveDraft = useCallback(async () => {
    setSaving(true);
    try {
      // Save all sections as draft
      await Promise.all(
        sectionsRef.current.map(section => 
          fetch(`/api/stores/${store.id}/sections/${section.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: section.settings,
              enabled: section.enabled,
              position: section.position,
              isDraft: true
            }),
          })
        )
      );

      setLastSaved(new Date());
      clearHistoryRef.current(sectionsRef.current, 'Saved draft'); // Reset history after successful save
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  }, [store.id]);

  const handlePublish = useCallback(async () => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to publish these changes? This will make them live on your website.')) {
      return;
    }
    
    setIsPublishing(true);
    try {
      // Publish all sections
      await Promise.all(
        sectionsRef.current.map(section => 
          fetch(`/api/stores/${store.id}/sections/${section.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              settings: section.settings,
              enabled: section.enabled,
              position: section.position,
              isDraft: false
            }),
          })
        )
      );

      setIsDraft(false);
      setLastSaved(new Date());
      clearHistoryRef.current(sectionsRef.current, 'Published changes');
      toast.success('Changes published successfully');
    } catch (error) {
      toast.error('Failed to publish changes');
    } finally {
      setIsPublishing(false);
    }
  }, [store.id]);

  const handlePreview = () => {
    window.open(`http://${store.subdomain}.localhost:3000`, '_blank');
  };

  const loadPages = useCallback(async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/pages`);
      if (response.ok) {
        const data = await response.json();
        const pagesArray = Array.isArray(data) ? data : data.pages || [];
        setPages(pagesArray);
      }
    } catch (error) {
      console.error('Failed to load pages:', error);
    }
  }, [store.id]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const section = sectionsRef.current.find(s => s.id === active.id);
    setDraggedSection(section || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedSection(null);

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
      
      setSections(reorderedSections);
      
      // Mark as having changes for the publish button
      setIsDraft(true);
      
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
      
      setSections(fixedSections);
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
    loadSections();
    loadPages();
    
    return () => {
      console.log('[Theme Studio] Component unmounting');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, handleSaveDraft]);

  // Reload sections when page changes - must be after function definitions
  useEffect(() => {
    if (sectionsLoadedRef.current && selectedPage) {
      loadSections();
    }
  }, [selectedPage, loadSections]);

  const getDeviceIcon = () => {
    switch (previewDevice) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const DeviceIcon = getDeviceIcon();

  if (loading) {
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
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden nuvi-admin">
      {/* Top Toolbar - Nuvi Branded */}
      <div className="bg-white border-b border-[var(--nuvi-border)]">
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/stores/${store.subdomain}`}
              className="p-2 text-[var(--nuvi-text-secondary)] hover:text-[var(--nuvi-text-primary)] transition-colors rounded-lg hover:bg-[var(--nuvi-primary-lighter)]"
              title="Back to store"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            
            <div className="h-8 w-px bg-[var(--nuvi-border)]"></div>
            
            <h1 className="text-sm font-semibold text-[var(--nuvi-text-primary)]">Theme Studio</h1>
            
            {/* Draft/Published Status */}
            <div className="flex items-center gap-2">
              {isDraft ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                  <span className="text-xs font-medium text-orange-700">Draft</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">Published</span>
                </div>
              )}
              
              {/* Last Saved */}
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock className="h-2.5 w-2.5" />
                <span>
                  {lastSaved 
                    ? `${Math.floor((Date.now() - lastSaved.getTime()) / 60000)}m ago`
                    : 'Never saved'
                  }
                </span>
              </div>
              
              {/* Unsaved Changes */}
              {hasChanges && (
                <div className="flex items-center gap-1 text-[10px] text-orange-600">
                  <AlertCircle className="h-2.5 w-2.5" />
                  <span>Unsaved</span>
                </div>
              )}
            </div>
            
            {/* Sidebar Toggle */}
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className={cn(
                "p-1.5 rounded-md transition-all bg-[var(--nuvi-primary-lighter)]",
                sidebarVisible
                  ? "text-[var(--nuvi-primary)] hover:bg-white hover:shadow-sm"
                  : "text-gray-400 hover:text-[var(--nuvi-primary)] hover:bg-white hover:shadow-sm"
              )}
              title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {sidebarVisible ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
            </button>

            {/* Page Selector */}
            
            <div className="relative" data-page-selector>
              <button
                onClick={() => setShowPageSelector(!showPageSelector)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                  "hover:bg-gray-100",
                  showPageSelector && "bg-gray-100"
                )}
              >
                {selectedPage === 'homepage' ? <Home className="h-4 w-4" /> :
                 selectedPage === 'collection' ? <Layers className="h-4 w-4" /> :
                 selectedPage === 'product' ? <ShoppingBag className="h-4 w-4" /> :
                 selectedPage === 'search' ? <Search className="h-4 w-4" /> :
                 selectedPage === 'account' ? <Users className="h-4 w-4" /> :
                 selectedPage === 'cart' ? <ShoppingBag className="h-4 w-4" /> :
                 <FileText className="h-4 w-4" />}
                <span className="font-medium">
                  {selectedPage === 'homepage' ? 'Homepage' : 
                   selectedPage === 'collection' ? 'Collection' :
                   selectedPage === 'product' ? 'Product' :
                   selectedPage === 'search' ? 'Search' :
                   selectedPage === 'account' ? 'Account' :
                   selectedPage === 'cart' ? 'Cart' :
                   pages.find(p => p.id === selectedPage)?.title || 'Page'}
                </span>
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  showPageSelector && "rotate-180"
                )} />
              </button>
              
              {showPageSelector && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedPage('homepage');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'homepage' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Homepage</div>
                      <div className="text-xs text-gray-500">Main store page</div>
                    </div>
                  </button>

                  {/* System Pages */}
                  <div className="my-1 border-t border-gray-100"></div>
                  <div className="text-xs font-medium text-gray-500 px-3 py-1 uppercase tracking-wide">System Pages</div>
                  
                  <button
                    onClick={() => {
                      setSelectedPage('collection');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'collection' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <Layers className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Collection</div>
                      <div className="text-xs text-gray-500">Product collection pages</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPage('product');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'product' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Product</div>
                      <div className="text-xs text-gray-500">Product detail pages</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPage('search');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'search' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <Search className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Search</div>
                      <div className="text-xs text-gray-500">Search results page</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPage('account');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'account' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Account</div>
                      <div className="text-xs text-gray-500">Customer account pages</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedPage('cart');
                      setShowPageSelector(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                      selectedPage === 'cart' && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Cart</div>
                      <div className="text-xs text-gray-500">Shopping cart page</div>
                    </div>
                  </button>
                  
                  {/* Static Pages */}
                  {pages.length > 0 && (
                    <>
                      <div className="my-1 border-t border-gray-100"></div>
                      <div className="text-xs font-medium text-gray-500 px-3 py-1 uppercase tracking-wide">Static Pages</div>
                      {pages.map((page) => (
                        <button
                          key={page.id}
                          onClick={() => {
                            setSelectedPage(page.id);
                            setShowPageSelector(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-gray-50",
                            selectedPage === page.id && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <div className="flex-1 text-left">
                            <div className="font-medium truncate">{page.title}</div>
                            <div className="text-xs text-gray-500 truncate">/{page.slug}</div>
                          </div>
                          {!page.isPublished && (
                            <div className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Draft</div>
                          )}
                        </button>
                      ))}
                    </>
                  )}
                  
                  <div className="my-1 border-t border-gray-100"></div>
                  <Link
                    href={`/dashboard/stores/${store.id}/content/pages`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    onClick={() => setShowPageSelector(false)}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Manage Pages</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector Mode Button */}
            <button
              onClick={() => setSelectorMode(!selectorMode)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors",
                selectorMode
                  ? "bg-[var(--nuvi-primary)] text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
              title={selectorMode ? "Exit selector mode" : "Select sections by clicking"}
            >
              <MousePointer className="h-3.5 w-3.5" />
              <span>Select</span>
            </button>
            
            {/* Preview Button */}
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              title="Preview store"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Preview</span>
            </button>
            
            <div className="h-8 w-px bg-[var(--nuvi-border)] mx-1"></div>
            
            {/* Device Selector */}
            <div className="flex items-center bg-[var(--nuvi-primary-lighter)] rounded-lg p-0.5">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
                const Icon = device === 'desktop' ? Monitor : device === 'tablet' ? Tablet : Smartphone;
                return (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={cn(
                      "p-1.5 rounded-md transition-all",
                      previewDevice === device
                        ? "bg-white text-[var(--nuvi-primary)] shadow-sm"
                        : "text-[var(--nuvi-text-secondary)] hover:text-[var(--nuvi-text-primary)]"
                    )}
                    title={device}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
            
            <div className="h-8 w-px bg-[var(--nuvi-border)] mx-1"></div>

            {/* Undo/Redo Buttons */}
            <div className="flex items-center bg-[var(--nuvi-primary-lighter)] rounded-lg p-0.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  canUndo
                    ? "text-[var(--nuvi-primary)] hover:bg-white hover:shadow-sm"
                    : "text-gray-400 cursor-not-allowed"
                )}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  canRedo
                    ? "text-[var(--nuvi-primary)] hover:bg-white hover:shadow-sm"
                    : "text-gray-400 cursor-not-allowed"
                )}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-[var(--nuvi-border)] mx-1"></div>

            {/* Sync Order Button */}
            <button
              onClick={handleFixSectionOrder}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
              )}
              title="Sync section order between sidebar and preview"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync Order</span>
            </button>

            <div className="h-8 w-px bg-[var(--nuvi-border)] mx-1"></div>

            {/* History Button */}
            <button
              onClick={() => setShowHistoryPanel(true)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors",
                showHistoryPanel && "bg-gray-100"
              )}
              title="View editing history"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>History ({historyEntries.length})</span>
            </button>

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              disabled={!hasChanges || saving}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded transition-all",
                hasChanges && !saving
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-gray-400 cursor-not-allowed"
              )}
              title="Save Draft (Ctrl+S)"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={!hasChanges || isPublishing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-all",
                hasChanges && !isPublishing
                  ? "bg-[var(--nuvi-primary)] text-white hover:bg-[var(--nuvi-primary-hover)] shadow-sm"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
              title={hasChanges ? "Publish Changes" : "No changes to publish"}
            >
              {isPublishing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
              <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Nuvi Unique Design */}
        {sidebarVisible && (
          <div className="w-[280px] bg-[var(--nuvi-background)] border-r border-[var(--nuvi-border)] flex flex-col transition-all duration-200">
          {/* Panel Header with Tabs */}
          <div className="bg-white border-b border-[var(--nuvi-border)]">
            
            
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden relative">
            {activePanel === 'sections' ? (
              <div className="h-full">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <SectionListInline
                      sections={sections}
                      selectedSection={selectedSection}
                      onSelectSection={setSelectedSection}
                      onDeleteSection={handleDeleteSection}
                      onToggleVisibility={handleToggleVisibility}
                      onDuplicateSection={handleDuplicateSection}
                      onUpdateSection={handleUpdateSection}
                      onAddSection={handleAddSection}
                      storeId={store.id}
                      showInlineSettings={true}
                    />
                  </SortableContext>
                  <DragOverlay 
                    modifiers={[restrictToWindowEdges]}
                    dropAnimation={{
                      duration: 200,
                      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  >
                    {draggedSection && (
                      <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-xl ring-2 ring-[var(--nuvi-primary)]/20 flex items-center gap-2">
                        <div className="text-[var(--nuvi-primary)]">
                          {sectionIcons[draggedSection.type || draggedSection.sectionType || ''] ? 
                            React.createElement(sectionIcons[draggedSection.type || draggedSection.sectionType || ''], { className: "h-3.5 w-3.5" }) : 
                            <Layers className="h-3.5 w-3.5" />
                          }
                        </div>
                        <div className="text-[13px] font-medium text-[var(--nuvi-text-primary)]">{draggedSection.title}</div>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              </div>
            ) : (
              <div className="h-full">
                {/* TODO: Implement theme customizer when theme settings state is ready */}
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">Theme customizer coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Preview Area */}
        <div className="flex-1 bg-[var(--nuvi-background)] relative overflow-hidden">
          <PreviewFrameNext
            ref={previewFrameRef}
            storeSubdomain={store.subdomain}
            device={previewDevice}
            sections={sections}
            refreshKey={previewRefreshKey}
            pageType={selectedPage}
            selectorMode={selectorMode}
          />
        </div>


      </div>
      
      {/* History Panel */}
      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        historyItems={historyEntries.map((entry, index) => ({
          timestamp: entry.timestamp,
          action: entry.action,
          details: entry.details
        }))}
        currentIndex={historyIndex}
        onSelectHistory={(index) => {
          goToHistory(index);
          setShowHistoryPanel(false);
        }}
      />
      
      {/* Debug Panel - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugPanel 
          sections={sections} 
          currentTemplate={currentTemplate} 
          store={store} 
        />
      )}
    </div>
  );
}