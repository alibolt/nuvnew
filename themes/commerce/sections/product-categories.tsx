'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
// BlockListRenderer removed - not needed for commerce theme

interface Category {
  id: string;
  name: string;
  image: string;
  productCount?: number;
  slug: string;
}

interface ProductCategoriesProps {
  settings: {
    title?: string;
    subtitle?: string;
    layout?: 'blocks' | 'grid' | 'carousel' | 'masonry';
    categoriesToShow?: number;
    showCategoryCount?: boolean;
    container_width?: string;
    columns?: string;
    gap?: string;
    showViewAll?: boolean;
    viewAllText?: string;
    section_bg?: string;
    title_color?: string;
    subtitle_color?: string;
    padding_top?: string;
    padding_bottom?: string;
    categoryHeight?: string;
    imagePosition?: string;
    buttonStyle?: string;
    source?: 'manual' | 'all';
    categorySource?: 'manual' | 'auto';
    categoryLimit?: number;
    sortOrder?: 'alphabetical' | 'product_count' | 'created' | 'manual';
  };
  categories?: Category[];
  blocks?: any[];
  context?: any;
  isEditing?: boolean;
  onBlockClick?: (section: any, block: any, event: React.MouseEvent) => void;
  store?: any;
  isPreview?: boolean;
}

