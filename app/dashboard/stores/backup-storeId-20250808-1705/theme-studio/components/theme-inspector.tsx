'use client';

import { useState } from 'react';
import { Palette, Type, Layout, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseFontSize: number;
  };
  spacing: {
    sectionGap: number;
    containerPadding: number;
  };
}

interface ThemeInspectorProps {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
}

export function ThemeInspector({ settings, onChange }: ThemeInspectorProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing'>('colors');

  const handleColorChange = (key: keyof ThemeSettings['colors'], value: string) => {
    onChange({
      ...settings,
      colors: {
        ...settings.colors,
        [key]: value,
      },
    });
  };

  const handleTypographyChange = (key: keyof ThemeSettings['typography'], value: string | number) => {
    onChange({
      ...settings,
      typography: {
        ...settings.typography,
        [key]: value,
      },
    });
  };

  const handleSpacingChange = (key: keyof ThemeSettings['spacing'], value: number) => {
    onChange({
      ...settings,
      spacing: {
        ...settings.spacing,
        [key]: value,
      },
    });
  };

  const renderColorsTab = () => (
    <div className="space-y-4">
      {Object.entries(settings.colors).map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">
            {key} Color
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange(key as keyof ThemeSettings['colors'], e.target.value)}
              className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleColorChange(key as keyof ThemeSettings['colors'], e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderTypographyTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Heading Font</label>
        <select
          value={settings.typography.headingFont}
          onChange={(e) => handleTypographyChange('headingFont', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
          <option value="Ubuntu">Ubuntu</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Body Font</label>
        <select
          value={settings.typography.bodyFont}
          onChange={(e) => handleTypographyChange('bodyFont', e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Open Sans">Open Sans</option>
          <option value="Lato">Lato</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Poppins">Poppins</option>
          <option value="Source Sans Pro">Source Sans Pro</option>
          <option value="Ubuntu">Ubuntu</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Base Font Size</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="12"
            max="20"
            value={settings.typography.baseFontSize}
            onChange={(e) => handleTypographyChange('baseFontSize', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-8">{settings.typography.baseFontSize}px</span>
        </div>
      </div>
    </div>
  );

  const renderSpacingTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Section Gap</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="40"
            max="120"
            step="10"
            value={settings.spacing.sectionGap}
            onChange={(e) => handleSpacingChange('sectionGap', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">{settings.spacing.sectionGap}px</span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Container Padding</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="10"
            max="40"
            step="5"
            value={settings.spacing.containerPadding}
            onChange={(e) => handleSpacingChange('containerPadding', parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-600 w-12">{settings.spacing.containerPadding}px</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Theme Settings</h3>
        <p className="text-xs text-gray-500 mt-1">Customize your store's appearance</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'colors', label: 'Colors', icon: Palette },
          { id: 'typography', label: 'Typography', icon: Type },
          { id: 'spacing', label: 'Spacing', icon: Layout },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'colors' && renderColorsTab()}
        {activeTab === 'typography' && renderTypographyTab()}
        {activeTab === 'spacing' && renderSpacingTab()}
      </div>
    </div>
  );
}