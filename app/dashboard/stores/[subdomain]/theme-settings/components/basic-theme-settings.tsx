'use client';

import { ThemeSettings } from '@/lib/theme-settings-schema';
import { Palette, Type, Layout, Smartphone, Monitor, Tablet } from 'lucide-react';

interface BasicThemeSettingsProps {
  settings: ThemeSettings;
  onChange: (settings: ThemeSettings) => void;
}

export function BasicThemeSettings({ settings, onChange }: BasicThemeSettingsProps) {
  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    onChange(newSettings);
  };

  return (
    <div className="space-y-8">
      {/* Colors Section */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Colors</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.colors?.primary || '#000000'}
                onChange={(e) => updateSetting('colors.primary', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={settings.colors?.primary || '#000000'}
                onChange={(e) => updateSetting('colors.primary', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="#000000"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.colors?.secondary || '#666666'}
                onChange={(e) => updateSetting('colors.secondary', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={settings.colors?.secondary || '#666666'}
                onChange={(e) => updateSetting('colors.secondary', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="#666666"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.colors?.accent || '#0066cc'}
                onChange={(e) => updateSetting('colors.accent', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={settings.colors?.accent || '#0066cc'}
                onChange={(e) => updateSetting('colors.accent', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="#0066cc"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.colors?.background || '#ffffff'}
                onChange={(e) => updateSetting('colors.background', e.target.value)}
                className="h-10 w-20 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={settings.colors?.background || '#ffffff'}
                onChange={(e) => updateSetting('colors.background', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Type className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Typography</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Heading Font</label>
            <select
              value={settings.typography?.headingFont || 'Inter'}
              onChange={(e) => updateSetting('typography.headingFont', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Inter">Inter</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
              <option value="Raleway">Raleway</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Body Font</label>
            <select
              value={settings.typography?.bodyFont || 'Inter'}
              onChange={(e) => updateSetting('typography.bodyFont', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Source Sans Pro">Source Sans Pro</option>
              <option value="Nunito">Nunito</option>
              <option value="Work Sans">Work Sans</option>
              <option value="IBM Plex Sans">IBM Plex Sans</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Base Font Size</label>
            <select
              value={settings.typography?.baseFontSize || '16px'}
              onChange={(e) => updateSetting('typography.baseFontSize', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="14px">14px - Small</option>
              <option value="16px">16px - Medium (Default)</option>
              <option value="18px">18px - Large</option>
              <option value="20px">20px - Extra Large</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Heading Scale</label>
            <select
              value={settings.typography?.headingScale || '1.25'}
              onChange={(e) => updateSetting('typography.headingScale', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="1.2">1.2 - Minor Third</option>
              <option value="1.25">1.25 - Major Third</option>
              <option value="1.333">1.333 - Perfect Fourth</option>
              <option value="1.414">1.414 - Augmented Fourth</option>
              <option value="1.5">1.5 - Perfect Fifth</option>
            </select>
          </div>
        </div>
      </section>

      {/* Layout Section */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Layout className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Layout</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Container Width</label>
            <select
              value={settings.layout?.containerWidth || '1280px'}
              onChange={(e) => updateSetting('layout.containerWidth', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="1024px">1024px - Compact</option>
              <option value="1280px">1280px - Standard</option>
              <option value="1440px">1440px - Wide</option>
              <option value="1600px">1600px - Extra Wide</option>
              <option value="100%">Full Width</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Content Spacing</label>
            <select
              value={settings.layout?.spacing || 'normal'}
              onChange={(e) => updateSetting('layout.spacing', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="compact">Compact</option>
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
              <option value="loose">Loose</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Corner Radius</label>
            <select
              value={settings.layout?.borderRadius || '8px'}
              onChange={(e) => updateSetting('layout.borderRadius', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="0px">0px - Sharp</option>
              <option value="4px">4px - Subtle</option>
              <option value="8px">8px - Medium</option>
              <option value="12px">12px - Rounded</option>
              <option value="16px">16px - Extra Rounded</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Button Style</label>
            <select
              value={settings.layout?.buttonStyle || 'solid'}
              onChange={(e) => updateSetting('layout.buttonStyle', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="solid">Solid</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
              <option value="gradient">Gradient</option>
            </select>
          </div>
        </div>
      </section>

      {/* Mobile Settings */}
      <section className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Smartphone className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Mobile Settings</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Menu Style</label>
            <select
              value={settings.mobile?.menuStyle || 'slide'}
              onChange={(e) => updateSetting('mobile.menuStyle', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="slide">Slide from Side</option>
              <option value="fullscreen">Fullscreen Overlay</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Mobile Breakpoint</label>
            <select
              value={settings.mobile?.breakpoint || '768px'}
              onChange={(e) => updateSetting('mobile.breakpoint', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="640px">640px - Small</option>
              <option value="768px">768px - Medium</option>
              <option value="1024px">1024px - Large</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}