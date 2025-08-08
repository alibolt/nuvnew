'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AddItemSidebarInline } from './add-item-sidebar-inline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  CollisionDetection
} from '@dnd-kit/core';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { 
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { 
  Eye, EyeOff, GripVertical, Layout, ShoppingBag, 
  Type, Image, Mail, Users, MessageSquare, Instagram, 
  Palette, Layers, Copy, Trash2, ChevronRight,
  Settings, Edit3, Lock, Unlock, Plus, ChevronDown,
  Check, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockType } from '@/lib/block-types';
import { getBlocksForSection } from '@/lib/block-configs';
import { SortableBlockWithContainer } from './sortable-block-with-container';
import { wouldCreateCircularReference } from '../utils/nested-blocks';
import { Block, Section } from '../types';
import { getSimplifiedBlockSettings } from '@/lib/simplified-block-settings';

interface SectionMinimal extends Section {
  blocks?: Block[];
}

interface SectionItemMinimalProps {
  section: Section;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onDelete?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicate?: () => void;
  onUpdate?: (sectionId: string, updates: any) => void;
  onAddSection?: (sectionData: any, position?: number) => void;
  onAddBlock?: (sectionId: string, blockType: string) => void;
  onUpdateBlock?: (sectionId: string, blockId: string, updates: any) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onSelectBlock?: (blockId: string) => void;
  selectedBlockId?: string;
  theme?: string; // Add theme prop
  categoryColor?: string;
  showInlineSettings?: boolean;
  subdomain?: string;
  onReorderBlocks?: (sectionId: string, blockIds: string[]) => void;
  onOpenBlockSidebar?: (sectionId: string, containerId?: string) => void;
  onOpenSectionSidebar?: (position: number) => void;
  isDraggable?: boolean;
}

// Sortable Block Item Component
const SortableBlockItem = ({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdateBlock, 
  onDeleteBlock,
  sectionId,
  isNested = false 
}: {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  sectionId: string;
  isNested?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `block-${block.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockType = getBlockType(block.type);
  if (!blockType) return null;
  
  const isContainer = block.type === 'container';
  const hasChildren = isContainer && block.blocks && block.blocks.length > 0;

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center gap-1.5 py-1.5 cursor-pointer rounded-md transition-colors group",
        isSelected 
          ? "bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)]" 
          : "hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-text-secondary)]",
        isDragging && "opacity-50",
        isNested ? "pl-6 pr-2" : "px-2"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Nested indicator */}
      {isNested && !isContainer && (
        <div className="w-3 h-3 mr-1 flex items-center justify-center">
          <div className="w-1 h-1 bg-[var(--nuvi-text-muted)] rounded-full"></div>
        </div>
      )}
      
      {/* Expand/Collapse for containers */}
      {isContainer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
        >
          <ChevronRight className={cn(
            "h-2.5 w-2.5 transition-transform",
            isExpanded && "rotate-90"
          )} />
        </button>
      )}
      
      {/* Drag Handle */}
      <GripVertical 
        {...listeners}
        data-drag-handle="true"
        className="h-2.5 w-2.5 text-[var(--nuvi-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" 
      />
      
      {/* Status indicator */}
      <div className={cn(
        "w-1 h-1 rounded-full flex-shrink-0",
        block.enabled ? "bg-[#8B9F7E]" : "bg-gray-300"
      )} />

      {/* Block Icon */}
      <blockType.icon className="h-2.5 w-2.5 flex-shrink-0" />

      {/* Block Title */}
      <span className="text-xs font-medium flex-1 truncate">
        {blockType.name}
        {hasChildren && <span className="text-[var(--nuvi-text-muted)] ml-1">({block.blocks!.length})</span>}
      </span>

      {/* Quick Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUpdateBlock(block.id, { enabled: !block.enabled });
          }}
          className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-[var(--nuvi-text-primary)]"
        >
          {block.enabled ? <Eye className="h-2 w-2" /> : <EyeOff className="h-2 w-2" />}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBlock(sectionId, block.id);
          }}
          className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-red-600"
        >
          <Trash2 className="h-2 w-2" />
        </button>
      </div>
    </div>
    </>
  );
};

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

// Color variants for categories
const colorVariants: Record<string, { bg: string; border: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700'
  },
  green: {
    bg: 'bg-[#8B9F7E]/10',
    border: 'border-[#8B9F7E]/30',
    text: 'text-[#8B9F7E]'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700'
  }
};


export function SectionItemMinimal({ 
  section, 
  isSelected, 
  isExpanded,
  onSelect, 
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onUpdate,
  onAddSection,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onSelectBlock,
  onReorderBlocks,
  selectedBlockId,
  theme,
  categoryColor = 'blue',
  showInlineSettings = false,
  subdomain,
  onOpenBlockSidebar,
  onOpenSectionSidebar,
  isDraggable = false
}: SectionItemMinimalProps) {
  const [showActions, setShowActions] = useState(false);
  const [localSettings, setLocalSettings] = useState(section.settings);
  const [showAddBlockSidebar, setShowAddBlockSidebar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSectionSidebar, setShowAddSectionSidebar] = useState(false);
  const [availableSections, setAvailableSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [addingToContainer, setAddingToContainer] = useState<string | null>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Use blocks directly from section prop - no need for separate API calls
  const blocksLoading = false;
  const blocksError = null;
  
  
  // Re-enable section drag and drop with safe configuration
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: section.id,
    disabled: !isDraggable // Enable section dragging only when isDraggable is true
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionType = section.type || section.sectionType || '';
  const SectionIcon = sectionIcons[sectionType] || Layers;
  const colors = colorVariants[categoryColor] || colorVariants.blue;

  // Update local settings when section settings change
  useEffect(() => {
    setLocalSettings(section.settings);
  }, [section.settings]);

  // Close sidebar when section changes or when collapsed
  useEffect(() => {
    setShowAddBlockSidebar(false);
    setShowAddSectionSidebar(false);
    setAddingToContainer(null);
  }, [section.id, isExpanded]);

  // Log blocks error for debugging
  useEffect(() => {
    if (blocksError && !section.id.startsWith('temp-')) {
      // Blocks loading error
    }
  }, [blocksError, section.id]);


  // Debounced update function
  const debouncedUpdate = useCallback((key: string, value: any) => {
    // Update local state immediately for smooth UI
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout for actual update
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate?.(section.id, { 
        settings: { ...section.settings, [key]: value }
      });
    }, 150); // 150ms delay - faster sync
  }, [localSettings, section.id, section.settings, onUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'visibility':
        onToggleVisibility?.(section.id, !section.enabled);
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'addSection':
        if (onOpenSectionSidebar) {
          onOpenSectionSidebar(section.position + 1);
        } else {
          setShowAddSectionSidebar(true);
        }
        break;
      case 'delete':
        // Show inline confirmation instead of modal
        setShowDeleteConfirm(true);
        // Auto-hide after 3 seconds if not used
        setTimeout(() => setShowDeleteConfirm(false), 3000);
        break;
      case 'confirmDelete':
        setShowDeleteConfirm(false);
        onDelete?.(section.id);
        break;
      case 'cancelDelete':
        setShowDeleteConfirm(false);
        break;
    }
  };

  // Check if section supports blocks
  const supportsBlocks = (sectionType: string) => {
    // Special case for product-categories - only supports blocks when layout is 'blocks'
    if (sectionType === 'product-categories') {
      return section.settings?.layout === 'blocks';
    }
    
    // These sections have their own built-in functionality and don't use blocks
    const sectionsWithoutBlocks = [
      'featured-products',
      'newsletter'
    ];
    
    // If it's in the no-blocks list, return false
    if (sectionsWithoutBlocks.includes(sectionType)) {
      return false;
    }
    
    // Otherwise, these sections do support blocks
    return [
      'header', 
      'hero',
      'hero-banner', 
      'footer', 
      'image-with-text', 
      'rich-text', 
      'faq', 
      'contact-form',
      'blog-list',
      'collections',
      'announcement-bar',
      'cart',
      'search-results',
      'account-login',
      'account-profile',
      'order-confirmation',
      'breadcrumb',
      'product',
      'testimonials', // Testimonials section artık blok destekliyor
      'countdown' // Add countdown section support
    ].includes(sectionType);
  };

  // Get blocks suitable for specific section type with theme awareness
  const getAvailableBlocks = (sectionType: string, theme?: string, isForContainer: boolean = false, containerType?: string) => {
    // Use the new block configuration system
    const availableBlockConfigs = getBlocksForSection(sectionType, isForContainer, theme, containerType);
    
    // Get current block counts in section
    const currentBlockCounts = section.blocks?.reduce((acc, block) => {
      acc[block.type] = (acc[block.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Filter blocks based on maxPerSection constraint
    return availableBlockConfigs.filter(blockConfig => {
      if (blockConfig.maxPerSection) {
        const currentCount = currentBlockCounts[blockConfig.id] || 0;
        return currentCount < blockConfig.maxPerSection;
      }
      return true;
    });
  };


  // Block management functions
  const handleAddBlock = async (blockType: string) => {
    const parentContainerId = addingToContainer;
    
    try {
      if (parentContainerId) {
        // Adding to a container - handle it locally
        handleAddBlockToContainer(parentContainerId, blockType);
      } else {
        // Adding to section - use parent callback
        onAddBlock?.(section.id, blockType);
      }
      setShowAddBlockSidebar(false);
      setAddingToContainer(null);
    } catch (error) {
      // Failed to add block
      setShowAddBlockSidebar(false);
      setAddingToContainer(null);
    }
  };
  
  // Add block to container
  const handleAddBlockToContainer = (containerId: string, blockType: string) => {
    if (!section.blocks) return;
    
    const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
    
    const newBlock = {
      id: newBlockId,
      type: blockType,
      position: 0,
      enabled: true,
      settings: defaultSettings
    };
    
    // Find container and add block - handle nested containers properly
    const addToContainer = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === containerId) {
          // Found the target container
          const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
          if (containerTypes.includes(block.type)) {
            // Get current blocks - prioritize block.blocks over settings.blocks
            const currentBlocks = block.blocks || [];
            
            // Important: Create new block with correct position
            const newBlockWithPosition = { 
              ...newBlock, 
              position: currentBlocks.length 
            };
            
            // Create new blocks array
            const newBlocks = [...currentBlocks, newBlockWithPosition];
            
            console.log('[handleAddBlockToContainer] Adding block to container:', {
              containerId,
              containerType: block.type,
              currentBlocksCount: currentBlocks.length,
              newBlocksCount: newBlocks.length,
              newBlockType: blockType
            });
            
            return {
              ...block,
              blocks: newBlocks,
              // Keep settings.blocks in sync for container block renderer
              settings: {
                ...block.settings,
                blocks: newBlocks
              }
            };
          }
        }
        // Recursively check nested blocks
        if (block.blocks && block.blocks.length > 0) {
          return {
            ...block,
            blocks: addToContainer(block.blocks)
          };
        }
        return block;
      });
    };
    
    const updatedBlocks = addToContainer([...section.blocks]);
    
    // Debug the container block structure
    const debugContainerBlock = updatedBlocks.find(b => b.id === containerId);
    console.log('[SectionItemMinimal] Container block after adding:', {
      containerId: containerId,
      containerBlock: debugContainerBlock,
      containerBlocks: debugContainerBlock?.blocks,
      containerSettingsBlocks: debugContainerBlock?.settings?.blocks,
      blockType: blockType
    });
    
    // Update local state immediately for real-time preview
    const updatedSection = {
      ...section,
      blocks: updatedBlocks
    };
    
    // Send real-time update
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({
        type: 'THEME_STUDIO_REALTIME',
        update: {
          type: 'SECTION_UPDATE',
          sectionId: section.id,
          blocks: updatedBlocks
        }
      }, '*');
    }
    
    // Update section with new blocks
    onUpdate?.(section.id, {
      blocks: updatedBlocks
    });
  };

  const handleAddSection = async (sectionData: any) => {
    try {
      // Use parent callback for consistent state management
      onAddSection?.(sectionData, section.position + 1);
      setShowAddSectionSidebar(false);
    } catch (error) {
      // Failed to add section
      setShowAddSectionSidebar(false);
    }
  };

  // Load available sections when dropdown opens
  const loadAvailableSections = async () => {
    if (!subdomain) return;
    
    try {
      setLoadingSections(true);
      
      // Get store's active theme
      const storeResponse = await fetch(`/api/stores/${subdomain}`);
      if (!storeResponse.ok) {
        throw new Error(`Failed to load store: ${storeResponse.status}`);
      }
      const storeData = await storeResponse.json();
      
      if (!storeData.activeThemeId) {
        // No active theme found for store
        return;
      }

      // Get theme sections
      const sectionsResponse = await fetch(`/api/themes/${storeData.activeThemeId}/sections`);
      if (!sectionsResponse.ok) {
        throw new Error(`Failed to load sections: ${sectionsResponse.status}`);
      }
      
      const themeSections = await sectionsResponse.json();
      setAvailableSections(themeSections);
      
    } catch (error) {
      // Failed to load sections
    } finally {
      setLoadingSections(false);
    }
  };

  // Load sections when sidebar opens
  useEffect(() => {
    if (showAddSectionSidebar && availableSections.length === 0) {
      loadAvailableSections();
    }
  }, [showAddSectionSidebar]);

  const handleUpdateBlock = async (blockId: string, updates: any) => {
    try {
      // Always use parent callback for consistent state management
      onUpdateBlock?.(section.id, blockId, updates);
    } catch (error) {
      // Failed to update block
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      console.log('[handleDeleteBlock] Deleting block:', blockId);
      
      // Helper function to recursively remove block from nested structure
      const removeBlockFromStructure = (blocks: Block[]): Block[] => {
        return blocks
          .filter(block => block.id !== blockId) // Remove the target block
          .map(block => {
            // If it's a container, recursively process its children
            if (block.type === 'container' && (block.blocks || block.settings?.blocks)) {
              const childBlocks = block.blocks || block.settings?.blocks || [];
              const filteredChildren = removeBlockFromStructure(childBlocks);
              
              return {
                ...block,
                blocks: filteredChildren,
                settings: {
                  ...block.settings,
                  blocks: filteredChildren
                }
              };
            }
            
            return block;
          });
      };
      
      // Check if this is a top-level block
      const isTopLevel = section.blocks?.some(block => block.id === blockId);
      
      if (isTopLevel) {
        // For top-level blocks, use the regular delete
        console.log('[handleDeleteBlock] Top-level block, using regular delete');
        onDeleteBlock?.(section.id, blockId);
      } else {
        // For nested blocks, update the entire structure
        console.log('[handleDeleteBlock] Nested block, updating structure');
        const updatedBlocks = removeBlockFromStructure(section.blocks || []);
        onUpdate?.(section.id, { blocks: updatedBlocks });
      }
    } catch (error) {
      console.error('[handleDeleteBlock] Error:', error);
      // Failed to delete block
    }
  };


  // Local state for optimistic updates
  const [localBlockOrder, setLocalBlockOrder] = useState<string[]>([]);

  // Refs for debouncing
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingReorderRef = useRef<{ sectionId: string; blockIds: string[] } | null>(null);

  // Reorder blocks API call with debouncing
  const handleReorderBlocks = useCallback((sectionId: string, blockIds: string[]) => {
    if (!subdomain) return;
    
    // Store the latest reorder request
    pendingReorderRef.current = { sectionId, blockIds };
    
    // Clear any existing timeout
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current);
    }
    
    // Debounce the API call by 300ms
    reorderTimeoutRef.current = setTimeout(async () => {
      const { sectionId: currentSectionId, blockIds: currentBlockIds } = pendingReorderRef.current || {};
      if (!currentSectionId || !currentBlockIds) return;
      
      // Store current order for rollback
      const previousOrder = [...localBlockOrder];
      
      try {
        const response = await fetch(`/api/stores/${subdomain}/sections/${currentSectionId}/blocks`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blockIds: currentBlockIds }),
        });

        if (!response.ok) {
          throw new Error(`Failed to reorder blocks: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Call parent callback if provided
        if (onReorderBlocks) {
          onReorderBlocks(currentSectionId, currentBlockIds);
        }
        
        // Send update to preview frame for real-time preview
        if (typeof window !== 'undefined') {
          window.postMessage({
            type: 'THEME_STUDIO_REALTIME',
            update: {
              type: 'BLOCK_REORDER',
              sectionId: currentSectionId,
              blockIds: currentBlockIds
            }
          }, '*');
        }
      } catch (error) {
        // Failed to reorder blocks
        
        // Rollback to previous order on error
        setLocalBlockOrder(previousOrder);
      }
    }, 300);
  }, [subdomain, localBlockOrder]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (reorderTimeoutRef.current) {
        clearTimeout(reorderTimeoutRef.current);
      }
    };
  }, []);

  // Update local block order when blocks change (but avoid infinite loops)
  useEffect(() => {
    const blocks = section.blocks || [];
    const blockIds = blocks.map(block => block.id);
    
    // Only update if the actual block order has changed
    const currentOrder = localBlockOrder.join(',');
    const newOrder = blockIds.join(',');
    
    if (currentOrder !== newOrder) {
      // Block order changed
      setLocalBlockOrder(blockIds);
    }
  }, [section.blocks]);

  // Custom collision detection for containers
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    // First check for container drops using pointer within
    const pointerCollisions = pointerWithin(args);
    const containerCollisions = pointerCollisions.filter((collision) => {
      return collision.id.toString().startsWith('container-drop-');
    });
    
    if (containerCollisions.length > 0) {
      // Return the first container collision
      return containerCollisions;
    }
    
    // Fall back to closest center for regular sorting
    return closestCenter(args);
  }, []);

  // Handle block drag end with container support
  const handleBlockDragEnd = (event: DragEndEvent) => {
    try {
      const { active, over } = event;
      
      if (!over || active.id === over.id) {
        return;
      }
      
      // Drag end event handled
      
      // Check if dropping into a container
      if (over.id.toString().startsWith('container-drop-')) {
        const containerId = over.id.toString().replace('container-drop-', '');
        const draggedBlockId = active.id.toString().replace('block-', '');
        
        // Dropping into container
        
        // Handle container drop
        handleDropInContainer(containerId, draggedBlockId);
        return;
      }

    // Strip the "block-" prefix to get real block IDs
    const activeId = (active.id as string).replace('block-', '');
    const overId = (over.id as string).replace('block-', '');

    const sectionBlocks = section.blocks || [];
    
    // Find if blocks are at the same level (both top-level or in same container)
    const findBlockAndParent = (blocks: Block[], targetId: string, parent: Block | null = null): { block: Block | null, parent: Block | null } => {
      for (const block of blocks) {
        if (block.id === targetId) {
          return { block, parent };
        }
        if (block.blocks) {
          const result = findBlockAndParent(block.blocks, targetId, block);
          if (result.block) return result;
        }
      }
      return { block: null, parent: null };
    };
    
    const activeData = findBlockAndParent(sectionBlocks, activeId);
    const overData = findBlockAndParent(sectionBlocks, overId);
    
    if (!activeData.block || !overData.block) return;
    
    // If blocks have different parents, don't allow reordering here
    if (activeData.parent?.id !== overData.parent?.id) {
      return;
    }
    
    // Same level reordering
    const blocksToReorder = activeData.parent ? activeData.parent.blocks! : sectionBlocks;
    const oldIndex = blocksToReorder.findIndex(block => block.id === activeId);
    const newIndex = blocksToReorder.findIndex(block => block.id === overId);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBlocks = arrayMove(blocksToReorder, oldIndex, newIndex);
      
      if (activeData.parent) {
        // Update parent's blocks and positions
        const reorderedWithPositions = reorderedBlocks.map((block, index) => ({
          ...block,
          position: index
        }));
        
        activeData.parent.blocks = reorderedWithPositions;
        
        // Also update settings.blocks if it's a container
        if (activeData.parent.type === 'container') {
          activeData.parent.settings = {
            ...activeData.parent.settings,
            blocks: reorderedWithPositions
          };
        }
        
        onUpdate?.(section.id, {
          blocks: [...sectionBlocks]
        });
      } else {
        // Top-level reordering
        const blockIds = reorderedBlocks.map(block => block.id);
        setLocalBlockOrder(blockIds);
        handleReorderBlocks(section.id, blockIds);
      }
    }
    } catch (error) {
      // Error handling for drag and drop operation
      // Optionally show user feedback here
    }
  };
  
  // Handle dropping a block into a container
  const handleDropInContainer = (containerId: string, draggedBlockId: string) => {
    try {
      if (!section.blocks) return;
      
      // Check for circular reference
      if (wouldCreateCircularReference(section.blocks, draggedBlockId, containerId)) {
        // Cannot drop block into itself or its children
        return;
      }
    
    // Create a deep copy to avoid mutations
    const blocksCopy = JSON.parse(JSON.stringify(section.blocks));
    
    // Find the dragged block and remove it from its current location
    let draggedBlock: Block | null = null;
    const removeBlock = (blocks: Block[]): Block[] => {
      return blocks.filter(block => {
        if (block.id === draggedBlockId) {
          draggedBlock = block;
          return false;
        }
        if (block.blocks) {
          block.blocks = removeBlock(block.blocks);
        }
        return true;
      });
    };
    
    const blocksWithoutDragged = removeBlock(blocksCopy);
    
    if (!draggedBlock) {
      // Dragged block not found
      return;
    }
    
    // Update positions after removal
    const updatePositions = (blocks: Block[]) => {
      blocks.forEach((block, index) => {
        block.position = index;
        if (block.blocks) {
          updatePositions(block.blocks);
        }
        // Also update settings.blocks for containers
        if (block.type === 'container' && block.settings?.blocks) {
          block.settings.blocks = block.blocks;
        }
      });
    };
    
    // Add the block to the target container
    const addToContainer = (blocks: Block[]): Block[] => {
      return blocks.map(block => {
        if (block.id === containerId && block.type === 'container') {
          const newBlocks = [...(block.blocks || []), draggedBlock!];
          // Set proper position for the new block
          draggedBlock!.position = newBlocks.length - 1;
          return {
            ...block,
            blocks: newBlocks,
            // Also update settings.blocks for container blocks
            settings: {
              ...block.settings,
              blocks: newBlocks
            }
          };
        }
        if (block.blocks) {
          return {
            ...block,
            blocks: addToContainer(block.blocks)
          };
        }
        return block;
      });
    };
    
    const finalBlocks = addToContainer(blocksWithoutDragged);
    updatePositions(finalBlocks);
    
    // Update section
    onUpdate?.(section.id, {
      blocks: finalBlocks
    });
    } catch (error) {
      // Error handling for container drop operation
      // Optionally show user feedback here
    }
  };

  // Sensors for drag and drop - only activate on drag handles
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px minimum drag distance
      },
      // Only activate drag on drag handles, not on form elements
      shouldHandleEvent: (event: any) => {
        const target = event.target as HTMLElement;
        
        // Don't activate drag on form elements or interactive elements
        if (target.tagName === 'SELECT' || 
            target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.tagName === 'BUTTON' ||
            target.closest('select') ||
            target.closest('input') ||
            target.closest('textarea') ||
            target.closest('button') ||
            target.closest('.section-inspector-simplified')) {
          return false;
        }
        
        // Only activate on drag handles
        return target.getAttribute('data-drag-handle') === 'true' ||
               target.closest('[data-drag-handle="true"]') !== null;
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Render block item - temporarily without drag&drop
  const renderBlockItem = (block: Block) => {
    const blockType = getBlockType(block.type);
    if (!blockType) return null;

    const isBlockSelected = selectedBlockId === block.id;

    return (
      <div
        key={block.id}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md transition-colors group",
          isBlockSelected 
            ? "bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)]" 
            : "hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-text-secondary)]"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          // Only select block if the click originated from this element
          if (e.currentTarget === e.target || e.currentTarget.contains(e.target as Node)) {
            onSelectBlock?.(block.id);
          }
        }}
      >
        {/* Drag Handle - Visual only */}
        <GripVertical className="h-2.5 w-2.5 text-[var(--nuvi-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Status indicator */}
        <div className={cn(
          "w-1 h-1 rounded-full flex-shrink-0",
          block.enabled ? "bg-[#8B9F7E]" : "bg-gray-300"
        )} />

        {/* Block Icon */}
        <blockType.icon className="h-2.5 w-2.5 flex-shrink-0" />

        {/* Block Title */}
        <span className="text-xs font-medium flex-1 truncate">
          {blockType.name}
        </span>

        {/* Quick Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateBlock(block.id, { enabled: !block.enabled });
            }}
            className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-[var(--nuvi-text-primary)]"
          >
            {block.enabled ? <Eye className="h-2 w-2" /> : <EyeOff className="h-2 w-2" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Show toast reminder for double-click
              const toast = document.createElement('div');
              toast.innerHTML = 'Double-click to delete';
              toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-xs z-50';
              document.body.appendChild(toast);
              setTimeout(() => document.body.removeChild(toast), 1500);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDeleteBlock(block.id);
            }}
            className="p-0.5 rounded-md text-[var(--nuvi-error)] hover:bg-[var(--nuvi-error-light)]"
            title="Double-click to delete block"
          >
            <Trash2 className="h-2 w-2" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-section-sidebar-id={section.id}
      className={cn(
        "group relative transition-all duration-200 mb-1 px-2",
        isDragging && "opacity-50 z-50"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg transition-all duration-200",
          isExpanded && "shadow-sm ring-1 ring-[var(--nuvi-primary)]/20",
          isSelected && !isExpanded && `${colors.bg} ${colors.border} border`,
          !isSelected && !isExpanded && "hover:bg-gray-50 border border-transparent",
          !section.enabled && "opacity-60"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-2 cursor-pointer relative",
            isExpanded && "border-b border-gray-100"
          )}
          onClick={(e) => {
        e.stopPropagation();
        // Clear any selected block when clicking section header
        if (onSelectBlock) {
          onSelectBlock(null);
        }
        onSelect();
      }}
        >
          {/* Section Drag Handle - Re-enabled */}
          {isDraggable && (
            <div
              {...listeners}
              data-section-drag-handle="true"
              className={cn(
                "p-0.5 transition-opacity flex-shrink-0 cursor-move",
                "text-gray-400 hover:text-gray-600",
                showActions ? "opacity-100" : "opacity-0"
              )}
            >
              <GripVertical className="h-3 w-3" />
            </div>
          )}

          {/* Status indicator */}
          <div className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            section.enabled ? "bg-[#8B9F7E]" : "bg-gray-300"
          )} />

          {/* Section Icon */}
          <div className={cn(
            "flex-shrink-0",
            isSelected || isExpanded ? colors.text : "text-gray-500"
          )}>
            <SectionIcon className="h-3.5 w-3.5" />
          </div>

          {/* Section Title - More space, no wrapping */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className={cn(
              "text-xs font-medium transition-colors leading-tight whitespace-nowrap overflow-hidden text-ellipsis",
              isSelected || isExpanded ? "text-gray-900" : "text-gray-700"
            )}>
              {section.title}
              {/* Block count indicator - inline with title */}
              {supportsBlocks(section.type) && (
                <span className="text-xs text-[var(--nuvi-text-muted)] ml-1">
                  {(() => {
                    const combinedBlocks = section.blocks || [];
                    
                    // Helper function to flatten nested blocks for count
                    const flattenBlocks = (blocks: any[], isNested = false): any[] => {
                      const flattened: any[] = [];
                      blocks.forEach(block => {
                        const blockWithNesting = { ...block, isNested };
                        flattened.push(blockWithNesting);
                        if (block.type === 'container') {
                          // Check both blocks and settings.blocks
                          const containerBlocks = block.blocks || block.settings?.blocks || [];
                          if (containerBlocks.length > 0) {
                            const childBlocks = flattenBlocks(containerBlocks, true);
                            flattened.push(...childBlocks);
                          }
                        }
                      });
                      return flattened;
                    };
                    
                    const allBlocks = flattenBlocks(combinedBlocks);
                    const blockCount = allBlocks.length;
                    return `(${blockCount})`;
                  })()}
                </span>
              )}
            </h3>
          </div>

          {/* Inline Actions - Show on hover or when selected */}
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity flex-shrink-0",
            (showActions || isSelected || isExpanded) ? "opacity-100" : "opacity-0"
          )}>
            {/* Visibility toggle */}
            <button
              onClick={(e) => handleQuickAction('visibility', e)}
              className={cn(
                "p-0.5 rounded-md transition-all",
                section.enabled 
                  ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
                  : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              )}
              title={section.enabled ? "Hide" : "Show"}
            >
              {section.enabled ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            </button>

            {/* Add Section Below */}
            <button
              onClick={(e) => handleQuickAction('addSection', e)}
              className="p-0.5 text-gray-400 hover:text-[#8B9F7E] hover:bg-[#8B9F7E]/10 rounded-md transition-all"
              title="Add section below"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => handleQuickAction('duplicate', e)}
              className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
              title="Duplicate"
            >
              <Copy className="h-2.5 w-2.5" />
            </button>

            {/* Delete - Show confirmation or delete button */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-0.5 bg-red-50 px-1 py-0.5 rounded border">
                <button
                  onClick={(e) => handleQuickAction('confirmDelete', e)}
                  className="p-0.5 text-red-600 hover:text-red-700 rounded-sm transition-all"
                  title="Confirm delete"
                >
                  <Check className="h-2.5 w-2.5" />
                </button>
                <button
                  onClick={(e) => handleQuickAction('cancelDelete', e)}
                  className="p-0.5 text-gray-500 hover:text-gray-600 rounded-sm transition-all"
                  title="Cancel"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => handleQuickAction('delete', e)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  // Double-click for instant delete
                  onDelete?.(section.id);
                }}
                className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                title="Click: Confirm delete | Double-click: Delete instantly"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* Expand indicator */}
          <ChevronRight 
            className={cn(
              "h-2.5 w-2.5 text-gray-400 transition-transform flex-shrink-0",
              isExpanded && "rotate-90"
            )}
          />
        </div>

        {/* Expanded Blocks Area */}
        {isExpanded && (
          <div className="bg-[var(--nuvi-background)]">
            {/* Blocks List */}
            {supportsBlocks(section.type) && (
              <div className="space-y-1 px-2 py-1">
                {/* Render combined blocks from both database and section with drag and drop */}
                {(() => {
                  const combinedBlocks = section.blocks || [];
                  
                  // Debug logging
                  if (section.type === 'product') {
                    console.log('[SectionItemMinimal] Product section blocks:', {
                      sectionId: section.id,
                      blocksCount: combinedBlocks.length,
                      blocks: combinedBlocks.map((b: any) => ({
                        id: b.id,
                        type: b.type,
                        hasBlocks: !!b.blocks,
                        hasSettingsBlocks: !!b.settings?.blocks,
                        childCount: (b.blocks || b.settings?.blocks || []).length
                      }))
                    });
                  }
                  
                  // Helper function to flatten nested childBlocks
                  const flattenBlocks = (blocks: any[], isNested = false): any[] => {
                    const flattened: any[] = [];
                    
                    blocks.forEach(block => {
                      // Add isNested flag to track hierarchy
                      const blockWithNesting = { ...block, isNested };
                      flattened.push(blockWithNesting);
                      
                      // If this is a container block with child blocks, add them as well
                      // Check both blocks and settings.blocks
                      if (block.type === 'container') {
                        const nestedBlocks = block.blocks || block.settings?.blocks || [];
                        if (nestedBlocks.length > 0) {
                          const childBlocks = flattenBlocks(nestedBlocks, true);
                          flattened.push(...childBlocks);
                        }
                      }
                    });
                    
                    return flattened;
                  };
                  
                  // Flatten the combined blocks to include nested childBlocks
                  const allBlocks = flattenBlocks(combinedBlocks);
                  
                  // Create a map for quick block lookup
                  const blockMap = new Map(allBlocks.map(block => [block.id, block]));
                  
                  // Use local order if available, otherwise use current block order
                  const orderedBlockIds = localBlockOrder.length > 0 ? localBlockOrder : allBlocks.map(block => block.id);
                  const orderedBlocks = orderedBlockIds.map(id => blockMap.get(id)).filter(Boolean);
                  
                  // Add prefix to block IDs to avoid conflicts with section IDs
                  const prefixedBlockIds = orderedBlockIds.map(id => `block-${id}`);
                  
                  // Block DnD re-enabled with isolated context
                  return (
                    <DndContext
                      collisionDetection={customCollisionDetection}
                      onDragEnd={handleBlockDragEnd}
                      sensors={sensors}
                      modifiers={[restrictToVerticalAxis]}
                    >
                      <SortableContext
                        items={prefixedBlockIds}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {section.blocks?.map((block) => (
                            <SortableBlockWithContainer
                              key={block.id}
                              block={block}
                              isSelected={selectedBlockId === block.id}
                              onSelect={() => onSelectBlock?.(block.id)}
                              onUpdateBlock={handleUpdateBlock}
                              onDeleteBlock={(sectionId, blockId) => handleDeleteBlock(blockId)}
                              onDropInContainer={handleDropInContainer}
                              onSelectBlock={onSelectBlock}
                              onAddBlock={(containerId, buttonElement) => {
                                // Show the add block sidebar for the container
                                if (onOpenBlockSidebar) {
                                  onOpenBlockSidebar(section.id, containerId);
                                } else {
                                  setShowAddBlockSidebar(true);
                                  setAddingToContainer(containerId);
                                }
                              }}
                              sectionId={section.id}
                              isNested={false}
                              depth={0}
                              selectedBlockId={selectedBlockId}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  );
                })()}
                
                {/* Add Block Button - Only show for non-temporary sections */}
                {!section.id.startsWith('temp-') && (
                  <div className="relative mt-2">
                    <button
                      onClick={(e) => {
                        // Add Block button clicked
                        e.stopPropagation();
                        if (onOpenBlockSidebar) {
                          onOpenBlockSidebar(section.id);
                        } else {
                          setShowAddBlockSidebar(true);
                          setAddingToContainer(null);
                        }
                      }}
                      disabled={blocksLoading}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1.5 w-full text-left rounded-md transition-colors border border-dashed border-[var(--nuvi-border)]",
                        blocksLoading 
                          ? "opacity-50 cursor-not-allowed" 
                          : "hover:bg-[var(--nuvi-primary-lighter)]"
                      )}
                    >
                      <Plus className="h-2.5 w-2.5 text-[var(--nuvi-text-muted)]" />
                      <span className="text-xs font-medium text-[var(--nuvi-text-muted)]">
                        {blocksLoading ? 'Loading...' : 'Add Block'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Settings for sections without blocks */}
            {!supportsBlocks(section.type) && (
              <div className="p-3 text-xs text-[var(--nuvi-text-muted)]">
                {/* Empty state for sections without blocks */}
              </div>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}