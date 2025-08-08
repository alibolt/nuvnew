'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Search, Plus, Layout, Type, Image, ShoppingBag, Mail, Users, 
  MessageSquare, Instagram, Palette, Sparkles, Star, TrendingUp,
  Grid, FileText, Video, Calendar, MapPin, Phone, Filter,
  ArrowRight, ExternalLink, Zap, Heart, Award, Target, Loader2,
  Layers, Clock, ChevronRight, Eye, Info, CheckCircle2, ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddSectionPanelModernProps {
  onAdd: (section: { type: string; title: string; settings: any }) => void;
  onClose: () => void;
  storeId: string;
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
    preview?: string;
    features?: string[];
  };
}

// Section categories with enhanced metadata
const sectionCategories = {
  layout: {
    id: 'layout',
    title: 'Layout',
    description: 'Essential structure components',
    icon: Layout,
    color: 'blue',
    types: ['header', 'footer', 'hero', 'announcement-bar']
  },
  commerce: {
    id: 'commerce',
    title: 'Commerce',
    description: 'Product and shopping features',
    icon: ShoppingBag,
    color: 'purple',
    types: ['product-grid', 'featured-products', 'collections', 'cart-drawer']
  },
  content: {
    id: 'content',
    title: 'Content',
    description: 'Text and media sections',
    icon: Type,
    color: 'green',
    types: ['rich-text', 'image-with-text', 'video', 'faq']
  },
  marketing: {
    id: 'marketing',
    title: 'Marketing',
    description: 'Growth and engagement tools',
    icon: TrendingUp,
    color: 'orange',
    types: ['newsletter', 'testimonials', 'countdown', 'popup']
  },
  social: {
    id: 'social',
    title: 'Social',
    description: 'Social media integrations',
    icon: Users,
    color: 'pink',
    types: ['instagram-feed', 'logo-list', 'social-proof']
  }
};

// Icon mapping for section types
const sectionIcons: Record<string, any> = {
  'hero': Layout,
  'header': Layout,
  'footer': Layout,
  'announcement-bar': Sparkles,
  'featured-products': ShoppingBag,
  'product-grid': Grid,
  'collections': Palette,
  'cart-drawer': ShoppingBag,
  'image-with-text': Image,
  'rich-text': Type,
  'video': Video,
  'faq': MessageSquare,
  'newsletter': Mail,
  'testimonials': Star,
  'countdown': Clock,
  'popup': Zap,
  'logo-list': Users,
  'instagram-feed': Instagram,
  'social-proof': Heart,
};

// Color variants for categories
const colorVariants: Record<string, { bg: string; border: string; text: string; light: string }> = {
  blue: {
    bg: 'bg-blue-500',
    border: 'border-blue-200',
    text: 'text-blue-600',
    light: 'bg-blue-50'
  },
  purple: {
    bg: 'bg-purple-500',
    border: 'border-purple-200',
    text: 'text-purple-600',
    light: 'bg-purple-50'
  },
  green: {
    bg: 'bg-green-500',
    border: 'border-green-200',
    text: 'text-green-600',
    light: 'bg-green-50'
  },
  orange: {
    bg: 'bg-orange-500',
    border: 'border-orange-200',
    text: 'text-orange-600',
    light: 'bg-orange-50'
  },
  pink: {
    bg: 'bg-pink-500',
    border: 'border-pink-200',
    text: 'text-pink-600',
    light: 'bg-pink-50'
  }
};

