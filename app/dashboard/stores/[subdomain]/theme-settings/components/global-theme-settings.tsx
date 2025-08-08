'use client';

import { useState, useEffect } from 'react';
import { 
  Palette, Type, Layout, Sparkles, ChevronRight,
  Monitor, Smartphone, Eye, Copy, Check, Sliders,
  Sun, Moon, Zap, MousePointer, Grid, Package,
  Settings2, Wand2, Gauge, Shield, PaintBucket,
  Pipette, Blend, Contrast, Droplets, AlignLeft,
  Bold, Italic, Underline, Link2, Heading1, Text,
  BarChart3, Activity, Timer, Play, Pause, RefreshCw,
  Save, Undo, Redo, History, Download, Upload,
  Info, HelpCircle, X, ArrowRight, Lightbulb,
  Blocks, Layers, Database, Code2, Brush,
  CircleDot, Square, Triangle, Pentagon, Hexagon,
  Coffee, Rocket, Crown, Star, Heart, Flag,
  Search, Filter, ChevronDown, MoreVertical,
  ExternalLink, Lock, Unlock, AlertTriangle,
  CheckCircle2, XCircle, AlertCircle, Tablet, Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeSettings } from '@/lib/theme-settings-schema';
import { Switch } from '@/components/ui/switch';

interface GlobalThemeSettingsProps {
  settings: ThemeSettings;
  onUpdate: (settings: ThemeSettings) => void;
}

