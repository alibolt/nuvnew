'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Eye, EyeOff, Settings, ChevronDown, ChevronRight, 
  Image, Type, Palette, Layout, Link, Trash2, Copy, Layers, ShoppingBag, X,
  AlignLeft, Maximize2, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSectionSchema } from '@/lib/section-schemas';
import { SectionSchema } from '@/types/section-schema';
import { getBlockType } from '@/lib/block-types';
import { ImagePickerPanel } from '@/components/ui/image-picker-panel';
import { fetchDynamicOptions, requiresDynamicOptions, DynamicOption, getBlockSettings } from '@/lib/dynamic-block-options';
import { Block, Section } from '../types';
import { FormInputs } from '@/components/theme-studio/form-inputs';
import { getContainerSettingsGroups } from '@/lib/container-block-groups';
// Theme block schemas will be loaded when themes are available

interface SectionInspectorSimplifiedProps {
  section: Section;
  selectedBlockId?: string | null;
  onUpdate: (updates: Partial<Section>, skipHistory?: boolean) => void;
  onUpdateBlock?: (blockUpdates: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  subdomain?: string;
  theme?: string;
  compact?: boolean;
  onImagePickerToggle?: (isOpen: boolean) => void;
}

// Use centralized form components
// FormInputs components are now accessed directly as FormInputs.ComponentName
import { alignmentOptions, verticalAlignmentOptions, layoutOptions, containerLayoutOptions, containerAlignmentOptions, imageFitOptions, mobileLayoutOptions, borderRadiusOptions } from '@/components/theme-studio/form-inputs';

export function SectionInspector({ 
  section, 
  selectedBlockId,
  onUpdate, 
  onUpdateBlock,
  onDelete, 
  onDuplicate,
  subdomain,
  theme = 'commerce',
  compact = false,
  onImagePickerToggle
}: SectionInspectorSimplifiedProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    content: false,
    design: false,
    layout: false,
    blockSettings: false
  });
  
  const [sectionSchema, setSectionSchema] = useState<SectionSchema | null>(null);
  const [menus, setMenus] = useState([
    { value: 'main-menu', label: 'Main Menu' },
    { value: 'footer-menu', label: 'Footer Menu' }
  ]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedBlockType, setSelectedBlockType] = useState<any>(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [currentImageField, setCurrentImageField] = useState<{ key: string; value: string } | null>(null);
  
  // Update parent when image picker state changes
  useEffect(() => {
    onImagePickerToggle?.(imagePickerOpen);
  }, [imagePickerOpen, onImagePickerToggle]);
  
  // Dynamic options cache for block settings
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, DynamicOption[]>>({});
  
  // Block settings cache (since getBlockSettings is now async)
  const [blockSettings, setBlockSettings] = useState<any[]>([]);

  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const blockUpdateTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Use blocks directly from section prop - no separate API call needed
  // Use section.id in dependency to reset when section changes
  const databaseBlocks = useMemo(() => section.blocks || [], [section.id, section.blocks?.length]);
  const blocksError = null;

  // Load section schema and data
  useEffect(() => {
    async function loadData() {
      // Use sectionType if available, fallback to type
      const sectionType = section.sectionType || section.type;
      // console.log(`[SectionInspector] Loading schema for section type: ${sectionType}`);
      // console.log(`[SectionInspector] Section object:`, { type: section.type, sectionType: section.sectionType });
      const schema = await getSectionSchema(sectionType, theme);
      // console.log(`[SectionInspector] Schema loaded for ${sectionType}:`, schema);
      
      // Special debug for hero-banner layout fields - disabled to prevent excessive re-renders
      // if (sectionType === 'hero-banner' && schema?.layout?.fields) {
      //   console.log(`[SectionInspector] Hero-banner layout fields:`, schema.layout.fields);
      //   const transparentHeaderField = schema.layout.fields.find(f => f.key === 'transparentHeader');
      //   console.log(`[SectionInspector] TransparentHeader field found:`, transparentHeaderField);
      // }
      
      setSectionSchema(schema);
      
      // Load dynamic options for section settings
      if (schema && subdomain && typeof schema === 'object') {
        const newDynamicOptions: Record<string, DynamicOption[]> = {};
        
        try {
          for (const [groupKey, group] of Object.entries(schema)) {
            // Skip blocks group as it uses availableBlocks instead of fields
            if (groupKey === 'blocks') {
              continue;
            }
            
            // Ensure group has fields and it's an array
            if (!group || typeof group !== 'object' || !group.fields || !Array.isArray(group.fields)) {
              console.warn(`Group ${groupKey} has no fields or fields is not an array:`, group);
              continue;
            }
          
            for (const field of group.fields) {
              if (requiresDynamicOptions(field.key)) {
                try {
                  const options = await fetchDynamicOptions(subdomain, field.key, section.sectionType || section.type);
                  newDynamicOptions[field.key] = options;
                } catch (error) {
                  console.error(`Failed to load section options for ${field.key}:`, error);
                  newDynamicOptions[field.key] = field.options || [];
                }
              }
            }
          }
          
          setDynamicOptions(prev => ({ ...prev, ...newDynamicOptions }));
        } catch (error) {
          console.error(`Failed to process section schema for ${section.sectionType || section.type}:`, error);
        }
      }
      
      // Load menus for header sections
      if ((section.sectionType || section.type) === 'header' && subdomain) {
        try {
          const res = await fetch(`/api/stores/${subdomain}/menus`);
          
          // Check if response is ok and has content
          if (!res.ok) {
            console.error('Failed to fetch menus:', res.status, res.statusText);
            return;
          }
          
          const contentType = res.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            console.error('Invalid response type from menus API');
            return;
          }
          
          const result = await res.json();
          // Handle both old and new response formats
          const data = result.data || result;
          if (Array.isArray(data)) {
            setMenus(data.map(menu => ({
              value: menu.handle,
              label: menu.name
            })));
          }
        } catch (err) {
          console.error('Failed to load menus:', err);
        }
      }
    }
    loadData();
  }, [section.type, section.sectionType, subdomain, theme]);
  
  // Load block settings and dynamic options
  const loadBlockSettingsAndOptions = useCallback(async (blockType: any) => {
    if (!blockType || !subdomain) return;

    try {
      // Load block settings (theme-specific or fallback)
      const settings = await getBlockSettings(blockType);
      console.log('🔧 Block settings loaded:', { 
        blockType: blockType.id, 
        settingsCount: settings.length,
        settings: settings.map(s => ({ key: s.key, type: s.type, label: s.label }))
      });
      setBlockSettings(settings);

      // Load dynamic options for settings that require them
      const newDynamicOptions: Record<string, DynamicOption[]> = {};
      
      for (const setting of settings) {
        if (requiresDynamicOptions(setting.key)) {
          try {
            const options = await fetchDynamicOptions(subdomain, setting.key, blockType.id || blockType.type);
            newDynamicOptions[setting.key] = options;
          } catch (error) {
            console.error(`Failed to load options for ${setting.key}:`, error);
            newDynamicOptions[setting.key] = setting.options || [];
          }
        }
      }

      setDynamicOptions(prev => ({ ...prev, ...newDynamicOptions }));
    } catch (error) {
      console.error('Failed to load block settings and options:', error);
      setBlockSettings([]);
    }
  }, [subdomain]);

  // Helper function to find block in nested structure
  const findBlockInStructure = (blocks: Block[], blockId: string): Block | null => {
    for (const block of blocks) {
      if (block.id === blockId) {
        return block;
      }
      // Check nested blocks in containers - check both blocks and settings.blocks
      const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
      if (containerTypes.includes(block.type)) {
        const nestedBlocks = block.blocks || block.settings?.blocks || [];
        if (nestedBlocks.length > 0) {
          const found = findBlockInStructure(nestedBlocks, blockId);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Load selected block data when selectedBlockId changes
  useEffect(() => {
    if (selectedBlockId) {
      // Use section blocks directly - they should be loaded
      const blocks = section.blocks || [];
      
      // First try to find in top-level blocks
      let block = blocks.find(b => b.id === selectedBlockId);
      
      // If not found, search in nested container blocks
      if (!block) {
        block = findBlockInStructure(blocks, selectedBlockId);
      }
      
      if (block) {
        console.log('[SectionInspector] Found selected block:', block);
        setSelectedBlock(block);
        const blockType = getBlockType(block.type);
        console.log('[SectionInspector] Block type info:', blockType);
        setSelectedBlockType(blockType);
        
        // Load block settings and dynamic options for this block type
        if (blockType) {
          loadBlockSettingsAndOptions(blockType);
        }
      } else {
        // Block not found, clear selection
        console.log('[SectionInspector] Block not found in structure');
        setSelectedBlock(null);
        setSelectedBlockType(null);
        setBlockSettings([]);
        setDynamicOptions({});
      }
    } else {
      setSelectedBlock(null);
      setSelectedBlockType(null);
      setBlockSettings([]);
      setDynamicOptions({});
    }
  }, [selectedBlockId, section.blocks, loadBlockSettingsAndOptions]);

  // Log blocks error for debugging
  useEffect(() => {
    if (blocksError && !section.id.startsWith('temp-')) {
      console.error('Blocks loading error:', blocksError);
    }
  }, [blocksError, section.id]);
  
  // Clear selected block when section changes
  useEffect(() => {
    setSelectedBlock(null);
    setSelectedBlockType(null);
  }, [section.id]);
  
  // Update selected block when section blocks change
  useEffect(() => {
    if (selectedBlock && section.blocks) {
      // Find the updated version of the selected block
      const findUpdatedBlock = (blocks: Block[]): Block | null => {
        for (const block of blocks) {
          if (block.id === selectedBlock.id) {
            return block;
          }
          // Check nested blocks in containers
          const containerTypes = ['container', 'icon-group', 'mega-menu', 'mega-menu-column'];
          if (containerTypes.includes(block.type)) {
            const nestedBlocks = block.blocks || block.settings?.blocks || [];
            if (nestedBlocks.length > 0) {
              const found = findUpdatedBlock(nestedBlocks);
              if (found) return found;
            }
          }
        }
        return null;
      };
      
      const updatedBlock = findUpdatedBlock(section.blocks);
      if (updatedBlock && JSON.stringify(updatedBlock) !== JSON.stringify(selectedBlock)) {
        console.log('[SectionInspector] Updating selected block from parent:', updatedBlock);
        setSelectedBlock(updatedBlock);
      }
    }
  }, [section.blocks, selectedBlock?.id]);

  const handleSettingChange = (key: string, value: any, skipHistory: boolean = false) => {
    const newSettings = { ...section.settings, [key]: value };
    
    // Update UI immediately for smooth feedback
    console.log('Setting change:', { key, value, newSettings, skipHistory });
    
    // Preserve the current focus element
    const currentActiveElement = document.activeElement as HTMLElement;
    
    // IMPORTANT: Only update settings, don't trigger any selection changes
    // This prevents the sidebar from jumping to block settings
    const updates = { 
      settings: newSettings,
      // Preserve existing blocks to prevent re-selection
      blocks: section.blocks,
      // Explicitly preserve the current view state
      _preserveInspectorView: true
    };
    
    // Call onUpdate immediately for real-time feedback
    onUpdate(updates, skipHistory);
    
    // Restore focus if it was lost during the update
    requestAnimationFrame(() => {
      if (currentActiveElement && document.activeElement !== currentActiveElement) {
        currentActiveElement.focus();
      }
    });
    
    // Remove debounced update for now to fix real-time issues
    /*
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate({ settings: newSettings });
    }, 300);
    */
  };
  
  const handleBlockSettingChange = (key: string, value: any) => {
    if (!selectedBlock || !onUpdateBlock) {
      console.warn('Block setting change called without selected block or update handler');
      return;
    }
    
    console.log('🔧 Block setting change:', { 
      blockId: selectedBlock.id, 
      blockType: selectedBlock.type,
      settingKey: key, 
      newValue: value,
      oldValue: selectedBlock.settings?.[key]
    });
    
    const newSettings = { ...selectedBlock.settings, [key]: value };
    
    // Don't update local state here - wait for parent update
    // This prevents UI inconsistency between sidebar and preview
    
    // Call onUpdateBlock immediately for real-time feedback
    console.log('Calling onUpdateBlock with settings:', newSettings);
    onUpdateBlock({ 
      blockId: selectedBlock.id,
      settings: newSettings
    });
  };

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const getSectionIcon = () => {
    const icons = {
      header: Layout,
      hero: Image,
      'featured-products': Layout,
      footer: Layout
    };
    return icons[section.type as keyof typeof icons] || Settings;
  };

  const SectionIcon = getSectionIcon();

  // Group settings by category for cleaner organization
  const contentSettings = {
    header: [
      { key: 'logo', type: 'text', label: 'Logo Text' },
      { key: 'menuHandle', type: 'select', label: 'Menu', options: menus },
      { key: 'showSearch', type: 'toggle', label: 'Show Search' },
      { key: 'showCart', type: 'toggle', label: 'Show Cart' }
    ],
    hero: [
      { key: 'title', type: 'text', label: 'Heading' },
      { key: 'subtitle', type: 'textarea', label: 'Subheading' },
      { key: 'backgroundImage', type: 'text', label: 'Background Image URL' },
      { key: 'buttonText', type: 'text', label: 'Button Text' },
      { key: 'buttonLink', type: 'text', label: 'Button Link' }
    ],
    'featured-products': [
      { key: 'title', type: 'text', label: 'Section Title' },
      { key: 'productsToShow', type: 'select', label: 'Products to Show', 
        options: [
          { value: '4', label: '4 Products' },
          { value: '8', label: '8 Products' },
          { value: '12', label: '12 Products' }
        ]
      }
    ]
  };

  const designSettings = [
    { key: 'backgroundColor', type: 'color', label: 'Background Color' },
    { key: 'textColor', type: 'color', label: 'Text Color' },
    { key: 'borderRadius', type: 'select', label: 'Corner Radius',
      options: [
        { value: '0', label: 'None' },
        { value: '4px', label: 'Small' },
        { value: '8px', label: 'Medium' },
        { value: '16px', label: 'Large' }
      ]
    }
  ];

  const layoutSettings = [
    { key: 'maxWidth', type: 'select', label: 'Container Width',
      options: [
        { value: 'full', label: 'Full Width (100%)' },
        { value: 'container', label: 'Container (1200px)' },
        { value: 'narrow', label: 'Narrow (800px)' }
      ]
    },
    { key: 'padding', type: 'select', label: 'Section Padding',
      options: [
        { value: 'none', label: 'None' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ]
    }
  ];

  const renderInput = (setting: any, isBlock: boolean = false) => {
    const value = isBlock ? selectedBlock?.settings?.[setting.key] : section.settings?.[setting.key];
    const onChange = isBlock 
      ? (newValue: any, skipHistory?: boolean) => handleBlockSettingChange(setting.key, newValue)
      : (newValue: any, skipHistory?: boolean) => handleSettingChange(setting.key, newValue, skipHistory);
    
    // Debug logging for transparent header toggle - disabled to prevent excessive re-renders
    // if (setting.key === 'transparentHeader') {
    //   console.log('🔍 Rendering transparent header toggle:', {
    //     key: setting.key,
    //     type: setting.type,
    //     value: value,
    //     isBlock: isBlock,
    //     setting: setting,
    //     sectionSettings: section.settings
    //   });
    // }
    
    // Debug logging for columnRatio field - disabled to prevent excessive re-renders
    // if (setting.key === 'columnRatio') {
    //   console.log('🎯 Rendering columnRatio field:', {
    //     key: setting.key,
    //     type: setting.type,
    //     value: value,
    //     currentLayout: section.settings?.layout,
    //     conditional: setting.conditional,
    //     sectionType: section.sectionType || section.type,
    //     allSettings: section.settings
    //   });
    // }
    
    // Debug logging for image_picker fields - disabled to prevent excessive re-renders
    // if (setting.type === 'image_picker' || setting.type === 'image') {
    //   console.log('🖼️ Rendering image picker field:', {
    //     key: setting.key,
    //     type: setting.type,
    //     value: value,
    //     isBlock: isBlock,
    //     setting: setting
    //   });
    // }
    
    // Check conditional visibility (supports 'conditional', 'showIf', and 'condition' formats)
    if (setting.conditional) {
      const conditionValue = isBlock 
        ? selectedBlock?.settings?.[setting.conditional.field]
        : section.settings?.[setting.conditional.field];
      
      // Support both single value and array of values
      const expectedValue = setting.conditional.value;
      const isMatch = Array.isArray(expectedValue) 
        ? expectedValue.includes(conditionValue)
        : conditionValue === expectedValue;
      
      if (!isMatch) {
        return null; // Don't render if condition is not met
      }
    }
    
    // Check showIf conditional visibility  
    if (setting.showIf) {
      const conditionField = Object.keys(setting.showIf)[0];
      const conditionValue = setting.showIf[conditionField];
      const actualValue = isBlock 
        ? selectedBlock?.settings?.[conditionField]
        : section.settings?.[conditionField];
      
      if (actualValue !== conditionValue) {
        return null; // Don't render if condition is not met
      }
    }
    
    // Check condition - can be either a string or a function
    if (setting.condition) {
      try {
        // Handle function conditions
        if (typeof setting.condition === 'function') {
          const currentSettings = isBlock ? selectedBlock?.settings : section.settings;
          if (!setting.condition(currentSettings || {})) {
            return null; // Don't render if condition is not met
          }
        } 
        // Handle string conditions (e.g., "showDescription === true")
        else if (typeof setting.condition === 'string') {
          const matches = setting.condition.match(/(\w+)\s*===\s*(.+)/);
          if (matches) {
            const [, fieldName, expectedValue] = matches;
            const actualValue = isBlock 
              ? selectedBlock?.settings?.[fieldName]
              : section.settings?.[fieldName];
            
            // Parse expected value
            let parsedExpectedValue: any = expectedValue.trim();
            if (parsedExpectedValue === 'true') parsedExpectedValue = true;
            else if (parsedExpectedValue === 'false') parsedExpectedValue = false;
            else if (parsedExpectedValue.startsWith('"') && parsedExpectedValue.endsWith('"')) {
              parsedExpectedValue = parsedExpectedValue.slice(1, -1);
            }
            
            if (actualValue !== parsedExpectedValue) {
              return null; // Don't render if condition is not met
            }
          }
        }
      } catch (error) {
        console.error('Error parsing condition:', setting.condition, error);
      }
    }
    
    // Extract key from setting to avoid React key prop warning
    const { key, ...settingProps } = setting;

    switch (setting.type) {
      case 'text':
        return <FormInputs.Text {...settingProps} value={value} onChange={onChange} skipHistory={true} />;
      case 'textarea':
        return <FormInputs.TextArea {...settingProps} value={value} onChange={onChange} />;
      case 'select':
        // Use dynamic options if available, otherwise fall back to static options
        const options = dynamicOptions[setting.key] 
          ? dynamicOptions[setting.key] 
          : settingProps.options || [];
        
        return <FormInputs.Select {...settingProps} value={value} onChange={onChange} options={options} />;
      case 'toggle':
      case 'checkbox':
        // console.log('🔄 Rendering toggle field:', {
        //   key: setting.key,
        //   label: settingProps.label,
        //   value: value,
        //   onChange: onChange
        // });
        return <FormInputs.Toggle {...settingProps} value={value} onChange={onChange} />;
      case 'color':
        return <FormInputs.Color {...settingProps} value={value} onChange={onChange} />;
      case 'font-picker':
      case 'font_picker':
      case 'typography':
        return <FormInputs.Typography {...settingProps} value={value} onChange={onChange} />;
      case 'number':
        return <FormInputs.Text {...settingProps} value={value} onChange={onChange} type="number" skipHistory={true} />;
      case 'url':
      case 'link':
        return <FormInputs.Link {...settingProps} value={value} onChange={onChange} subdomain={subdomain || ''} />;
      case 'email':
        return <FormInputs.Text {...settingProps} value={value} onChange={onChange} type="email" skipHistory={true} />;
      case 'image':
      case 'image_picker':
        return (
          <div className="nuvi-space-y-sm nuvi-w-full" style={{ maxWidth: '100%' }}>
            {value ? (
              <div className="nuvi-relative nuvi-w-full">
                <div className="nuvi-relative nuvi-w-full nuvi-aspect-[16/9] nuvi-bg-gray-50 nuvi-rounded-md nuvi-border nuvi-border-border nuvi-overflow-hidden">
                  <img
                    src={value}
                    alt="Preview"
                    className="nuvi-w-full nuvi-h-full nuvi-object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('nuvi-flex', 'nuvi-items-center', 'nuvi-justify-center');
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="nuvi-hidden nuvi-flex-col nuvi-items-center nuvi-justify-center nuvi-text-gray-400">
                    <Image className="nuvi-w-8 nuvi-h-8 nuvi-mb-2" />
                    <span className="nuvi-text-xs">Image not found</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="nuvi-absolute nuvi-top-2 nuvi-right-2 nuvi-bg-white nuvi-text-gray-600 nuvi-rounded-full nuvi-p-1.5 nuvi-shadow-md hover:nuvi-bg-gray-50 nuvi-transition-colors"
                  title="Remove image"
                >
                  <X className="nuvi-w-4 nuvi-h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageField({ key: setting.key, value: value || '' });
                  setImagePickerOpen(true);
                }}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full nuvi-gap-xs"
                title="Select image from library"
              >
                <Image className="w-4 h-4" />
                Choose Image
              </button>
            )}
            {value && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageField({ key: setting.key, value: value || '' });
                  setImagePickerOpen(true);
                }}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full nuvi-gap-xs"
                title="Change image"
              >
                <Image className="w-3 h-3" />
                Change Image
              </button>
            )}
          </div>
        );
      case 'range':
        return <FormInputs.Range 
          {...settingProps} 
          value={value} 
          onChange={onChange} 
          min={settingProps.validation?.min || setting.min || 0}
          max={settingProps.validation?.max || setting.max || 100}
          step={setting.step || 1}
          unit={setting.unit || ''}
        />;
      case 'icon_select':
        // Determine which icon options to use based on the key
        let iconOptions = settingProps.options || [];
        
        // Text alignment for text, heading, button blocks
        if (setting.key === 'alignment' && (selectedBlock?.type === 'text' || selectedBlock?.type === 'heading' || selectedBlock?.type === 'button' || selectedBlock?.type === 'image')) {
          iconOptions = alignmentOptions;
        }
        // Container block alignment
        else if (setting.key === 'alignment' && selectedBlock?.type === 'container') {
          iconOptions = containerAlignmentOptions;
        }
        // General alignment
        else if (setting.key === 'contentAlignment' || setting.key === 'textAlign' || setting.key === 'alignment') {
          iconOptions = alignmentOptions;
        }
        // Vertical alignment
        else if (setting.key === 'verticalAlignment') {
          iconOptions = verticalAlignmentOptions;
        }
        // Container block layout
        else if (setting.key === 'layout' && selectedBlock?.type === 'container') {
          iconOptions = containerLayoutOptions;
        }
        // General layout
        else if (setting.key === 'layout') {
          iconOptions = layoutOptions;
        }
        // Image fit mode
        else if (setting.key === 'objectFit') {
          iconOptions = imageFitOptions;
        }
        // Mobile layout
        else if (setting.key === 'mobileLayout') {
          iconOptions = mobileLayoutOptions;
        }
        // Border radius
        else if (setting.key === 'borderRadius') {
          iconOptions = borderRadiusOptions;
        }
        
        return <FormInputs.IconSelect {...settingProps} value={value} onChange={onChange} options={iconOptions} />;
      
      case 'column_ratio':
        return <FormInputs.ColumnRatio {...settingProps} value={value} onChange={onChange} />;
      
      case 'visual_range':
        return <FormInputs.VisualRange 
          {...settingProps} 
          value={value} 
          onChange={onChange} 
          type={setting.rangeType || 'padding'}
        />;
      case 'collection_picker':
      case 'product_picker':
        // Multi-select picker for collections or products
        const pickerOptions = dynamicOptions[setting.key] 
          ? dynamicOptions[setting.key] 
          : settingProps.options || [];
        
        const selectedValues = Array.isArray(value) ? value : [];
        
        return (
          <div className="nuvi-space-y-xs">
            <label className="nuvi-text-xs nuvi-font-medium nuvi-text-secondary">{settingProps.label}</label>
            <div className="nuvi-max-h-32 nuvi-overflow-y-auto nuvi-border nuvi-border-border nuvi-rounded-md nuvi-bg-background">
              {pickerOptions.length > 0 ? (
                pickerOptions.map((option: DynamicOption) => {
                  const isSelected = selectedValues.includes(option.value);
                  return (
                    <label key={option.value} className="nuvi-flex nuvi-items-center nuvi-p-xs nuvi-text-sm hover:nuvi-bg-muted nuvi-cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          let newValue;
                          if (e.target.checked) {
                            newValue = [...selectedValues, option.value];
                          } else {
                            newValue = selectedValues.filter(v => v !== option.value);
                          }
                          onChange(newValue);
                        }}
                        className="nuvi-mr-xs nuvi-rounded nuvi-border-border"
                      />
                      <span className="nuvi-flex-1">{option.label}</span>
                    </label>
                  );
                })
              ) : (
                <div className="nuvi-p-xs nuvi-text-xs nuvi-text-secondary nuvi-text-center">
                  {setting.type === 'collection_picker' ? 'No collections found' : 'No products found'}
                </div>
              )}
            </div>
            {selectedValues.length > 0 && (
              <div className="nuvi-text-xs nuvi-text-secondary">
                {selectedValues.length} selected
              </div>
            )}
          </div>
        );
      case 'array':
        // Special handling for navigation menu items
        if (setting.key === 'menuItems' && selectedBlock?.type === 'navigation-menu') {
          return (
            <div className="nuvi-space-y-xs">
              <label className="nuvi-text-xs nuvi-font-medium nuvi-text-secondary nuvi-block">{settingProps.label}</label>
              <div className="nuvi-p-2 nuvi-bg-muted nuvi-rounded-md">
                <textarea
                  value={JSON.stringify(value || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      onChange(parsed);
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="nuvi-w-full nuvi-min-h-[200px] nuvi-p-2 nuvi-bg-background nuvi-rounded-md nuvi-border nuvi-border-border nuvi-text-xs nuvi-font-mono"
                  placeholder="Enter menu items as JSON array"
                />
                <p className="nuvi-text-xs nuvi-text-secondary nuvi-mt-2">
                  Edit menu items as JSON. Example:
                  <pre className="nuvi-text-xs nuvi-mt-1 nuvi-p-2 nuvi-bg-background nuvi-rounded nuvi-overflow-x-auto">
{`[
  {
    "id": "home",
    "title": "Home",
    "href": "/",
    "type": "link"
  },
  {
    "id": "shop",
    "title": "Shop",
    "type": "dropdown",
    "items": [
      {
        "id": "all",
        "title": "All Products",
        "href": "/collections/all"
      }
    ]
  }
]`}
                  </pre>
                </p>
              </div>
            </div>
          );
        }
        // Generic array handling
        return (
          <div className="nuvi-space-y-xs">
            <label className="nuvi-text-xs nuvi-font-medium nuvi-text-secondary">{settingProps.label}</label>
            <div className="nuvi-text-xs nuvi-text-secondary">Array editing not yet supported</div>
          </div>
        );
      default:
        return null;
    }
  };


  const renderGroup = (title: string, groupKey: string, settings: any[], icon: any, isBlock: boolean = false) => {
    const Icon = icon;
    const isExpanded = expandedGroups[groupKey];
    
    // Debug logging for Layout group in hero-banner
    if (groupKey === 'layout' && (section.sectionType === 'hero-banner' || section.type === 'hero-banner')) {
      console.log(`[SectionInspector] Rendering Layout group for hero-banner:`, {
        title,
        groupKey,
        settings,
        settingsCount: settings.length,
        isExpanded,
        transparentHeaderSetting: settings.find(s => s.key === 'transparentHeader')
      });
    }
    
    // Group settings that can be displayed side by side
    const groupSettings = (settings: any[]) => {
      const grouped: any[][] = [];
      let currentGroup: any[] = [];
      
      settings.forEach((setting, index) => {
        // These types should take full width
        const fullWidthTypes = ['textarea', 'image', 'image_picker', 'collection_picker', 'product_picker', 'column_ratio', 'visual_range'];
        
        // These types work well side by side
        const compactTypes = ['checkbox', 'toggle', 'icon_select', 'color', 'select', 'number', 'text'];
        
        // Check if this setting should be full width
        const isFullWidth = fullWidthTypes.includes(setting.type) || setting.fullWidth;
        const isCompact = compactTypes.includes(setting.type);
        
        // If current group has items and this is full width, push current group
        if (currentGroup.length > 0 && isFullWidth) {
          grouped.push(currentGroup);
          currentGroup = [];
        }
        
        // Add to current group
        currentGroup.push(setting);
        
        // If full width or group has 2 items, push and reset
        const maxGroupSize = 2;
        if (isFullWidth || currentGroup.length === maxGroupSize) {
          grouped.push(currentGroup);
          currentGroup = [];
        }
      });
      
      // Push any remaining items
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
      }
      
      return grouped;
    };

    return (
      <div className="nuvi-card">
        <button
          onClick={() => toggleGroup(groupKey)}
          className="nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-xs hover:nuvi-bg-muted/50 nuvi-transition-colors"
        >
          <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
            <Icon size={12} className="nuvi-text-muted" />
            <span className="nuvi-text-xs nuvi-font-medium nuvi-text-secondary">{title}</span>
          </div>
          {isExpanded ? (
            <ChevronDown size={12} className="nuvi-text-muted" />
          ) : (
            <ChevronRight size={12} className="nuvi-text-muted" />
          )}
        </button>
        
        {isExpanded && (
          <div className="nuvi-border-t nuvi-border-border">
            {/* Settings */}
            {settings.length > 0 && (
              <div className="nuvi-p-xs nuvi-space-y-xs">
                {groupSettings(settings).map((group, groupIndex) => (
                  <div key={groupIndex} className={cn(
                    "nuvi-grid nuvi-gap-xs",
                    group.length === 1 && "nuvi-grid-cols-1",
                    group.length === 2 && "nuvi-grid-cols-2"
                  )}>
                    {group.map((setting) => (
                      <div key={setting.key}>
                        {renderInput(setting, isBlock)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            
          </div>
        )}
      </div>
    );
  };
  


  return (
    <div className="nuvi-flex nuvi-flex-col nuvi-h-full nuvi-relative nuvi-z-10 section-inspector-simplified theme-studio-right-sidebar bg-[var(--nuvi-background)]" style={{ width: '100%', maxWidth: '100%', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-xs nuvi-border-b nuvi-bg-background nuvi-sticky nuvi-top-0 nuvi-z-20">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
          {selectedBlock ? (
            <Layers size={12} className="nuvi-text-muted" />
          ) : (
            <SectionIcon size={12} className="nuvi-text-muted" />
          )}
          <div>
            {selectedBlock ? (
              <>
                <h3 className="nuvi-text-xs nuvi-font-medium">{selectedBlockType?.name || 'Block'}</h3>
                <p className="nuvi-text-xs nuvi-text-secondary">in {section.title}</p>
              </>
            ) : (
              <h3 className="nuvi-text-xs nuvi-font-medium">{section.title}</h3>
            )}
          </div>
        </div>
        
        <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
          <button
            onClick={() => onUpdate({ enabled: !section.enabled })}
            className={cn(
              "nuvi-p-xs nuvi-rounded-md nuvi-transition-colors hover:nuvi-bg-muted",
              section.enabled ? "nuvi-text-foreground" : "nuvi-text-muted"
            )}
            title={section.enabled ? "Hide section" : "Show section"}
          >
            {section.enabled ? <Eye size={10} /> : <EyeOff size={10} />}
          </button>
          
          {onDuplicate && (
            <button
              onClick={onDuplicate}
              className="nuvi-p-xs nuvi-rounded-md hover:nuvi-bg-muted nuvi-transition-colors nuvi-text-muted"
              title="Duplicate section"
            >
              <Copy size={10} />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={onDelete}
              className="nuvi-p-xs nuvi-rounded-md hover:nuvi-bg-destructive/10 nuvi-transition-colors nuvi-text-destructive"
              title="Delete section"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="nuvi-flex-1 nuvi-overflow-y-auto nuvi-overflow-x-hidden nuvi-p-xs nuvi-space-y-xs theme-studio-scrollbar form-container" style={{ maxWidth: '100%' }}>
        
        {/* Show Block Settings if a block is selected */}
        {(() => {
          console.log('[SectionInspector] Render check:', {
            selectedBlockId,
            hasSelectedBlock: !!selectedBlock,
            hasSelectedBlockType: !!selectedBlockType,
            blockSettings: blockSettings.length
          });
          return null;
        })()}
        
        {/* Show section settings only if no block is selected */}
        {!selectedBlock && (
          <>
            {/* Schema-based settings */}
            {sectionSchema && typeof sectionSchema === 'object' ? (
                  <>
                    
                    {/* Render other settings groups */}
                    {Object.entries(sectionSchema).map(([groupKey, group]) => {
                      // Skip blocks group as it's handled above
                      if (groupKey === 'blocks') return null;
                      
                      // Skip groups without fields or if fields is not an array
                      if (!group || typeof group !== 'object' || !group.fields || !Array.isArray(group.fields)) {
                        return null;
                      }
                      
                      const iconMap: Record<string, any> = {
                        'Type': Type,
                        'Palette': Palette,
                        'Layout': Layout,
                        'Eye': Eye,
                        'Settings': Settings,
                        'ShoppingBag': ShoppingBag,
                        'Image': Image,
                        'Zap': Zap
                      };
                      
                      return (
                        <div key={groupKey}>
                          {renderGroup(
                            group.title,
                            groupKey,
                            group.fields,
                            iconMap[group.icon] || Settings
                          )}
                        </div>
                      );
                    }).filter(Boolean)}
                  </>
                ) : (
                  <>
                    {/* Fallback to hardcoded settings */}
                    {contentSettings[(section.sectionType || section.type) as keyof typeof contentSettings] && 
                      renderGroup(
                        'Content', 
                        'content', 
                        contentSettings[(section.sectionType || section.type) as keyof typeof contentSettings],
                        Type
                      )}

                    {/* Design Settings */}
                    {renderGroup('Design', 'design', designSettings, Palette)}

                    {/* Layout Settings */}
                    {renderGroup('Layout', 'layout', layoutSettings, Layout)}
                  </>
                )}
          </>
        )}
            
            {/* Show Block Settings if a block is selected */}
            {selectedBlock && selectedBlockType && (
              <>
                {/* Block Header */}
                <div className="nuvi-mb-xs">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                    <Layers size={12} className="nuvi-text-muted" />
                    <h4 className="nuvi-text-xs nuvi-font-medium">{selectedBlockType.name}</h4>
                  </div>
                  <p className="nuvi-text-xs nuvi-text-secondary">{selectedBlockType.description}</p>
                </div>
                
                {/* Block Settings */}
                {selectedBlock.type === 'container' ? (
                  // Container block with grouped settings
                  <>
                    {(() => {
                      const groups = getContainerSettingsGroups(
                        blockSettings.reduce((acc, setting) => ({ ...acc, [setting.key]: setting }), {})
                      );
                      
                      const groupInfo = {
                        layout: { title: 'Layout', icon: Layout },
                        spacing: { title: 'Spacing', icon: Settings },
                        alignment: { title: 'Alignment', icon: AlignLeft },
                        sizing: { title: 'Size', icon: Maximize2 },
                        style: { title: 'Style', icon: Palette }
                      };
                      
                      return Object.entries(groups).map(([groupKey, settings]) => {
                        const info = groupInfo[groupKey as keyof typeof groupInfo] || { title: groupKey, icon: Settings };
                        return (
                          <div key={groupKey} className="nuvi-mb-xs">
                            {renderGroup(info.title, `block_${groupKey}`, settings as any[], info.icon, true)}
                          </div>
                        );
                      });
                    })()}
                  </>
                ) : (
                  // Other blocks with single group
                  renderGroup('Block Settings', 'blockSettings', blockSettings, Settings, true)
                )}
              </>
            )}
      </div>
      
      {/* Image Picker Panel - Inside the sidebar */}
      {imagePickerOpen && (
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          backgroundColor: 'var(--background)'
        }}>
          <ImagePickerPanel
            isOpen={imagePickerOpen}
            onClose={() => {
              setImagePickerOpen(false);
              setCurrentImageField(null);
            }}
            onSelect={(imageUrl) => {
              if (currentImageField && selectedBlock) {
                handleBlockSettingChange(currentImageField.key, imageUrl);
              } else if (currentImageField) {
                handleSettingChange(currentImageField.key, imageUrl);
              }
              setImagePickerOpen(false);
              setCurrentImageField(null);
            }}
            subdomain={subdomain!}
            currentValue={currentImageField?.value}
            title="Select Image"
            description="Choose an image from your media library or upload a new one"
            context="theme"
          />
        </div>
      )}
    </div>
  );
}