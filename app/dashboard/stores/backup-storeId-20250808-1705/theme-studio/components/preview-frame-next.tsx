'use client';

import React, { useEffect, useRef, useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface PreviewFrameNextProps {
  storeSubdomain: string;
  device: 'desktop' | 'tablet' | 'mobile';
  sections?: any[];
  refreshKey?: number;
  pageType?: string;
  selectorMode?: boolean;
}

export const PreviewFrameNext = forwardRef<HTMLIFrameElement, PreviewFrameNextProps>(
  function PreviewFrameNext({ storeSubdomain, device, sections, refreshKey = 0, pageType = 'homepage', selectorMode = false }, ref) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const currentPort = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
  
  // Determine preview URL based on page type
  let previewPath = '/preview';
  if (pageType === 'collection') {
    previewPath = '/collections/all/preview';
  } else if (pageType === 'product') {
    previewPath = '/products/sample-product/preview';
  } else if (pageType === 'search') {
    previewPath = '/search/preview?q=sample';
  } else if (pageType === 'account') {
    previewPath = '/account/preview';
  } else if (pageType === 'cart') {
    previewPath = '/cart/preview';
  } else if (pageType !== 'homepage' && pageType) {
    // For static pages
    previewPath = '/pages/sample/preview';
  }
  
  const previewUrl = `http://localhost:${currentPort}/s/${storeSubdomain}${previewPath}`;

  // Handle iframe loaded event
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    
    // Initial sections are sent by the parent component through sendInitialSections
    
    // Send selector mode state
    if (ref && 'current' in ref && ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage({
        type: 'THEME_STUDIO_SELECTOR_MODE',
        enabled: selectorMode
      }, '*');
    }
  };

  // Handle page changes via postMessage instead of reloading
  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      if (!currentUrl) {
        // First load
        ref.current.src = previewUrl;
        setCurrentUrl(previewUrl);
      } else if (pageType && currentUrl !== previewUrl) {
        // Page type changed - send message instead of reloading
        if (iframeLoaded && ref.current.contentWindow) {
          ref.current.contentWindow.postMessage({
            type: 'THEME_STUDIO_NAVIGATE',
            pageType: pageType,
            url: previewUrl
          }, '*');
          setCurrentUrl(previewUrl);
        }
      }
    }
  }, [previewUrl, pageType, currentUrl, iframeLoaded]);

  // Send selector mode updates to iframe
  useEffect(() => {
    if (iframeLoaded && ref && 'current' in ref && ref.current && ref.current.contentWindow) {
      ref.current.contentWindow.postMessage({
        type: 'THEME_STUDIO_SELECTOR_MODE',
        enabled: selectorMode
      }, '*');
    }
  }, [selectorMode, iframeLoaded]);

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: '812px',
          borderRadius: '30px',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          borderRadius: '20px',
        };
      default:
        return {
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  return (
    <div className="h-full flex items-center justify-center p-8 bg-gradient-to-br from-gray-50/50 to-gray-100/30">
      <div
        className={cn(
          "transition-all duration-700 ease-out relative bg-white shadow-xl",
          device === 'mobile' && "shadow-2xl ring-1 ring-black/5",
          device === 'tablet' && "shadow-2xl ring-1 ring-black/5",
          device === 'desktop' && "shadow-lg ring-1 ring-black/5"
        )}
        style={deviceStyles}
      >
        {/* Device decorations - Apple style */}
        {device === 'mobile' && (
          <>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-black/80 rounded-full"></div>
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full"></div>
          </>
        )}
        
        <iframe
          ref={ref}
          className="w-full h-full border-0 bg-white"
          title="Store Preview"
          onLoad={handleIframeLoad}
          style={{
            borderRadius: device === 'mobile' ? '22px' : device === 'tablet' ? '12px' : '8px',
            marginTop: device === 'mobile' ? '24px' : '0',
            marginBottom: device === 'mobile' ? '12px' : '0',
            height: device === 'mobile' ? 'calc(100% - 36px)' : '100%'
          }}
        />
      </div>
    </div>
  );
});