export function GlobalThemeSettings({ settings, onUpdate }: GlobalThemeSettingsProps) {
  const [activeCategory, setActiveCategory] = useState<string>('brand');
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [colorPickerMode, setColorPickerMode] = useState<'picker' | 'palette' | 'gradient'>('picker');
  const [selectedFont, setSelectedFont] = useState<'heading' | 'body'>('heading');

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
    onUpdate(newSettings);
    setHasUnsavedChanges(true);
  };

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  // Settings Categories
  const categories = [
    {
      id: 'brand',
      label: 'Brand Identity',
      icon: Crown,
      description: 'Logo, colors, and brand elements',
      color: 'purple'
    },
    {
      id: 'typography',
      label: 'Typography',
      icon: Type,
      description: 'Fonts and text styling',
      color: 'blue'
    },
    {
      id: 'layout',
      label: 'Layout & Spacing',
      icon: Grid,
      description: 'Grid, containers, and spacing',
      color: 'green'
    },
    {
      id: 'components',
      label: 'Components',
      icon: Blocks,
      description: 'Buttons, cards, and UI elements',
      color: 'orange'
    },
    {
      id: 'effects',
      label: 'Effects & Motion',
      icon: Sparkles,
      description: 'Animations and transitions',
      color: 'pink'
    },
    {
      id: 'advanced',
      label: 'Advanced',
      icon: Code2,
      description: 'Custom code and overrides',
      color: 'gray'
    }
  ];

  // Color Palettes
  const colorPalettes = [
    {
      name: 'Monochrome',
      colors: ['#000000', '#3D3D3D', '#666666', '#999999', '#CCCCCC', '#FFFFFF']
    },
    {
      name: 'Ocean Blue',
      colors: ['#001F3F', '#003D7A', '#0066CC', '#3399FF', '#66B2FF', '#CCE5FF']
    },
    {
      name: 'Forest Green', 
      colors: ['#0D2818', '#1A4D35', '#2D7A57', '#52B788', '#95D5B2', '#D8F3DC']
    },
    {
      name: 'Sunset',
      colors: ['#7C2D12', '#C2410C', '#EA580C', '#FB923C', '#FED7AA', '#FFF7ED']
    },
    {
      name: 'Royal Purple',
      colors: ['#3B0764', '#581C87', '#7C3AED', '#A78BFA', '#DDD6FE', '#F3E8FF']
    },
    {
      name: 'Cherry Blossom',
      colors: ['#831843', '#BE185D', '#EC4899', '#F9A8D4', '#FCE7F3', '#FDF2F8']
    }
  ];

  // Font Library
  const fontLibrary = [
    { 
      category: 'Sans Serif',
      fonts: [
        { name: 'Inter', weights: [300, 400, 500, 600, 700, 800, 900] },
        { name: 'Helvetica', weights: [300, 400, 700] },
        { name: 'Arial', weights: [400, 700] },
        { name: 'Roboto', weights: [300, 400, 500, 700, 900] },
        { name: 'Open Sans', weights: [300, 400, 600, 700, 800] },
        { name: 'Montserrat', weights: [300, 400, 500, 600, 700, 800, 900] }
      ]
    },
    {
      category: 'Serif',
      fonts: [
        { name: 'Playfair Display', weights: [400, 700, 900] },
        { name: 'Merriweather', weights: [300, 400, 700, 900] },
        { name: 'Georgia', weights: [400, 700] },
        { name: 'Times New Roman', weights: [400, 700] },
        { name: 'Crimson Pro', weights: [300, 400, 600, 700] },
        { name: 'Lora', weights: [400, 500, 600, 700] }
      ]
    },
    {
      category: 'Display',
      fonts: [
        { name: 'Bebas Neue', weights: [400] },
        { name: 'Oswald', weights: [300, 400, 500, 600, 700] },
        { name: 'Anton', weights: [400] },
        { name: 'Fredoka', weights: [300, 400, 500, 600, 700] },
        { name: 'Righteous', weights: [400] }
      ]
    },
    {
      category: 'Monospace',
      fonts: [
        { name: 'Fira Code', weights: [300, 400, 500, 600, 700] },
        { name: 'IBM Plex Mono', weights: [300, 400, 500, 600, 700] },
        { name: 'Courier New', weights: [400, 700] },
        { name: 'Monaco', weights: [400] },
        { name: 'Space Mono', weights: [400, 700] }
      ]
    }
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const colorClasses = {
                purple: 'bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300',
                blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:border-blue-300',
                green: 'bg-green-50 text-green-600 border-green-200 hover:border-green-300',
                orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:border-orange-300',
                pink: 'bg-pink-50 text-pink-600 border-pink-200 hover:border-pink-300',
                gray: 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              };
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 text-left transition-all group',
                    activeCategory === category.id
                      ? colorClasses[category.color as keyof typeof colorClasses]
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      activeCategory === category.id
                        ? 'bg-white/50'
                        : 'bg-gray-50 group-hover:bg-gray-100'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{category.label}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                    </div>
                    <ChevronRight className={cn(
                      'h-5 w-5 transition-transform',
                      activeCategory === category.id && 'rotate-90'
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t space-y-2">
          <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
            <Upload className="h-4 w-4" />
            Import Settings
          </button>
          <button className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2">
            <Download className="h-4 w-4" />
            Export Settings
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content Header */}
        <div className="bg-white border-b px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {categories.find(c => c.id === activeCategory)?.label}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {categories.find(c => c.id === activeCategory)?.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <History className="h-4 w-4" />
                View History
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset Section
              </button>
              <button
                className={cn(
                  'px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2',
                  hasUnsavedChanges
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
                disabled={!hasUnsavedChanges}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Brand Identity */}
            {activeCategory === 'brand' && (
              <div className="space-y-8 max-w-5xl">
                {/* Logo Section */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Logo</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Logo Guidelines
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Primary Logo</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (max. 2MB)</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">Click to upload</p>
                        <p className="text-xs text-gray-500 mt-1">32x32px recommended</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color System */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Color System</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setColorPickerMode('picker')}
                        className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          colorPickerMode === 'picker'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        Picker
                      </button>
                      <button
                        onClick={() => setColorPickerMode('palette')}
                        className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          colorPickerMode === 'palette'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        Palettes
                      </button>
                      <button
                        onClick={() => setColorPickerMode('gradient')}
                        className={cn(
                          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          colorPickerMode === 'gradient'
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        Gradients
                      </button>
                    </div>
                  </div>

                  {colorPickerMode === 'picker' && (
                    <div className="space-y-6">
                      {/* Primary Colors */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Primary Colors</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {['primary', 'secondary', 'accent'].map((color) => (
                            <div key={color}>
                              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {color}
                              </label>
                              <div className="mt-2 relative group">
                                <input
                                  type="color"
                                  value={settings.colors[color as keyof typeof settings.colors] || '#000000'}
                                  onChange={(e) => updateSetting(`colors.${color}`, e.target.value)}
                                  className="w-full h-32 rounded-lg cursor-pointer"
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-white border-t p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-mono">
                                      {settings.colors[color as keyof typeof settings.colors] || '#000000'}
                                    </span>
                                    <button
                                      onClick={() => copyColor(settings.colors[color as keyof typeof settings.colors] || '#000000')}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      {copiedColor === settings.colors[color as keyof typeof settings.colors] ? (
                                        <Check className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <Copy className="h-3 w-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Neutral Colors */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Neutral Colors</h4>
                        <div className="flex gap-2">
                          {['#000000', '#1F2937', '#6B7280', '#D1D5DB', '#F3F4F6', '#FFFFFF'].map((color, index) => (
                            <button
                              key={index}
                              onClick={() => updateSetting('colors.neutral', color)}
                              className="group relative"
                            >
                              <div
                                className="w-16 h-16 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                                style={{ backgroundColor: color }}
                              />
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {color}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {colorPickerMode === 'palette' && (
                    <div className="grid grid-cols-2 gap-4">
                      {colorPalettes.map((palette) => (
                        <button
                          key={palette.name}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left"
                        >
                          <h4 className="text-sm font-medium text-gray-900 mb-3">{palette.name}</h4>
                          <div className="flex gap-1">
                            {palette.colors.map((color, index) => (
                              <div
                                key={index}
                                className="h-12 flex-1 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {colorPickerMode === 'gradient' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { name: 'Sunset', gradient: 'linear-gradient(to right, #FF512F, #DD2476)' },
                          { name: 'Ocean', gradient: 'linear-gradient(to right, #2E3192, #1BFFFF)' },
                          { name: 'Forest', gradient: 'linear-gradient(to right, #11998E, #38EF7D)' },
                          { name: 'Berry', gradient: 'linear-gradient(to right, #4776E6, #8E54E9)' },
                          { name: 'Warm', gradient: 'linear-gradient(to right, #F7971E, #FFD200)' },
                          { name: 'Cool', gradient: 'linear-gradient(to right, #00C9FF, #92FE9D)' }
                        ].map((gradient) => (
                          <button
                            key={gradient.name}
                            className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                          >
                            <div
                              className="h-24 rounded-lg mb-3"
                              style={{ background: gradient.gradient }}
                            />
                            <p className="text-sm font-medium text-gray-900">{gradient.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Typography */}
            {activeCategory === 'typography' && (
              <div className="space-y-8 max-w-5xl">
                {/* Font Selection */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Font Selection</h3>
                  
                  {/* Font Type Selector */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setSelectedFont('heading')}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        selectedFont === 'heading'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      Headings
                    </button>
                    <button
                      onClick={() => setSelectedFont('body')}
                      className={cn(
                        'px-4 py-2 rounded-lg font-medium transition-colors',
                        selectedFont === 'body'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      Body Text
                    </button>
                  </div>

                  {/* Font Library */}
                  <div className="space-y-6">
                    {fontLibrary.map((category) => (
                      <div key={category.category}>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                          {category.category}
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {category.fonts.map((font) => (
                            <button
                              key={font.name}
                              onClick={() => updateSetting(`typography.${selectedFont === 'heading' ? 'headingFont' : 'bodyFont'}`, font.name)}
                              className={cn(
                                'p-4 border-2 rounded-lg text-left transition-all',
                                (selectedFont === 'heading' ? settings.typography?.headingFont : settings.typography?.bodyFont) === font.name
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                            >
                              <p
                                className="text-lg mb-1"
                                style={{ fontFamily: font.name }}
                              >
                                {font.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {font.weights.length} weights available
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Scale */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Type Scale</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Display', size: 72, weight: 700, lineHeight: 1.1 },
                      { label: 'H1', size: 48, weight: 700, lineHeight: 1.2 },
                      { label: 'H2', size: 36, weight: 600, lineHeight: 1.3 },
                      { label: 'H3', size: 28, weight: 600, lineHeight: 1.4 },
                      { label: 'H4', size: 24, weight: 500, lineHeight: 1.4 },
                      { label: 'H5', size: 20, weight: 500, lineHeight: 1.5 },
                      { label: 'H6', size: 18, weight: 500, lineHeight: 1.5 },
                      { label: 'Body Large', size: 18, weight: 400, lineHeight: 1.6 },
                      { label: 'Body', size: 16, weight: 400, lineHeight: 1.6 },
                      { label: 'Body Small', size: 14, weight: 400, lineHeight: 1.5 },
                      { label: 'Caption', size: 12, weight: 400, lineHeight: 1.5 }
                    ].map((type) => (
                      <div
                        key={type.label}
                        className="flex items-center gap-6 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="w-20">
                          <p className="text-sm font-medium text-gray-500">{type.label}</p>
                        </div>
                        <div className="flex-1">
                          <p
                            style={{
                              fontSize: `${type.size}px`,
                              fontWeight: type.weight,
                              lineHeight: type.lineHeight,
                              fontFamily: type.label.includes('Body') || type.label === 'Caption'
                                ? settings.typography?.bodyFont
                                : settings.typography?.headingFont
                            }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{type.size}px</span>
                          <span>·</span>
                          <span>{type.weight}</span>
                          <span>·</span>
                          <span>{type.lineHeight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Layout & Spacing */}
            {activeCategory === 'layout' && (
              <div className="space-y-8 max-w-5xl">
                {/* Grid System */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Grid System</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Container Width</label>
                      <div className="mt-3 flex items-center gap-4">
                        <input
                          type="range"
                          min="960"
                          max="1920"
                          step="20"
                          value={parseInt(settings.spacing?.container?.maxWidth?.replace('px', '') || '1280')}
                          onChange={(e) => updateSetting('spacing.container.maxWidth', `${e.target.value}px`)}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={parseInt(settings.spacing?.container?.maxWidth?.replace('px', '') || '1280')}
                            onChange={(e) => updateSetting('spacing.container.maxWidth', `${e.target.value}px`)}
                            className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          />
                          <span className="text-sm text-gray-500">px</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Column Gap</label>
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {[0, 4, 8, 16, 24, 32].map((gap) => (
                          <button
                            key={gap}
                            onClick={() => updateSetting('spacing.componentGap.md', `${gap / 16}rem`)}
                            className={cn(
                              'p-3 rounded-lg border-2 text-sm font-medium transition-all',
                              parseInt(settings.spacing?.componentGap?.md?.replace('rem', '') || '2') * 16 === gap
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            {gap}px
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spacing Scale */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Spacing Scale</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'XS', value: 4 },
                      { name: 'SM', value: 8 },
                      { name: 'MD', value: 16 },
                      { name: 'LG', value: 24 },
                      { name: 'XL', value: 32 },
                      { name: '2XL', value: 48 },
                      { name: '3XL', value: 64 },
                      { name: '4XL', value: 96 }
                    ].map((space) => (
                      <div
                        key={space.name}
                        className="p-4 border border-gray-200 rounded-lg text-center"
                      >
                        <div
                          className="w-full bg-blue-500 rounded mb-3"
                          style={{ height: `${space.value}px` }}
                        />
                        <p className="text-sm font-medium text-gray-900">{space.name}</p>
                        <p className="text-xs text-gray-500">{space.value}px</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakpoints */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Responsive Breakpoints</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Mobile', icon: Smartphone, value: 640, color: 'blue' },
                      { name: 'Tablet', icon: Tablet, value: 768, color: 'green' },
                      { name: 'Desktop', icon: Monitor, value: 1024, color: 'purple' },
                      { name: 'Wide', icon: Maximize2, value: 1280, color: 'orange' }
                    ].map((breakpoint) => {
                      const Icon = breakpoint.icon;
                      return (
                        <div
                          key={breakpoint.name}
                          className="flex items-center gap-4 p-4 rounded-lg border border-gray-200"
                        >
                          <div className={cn(
                            'p-2 rounded-lg',
                            breakpoint.color === 'blue' && 'bg-blue-100 text-blue-600',
                            breakpoint.color === 'green' && 'bg-green-100 text-green-600',
                            breakpoint.color === 'purple' && 'bg-purple-100 text-purple-600',
                            breakpoint.color === 'orange' && 'bg-orange-100 text-orange-600'
                          )}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{breakpoint.name}</p>
                            <p className="text-sm text-gray-500">min-width: {breakpoint.value}px</p>
                          </div>
                          <input
                            type="number"
                            value={breakpoint.value}
                            className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Components */}
            {activeCategory === 'components' && (
              <div className="space-y-8 max-w-5xl">
                {/* Buttons */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Buttons</h3>
                  
                  {/* Button Styles */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Button Variants</h4>
                      <div className="flex flex-wrap gap-3">
                        <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                          Primary
                        </button>
                        <button className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition-colors">
                          Secondary
                        </button>
                        <button className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-gray-400 transition-colors">
                          Outline
                        </button>
                        <button className="px-6 py-2.5 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                          Ghost
                        </button>
                        <button className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                          Danger
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Button Sizes</h4>
                      <div className="flex items-center gap-3">
                        <button className="px-3 py-1 text-xs bg-gray-800 text-white font-medium rounded-md">
                          Extra Small
                        </button>
                        <button className="px-4 py-1.5 text-sm bg-gray-800 text-white font-medium rounded-md">
                          Small
                        </button>
                        <button className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg">
                          Medium
                        </button>
                        <button className="px-8 py-3 text-lg bg-gray-800 text-white font-medium rounded-lg">
                          Large
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Border Radius</h4>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { label: 'None', value: 0 },
                          { label: 'Small', value: 4 },
                          { label: 'Medium', value: 8 },
                          { label: 'Large', value: 12 },
                          { label: 'Full', value: 9999 }
                        ].map((radius) => (
                          <button
                            key={radius.label}
                            onClick={() => updateSetting('buttons.borderRadius', radius.value)}
                            className="aspect-square flex items-center justify-center border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            style={{ borderRadius: `${radius.value}px` }}
                          >
                            <span className="text-sm font-medium">{radius.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Cards</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="h-32 bg-gray-100 rounded mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">Basic Card</h4>
                      <p className="text-sm text-gray-600">Simple card with content</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="h-32 bg-gray-100 rounded mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">Shadow Card</h4>
                      <p className="text-sm text-gray-600">Card with subtle shadow</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="h-32 bg-gray-100" />
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Image Card</h4>
                        <p className="text-sm text-gray-600">Card with header image</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Elements */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Form Elements</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text Input
                      </label>
                      <input
                        type="text"
                        placeholder="Enter text..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Dropdown
                      </label>
                      <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Option 1</option>
                        <option>Option 2</option>
                        <option>Option 3</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="checkbox" className="text-sm text-gray-700">
                        Checkbox option
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Toggle Switch
                      </label>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Effects & Motion */}
            {activeCategory === 'effects' && (
              <div className="space-y-8 max-w-5xl">
                {/* Animation Settings */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Animation Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Enable Animations</p>
                        <p className="text-sm text-gray-500">Turn on smooth transitions and effects</p>
                      </div>
                      <Switch
                        checked={settings.animations?.sectionAnimation !== 'none'}
                        onCheckedChange={(checked) => updateSetting('animations.sectionAnimation', checked ? 'fade' : 'none')}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">Respect Reduced Motion</p>
                        <p className="text-sm text-gray-500">Honor user's motion preferences</p>
                      </div>
                      <Switch
                        checked={settings.animations?.duration === 'slow'}
                        onCheckedChange={(checked) => updateSetting('animations.duration', checked ? 'slow' : 'normal')}
                      />
                    </div>
                  </div>
                </div>

                {/* Transition Presets */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Transition Presets</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { name: 'Fade', icon: Zap, description: 'Smooth opacity transition' },
                      { name: 'Slide', icon: ArrowRight, description: 'Slide in from direction' },
                      { name: 'Scale', icon: Maximize2, description: 'Scale up or down' },
                      { name: 'Rotate', icon: RefreshCw, description: 'Rotation effect' },
                      { name: 'Blur', icon: Droplets, description: 'Blur in/out effect' },
                      { name: 'Bounce', icon: Activity, description: 'Bouncy animation' }
                    ].map((transition) => {
                      const Icon = transition.icon;
                      return (
                        <button
                          key={transition.name}
                          className="p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                              <Icon className="h-5 w-5 text-gray-700" />
                            </div>
                            <h4 className="font-medium text-gray-900">{transition.name}</h4>
                          </div>
                          <p className="text-sm text-gray-500">{transition.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hover Effects */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Hover Effects</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { name: 'Lift', transform: 'translateY(-4px)', shadow: '0 10px 20px rgba(0,0,0,0.1)' },
                      { name: 'Glow', transform: 'none', shadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
                      { name: 'Press', transform: 'scale(0.98)', shadow: 'none' },
                      { name: 'Tilt', transform: 'rotate(2deg)', shadow: 'none' }
                    ].map((effect) => (
                      <div
                        key={effect.name}
                        className="p-6 bg-gray-50 rounded-lg text-center cursor-pointer transition-all duration-300 hover:bg-white"
                        style={{
                          transform: effect.transform,
                          boxShadow: effect.shadow
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = effect.transform;
                          e.currentTarget.style.boxShadow = effect.shadow;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <p className="font-medium text-gray-900">{effect.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced */}
            {activeCategory === 'advanced' && (
              <div className="space-y-8 max-w-5xl">
                {/* Custom CSS */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Custom CSS</h3>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        Format
                      </button>
                      <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        Validate
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={'/* Custom CSS feature coming soon */'}
                      onChange={(e) => console.log('Custom CSS:', e.target.value)}
                      disabled
                      placeholder="/* Add your custom CSS here */
                      
/* Example:
.custom-button {
  background: linear-gradient(to right, #667eea, #764ba2);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
} */"
                      className="w-full h-96 px-4 py-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      Press Cmd+S to save
                    </div>
                  </div>
                </div>

                {/* Custom JavaScript */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Custom JavaScript</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                        Advanced
                      </span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Use with caution</p>
                        <p>Custom JavaScript can affect site performance and security. Only add trusted code.</p>
                      </div>
                    </div>
                  </div>
                  <textarea
                    placeholder="// Add your custom JavaScript here"
                    className="w-full h-64 px-4 py-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* API Keys */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Analytics ID
                      </label>
                      <input
                        type="text"
                        placeholder="UA-XXXXXXXXX-X"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook Pixel ID
                      </label>
                      <input
                        type="text"
                        placeholder="XXXXXXXXXXXXXXXX"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}