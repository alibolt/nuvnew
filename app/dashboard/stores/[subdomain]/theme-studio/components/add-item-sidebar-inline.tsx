'use client';

import { useState, useEffect } from 'react';
import { 
  X, Search, Layers, Layout, ShoppingBag, Type, Image, Mail, Users, 
  MessageSquare, Instagram, Palette, Grid, Video, Clock, TrendingUp, 
  Star, AlertCircle, ChevronRight, Sparkles, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddItemSidebarInlineProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'section' | 'block';
  items: any[];
  onSelect: (item: any) => void;
  loading?: boolean;
  selectedPage?: string;
  sectionType?: string; // For block filtering
  containerType?: string; // For container block filtering
}

// Section icons mapping
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

// Categories for sections
const sectionCategories: Record<string, { title: string; types: string[]; icon: any; color: string }> = {
  header: {
    title: 'Header & Footer',
    types: ['header', 'announcement-bar', 'footer'],
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
    types: ['product-grid', 'featured-products', 'collections', 'cart', 'collection', 'search-results'],
    icon: ShoppingBag,
    color: 'purple'
  },
  marketing: {
    title: 'Marketing',
    types: ['newsletter', 'testimonials', 'countdown', 'instagram-feed'],
    icon: Mail,
    color: 'orange'
  },
  account: {
    title: 'Account',
    types: ['login-form', 'register-form', 'account-profile', 'account-dashboard', 'order-history'],
    icon: Users,
    color: 'blue'
  }
};

// Categories for blocks
const blockCategories: Record<string, { title: string; types: string[]; icon: any }> = {
  content: {
    title: 'Content',
    types: ['heading', 'text', 'rich-text', 'announcement-text', 'countdown', 'social-share'],
    icon: Type
  },
  media: {
    title: 'Media',
    types: ['image', 'video', 'logo'],
    icon: Image
  },
  layout: {
    title: 'Layout',
    types: ['container', 'columns', 'spacer', 'divider', 'icon-group'],
    icon: Layout
  },
  navigation: {
    title: 'Navigation',
    types: ['button', 'link', 'navigation', 'breadcrumbs'],
    icon: ChevronRight
  },
  commerce: {
    title: 'Commerce',
    types: ['product-card', 'price', 'add-to-cart', 'product-gallery', 'product-title', 'product-price', 'product-description', 'product-variants', 'product-form', 'product-info'],
    icon: ShoppingBag
  },
  interactive: {
    title: 'Interactive',
    types: ['search', 'cart', 'wishlist', 'account', 'user-menu', 'language-selector', 'currency-selector'],
    icon: Users
  }
};

export function AddItemSidebarInline({ 
  isOpen, 
  onClose, 
  type, 
  items, 
  onSelect, 
  loading = false,
  selectedPage,
  sectionType,
  containerType
}: AddItemSidebarInlineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Debug log - only when sidebar is open to reduce noise
  if (isOpen) {
    console.log('🎨 [AddItemSidebarInline] Sidebar opened:', {
      type,
      itemsCount: items?.length || 0,
      loading,
      selectedPage,
      sectionType,
      containerType
    });
  }
  
  // Reset search and category when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen]);

  // Filter items based on search and category
  const filteredItems = items.filter(item => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = (item.name || item.type || '').toLowerCase();
      const description = (item.description || '').toLowerCase();
      if (!name.includes(query) && !description.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const categories = type === 'section' ? sectionCategories : blockCategories;
      const category = categories[selectedCategory];
      if (category && !category.types.includes(item.type || item.id)) {
        return false;
      }
    }

    return true;
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const categories = type === 'section' ? sectionCategories : blockCategories;
    let itemCategory = 'other';
    
    // Find which category this item belongs to
    for (const [key, category] of Object.entries(categories)) {
      if (category.types.includes(item.type || item.id)) {
        itemCategory = key;
        break;
      }
    }
    
    if (!groups[itemCategory]) {
      groups[itemCategory] = [];
    }
    groups[itemCategory].push(item);
    return groups;
  }, {} as Record<string, any[]>);

  const categories = type === 'section' ? sectionCategories : blockCategories;

  return (
    <div className={cn(
      "absolute inset-x-0 bottom-0 bg-white border-t border-gray-200 shadow-lg transition-all duration-300 ease-out overflow-hidden",
      isOpen ? "h-[70vh]" : "h-0"
    )}
    style={{ zIndex: 50 }}
    >
      {/* Header */}
      <div className="border-b border-gray-200 p-3 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">
            Add {type === 'section' ? 'Section' : 'Block'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${type}s...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-100 p-2 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-2 py-1 text-xs rounded-md transition-colors",
              selectedCategory === 'all'
                ? "bg-blue-100 text-blue-700"
                : "bg-white hover:bg-gray-100 text-gray-600"
            )}
          >
            All
          </button>
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors flex items-center gap-1",
                selectedCategory === key
                  ? "bg-blue-100 text-blue-700"
                  : "bg-white hover:bg-gray-100 text-gray-600"
              )}
            >
              <category.icon className="h-3 w-3" />
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {loading ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
              Loading {type}s...
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-500">
            {searchQuery ? `No ${type}s found matching "${searchQuery}"` : `No ${type}s available`}
          </div>
        ) : selectedCategory === 'all' ? (
          // Show grouped view when "All" is selected
          <div className="space-y-3">
            {Object.entries(groupedItems).map(([categoryKey, categoryItems]) => {
              const category = categories[categoryKey];
              // Show items even if they're in 'other' category
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={categoryKey}>
                  <h4 className="text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    {category ? (
                      <>
                        <category.icon className="h-3 w-3" />
                        {category.title}
                      </>
                    ) : (
                      <>
                        <Layers className="h-3 w-3" />
                        Other
                      </>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {categoryItems.map((item) => {
                      const Icon = sectionIcons[item.type || item.id] || Layers;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            onSelect(item);
                            onClose();
                          }}
                          className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm">
                            <Icon className="h-3 w-3 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-[10px] text-gray-500 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Show flat list when a specific category is selected
          <div className="grid grid-cols-1 gap-1">
            {filteredItems.map((item) => {
              const Icon = sectionIcons[item.type || item.id] || Layers;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm">
                    <Icon className="h-3 w-3 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {item.name}
                    </div>
                    {item.description && (
                      <div className="text-[10px] text-gray-500 truncate">
                        {item.description}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}