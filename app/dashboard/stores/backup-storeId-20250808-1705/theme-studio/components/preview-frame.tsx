'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface PreviewFrameProps {
  storeSubdomain: string;
  device: 'desktop' | 'tablet' | 'mobile';
  themeSettings?: any;
}

export function PreviewFrame({ storeSubdomain, device, themeSettings }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentPort = typeof window !== 'undefined' ? window.location.port || '3000' : '3000';
  const previewUrl = `http://localhost:${currentPort}/s/${storeSubdomain}/preview?_ts=${Date.now()}`;

  useEffect(() => {
    if (iframeRef.current && themeSettings) {
      // Send theme settings to iframe
      const message = {
        type: 'THEME_STUDIO_UPDATE',
        settings: themeSettings,
      };
      
      // Wait for iframe to load before sending message
      setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.postMessage(message, '*');
        } catch (error) {
          console.log('Could not send message to iframe');
        }
      }, 1000);
    }
  }, [themeSettings]);

  // Force refresh iframe when device changes
  useEffect(() => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  }, [device]);

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          borderRadius: '24px',
          padding: '8px',
          background: 'linear-gradient(145deg, #1a1a1a, #2d2d2d)',
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          borderRadius: '16px',
          padding: '12px',
          background: 'linear-gradient(145deg, #f0f0f0, #e0e0e0)',
        };
      default:
        return {
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          padding: '0px',
          background: 'transparent',
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  return (
    <div className="h-full flex items-center justify-center p-8">
      <div
        className="transition-all duration-500 ease-out shadow-2xl relative"
        style={deviceStyles}
      >
        {/* Device Frame for mobile/tablet */}
        {device !== 'desktop' && (
          <>
            {device === 'mobile' && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded-full"></div>
            )}
            {device === 'mobile' && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gray-800 rounded-full"></div>
            )}
          </>
        )}
        
        <iframe
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-full border-0 rounded-lg bg-white"
          title="Store Preview"
          style={{
            borderRadius: device === 'mobile' ? '20px' : device === 'tablet' ? '12px' : '8px'
          }}
        />
      </div>
    </div>
  );
}