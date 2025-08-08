'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { PreviewFrameNext } from './preview-frame-next';

interface ThemeStudioPreviewProps {
  storeSubdomain: string;
  device: 'desktop' | 'tablet' | 'mobile';
  sections: any[];
  refreshKey: number;
  pageType: string;
  selectorMode: boolean;
  selectedSectionId: string | null;
  theme: string;
  sidebarVisible: boolean;
  showInspector: boolean;
  isImagePickerOpen?: boolean;
}

export const ThemeStudioPreview = forwardRef<
  { scrollToSection: (sectionId: string) => void; contentWindow: Window | null },
  ThemeStudioPreviewProps
>(function ThemeStudioPreview(
  {
    storeSubdomain,
    device,
    sections,
    refreshKey,
    pageType,
    selectorMode,
    selectedSectionId,
    theme,
    sidebarVisible,
    showInspector,
    isImagePickerOpen = false,
  },
  ref
) {
  // Calculate available space based on sidebars
  const getContainerStyles = () => {
    const sidebarWidth = sidebarVisible ? 320 : 0;
    const inspectorWidth = showInspector ? (isImagePickerOpen ? 600 : 420) : 0;
    
    if (device === 'desktop') {
      return {
        padding: '0',
        background: 'white',
      };
    }
    
    return {
      padding: '32px',
      background: 'linear-gradient(to bottom right, #f9fafb, #f3f4f6)',
    };
  };

  return (
    <div 
      className="flex-1 h-full overflow-hidden flex items-center justify-center"
      style={getContainerStyles()}
    >
      <PreviewFrameNext
        ref={ref}
        storeSubdomain={storeSubdomain}
        device={device}
        sections={sections}
        refreshKey={refreshKey}
        pageType={pageType}
        selectorMode={selectorMode}
        selectedSectionId={selectedSectionId}
        theme={theme}
      />
    </div>
  );
});