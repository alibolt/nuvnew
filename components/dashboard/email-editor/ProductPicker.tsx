'use client';

import { useState, useEffect } from 'react';
import { Search, X, Loader2, Package, Grid } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  handle: string;
}

interface Collection {
  id: string;
  name: string;
  handle: string;
  productCount: number;
  image?: string;
}

interface ProductPickerProps {
  store: any;
  onSelectProduct?: (product: Product) => void;
  onSelectProducts?: (products: Product[]) => void;
  onSelectCollection?: (collection: Collection) => void;
  multiple?: boolean;
  type?: 'product' | 'collection';
}

// Helper function to get product image from various sources
const getProductImage = (item: any): string | null => {
  // Direct image property
  if (item.image) return item.image;
  if (item.featuredImage) return item.featuredImage;
  
  // Images array (can be array of strings or objects)
  if (item.images && Array.isArray(item.images) && item.images.length > 0) {
    const firstImage = item.images[0];
    if (typeof firstImage === 'string') return firstImage;
    if (firstImage?.url) return firstImage.url;
  }
  
  // Variant images
  if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
    const firstVariant = item.variants[0];
    if (firstVariant.images && Array.isArray(firstVariant.images) && firstVariant.images.length > 0) {
      const variantImage = firstVariant.images[0];
      if (typeof variantImage === 'string') return variantImage;
      if (variantImage?.url) return variantImage.url;
    }
  }
  
  return null;
};

export function ProductPicker({
  store,
  onSelectProduct,
  onSelectProducts,
  onSelectCollection,
  multiple = false,
  type = 'product'
}: ProductPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (type === 'product') {
        loadProducts();
      } else {
        loadCollections();
      }
    }
  }, [isOpen, type]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/products`);
      console.log('Loading products for store:', store.subdomain);
      
      // Check if response is ok and has content
      if (!res.ok) {
        console.error('Failed to load products:', res.status, res.statusText);
        setProducts([]);
        return;
      }
      
      // Check if response has content
      const text = await res.text();
      if (!text) {
        console.log('Empty response, no products');
        setProducts([]);
        return;
      }
      
      const data = JSON.parse(text);
      console.log('Products loaded:', data);
      // Handle both data.products array and direct array response
      const productList = Array.isArray(data) ? data : (data.products || []);
      setProducts(productList);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/collections`);
      
      // Check if response is ok and has content
      if (!res.ok) {
        console.error('Failed to load collections:', res.status, res.statusText);
        setCollections([]);
        return;
      }
      
      // Check if response has content
      const text = await res.text();
      if (!text) {
        console.log('Empty response, no collections');
        setCollections([]);
        return;
      }
      
      const data = JSON.parse(text);
      // Handle both data.collections array and direct array response
      const collectionList = Array.isArray(data) ? data : (data.collections || []);
      setCollections(collectionList);
    } catch (error) {
      console.error('Failed to load collections:', error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Product | Collection) => {
    if (type === 'product') {
      if (multiple) {
        const newSelection = selectedItems.includes(item.id)
          ? selectedItems.filter(id => id !== item.id)
          : [...selectedItems, item.id];
        setSelectedItems(newSelection);
      } else {
        onSelectProduct?.(item as Product);
        setIsOpen(false);
      }
    } else {
      onSelectCollection?.(item as Collection);
      setIsOpen(false);
    }
  };

  const handleConfirmMultiple = () => {
    const selected = products.filter(p => selectedItems.includes(p.id));
    onSelectProducts?.(selected);
    setIsOpen(false);
    setSelectedItems([]);
  };

  const filteredItems = type === 'product'
    ? products.filter(p => {
        const name = p.name || p.title || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : collections.filter(c => {
        const name = c.name || c.title || '';
        return name.toLowerCase().includes(searchQuery.toLowerCase());
      });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full"
      >
        {type === 'product' ? <Package className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        {type === 'product' ? 'Select Product' : 'Select Collection'}
      </button>

      {isOpen && (
        <div className="nuvi-fixed nuvi-inset-0 nuvi-z-50 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-p-md">
          <div 
            className="nuvi-absolute nuvi-inset-0 nuvi-bg-black nuvi-bg-opacity-50" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="nuvi-relative nuvi-bg-white nuvi-rounded-lg nuvi-shadow-xl nuvi-w-full nuvi-max-w-4xl nuvi-max-h-[80vh] nuvi-overflow-hidden">
            {/* Header */}
            <div className="nuvi-p-md nuvi-border-b">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                <h3 className="nuvi-font-semibold">
                  {type === 'product' ? 'Select Product' : 'Select Collection'}
                  {multiple && ` (${selectedItems.length} selected)`}
                </h3>
                <button onClick={() => setIsOpen(false)} className="nuvi-p-xs">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="nuvi-relative">
                <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-muted" />
                <input
                  type="text"
                  placeholder={`Search ${type}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="nuvi-input nuvi-pl-10"
                />
              </div>
            </div>

            {/* Content */}
            <div className="nuvi-p-md nuvi-overflow-auto" style={{ maxHeight: '50vh' }}>
              {loading ? (
                <div className="nuvi-text-center nuvi-py-xl">
                  <Loader2 className="h-6 w-6 nuvi-animate-spin nuvi-mx-auto nuvi-mb-sm" />
                  <p className="nuvi-text-sm nuvi-text-muted">Loading {type}s...</p>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="nuvi-text-center nuvi-py-xl">
                  <Package className="h-12 w-12 nuvi-text-gray-300 nuvi-mx-auto nuvi-mb-md" />
                  <p className="nuvi-text-muted">No {type}s found</p>
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    {searchQuery ? 'Try adjusting your search' : `Add ${type}s to your store first`}
                  </p>
                </div>
              ) : (
                <div className="nuvi-grid nuvi-grid-cols-3 nuvi-lg:grid-cols-4 nuvi-gap-sm">
                  {filteredItems.map((item: any) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`nuvi-p-xs nuvi-border nuvi-rounded-lg nuvi-text-left nuvi-hover:border-primary nuvi-transition-colors ${
                        selectedItems.includes(item.id) ? 'nuvi-border-primary nuvi-bg-primary/5' : ''
                      }`}
                    >
                      {getProductImage(item) ? (
                        <img 
                          src={getProductImage(item)} 
                          alt={item.name || item.title || 'Product'}
                          className="nuvi-w-full nuvi-h-20 nuvi-object-cover nuvi-rounded nuvi-mb-xs"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="nuvi-w-full nuvi-h-20 nuvi-bg-gray-100 nuvi-rounded nuvi-mb-xs nuvi-flex nuvi-items-center nuvi-justify-center">
                          {type === 'product' ? <Package className="h-8 w-8 nuvi-text-gray-400" /> : <Grid className="h-8 w-8 nuvi-text-gray-400" />}
                        </div>
                      )}
                      <h4 className="nuvi-text-sm nuvi-font-medium nuvi-line-clamp-1">{item.name || item.title || 'Unnamed Item'}</h4>
                      {type === 'product' ? (
                        <p className="nuvi-text-xs nuvi-text-muted">${item.price || item.variants?.[0]?.price || '0.00'}</p>
                      ) : (
                        <p className="nuvi-text-sm nuvi-text-muted">{item.productCount || 0} products</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {multiple && (
              <div className="nuvi-p-md nuvi-border-t nuvi-flex nuvi-justify-end nuvi-gap-sm">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="nuvi-btn nuvi-btn-ghost"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmMultiple}
                  className="nuvi-btn nuvi-btn-primary"
                >
                  Select {selectedItems.length} Products
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}