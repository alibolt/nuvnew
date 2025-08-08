'use client';

import React from 'react';
import { 
  Plus, Search, ChevronLeft, ChevronRight,
  PanelLeftClose, PanelLeftOpen, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionListInline } from './section-list-inline';
import { Section } from '../types';

interface ThemeStudioSidebarProps {
  sections: Section[];
  selectedSection: Section | null;
  selectedSectionId: string | null;
  selectedBlockId?: string | null;
  selectedPage?: string;
  sidebarVisible: boolean;
  showHistoryPanel: boolean;
  searchTerm: string;
  subdomain: string;
  theme: string;
  onToggleSidebar: () => void;
  onToggleHistoryPanel: () => void;
  onSelectSection: (section: Section) => void;
  onSelectBlock?: (blockId: string | null) => void;
  onAddSection: (sectionData: { type: string; title: string; settings: any }) => void;
  onDuplicateSection: (section: Section) => void;
  onDeleteSection: (sectionId: string) => void;
  onReorderSections: (sections: Section[]) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onSearchChange: (term: string) => void;
  onUpdateSection?: (sectionId: string, updates: any) => void;
  onAddBlock?: (sectionId: string, blockType: string) => void;
  onUpdateBlock?: (sectionId: string, blockId: string, updates: any) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onReorderBlocks?: (sectionId: string, blockIds: string[]) => void;
}

export function ThemeStudioSidebar({
  sections,
  selectedSection,
  selectedSectionId,
  selectedBlockId,
  selectedPage = "homepage",
  sidebarVisible,
  showHistoryPanel,
  searchTerm,
  subdomain,
  theme,
  onToggleSidebar,
  onToggleHistoryPanel,
  onSelectSection,
  onSelectBlock,
  onAddSection,
  onDuplicateSection,
  onDeleteSection,
  onReorderSections,
  onToggleVisibility,
  onSearchChange,
  onUpdateSection,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
}: ThemeStudioSidebarProps) {
  return (
    <div 
      className={cn(
        "h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 relative",
        sidebarVisible ? "w-80" : "w-0"
      )}
    >
      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggleSidebar}
        className={cn(
          "absolute -right-8 top-4 p-1.5 bg-white border border-gray-200 rounded-md",
          "hover:bg-gray-50 transition-colors z-20"
        )}
        title={sidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
      >
        {sidebarVisible ? (
          <PanelLeftClose className="w-4 h-4 text-gray-600" />
        ) : (
          <PanelLeftOpen className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {sidebarVisible && (
        <>
          {/* Section List */}
          <div className="flex-1 overflow-y-auto">
            <SectionListInline
              sections={sections}
              selectedSection={selectedSection}
              selectedBlockId={selectedBlockId}
              selectedPage={selectedPage}
              onSelectSection={onSelectSection}
              onSelectBlock={onSelectBlock}
              onDuplicateSection={onDuplicateSection}
              onDeleteSection={onDeleteSection}
              onReorderSections={onReorderSections}
              onAddSection={onAddSection}
              onUpdateSection={onUpdateSection}
              onAddBlock={onAddBlock}
              onUpdateBlock={onUpdateBlock}
              onDeleteBlock={onDeleteBlock}
              onReorderBlocks={onReorderBlocks}
              onToggleVisibility={onToggleVisibility}
              subdomain={subdomain}
              theme={theme}
            />
          </div>

          {/* Add Section Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onAddSection}
              className={cn(
                "w-full px-4 py-2 text-sm font-medium text-white bg-blue-600",
                "rounded-md hover:bg-blue-700 transition-colors",
                "flex items-center justify-center gap-2"
              )}
            >
              <Plus className="w-4 h-4" />
              Add Section
            </button>
          </div>
        </>
      )}
    </div>
  );
}