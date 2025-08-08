'use client';

import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeroBannerProps {
  settings: {
    // Content
    title?: string;
    subtitle?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    
    // Design
    backgroundType?: 'image' | 'video' | 'gradient' | 'solid';
    backgroundImage?: string;
    backgroundVideo?: string;
    gradientStart?: string;
    gradientEnd?: string;
    backgroundColor?: string;
    textColor?: string;
    overlayOpacity?: number;
    
    // Layout
    contentAlignment?: 'left' | 'center' | 'right';
    verticalAlignment?: 'top' | 'center' | 'bottom';
    height?: 'small' | 'medium' | 'large' | 'fullscreen';
    contentWidth?: 'narrow' | 'medium' | 'wide' | 'full';
    
    // Animation
    enableParallax?: boolean;
    animationType?: string;
    animationDelay?: number;
    
    // Transparent header
    transparentHeader?: boolean;
    
    // Search
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchPosition?: 'below-subtitle' | 'below-buttons' | 'integrated';
    searchStyle?: 'default' | 'minimal' | 'rounded';
    
    // Legacy support
    textAlign?: 'left' | 'center' | 'right';
    ctaText?: string;
    ctaLink?: string;
  };
  blocks?: any[];
  store?: any;
}

export function HeroBanner({ settings, blocks = [], store }: HeroBannerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const getSearchStyleClass = () => {
    const baseClasses = 'w-full max-w-lg mx-auto';
    switch (settings.searchStyle) {
      case 'minimal':
        return `${baseClasses} border-b-2 border-white/80 bg-transparent`;
      case 'rounded':
        return `${baseClasses} rounded-full bg-white/10 backdrop-blur-sm border border-white/20`;
      default:
        return `${baseClasses} bg-white/10 backdrop-blur-sm border border-white/20`;
    }
  };
  
  const renderSearchBar = () => {
    if (!settings.showSearch) return null;
    
    return (
      <form onSubmit={handleSearch} className="mt-8">
        <div className={getSearchStyleClass()}>
          <div className="relative">
            <input
              type="text"
              placeholder={settings.searchPlaceholder || 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-transparent text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full"
              style={{ color: settings.textColor || '#ffffff' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
              disabled={isSearching}
            >
              <Search className="h-5 w-5" style={{ color: settings.textColor || '#ffffff' }} />
            </button>
          </div>
        </div>
      </form>
    );
  };
  
  // Set transparent header mode if enabled
  React.useEffect(() => {
    if (settings.transparentHeader) {
      document.body.classList.add('transparent-header-mode');
      return () => {
        document.body.classList.remove('transparent-header-mode');
      };
    }
  }, [settings.transparentHeader]);
  const getHeightClass = () => {
    switch (settings.height) {
      case 'small': return 'h-96';
      case 'medium': return 'h-[600px]';
      case 'large': return 'h-[800px]';
      case 'fullscreen': return 'h-screen';
      default: return 'h-[800px]';
    }
  };

  const getTextAlignClass = () => {
    const alignment = settings.contentAlignment || settings.textAlign || 'center';
    switch (alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      case 'center':
      default: return 'text-center';
    }
  };
  
  const getContentWidthClass = () => {
    switch (settings.contentWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'medium': return 'max-w-4xl';
      case 'wide': return 'max-w-6xl';
      case 'full': return 'w-full';
      default: return 'max-w-4xl';
    }
  };
  
  const getVerticalAlignClass = () => {
    // Add extra padding top when transparent header is enabled
    const extraPaddingTop = settings.transparentHeader ? 'pt-24' : '';
    
    switch (settings.verticalAlignment) {
      case 'top': return `items-start pt-20 ${extraPaddingTop}`;
      case 'bottom': return 'items-end pb-20';
      case 'center':
      default: return `items-center ${extraPaddingTop}`;
    }
  };
  
  // Get background styles
  const getBackgroundStyle = () => {
    const styles: React.CSSProperties = {};
    
    switch (settings.backgroundType || 'image') {
      case 'gradient':
        styles.background = `linear-gradient(135deg, ${settings.gradientStart || '#667eea'} 0%, ${settings.gradientEnd || '#764ba2'} 100%)`;
        break;
      case 'solid':
        styles.backgroundColor = settings.backgroundColor || '#1e293b';
        break;
      case 'image':
        if (settings.backgroundImage) {
          styles.backgroundImage = `url(${settings.backgroundImage})`;
          styles.backgroundSize = 'cover';
          styles.backgroundPosition = 'center';
          styles.backgroundRepeat = 'no-repeat';
        }
        break;
    }
    
    return styles;
  };

  return (
    <section 
      className={`relative ${getHeightClass()} flex ${getVerticalAlignClass()} overflow-hidden`}
      style={getBackgroundStyle()}
    >
      {/* Video Background */}
      {settings.backgroundType === 'video' && settings.backgroundVideo && (
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={settings.backgroundVideo}
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Overlay */}
      {(settings.backgroundImage || settings.backgroundVideo) && settings.overlayOpacity !== undefined && (
        <div
          className="absolute inset-0 bg-black"
          style={{
            opacity: (settings.overlayOpacity || 40) / 100,
          }}
        />
      )}

      {/* Content */}
      <div 
        className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 w-full"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className={`${getContentWidthClass()} ${settings.contentAlignment === 'center' ? 'mx-auto' : settings.contentAlignment === 'right' ? 'ml-auto' : ''}`}>
          
          {/* Title */}
          {settings.title && (
            <h1 
              className={`text-4xl md:text-6xl lg:text-7xl font-bold ${getTextAlignClass()} mb-6`}
              style={{ 
                fontFamily: 'var(--theme-typography-heading-font, Inter)',
                fontWeight: 'var(--theme-typography-heading-weight, 700)',
                color: settings.textColor || (settings.backgroundImage || settings.backgroundVideo ? '#ffffff' : '#111827')
              }}
            >
              {settings.title}
            </h1>
          )}

          {/* Subtitle */}
          {settings.subtitle && (
            <p 
              className={`text-xl md:text-2xl ${getTextAlignClass()} mb-8 max-w-3xl ${
                settings.contentAlignment === 'center' ? 'mx-auto' : settings.contentAlignment === 'right' ? 'ml-auto' : ''
              }`}
              style={{ 
                fontFamily: 'var(--theme-typography-body-font, Inter)',
                color: settings.textColor || (settings.backgroundImage || settings.backgroundVideo ? '#e5e7eb' : '#6b7280')
              }}
            >
              {settings.subtitle}
            </p>
          )}

          {/* Search Bar - Below Subtitle */}
          {settings.showSearch && (!settings.searchPosition || settings.searchPosition === 'below-subtitle') && renderSearchBar()}

          {/* Buttons */}
          <div className={`${getTextAlignClass()} space-y-4 sm:space-y-0 sm:space-x-4 ${settings.showSearch && settings.searchPosition === 'below-subtitle' ? 'mt-8' : ''}`}>
            {/* Primary Button */}
            {(settings.primaryButtonText || settings.ctaText) && (
              <a
                href={settings.primaryButtonLink || settings.ctaLink || '/collections'}
                className="btn btn-primary text-lg"
              >
                {settings.primaryButtonText || settings.ctaText}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            )}
            
            {/* Secondary Button */}
            {settings.secondaryButtonText && (
              <a
                href={settings.secondaryButtonLink || '#'}
                className="btn btn-secondary text-lg"
              >
                {settings.secondaryButtonText}
              </a>
            )}
          </div>
          
          {/* Search Bar - Below Buttons */}
          {settings.showSearch && settings.searchPosition === 'below-buttons' && renderSearchBar()}
        </div>
      </div>

    </section>
  );
}

export default HeroBanner;
