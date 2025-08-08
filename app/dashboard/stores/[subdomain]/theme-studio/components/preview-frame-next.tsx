'use client';

import React, { useEffect, useRef, useState, forwardRef, useCallback, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

interface PreviewFrameNextProps {
  storeSubdomain: string;
  device: 'desktop' | 'tablet' | 'mobile';
  sections?: any[];
  refreshKey?: number;
  pageType?: string;
  selectorMode?: boolean;
  selectedSectionId?: string | null;
  theme?: string;
}

export const PreviewFrameNext = forwardRef<{ scrollToSection: (sectionId: string) => void; contentWindow: Window | null }, PreviewFrameNextProps>(
  function PreviewFrameNext({ storeSubdomain, device, sections, refreshKey = 0, pageType = 'homepage', selectorMode = false, selectedSectionId, theme = 'commerce' }, ref) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollPositionRef = useRef(0);
  const restoreScrollTimeoutRef = useRef<NodeJS.Timeout>();
  const currentPort = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
  
  // Internal iframe ref
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Determine preview URL based on page type
  let previewPath = '/preview';
  if (pageType === 'collection') {
    previewPath = '/collections/all/preview';
  } else if (pageType === 'product') {
    previewPath = '/products/latest/preview';
  } else if (pageType === 'search') {
    previewPath = '/search/preview?q=sample';
  } else if (pageType === 'account') {
    previewPath = '/account/preview';
  } else if (pageType === 'login') {
    previewPath = '/account/login/preview';
  } else if (pageType === 'register') {
    previewPath = '/account/register/preview';
  } else if (pageType === 'cart') {
    previewPath = '/cart/preview';
  } else if (pageType === 'wishlist') {
    previewPath = '/wishlist/preview';
  } else if (pageType === 'blog') {
    previewPath = '/blog/preview';
  } else if (pageType === 'reviews') {
    previewPath = '/reviews/preview';
  } else if (pageType === 'contact') {
    previewPath = '/contact/preview';
  } else if (pageType === 'faq') {
    previewPath = '/faq/preview';
  } else if (pageType === 'about') {
    previewPath = '/about/preview';
  } else if (pageType === 'shipping-returns') {
    previewPath = '/shipping-returns/preview';
  } else if (pageType === 'size-guide') {
    previewPath = '/size-guide/preview';
  } else if (pageType === 'gift-cards') {
    previewPath = '/gift-cards/preview';
  } else if (pageType === 'loyalty') {
    previewPath = '/loyalty/preview';
  } else if (pageType === 'stores') {
    previewPath = '/stores/preview';
  } else if (pageType !== 'homepage' && pageType) {
    // For other static pages
    previewPath = '/pages/sample/preview';
  }
  
  const previewUrl = `/s/${storeSubdomain}${previewPath}`;

  // Force iframe src update when ref is ready or refreshKey changes
  useEffect(() => {
    if (iframeRef.current) {
      const currentUrl = `${previewUrl}?refresh=${refreshKey}&theme=${theme}`;
      console.log('[PreviewFrame] Setting iframe src:', currentUrl, 'with theme:', theme);
      iframeRef.current.src = currentUrl;
    }
  }, [previewUrl, refreshKey, theme]);

  // Scroll position management
  const saveScrollPosition = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({
          type: 'THEME_STUDIO_GET_SCROLL_POSITION'
        }, '*');
      } catch (error) {
        console.warn('Failed to request scroll position:', error);
      }
    }
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    console.log('[PreviewFrame] scrollToSection called:', sectionId, {
      hasRef: !!iframeRef.current,
      hasContentWindow: !!iframeRef.current?.contentWindow,
      iframeLoaded
    });
    
    if (iframeRef.current?.contentWindow && iframeLoaded) {
      try {
        console.log('[PreviewFrame] Sending scroll message to iframe');
        iframeRef.current.contentWindow.postMessage({
          type: 'THEME_STUDIO_SCROLL_TO_SECTION',
          sectionId: sectionId
        }, '*');
      } catch (error) {
        console.warn('Failed to scroll to section:', error);
      }
    } else {
      console.warn('[PreviewFrame] Cannot scroll - iframe not ready');
    }
  }, [iframeLoaded]);

  const restoreScrollPosition = useCallback(() => {
    if (iframeRef.current?.contentWindow && scrollPositionRef.current > 0) {
      // Clear any existing timeout
      if (restoreScrollTimeoutRef.current) {
        clearTimeout(restoreScrollTimeoutRef.current);
      }
      
      // Restore scroll position with longer delay to prevent conflicts
      restoreScrollTimeoutRef.current = setTimeout(() => {
        try {
          // Only restore if scroll position is significant
          if (scrollPositionRef.current > 50) {
            iframeRef.current?.contentWindow?.postMessage({
              type: 'THEME_STUDIO_RESTORE_SCROLL_POSITION',
              scrollY: scrollPositionRef.current
            }, '*');
          }
        } catch (error) {
          console.warn('Failed to restore scroll position:', error);
        }
      }, 300);
    }
  }, []);

  // Handle iframe loaded event
  const handleIframeLoad = () => {
    console.log('[PreviewFrame] Iframe loaded successfully:', previewUrl);
    
    // Simple check - no excessive retries
    const checkContentWindow = () => {
      if (iframeRef.current?.contentWindow) {
        console.log('[PreviewFrame] ContentWindow available');
        setIframeLoaded(true);
        return true;
      } else {
        console.log('[PreviewFrame] ContentWindow not available, but iframe loaded - continuing anyway');
        setIframeLoaded(true); // Continue anyway - preview will still work
        return false;
      }
    };
    
    // Wait a moment for DOM to stabilize, then check once
    setTimeout(checkContentWindow, 100);
    
    // Dispatch event to let parent know iframe is loaded
    window.dispatchEvent(new CustomEvent('preview-frame-loaded', {
      detail: { 
        storeSubdomain,
        pageType,
        device
      }
    }));
    
    // Wait a bit for iframe to be fully ready, then check again
    setTimeout(() => {
      console.log('[PreviewFrame] Delayed iframe check:', {
        src: iframeRef.current?.src || 'no ref',
        contentWindow: !!iframeRef.current?.contentWindow,
        readyState: iframeRef.current?.contentDocument?.readyState || 'unknown'
      });
      
      // Send selector mode state
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'THEME_STUDIO_SELECTOR_MODE',
          enabled: selectorMode
        }, '*');
      }
    }, 100);

    // Restore scroll position after iframe loads
    restoreScrollPosition();
  };

  // Handle page changes via postMessage instead of reloading  
  useEffect(() => {
    // Update current URL tracking
    if (!currentUrl) {
      setCurrentUrl(previewUrl);
    } else if (pageType && currentUrl !== previewUrl) {
      // Page type changed - send message instead of reloading
      if (iframeLoaded && iframeRef.current?.contentWindow) {
        console.log('[PreviewFrame] Page type changed, sending navigate message:', pageType);
        iframeRef.current.contentWindow.postMessage({
          type: 'THEME_STUDIO_NAVIGATE',
          pageType: pageType,
          url: previewUrl
        }, '*');
      }
      setCurrentUrl(previewUrl);
    }
  }, [previewUrl, pageType, currentUrl, iframeLoaded]);

  // Send selector mode updates to iframe
  useEffect(() => {
    if (iframeLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'THEME_STUDIO_SELECTOR_MODE',
        enabled: selectorMode
      }, '*');
    }
  }, [selectorMode, iframeLoaded]);

  // Scroll to selected section - always scroll when selectedSectionId changes
  useEffect(() => {
    console.log('[PreviewFrame] selectedSectionId changed:', selectedSectionId, 'iframeLoaded:', iframeLoaded);
    if (selectedSectionId && iframeLoaded) {
      const timer = setTimeout(() => {
        console.log('[PreviewFrame] Scrolling to section:', selectedSectionId);
        scrollToSection(selectedSectionId);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedSectionId, iframeLoaded, scrollToSection]);

  // Expose scroll function to parent and forward the iframe ref
  useImperativeHandle(ref, () => ({
    scrollToSection: (sectionId: string) => {
      if (iframeLoaded) {
        console.log('[PreviewFrame] Manual scroll to section:', sectionId);
        scrollToSection(sectionId);
      }
    },
    // Also expose the iframe element if needed
    get contentWindow() {
      return iframeRef.current?.contentWindow || null;
    }
  }), [iframeLoaded, scrollToSection]);

  // Load scroll position from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = `theme-studio-scroll-${storeSubdomain}-${pageType}`;
      const savedPosition = localStorage.getItem(storageKey);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        scrollPositionRef.current = position;
        setScrollPosition(position);
      }
    }
  }, [storeSubdomain, pageType]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_STUDIO_SCROLL_POSITION') {
        const scrollY = event.data.scrollY || 0;
        scrollPositionRef.current = scrollY;
        setScrollPosition(scrollY);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
          const storageKey = `theme-studio-scroll-${storeSubdomain}-${pageType}`;
          localStorage.setItem(storageKey, scrollY.toString());
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [storeSubdomain, pageType]);

  // Save scroll position before page changes
  useEffect(() => {
    return () => {
      // Save scroll position when component unmounts or page changes
      saveScrollPosition();
    };
  }, [saveScrollPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (restoreScrollTimeoutRef.current) {
        clearTimeout(restoreScrollTimeoutRef.current);
      }
    };
  }, []);

  // Expose scroll position methods to parent
  React.useImperativeHandle(ref, () => ({
    ...((ref as any)?.current || {}),
    saveScrollPosition,
    restoreScrollPosition,
    getScrollPosition: () => scrollPositionRef.current
  }), [saveScrollPosition, restoreScrollPosition]);

  // Device-specific rendering
  if (device === 'desktop') {
    // Desktop - full width, no device frame
    return (
      <div className="w-full h-full">
        <iframe
          ref={iframeRef}
          src={`${previewUrl}?refresh=${refreshKey}&theme=${theme}`}
          className="w-full h-full border-0"
          title="Store Preview"
          onLoad={handleIframeLoad}
          onError={(e) => {
            console.error('[PreviewFrame] Iframe load error:', e);
          }}
        />
      </div>
    );
  }

  // Mobile and Tablet - with device frames
  const deviceConfig = {
    mobile: {
      width: 375,
      height: 812,
      scale: 0.9,
      frameClass: 'bg-gray-900',
      borderRadius: 40,
      bezelWidth: 12,
    },
    tablet: {
      width: 820,
      height: 1180,
      scale: 0.7,
      frameClass: 'bg-gray-800',
      borderRadius: 24,
      bezelWidth: 16,
    }
  };

  const config = deviceConfig[device as keyof typeof deviceConfig];
  
  return (
    <div className="relative" style={{
      width: `${config.width}px`,
      height: `${config.height}px`,
      transform: `scale(${config.scale})`,
      transformOrigin: 'center center',
    }}>
      {/* Device Frame */}
      <div 
        className={cn(
          "absolute inset-0 shadow-2xl",
          config.frameClass
        )}
        style={{
          borderRadius: `${config.borderRadius}px`,
        }}
      >
        {/* Screen Area */}
        <div 
          className="absolute bg-white overflow-hidden"
          style={{
            top: `${config.bezelWidth}px`,
            left: `${config.bezelWidth}px`,
            right: `${config.bezelWidth}px`,
            bottom: `${config.bezelWidth}px`,
            borderRadius: `${config.borderRadius - 4}px`,
          }}
        >
          {/* Device UI Elements */}
          {device === 'mobile' && (
            <>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-2xl z-10" />
              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-300 rounded-full z-10" />
            </>
          )}

          {/* Iframe */}
          <iframe
            ref={iframeRef}
            src={`${previewUrl}?refresh=${refreshKey}&theme=${theme}`}
            className="w-full h-full border-0"
            title="Store Preview"
            onLoad={handleIframeLoad}
            onError={(e) => {
              console.error('[PreviewFrame] Iframe load error:', e);
            }}
          />
        </div>
      </div>
    </div>
  );
});