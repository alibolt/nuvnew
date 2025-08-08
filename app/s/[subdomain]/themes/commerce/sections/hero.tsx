'use client';

import React from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';

interface HeroProps {
  settings: {
    // Content
    title?: string;
    subtitle?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    
    // Background
    backgroundType?: 'image' | 'video' | 'color' | 'gradient';
    backgroundImage?: string;
    backgroundVideo?: string;
    backgroundColor?: string;
    gradientStart?: string;
    gradientEnd?: string;
    gradientDirection?: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl';
    overlayOpacity?: number;
    
    // Layout
    height?: 'small' | 'medium' | 'large' | 'full' | 'auto';
    contentPosition?: 'left' | 'center' | 'right';
    contentAlignment?: 'left' | 'center' | 'right';
    verticalAlignment?: 'top' | 'center' | 'bottom';
    
    // Typography
    titleSize?: 'small' | 'medium' | 'large' | 'xl';
    titleColor?: string;
    subtitleColor?: string;
    descriptionColor?: string;
    
    // Buttons
    primaryButtonStyle?: 'solid' | 'outline' | 'ghost';
    primaryButtonColor?: string;
    primaryButtonTextColor?: string;
    secondaryButtonStyle?: 'solid' | 'outline' | 'ghost';
    secondaryButtonColor?: string;
    secondaryButtonTextColor?: string;
    
    // Additional
    showScrollIndicator?: boolean;
    scrollTarget?: string;
  };
  isPreview?: boolean;
}

export function Hero({ settings, isPreview }: HeroProps) {
  const {
    // Content
    title = 'Welcome to Our Store',
    subtitle = 'COLLECTION 2024',
    description = 'Discover our latest collection of premium products designed for modern living.',
    primaryButtonText = 'Shop Now',
    primaryButtonLink = '/collections/all',
    secondaryButtonText = '',
    secondaryButtonLink = '/about',
    
    // Background
    backgroundType = 'image',
    backgroundImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
    backgroundVideo = '',
    backgroundColor = '#f3f4f6',
    gradientStart = '#1e293b',
    gradientEnd = '#334155',
    gradientDirection = 'to-r',
    overlayOpacity = 40,
    
    // Layout
    height = 'large',
    contentPosition = 'center',
    contentAlignment = 'center',
    verticalAlignment = 'center',
    
    // Typography
    titleSize = 'large',
    titleColor = '#ffffff',
    subtitleColor = '#ffffff',
    descriptionColor = '#ffffff',
    
    // Buttons
    primaryButtonStyle = 'solid',
    primaryButtonColor = '#ffffff',
    primaryButtonTextColor = '#000000',
    secondaryButtonStyle = 'outline',
    secondaryButtonColor = '#ffffff',
    secondaryButtonTextColor = '#ffffff',
    
    // Additional
    showScrollIndicator = false,
    scrollTarget = '#next-section'
  } = settings;

  const getHeightClass = () => {
    switch (height) {
      case 'small': return 'h-[400px]';
      case 'medium': return 'h-[500px]';
      case 'large': return 'h-[600px]';
      case 'full': return 'h-screen';
      case 'auto': return 'min-h-[400px] py-20';
      default: return 'h-[600px]';
    }
  };

  const getContentPositionClass = () => {
    switch (contentPosition) {
      case 'left': return 'justify-start';
      case 'right': return 'justify-end';
      default: return 'justify-center';
    }
  };

  const getContentAlignmentClass = () => {
    switch (contentAlignment) {
      case 'left': return 'text-left items-start';
      case 'right': return 'text-right items-end';
      default: return 'text-center items-center';
    }
  };

  const getVerticalAlignmentClass = () => {
    switch (verticalAlignment) {
      case 'top': return 'items-start';
      case 'bottom': return 'items-end';
      default: return 'items-center';
    }
  };

  const getTitleSizeClass = () => {
    switch (titleSize) {
      case 'small': return 'text-3xl md:text-4xl';
      case 'medium': return 'text-4xl md:text-5xl';
      case 'xl': return 'text-5xl md:text-7xl';
      default: return 'text-5xl md:text-6xl';
    }
  };

  const getButtonClass = (style: string, bgColor: string, textColor: string) => {
    const baseClass = 'inline-flex items-center px-6 py-3 font-medium rounded-lg transition-all duration-200';
    
    switch (style) {
      case 'outline':
        return `${baseClass} border-2 hover:scale-105`;
      case 'ghost':
        return `${baseClass} hover:bg-white/10`;
      default: // solid
        return `${baseClass} hover:scale-105 shadow-lg hover:shadow-xl`;
    }
  };

  const handleScrollClick = () => {
    const target = document.querySelector(scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderBackground = () => {
    if (backgroundType === 'gradient') {
      return (
        <div 
          className={`absolute inset-0 bg-gradient-${gradientDirection}`}
          style={{
            backgroundImage: `linear-gradient(${gradientDirection.replace('to-', '')}, ${gradientStart}, ${gradientEnd})`
          }}
        />
      );
    }

    if (backgroundType === 'color') {
      return (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor }}
        />
      );
    }

    if (backgroundType === 'video' && backgroundVideo) {
      return (
        <>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity / 100 }}
          />
        </>
      );
    }

    // Default: image background
    return (
      <>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
        <div 
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity / 100 }}
        />
      </>
    );
  };

  return (
    <section className={`relative ${getHeightClass()} flex ${getVerticalAlignmentClass()} overflow-hidden`}>
      {/* Background */}
      {renderBackground()}

      {/* Content */}
      <div 
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)', margin: '0 auto' }}
      >
        <div className={`flex ${getContentPositionClass()}`}>
          <div className={`max-w-2xl ${getContentAlignmentClass()}`}>
            {/* Subtitle */}
            {subtitle && (
              <p 
                className="text-sm md:text-base font-medium uppercase tracking-wider mb-4 opacity-90"
                style={{ color: subtitleColor }}
              >
                {subtitle}
              </p>
            )}

            {/* Title */}
            {title && (
              <h1 
                className={`${getTitleSizeClass()} font-bold mb-6 leading-tight`}
                style={{ color: titleColor }}
              >
                {title}
              </h1>
            )}

            {/* Description */}
            {description && (
              <p 
                className="text-lg md:text-xl mb-8 max-w-xl mx-auto opacity-90"
                style={{ color: descriptionColor }}
              >
                {description}
              </p>
            )}

            {/* Buttons */}
            {(primaryButtonText || secondaryButtonText) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {primaryButtonText && (
                  <a
                    href={primaryButtonLink}
                    className={getButtonClass(primaryButtonStyle, primaryButtonColor, primaryButtonTextColor)}
                    style={{
                      backgroundColor: primaryButtonStyle === 'solid' ? primaryButtonColor : 'transparent',
                      color: primaryButtonTextColor,
                      borderColor: primaryButtonStyle === 'outline' ? primaryButtonColor : 'transparent'
                    }}
                  >
                    {primaryButtonText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                )}

                {secondaryButtonText && (
                  <a
                    href={secondaryButtonLink}
                    className={getButtonClass(secondaryButtonStyle, secondaryButtonColor, secondaryButtonTextColor)}
                    style={{
                      backgroundColor: secondaryButtonStyle === 'solid' ? secondaryButtonColor : 'transparent',
                      color: secondaryButtonTextColor,
                      borderColor: secondaryButtonStyle === 'outline' ? secondaryButtonColor : 'transparent'
                    }}
                  >
                    {secondaryButtonText}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <button
          onClick={handleScrollClick}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      )}
    </section>
  );
}