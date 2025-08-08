'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useParams } from 'next/navigation';
import type { Product, ProductVariant } from '@/types/product';

// Types imported from @/types/product

interface ProductContextType {
  product: Product | null;
  selectedVariant: ProductVariant | null;
  selectedVariantId: string | null;
  setSelectedVariantId: (id: string) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  addToCart: (callback?: () => void) => Promise<void>;
  isAddingToCart: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

interface ProductProviderProps {
  product: Product;
  children: React.ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ product, children }) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    product.variants[0]?.id || null
  );
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const params = useParams();
  const subdomain = params.subdomain as string;

  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || null;

  // Update selected variant when product changes
  useEffect(() => {
    if (product.variants.length > 0 && !product.variants.find(v => v.id === selectedVariantId)) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  const addToCart = async (callback?: () => void) => {
    if (!selectedVariant || !product) return;

    setIsAddingToCart(true);
    try {
      // Get the first product image
      const productImages = Array.isArray(product.images) 
        ? product.images 
        : (typeof product.images === 'string' 
            ? JSON.parse(product.images || '[]') 
            : []);
      
      const firstImage = productImages[0];
      
      // Process image - it might be a string or an object
      let processedImage;
      if (firstImage) {
        if (typeof firstImage === 'string') {
          processedImage = firstImage.startsWith('/') || firstImage.startsWith('http')
            ? firstImage
            : `/uploads/${subdomain}/${firstImage}`;
        } else if (typeof firstImage === 'object' && firstImage.url) {
          processedImage = firstImage;
        }
      }

      // Add to cart using the cart context
      await addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        productName: product.name,
        productSlug: product.slug || product.handle,
        variantName: selectedVariant.name || selectedVariant.title,
        price: selectedVariant.price,
        compareAtPrice: selectedVariant.compareAtPrice,
        image: processedImage,
        subdomain: subdomain,
        sku: selectedVariant.sku
      });

      // Add multiple items if quantity > 1
      for (let i = 1; i < quantity; i++) {
        await addItem({
          productId: product.id,
          variantId: selectedVariant.id,
          productName: product.name,
          productSlug: product.slug || product.handle,
          variantName: selectedVariant.name || selectedVariant.title,
          price: selectedVariant.price,
          compareAtPrice: selectedVariant.compareAtPrice,
          image: processedImage,
          subdomain: subdomain,
          sku: selectedVariant.sku
        });
      }

      // Reset quantity after successful add
      setQuantity(1);
      
      // Call callback if provided (e.g., show success message, open cart)
      if (callback) {
        callback();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Error is already handled in cart context with toast
    } finally {
      setIsAddingToCart(false);
    }
  };

  const value: ProductContextType = {
    product,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    quantity,
    setQuantity,
    addToCart,
    isAddingToCart,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};