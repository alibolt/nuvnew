'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Pipette, Check, X, RefreshCw } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EnhancedColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  presetColors?: string[];
  showAlpha?: boolean;
}

// Default preset colors - popular choices
const defaultPresetColors = [
  // Basics
  '#FFFFFF', '#000000', '#808080', '#C0C0C0',
  // Primary colors
  '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  // Brand colors
  '#1DA1F2', // Twitter
  '#4267B2', // Facebook
  '#E4405F', // Instagram
  '#0077B5', // LinkedIn
  '#FF0000', // YouTube
  '#25D366', // WhatsApp
  // Popular UI colors
  '#2563EB', // Blue 600
  '#10B981', // Emerald 500
  '#F59E0B', // Amber 500
  '#EF4444', // Red 500
  '#8B5CF6', // Violet 500
  '#EC4899', // Pink 500
];

// Theme colors that can be selected
const themeColorOptions = [
  { label: 'Primary', value: 'var(--theme-colors-primary)' },
  { label: 'Secondary', value: 'var(--theme-colors-secondary)' },
  { label: 'Accent', value: 'var(--theme-colors-accent)' },
  { label: 'Background', value: 'var(--theme-colors-background)' },
  { label: 'Text', value: 'var(--theme-colors-text)' },
  { label: 'Border', value: 'var(--theme-colors-border)' },
  { label: 'Success', value: 'var(--theme-colors-success)' },
  { label: 'Error', value: 'var(--theme-colors-error)' },
];

export function EnhancedColorPicker({
  label,
  value,
  onChange,
  className,
  disabled = false,
  presetColors = defaultPresetColors,
  showAlpha = false,
}: EnhancedColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value || '#000000');
  const [activeTab, setActiveTab] = useState<'picker' | 'presets' | 'theme'>('picker');
  const [recentColors, setRecentColors] = useState<string[]>([]);
  
  // Load recent colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nuvi-recent-colors');
    if (stored) {
      try {
        setRecentColors(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Add color to recent colors
  const addToRecent = (color: string) => {
    const updated = [color, ...recentColors.filter(c => c !== color)].slice(0, 8);
    setRecentColors(updated);
    localStorage.setItem('nuvi-recent-colors', JSON.stringify(updated));
  };

  const handleApply = () => {
    onChange(tempValue);
    addToRecent(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value || '#000000');
    setIsOpen(false);
  };

  const handlePresetClick = (color: string) => {
    setTempValue(color);
    onChange(color);
    addToRecent(color);
    setIsOpen(false);
  };

  const handleThemeColorClick = (themeValue: string) => {
    onChange(themeValue);
    setIsOpen(false);
  };

  // Check if value is a CSS variable
  const isThemeColor = value?.startsWith('var(--');
  const displayValue = isThemeColor 
    ? themeColorOptions.find(opt => opt.value === value)?.label || value
    : value;

  return (
    <div className={cn("space-y-1", className)}>
      <label className="text-xs font-medium text-gray-700">{label}</label>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 border rounded-md",
              "bg-white hover:bg-gray-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer"
            )}
          >
            <div 
              className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
              style={{ 
                backgroundColor: isThemeColor ? 'var(--fallback-color, #ccc)' : value,
                backgroundImage: !value ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
                backgroundSize: !value ? '8px 8px' : undefined,
                backgroundPosition: !value ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
              }}
            />
            <span className="text-sm flex-1 text-left">{displayValue || 'Choose color'}</span>
            <Pipette className="w-4 h-4 text-gray-400" />
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          className="w-80 p-0" 
          align="start"
          onInteractOutside={(e) => {
            e.preventDefault();
          }}
        >
          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('picker')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                activeTab === 'picker' 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Color Picker
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                activeTab === 'presets' 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('theme')}
              className={cn(
                "flex-1 px-3 py-2 text-xs font-medium transition-colors",
                activeTab === 'theme' 
                  ? "text-blue-600 border-b-2 border-blue-600" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              Theme
            </button>
          </div>

          <div className="p-4">
            {/* Color Picker Tab */}
            {activeTab === 'picker' && (
              <div className="space-y-4">
                {/* Native color picker */}
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="w-full h-32 border border-gray-200 rounded cursor-pointer"
                  />
                </div>

                {/* Hex input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Hex Value</label>
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    placeholder="#000000"
                    className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Recent colors */}
                {recentColors.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-600">Recent Colors</label>
                    <div className="grid grid-cols-8 gap-1">
                      {recentColors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => setTempValue(color)}
                          className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Presets Tab */}
            {activeTab === 'presets' && (
              <div className="space-y-2">
                <div className="grid grid-cols-8 gap-2">
                  {presetColors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => handlePresetClick(color)}
                      className={cn(
                        "w-8 h-8 rounded border-2 hover:scale-110 transition-transform",
                        value === color ? "border-blue-500" : "border-gray-200"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {value === color && (
                        <Check className="w-4 h-4 text-white m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Theme Colors Tab */}
            {activeTab === 'theme' && (
              <div className="space-y-2">
                {themeColorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleThemeColorClick(option.value)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left",
                      value === option.value 
                        ? "bg-blue-50 text-blue-700" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div 
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: 'var(--fallback-color, #ccc)' }}
                    />
                    <span className="text-sm">{option.label}</span>
                    {value === option.value && (
                      <Check className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions - only for picker tab */}
          {activeTab === 'picker' && (
            <div className="flex gap-2 p-4 border-t bg-gray-50">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}