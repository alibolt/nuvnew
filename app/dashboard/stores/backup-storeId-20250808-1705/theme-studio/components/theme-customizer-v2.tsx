'use client';

// @refresh reset

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, Save, RotateCcw, Palette, 
  Type, Layout, Monitor, Zap, Play, Sparkles, Info, Smartphone, Tablet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSettings, defaultThemeSettings, generateCSSVariables } from '@/lib/theme-settings-schema';
import { themeSettingsConfig, ThemeFieldConfig, ThemeGroupConfig } from '@/lib/theme-settings-config';
import { toast } from 'sonner';

interface ThemeCustomizerV2Props {
  settings: ThemeSettings;
  onUpdate: (settings: ThemeSettings) => void;
  onSave?: () => void;
  storeId: string;
}

export function ThemeCustomizerV2({ settings, onUpdate, onSave, storeId }: ThemeCustomizerV2Props) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: false,
    typography: false,
    spacing: false,
    buttons: false,
    layout: false,
    animations: false,
    header: false,
    footer: false,
  });

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [localSettings, setLocalSettings] = useState(settings);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestSettingsRef = useRef(settings);

  // Update local settings when props change
  useEffect(() => {
    setLocalSettings(settings);
    latestSettingsRef.current = settings;
  }, [settings]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Get nested value from local settings object
  const getSettingValue = useCallback((key: string) => {
    const keys = key.split('.');
    let value: any = localSettings;
    for (const k of keys) {
      value = value?.[k];
    }
    return value;
  }, [localSettings]);

  // Set nested value in settings object with debounce
  const setSettingValue = useCallback((key: string, value: any) => {
    const keys = key.split('.');
    
    // Update local settings immediately for UI responsiveness
    setLocalSettings(prevSettings => {
      const newSettings = { ...prevSettings };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      
      // Update the ref with the latest settings
      latestSettingsRef.current = newSettings;
      
      return newSettings;
    });
    
    // Debounce the parent update to prevent excessive re-renders
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      // Use ref to get latest settings and avoid setState during render
      onUpdate(latestSettingsRef.current);
    }, 100); // 100ms debounce
  }, [onUpdate]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
      setLocalSettings(defaultThemeSettings);
      onUpdate(defaultThemeSettings);
      toast.success('Theme settings reset to defaults');
    }
  };

  // Professional input components matching section inspector style
  const ColorPicker = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="color"
              value={value}
              onChange={(e) => setSettingValue(field.key, e.target.value)}
              className="w-10 h-8 rounded-md border border-gray-200 cursor-pointer overflow-hidden"
            />
            <div 
              className="absolute inset-1 rounded-sm pointer-events-none border border-white/20"
              style={{ backgroundColor: value }}
            />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setSettingValue(field.key, e.target.value)}
            className="flex-1 px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all font-mono"
            placeholder="#000000"
          />
        </div>
      </div>
    );
  };

  const FontSelector = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <select
          value={value}
          onChange={(e) => setSettingValue(field.key, e.target.value)}
          className="w-full px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all appearance-none"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const SelectInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <select
          value={value}
          onChange={(e) => setSettingValue(field.key, e.target.value)}
          className="w-full px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all appearance-none"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const NumberInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={typeof value === 'string' ? parseFloat(value) : value}
            onChange={(e) => {
              const numValue = parseFloat(e.target.value);
              const finalValue = field.unit ? `${numValue}${field.unit}` : numValue;
              setSettingValue(field.key, finalValue);
            }}
            min={field.min}
            max={field.max}
            step={field.step || 0.1}
            className="flex-1 px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all"
          />
          {field.unit && (
            <span className="text-[11px] text-gray-500 font-medium">{field.unit}</span>
          )}
        </div>
      </div>
    );
  };

  const ToggleInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) ?? field.defaultValue;
    
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex-1">
          <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
            {field.label}
          </label>
          {field.description && (
            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{field.description}</p>
          )}
        </div>
        <button
          onClick={() => setSettingValue(field.key, !value)}
          className={cn(
            "w-9 h-5 rounded-full transition-colors relative ml-3",
            value ? "bg-[var(--nuvi-primary)]" : "bg-gray-300"
          )}
        >
          <div className={cn(
            "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
            value ? "translate-x-5" : "translate-x-1"
          )} />
        </button>
      </div>
    );
  };

  const SpacingInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => setSettingValue(field.key, e.target.value)}
          placeholder="1rem 2rem"
          className="w-full px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all font-mono"
        />
      </div>
    );
  };

  const TextInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
      if (inputRef.current && inputRef.current.value !== value) {
        inputRef.current.value = value;
      }
    }, [value]);
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <input
          ref={inputRef}
          key={`text-input-${field.key}`}
          type="text"
          defaultValue={value}
          onChange={(e) => setSettingValue(field.key, e.target.value)}
          placeholder={field.placeholder || ''}
          className="w-full px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all"
        />
      </div>
    );
  };

  const TextareaInput = ({ field }: { field: ThemeFieldConfig }) => {
    const value = getSettingValue(field.key) || field.defaultValue;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    useEffect(() => {
      if (textareaRef.current && textareaRef.current.value !== value) {
        textareaRef.current.value = value;
      }
    }, [value]);
    
    return (
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-gray-600 uppercase tracking-wider">
          {field.label}
        </label>
        {field.description && (
          <p className="text-[10px] text-gray-500 leading-tight">{field.description}</p>
        )}
        <textarea
          ref={textareaRef}
          key={`textarea-input-${field.key}`}
          defaultValue={value}
          onChange={(e) => setSettingValue(field.key, e.target.value)}
          placeholder={field.placeholder || ''}
          rows={3}
          className="w-full px-2 py-1.5 text-[13px] bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)] focus:border-[var(--nuvi-primary)] transition-all resize-none"
        />
      </div>
    );
  };

  const renderField = (field: ThemeFieldConfig) => {
    switch (field.type) {
      case 'color':
        return <ColorPicker key={field.key} field={field} />;
      case 'font':
        return <FontSelector key={field.key} field={field} />;
      case 'select':
        return <SelectInput key={field.key} field={field} />;
      case 'number':
        return <NumberInput key={field.key} field={field} />;
      case 'toggle':
        return <ToggleInput key={field.key} field={field} />;
      case 'spacing':
        return <SpacingInput key={field.key} field={field} />;
      case 'text':
        return <TextInput key={field.key} field={field} />;
      case 'textarea':
        return <TextareaInput key={field.key} field={field} />;
      default:
        return null;
    }
  };

  const GroupHeader = ({ group, fieldCount }: { group: string; fieldCount: number }) => (
    <div className="px-2 py-1.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600 uppercase tracking-wider flex items-center justify-between">
      <span>{group.replace(/([A-Z])/g, ' $1').trim()}</span>
      <span className="text-gray-400">{fieldCount}</span>
    </div>
  );

  const Section = ({ group }: { group: ThemeGroupConfig }) => {
    const Icon = group.icon;
    
    // Group fields by their group property
    const fieldGroups = group.fields.reduce((acc, field) => {
      const groupKey = field.group || 'general';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(field);
      return acc;
    }, {} as Record<string, ThemeFieldConfig[]>);

    return (
      <div className="border-b border-gray-100 last:border-b-0">
        <button
          onClick={() => toggleSection(group.key)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Icon className="h-4 w-4 text-[var(--nuvi-primary)]" />
            <div className="text-left">
              <div className="text-[13px] font-semibold text-gray-900">{group.label}</div>
              <div className="text-[11px] text-gray-500">{group.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium">
              {group.fields.length} settings
            </span>
            {expandedSections[group.key] ? 
              <ChevronDown className="h-4 w-4 text-gray-400" /> : 
              <ChevronRight className="h-4 w-4 text-gray-400" />
            }
          </div>
        </button>
        
        {expandedSections[group.key] && (
          <div className="px-4 pb-4 space-y-4">
            {Object.entries(fieldGroups).map(([groupKey, fields]) => (
              <div key={groupKey} className="space-y-3">
                {groupKey !== 'general' && (
                  <GroupHeader group={groupKey} fieldCount={fields.length} />
                )}
                <div className="space-y-3">
                  {fields.map((field) => renderField(field))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">


      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto">
        {themeSettingsConfig.map((group) => (
          <Section key={group.key} group={group} />
        ))}
      </div>

      {/* Footer with info */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Info className="h-3 w-3" />
          <span>Changes are applied immediately • Save to persist</span>
        </div>
      </div>
    </div>
  );
}