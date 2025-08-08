'use client';

import React, { useState } from 'react';
import { ImageIcon, Eye } from 'lucide-react';

interface ImageProps {
  settings: {
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    aspectRatio?: 'square' | '16:9' | '4:3' | '3:2' | '2:1' | 'auto';
    overlay?: boolean;
    overlayOpacity?: number;
    overlayColor?: string;
    caption?: string;
    link?: string;
    target?: '_blank' | '_self';
    zoom?: boolean;
    lazy?: boolean;
  };
}

export function Image({ settings }: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  const {
    src = '/placeholder-image.svg',
    alt = 'Image',
    width,
    height,
    objectFit = 'cover',
    borderRadius = 'none',
    shadow = 'none',
    aspectRatio = 'auto',
    overlay = false,
    overlayOpacity = 40,
    overlayColor = '#000000',
    caption,
    link,
    target = '_self',
    zoom = false,
    lazy = true
  } = settings;

  const getBorderRadiusClass = () => {
    const radiusClasses = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      full: 'rounded-full'
    };
    return radiusClasses[borderRadius];
  };

  const getShadowClass = () => {
    const shadowClasses = {
      none: 'shadow-none',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl'
    };
    return shadowClasses[shadow];
  };

  const getAspectRatioClass = () => {
    const aspectClasses = {
      square: 'aspect-square',
      '16:9': 'aspect-video',
      '4:3': 'aspect-[4/3]',
      '3:2': 'aspect-[3/2]',
      '2:1': 'aspect-[2/1]',
      auto: ''
    };
    return aspectClasses[aspectRatio];
  };

  const getObjectFitClass = () => {
    const fitClasses = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
      'scale-down': 'object-scale-down'
    };
    return fitClasses[objectFit];
  };

  const containerClasses = `
    relative overflow-hidden group
    ${getBorderRadiusClass()}
    ${getShadowClass()}
    ${getAspectRatioClass()}
    ${zoom ? 'cursor-pointer' : ''}
    ${link ? 'cursor-pointer' : ''}
  `.trim();

  const imageClasses = `
    w-full h-full
    ${getObjectFitClass()}
    ${zoom ? 'group-hover:scale-105 transition-transform duration-300' : ''}
    ${!isLoaded ? 'opacity-0' : 'opacity-100'}
    transition-opacity duration-300
  `.trim();

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (zoom) {
      setShowLightbox(true);
    } else if (link) {
      if (target === '_blank') {
        window.open(link, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = link;
      }
    }
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  const renderImage = () => {
    if (hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={lazy ? 'lazy' : 'eager'}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined
        }}
      />
    );
  };

  const renderOverlay = () => {
    if (!overlay) return null;

    return (
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: overlayColor,
          opacity: overlayOpacity / 100
        }}
      />
    );
  };

  const renderZoomIcon = () => {
    if (!zoom) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black bg-opacity-50 rounded-full p-3">
          <Eye className="h-6 w-6 text-white" />
        </div>
      </div>
    );
  };

  const renderLightbox = () => {
    if (!showLightbox) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        onClick={closeLightbox}
      >
        <div className="relative max-w-4xl max-h-full p-4">
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 transition-colors"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const imageContent = (
    <div className={containerClasses} onClick={handleClick}>
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {renderImage()}
      {renderOverlay()}
      {renderZoomIcon()}
    </div>
  );

  return (
    <figure className="w-full">
      {imageContent}
      
      {caption && (
        <figcaption className="mt-2 text-sm text-gray-600 text-center">
          {caption}
        </figcaption>
      )}
      
      {renderLightbox()}
    </figure>
  );
}