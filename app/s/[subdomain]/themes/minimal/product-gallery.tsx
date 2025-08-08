'use client';

import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { ArrowLeftIcon, ArrowRightIcon } from '@/components/icons/minimal-icons';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  product: any;
  settings: {
    thumbnailPosition?: 'left' | 'bottom';
    zoomEnabled?: boolean;
    autoPlay?: boolean;
  };
}

export function ProductGallery({ product, settings }: ProductGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Tüm varyantlardan görselleri topla
  const allImages = product.variants?.flatMap((variant: any) => 
    variant.images?.map((image: any) => ({
      ...image,
      variantId: variant.id,
      variantTitle: variant.title
    })) || []
  ) || [];

  const thumbnailPosition = settings.thumbnailPosition || 'left';
  const zoomEnabled = settings.zoomEnabled ?? true;

  if (!allImages.length) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = allImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const Thumbnails = () => (
    <div className={cn(
      "flex gap-2",
      thumbnailPosition === 'left' ? "flex-col" : "flex-row",
      thumbnailPosition === 'bottom' && "justify-center"
    )}>
      {allImages.map((image: any, index: number) => (
        <button
          key={`${image.id}-${index}`}
          onClick={() => setCurrentImageIndex(index)}
          className={cn(
            "relative overflow-hidden rounded-md transition-all",
            thumbnailPosition === 'left' ? "w-16 h-16" : "w-20 h-20",
            currentImageIndex === index 
              ? "ring-2 ring-[var(--theme-primary)] opacity-100" 
              : "opacity-60 hover:opacity-100"
          )}
        >
          <img
            src={image.url}
            alt={`${product.title} - ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );

  const MainImage = () => (
    <div className="relative group flex-1">
      <div 
        className={cn(
          "relative aspect-square overflow-hidden rounded-lg",
          "bg-gray-100"
        )}
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderRadius: 'var(--theme-radius-lg)'
        }}
      >
        <img
          src={currentImage.url}
          alt={`${product.title} - ${currentImageIndex + 1}`}
          className={cn(
            "w-full h-full object-cover transition-transform duration-300",
            isZoomed && "scale-150 cursor-zoom-out",
            !isZoomed && zoomEnabled && "cursor-zoom-in"
          )}
          onClick={() => zoomEnabled && setIsZoomed(!isZoomed)}
        />
        
        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              style={{
                backgroundColor: 'var(--theme-background)',
                color: 'var(--theme-text)'
              }}
            >
              <ArrowLeftIcon size={16} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
              style={{
                backgroundColor: 'var(--theme-background)',
                color: 'var(--theme-text)'
              }}
            >
              <ArrowRightIcon size={16} />
            </button>
          </>
        )}

        {/* Zoom indicator */}
        {zoomEnabled && (
          <div className="absolute top-3 right-3 p-2 rounded-full bg-black/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-4 h-4" />
          </div>
        )}

        {/* Image counter */}
        {allImages.length > 1 && (
          <div 
            className="absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: 'var(--theme-text)',
              color: 'var(--theme-background)'
            }}
          >
            {currentImageIndex + 1} / {allImages.length}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="w-full"
      style={{
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      {thumbnailPosition === 'left' ? (
        <div className="flex gap-4">
          <Thumbnails />
          <MainImage />
        </div>
      ) : (
        <div className="space-y-4">
          <MainImage />
          <Thumbnails />
        </div>
      )}
      
      {/* Variant info */}
      {currentImage.variantTitle && (
        <div className="mt-3 text-center">
          <p 
            className="text-sm opacity-75"
            style={{
              color: 'var(--theme-text-muted)',
              fontSize: 'var(--theme-text-sm)'
            }}
          >
            Variant: {currentImage.variantTitle}
          </p>
        </div>
      )}
    </div>
  );
}