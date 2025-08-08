'use client';

import React, { useState } from 'react';
// BlockListRenderer removed - not needed for commerce theme
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
        <div className={`header-blocks flex items-center ${getHeaderHeight()} py-4 ${getTextColor()}`}>
          {/* Header content will be rendered here */}
          <div className="flex-1 flex items-center justify-between">
            {/* Logo area */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">{store?.name || 'Store'}</h1>
            </div>
            
            {/* Navigation area */}
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="hover:opacity-70">Home</a>
              <a href="/collections" className="hover:opacity-70">Collections</a>
              <a href="/products" className="hover:opacity-70">Products</a>
              <a href="/about" className="hover:opacity-70">About</a>
              <a href="/contact" className="hover:opacity-70">Contact</a>
            </nav>
            
            {/* Cart/Account area */}
            <div className="flex items-center space-x-4">
              <button className="hover:opacity-70">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="hover:opacity-70">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
