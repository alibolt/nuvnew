'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  productSlug?: string;
  variantName?: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
  image?: string | { url: string; altText?: string };
  subdomain: string;
  sku?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (variantId: string, subdomain: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number, subdomain: string) => Promise<void>;
  clearCart: (subdomain?: string) => void;
  clearStoreCart: (subdomain: string) => void;
  getTotalItems: (subdomain?: string) => number;
  getTotalPrice: (subdomain?: string) => number;
  getCartForStore: (subdomain: string) => CartItem[];
  isLoading: boolean;
  syncWithServer: (subdomain: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nuvi-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
        localStorage.removeItem('nuvi-cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nuvi-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Sync with server API
  const syncWithServer = useCallback(async (subdomain: string) => {
    try {
      const response = await fetch('/api/cart/items');
      if (response.ok) {
        const data = await response.json();
        // Merge server cart with local cart for this subdomain
        const serverItems = data.cartItems.map((item: any) => ({
          ...item,
          subdomain,
          productName: item.productName || item.name
        }));
        
        setItems(currentItems => {
          // Remove old items for this subdomain
          const otherStoreItems = currentItems.filter(item => item.subdomain !== subdomain);
          // Add server items
          return [...otherStoreItems, ...serverItems];
        });
      }
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
    }
  }, []);

  const addItem = async (newItem: Omit<CartItem, 'quantity'>) => {
    setIsLoading(true);
    try {
      // First add to local state for immediate UI update
      setItems(currentItems => {
        const existingItem = currentItems.find(
          item => item.variantId === newItem.variantId && item.subdomain === newItem.subdomain
        );

        if (existingItem) {
          return currentItems.map(item =>
            item.variantId === newItem.variantId && item.subdomain === newItem.subdomain
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...currentItems, { ...newItem, quantity: 1 }];
      });

      // Then sync with server if we have subdomain context
      if (newItem.subdomain) {
        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            variantId: newItem.variantId,
            quantity: 1
          })
        });

        if (!response.ok) {
          throw new Error('Failed to add to cart');
        }
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      toast.error('Failed to add item to cart');
      // Revert the optimistic update
      setItems(currentItems => 
        currentItems.filter(item => 
          !(item.variantId === newItem.variantId && item.subdomain === newItem.subdomain)
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (variantId: string, subdomain: string) => {
    setIsLoading(true);
    try {
      // Optimistic update
      setItems(currentItems => 
        currentItems.filter(item => 
          !(item.variantId === variantId && item.subdomain === subdomain)
        )
      );

      // Sync with server
      const response = await fetch(`/api/cart/items/${variantId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item from cart');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (variantId: string, quantity: number, subdomain: string) => {
    if (quantity <= 0) {
      await removeItem(variantId, subdomain);
      return;
    }
    
    setIsLoading(true);
    try {
      // Optimistic update
      setItems(currentItems =>
        currentItems.map(item =>
          item.variantId === variantId && item.subdomain === subdomain
            ? { ...item, quantity }
            : item
        )
      );

      // Sync with server
      const response = await fetch(`/api/cart/items/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = (subdomain?: string) => {
    if (subdomain) {
      setItems(currentItems => currentItems.filter(item => item.subdomain !== subdomain));
    } else {
      setItems([]);
    }
  };

  const clearStoreCart = (subdomain: string) => {
    setItems(currentItems => currentItems.filter(item => item.subdomain !== subdomain));
  };

  const getCartForStore = (subdomain: string) => {
    return items.filter(item => item.subdomain === subdomain);
  };

  const getTotalItems = (subdomain?: string) => {
    const relevantItems = subdomain ? getCartForStore(subdomain) : items;
    return relevantItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = (subdomain?: string) => {
    const relevantItems = subdomain ? getCartForStore(subdomain) : items;
    return relevantItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        clearStoreCart,
        getTotalItems,
        getTotalPrice,
        getCartForStore,
        isLoading,
        syncWithServer
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}