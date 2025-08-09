'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SectionItemMinimal } from './section-item-minimal';
import { AddItemSidebarInline } from './add-item-sidebar-inline';
import { 
  Layout, ShoppingBag, Type, Image, Mail, Users, 
  MessageSquare, Instagram, Palette, Layers, Plus,
  Search, Filter, ChevronDown, X, Loader2, Sparkles,
  Grid, Video, Clock, TrendingUp, Star, AlertCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Section, Block } from '../types';

interface ThemeSection {
  id: string;
  type: string;
  name: string;
  description: string | null;
  schema: {
    category: string;
    defaultSettings: any;
    isRequired?: boolean;
    isPremium?: boolean;
  };
}

interface SectionListInlineProps {
  sections: Section[];
  selectedSection: Section | null;
  selectedBlockId?: string;
  selectedPage?: string;
  onSelectSection: (section: Section | null) => void;
  onSelectBlock?: (blockId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicateSection?: (section: Section) => void;
  onUpdateSection?: (sectionId: string, updates: any, skipHistory?: boolean) => void;
  onAddSection?: (section: { type: string; title: string; settings: any }) => void;
  onAddBlock?: (sectionId: string, blockType: string) => void;
  onUpdateBlock?: (sectionId: string, blockId: string, updates: any) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onReorderBlocks?: (sectionId: string, blockIds: string[]) => void;
  onReorderSections?: (sections: Section[]) => void;
  subdomain?: string;
  showInlineSettings?: boolean;
  isCollapsed?: boolean;
  theme?: string;
}

// Page-specific sections that should only show on certain pages
const pageSpecificSections = {
  'login': ['login-form', 'auth-header', 'auth-footer'],
  'register': ['register-form', 'auth-header', 'auth-footer'],
  'forgot-password': ['password-reset', 'auth-header', 'auth-footer'],
  'reset-password': ['password-reset', 'auth-header', 'auth-footer'],
  'account': ['account-dashboard', 'account-profile', 'order-history', 'container'],
  'orders': ['orders-list', 'order-filters', 'order-pagination'],
  'order-details': ['order-details', 'order-tracking', 'order-actions'],
  'addresses': ['address-list', 'add-address', 'address-form'],
  'wishlist': ['wishlist-items', 'wishlist-actions', 'recommended-products'],
  'cart': ['cart', 'cart-drawer', 'shipping-calculator'],
  'checkout': ['checkout-form', 'order-summary', 'shipping-methods', 'payment-method'],
  'search': ['search-results', 'search-filters', 'search-header', 'search-suggestions', 'trending-products'],
  'contact': ['contact-form', 'contact-info', 'map-section'],
  'track-order': ['track-order-form', 'order-tracking-status', 'tracking-timeline'],
  'compare': ['compare-table', 'compare-features', 'compare-actions'],
  'blog': ['blog-list', 'blog-categories', 'blog-sidebar'],
  'blog-post': ['blog-article', 'blog-comments', 'related-posts'],
  'gift-cards': ['gift-card-purchase', 'gift-card-balance', 'gift-card-designs'],
  'store-locator': ['store-map', 'store-list', 'store-filters'],
  'size-guide': ['size-chart', 'size-calculator', 'size-recommendations'],
  'shipping-returns': ['shipping-info', 'return-policy', 'shipping-calculator'],
  'faq': ['faq-categories', 'faq-items', 'faq-search'],
  'about': ['about-hero', 'about-story', 'team-members', 'company-values'],
  'reviews': ['reviews-list', 'reviews-summary', 'review-form'],
  'loyalty': ['loyalty-dashboard', 'points-history', 'rewards-catalog'],
  '404': ['error-404', 'error-hero', 'error-navigation'],
  'collection': ['collection-banner', 'main-collection-product-grid', 'collection-filters'],
  'product': ['product'],
};

// Get page-specific sections that are allowed for current page
const getPageSpecificSections = (selectedPage: string) => {
  return (pageSpecificSections as { [key: string]: string[] })[selectedPage] || [];
};

// Common sections that should be available on all pages
const commonSections = [
  'hero', 'hero-banner', 'hero-skateshop', 'rich-text', 'image-with-text', 'video', 
  'newsletter', 'testimonials', 'countdown', 'instagram-feed',
  'logo-list', 'collections', 'collection-list', 'featured-products',
  'best-sellers', 'recently-viewed', 'product-recommendations',
  'faq', 'contact-form', 'collection-banner', 'main-collection-product-grid',
  'container', 'categories', 'features', 'product-grid', 'cta',
  'header', 'footer', 'announcement-bar'
];

// Get all page-specific section types across all pages
const getAllPageSpecificSectionTypes = () => {
  const allPageSpecific = new Set<string>();
  Object.values(pageSpecificSections).forEach(sections => {
    sections.forEach(section => allPageSpecific.add(section));
  });
  return allPageSpecific;
};

// Check if section should be shown based on current page
const shouldShowSection = (sectionType: string, selectedPage: string) => {
  // For theme-specific sections (from available-sections.ts), always show them
  // These include hero-skateshop, categories, features, etc.
  
  // Always show common sections (these work on all pages)
  if (commonSections.includes(sectionType)) {
    return true;
  }
  
  const allPageSpecificTypes = getAllPageSpecificSectionTypes();
  const currentPageAllowedTypes = getPageSpecificSections(selectedPage);
  
  // If section is page-specific
  if (allPageSpecificTypes.has(sectionType)) {
    // Only show it if it's allowed on current page
    return currentPageAllowedTypes.includes(sectionType);
  }
  
  // For any section type not explicitly listed (like theme-specific sections),
  // show them - this allows themes to define their own custom sections
  return true;
};

// Section categories for filtering
const sectionCategories = {
  header: {
    title: 'Header',
    types: ['header', 'announcement-bar'],
    icon: Layout,
    color: 'blue'
  },
  footer: {
    title: 'Footer', 
    types: ['footer'],
    icon: Layout,
    color: 'blue'
  },
  content: {
    title: 'Content',
    types: ['hero', 'hero-skateshop', 'rich-text', 'image-with-text', 'video', 'faq', 'features', 'cta'],
    icon: Type,
    color: 'green'
  },
  commerce: {
    title: 'Commerce', 
    types: ['product-grid', 'featured-products', 'collections', 'cart', 'collection', 'search-results', 'categories'],
    icon: ShoppingBag,
    color: 'purple'
  },
  account: {
    title: 'Account',
    types: ['login-form', 'register-form', 'account-profile', 'account-dashboard', 'order-history'],
    icon: Users,
    color: 'blue'
  },
  marketing: {
    title: 'Marketing',
    types: ['newsletter', 'testimonials', 'countdown', 'instagram-feed'],
    icon: Mail,
    color: 'orange'
  }
};

// Icon mapping
const sectionIcons: Record<string, any> = {
  'hero': Layout,
  'hero-skateshop': Layout,
  'header': Layout,
  'footer': Layout,
  'announcement-bar': Sparkles,
  'featured-products': ShoppingBag,
  'product-grid': Grid,
  'categories': Grid,
  'features': Star,
  'cta': Sparkles,
  'collections': Palette,
  'image-with-text': Image,
  'rich-text': Type,
  'video': Video,
  'faq': MessageSquare,
  'newsletter': Mail,
  'testimonials': Star,
  'countdown': Clock,
  'instagram-feed': Instagram,
  'logo-list': Users,
  'cart': ShoppingBag,
  'collection': Palette,
  'search-results': Search,
  'login-form': Users,
  'register-form': Users,
  'account-profile': Users,
  'account-dashboard': Users,
  'order-history': ShoppingBag,
  'blog-list': Type,
  'blog-article': Type,
  'order-confirmation': ShoppingBag,
  'error-404': AlertCircle,
  'contact-form': Mail,
  'related-products': ShoppingBag,
  'product': ShoppingBag,
  'breadcrumb': ChevronRight,
};

export function SectionListInline({ 
  sections, 
  selectedSection,
  selectedBlockId,
  selectedPage = 'homepage',
  onSelectSection,
  onSelectBlock, 
  onDeleteSection, 
  onToggleVisibility,
  onDuplicateSection,
  onUpdateSection,
  onAddSection,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onReorderSections,
  subdomain,
  showInlineSettings = false,
  isCollapsed = false,
  theme
}: SectionListInlineProps) {
  // Debug log for sections changes - disabled to prevent excessive re-renders
  // useEffect(() => {
  //   console.log('[SectionListInline] Sections prop changed:', {
  //     length: sections.length,
  //     ids: sections.map(s => s.id),
  //     types: sections.map(s => s.type),
  //     isEmpty: sections.length === 0,
  //     selectedPage
  //   });
  //   
  //   // Check if sections are still loading vs actually empty
  //   if (sections.length === 0) {
  //     console.log('[SectionListInline] Sections array is empty - this might be initial loading state');
  //   }
  // }, [sections.length, selectedPage]);

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddSidebar, setShowAddSidebar] = useState(false);
  const [availableSections, setAvailableSections] = useState<ThemeSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [sidebarType, setSidebarType] = useState<'section' | 'block'>('section');
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [currentContainerId, setCurrentContainerId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // DnD sensors
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
  
  // Load available sections on component mount only once
  const hasLoadedSections = useRef(false);
  useEffect(() => {
    if (subdomain && !hasLoadedSections.current) {
      hasLoadedSections.current = true;
      loadAvailableSections();
    }
  }, [subdomain]);

  const loadAvailableSections = async () => {
    try {
      setLoadingSections(true);
      
      // console.log('[SectionListInline] Loading available sections...');
      // console.log('[SectionListInline] Subdomain:', subdomain);
      
      // Get store's active theme
      const storeResponse = await fetch(`/api/stores/${subdomain}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      // console.log('[SectionListInline] Store API response status:', storeResponse.status);
      
      if (!storeResponse.ok) {
        const errorData = await storeResponse.text();
        console.error('[SectionListInline] Store API error:', storeResponse.status, errorData);
        throw new Error(`Failed to load store: ${storeResponse.status}`);
      }
      const storeResult = await storeResponse.json();
      const storeData = storeResult.data || storeResult;
      
      // console.log('[SectionListInline] Store data:', storeData);
      
      // Get available sections from section schemas API
      // console.log('[SectionListInline] Loading available section types');
      const sectionsResponse = await fetch(`/api/stores/${subdomain}/sections/available`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      // console.log('[SectionListInline] Sections API response status:', sectionsResponse.status);
      
      if (!sectionsResponse.ok) {
        const errorData = await sectionsResponse.text();
        console.error('[SectionListInline] Sections API error:', sectionsResponse.status, errorData);
        throw new Error(`Failed to load sections: ${sectionsResponse.status}`);
      }
      
      const sectionsResult = await sectionsResponse.json();
      const availableSections = sectionsResult.data || sectionsResult;
      // console.log('[SectionListInline] Loaded available sections:', availableSections);
      // console.log('[SectionListInline] Number of sections:', availableSections.length);
      // console.log('[SectionListInline] First section:', availableSections[0]);
      setAvailableSections(availableSections);
      
    } catch (error) {
      console.error('[SectionListInline] Failed to load sections:', error);
      toast.error(`Failed to load sections: ${(error as Error).message}`);
    } finally {
      setLoadingSections(false);
    }
  };

  // Filter available sections based on current page
  const filteredAddSections = useMemo(() => {
    // console.log('[SectionListInline] Filtering available sections:', {
    //   availableSectionsCount: availableSections.length,
    //   selectedPage
    // });
    
    const filtered = availableSections.filter(section => {
      const sectionType = section.type || section.id || '';
      const shouldShow = shouldShowSection(sectionType, selectedPage);
      // console.log('[SectionListInline] Filtering section:', { 
      //   sectionType, 
      //   selectedPage, 
      //   shouldShow, 
      //   sectionName: section.name 
      // });
      return shouldShow;
    });
    
    // console.log('[SectionListInline] Filtered sections count:', filtered.length);
    return filtered;
  }, [availableSections, selectedPage]);


  
  // Filter existing sections
  const filteredSections = useMemo(() => {
    // console.log('[SectionListInline] Filtering sections:', {
    //   totalSections: sections.length,
    //   searchQuery,
    //   filterEnabled,
    //   categoryFilter,
    //   selectedPage,
    //   sectionsIds: sections.map(s => s.id),
    //   rawSections: sections
    // });
    
    let filtered = sections;
    
    // First filter by page-specific sections
    filtered = filtered.filter(section => {
      const sectionType = section.type || section.sectionType || '';
      const shouldShow = shouldShowSection(sectionType, selectedPage);
      // console.log('Filtering section:', { sectionType, selectedPage, shouldShow });
      return shouldShow;
    });
    
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.type || section.sectionType || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (filterEnabled !== 'all') {
      filtered = filtered.filter(section => 
        filterEnabled === 'enabled' ? section.enabled : !section.enabled
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(section => {
        const sectionType = section.type || section.sectionType || '';
        const config = sectionCategories[categoryFilter as keyof typeof sectionCategories];
        return config ? config.types.includes(sectionType) : false;
      });
    }
    
    // console.log('[SectionListInline] Filtered sections:', {
    //   filteredCount: filtered.length,
    //   filteredIds: filtered.map(s => s.id)
    // });
    
    return filtered;
  }, [sections, searchQuery, filterEnabled, categoryFilter, selectedPage]);


  const handleSelectSection = (section: Section) => {
    // console.log('[SectionListInline] Section selected:', section.id);
    
    // Always select and scroll to section when clicked
    onSelectSection(section);
    
    // Toggle expansion behavior: if already expanded, collapse it
    if (expandedSectionId === section.id) {
      setExpandedSectionId(null);
    } else {
      setExpandedSectionId(section.id);
    }
    
    // Force scroll by sending message to parent with timestamp
    if (typeof window !== 'undefined' && window.parent) {
      // console.log('[SectionListInline] Sending force scroll message');
      window.parent.postMessage({
        type: 'THEME_STUDIO_FORCE_SCROLL',
        sectionId: section.id,
        timestamp: Date.now()
      }, '*');
    }
  };
  
  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id && over?.id) {
      const oldIndex = filteredSections.findIndex((section) => section.id === active.id);
      const newIndex = filteredSections.findIndex((section) => section.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(filteredSections, oldIndex, newIndex);
        
        // Update positions
        const updatedSections = sections.map(section => {
          const newSection = newSections.find(s => s.id === section.id);
          if (newSection) {
            const newPosition = newSections.indexOf(newSection);
            return { ...section, position: newPosition };
          }
          return section;
        });
        
        // Call onReorderSections with updated sections
        onReorderSections?.(updatedSections);
      }
    }
    
    setActiveId(null);
  };
  
  // Update expanded section when selected section changes from outside
  useEffect(() => {
    if (selectedSection) {
      // If a different section is selected from preview, expand it
      if (expandedSectionId !== selectedSection.id) {
        setExpandedSectionId(selectedSection.id);
      }
    } else {
      setExpandedSectionId(null);
    }
  }, [selectedSection?.id]);

  const handleAddSection = (section: ThemeSection) => {
    // console.log('[SectionListInline] handleAddSection called:', {
    //   sectionType: section.type,
    //   sectionName: section.name,
    //   insertPosition,
    //   currentSectionsCount: sections.length
    // });
    
    // Calculate the target position based on insertPosition
    let targetPosition = sections.length; // Default: add at end
    
    if (insertPosition !== null) {
      targetPosition = insertPosition;
    }
    
    // console.log('[SectionListInline] Adding section at position:', targetPosition);
    
    onAddSection?.({
      type: section.type,
      title: section.name,
      settings: section.schema?.defaultSettings || {},
      position: targetPosition
    });
    
    // Reset state
    setShowAddSidebar(false);
    setInsertPosition(null);
  };

  // Count stats
  const stats = {
    total: sections.length,
    enabled: sections.filter(s => s.enabled).length,
    disabled: sections.filter(s => !s.enabled).length
  };

  // Handle opening block sidebar
  const handleOpenBlockSidebar = (sectionId: string, containerId?: string) => {
    // console.warn('🚀 [handleOpenBlockSidebar] Called with:', { sectionId, containerId });
    setCurrentSectionId(sectionId);
    setCurrentContainerId(containerId || null);
    setSidebarType('block');
    setShowAddSidebar(true);
  };

  // Handle opening section sidebar
  const handleOpenSectionSidebar = (position: number) => {
    setInsertPosition(position);
    setSidebarType('section');
    setShowAddSidebar(true);
  };

  // Collapsed sidebar view - show only icons
  if (isCollapsed) {
    return (
      <div className="nuvi-flex nuvi-flex-col nuvi-h-full nuvi-py-sm">
        {/* Section icons - simplified */}
        <div className="nuvi-flex nuvi-flex-col nuvi-w-full nuvi-px-xs nuvi-overflow-y-auto nuvi-space-y-xs">
          {sections.map((section) => {
            const Icon = sectionIcons[section.type || section.sectionType] || Layers;
            
            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section)}
                className={cn(
                  "nuvi-w-full nuvi-p-sm nuvi-rounded-md nuvi-transition-colors nuvi-relative nuvi-flex nuvi-items-center nuvi-justify-center",
                  selectedSection?.id === section.id
                    ? "nuvi-bg-primary nuvi-text-primary-foreground"
                    : section.enabled
                    ? "nuvi-text-foreground hover:nuvi-bg-muted"
                    : "nuvi-text-muted hover:nuvi-bg-muted/50"
                )}
                title={section.title}
              >
                <Icon className="h-4 w-4" />
                {!section.enabled && (
                  <div className="nuvi-absolute -nuvi-top-xs -nuvi-right-xs nuvi-w-2 nuvi-h-2 nuvi-bg-muted nuvi-rounded-full"></div>
                )}
              </button>
            );
          })}
          
          {/* Add button */}
          <div className="nuvi-relative">
            <button
              onClick={() => {
                handleOpenSectionSidebar(sections.length);
              }}
              className="nuvi-w-full nuvi-p-xs nuvi-text-muted hover:nuvi-text-primary hover:nuvi-bg-muted nuvi-rounded-md nuvi-transition-colors nuvi-flex nuvi-items-center nuvi-justify-center nuvi-border nuvi-border-dashed hover:nuvi-border-border"
              title="Add Section"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col h-full">
      {/* Compact Header */}
      <div className="px-3 py-2 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Sections
            </h3>
            <span className="text-[10px] text-gray-400">({stats.total})</span>
          </div>
          
          {/* Compact stats - moved to title level */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#8B9F7E]"></div>
              <span className="text-gray-500">{stats.enabled} active</span>
            </span>
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
              <span className="text-gray-500">{stats.disabled} hidden</span>
            </span>
            {categoryFilter !== 'all' && (
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                <span className="text-gray-500">
                  {sectionCategories[categoryFilter as keyof typeof sectionCategories]?.title}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search and filters - more compact */}
      {sections.length > 3 && (
        <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md focus-within:border-[var(--nuvi-primary)] transition-colors">
              <Search className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search sections"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-xs placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-md hover:bg-gray-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
            
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:border-[var(--nuvi-primary)] focus:outline-none"
            >
              <option value="all">All</option>
              {Object.entries(sectionCategories).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-start h-full p-6 pt-16">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Layers className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              {searchQuery ? 'No sections found' : 'No sections yet'}
            </h3>
            <p className="text-xs text-gray-500 text-center mb-4">
              {searchQuery ? `No sections match "${searchQuery}"` : 'Add your first section to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => {
                  handleOpenSectionSidebar(0);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--nuvi-primary)] text-white rounded-lg hover:bg-[var(--nuvi-primary-dark)] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Section
              </button>
            )}
          </div>
        ) : categoryFilter === 'all' ? (
          /* Flat position-based view for proper drag & drop */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredSections.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="py-1 relative">
                {[...filteredSections].sort((a, b) => a.position - b.position).map((section, index) => (
                  <div key={section.id} className="relative">
                    <SectionItemMinimal
                      section={section}
                      isSelected={selectedSection?.id === section.id}
                      isExpanded={expandedSectionId === section.id}
                      onSelect={() => handleSelectSection(section)}
                      onDelete={onDeleteSection}
                      onToggleVisibility={onToggleVisibility}
                      onDuplicate={() => onDuplicateSection?.(section)}
                      onUpdate={onUpdateSection}
                      onAddSection={onAddSection}
                      onAddBlock={onAddBlock}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onSelectBlock={onSelectBlock}
                      onReorderBlocks={onReorderBlocks}
                      selectedBlockId={selectedBlockId}
                      showInlineSettings={showInlineSettings}
                      subdomain={subdomain}
                      theme={theme}
                      onOpenBlockSidebar={handleOpenBlockSidebar}
                      onOpenSectionSidebar={handleOpenSectionSidebar}
                      isDraggable={true}
                    />
                    
                    {/* Hover insertion area between sections */}
                    <div className="h-2 group/insert hover:h-8 transition-all duration-300 flex items-center justify-center relative z-10">
                      <button
                        onClick={() => {
                          handleOpenSectionSidebar(section.position + 1);
                        }}
                        className="opacity-0 group-hover/insert:opacity-100 hover:opacity-100 w-6 h-6 bg-[var(--nuvi-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125 z-20"
                        title="Add section here"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Add Section Button at end */}
                <div className="px-3 py-1">
                  <button
                    onClick={() => {
                      handleOpenSectionSidebar(sections.length);
                    }}
                    className="w-full py-1.5 px-2 bg-gray-50/50 hover:bg-gray-100 border border-dashed border-gray-200 hover:border-gray-300 rounded-md transition-colors flex items-center justify-center text-gray-500 hover:text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </SortableContext>
            
            {/* Drag Overlay */}
            <DragOverlay>
              {activeId ? (
                <div className="bg-white rounded-lg shadow-xl opacity-90 p-2">
                  <div className="text-sm font-medium">
                    {filteredSections.find(s => s.id === activeId)?.title}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          /* Flat view when filtering by specific category */
          <div className="py-1 relative">
            {filteredSections.map((section, index) => (
              <div key={section.id} className="relative">
                <SectionItemMinimal
                  section={section}
                  isSelected={selectedSection?.id === section.id}
                  isExpanded={expandedSectionId === section.id}
                  onSelect={() => handleSelectSection(section)}
                  onDelete={onDeleteSection}
                  onToggleVisibility={onToggleVisibility}
                  onDuplicate={() => onDuplicateSection?.(section)}
                  onUpdate={onUpdateSection}
                  onAddSection={onAddSection}
                  onAddBlock={onAddBlock}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteBlock={onDeleteBlock}
                  onSelectBlock={onSelectBlock}
                  onReorderBlocks={onReorderBlocks}
                  selectedBlockId={selectedBlockId}
                  showInlineSettings={showInlineSettings}
                  subdomain={subdomain}
                  theme={theme}
                  onOpenBlockSidebar={handleOpenBlockSidebar}
                  onOpenSectionSidebar={handleOpenSectionSidebar}
                />
                
                {/* Hover insertion area between sections */}
                <div className="h-2 group/insert hover:h-8 transition-all duration-300 flex items-center justify-center relative z-10">
                  <button
                    onClick={() => {
                      handleOpenSectionSidebar(section.position + 1);
                    }}
                    className="opacity-0 group-hover/insert:opacity-100 hover:opacity-100 w-6 h-6 bg-[var(--nuvi-primary)] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-125 z-20"
                    title="Add section here"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Final Add Section Button */}
            <div className="relative px-3 py-1">
              <button
                onClick={() => {
                  handleOpenSectionSidebar(sections.length);
                }}
                className="w-full py-1.5 px-2 border border-dashed rounded-md transition-all flex items-center justify-center bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600"
                title="Add Section"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Add Item Sidebar - Slides up from bottom within the sidebar */}
      <AddItemSidebarInline
        isOpen={showAddSidebar}
        onClose={() => {
          setShowAddSidebar(false);
          setInsertPosition(null);
          setCurrentSectionId(null);
          setCurrentContainerId(null);
        }}
        type={sidebarType}
        items={sidebarType === 'section' ? filteredAddSections : (() => {
          // Get blocks for the current section
          if (!currentSectionId) return [];
          const section = sections.find(s => s.id === currentSectionId);
          if (!section) return [];
          
          // Import getBlocksForSection
          const { getBlocksForSection } = require('@/lib/block-configs');
          const sectionType = section.type || section.sectionType;
          
          // Debug: Log section details - disabled to prevent excessive re-renders
          // console.warn('🔍 [DEBUG] Section details:', {
          //   sectionId: section.id,
          //   sectionType: sectionType,
          //   sectionTitle: section.title,
          //   sectionTypeField: section.type,
          //   sectionSectionTypeField: section.sectionType,
          //   fullSection: section
          // });
          
          const blocks = getBlocksForSection(sectionType, false, theme, currentContainerId ? section.blocks?.find(b => b.id === currentContainerId)?.type : undefined);
          // console.warn('📦 [DEBUG] Blocks returned:', blocks);
          return blocks;
        })()}
        onSelect={(item) => {
          if (sidebarType === 'section') {
            handleAddSection(item);
          } else {
            // Handle block selection
            if (currentContainerId) {
              // Adding to container - handle locally in section
              const section = sections.find(s => s.id === currentSectionId);
              if (section) {
                // Find the container and add block
                const newBlockId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const newBlock = {
                  id: newBlockId,
                  type: item.id,
                  position: 0,
                  enabled: true,
                  settings: {}
                };
                
                // Update section with new block in container
                const updateBlocksInContainer = (blocks: any[]): any[] => {
                  return blocks.map(block => {
                    if (block.id === currentContainerId) {
                      const currentBlocks = block.blocks || block.settings?.blocks || [];
                      const newBlocks = [...currentBlocks, { ...newBlock, position: currentBlocks.length }];
                      return {
                        ...block,
                        blocks: newBlocks,
                        settings: {
                          ...block.settings,
                          blocks: newBlocks
                        }
                      };
                    }
                    if (block.blocks) {
                      return {
                        ...block,
                        blocks: updateBlocksInContainer(block.blocks)
                      };
                    }
                    return block;
                  });
                };
                
                const updatedBlocks = updateBlocksInContainer(section.blocks || []);
                onUpdateSection?.(currentSectionId, { blocks: updatedBlocks });
              }
            } else {
              // Adding to section
              if (currentSectionId && onAddBlock) {
                onAddBlock(currentSectionId, item.id);
              } else {
                console.error('[SectionListInline] Cannot add block - missing section ID or handler');
              }
            }
            setShowAddSidebar(false);
            setCurrentSectionId(null);
            setCurrentContainerId(null);
          }
        }}
        loading={loadingSections}
        selectedPage={selectedPage}
        sectionType={currentSectionId ? sections.find(s => s.id === currentSectionId)?.type : undefined}
        containerType={currentContainerId ? sections.find(s => s.id === currentSectionId)?.blocks?.find(b => b.id === currentContainerId)?.type : undefined}
      />
    </div>
  );
}
