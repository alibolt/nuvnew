'use client';

import { useCart } from '@/lib/cart-context';
import { useTranslation } from '@/lib/hooks/use-translations';
import { useState } from 'react';
import { CartDrawer } from './cart-drawer';
import { ShoppingBag } from 'lucide-react';

export function CartButton({ 
  subdomain, 
  primaryColor 
}: { 
  subdomain: string;
  primaryColor?: string; // Make optional for backward compatibility
}) {
  const { getCartForStore } = useCart();
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const storeItems = getCartForStore(subdomain);
  const itemCount = storeItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label={t('cart', 'common')}
        title={t('cart', 'common')}
      >
        <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span 
            className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
            style={{ backgroundColor: 'var(--theme-colors-primary, #2563EB)' }}
          >
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        subdomain={subdomain}
        primaryColor={primaryColor}
      />
    </>
  );
}