'use client';

import { useState } from 'react';
import { 
  Palette, Type, Layout, Sparkles, ChevronDown, ChevronRight,
  Monitor, Zap, Globe, Save, RotateCcw, Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSettings, defaultThemeSettings } from '@/lib/theme-settings-schema';
import { toast } from 'sonner';

interface ThemeCustomizerProps {
  settings: ThemeSettings;
  onUpdate: (settings: ThemeSettings) => void;
  onSave?: () => void;
  storeId: string;
}

export function ThemeCustomizer({ settings, onUpdate, onSave, storeId }: ThemeCustomizerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    colors: true,
    typography: false,
    spacing: false,
    buttons: false,
    layout: false,
    animations: false,
    header: false,
    footer: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Color picker component
  const ColorPicker = ({ label, value, onChange }: any) => (
    <div className="flex items-center justify-between py-2">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-gray-200 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded"
        />
      </div>
    </div>
  );

  // Font selector component
  const FontSelector = ({ label, value, onChange }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)]"
      >
        <option value="'Inter', sans-serif">Inter</option>
        <option value="'Playfair Display', serif">Playfair Display</option>
        <option value="'Montserrat', sans-serif">Montserrat</option>
        <option value="'Roboto', sans-serif">Roboto</option>
        <option value="'Open Sans', sans-serif">Open Sans</option>
        <option value="'Lato', sans-serif">Lato</option>
        <option value="'Raleway', sans-serif">Raleway</option>
        <option value="'Poppins', sans-serif">Poppins</option>
        <option value="'Source Serif Pro', serif">Source Serif Pro</option>
        <option value="'Crimson Text', serif">Crimson Text</option>
        <option value="'Nunito', sans-serif">Nunito</option>
        <option value="'Work Sans', sans-serif">Work Sans</option>
      </select>
    </div>
  );

  // Size input component
  const SizeInput = ({ label, value, onChange, unit = 'px' }: any) => (
    <div className="flex items-center justify-between py-2">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={parseInt(value) || 0}
          onChange={(e) => onChange(`${e.target.value}${unit}`)}
          className="w-16 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)]"
        />
        <span className="text-xs text-gray-500">{unit}</span>
      </div>
    </div>
  );

  // Section wrapper component
  const Section = ({ title, icon: Icon, sectionKey, children }: any) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--nuvi-primary)]" />
          <span className="text-sm font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections[sectionKey] ? 
          <ChevronDown className="h-4 w-4 text-gray-400" /> : 
          <ChevronRight className="h-4 w-4 text-gray-400" />
        }
      </button>
      {expandedSections[sectionKey] && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all theme settings to defaults?')) {
      onUpdate(defaultThemeSettings);
      toast.success('Theme settings reset to defaults');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--nuvi-primary)]" />
            <h2 className="text-sm font-semibold text-gray-900">Theme Customizer</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            {onSave && (
              <button
                onClick={onSave}
                className="flex items-center gap-1 px-3 py-1.5 bg-[var(--nuvi-primary)] text-white text-xs font-medium rounded hover:bg-[var(--nuvi-primary-hover)] transition-colors"
              >
                <Save className="h-3 w-3" />
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Colors Section */}
        <Section title="Colors" icon={Palette} sectionKey="colors">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Brand Colors</h4>
              <div className="space-y-1">
                <ColorPicker
                  label="Primary"
                  value={settings.colors.primary}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, primary: value }
                  })}
                />
                <ColorPicker
                  label="Secondary"
                  value={settings.colors.secondary}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, secondary: value }
                  })}
                />
                <ColorPicker
                  label="Accent"
                  value={settings.colors.accent}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, accent: value }
                  })}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Base Colors</h4>
              <div className="space-y-1">
                <ColorPicker
                  label="Background"
                  value={settings.colors.background}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, background: value }
                  })}
                />
                <ColorPicker
                  label="Surface"
                  value={settings.colors.surface}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, surface: value }
                  })}
                />
                <ColorPicker
                  label="Border"
                  value={settings.colors.border}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, border: value }
                  })}
                />
                <ColorPicker
                  label="Border Light"
                  value={settings.colors.borderLight}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, borderLight: value }
                  })}
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Text Colors</h4>
              <div className="space-y-1">
                <ColorPicker
                  label="Primary Text"
                  value={settings.colors.text}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, text: value }
                  })}
                />
                <ColorPicker
                  label="Muted Text"
                  value={settings.colors.textMuted}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, textMuted: value }
                  })}
                />
                <ColorPicker
                  label="Light Text"
                  value={settings.colors.textLight}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, textLight: value }
                  })}
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Status Colors</h4>
              <div className="grid grid-cols-2 gap-1">
                <ColorPicker
                  label="Success"
                  value={settings.colors.success}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, success: value }
                  })}
                />
                <ColorPicker
                  label="Error"
                  value={settings.colors.error}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, error: value }
                  })}
                />
                <ColorPicker
                  label="Warning"
                  value={settings.colors.warning}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, warning: value }
                  })}
                />
                <ColorPicker
                  label="Info"
                  value={settings.colors.info}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    colors: { ...settings.colors, info: value }
                  })}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Typography Section */}
        <Section title="Typography" icon={Type} sectionKey="typography">
          <div className="space-y-3">
            <FontSelector
              label="Heading Font"
              value={settings.typography.headingFont}
              onChange={(value: string) => onUpdate({
                ...settings,
                typography: { ...settings.typography, headingFont: value }
              })}
            />
            <FontSelector
              label="Body Font"
              value={settings.typography.bodyFont}
              onChange={(value: string) => onUpdate({
                ...settings,
                typography: { ...settings.typography, bodyFont: value }
              })}
            />
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Font Sizes</h4>
              <div className="grid grid-cols-2 gap-2">
                <SizeInput
                  label="Small"
                  value={settings.typography.fontSize.sm}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontSize: { ...settings.typography.fontSize, sm: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Base"
                  value={settings.typography.fontSize.base}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontSize: { ...settings.typography.fontSize, base: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Large"
                  value={settings.typography.fontSize.lg}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontSize: { ...settings.typography.fontSize, lg: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="2XL"
                  value={settings.typography.fontSize['2xl']}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontSize: { ...settings.typography.fontSize, '2xl': value }
                    }
                  })}
                  unit="rem"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Font Weights</h4>
              <div className="grid grid-cols-2 gap-2">
                <SizeInput
                  label="Normal"
                  value={parseInt(settings.typography.fontWeight.normal)}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontWeight: { ...settings.typography.fontWeight, normal: value }
                    }
                  })}
                  unit=""
                />
                <SizeInput
                  label="Bold"
                  value={parseInt(settings.typography.fontWeight.bold)}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    typography: {
                      ...settings.typography,
                      fontWeight: { ...settings.typography.fontWeight, bold: value }
                    }
                  })}
                  unit=""
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Spacing Section */}
        <Section title="Spacing" icon={Layout} sectionKey="spacing">
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Section Padding</h4>
              <div className="grid grid-cols-3 gap-2">
                <SizeInput
                  label="Mobile"
                  value={settings.spacing.sectionPadding.mobile}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      sectionPadding: { ...settings.spacing.sectionPadding, mobile: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Tablet"
                  value={settings.spacing.sectionPadding.tablet}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      sectionPadding: { ...settings.spacing.sectionPadding, tablet: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Desktop"
                  value={settings.spacing.sectionPadding.desktop}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      sectionPadding: { ...settings.spacing.sectionPadding, desktop: value }
                    }
                  })}
                  unit="rem"
                />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Container</h4>
              <div className="space-y-1">
                <SizeInput
                  label="Max Width"
                  value={settings.spacing.container.maxWidth}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      container: { ...settings.spacing.container, maxWidth: value }
                    }
                  })}
                />
                <SizeInput
                  label="Padding"
                  value={settings.spacing.container.padding}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      container: { ...settings.spacing.container, padding: value }
                    }
                  })}
                  unit="rem"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Component Gaps</h4>
              <div className="grid grid-cols-3 gap-2">
                <SizeInput
                  label="Small"
                  value={settings.spacing.componentGap.sm}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      componentGap: { ...settings.spacing.componentGap, sm: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Medium"
                  value={settings.spacing.componentGap.md}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      componentGap: { ...settings.spacing.componentGap, md: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Large"
                  value={settings.spacing.componentGap.lg}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    spacing: {
                      ...settings.spacing,
                      componentGap: { ...settings.spacing.componentGap, lg: value }
                    }
                  })}
                  unit="rem"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Buttons Section */}
        <Section title="Buttons" icon={Zap} sectionKey="buttons">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Button Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['square', 'rounded', 'pill'].map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdate({
                      ...settings,
                      buttons: { ...settings.buttons, style: style as any }
                    })}
                    className={cn(
                      "py-2 text-xs font-medium border transition-all",
                      settings.buttons.style === style
                        ? "bg-[var(--nuvi-primary)] text-white border-[var(--nuvi-primary)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300",
                      style === 'rounded' && "rounded-md",
                      style === 'pill' && "rounded-full"
                    )}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Hover Effect</label>
              <select
                value={settings.buttons.hoverEffect}
                onChange={(e) => onUpdate({
                  ...settings,
                  buttons: { ...settings.buttons, hoverEffect: e.target.value as any }
                })}
                className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)]"
              >
                <option value="none">None</option>
                <option value="lighten">Lighten</option>
                <option value="darken">Darken</option>
                <option value="shadow">Shadow</option>
              </select>
            </div>
          </div>
        </Section>

        {/* Layout Section */}
        <Section title="Layout" icon={Monitor} sectionKey="layout">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Layout Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['full-width', 'boxed'].map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdate({
                      ...settings,
                      layout: { ...settings.layout, type: type as any }
                    })}
                    className={cn(
                      "py-2 text-xs font-medium border rounded transition-all",
                      settings.layout.type === type
                        ? "bg-[var(--nuvi-primary)] text-white border-[var(--nuvi-primary)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {type === 'full-width' ? 'Full Width' : 'Boxed'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Border Radius</h4>
              <div className="grid grid-cols-2 gap-2">
                <SizeInput
                  label="Small"
                  value={settings.layout.borderRadius.sm}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    layout: {
                      ...settings.layout,
                      borderRadius: { ...settings.layout.borderRadius, sm: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Medium"
                  value={settings.layout.borderRadius.md}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    layout: {
                      ...settings.layout,
                      borderRadius: { ...settings.layout.borderRadius, md: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Large"
                  value={settings.layout.borderRadius.lg}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    layout: {
                      ...settings.layout,
                      borderRadius: { ...settings.layout.borderRadius, lg: value }
                    }
                  })}
                  unit="rem"
                />
                <SizeInput
                  label="Extra Large"
                  value={settings.layout.borderRadius.xl}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    layout: {
                      ...settings.layout,
                      borderRadius: { ...settings.layout.borderRadius, xl: value }
                    }
                  })}
                  unit="rem"
                />
              </div>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Shadow Presets</h4>
              <div className="space-y-1">
                {['none', 'sm', 'md', 'lg', 'xl'].map((shadow) => (
                  <div key={shadow} className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-600 capitalize">{shadow}</span>
                    <div 
                      className="w-8 h-4 bg-white border rounded"
                      style={{ boxShadow: settings.layout.shadows[shadow as keyof typeof settings.layout.shadows] }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
        
        {/* Animations Section */}
        <Section title="Animations" icon={Play} sectionKey="animations">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Section Animation</label>
              <select
                value={settings.animations.sectionAnimation}
                onChange={(e) => onUpdate({
                  ...settings,
                  animations: { ...settings.animations, sectionAnimation: e.target.value as any }
                })}
                className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[var(--nuvi-primary)]"
              >
                <option value="none">None</option>
                <option value="fade">Fade In</option>
                <option value="slide-up">Slide Up</option>
                <option value="slide-left">Slide Left</option>
                <option value="zoom">Zoom In</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Animation Speed</label>
              <div className="grid grid-cols-3 gap-2">
                {['fast', 'normal', 'slow'].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onUpdate({
                      ...settings,
                      animations: { ...settings.animations, duration: speed as any }
                    })}
                    className={cn(
                      "py-2 text-xs font-medium border rounded transition-all capitalize",
                      settings.animations.duration === speed
                        ? "bg-[var(--nuvi-primary)] text-white border-[var(--nuvi-primary)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            
            <SizeInput
              label="Transition Duration"
              value={parseInt(settings.animations.transitionDuration)}
              onChange={(value: string) => onUpdate({
                ...settings,
                animations: { ...settings.animations, transitionDuration: value }
              })}
              unit="ms"
            />
          </div>
        </Section>
        
        {/* Header Section */}
        <Section title="Header" icon={Layout} sectionKey="header">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Header Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['transparent', 'solid', 'border'].map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdate({
                      ...settings,
                      header: { ...settings.header, style: style as any }
                    })}
                    className={cn(
                      "py-2 text-xs font-medium border rounded transition-all capitalize",
                      settings.header.style === style
                        ? "bg-[var(--nuvi-primary)] text-white border-[var(--nuvi-primary)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium text-gray-700">Sticky Header</label>
              <button
                onClick={() => onUpdate({
                  ...settings,
                  header: { ...settings.header, sticky: !settings.header.sticky }
                })}
                className={cn(
                  "w-9 h-5 rounded-full transition-colors relative",
                  settings.header.sticky ? "bg-[var(--nuvi-primary)]" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform",
                  settings.header.sticky ? "translate-x-5" : "translate-x-1"
                )} />
              </button>
            </div>
            
            <div>
              <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Header Height</h4>
              <div className="grid grid-cols-2 gap-2">
                <SizeInput
                  label="Mobile"
                  value={settings.header.height.mobile}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    header: {
                      ...settings.header,
                      height: { ...settings.header.height, mobile: value }
                    }
                  })}
                  unit="px"
                />
                <SizeInput
                  label="Desktop"
                  value={settings.header.height.desktop}
                  onChange={(value: string) => onUpdate({
                    ...settings,
                    header: {
                      ...settings.header,
                      height: { ...settings.header.height, desktop: value }
                    }
                  })}
                  unit="px"
                />
              </div>
            </div>
          </div>
        </Section>
        
        {/* Footer Section */}
        <Section title="Footer" icon={Layout} sectionKey="footer">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Footer Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['minimal', 'columns', 'centered'].map((style) => (
                  <button
                    key={style}
                    onClick={() => onUpdate({
                      ...settings,
                      footer: { ...settings.footer, style: style as any }
                    })}
                    className={cn(
                      "py-2 text-xs font-medium border rounded transition-all capitalize",
                      settings.footer.style === style
                        ? "bg-[var(--nuvi-primary)] text-white border-[var(--nuvi-primary)]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <ColorPicker
                label="Background Color"
                value={settings.footer.backgroundColor}
                onChange={(value: string) => onUpdate({
                  ...settings,
                  footer: { ...settings.footer, backgroundColor: value }
                })}
              />
              <ColorPicker
                label="Text Color"
                value={settings.footer.textColor}
                onChange={(value: string) => onUpdate({
                  ...settings,
                  footer: { ...settings.footer, textColor: value }
                })}
              />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}