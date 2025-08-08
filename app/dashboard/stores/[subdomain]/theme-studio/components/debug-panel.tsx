'use client';

import React, { useState } from 'react';
import { 
  Bug, ChevronDown, ChevronRight, Copy, Check, 
  AlertCircle, Info, Database, Code, Layers,
  Settings, RefreshCw, Download, Eye, EyeOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DebugPanelProps {
  sections: any[];
  selectedSection: any;
  selectedBlock: any;
  themeSettings: any;
  templateData: any;
  store: any;
  isVisible?: boolean;
  className?: string;
}

export function DebugPanel({
  sections,
  selectedSection,
  selectedBlock,
  themeSettings,
  templateData,
  store,
  isVisible = false,
  className
}: DebugPanelProps) {
  console.log('[DebugPanel] Component rendered, isVisible:', isVisible);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    sections: true,
    selectedSection: false,
    selectedBlock: false,
    themeSettings: false,
    template: false,
    store: false
  });

  const copyToClipboard = async (data: any, itemName: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderValue = (value: any, depth = 0): JSX.Element => {
    if (value === null) return <span className="text-gray-400">null</span>;
    if (value === undefined) return <span className="text-gray-400">undefined</span>;
    
    if (typeof value === 'boolean') {
      return <span className={value ? 'text-green-500' : 'text-red-500'}>{String(value)}</span>;
    }
    
    if (typeof value === 'string') {
      // Check if it's a color
      if (value.match(/^#[0-9A-Fa-f]{6}$/)) {
        return (
          <span className="inline-flex items-center gap-1">
            <span 
              className="w-3 h-3 rounded border border-gray-300"
              style={{ backgroundColor: value }}
            />
            <span className="text-blue-500">"{value}"</span>
          </span>
        );
      }
      // Check if it's a URL
      if (value.startsWith('http') || value.startsWith('/')) {
        return <span className="text-blue-500 underline">"{value}"</span>;
      }
      return <span className="text-green-500">"{value}"</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-purple-500">{value}</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">[]</span>;
      if (depth > 2) return <span className="text-gray-400">[Array({value.length})]</span>;
      
      return (
        <div className="ml-4">
          <span className="text-gray-400">[</span>
          {value.map((item, index) => (
            <div key={index} className="ml-2">
              <span className="text-gray-400">{index}:</span> {renderValue(item, depth + 1)}
            </div>
          ))}
          <span className="text-gray-400">]</span>
        </div>
      );
    }
    
    if (typeof value === 'object') {
      const keys = Object.keys(value);
      if (keys.length === 0) return <span className="text-gray-400">{'{}'}</span>;
      if (depth > 2) return <span className="text-gray-400">{'{...}'}</span>;
      
      return (
        <div className="ml-4">
          <span className="text-gray-400">{'{'}</span>
          {keys.map(key => (
            <div key={key} className="ml-2">
              <span className="text-yellow-500">{key}:</span> {renderValue(value[key], depth + 1)}
            </div>
          ))}
          <span className="text-gray-400">{'}'}</span>
        </div>
      );
    }
    
    return <span className="text-gray-400">{String(value)}</span>;
  };

  const renderDebugSection = (title: string, data: any, icon: React.ReactNode, sectionKey: string) => {
    const isExpanded = expandedSections[sectionKey];
    
    // Special handling for theme settings
    let displayData = data;
    let itemCount = 0;
    
    if (sectionKey === 'themeSettings' && data) {
      if (data.themeConfig && data.values) {
        itemCount = Object.keys(data.themeConfig).length;
        displayData = {
          'Theme Categories': Object.keys(data.themeConfig),
          'Current Values': data.values,
          'Theme Config': data.themeConfig
        };
      } else if (typeof data === 'object' && data !== null) {
        itemCount = Object.keys(data).length;
      }
    } else {
      itemCount = Array.isArray(data) ? data.length : (typeof data === 'object' && data !== null ? Object.keys(data).length : 0);
    }
    
    const hasData = data && itemCount > 0;
    
    return (
      <div className="border-b border-gray-200">
        <div 
          className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-sm">{title}</span>
            {hasData && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {itemCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(displayData, sectionKey);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="Copy to clipboard"
            >
              {copiedItem === sectionKey ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3 text-gray-500" />
              )}
            </button>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
        {isExpanded && hasData && (
          <div className="p-3 bg-gray-50 border-t border-gray-200 max-h-64 overflow-auto">
            <pre className="text-xs font-mono">
              {renderValue(displayData)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 z-50",
      "transition-all duration-300",
      isExpanded ? "w-96 h-[600px]" : "w-auto h-auto",
      className
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Bug className="h-4 w-4 text-purple-500" />
          <span className="font-semibold text-sm">Theme Studio Debug</span>
          <span className="text-xs text-gray-500">(Ctrl+D)</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="overflow-y-auto h-[calc(100%-48px)]">
          {/* Quick Stats */}
          <div className="p-3 bg-gray-50 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-blue-500" />
              <span>Sections: {sections.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <Code className="h-3 w-3 text-green-500" />
              <span>Blocks: {sections.reduce((acc, s) => acc + (s.blocks?.length || 0), 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-3 w-3 text-purple-500" />
              <span>Theme: {themeSettings?.name || 'commerce'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3 text-orange-500" />
              <span>Store: {store?.subdomain || 'N/A'}</span>
            </div>
          </div>

          {/* Debug Sections */}
          {renderDebugSection('All Sections', sections, <Layers className="h-4 w-4 text-blue-500" />, 'sections')}
          
          {selectedSection && renderDebugSection(
            `Selected Section: ${selectedSection.sectionType}`, 
            selectedSection, 
            <Eye className="h-4 w-4 text-green-500" />, 
            'selectedSection'
          )}
          
          {selectedBlock && renderDebugSection(
            `Selected Block: ${selectedBlock.type}`, 
            selectedBlock, 
            <Code className="h-4 w-4 text-purple-500" />, 
            'selectedBlock'
          )}
          
          {renderDebugSection('Theme Settings', themeSettings, <Settings className="h-4 w-4 text-orange-500" />, 'themeSettings')}
          
          {renderDebugSection('Template Data', templateData, <Database className="h-4 w-4 text-indigo-500" />, 'template')}
          
          {renderDebugSection('Store Info', store, <Info className="h-4 w-4 text-gray-500" />, 'store')}
        </div>
      )}
    </div>
  );
}