export function ProductCategories({ 
  settings, 
  categories = [], 
  blocks = [],
  context = {},
  isEditing = false,
  onBlockClick,
  store,
  isPreview
}: ProductCategoriesProps) {
  const [storeCategories, setStoreCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  // Mock categories if none provided
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Electronics',
      image: '/placeholder-category.svg',
      productCount: 156,
      slug: 'electronics'
    },
    {
      id: '2',
      name: 'Fashion',
      image: '/placeholder-category.svg',
      productCount: 89,
      slug: 'fashion'
    },
    {
      id: '3',
      name: 'Home & Garden',
      image: '/placeholder-category.svg',
      productCount: 234,
      slug: 'home-garden'
    },
    {
      id: '4',
      name: 'Sports & Outdoors',
      image: '/placeholder-category.svg',
      productCount: 67,
      slug: 'sports-outdoors'
    },
    {
      id: '5',
      name: 'Books & Media',
      image: '/placeholder-category.svg',
      productCount: 123,
      slug: 'books-media'
    },
    {
      id: '6',
      name: 'Health & Beauty',
      image: '/placeholder-category.svg',
      productCount: 98,
      slug: 'health-beauty'
    }
  ];

  // Fetch store categories when source is 'all' or categorySource is 'auto'
  useEffect(() => {
    const shouldFetchCategories = (settings.source === 'all' || settings.categorySource === 'auto') && store?.subdomain;
    
    console.log('[ProductCategories] Debug:', {
      source: settings.source,
      categorySource: settings.categorySource,
      subdomain: store?.subdomain,
      shouldFetchCategories
    });
    
    if (shouldFetchCategories) {
      const fetchCategories = async () => {
        setLoading(true);
        try {
          console.log('[ProductCategories] Fetching categories from:', `/api/stores/${store.subdomain}/categories?public=true`);
          const response = await fetch(`/api/stores/${store.subdomain}/categories?public=true`);
          
          if (response.ok) {
            const categories = await response.json();
            console.log('[ProductCategories] Categories received:', categories);
            
            let transformedCategories = categories
              .filter((cat: any) => cat._count?.products > 0) // Only show categories with products
              .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                image: cat.image || '/placeholder-category.svg',
                productCount: cat._count?.products || 0
              }));
            
            // Apply sorting based on sortOrder setting
            const sortOrder = settings.sortOrder || 'alphabetical';
            switch (sortOrder) {
              case 'alphabetical':
                transformedCategories.sort((a: any, b: any) => a.name.localeCompare(b.name));
                break;
              case 'product_count':
                transformedCategories.sort((a: any, b: any) => b.productCount - a.productCount);
                break;
              case 'created':
                // Already sorted by created date from API
                break;
              case 'manual':
                // Keep original order
                break;
            }
            
            // Apply category limit
            const categoryLimit = settings.categoryLimit || 8;
            transformedCategories = transformedCategories.slice(0, categoryLimit);
            
            console.log('[ProductCategories] Setting store categories:', transformedCategories);
            setStoreCategories(transformedCategories);
          } else {
            console.log('[ProductCategories] Response not ok:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('[ProductCategories] Error fetching categories:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCategories();
    }
  }, [settings.source, settings.categorySource, settings.sortBy, settings.categoryLimit, store?.subdomain]);
  
  // Determine which categories to display
  const getDisplayCategories = () => {
    console.log('[ProductCategories] getDisplayCategories:', {
      source: settings.source,
      categorySource: settings.categorySource,
      storeCategories: storeCategories.length,
      categories: categories.length,
      isPreview
    });
    
    if ((settings.source === 'all' || settings.categorySource === 'auto') && storeCategories.length > 0) {
      console.log('[ProductCategories] Returning store categories');
      return storeCategories;
    }
    
    const result = categories.length > 0 ? categories : (isPreview ? mockCategories : []);
    console.log('[ProductCategories] Returning:', result.length > 0 ? 'categories' : 'mock categories');
    return result;
  };
  
  const displayCategories = getDisplayCategories();
  const categoriesToShow = settings.categoriesToShow || 6;
  // Default to 'grid' layout when using auto categories, 'blocks' when using manual blocks
  const defaultLayout = (settings.categorySource === 'auto' || settings.source === 'all') ? 'grid' : 'blocks';
  const layout = settings.layout || defaultLayout;
  const containerWidth = settings.container_width || 'max-w-7xl';
  const gap = settings.gap || '6';
  const paddingTop = settings.padding_top || '16';
  const paddingBottom = settings.padding_bottom || '16';
  
  console.log('[ProductCategories] Render info:', {
    layout,
    defaultLayout,
    displayCategoriesCount: displayCategories.length,
    categoriesToShow,
    blocksCount: blocks?.length || 0,
    settings
  });

  const getGridClass = () => {
    const cols = settings.columns || '4';
    if (layout === 'masonry') {
      return `columns-2 md:columns-3 lg:columns-${cols} gap-${gap}`;
    }
    return `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${cols} gap-${gap}`;
  };

  const renderCategoryCard = (category: Category, index: number) => {
    const isMasonry = layout === 'masonry';
    const heights = ['h-48', 'h-56', 'h-40', 'h-52']; // Varied heights for masonry
    const height = isMasonry ? heights[index % heights.length] : 'h-48';

    return (
      <div
        key={category.id}
        className={`group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
          isMasonry ? `${height} mb-6 break-inside-avoid` : height
        }`}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${category.image})`,
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-end p-6">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors">
              {category.name}
            </h3>
            
            {settings.showCategoryCount && category.productCount && (
              <p className="text-sm text-gray-200 mb-3">
                {category.productCount} products
              </p>
            )}
            
            <a
              href={`/collections/${category.slug}`}
              className="inline-flex items-center text-sm font-medium text-white border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-200"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
        </div>
      </div>
    );
  };

  if (layout === 'carousel') {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {settings.title || 'Shop by Category'}
            </h2>
          </div>

          {/* Loading State */}
          {loading && (settings.source === 'all' || settings.categorySource === 'auto') && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading categories...</span>
              </div>
            </div>
          )}

          {/* Carousel Container */}
          {!loading && displayCategories.length > 0 && (
          <div className="relative">
            <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
              {displayCategories.slice(0, categoriesToShow).map((category, index) => (
                <div key={category.id} className="flex-none w-64">
                  {renderCategoryCard(category, index)}
                </div>
              ))}
            </div>
            
            {/* Scroll indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: Math.ceil(categoriesToShow / 3) }).map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300 hover:bg-gray-500 cursor-pointer transition-colors"
                />
              ))}
            </div>
          </div>
          )}
          
          {/* No categories message */}
          {!loading && displayCategories.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories available.</p>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Block layout - let users add categories as blocks
  if (layout === 'blocks') {
    return (
      <section 
        className={`py-${paddingTop} bg-gray-50`}
        style={{
          backgroundColor: settings.section_bg || '#f9fafb'
        }}
      >
        <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
          {/* Section Header */}
          {(settings.title || settings.subtitle) && (
            <div className="text-center mb-12">
              {settings.title && (
                <h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  style={{ color: settings.title_color || '#111827' }}
                >
                  {settings.title}
                </h2>
              )}
              {settings.subtitle && (
                <p 
                  className="text-lg"
                  style={{ color: settings.subtitle_color || '#6b7280' }}
                >
                  {settings.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Blocks Container */}
          <BlockListRenderer
            blocks={blocks}
            context={context}
            isEditing={isEditing}
            onBlockClick={onBlockClick}
            className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${settings.columns || '4'} gap-${gap}`}
          />

          {/* View All Button */}
          {settings.showViewAll && (
            <div className="text-center mt-12">
              <a
                href="/collections"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                {settings.viewAllText || 'View All Categories'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          )}
        </div>
      </section>
    );
  }

  // Original grid/carousel/masonry layouts
  return (
    <section 
      className={`py-${paddingTop} bg-gray-50`}
      style={{
        backgroundColor: settings.section_bg || '#f9fafb'
      }}
    >
      <div className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
        
        {/* Section Header */}
        {(settings.title || settings.subtitle) && (
          <div className="text-center mb-12">
            {settings.title && (
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: settings.title_color || '#111827' }}
              >
                {settings.title}
              </h2>
            )}
            {settings.subtitle && (
              <p 
                className="text-lg"
                style={{ color: settings.subtitle_color || '#6b7280' }}
              >
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (settings.source === 'all' || settings.categorySource === 'auto') && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading categories...</span>
            </div>
          </div>
        )}

        {/* Categories Grid/Masonry */}
        {!loading && displayCategories.length > 0 && (
          <div className={getGridClass()}>
            {displayCategories.slice(0, categoriesToShow).map((category, index) => 
              renderCategoryCard(category, index)
            )}
          </div>
        )}
        
        {/* No categories message */}
        {!loading && displayCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No categories available.</p>
          </div>
        )}

        {/* View All Button */}
        {settings.showViewAll !== false && (
          <div className="text-center mt-12">
            <a
              href="/collections"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              {settings.viewAllText || 'View All Categories'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductCategories;
