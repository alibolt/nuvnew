'use client';

import { useState, useEffect } from 'react';
import { CloseIcon, ArrowRightIcon } from '@/components/icons/minimal-icons';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  settings?: {
    text?: string;
    link?: string;
    linkText?: string;
    backgroundColor?: string;
    textColor?: string;
    position?: 'top' | 'bottom';
    sticky?: boolean;
    dismissible?: boolean;
    scrolling?: boolean;
    scrollSpeed?: 'slow' | 'normal' | 'fast';
    showOnMobile?: boolean;
    showOnDesktop?: boolean;
    startDate?: string;
    endDate?: string;
  };
}

export function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Provide default values for all settings
  const config = {
    text: settings?.text || 'Welcome to our store!',
    link: settings?.link || '',
    linkText: settings?.linkText || '',
    backgroundColor: settings?.backgroundColor || '#000000',
    textColor: settings?.textColor || '#ffffff',
    position: settings?.position || 'top',
    sticky: settings?.sticky || false,
    dismissible: settings?.dismissible || false,
    scrolling: settings?.scrolling || false,
    scrollSpeed: settings?.scrollSpeed || 'normal',
    showOnMobile: settings?.showOnMobile !== false,
    showOnDesktop: settings?.showOnDesktop !== false,
    startDate: settings?.startDate,
    endDate: settings?.endDate,
  };

  // Check if announcement should be shown based on dates
  useEffect(() => {
    if (config.startDate || config.endDate) {
      const now = new Date();
      const start = config.startDate ? new Date(config.startDate) : null;
      const end = config.endDate ? new Date(config.endDate) : null;

      if (start && now < start) {
        setIsVisible(false);
      }
      if (end && now > end) {
        setIsVisible(false);
      }
    }
  }, [config.startDate, config.endDate]);

  // Check if previously dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('announcement-dismissed');
    if (dismissed === 'true' && config.dismissible) {
      setIsDismissed(true);
    }
  }, [config.dismissible]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('announcement-dismissed', 'true');
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  const scrollSpeed = {
    slow: '60s',
    normal: '30s',
    fast: '15s'
  }[config.scrollSpeed];

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        config.position === 'top' ? 'order-first' : 'order-last',
        config.sticky ? 'sticky top-0 z-50' : '',
        !config.showOnMobile && 'hidden md:block',
        !config.showOnDesktop && 'md:hidden'
      )}
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor,
      }}
    >
      <div className="relative">
        {config.scrolling ? (
          <div className="flex animate-scroll">
            <div className="flex items-center whitespace-nowrap px-4 py-2">
              <span className="text-sm">{config.text}</span>
              {config.link && config.linkText && (
                <Link
                  href={config.link}
                  className="ml-2 inline-flex items-center text-sm font-medium underline hover:no-underline"
                >
                  {config.linkText}
                  <ArrowRightIcon size={12} className="ml-1" />
                </Link>
              )}
            </div>
            {/* Duplicate for seamless scroll */}
            <div className="flex items-center whitespace-nowrap px-4 py-2">
              <span className="text-sm">{config.text}</span>
              {config.link && config.linkText && (
                <Link
                  href={config.link}
                  className="ml-2 inline-flex items-center text-sm font-medium underline hover:no-underline"
                >
                  {config.linkText}
                  <ArrowRightIcon size={12} className="ml-1" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 py-2">
            <div className="flex items-center">
              <span className="text-sm">{config.text}</span>
              {config.link && config.linkText && (
                <Link
                  href={config.link}
                  className="ml-2 inline-flex items-center text-sm font-medium underline hover:no-underline"
                >
                  {config.linkText}
                  <ArrowRightIcon size={12} className="ml-1" />
                </Link>
              )}
            </div>
          </div>
        )}

        {config.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:opacity-70 transition-opacity"
            aria-label="Dismiss announcement"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {config.scrolling && (
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll ${scrollSpeed} linear infinite;
          }
        `}</style>
      )}
    </div>
  );
}