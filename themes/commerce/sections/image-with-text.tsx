'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ImageWithTextProps {
  settings: {
    // Content
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    buttonStyle?: 'primary' | 'secondary' | 'outline';
    
    // Image
    image?: string;
    imagePosition?: 'left' | 'right';
    imageSize?: 'small' | 'medium' | 'large' | 'full';
    
    // Layout
    layout?: 'default' | 'overlap' | 'split';
    contentAlignment?: 'left' | 'center' | 'right';
    verticalAlignment?: 'top' | 'center' | 'bottom';
    
    // Style
    backgroundColor?: string;
    textColor?: string;
    titleColor?: string;
    padding?: 'none' | 'small' | 'medium' | 'large';
    paddingTop?: string;
    paddingBottom?: string;
    roundedCorners?: boolean;
    shadow?: boolean;
  };
  isPreview?: boolean;
}

export function ImageWithText({ settings, isPreview }: ImageWithTextProps) {
  const {
    title = 'Discover Our Story',
    subtitle = 'About Us',
    description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    buttonText,
    buttonLink = '#',
    buttonStyle = 'primary',
    image = '/placeholder-image.svg',
    imagePosition = 'left',
    imageSize = 'medium',
    layout = 'default',
    contentAlignment = 'left',
    verticalAlignment = 'center',
    backgroundColor = '#ffffff',
    textColor = '#111827',
    titleColor,
    padding = 'large',
    roundedCorners = false,
    shadow = false
  } = settings;

  const getPaddingClass = () => {
    // Note: The section-level paddingTop and paddingBottom are handled by the SectionRenderer wrapper
    // This component should not add its own padding when rendered through SectionRenderer
    // The padding prop here is kept for backward compatibility when used standalone
    
    // If we're in a section context (normal rendering), don't add padding
    // The SectionRenderer will handle it
    return '';
  };

  const getImageSizeClass = () => {
    switch (imageSize) {
      case 'small': return 'lg:col-span-5';
      case 'large': return 'lg:col-span-7';
      case 'full': return 'lg:col-span-8';
      default: return 'lg:col-span-6';
    }
  };

  const getContentSizeClass = () => {
    switch (imageSize) {
      case 'small': return 'lg:col-span-7';
      case 'large': return 'lg:col-span-5';
      case 'full': return 'lg:col-span-4';
      default: return 'lg:col-span-6';
    }
  };

  const getAlignmentClass = () => {
    switch (contentAlignment) {
      case 'center': return 'text-center items-center';
      case 'right': return 'text-right items-end';
      default: return 'text-left items-start';
    }
  };

  const getVerticalAlignmentClass = () => {
    switch (verticalAlignment) {
      case 'top': return 'justify-start';
      case 'bottom': return 'justify-end';
      default: return 'justify-center';
    }
  };

  const getButtonClass = () => {
    switch (buttonStyle) {
      case 'secondary':
        return 'btn btn-secondary';
      case 'outline':
        return 'inline-flex items-center px-6 py-3 border-2 border-current rounded font-medium hover:bg-gray-100 transition-colors';
      default:
        return 'btn btn-primary';
    }
  };

  const renderContent = () => (
    <div className={`flex flex-col ${getAlignmentClass()} ${getVerticalAlignmentClass()} h-full`}>
      <div className="space-y-4">
        {subtitle && (
          <p className="text-sm font-medium uppercase tracking-wide opacity-70">
            {subtitle}
          </p>
        )}
        
        {title && (
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold"
            style={{ color: titleColor || textColor }}
          >
            {title}
          </h2>
        )}
        
        {description && (
          <p className="text-lg opacity-80 max-w-lg">
            {description}
          </p>
        )}
        
        {buttonText && (
          <div className="pt-4">
            <a
              href={buttonLink}
              className={getButtonClass()}
            >
              {buttonText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        )}
      </div>
    </div>
  );

  if (layout === 'overlap') {
    return (
      <section 
        className={getPaddingClass()}
        style={{ backgroundColor }}
      >
        <div 
          className="mx-auto px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <div className="relative">
            {/* Background Image */}
            <div className={`relative h-[500px] overflow-hidden ${roundedCorners ? 'rounded-2xl' : ''} ${shadow ? 'shadow-xl' : ''}`}>
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            </div>
            
            {/* Overlapping Content */}
            <div className={`absolute inset-0 flex ${imagePosition === 'right' ? 'justify-start' : 'justify-end'} items-center px-8 lg:px-16`}>
              <div className="max-w-lg text-white">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'split') {
    return (
      <section className={getPaddingClass()}>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
          {/* Image Section */}
          <div className={`${imagePosition === 'right' ? 'lg:order-2' : ''}`}>
            <div className="h-full min-h-[400px] lg:min-h-full">
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content Section */}
          <div 
            className={`flex items-center px-8 lg:px-16 py-12 lg:py-16 ${imagePosition === 'right' ? 'lg:order-1' : ''}`}
            style={{ backgroundColor, color: textColor }}
          >
            {renderContent()}
          </div>
        </div>
      </section>
    );
  }

  // Default layout
  return (
    <section 
      className={getPaddingClass()}
      style={{ backgroundColor, color: textColor }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center`}>
          {/* Image */}
          <div className={`${getImageSizeClass()} ${imagePosition === 'right' ? 'lg:order-2' : ''}`}>
            <div className={`overflow-hidden ${roundedCorners ? 'rounded-2xl' : ''} ${shadow ? 'shadow-lg' : ''}`}>
              <img
                src={image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Content */}
          <div className={`${getContentSizeClass()} ${imagePosition === 'right' ? 'lg:order-1' : ''}`}>
            {renderContent()}
          </div>
        </div>
      </div>
    </section>
  );
}export default ImageUwithUtext;
