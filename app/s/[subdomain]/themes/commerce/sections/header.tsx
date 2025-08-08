'use client';

import React, { useState } from 'react';
import { BlockListRenderer } from '@/components/blocks/block-renderer';
import './header.css';

interface HeaderProps {
  settings: {
    // Design settings
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    
    // Layout settings
    stickyHeader?: boolean;
    height?: 'compact' | 'normal' | 'large';
  };
  blocks?: any[];
  store?: any;
  isPreview?: boolean;
  onBlockClick?: (section: any, block: any, event: React.MouseEvent) => void;
}

export function Header({ 
  settings, 
  blocks = [],
  store,
  isPreview = false,
  onBlockClick
}: HeaderProps) {
  const [isTransparent, setIsTransparent] = useState(false);
  
  // Check if transparent header mode is active
  React.useEffect(() => {
    const checkTransparentMode = () => {
      setIsTransparent(document.body.classList.contains('transparent-header-mode'));
    };
    
    // Initial check
    checkTransparentMode();
    
    // Watch for changes
    const observer = new MutationObserver(checkTransparentMode);
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);


  // Get header height class
  const getHeaderHeight = () => {
    switch (settings.height) {
      case 'compact': return 'h-14';
      case 'normal': return 'h-16';
      case 'large': return 'h-20';
      default: return 'h-16';
    }
  };

  // Get dynamic styles from settings
  const getHeaderStyles = () => {
    const styles: React.CSSProperties = {};
    
    if (!isTransparent) {
      if (settings.backgroundColor) {
        styles.backgroundColor = settings.backgroundColor;
      }
      if (settings.borderColor) {
        styles.borderBottomColor = settings.borderColor;
      }
    }
    
    return styles;
  };

  // Get text color for elements
  const getTextColor = () => {
    // Always respect user's text color choice if set
    if (settings.textColor) {
      return '';  // Will use inline style
    }
    // Default colors
    if (isTransparent) {
      return 'text-white/90';
    }
    return 'text-gray-700';
  };

  // Always render header with BlockListRenderer
  return (
    <header 
      className={`z-50 transition-all duration-300 ${
        settings.stickyHeader ? 'sticky top-0' : ''
      } ${
        isTransparent 
          ? 'absolute inset-x-0 top-0 bg-transparent' 
          : 'bg-white border-b'
      }`}
      style={getHeaderStyles()}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <BlockListRenderer
          blocks={blocks || []}
          context={{ store, section: { settings } }}
          isPreview={isPreview}
          isEditing={isPreview}
          onBlockClick={onBlockClick}
          className={`header-blocks flex items-center ${getHeaderHeight()} py-4 ${getTextColor()}`}
          style={{ 
            color: settings.textColor || undefined
          }}
        />
      </div>
    </header>
  );
}