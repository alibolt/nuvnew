'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { CartIcon, HeartIcon, StarIcon, TruckIcon, ShieldIcon, RefreshIcon } from '@/components/icons/minimal-icons';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  product: any;
  store: any;
  settings: {
    showSku?: boolean;
    showVendor?: boolean;
    showTags?: boolean;
    variantStyle?: 'dropdown' | 'buttons';
  };
}

export function ProductInfo({ product, store, settings }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();

  const showSku = settings.showSku ?? true;
  const showVendor = settings.showVendor ?? true;
  const showTags = settings.showTags ?? false;
  const variantStyle = settings.variantStyle || 'buttons';

  if (!selectedVariant) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Product information unavailable</p>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!selectedVariant || isOutOfStock) return;

    setIsAddingToCart(true);
    
    try {
      const cartItem = {
        productId: product.id,
        variantId: selectedVariant.id,
        name: `${product.title} - ${selectedVariant.title}`,
        price: selectedVariant.price,
        image: selectedVariant.images?.[0]?.url || product.images?.[0] || '',
        storeId: store.id,
      };

      // Add multiple quantities if needed
      for (let i = 0; i < quantity; i++) {
        addItem(cartItem);
      }
      
      // Reset quantity after adding
      setQuantity(1);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  };

  const isOutOfStock = selectedVariant.inventory <= 0;

  return (
    <div 
      className="space-y-6"
      style={{
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      {/* Product Title */}
      <div>
        <h1 
          className="font-bold leading-tight mb-2"
          style={{
            fontFamily: 'var(--theme-font-heading)',
            fontSize: 'var(--theme-text-4xl)',
            color: 'var(--theme-text)',
            lineHeight: 'var(--theme-line-height-tight, 1.25)'
          }}
        >
          {product.title}
        </h1>
        
        {/* Vendor */}
        {showVendor && product.vendor && (
          <p 
            className="mb-2"
            style={{
              color: 'var(--theme-text-muted)',
              fontSize: 'var(--theme-text-base)'
            }}
          >
            by {product.vendor}
          </p>
        )}

        {/* Reviews */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: i < 4 ? 'var(--theme-accent)' : 'var(--theme-border)' }}>
                <StarIcon className="w-4 h-4 fill-current" />
              </span>
            ))}
          </div>
          <span 
            className="text-sm"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            (24 reviews)
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span 
            className="text-3xl font-bold"
            style={{
              color: 'var(--theme-primary)',
              fontSize: 'var(--theme-text-3xl)'
            }}
          >
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
            <span 
              className="text-lg line-through"
              style={{
                color: 'var(--theme-text-muted)',
                fontSize: 'var(--theme-text-lg)'
              }}
            >
              {formatPrice(selectedVariant.compareAtPrice)}
            </span>
          )}
        </div>
        
        {/* Stock status */}
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-2 h-2 rounded-full",
              isOutOfStock ? "bg-red-500" : "bg-green-500"
            )}
          />
          <span 
            className="text-sm font-medium"
            style={{
              color: isOutOfStock ? 'var(--theme-error)' : 'var(--theme-success)',
              fontSize: 'var(--theme-text-sm)'
            }}
          >
            {isOutOfStock ? 'Out of stock' : `${selectedVariant.inventory} in stock`}
          </span>
        </div>
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 1 && (
        <div className="space-y-3">
          <h3 
            className="font-medium"
            style={{
              fontSize: 'var(--theme-text-base)',
              color: 'var(--theme-text)'
            }}
          >
            Variant
          </h3>
          
          {variantStyle === 'buttons' ? (
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={cn(
                    "px-4 py-2 rounded-md border transition-all text-sm font-medium",
                    selectedVariant.id === variant.id
                      ? "border-[var(--theme-primary)] bg-[var(--theme-primary)] text-white"
                      : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]"
                  )}
                  style={{
                    borderRadius: 'var(--theme-radius-md)',
                    fontSize: 'var(--theme-text-sm)'
                  }}
                >
                  {variant.title}
                </button>
              ))}
            </div>
          ) : (
            <select
              value={selectedVariant.id}
              onChange={(e) => {
                const variant = product.variants.find((v: any) => v.id === e.target.value);
                if (variant) setSelectedVariant(variant);
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]"
              style={{
                borderColor: 'var(--theme-border)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-base)'
              }}
            >
              {product.variants.map((variant: any) => (
                <option key={variant.id} value={variant.id}>
                  {variant.title} - {formatPrice(variant.price)}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <label 
              className="block text-sm font-medium"
              style={{
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-sm)'
              }}
            >
              Quantity
            </label>
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--theme-text)' }}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border-x py-2 focus:outline-none"
                min="1"
                max={selectedVariant.inventory}
              />
              <button
                onClick={() => setQuantity(Math.min(selectedVariant.inventory, quantity + 1))}
                className="p-2 hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--theme-text)' }}
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAddingToCart}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md font-medium transition-all",
              isOutOfStock 
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "hover:scale-105"
            )}
            style={{
              backgroundColor: isOutOfStock ? 'var(--theme-border)' : 'var(--theme-primary)',
              color: isOutOfStock ? 'var(--theme-text-muted)' : 'var(--theme-background)',
              borderRadius: 'var(--theme-radius-md)',
              fontSize: 'var(--theme-text-base)'
            }}
          >
            <CartIcon size={20} />
            {isAddingToCart ? 'Adding...' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          
          <button 
            className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
            style={{
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius-md)',
              color: 'var(--theme-text)'
            }}
          >
            <HeartIcon size={20} />
          </button>
          
          <button 
            className="p-3 border rounded-md hover:bg-gray-50 transition-colors"
            style={{
              borderColor: 'var(--theme-border)',
              borderRadius: 'var(--theme-radius-md)',
              color: 'var(--theme-text)'
            }}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 gap-3 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-3">
          <TruckIcon size={20} color="var(--theme-accent)" />
          <span style={{ fontSize: 'var(--theme-text-sm)', color: 'var(--theme-text)' }}>
            Free shipping on orders over $50
          </span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshIcon size={20} color="var(--theme-accent)" />
          <span style={{ fontSize: 'var(--theme-text-sm)', color: 'var(--theme-text)' }}>
            30-day returns
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldIcon size={20} color="var(--theme-accent)" />
          <span style={{ fontSize: 'var(--theme-text-sm)', color: 'var(--theme-text)' }}>
            Secure payments
          </span>
        </div>
      </div>

      {/* Product details */}
      <div className="space-y-2 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
        {showSku && selectedVariant.sku && (
          <div className="flex justify-between text-sm">
            <span style={{ color: 'var(--theme-text-muted)' }}>SKU:</span>
            <span style={{ color: 'var(--theme-text)' }}>{selectedVariant.sku}</span>
          </div>
        )}
        
        {showTags && product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.tags.map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  color: 'var(--theme-text-muted)',
                  fontSize: 'var(--theme-text-xs)'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}