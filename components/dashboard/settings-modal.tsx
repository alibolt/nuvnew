'use client';

import { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subdomain: string;
  currentPath?: string;
}

export function SettingsModal({ isOpen, onClose, subdomain, currentPath }: SettingsModalProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
      setIframeLoaded(false);
    } else {
      // Re-enable body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Determine which settings page to show - add modal=true parameter
  const basePath = currentPath || `/dashboard/stores/${subdomain}/settings`;
  const settingsPath = `${basePath}${basePath.includes('?') ? '&' : '?'}modal=true`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-[95vw] h-[95vh] max-w-[1600px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Store Settings
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Loading indicator */}
        {!iframeLoaded && (
          <div className="absolute inset-0 top-[57px] flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <p className="text-sm text-gray-500">Loading settings...</p>
            </div>
          </div>
        )}

        {/* Settings iframe */}
        <iframe
          src={settingsPath}
          className="flex-1 w-full border-0"
          onLoad={() => setIframeLoaded(true)}
          style={{ display: iframeLoaded ? 'block' : 'none' }}
          title="Store Settings"
        />
      </div>
    </div>
  );
}

// Hook to manage settings modal
export function useSettingsModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>();

  const openSettings = (path?: string) => {
    setCurrentPath(path);
    setIsOpen(true);
  };

  const closeSettings = () => {
    setIsOpen(false);
    setCurrentPath(undefined);
  };

  return {
    isOpen,
    openSettings,
    closeSettings,
    currentPath
  };
}