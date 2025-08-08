'use client';

import type { Product, Category, ProductVariant, ProductImage } from '@prisma/client';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

type VariantWithImages = ProductVariant & { images: ProductImage[] };
type ProductWithRelations = Product & {
  category: Category | null;
  variants: VariantWithImages[];
};

export function ProductGrid({ 
  products, 
  primaryColor,
  storeId,
  storeName,
  subdomain
}: { 
  products: ProductWithRelations[];
  primaryColor?: string; // Optional for backward compatibility
  subdomain: string;
  storeName: string;
  storeId: string;
}) {
  const { addItem } = useCart();
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const handleAddToCart = (e: React.MouseEvent, product: ProductWithRelations, variant: VariantWithImages) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(variant.id);
    
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: `${product.name} (${variant.name})`,
      productSlug: product.slug,
      price: variant.price,
      image: variant.images?.[0]?.url || '',
      storeId: storeId,
      subdomain: subdomain
    });

    setTimeout(() => {
      setAddingToCart(null);
    }, 1000);
  };

  const getPriceDisplay = (variants: VariantWithImages[]) => {
    if (!variants || variants.length === 0) {
      return 'Not available';
    }
    if (variants.length === 1) {
      return formatPrice(variants[0].price);
    }
    const minPrice = Math.min(...variants.map(v => v.price));
    return `From ${formatPrice(minPrice)}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const firstVariant = product.variants?.[0];
        const mainImage = firstVariant?.images?.[0]?.url;
        const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

        return (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
          >
            <Link href={`/s/${subdomain}/products/${product.slug}`} className="block">
              <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 relative">
                <img
                  src={mainImage || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            
              <div className="p-4 flex flex-col flex-grow">
                {product.category && (
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {product.category.name}
                  </p>
                )}
                <h3 className="text-lg font-bold text-gray-800 truncate">
                  {product.name}
                </h3>
                
                <div className="mt-2 flex-grow">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </div>
            </Link>
              
            <div className="p-4 pt-0">
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xl font-black tracking-tight"
                    style={{ color: primaryColor }}
                  >
                    {getPriceDisplay(product.variants)}
                  </span>
                  
                  {totalStock > 0 ? (
                    product.variants.length === 1 ? (
                      <button
                        onClick={(e) => handleAddToCart(e, product, firstVariant)}
                        disabled={addingToCart === firstVariant.id}
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-full hover:opacity-90 transition-all text-sm disabled:opacity-50 font-semibold"
                        style={{ backgroundColor: 'var(--theme-colors-primary, #2563EB)' }}
                      >
                        <ShoppingCart className={`h-4 w-4 ${addingToCart === firstVariant.id ? 'animate-bounce' : ''}`} />
                        {addingToCart === firstVariant.id ? 'Adding...' : 'Add to Cart'}
                      </button>
                    ) : (
                      <Link
                        href={`/s/${subdomain}/products/${product.slug}`}
                        className="flex items-center gap-2 text-white px-4 py-2 rounded-full hover:opacity-90 transition-all text-sm font-semibold"
                        style={{ backgroundColor: 'var(--theme-colors-primary, #2563EB)' }}
                      >
                        <Eye className="h-4 w-4" />
                        View Options
                      </Link>
                    )
                  ) : (
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Out of Stock</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
