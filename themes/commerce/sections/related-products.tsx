'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
}

interface RelatedProductsProps {
  settings: {
    title?: string;
    subtitle?: string;
    source?: 'category' | 'recommendations' | 'manual';
    productId?: string; // Current product ID to find related products
    selectedProducts?: string[]; // Manual product selection
    maxProducts?: number;
    columns?: string;
    showPrice?: boolean;
    showComparePrice?: boolean;
    showAddToCart?: boolean;
    showViewAllButton?: boolean;
    viewAllButtonText?: string;
    viewAllButtonLink?: string;
    cardStyle?: 'simple' | 'bordered' | 'elevated';
    imageAspectRatio?: 'square' | 'portrait' | 'landscape';
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
    buttonTextColor?: string;
  };
  store?: any;
  currentProductId?: string;
  isPreview?: boolean;
  pageData?: any;
  context?: any;
}

export function RelatedProducts({ settings, store, currentProductId, isPreview, pageData, context }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Mock products for preview
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Classic Cotton Tee',
      slug: 'classic-cotton-tee',
      price: 24.99,
      compareAtPrice: 34.99,
      images: ['/placeholder-product.jpg']
    },
    {
      id: '2',
      name: 'Premium Polo Shirt',
      slug: 'premium-polo-shirt',
      price: 39.99,
      compareAtPrice: 49.99,
      images: ['/placeholder-product.jpg']
    },
    {
      id: '3',
      name: 'Comfortable Hoodie',
      slug: 'comfortable-hoodie',
      price: 59.99,
      images: ['/placeholder-product.jpg']
    },
    {
      id: '4',
      name: 'Casual Denim Jeans',
      slug: 'casual-denim-jeans',
      price: 79.99,
      compareAtPrice: 99.99,
      images: ['/placeholder-product.jpg']
    }
  ];

  useEffect(() => {
    // Get product ID from various sources
    const productId = settings.productId || currentProductId || pageData?.product?.id || context?.product?.id;
    
    console.log('[RelatedProducts] Product ID sources:', {
      settingsProductId: settings.productId,
      currentProductId,
      pageDataProductId: pageData?.product?.id,
      contextProductId: context?.product?.id,
      finalProductId: productId,
      isPreview,
      source: settings.source,
      subdomain: store?.subdomain
    });
    
    // In preview mode, always try to fetch real products if we have a product ID
    if (productId && store?.subdomain && settings.source !== 'manual') {
      fetchRelatedProducts(productId);
    } else if (settings.source === 'manual' && settings.selectedProducts && store?.subdomain) {
      fetchSelectedProducts();
    } else if (!productId) {
      // Only use mock products if we don't have any product ID at all
      console.log('[RelatedProducts] No product ID found, using mock products');
      setProducts(mockProducts.slice(0, settings.maxProducts || 4));
    }
  }, [settings.productId, currentProductId, pageData?.product?.id, context?.product?.id, settings.source, settings.selectedProducts, store?.subdomain, settings.maxProducts]);

  const fetchRelatedProducts = async (productId: string) => {
    setLoading(true);
    try {
      let endpoint = '';
      
      if (settings.source === 'category') {
        // First get the product to find its category
        console.log('[RelatedProducts] Fetching product details for category-based recommendations');
        const productResponse = await fetch(`/api/stores/${store.subdomain}/products/${productId}`);
        if (productResponse.ok) {
          const product = await productResponse.json();
          console.log('[RelatedProducts] Product category:', product.categoryId);
          if (product.categoryId) {
            // Get products from the same category
            endpoint = `/api/stores/${store.subdomain}/categories/${product.categoryId}/products?exclude=${productId}&limit=${settings.maxProducts || 4}`;
          }
        }
      } else if (settings.source === 'recommendations' || !settings.source) {
        // Get AI-based recommendations (for now, we'll use popular products as a fallback)
        endpoint = `/api/stores/${store.subdomain}/products/recommendations?productId=${productId}&limit=${settings.maxProducts || 4}`;
      }

      if (endpoint) {
        console.log('[RelatedProducts] Fetching from:', endpoint);
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          console.log('[RelatedProducts] Received data:', data);
          // Handle different response formats
          const products = Array.isArray(data) ? data : (data.products || []);
          setProducts(products);
        } else {
          console.error('[RelatedProducts] Failed to fetch:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedProducts = async () => {
    setLoading(true);
    try {
      const promises = settings.selectedProducts!.map(id => 
        fetch(`/api/stores/${store.subdomain}/products/${id}`).then(res => res.json())
      );
      const products = await Promise.all(promises);
      setProducts(products.filter(p => p && p.id));
    } catch (error) {
      console.error('Error fetching selected products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real implementation, this would add the product to cart
    console.log('Adding product to cart:', productId);
    
    // For now, redirect to product page
    const product = products.find(p => p.id === productId);
    if (product) {
      router.push(`/products/${product.slug}`);
    }
  };

  const getColumnsClass = () => {
    switch (settings.columns) {
      case '2': return 'grid-cols-1 sm:grid-cols-2';
      case '3': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case '5': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  const getAspectRatioClass = () => {
    switch (settings.imageAspectRatio) {
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'aspect-square';
    }
  };

  const getCardStyleClass = () => {
    switch (settings.cardStyle) {
      case 'bordered': return 'border border-gray-200 hover:border-gray-300';
      case 'elevated': return 'shadow-sm hover:shadow-md';
      default: return '';
    }
  };

  const displayProducts = products.length > 0 ? products : (isPreview ? mockProducts : []);

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: settings.backgroundColor || '#f9fafb' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
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

        {/* Products Grid */}
        <div className={`grid ${getColumnsClass()} gap-8`}>
          {displayProducts.slice(0, settings.maxProducts || 4).map((product) => {
            const discount = product.compareAtPrice 
              ? Math.round((1 - product.price / product.compareAtPrice) * 100)
              : 0;

            return (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                className={`group block rounded-lg overflow-hidden transition-all duration-300 ${getCardStyleClass()}`}
              >
                {/* Product Image */}
                <div className={`relative ${getAspectRatioClass()} bg-gray-100 overflow-hidden`}>
                  <img
                    src={
                      Array.isArray(product.images) && product.images.length > 0
                        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url || '/placeholder-product.jpg')
                        : '/placeholder-product.jpg'
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                      -{discount}%
                    </div>
                  )}

                  {/* Quick Add to Cart Button */}
                  {settings.showAddToCart && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleAddToCart(product.id, e)}
                        className="w-full py-2 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        style={{
                          backgroundColor: settings.buttonColor || '#000000'
                        }}
                      >
                        <ShoppingBag className="h-4 w-4" />
                        Quick Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-medium mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {settings.showPrice !== false && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold">
                        ${product.price.toFixed(2)}
                      </span>
                      {settings.showComparePrice !== false && product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* View All Button */}
        {settings.showViewAllButton && (
          <div className="text-center mt-12">
            <a
              href={settings.viewAllButtonLink || '/collections/all'}
              className="inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors"
              style={{
                backgroundColor: settings.buttonColor || '#000000',
                color: settings.buttonTextColor || '#ffffff'
              }}
            >
              {settings.viewAllButtonText || 'View All Products'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}export default RelatedUproducts;
