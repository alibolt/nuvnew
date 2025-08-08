'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, ShoppingCart, Minus, Plus, Package, 
  FileCode, Briefcase, ChevronLeft, ChevronRight 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description: string;
    productType: 'physical' | 'digital' | 'service';
    price: string;
    compareAtPrice?: string;
    images: string[];
    tags: string[];
    inStock: boolean;
  };
}

export function ProductPreview({ isOpen, onClose, product }: ProductPreviewProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);

  const getProductIcon = () => {
    switch (product.productType) {
      case 'digital':
        return <FileCode className="h-4 w-4" />;
      case 'service':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getProductTypeLabel = () => {
    switch (product.productType) {
      case 'digital':
        return 'Digital Product';
      case 'service':
        return 'Service';
      default:
        return 'Physical Product';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Product Preview</DialogTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {getProductIcon()}
              <span>{getProductTypeLabel()}</span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-8 p-6">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={(() => {
                      const images = Array.isArray(product.images) ? product.images : JSON.parse(product.images as string || '[]');
                      return images[selectedImage] || '/placeholder-product.svg';
                    })()}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedImage(Math.min(product.images.length - 1, selectedImage + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="h-16 w-16" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-[#8B9F7E]' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through">${product.compareAtPrice}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* Add to Cart Section */}
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <Button className="flex-1 bg-[#8B9F7E] hover:bg-[#7A8E6E]">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {!product.inStock && (
                <p className="text-sm text-red-600">Out of stock</p>
              )}
            </Card>

            {/* Product Type Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {getProductIcon()}
                <span className="font-medium">{getProductTypeLabel()}</span>
              </div>
              <p className="text-sm text-gray-600">
                {product.productType === 'digital' && 'This product will be delivered electronically after purchase.'}
                {product.productType === 'service' && 'This is a service product. Delivery details will be provided after purchase.'}
                {product.productType === 'physical' && 'This product will be shipped to your address.'}
              </p>
            </div>
          </div>
        </div>

        {/* Mobile View Notice */}
        <div className="bg-gray-50 border-t p-4 text-center text-sm text-gray-600">
          <p>This is how your product will appear to customers on desktop. Mobile view may differ.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}