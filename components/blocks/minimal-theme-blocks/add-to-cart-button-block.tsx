'use client';

import { useTranslation } from '@/lib/hooks/use-translations';
import { useCart } from '@/lib/cart-context';
import { useProduct } from '@/contexts/product-context';
import { useState } from 'react';
import { toast } from 'sonner';

interface AddToCartButtonSettings {
  text?: string;
  style?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  showIcon?: boolean;
  loadingText?: string;
  successText?: string;
}

export function AddToCartButtonBlock({ settings }: { settings: AddToCartButtonSettings }) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const product = useProduct();
  const [loading, setLoading] = useState(false);
  
  const handleAddToCart = async () => {
    if (!product || loading) return;
    
    setLoading(true);
    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '',
        quantity: 1,
        subdomain: product.subdomain || ''
      });
      
      toast.success(settings.successText || t('product_added_to_cart', 'product'));
    } catch (error) {
      toast.error(t('error_adding_to_cart', 'product'));
    } finally {
      setLoading(false);
    }
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }[settings.size || 'medium'];
  
  const styleClasses = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white'
  }[settings.style || 'primary'];
  
  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || !product?.inStock}
      className={`
        ${sizeClasses}
        ${styleClasses}
        ${settings.fullWidth ? 'w-full' : ''}
        font-medium rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
      `}
    >
      {loading ? (
        settings.loadingText || t('adding_to_cart', 'product')
      ) : !product?.inStock ? (
        t('out_of_stock', 'product')
      ) : (
        settings.text || t('add_to_cart', 'common')
      )}
    </button>
  );
}

export const addToCartButtonSettings = {
  text: {
    type: 'text',
    label: 'Button text (leave empty for translation)',
    default: ''
  },
  style: {
    type: 'select',
    label: 'Button style',
    default: 'primary',
    options: [
      { value: 'primary', label: 'Primary' },
      { value: 'secondary', label: 'Secondary' },
      { value: 'outline', label: 'Outline' }
    ]
  },
  size: {
    type: 'select',
    label: 'Button size',
    default: 'medium',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' }
    ]
  },
  fullWidth: {
    type: 'checkbox',
    label: 'Full width',
    default: false
  },
  showIcon: {
    type: 'checkbox',
    label: 'Show cart icon',
    default: true
  },
  loadingText: {
    type: 'text',
    label: 'Loading text (leave empty for translation)',
    default: ''
  },
  successText: {
    type: 'text',
    label: 'Success message (leave empty for translation)',
    default: ''
  }
};