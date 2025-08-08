'use client';

import React, { useState, useEffect, useCallback, useImperativeHandle } from 'react';
import { Palette, Type, Layout, Zap, Loader2, Square, ShoppingCart, Share2, Package, Menu, Smartphone, Gauge, Settings, ChevronRight, ChevronDown, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { GoogleFontPicker } from './google-font-picker';
import { EnhancedColorPicker } from '@/components/ui/enhanced-color-picker';
import { EnhancedTypographyPicker } from '@/components/ui/enhanced-typography-picker';
import { colorSchemes, applyColorScheme } from '@/lib/color-schemes';
import {
  ThemeSettings,
  ThemeSettingField,
  generateThemeCSSVariables,
  loadThemeSettings,
  saveThemeInstanceSettings,
  extractDefaultValues,
  sendThemeUpdateToPreview
} from '@/lib/theme-utils';
import { TEMPLATE_PRESETS } from '@/lib/template-presets';
// Custom debounce function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  }) as T;
}
import { FormInputs } from '@/components/theme-studio/form-inputs';

interface ThemeInspectorProps {
  subdomain: string;
  currentTheme?: string;
  onSettingsChange?: (settings: Record<string, any>) => void;
  onClose?: () => void;
  ref?: React.Ref<{ saveSettings: () => Promise<void> }>;
}

export const ThemeInspector = React.forwardRef<
  { saveSettings: () => Promise<void> },
  ThemeInspectorProps
