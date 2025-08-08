'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Eye, EyeOff, GripVertical, Layout, ShoppingBag, 
  Type, Image, Mail, Users, MessageSquare, Instagram, 
  Palette, Layers, Copy, Trash2, ChevronRight,
  Settings, Edit3, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SectionInspector } from './section-inspector';

interface Section {
  id: string;
  type: string;
  sectionType?: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionItemMinimalProps {
  section: Section;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onDelete?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicate?: () => void;
  onUpdate?: (sectionId: string, updates: any) => void;
  categoryColor?: string;
  showInlineSettings?: boolean;
  storeId?: string;
}

// Section type icons mapping
const sectionIcons: Record<string, any> = {
  'hero': Layout,
  'header': Layout,
  'footer': Layout,
  'featured-products': ShoppingBag,
  'product-grid': ShoppingBag,
  'image-with-text': Image,
  'rich-text': Type,
  'newsletter': Mail,
  'testimonials': MessageSquare,
  'logo-list': Users,
  'instagram-feed': Instagram,
  'collections': Palette,
};

// Color variants for categories
const colorVariants: Record<string, { bg: string; border: string; text: string }> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-700'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700'
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-700'
  }
};

export function SectionItemMinimal({ 
  section, 
  isSelected, 
  isExpanded,
  onSelect, 
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onUpdate,
  categoryColor = 'blue',
  showInlineSettings = false,
  storeId
}: SectionItemMinimalProps) {
  const [showActions, setShowActions] = useState(false);
  const [localSettings, setLocalSettings] = useState(section.settings);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  const sectionType = section.type || section.sectionType || '';
  const SectionIcon = sectionIcons[sectionType] || Layers;
  const colors = colorVariants[categoryColor] || colorVariants.blue;

  // Update local settings when section settings change
  useEffect(() => {
    setLocalSettings(section.settings);
  }, [section.settings]);

  // Debounced update function
  const debouncedUpdate = useCallback((key: string, value: any) => {
    // Update local state immediately for smooth UI
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout for actual update
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate?.(section.id, { 
        settings: { ...section.settings, [key]: value }
      });
    }, 300); // 300ms delay
  }, [localSettings, section.id, section.settings, onUpdate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'visibility':
        onToggleVisibility?.(section.id, !section.enabled);
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this section?')) {
          onDelete?.(section.id);
        }
        break;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-section-sidebar-id={section.id}
      className={cn(
        "group relative transition-all duration-200 mb-1 px-2",
        isDragging && "opacity-30 z-50"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg transition-all duration-200",
          isExpanded && "shadow-sm ring-1 ring-[var(--nuvi-primary)]/20",
          isSelected && !isExpanded && `${colors.bg} ${colors.border} border`,
          !isSelected && !isExpanded && "hover:bg-gray-50 border border-transparent",
          !section.enabled && "opacity-60"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-2 cursor-pointer relative",
            isExpanded && "border-b border-gray-100"
          )}
          onClick={onSelect}
        >
          {/* Drag Handle - Always visible on left */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "p-0.5 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0",
              "text-gray-400 hover:text-gray-600",
              (isDragging || showActions) ? "opacity-100" : "opacity-0"
            )}
          >
            <GripVertical className="h-3 w-3" />
          </div>

          {/* Status indicator */}
          <div className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            section.enabled ? "bg-green-500" : "bg-gray-300"
          )} />

          {/* Section Icon */}
          <div className={cn(
            "flex-shrink-0",
            isSelected || isExpanded ? colors.text : "text-gray-500"
          )}>
            <SectionIcon className="h-3.5 w-3.5" />
          </div>

          {/* Section Title - More space, no wrapping */}
          <div className="flex-1 min-w-0 pr-1">
            <h3 className={cn(
              "text-[10px] font-medium transition-colors leading-tight whitespace-nowrap overflow-hidden text-ellipsis",
              isSelected || isExpanded ? "text-gray-900" : "text-gray-700"
            )}>
              {section.title}
            </h3>
          </div>

          {/* Inline Actions - Show on hover or when selected */}
          <div className={cn(
            "flex items-center gap-0.5 transition-opacity flex-shrink-0",
            (showActions || isSelected || isExpanded) ? "opacity-100" : "opacity-0"
          )}>
            {/* Visibility toggle */}
            <button
              onClick={(e) => handleQuickAction('visibility', e)}
              className={cn(
                "p-0.5 rounded transition-all",
                section.enabled 
                  ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
                  : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              )}
              title={section.enabled ? "Hide" : "Show"}
            >
              {section.enabled ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
            </button>

            {/* Duplicate */}
            <button
              onClick={(e) => handleQuickAction('duplicate', e)}
              className="p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
              title="Duplicate"
            >
              <Copy className="h-2.5 w-2.5" />
            </button>

            {/* Delete */}
            <button
              onClick={(e) => handleQuickAction('delete', e)}
              className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
              title="Delete"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Expand indicator */}
          <ChevronRight 
            className={cn(
              "h-2.5 w-2.5 text-gray-400 transition-transform flex-shrink-0",
              isExpanded && "rotate-90"
            )}
          />
        </div>

        {/* Expanded Settings Area */}
        {isExpanded && (
          <div className="bg-gray-50/50" style={{ padding: '12px' }}>
            <div className="space-y-3">
              {/* Quick settings removed for minimal theme - use expanded settings instead */}


              {/* Inline Settings Panel */}
              {showInlineSettings && isExpanded && (
                <div className="mt-1">
                  <SectionInspector
                    section={section}
                    onUpdate={(updates) => onUpdate?.(section.id, updates)}
                    onDelete={() => onDelete?.(section.id)}
                    compact={true}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}