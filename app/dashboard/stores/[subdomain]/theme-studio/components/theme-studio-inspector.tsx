'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionInspector } from './section-inspector';
import { ThemeInspector } from './theme-inspector';
import { Section } from '../types';

interface ThemeStudioInspectorProps {
  showInspector: boolean;
  showThemeSettings: boolean;
  selectedSection: Section | null;
  selectedBlockId: string | null;
  subdomain: string;
  theme: string;
  onClose: () => void;
  onUpdateSection: (updates: Partial<Section>, skipHistory?: boolean) => void;
  onUpdateBlock: (blockUpdates: any) => void;
  onDeleteSection: () => void;
  onDuplicateSection: () => void;
  onThemeSettingsChange: (settings: Record<string, any>) => void;
  themeInspectorRef?: React.RefObject<{ saveSettings: () => Promise<void> }>;
  onImagePickerToggle?: (isOpen: boolean) => void;
}

export function ThemeStudioInspector({
  showInspector,
  showThemeSettings,
  selectedSection,
  selectedBlockId,
  subdomain,
  theme,
  onClose,
  onUpdateSection,
  onUpdateBlock,
  onDeleteSection,
  onDuplicateSection,
  onThemeSettingsChange,
  themeInspectorRef,
  onImagePickerToggle,
}: ThemeStudioInspectorProps) {
  const [isImagePickerOpen, setIsImagePickerOpen] = React.useState(false);
  
  // Notify parent when image picker state changes
  React.useEffect(() => {
    onImagePickerToggle?.(isImagePickerOpen);
  }, [isImagePickerOpen, onImagePickerToggle]);
  console.log('[ThemeStudioInspector] Props:', {
    showInspector,
    showThemeSettings,
    hasSelectedSection: !!selectedSection,
    selectedBlockId
  });
  
  if (!showInspector) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-full bg-white border-l border-gray-200 flex flex-col transition-all duration-300",
        "theme-studio-right-sidebar overflow-hidden",
        showThemeSettings ? "w-80" : isImagePickerOpen ? "w-[600px]" : "w-[420px]"
      )}
      data-image-picker-open={isImagePickerOpen}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          {showThemeSettings ? 'Theme Settings' : 'Inspector'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showThemeSettings ? (
          <ThemeInspector
            ref={themeInspectorRef}
            subdomain={subdomain}
            currentTheme={theme}
            onSettingsChange={onThemeSettingsChange}
          />
        ) : selectedSection ? (
          <SectionInspector
            section={selectedSection}
            selectedBlockId={selectedBlockId}
            onUpdate={onUpdateSection}
            onUpdateBlock={onUpdateBlock}
            onDelete={onDeleteSection}
            onDuplicate={onDuplicateSection}
            subdomain={subdomain}
            theme={theme}
            onImagePickerToggle={setIsImagePickerOpen}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">Select a section to edit its properties</p>
          </div>
        )}
      </div>
    </div>
  );
}