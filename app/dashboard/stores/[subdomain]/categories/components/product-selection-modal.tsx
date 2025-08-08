'use client';

import { useState, useEffect } from 'react';
import { X, Search, Check, Package } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types/product';

// Product type imported from @/types/product

interface ProductSelectionModalProps {
  subdomain: string;
  isOpen: boolean;
  onClose: () => void;
  selectedProductIds: string[];
  onSelectionChange: (productIds: string[], products?: Product[]) => void;
}

export function ProductSelectionModal({
  subdomain,
  isOpen,
  onClose,
  selectedProductIds,
  onSelectionChange
}: ProductSelectionModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(selectedProductIds));

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setSelectedIds(new Set(selectedProductIds));
    }
  }, [isOpen, selectedProductIds]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/products?status=active`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProduct = (productId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSave = () => {
    const selectedProductIds = Array.from(selectedIds);
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    onSelectionChange(selectedProductIds, selectedProducts);
    onClose();
  };

  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="nuvi-modal-overlay" onClick={onClose}>
      <div 
        className="nuvi-modal-content nuvi-w-full nuvi-max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="nuvi-modal-header">
          <h2 className="nuvi-modal-title">Select Products</h2>
          <button
            onClick={onClose}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="nuvi-p-md nuvi-border-b">
          <div className="nuvi-relative">
            <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-muted" />
            <input
              type="text"
              placeholder="Search products..."
              className="nuvi-input nuvi-pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mt-md">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              <button
                onClick={handleSelectAll}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
              >
                {selectedIds.size === filteredProducts.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="nuvi-text-sm nuvi-text-muted">
                {selectedIds.size} of {filteredProducts.length} selected
              </span>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div className="nuvi-modal-body nuvi-max-h-[500px] nuvi-overflow-y-auto">
          {loading ? (
            <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-py-xl">
              <div className="nuvi-loading-spinner nuvi-loading-lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Package className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">
                {searchQuery ? 'No products found matching your search' : 'No products available'}
              </p>
            </div>
          ) : (
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-xs">
              {filteredProducts.map((product) => {
                const isSelected = selectedIds.has(product.id);
                const price = product.variants[0]?.price || 0;
                
                return (
                  <label
                    key={product.id}
                    className={`nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-rounded-lg nuvi-cursor-pointer nuvi-transition ${
                      isSelected 
                        ? 'nuvi-bg-primary/5 nuvi-border nuvi-border-primary' 
                        : 'nuvi-hover:bg-muted/50 nuvi-border nuvi-border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="nuvi-checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProduct(product.id)}
                    />
                    
                    {/* Product Image */}
                    <div className="nuvi-w-16 nuvi-h-16 nuvi-rounded nuvi-overflow-hidden nuvi-bg-muted nuvi-flex-shrink-0">
                      {product.images?.[0]?.url ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name || 'Product'}
                          className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                        />
                      ) : (
                        <div className="nuvi-w-full nuvi-h-full nuvi-flex nuvi-items-center nuvi-justify-center">
                          <Package className="h-6 w-6 nuvi-text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="nuvi-flex-1">
                      <h4 className="nuvi-font-medium">{product.name || 'Unnamed Product'}</h4>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-text-sm nuvi-text-muted">
                        <span>${(price / 100).toFixed(2)}</span>
                        {product._count?.variants && product._count.variants > 1 && (
                          <span>{product._count.variants} variants</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="nuvi-w-6 nuvi-h-6 nuvi-rounded-full nuvi-bg-primary nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Check className="h-4 w-4 nuvi-text-white" />
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="nuvi-modal-footer">
          <button
            onClick={onClose}
            className="nuvi-btn nuvi-btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="nuvi-btn nuvi-btn-primary"
          >
            Save Selection ({selectedIds.size} products)
          </button>
        </div>
      </div>
    </div>
  );
}