>(({ subdomain, currentTheme = 'commerce', onSettingsChange, onClose }, ref) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null);
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});
  const [savedValues, setSavedValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    presets: false,
    colors: false,
    typography: false,
    layout: false,
    buttons: false,
    animations: false
  });
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);

  useEffect(() => {
    loadThemeSettingsData();
  }, [currentTheme]);

  useEffect(() => {
    const changed = JSON.stringify(currentValues) !== JSON.stringify(savedValues);
    setHasChanges(changed);
  }, [currentValues, savedValues]);

  const loadThemeSettingsData = async () => {
    try {
      setLoading(true);
      const { themeSettings: settings, currentValues: values, savedValues: saved } = await loadThemeSettings(currentTheme, subdomain);
      
      console.log('[ThemeInspector] Loaded theme settings:', settings);
      console.log('[ThemeInspector] Current values:', values);
      console.log('[ThemeInspector] Layout settings:', {
        sectionPadding: settings?.layout?.sectionPadding,
        elementSpacing: settings?.layout?.elementSpacing
      });
      
      if (settings) {
        setThemeSettings(settings);
        setCurrentValues(values);
        setSavedValues(JSON.parse(JSON.stringify(saved)));
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (values: Record<string, any>) => {
      try {
        console.log('[ThemeInspector] Saving theme settings:', { subdomain, values });
        
        const response = await fetch(`/api/stores/${subdomain}/theme-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        
        console.log('[ThemeInspector] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[ThemeInspector] Response error:', errorText);
          throw new Error(`Failed to save theme settings: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('[ThemeInspector] Theme settings saved successfully:', result);
      } catch (error) {
        console.error('[ThemeInspector] Failed to save theme settings:', error);
        // Don't show error to user for auto-save, but log it
      }
    }, 1000),
    [subdomain]
  );

  const handleSettingChange = useCallback((category: string, key: string, value: any) => {
    const fullKey = `${category}.${key}`;
    
    // Special logging for section padding and element spacing
    if (key === 'sectionPadding' || key === 'elementSpacing') {
      console.log(`[ThemeInspector] ${key} change requested:`, value);
      console.log(`[ThemeInspector] Field config:`, themeSettings?.layout?.[key]);
    }
    
    let newValues = {
      ...currentValues,
      [fullKey]: value
    };
    
    // If color scheme changed, apply the scheme colors
    if (fullKey === 'colors.activeScheme' && value !== 'custom') {
      newValues = applyColorScheme(value, newValues);
    }
    
    setCurrentValues(newValues);
    
    // Save to database (debounced)
    debouncedSave(newValues);
    
    const cssVariables = generateThemeCSSVariables(newValues);
    
    // Debug log for all changes
    console.log('[ThemeInspector] Setting changed:', { fullKey, value, newValues });
    
    // Debug log for layout changes
    if (fullKey.startsWith('layout.')) {
      console.log('[ThemeInspector] Layout setting changed:', fullKey, '=', value);
      console.log('[ThemeInspector] Generated CSS variables:', cssVariables);
    }
    
    sendThemeUpdateToPreview(newValues, cssVariables);
    
    onSettingsChange?.(newValues);
  }, [currentValues, onSettingsChange, themeSettings]);

  const saveSettings = async () => {
    try {
      setSaving(true);
      await saveThemeInstanceSettings(subdomain, currentValues);
      setSavedValues(JSON.parse(JSON.stringify(currentValues)));
      setHasChanges(false);
      toast.success('Theme settings saved successfully');
    } catch (error) {
      console.error('Failed to save theme settings:', error);
      toast.error('Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (!themeSettings) return;
    
    const defaults = extractDefaultValues(themeSettings);
    setCurrentValues(defaults);
    toast.success('Theme settings reset to defaults');
  };

  const handleApplyPreset = async (presetId: string) => {
    const confirmed = window.confirm(
      'This will apply the template preset and overwrite your current sections. Your theme settings will be preserved. Continue?'
    );
    
    if (!confirmed) return;

    setApplyingPreset(presetId);
    
    try {
      const response = await fetch(`/api/stores/${subdomain}/templates/apply-preset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ presetId }),
      });

      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', text);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply preset');
      }

      toast.success('Template preset applied successfully!');
      
      // Reload the page to show new sections
      window.location.reload();
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to apply preset');
    } finally {
      setApplyingPreset(null);
    }
  };

  // Helper function to determine if a field should take full width
  const isFullWidthField = (field: ThemeSettingField) => {
    return ['font-picker', 'url'].includes(field.type);
  };

  // Helper function to determine if fields can be grouped side by side
  const isCompactField = (field: ThemeSettingField) => {
    return ['color', 'toggle', 'boolean', 'select', 'range'].includes(field.type);
  };

  const renderField = (category: string, key: string, field: ThemeSettingField) => {
    const fullKey = `${category}.${key}`;
    const value = currentValues[fullKey] ?? field.default;

    switch (field.type) {
      case 'color':
        return (
          <EnhancedColorPicker
            label={field.label}
            value={value}
            onChange={(newValue) => handleSettingChange(category, key, newValue)}
          />
        );

      case 'select':
        const options = Array.isArray(field.options) ? field.options : [];
        return (
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-600">
              {field.label === 'Container Width' ? 'Width' : field.label}
            </label>
            <select
              value={value}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
              className="w-full min-w-0 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              {options.map((option) => {
                if (typeof option === 'string') {
                  return <option key={option} value={option}>{option}</option>;
                } else {
                  return <option key={option.value} value={option.value}>{option.label}</option>;
                }
              })}
            </select>
          </div>
        );

      case 'range':
        // Debug info for problematic fields
        if (key === 'sectionPadding' || key === 'elementSpacing') {
          console.log(`[ThemeInspector] Rendering ${key}:`, {
            fieldConfig: field,
            currentValue: value,
            fullKey: `${category}.${key}`,
            minValue: field.min
          });
        }
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-normal text-gray-600">{field.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={field.min !== undefined ? field.min : 0}
                  max={field.max || 100}
                  step={field.step || 1}
                  value={value !== undefined ? value : field.default || 0}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    if (!isNaN(newValue)) {
                      // Ensure value is within bounds
                      const min = field.min !== undefined ? field.min : 0;
                      const max = field.max || 100;
                      const clampedValue = Math.max(min, Math.min(max, newValue));
                      handleSettingChange(category, key, clampedValue);
                    }
                  }}
                  onBlur={(e) => {
                    // Handle empty or invalid input on blur
                    const newValue = parseInt(e.target.value);
                    if (isNaN(newValue) || e.target.value === '') {
                      handleSettingChange(category, key, field.default || 0);
                    }
                  }}
                  className="w-12 px-1 py-0.5 text-xs text-right border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">{field.unit || ''}</span>
              </div>
            </div>
            <input
              type="range"
              min={field.min !== undefined ? field.min : 0}
              max={field.max || 100}
              step={field.step || 1}
              value={value !== undefined ? value : field.default || 0}
              onChange={(e) => handleSettingChange(category, key, parseInt(e.target.value))}
              className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm"
              style={{
                backgroundImage: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - (field.min || 0)) / ((field.max || 100) - (field.min || 0))) * 100}%, #e5e7eb ${((value - (field.min || 0)) / ((field.max || 100) - (field.min || 0))) * 100}%, #e5e7eb 100%)`
              }}
            />
            {/* Debug info */}
            {(key === 'sectionPadding' || key === 'elementSpacing') && (
              <div className="text-xs text-gray-400">
                Debug: min={field.min}, value={value}, default={field.default}
              </div>
            )}
          </div>
        );

      case 'toggle':
      case 'boolean':
        return (
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-gray-600 flex-1">{field.label}</label>
            <button
              type="button"
              onClick={() => handleSettingChange(category, key, !value)}
              className={cn(
                "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                value ? "bg-blue-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  value ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
          </div>
        );

      case 'font-picker':
        return (
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-600">{field.label}</label>
            <EnhancedTypographyPicker
              label=""
              value={value}
              onChange={(newValue) => handleSettingChange(category, key, newValue)}
              category={field.category as any}
              compact={true}
            />
          </div>
        );

      case 'url':
      case 'link':
        return (
          <div className="space-y-1">
            <FormInputs.Link
              label={field.label}
              value={value || ''}
              onChange={(newValue) => handleSettingChange(category, key, newValue)}
              placeholder={field.placeholder || 'Select or enter URL...'}
              subdomain={subdomain}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-1">
            <label className="text-xs font-normal text-gray-600">{field.label}</label>
            <input
              type={field.type}
              value={value || ''}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
              className="w-full min-w-0 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
    }
  };

  const categoryIcons: Record<string, any> = {
    presets: FileText,
    colors: Palette,
    typography: Type,
    layout: Layout,
    product: Package,
    cart: ShoppingCart,
    social: Share2,
    buttons: Square,
    animations: Zap,
    header: Menu,
    mobile: Smartphone,
    performance: Gauge,
    advanced: Settings
  };

  const categoryLabels: Record<string, string> = {
    presets: 'Template Presets',
    colors: 'Colors & Schemes',
    typography: 'Typography',
    layout: 'Layout',
    product: 'Product',
    cart: 'Cart',
    social: 'Social',
    buttons: 'Buttons',
    animations: 'Animations',
    header: 'Header',
    mobile: 'Mobile',
    performance: 'Performance',
    advanced: 'Advanced'
  };

  // Helper function to render button sub-groups
  const renderButtonGroups = (fields: Record<string, ThemeSettingField>, category: string) => {
    const buttonGroups = [
      { key: 'primary', label: 'Primary Button', icon: Square, filter: (key: string) => key.startsWith('primary') },
      { key: 'secondary', label: 'Secondary Button', icon: Square, filter: (key: string) => key.startsWith('secondary') },
      { key: 'general', label: 'General Settings', icon: Settings, filter: (key: string) => !key.startsWith('primary') && !key.startsWith('secondary') }
    ];

    return (
      <>
        {buttonGroups.map(group => {
          const Icon = group.icon;
          const isGroupExpanded = expandedGroups[group.key] !== false;
          const groupFields = Object.entries(fields).filter(([key]) => group.filter(key));

          if (groupFields.length === 0) return null;

          return (
            <div key={group.key} className="nuvi-card">
              <button
                onClick={() => setExpandedGroups(prev => ({ ...prev, [group.key]: !prev[group.key] }))}
                className="nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm hover:nuvi-bg-muted/50 nuvi-transition-colors"
              >
                <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                  <Icon size={12} className="nuvi-text-muted" />
                  <span className="nuvi-text-xs nuvi-font-normal nuvi-text-secondary">{group.label}</span>
                </div>
                {isGroupExpanded ? (
                  <ChevronDown size={12} className="nuvi-text-muted" />
                ) : (
                  <ChevronRight size={12} className="nuvi-text-muted" />
                )}
              </button>
              {isGroupExpanded && (
                <div className="nuvi-card-content nuvi-p-xs nuvi-border-t">
                  <div className="nuvi-space-y-xs">
                    {groupFields.map(([key, field]) => (
                      <div key={key}>
                        {renderField(category, key, field)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  // Expose saveSettings method to parent
  useImperativeHandle(ref, () => ({
    saveSettings
  }), [saveSettings]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!themeSettings) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-sm text-gray-500 text-center">
          No theme settings available for this theme
        </p>
      </div>
    );
  }

  return (
    <div className="nuvi-flex nuvi-flex-col nuvi-h-full nuvi-relative nuvi-z-10 theme-studio-right-sidebar bg-[var(--nuvi-background)]" style={{ width: '320px', maxWidth: '320px', flexShrink: 0 }}>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm nuvi-border-b nuvi-bg-background nuvi-sticky nuvi-top-0 nuvi-z-20">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-min-w-0">
          <Palette size={14} className="nuvi-text-muted nuvi-flex-shrink-0" />
          <div className="nuvi-min-w-0">
            <h3 className="nuvi-text-xs nuvi-font-normal nuvi-truncate">Settings</h3>
          </div>
        </div>
        
        <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-flex-shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="nuvi-p-xs nuvi-text-muted hover:nuvi-text-foreground nuvi-transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="nuvi-flex-1 nuvi-overflow-y-auto nuvi-overflow-x-hidden nuvi-p-sm nuvi-space-y-sm theme-studio-scrollbar form-container" style={{ maxWidth: '100%', minWidth: '320px' }}>
        {/* Template Presets Section */}
        <div className="nuvi-card">
          <button
            onClick={() => setExpandedGroups(prev => ({ ...prev, presets: !prev.presets }))}
            className="nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm hover:nuvi-bg-muted/50 nuvi-transition-colors"
          >
            <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
              <FileText size={12} className="nuvi-text-muted" />
              <span className="nuvi-text-xs nuvi-font-normal nuvi-text-secondary">
                Presets
              </span>
            </div>
            {expandedGroups.presets ? (
              <ChevronDown size={12} className="nuvi-text-muted" />
            ) : (
              <ChevronRight size={12} className="nuvi-text-muted" />
            )}
          </button>
          
          {expandedGroups.presets && (
            <div className="nuvi-card-content nuvi-p-sm nuvi-border-t">
              <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-sm">
                Apply pre-designed content packages to quickly set up your store
              </p>
              <div className="nuvi-space-y-xs">
                {TEMPLATE_PRESETS
                  .filter(preset => !preset.compatibleThemes || preset.compatibleThemes.includes(currentTheme))
                  .map((preset) => (
                    <div key={preset.id} className="nuvi-p-xs nuvi-border nuvi-rounded nuvi-bg-muted/20">
                      <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-gap-xs">
                        <div className="nuvi-flex-1">
                          <h4 className="nuvi-text-xs nuvi-font-medium">{preset.name}</h4>
                          <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{preset.description}</p>
                        </div>
                        <button
                          onClick={() => handleApplyPreset(preset.id)}
                          disabled={applyingPreset === preset.id}
                          className="nuvi-px-xs nuvi-py-xs nuvi-text-xs nuvi-bg-primary nuvi-text-primary-foreground hover:nuvi-bg-primary/90 nuvi-rounded nuvi-transition-colors disabled:nuvi-opacity-50"
                        >
                          {applyingPreset === preset.id ? 'Applying...' : 'Apply'}
                        </button>
                      </div>
                    </div>
                  ))}
                {TEMPLATE_PRESETS
                  .filter(preset => !preset.compatibleThemes || preset.compatibleThemes.includes(currentTheme))
                  .length === 0 && (
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-text-center nuvi-py-sm">
                      No compatible presets available for this theme
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Render all categories as collapsible groups */}
        {Object.entries(themeSettings).map(([category, fields]) => {
          const Icon = categoryIcons[category] || Layout;
          const isExpanded = expandedGroups[category] !== false;
          
          return (
            <div key={category} className="nuvi-card">
              <button
                onClick={() => setExpandedGroups(prev => ({ ...prev, [category]: !prev[category] }))}
                className="nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm hover:nuvi-bg-muted/50 nuvi-transition-colors"
              >
                <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                  <Icon size={12} className="nuvi-text-muted" />
                  <span className="nuvi-text-xs nuvi-font-medium nuvi-text-secondary">
                    {categoryLabels[category] || category}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={12} className="nuvi-text-muted" />
                ) : (
                  <ChevronRight size={12} className="nuvi-text-muted" />
                )}
              </button>
              
              {isExpanded && (
                <div className="nuvi-card-content nuvi-p-xs nuvi-border-t">
                  <div className="nuvi-space-y-xs">
                    {category === 'colors' ? (
                      // Special layout for colors with scheme selector
                      <>
                        {/* Color scheme selector and preview */}
                        {fields.activeScheme && (
                          <>
                            {renderField(category, 'activeScheme', fields.activeScheme)}
                            <div className="nuvi-mt-sm nuvi-mb-sm nuvi-space-y-xs">
                              <p className="nuvi-text-xs nuvi-text-muted">Quick select a color scheme:</p>
                              <div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-xs">
                                {Object.entries(colorSchemes).map(([schemeKey, scheme]) => (
                                  <button
                                    key={schemeKey}
                                    onClick={() => handleSettingChange('colors', 'activeScheme', schemeKey)}
                                    className={cn(
                                      "nuvi-p-xs nuvi-border nuvi-rounded nuvi-transition-all",
                                      currentValues['colors.activeScheme'] === schemeKey
                                        ? "nuvi-border-primary nuvi-bg-primary/5"
                                        : "nuvi-border-border hover:nuvi-border-muted-foreground"
                                    )}
                                  >
                                    <div className="nuvi-text-xs nuvi-font-medium nuvi-mb-xs">{scheme.label}</div>
                                    <div className="nuvi-grid nuvi-grid-cols-4 nuvi-gap-xs">
                                      {Object.entries(scheme.colors).slice(0, 4).map(([colorKey, colorValue]) => (
                                        <div
                                          key={colorKey}
                                          className="nuvi-aspect-square nuvi-rounded-sm"
                                          style={{ 
                                            backgroundColor: colorValue,
                                            border: '1px solid rgba(0,0,0,0.1)'
                                          }}
                                          title={colorKey}
                                        />
                                      ))}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="nuvi-border-t nuvi-pt-sm nuvi-mb-sm" />
                          </>
                        )}
                        
                        {/* Regular color fields */}
                        {(() => {
                          const colorFields = Object.entries(fields).filter(([key]) => key !== 'activeScheme');
                          const rendered: JSX.Element[] = [];
                          let i = 0;

                          while (i < colorFields.length) {
                            const [key1, field1] = colorFields[i];
                            
                            if (i + 1 < colorFields.length) {
                              const [key2, field2] = colorFields[i + 1];
                              // Render two color pickers side by side
                              rendered.push(
                                <div key={`${key1}-${key2}`} className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-sm">
                                  <div>{renderField(category, key1, field1)}</div>
                                  <div>{renderField(category, key2, field2)}</div>
                                </div>
                              );
                              i += 2;
                            } else {
                              // Render single color picker
                              rendered.push(
                                <div key={key1}>{renderField(category, key1, field1)}</div>
                              );
                              i++;
                            }
                          }

                          return rendered;
                        })()}
                      </>
                    ) : category === 'buttons' ? (
                      // Special layout for buttons with nested groups
                      renderButtonGroups(fields, category)
                    ) : (
                      // Default layout for other categories with grid grouping
                      <>
                        {(() => {
                          const fieldsArray = Object.entries(fields);
                          const rendered: JSX.Element[] = [];
                          let i = 0;

                          while (i < fieldsArray.length) {
                            const [key1, field1] = fieldsArray[i];
                            
                            // Check if this field should take full width
                            if (isFullWidthField(field1)) {
                              rendered.push(
                                <div key={key1}>
                                  {renderField(category, key1, field1)}
                                  {field1.description && (
                                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{field1.description}</p>
                                  )}
                                </div>
                              );
                              i++;
                            } else if (isCompactField(field1) && i + 1 < fieldsArray.length) {
                              // Check if next field is also compact
                              const [key2, field2] = fieldsArray[i + 1];
                              if (isCompactField(field2)) {
                                // Render two fields side by side
                                rendered.push(
                                  <div key={`${key1}-${key2}`} className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-sm">
                                    <div>
                                      {renderField(category, key1, field1)}
                                      {field1.description && (
                                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{field1.description}</p>
                                      )}
                                    </div>
                                    <div>
                                      {renderField(category, key2, field2)}
                                      {field2.description && (
                                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{field2.description}</p>
                                      )}
                                    </div>
                                  </div>
                                );
                                i += 2;
                              } else {
                                // Render single field
                                rendered.push(
                                  <div key={key1}>
                                    {renderField(category, key1, field1)}
                                    {field1.description && (
                                      <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{field1.description}</p>
                                    )}
                                  </div>
                                );
                                i++;
                              }
                            } else {
                              // Render single field
                              rendered.push(
                                <div key={key1}>
                                  {renderField(category, key1, field1)}
                                  {field1.description && (
                                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">{field1.description}</p>
                                  )}
                                </div>
                              );
                              i++;
                            }
                          }

                          return rendered;
                        })()}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

ThemeInspector.displayName = 'ThemeInspector';