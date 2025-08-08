'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SectionItemMinimal } from './section-item-minimal';
import { 
  Layout, ShoppingBag, Type, Image, Mail, Users, 
  MessageSquare, Instagram, Palette, Layers, Plus,
  Search, Filter, ChevronDown, X, Loader2, Sparkles,
  Grid, Video, Clock, TrendingUp, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Section {
  id: string;
  type: string;
  sectionType: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

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
  onSelectSection: (section: Section | null) => void;
  onDeleteSection?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicateSection?: (section: Section) => void;
  onUpdateSection?: (sectionId: string, updates: any, skipHistory?: boolean) => void;
  onAddSection?: (section: { type: string; title: string; settings: any }) => void;
  storeId: string;
  showInlineSettings?: boolean;
  isCollapsed?: boolean;
}

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
    types: ['hero', 'rich-text', 'image-with-text', 'video', 'faq'],
    icon: Type,
    color: 'green'
  },
  commerce: {
    title: 'Commerce', 
    types: ['product-grid', 'featured-products', 'collections'],
    icon: ShoppingBag,
    color: 'purple'
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
  'header': Layout,
  'footer': Layout,
  'announcement-bar': Sparkles,
  'featured-products': ShoppingBag,
  'product-grid': Grid,
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
};

export function SectionListInline({ 
  sections, 
  selectedSection, 
  onSelectSection, 
  onDeleteSection, 
  onToggleVisibility,
  onDuplicateSection,
  onUpdateSection,
  onAddSection,
  storeId,
  showInlineSettings = false,
  isCollapsed = false
}: SectionListInlineProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [availableSections, setAvailableSections] = useState<ThemeSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [addMenuSearch, setAddMenuSearch] = useState('');
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  
  // Load available sections when add menu opens
  useEffect(() => {
    if (showAddMenu && availableSections.length === 0) {
      loadAvailableSections();
    }
  }, [showAddMenu]);

  // Close add menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside the portal dropdown
      const portalDropdown = document.querySelector('[data-dropdown-visible="true"]');
      if (portalDropdown && portalDropdown.contains(target)) {
        return;
      }
      
      // Check if click is on any add button
      const isAddButton = (target as Element).closest('button')?.querySelector('.lucide-plus');
      if (isAddButton) {
        return;
      }
      
      // Close dropdown if clicking outside
      setShowAddMenu(false);
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddMenu]);

  const loadAvailableSections = async () => {
    try {
      setLoadingSections(true);
      
      // Get store's active theme
      const storeResponse = await fetch(`/api/stores/${storeId}`);
      if (!storeResponse.ok) {
        const errorData = await storeResponse.text();
        console.error('Store API error:', storeResponse.status, errorData);
        throw new Error(`Failed to load store: ${storeResponse.status}`);
      }
      const storeData = await storeResponse.json();
      
      console.log('Store data:', storeData);
      
      if (!storeData.activeThemeId) {
        toast.error('No active theme found for this store');
        return;
      }

      // Get theme sections
      console.log('Loading sections for theme:', storeData.activeThemeId);
      const sectionsResponse = await fetch(`/api/themes/${storeData.activeThemeId}/sections`);
      if (!sectionsResponse.ok) {
        const errorData = await sectionsResponse.text();
        console.error('Sections API error:', sectionsResponse.status, errorData);
        throw new Error(`Failed to load sections: ${sectionsResponse.status}`);
      }
      
      const themeSections = await sectionsResponse.json();
      console.log('Loaded theme sections:', themeSections);
      setAvailableSections(themeSections);
      
    } catch (error) {
      console.error('Failed to load sections:', error);
      toast.error(`Failed to load sections: ${error.message}`);
    } finally {
      setLoadingSections(false);
    }
  };

  // Filter available sections for add menu
  const filteredAddSections = useMemo(() => {
    let filtered = availableSections;
    
    if (addMenuSearch) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(addMenuSearch.toLowerCase()) ||
        section.type.toLowerCase().includes(addMenuSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [availableSections, addMenuSearch]);


  const calculateDropdownPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = Math.min(280, viewportWidth - 32); // Slightly wider for better content fit
    
    let x = rect.right + 8; // 8px margin to the right
    let y = rect.top;
    
    // If dropdown would go off-screen to the right, position it to the left
    if (x + dropdownWidth > viewportWidth - 16) {
      x = rect.left - dropdownWidth - 8;
      // If still off-screen to the left, center it relative to the button
      if (x < 16) {
        x = Math.max(16, rect.left - dropdownWidth / 2);
      }
    }
    
    // Final bounds check to ensure it fits on screen
    if (x < 16) x = 16;
    if (x + dropdownWidth > viewportWidth - 16) {
      x = viewportWidth - dropdownWidth - 16;
    }
    
    // Ensure dropdown doesn't go off top or bottom
    const maxHeight = Math.min(400, viewportHeight * 0.8); // Max 400px height
    if (y + maxHeight > viewportHeight - 20) {
      y = Math.max(20, viewportHeight - maxHeight - 20);
    }
    if (y < 20) {
      y = 20;
    }
    
    return { x, y };
  };
  
  // Filter existing sections
  const filteredSections = useMemo(() => {
    let filtered = sections;
    
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
    
    return filtered;
  }, [sections, searchQuery, filterEnabled, categoryFilter]);


  const handleSelectSection = (section: Section) => {
    // Toggle behavior: if already expanded, collapse it
    if (expandedSectionId === section.id) {
      setExpandedSectionId(null);
      onSelectSection(null);
    } else {
      onSelectSection(section);
      setExpandedSectionId(section.id);
    }
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
    // Calculate the target position based on insertPosition
    let targetPosition = sections.length; // Default: add at end
    
    if (insertPosition !== null) {
      targetPosition = insertPosition;
    }
    
    onAddSection?.({
      type: section.type,
      title: section.name,
      settings: section.schema?.defaultSettings || {},
      position: targetPosition
    });
    
    // Reset state
    setShowAddMenu(false);
    setAddMenuSearch('');
    setInsertPosition(null);
  };

  // Count stats
  const stats = {
    total: sections.length,
    enabled: sections.filter(s => s.enabled).length,
    disabled: sections.filter(s => !s.enabled).length
  };

  // Collapsed sidebar view - show only icons
  if (isCollapsed) {
    return (
      <div className="flex flex-col h-full py-2">
        {/* Section icons - simplified */}
        <div className="flex flex-col w-full px-1 overflow-y-auto space-y-1">
          {sections.map((section) => {
            const Icon = sectionIcons[section.type || section.sectionType] || Layers;
            
            return (
              <button
                key={section.id}
                onClick={() => onSelectSection(section)}
                className={cn(
                  "w-full p-2 rounded-lg transition-colors relative flex items-center justify-center",
                  selectedSection?.id === section.id
                    ? "bg-[var(--nuvi-primary)] text-white"
                    : section.enabled
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 hover:bg-gray-50"
                )}
                title={section.title}
              >
                <Icon className="h-4 w-4" />
                {!section.enabled && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
              </button>
            );
          })}
          
          {/* Add button */}
          <div className="relative" ref={addMenuRef}>
            <button
              onClick={(e) => {
                const newState = !showAddMenu;
                
                if (newState) {
                  const position = calculateDropdownPosition(e.currentTarget);
                  setDropdownPosition(position);
                }
                
                setShowAddMenu(newState);
              }}
              className="w-full p-1.5 text-gray-500 hover:text-[var(--nuvi-primary)] hover:bg-gray-100 rounded-md transition-colors flex items-center justify-center border border-dashed border-gray-200 hover:border-gray-300"
              title="Add Section"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create portal dropdown component
  const AddSectionDropdown = () => (showAddMenu && typeof window !== 'undefined') ? createPortal(
    <div 
      data-dropdown-visible="true"
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] overflow-hidden" 
      style={{
        left: `${dropdownPosition.x}px`,
        top: `${dropdownPosition.y}px`,
        width: Math.min(280, window.innerWidth - 32) + 'px',
        maxHeight: '400px',
        overflowX: 'hidden'
      }}
    >
      {/* Dropdown Header */}
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-gray-900">Add Section</h4>
          <button
            onClick={() => setShowAddMenu(false)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
        
        {/* Search in dropdown */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded focus-within:border-[var(--nuvi-primary)] transition-colors">
          <Search className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Type to search"
            value={addMenuSearch}
            onChange={(e) => setAddMenuSearch(e.target.value)}
            className="flex-1 text-xs placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          {addMenuSearch && (
            <button
              onClick={() => setAddMenuSearch('')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
        
      </div>
      
      {/* Section List in Dropdown */}
      <div className="max-h-80 overflow-y-auto overflow-x-hidden">
        {loadingSections ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading sections...</p>
          </div>
        ) : filteredAddSections.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-gray-500">No sections found</p>
          </div>
        ) : (
          <div className="py-1">
            {filteredAddSections.map((section) => {
              const Icon = sectionIcons[section.type] || Layers;
              
              return (
                <button
                  key={section.id}
                  onClick={() => handleAddSection(section)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors group flex items-start gap-2 relative min-h-[2.5rem]"
                  title={section.description || section.name}
                >
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center flex-shrink-0",
                    "bg-gray-100 group-hover:bg-[var(--nuvi-primary-lighter)]"
                  )}>
                    <Icon className={cn(
                      "h-2.5 w-2.5",
                      "text-gray-600 group-hover:text-[var(--nuvi-primary)]"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1">
                      <h5 className="text-xs font-medium text-gray-900 group-hover:text-[var(--nuvi-primary)] truncate leading-tight">
                        {section.name}
                      </h5>
                      {section.schema?.isRequired && (
                        <span className="text-[8px] px-1 py-0.5 bg-blue-500 text-white rounded flex-shrink-0">
                          REQ
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-[10px] text-gray-500 truncate leading-tight mt-0.5">
                        {section.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <AddSectionDropdown />
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
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
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
            <div className="flex-1 flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded focus-within:border-[var(--nuvi-primary)] transition-colors">
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
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded hover:bg-gray-100"
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
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Layers className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-700 mb-1">
              {searchQuery ? 'No sections found' : 'No sections yet'}
            </h3>
            <p className="text-xs text-gray-500 text-center mb-3">
              {searchQuery ? `No sections match "${searchQuery}"` : 'Click the Add button above to get started'}
            </p>
          </div>
        ) : categoryFilter === 'all' ? (
          /* Flat position-based view for proper drag & drop */
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
                  showInlineSettings={showInlineSettings}
                  storeId={storeId}
                />
                
                {/* Hover insertion area between sections */}
                <div className="h-2 group/insert hover:h-8 transition-all duration-300 flex items-center justify-center relative z-10">
                  <button
                    onClick={(e) => {
                      setInsertPosition(section.position + 1);
                      const position = calculateDropdownPosition(e.currentTarget);
                      setDropdownPosition(position);
                      setShowAddMenu(true);
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
                onClick={(e) => {
                  setInsertPosition(sections.length);
                  const position = calculateDropdownPosition(e.currentTarget);
                  setDropdownPosition(position);
                  setShowAddMenu(true);
                }}
                className="w-full py-1.5 px-2 bg-gray-50/50 hover:bg-gray-100 border border-dashed border-gray-200 hover:border-gray-300 rounded-md transition-colors flex items-center justify-center text-gray-500 hover:text-gray-600"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
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
                  showInlineSettings={showInlineSettings}
                  storeId={storeId}
                />
                
                {/* Hover insertion area between sections */}
                <div className="h-2 group/insert hover:h-8 transition-all duration-300 flex items-center justify-center relative z-10">
                  <button
                    onClick={(e) => {
                      setInsertPosition(section.position + 1);
                      const position = calculateDropdownPosition(e.currentTarget);
                      setDropdownPosition(position);
                      setShowAddMenu(true);
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
            <div className="relative px-3 py-1" ref={addMenuRef}>
              <button
                onClick={(e) => {
                  setInsertPosition(null);
                  const newState = !showAddMenu;
                  
                  if (newState) {
                    const position = calculateDropdownPosition(e.currentTarget);
                    setDropdownPosition(position);
                  }
                  
                  setShowAddMenu(newState);
                }}
                className={cn(
                  "w-full py-1.5 px-2 border border-dashed rounded-md transition-all flex items-center justify-center",
                  showAddMenu 
                    ? "bg-[var(--nuvi-primary)]/10 border-[var(--nuvi-primary)]/30 text-[var(--nuvi-primary)]" 
                    : "bg-gray-50/50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-600"
                )}
                title="Add Section"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}