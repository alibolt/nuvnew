'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Type, Search, Check, Star, StarOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface EnhancedTypographyPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  category?: 'all' | 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  compact?: boolean;
}

// Popular Google Fonts organized by category
const fontCategories = {
  'Popular': [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Raleway', 'Ubuntu', 'Nunito', 'Work Sans'
  ],
  'Serif': [
    'Playfair Display', 'Merriweather', 'Lora', 'Georgia', 
    'PT Serif', 'Crimson Text', 'Libre Baskerville', 'Bitter',
    'Arvo', 'Noto Serif'
  ],
  'Sans Serif': [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
    'Source Sans Pro', 'Helvetica', 'Arial', 'Oswald', 'Raleway'
  ],
  'Display': [
    'Bebas Neue', 'Anton', 'Righteous', 'Fredoka', 'Comfortaa',
    'Pacifico', 'Lobster', 'Dancing Script', 'Shadows Into Light',
    'Permanent Marker'
  ],
  'Monospace': [
    'Roboto Mono', 'Source Code Pro', 'IBM Plex Mono', 'JetBrains Mono',
    'Fira Code', 'Inconsolata', 'Space Mono', 'Ubuntu Mono'
  ]
};

// Theme typography options
const themeTypographyOptions = [
  { label: 'Theme Heading Font', value: 'var(--theme-typography-heading-font)' },
  { label: 'Theme Body Font', value: 'var(--theme-typography-body-font)' },
];

interface FontInfo {
  name: string;
  category: string;
  variants?: string[];
  subsets?: string[];
}

export function EnhancedTypographyPicker({
  label,
  value,
  onChange,
  className,
  disabled = false,
  showPreview = true,
  category = 'all',
  compact = false
}: EnhancedTypographyPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Popular');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nuvi-favorite-fonts');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Load Google Font dynamically
  const loadGoogleFont = (fontName: string) => {
    if (loadedFonts.has(fontName)) return;
    
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedFonts(prev => new Set(prev).add(fontName));
  };

  // Toggle favorite
  const toggleFavorite = (fontName: string) => {
    const updated = favorites.includes(fontName)
      ? favorites.filter(f => f !== fontName)
      : [...favorites, fontName];
    setFavorites(updated);
    localStorage.setItem('nuvi-favorite-fonts', JSON.stringify(updated));
  };

  // Get filtered fonts
  const getFilteredFonts = () => {
    let fonts: string[] = [];
    
    if (selectedCategory === 'Favorites') {
      fonts = favorites;
    } else if (selectedCategory === 'Theme') {
      return themeTypographyOptions;
    } else {
      fonts = fontCategories[selectedCategory as keyof typeof fontCategories] || [];
    }

    if (searchQuery) {
      fonts = fonts.filter(font => 
        font.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return fonts.map(font => ({ name: font, value: font }));
  };

  const filteredFonts = getFilteredFonts();

  // Check if value is a CSS variable
  const isThemeFont = value?.startsWith('var(--');
  const displayValue = isThemeFont 
    ? themeTypographyOptions.find(opt => opt.value === value)?.label || value
    : value;

  // Load font preview
  useEffect(() => {
    if (value && !isThemeFont) {
      loadGoogleFont(value);
    }
  }, [value, isThemeFont]);

  return (
    <div className={cn("space-y-1", className)}>
      {label && <label className="text-xs font-medium text-gray-700">{label}</label>}
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={disabled}
            className={cn(
              "w-full flex items-center gap-2 border rounded-md",
              "bg-white hover:bg-gray-50 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer",
              compact ? "px-2 py-1" : "px-3 py-2"
            )}
          >
            <Type className={cn(compact ? "w-3 h-3" : "w-4 h-4", "text-gray-400")} />
            <span 
              className={cn(compact ? "text-xs" : "text-sm", "flex-1 text-left")}
              style={{ fontFamily: !isThemeFont ? value : undefined }}
            >
              {displayValue || 'Choose font'}
            </span>
          </button>
        </PopoverTrigger>
        
        <PopoverContent 
          className={cn(compact ? "w-80" : "w-96", "p-0")} 
          align="start"
          side="bottom"
        >
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fonts"
                className="w-full pl-10 pr-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="p-2 border-b">
            <div className="flex flex-wrap gap-1">
              {['Popular', 'Serif', 'Sans Serif', 'Display', 'Monospace', 'Favorites', 'Theme'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap",
                    selectedCategory === cat 
                      ? "bg-blue-100 text-blue-700 border border-blue-200" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                  )}
                >
                  {cat}
                  {cat === 'Favorites' && favorites.length > 0 && (
                    <span className="ml-1 text-gray-500">({favorites.length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font List */}
          <div className="max-h-80 overflow-y-auto">
            {selectedCategory === 'Theme' ? (
              <div className="p-2">
                {themeTypographyOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-left",
                      value === option.value 
                        ? "bg-blue-50 text-blue-700" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <Type className="w-4 h-4 text-gray-400" />
                    <span className="text-sm flex-1">{option.label}</span>
                    {value === option.value && (
                      <Check className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            ) : filteredFonts.length > 0 ? (
              <div className="p-2">
                {filteredFonts.map((font) => {
                  const fontName = typeof font === 'string' ? font : font.name;
                  // Load font for preview
                  loadGoogleFont(fontName);
                  
                  return (
                    <div
                      key={fontName}
                      className={cn(
                        "flex items-center gap-2 px-3 py-3 rounded-md transition-colors",
                        value === fontName 
                          ? "bg-blue-50" 
                          : "hover:bg-gray-50"
                      )}
                    >
                      <button
                        onClick={() => toggleFavorite(fontName)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {favorites.includes(fontName) ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          onChange(fontName);
                          setIsOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div 
                          className="text-lg mb-1"
                          style={{ fontFamily: fontName }}
                        >
                          {fontName}
                        </div>
                        {showPreview && (
                          <div 
                            className="text-xs text-gray-500"
                            style={{ fontFamily: fontName }}
                          >
                            The quick brown fox jumps over the lazy dog
                          </div>
                        )}
                      </button>
                      
                      {value === fontName && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                {selectedCategory === 'Favorites' 
                  ? 'No favorite fonts yet'
                  : 'No fonts found'}
              </div>
            )}
          </div>

          {/* Current Selection */}
          {value && !isThemeFont && (
            <div className="p-3 border-t bg-gray-50">
              <div className="text-xs text-gray-600 mb-1">Current Selection</div>
              <div 
                className="text-lg font-medium"
                style={{ fontFamily: value }}
              >
                {value}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}