export function AddSectionPanelModern({ onAdd, onClose, storeId }: AddSectionPanelModernProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<ThemeSection | null>(null);
  const [sections, setSections] = useState<ThemeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  
  useEffect(() => {
    loadThemeSections();
    // Load recently used sections from localStorage
    const recent = localStorage.getItem(`theme-studio-recent-${storeId}`);
    if (recent) {
      setRecentlyUsed(JSON.parse(recent));
    }
  }, [storeId]);

  const loadThemeSections = async () => {
    try {
      setLoading(true);
      
      // First get the store's active theme
      const storeResponse = await fetch(`/api/stores/${storeId}`);
      if (!storeResponse.ok) {
        throw new Error('Failed to load store');
      }
      const storeData = await storeResponse.json();
      
      if (!storeData.activeThemeId) {
        toast.error('No active theme found');
        setLoading(false);
        return;
      }

      // Then get the theme's sections
      const sectionsResponse = await fetch(`/api/themes/${storeData.activeThemeId}/sections`);
      if (!sectionsResponse.ok) {
        throw new Error('Failed to load theme sections');
      }
      
      const themeSections = await sectionsResponse.json();
      setSections(themeSections);
      
    } catch (error) {
      console.error('Failed to load theme sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  // Group sections by category
  const groupedSections = useMemo(() => {
    const groups: Record<string, ThemeSection[]> = {};
    
    sections.forEach(section => {
      const category = section.schema?.category?.toLowerCase() || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(section);
    });
    
    return groups;
  }, [sections]);

  // Filter sections based on search and category
  const filteredSections = useMemo(() => {
    let filtered = sections;
    
    if (searchQuery) {
      filtered = filtered.filter(section =>
        section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(section =>
        section.schema?.category?.toLowerCase() === selectedCategory
      );
    }
    
    return filtered;
  }, [sections, searchQuery, selectedCategory]);

  // Get recently used sections
  const recentSections = sections.filter(section => 
    recentlyUsed.includes(section.type)
  ).slice(0, 3);

  const handleAddSection = (section: ThemeSection) => {
    // Update recently used
    const newRecent = [section.type, ...recentlyUsed.filter(t => t !== section.type)].slice(0, 5);
    setRecentlyUsed(newRecent);
    localStorage.setItem(`theme-studio-recent-${storeId}`, JSON.stringify(newRecent));
    
    // Add the section
    onAdd({
      type: section.type,
      title: section.name,
      settings: section.schema?.defaultSettings || {},
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--nuvi-primary)] mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading sections...</p>
        </div>
      </div>
    );
  }

  // Section detail view
  if (selectedSection) {
    return (
      <div className="h-full flex flex-col bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSection(null)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sections
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Section Preview */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Section info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--nuvi-primary-lighter)] flex items-center justify-center">
                {React.createElement(sectionIcons[selectedSection.type] || Layers, {
                  className: "h-6 w-6 text-[var(--nuvi-primary)]"
                })}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {selectedSection.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedSection.description || 'Add this section to your store'}
                </p>
              </div>
            </div>

            {/* Preview image */}
            {selectedSection.schema?.preview && (
              <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                <img 
                  src={selectedSection.schema.preview} 
                  alt={selectedSection.name}
                  className="w-full"
                />
              </div>
            )}

            {/* Features */}
            {selectedSection.schema?.features && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Features</h3>
                <div className="space-y-2">
                  {selectedSection.schema.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {selectedSection.schema?.category || 'General'}
              </span>
              {selectedSection.schema?.isRequired && (
                <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                  Required
                </span>
              )}
              {selectedSection.schema?.isPremium && (
                <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                  Premium
                </span>
              )}
            </div>

            {/* Add button */}
            <button
              onClick={() => handleAddSection(selectedSection)}
              className="w-full py-2.5 bg-[var(--nuvi-primary)] text-white font-medium rounded-lg hover:bg-[var(--nuvi-primary-hover)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {selectedSection.name}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Add Section</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--nuvi-primary)] focus:ring-1 focus:ring-[var(--nuvi-primary)]/20 focus:bg-white"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors",
                !selectedCategory
                  ? "bg-[var(--nuvi-primary)] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All Sections
            </button>
            {Object.values(sectionCategories).map((category) => {
              const Icon = category.icon;
              const colors = colorVariants[category.color];
              const isActive = selectedCategory === category.id;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5",
                    isActive
                      ? `${colors.bg} text-white`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {category.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Recently Used */}
        {recentSections.length > 0 && !searchQuery && !selectedCategory && (
          <div className="p-4 bg-white border-b border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Recently Used
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {recentSections.map((section) => (
                <QuickAddCard
                  key={section.id}
                  section={section}
                  onAdd={() => handleAddSection(section)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section Grid */}
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">No sections found</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="p-4">
            {selectedCategory ? (
              // Single category view
              <div className="grid gap-2">
                {filteredSections.map((section) => (
                  <SectionCardModern
                    key={section.id}
                    section={section}
                    onAdd={() => handleAddSection(section)}
                    onPreview={() => setSelectedSection(section)}
                    categoryColor={sectionCategories[selectedCategory as keyof typeof sectionCategories]?.color}
                  />
                ))}
              </div>
            ) : (
              // Grouped view
              Object.entries(groupedSections).map(([categoryId, categorySections]) => {
                const category = Object.values(sectionCategories).find(c => c.id === categoryId);
                if (!category && categoryId === 'other') return null;
                
                const filteredCategorySections = categorySections.filter(s => 
                  filteredSections.includes(s)
                );
                
                if (filteredCategorySections.length === 0) return null;
                
                return (
                  <div key={categoryId} className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      {category && (
                        <>
                          <category.icon className="h-4 w-4 text-gray-400" />
                          <h3 className="text-sm font-semibold text-gray-700">
                            {category.title}
                          </h3>
                        </>
                      )}
                      <span className="text-xs text-gray-400">
                        ({filteredCategorySections.length})
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {filteredCategorySections.map((section) => (
                        <SectionCardModern
                          key={section.id}
                          section={section}
                          onAdd={() => handleAddSection(section)}
                          onPreview={() => setSelectedSection(section)}
                          categoryColor={category?.color}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Quick add card for recently used sections
function QuickAddCard({ 
  section, 
  onAdd 
}: { 
  section: ThemeSection; 
  onAdd: () => void;
}) {
  const Icon = sectionIcons[section.type] || Layers;
  
  return (
    <button
      onClick={onAdd}
      className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center group-hover:bg-[var(--nuvi-primary-lighter)] transition-colors">
          <Icon className="h-4 w-4 text-gray-600 group-hover:text-[var(--nuvi-primary)]" />
        </div>
        <span className="text-xs text-gray-600 group-hover:text-gray-900 line-clamp-1">
          {section.name}
        </span>
      </div>
    </button>
  );
}

// Enhanced section card
function SectionCardModern({ 
  section, 
  onAdd,
  onPreview,
  categoryColor = 'blue'
}: { 
  section: ThemeSection; 
  onAdd: () => void;
  onPreview: () => void;
  categoryColor?: string;
}) {
  const Icon = sectionIcons[section.type] || Layers;
  const colors = colorVariants[categoryColor] || colorVariants.blue;
  
  return (
    <div className="group bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all overflow-hidden">
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
            colors.light,
            `group-hover:${colors.bg} group-hover:text-white`
          )}>
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-0.5">
                  {section.name}
                </h3>
                {section.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {section.description}
                  </p>
                )}
                
                {/* Tags */}
                <div className="flex items-center gap-2 mt-2">
                  {section.schema?.isRequired && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                      Required
                    </span>
                  )}
                  {section.schema?.isPremium && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      Premium
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview();
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-all"
                  title="Preview section"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd();
                  }}
                  className="p-1.5 text-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-lighter)] rounded transition-all"
                  title="Add section"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}