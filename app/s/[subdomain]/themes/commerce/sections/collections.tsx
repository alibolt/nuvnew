'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Package } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
}

interface CollectionsProps {
  settings: {
    title?: string;
    subtitle?: string;
    layout?: 'grid' | 'list';
    columns?: string;
    showDescription?: boolean;
    showProductCount?: boolean;
    showViewAllButton?: boolean;
    viewAllButtonText?: string;
    imageAspectRatio?: 'square' | 'landscape' | 'portrait';
    cardStyle?: 'simple' | 'bordered' | 'elevated';
    maxCollections?: number;
    source?: 'all' | 'manual';
    selectedCollections?: string[];
    backgroundColor?: string;
    textColor?: string;
  };
  collections?: Collection[];
  store?: any;
  isPreview?: boolean;
}

export function Collections({ settings, collections = [], store, isPreview }: CollectionsProps) {
  const [storeCollections, setStoreCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock collections for preview
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'New Arrivals',
      slug: 'new-arrivals',
      description: 'Fresh styles just dropped',
      image: '/placeholder-category.svg',
      productCount: 42
    },
    {
      id: '2',
      name: 'Best Sellers',
      slug: 'best-sellers',
      description: 'Our most popular items',
      image: '/placeholder-category.svg',
      productCount: 38
    },
    {
      id: '3',
      name: 'Sale Collection',
      slug: 'sale',
      description: 'Great deals on selected items',
      image: '/placeholder-category.svg',
      productCount: 65
    },
    {
      id: '4',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Complete your look',
      image: '/placeholder-category.svg',
      productCount: 89
    }
  ];

  // Fetch store collections when source is 'all'
  useEffect(() => {
    if (settings.source === 'all' && store?.subdomain && !isPreview) {
      fetchCollections();
    }
  }, [settings.source, store?.subdomain, isPreview]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/categories?public=true`);
      if (response.ok) {
        const categories = await response.json();
        const transformedCollections = categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image || '/placeholder-category.svg',
          productCount: cat._count?.products || 0
        }));
        setStoreCollections(transformedCollections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determine which collections to display
  const getDisplayCollections = () => {
    if (settings.source === 'all' && storeCollections.length > 0) {
      return storeCollections.slice(0, settings.maxCollections || 8);
    }
    
    if (settings.source === 'manual' && settings.selectedCollections && storeCollections.length > 0) {
      return storeCollections.filter(col => 
        settings.selectedCollections?.includes(col.id)
      );
    }
    
    return collections.length > 0 ? collections : (isPreview ? mockCollections : []);
  };

  const displayCollections = getDisplayCollections();

  const getColumnsClass = () => {
    switch (settings.columns) {
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case '5': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getAspectRatioClass = () => {
    switch (settings.imageAspectRatio) {
      case 'square': return 'aspect-square';
      case 'landscape': return 'aspect-[4/3]';
      case 'portrait': return 'aspect-[3/4]';
      default: return 'aspect-[4/3]';
    }
  };

  const getCardStyleClass = () => {
    switch (settings.cardStyle) {
      case 'bordered': return 'border border-gray-200 hover:border-gray-300';
      case 'elevated': return 'shadow-sm hover:shadow-md';
      default: return '';
    }
  };

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: settings.backgroundColor || '#f9fafb' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading collections...</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayCollections.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-16"
      style={{ 
        backgroundColor: settings.backgroundColor || '#f9fafb',
        color: settings.textColor || '#111827'
      }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {/* Header */}
        {(settings.title || settings.subtitle) && (
          <div className="text-center mb-12">
            {settings.title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {settings.title}
              </h2>
            )}
            {settings.subtitle && (
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Collections Grid */}
        <div className={`grid ${getColumnsClass()} gap-8`}>
          {displayCollections.map((collection) => (
            <a
              key={collection.id}
              href={`/collections/${collection.slug}`}
              className={`group block rounded-lg overflow-hidden transition-all duration-300 ${getCardStyleClass()}`}
            >
              {/* Image */}
              <div className={`${getAspectRatioClass()} overflow-hidden bg-gray-100`}>
                <img
                  src={collection.image || '/placeholder-category.svg'}
                  alt={collection.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {collection.name}
                </h3>
                
                {settings.showDescription && collection.description && (
                  <p className="text-sm opacity-70 mb-3 line-clamp-2">
                    {collection.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  {settings.showProductCount && collection.productCount !== undefined && (
                    <span className="text-sm opacity-60">
                      {collection.productCount} {collection.productCount === 1 ? 'Product' : 'Products'}
                    </span>
                  )}
                  
                  <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center">
                    Shop Now
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Button */}
        {settings.showViewAllButton && (
          <div className="text-center mt-12">
            <a
              href="/collections"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors"
            >
              {settings.viewAllButtonText || 'View All Collections'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}