'use client';

import { useState, useEffect } from 'react';
import { 
  X, Search, Plus, Layout, Type, Image, ShoppingBag, Mail, Users, 
  MessageSquare, Instagram, Palette, Sparkles, Star, TrendingUp,
  Grid, FileText, Video, Calendar, MapPin, Phone, Filter,
  ArrowRight, ExternalLink, Zap, Heart, Award, Target, Loader2,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddSectionPanelProps {
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
  };
}

// Icon mapping for section types
const sectionIcons: Record<string, any> = {
  'hero': Layout,
  'header': Layout,
  'footer': Layout,
  'featured-products': ShoppingBag,
  'product-grid': Grid,
  'collections': Palette,
  'image-with-text': Image,
  'rich-text': Type,
  'newsletter': Mail,
  'testimonials': MessageSquare,
  'logo-list': Users,
  'instagram-feed': Instagram,
  'video': Video,
  'countdown': Calendar,
};

export function AddSectionPanel({ onAdd, onClose, storeId }: AddSectionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sections, setSections] = useState<ThemeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([
    { id: 'all', label: 'All' }
  ]);

  useEffect(() => {
    loadThemeSections();
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

      // Extract unique categories
      const uniqueCategories = new Set<string>();
      themeSections.forEach((section: ThemeSection) => {
        if (section.schema?.category) {
          uniqueCategories.add(section.schema.category);
        }
      });

      const categoryList = [
        { id: 'all', label: 'All' },
        ...Array.from(uniqueCategories).map(cat => ({
          id: cat.toLowerCase().replace(' ', '-'),
          label: cat
        }))
      ];
      setCategories(categoryList);
      
    } catch (error) {
      console.error('Failed to load theme sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (section.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || 
                           section.schema?.category?.toLowerCase().replace(' ', '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border-0 rounded focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Category Filters */}
      {categories.length > 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "px-2 py-1 text-xs rounded transition-colors",
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-4">
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No sections found' : 'No sections available for this theme'}
            </p>
          </div>
        ) : (
          <div className="px-2">
            {filteredSections.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                onAdd={onAdd}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ 
  section, 
  onAdd
}: { 
  section: ThemeSection; 
  onAdd: (section: any) => void;
}) {
  const IconComponent = sectionIcons[section.type] || Layers;
  const isRequired = section.schema?.isRequired;

  return (
    <button
      onClick={() => onAdd({
        type: section.type,
        title: section.name,
        settings: section.schema?.defaultSettings || {},
      })}
      className="w-full p-3 text-left hover:bg-gray-50 transition-colors group rounded-md mx-2 mb-1"
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-7 h-7 rounded bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary flex items-center justify-center transition-colors flex-shrink-0">
          <IconComponent className="h-3.5 w-3.5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors">
              {section.name}
            </h3>
            {isRequired && (
              <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                Required
              </span>
            )}
          </div>
          {section.description && (
            <p className="text-xs text-gray-500 truncate">
              {section.description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}