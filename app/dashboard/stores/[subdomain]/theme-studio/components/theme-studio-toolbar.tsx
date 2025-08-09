'use client';

import React from 'react';
import { 
  ArrowLeft, Save, Undo2, Redo2, Smartphone, 
  Tablet, Monitor, Play, Pause, Settings,
  ChevronDown, Eye, EyeOff, RefreshCw, MousePointer,
  FileText, Clock
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { PageSelector } from './page-selector';

interface ThemeStudioToolbarProps {
  subdomain: string;
  saving: boolean;
  isPublishing: boolean;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  showThemeSettings: boolean;
  showHistoryPanel?: boolean;
  selectorMode: boolean;
  selectedPage?: string;
  showPageSelector?: boolean;
  pages?: any[];
  themeCode?: string;
  onSave: () => void;
  onPublish: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onThemeSettingsToggle: () => void;
  onToggleHistoryPanel?: () => void;
  onRefreshPreview: () => void;
  onToggleSelectorMode: () => void;
  onTogglePageSelector?: () => void;
  onSelectPage?: (pageId: string) => void;
  onPreview?: () => void;
}

export function ThemeStudioToolbar({
  subdomain,
  saving,
  isPublishing,
  hasChanges,
  canUndo,
  canRedo,
  previewDevice,
  showThemeSettings,
  showHistoryPanel = false,
  selectorMode,
  selectedPage = 'homepage',
  showPageSelector = false,
  pages = [],
  themeCode = 'base',
  onSave,
  onPublish,
  onUndo,
  onRedo,
  onDeviceChange,
  onThemeSettingsToggle,
  onToggleHistoryPanel,
  onRefreshPreview,
  onToggleSelectorMode,
  onTogglePageSelector,
  onSelectPage,
  onPreview,
}: ThemeStudioToolbarProps) {
  const deviceIcons = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  const DeviceIcon = deviceIcons[previewDevice];

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 relative z-50">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/stores/${subdomain}`}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
        
        <div className="h-6 w-px bg-gray-300" />
        
        <h1 className="text-lg font-semibold text-gray-900">Theme Studio</h1>
        
        {/* Active Theme Badge */}
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
          {themeCode === 'skateshop' ? 'Skateshop' : 'Base Theme'}
        </span>
        
        {/* Page Selector */}
        {onTogglePageSelector && (
          <>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <div className="relative">
              <button
                onClick={onTogglePageSelector}
                data-page-selector-toggle
                className={cn(
                  "nuvi-btn nuvi-btn-sm",
                  showPageSelector
                    ? "nuvi-btn-primary"
                    : "nuvi-btn-ghost"
                )}
              >
                <FileText className="w-4 h-4" />
                <span className="capitalize">
                  {selectedPage === 'homepage' ? 'Home' : selectedPage}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Page Selector Dropdown */}
              {showPageSelector && onSelectPage && (
                <PageSelector
                  selectedPage={selectedPage}
                  pages={pages}
                  onSelectPage={onSelectPage}
                  onClose={onTogglePageSelector}
                />
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={cn(
              "nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only nuvi-btn-sm",
              !canUndo && "opacity-50 cursor-not-allowed"
            )}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={cn(
              "nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only nuvi-btn-sm",
              !canRedo && "opacity-50 cursor-not-allowed"
            )}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Device Preview */}
        <div className="flex items-center gap-1 mx-2">
          {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
            const Icon = deviceIcons[device];
            return (
              <button
                key={device}
                onClick={() => onDeviceChange(device)}
                className={cn(
                  "nuvi-btn nuvi-btn-icon-only nuvi-btn-sm",
                  previewDevice === device
                    ? "nuvi-btn-primary"
                    : "nuvi-btn-ghost"
                )}
                title={device.charAt(0).toUpperCase() + device.slice(1)}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Refresh Preview */}
        <button
          onClick={onRefreshPreview}
          className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only nuvi-btn-sm mx-1"
          title="Refresh Preview"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Selector Mode */}
        <button
          onClick={onToggleSelectorMode}
          className={cn(
            "nuvi-btn nuvi-btn-icon-only nuvi-btn-sm",
            selectorMode
              ? "nuvi-btn-primary"
              : "nuvi-btn-ghost"
          )}
          title={selectorMode ? "Exit selection mode" : "Enter selection mode"}
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* Preview Button */}
        {onPreview ? (
          <button
            onClick={onPreview}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only nuvi-btn-sm"
            title="Preview in new tab"
          >
            <Eye className="w-4 h-4" />
          </button>
        ) : (
          <a
            href={`http://${subdomain}.lvh.me:3000`}
            target="_blank"
            rel="noopener noreferrer"
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-icon-only nuvi-btn-sm"
            title="Preview in new tab"
          >
            <Eye className="w-4 h-4" />
          </a>
        )}

        {/* History */}
        {onToggleHistoryPanel && (
          <button
            onClick={onToggleHistoryPanel}
            className={cn(
              "nuvi-btn nuvi-btn-icon-only nuvi-btn-sm",
              showHistoryPanel
                ? "nuvi-btn-primary"
                : "nuvi-btn-ghost"
            )}
            title="History"
          >
            <Clock className="w-4 h-4" />
          </button>
        )}

        {/* Theme Settings */}
        <button
          onClick={onThemeSettingsToggle}
          className={cn(
            "nuvi-btn nuvi-btn-icon-only nuvi-btn-sm",
            showThemeSettings
              ? "nuvi-btn-primary"
              : "nuvi-btn-ghost"
          )}
          title="Theme Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <div className="h-6 w-px bg-gray-300 ml-2" />

        {/* Save/Publish */}
        <div className="flex items-center gap-2 ml-2">
          <button
            onClick={onSave}
            disabled={saving || !hasChanges}
            className={cn(
              "nuvi-btn nuvi-btn-secondary",
              saving && "nuvi-btn-loading",
              !hasChanges && "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>

          <button
            onClick={onPublish}
            disabled={isPublishing || !hasChanges || saving}
            className={cn(
              "nuvi-btn nuvi-btn-primary",
              isPublishing && "nuvi-btn-loading",
              (!hasChanges || saving) && "opacity-50 cursor-not-allowed"
            )}
          >
            <Eye className="w-4 h-4" />
            <span>{isPublishing ? "Publishing..." : "Publish"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}