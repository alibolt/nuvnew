'use client';

import React from 'react';
import { X } from 'lucide-react';

interface AnnouncementBarProps {
  settings: {
    backgroundColor?: string;
    textColor?: string;
    height?: string;
    position?: 'top' | 'bottom';
    alignment?: 'left' | 'center' | 'right';
    fontSize?: string;
    dismissible?: boolean;
  };
  blocks?: Array<{
    type: string;
    settings: {
      text?: string;
      link?: string;
      fontSize?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  }>;
}

export function AnnouncementBar({ settings, blocks = [] }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) {
    return null;
  }

  // Convert height class to actual height
  const getHeight = () => {
    if (settings.height === 'py-1') return '32px';
    if (settings.height === 'py-3') return '56px';
    return '40px'; // py-2 default
  };

  const barStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor || '#1f2937',
    color: settings.textColor || '#ffffff',
  };

  return (
    <div 
      className={`relative z-40 ${settings.position === 'bottom' ? 'fixed bottom-0 left-0 right-0' : ''}`}
      style={barStyle}
    >
      <div 
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${settings.height || 'py-2'}`}
        style={{ 
          maxWidth: 'var(--theme-layout-container-width, 1280px)',
          minHeight: getHeight()
        }}
      >
        <div className="flex items-center">
          {/* Left spacer for center alignment - matches header logo space */}
          {settings.alignment === 'center' && (
            <div className="flex-shrink-0 w-32" aria-hidden="true" />
          )}
          
          {blocks.length === 0 ? (
            // Default content if no blocks
            <div className={`flex-1 flex ${
              settings.alignment === 'left' ? 'justify-start' : 
              settings.alignment === 'right' ? 'justify-end' : 
              'justify-center'
            } items-center mx-8`}>
              <span className={settings.fontSize || 'text-sm'}>
                Add announcement text blocks
              </span>
            </div>
          ) : (
            <div className={`flex-1 flex ${
              settings.alignment === 'left' ? 'justify-start' : 
              settings.alignment === 'right' ? 'justify-end' : 
              'justify-center'
            } items-center gap-4 ${settings.alignment === 'center' ? 'mx-8' : ''} ${settings.fontSize || 'text-sm'}`}>
              {blocks.map((block, index) => {
                if (block.type !== 'announcement-text') return null;
                
                return (
                  <div key={index}>
                    {block.settings.link ? (
                      <a 
                        href={block.settings.link}
                        className="hover:underline transition-all"
                      >
                        {block.settings.text}
                      </a>
                    ) : (
                      <span>{block.settings.text}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Right side - dismiss button or spacer */}
          {settings.alignment === 'center' ? (
            <div className="flex-shrink-0 w-32 flex justify-end">
              {settings.dismissible !== false && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Close announcement"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ) : (
            settings.dismissible !== false && (
              <button
                onClick={() => setIsVisible(false)}
                className="ml-4 p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
                aria-label="Close announcement"
              >
                <X size={16} />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementBar;
