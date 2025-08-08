'use client';

import { useState, useMemo } from 'react';
import { SectionItemModern } from './section-item-modern';
import { 
  Layout, ShoppingBag, Type, Image, Mail, Users, 
  MessageSquare, Instagram, Palette, Layers, Plus,
  Search, Filter, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  type: string;
  sectionType: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionListModernProps {
  sections: Section[];
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
  onDeleteSection?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicateSection?: (section: Section) => void;
  onUpdateSection?: (sectionId: string, updates: any) => void;
  searchQuery?: string;
  onAddSection?: () => void;
}

// Section categories for grouping
const sectionCategories = {
  layout: {
    title: 'Layout',
    types: ['header', 'footer', 'hero'],
    icon: Layout,
    color: 'blue'
  },
  commerce: {
    title: 'Commerce',
    types: ['product-grid', 'featured-products', 'collections'],
    icon: ShoppingBag,
    color: 'purple'
  },
  content: {
    title: 'Content',
    types: ['rich-text', 'image-with-text', 'testimonials'],
    icon: Type,
    color: 'green'
  },
  marketing: {
    title: 'Marketing',
    types: ['newsletter', 'instagram-feed', 'logo-list'],
    icon: Mail,
    color: 'orange'
  }
};

export function SectionListModern({ 
  sections, 
  selectedSection, 
  onSelectSection, 
  onDeleteSection, 
  onToggleVisibility,
  onDuplicateSection,
  onUpdateSection,
  searchQuery: externalSearchQuery,
  onAddSection
}: SectionListModernProps) {
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(selectedSection?.id || null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  
  const searchQuery = externalSearchQuery || internalSearchQuery;
  
  // Filter sections based on search and filters
  const filteredSections = useMemo(() => {
    let filtered = sections;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (section.type || section.sectionType || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply enabled filter
    if (filterEnabled !== 'all') {
      filtered = filtered.filter(section => 
        filterEnabled === 'enabled' ? section.enabled : !section.enabled
      );
    }
    
    return filtered;
  }, [sections, searchQuery, filterEnabled]);

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups: Record<string, Section[]> = {};
    
    filteredSections.forEach(section => {
      const sectionType = section.type || section.sectionType || '';
      let category = 'other';
      
      for (const [key, config] of Object.entries(sectionCategories)) {
        if (config.types.includes(sectionType)) {
          category = key;
          break;
        }
      }
      
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(section);
    });
    
    return groups;
  }, [filteredSections]);

  const handleSelectSection = (section: Section) => {
    onSelectSection(section);
    setExpandedSectionId(section.id);
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Count stats
  const stats = {
    total: sections.length,
    enabled: sections.filter(s => s.enabled).length,
    disabled: sections.filter(s => !s.enabled).length
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with stats */}
      <div className="px-3 py-2 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Sections ({stats.total})
          </h3>
          <button
            onClick={onAddSection}
            className="p-1 hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)] rounded transition-colors"
            title="Add Section"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-500">{stats.enabled} active</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            <span className="text-gray-500">{stats.disabled} hidden</span>
          </span>
        </div>
      </div>

      {/* Search and filters */}
      {sections.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search sections..."
                value={searchQuery}
                onChange={(e) => setInternalSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-gray-200 rounded focus:outline-none focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)]/20"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "p-1 rounded transition-colors",
                showFilters ? "bg-[var(--nuvi-primary-light)] text-[var(--nuvi-primary)]" : "hover:bg-gray-100 text-gray-400"
              )}
            >
              <Filter className="h-3 w-3" />
            </button>
          </div>
          
          {/* Filter options */}
          {showFilters && (
            <div className="mt-2 flex items-center gap-1">
              {(['all', 'enabled', 'disabled'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setFilterEnabled(filter)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] font-medium rounded-full transition-colors",
                    filterEnabled === filter
                      ? "bg-[var(--nuvi-primary)] text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  )}
                >
                  {filter === 'all' ? 'All' : filter === 'enabled' ? 'Active' : 'Hidden'}
                </button>
              ))}
            </div>
          )}
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
              {searchQuery ? `No sections match "${searchQuery}"` : 'Add your first section to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={onAddSection}
                className="px-3 py-1.5 bg-[var(--nuvi-primary)] text-white text-xs font-medium rounded-lg hover:bg-[var(--nuvi-primary-hover)] transition-colors"
              >
                Add Section
              </button>
            )}
          </div>
        ) : (
          <div className="py-1">
            {/* Render grouped sections */}
            {Object.entries(groupedSections).map(([category, categorySections]) => {
              const categoryConfig = sectionCategories[category as keyof typeof sectionCategories];
              const isCollapsed = collapsedCategories.has(category);
              
              return (
                <div key={category} className="mb-2">
                  {/* Category header */}
                  {categoryConfig && (
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronDown 
                        className={cn(
                          "h-3 w-3 text-gray-400 transition-transform",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                      <categoryConfig.icon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600">
                        {categoryConfig.title}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({categorySections.length})
                      </span>
                    </button>
                  )}
                  
                  {/* Category sections */}
                  {!isCollapsed && (
                    <div className="pl-2">
                      {categorySections.map((section) => (
                        <SectionItemModern
                          key={section.id}
                          section={section}
                          isSelected={selectedSection?.id === section.id}
                          isExpanded={expandedSectionId === section.id}
                          onSelect={() => handleSelectSection(section)}
                          onDelete={onDeleteSection}
                          onToggleVisibility={onToggleVisibility}
                          onDuplicate={() => onDuplicateSection?.(section)}
                          onUpdate={onUpdateSection}
                          categoryColor={categoryConfig?.color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Other sections without category */}
            {groupedSections.other && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="px-3 mb-1">
                  <span className="text-xs font-medium text-gray-500">Other</span>
                </div>
                {groupedSections.other.map((section) => (
                  <SectionItemModern
                    key={section.id}
                    section={section}
                    isSelected={selectedSection?.id === section.id}
                    isExpanded={expandedSectionId === section.id}
                    onSelect={() => handleSelectSection(section)}
                    onDelete={onDeleteSection}
                    onToggleVisibility={onToggleVisibility}
                    onDuplicate={() => onDuplicateSection?.(section)}
                    onUpdate={onUpdateSection}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}