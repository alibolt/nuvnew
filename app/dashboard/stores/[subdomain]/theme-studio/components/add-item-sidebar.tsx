'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Search, Layers, Layout, ShoppingBag, Type, Image, Mail, Users, 
  MessageSquare, Instagram, Palette, Grid, Video, Clock, TrendingUp, 
  Star, AlertCircle, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddItemSidebarProps {
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
  'account-login': Users,
  'account-register': Users,
  'account-profile': Users,
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
    types: ['account-login', 'account-register', 'account-profile'],
    icon: Users,
    color: 'blue'
  }
};

// Categories for blocks
const blockCategories: Record<string, { title: string; types: string[]; icon: any }> = {
  text: {
    title: 'Text',
    types: ['heading', 'text', 'rich-text'],
    icon: Type
  },
  media: {
    title: 'Media',
    types: ['image', 'video', 'logo'],
    icon: Image
  },
  layout: {
    title: 'Layout',
    types: ['container', 'columns', 'spacer', 'divider'],
    icon: Layout
  },
  navigation: {
    title: 'Navigation',
    types: ['button', 'link', 'navigation', 'breadcrumbs'],
    icon: ChevronRight
  },
  commerce: {
    title: 'Commerce',
    types: ['product-card', 'price', 'add-to-cart', 'product-gallery'],
    icon: ShoppingBag
  },
  interactive: {
    title: 'Interactive',
    types: ['search', 'cart', 'wishlist', 'account', 'user-menu'],
    icon: Users
  }
};

export function AddItemSidebar({ 
  isOpen, 
  onClose, 
  type, 
  items, 
  onSelect, 
  loading = false,
  selectedPage,
  sectionType,
  containerType
}: AddItemSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
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

  if (!isOpen) return null;

  const categories = type === 'section' ? sectionCategories : blockCategories;

  return typeof window !== 'undefined' ? createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[9998]"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={cn(
        "fixed right-0 top-0 h-full bg-white shadow-2xl z-[9999] transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{ width: '400px' }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Add {type === 'section' ? 'Section' : 'Block'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Categories */}
        <div className="border-b border-gray-100 p-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full transition-colors",
                selectedCategory === 'all'
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              )}
            >
              All
            </button>
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full transition-colors flex items-center gap-1.5",
                  selectedCategory === key
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                )}
              >
                <category.icon className="h-3 w-3" />
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Loading {type}s...
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? `No ${type}s found matching "${searchQuery}"` : `No ${type}s available`}
            </div>
          ) : selectedCategory === 'all' ? (
            // Show grouped view when "All" is selected
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([categoryKey, categoryItems]) => {
                const category = categories[categoryKey];
                if (!category || categoryItems.length === 0) return null;
                
                return (
                  <div key={categoryKey}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryItems.map((item) => {
                        const Icon = sectionIcons[item.type || item.id] || Layers;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              onSelect(item);
                              onClose();
                            }}
                            className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
                              <Icon className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 truncate">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
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
            <div className="grid grid-cols-2 gap-2">
              {filteredItems.map((item) => {
                const Icon = sectionIcons[item.type || item.id] || Layers;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-sm">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
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
    </>,
    document.body
  ) : null;
}