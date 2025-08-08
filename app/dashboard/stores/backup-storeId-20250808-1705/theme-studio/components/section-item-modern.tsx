'use client';

import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Eye, EyeOff, GripVertical, Layout, ShoppingBag, 
  Type, Image, Mail, Users, MessageSquare, Instagram, 
  Palette, Layers, MoreVertical, Copy, Trash2, 
  ChevronRight, Settings, Sparkles, Code, Move,
  Zap, Edit3, Lock, Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  type: string;
  sectionType?: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionItemModernProps {
  section: Section;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onDelete?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicate?: () => void;
  onUpdate?: (sectionId: string, updates: any) => void;
  categoryColor?: string;
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

export function SectionItemModern({ 
  section, 
  isSelected, 
  isExpanded,
  onSelect, 
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onUpdate,
  categoryColor = 'blue'
}: SectionItemModernProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [quickEditMode, setQuickEditMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Quick actions
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
      className={cn(
        "group relative transition-all duration-200 mb-1 px-2",
        isDragging && "opacity-30 z-50"
      )}
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
            "flex items-center gap-2 px-3 py-2.5 cursor-pointer relative",
            isExpanded && "border-b border-gray-100"
          )}
          onClick={onSelect}
        >
          {/* Drag Handle - Always visible on left */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing",
              "bg-gradient-to-r from-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
              isDragging && "opacity-100"
            )}
          >
            <GripVertical className="h-3.5 w-3.5 text-gray-400" />
          </div>

          {/* Content area with padding for drag handle */}
          <div className="flex items-center gap-2 flex-1 pl-4">
            {/* Status indicator */}
            <div className={cn(
              "w-1.5 h-1.5 rounded-full flex-shrink-0",
              section.enabled ? "bg-green-500" : "bg-gray-300"
            )} />

            {/* Section Icon with category color */}
            <div className={cn(
              "p-1 rounded flex-shrink-0",
              isSelected || isExpanded ? colors.text : "text-gray-500"
            )}>
              <SectionIcon className="h-3.5 w-3.5" />
            </div>

            {/* Section Title */}
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "text-[13px] font-medium transition-colors leading-tight truncate",
                isSelected || isExpanded ? "text-gray-900" : "text-gray-700"
              )}>
                {section.title}
              </h3>
              {/* Section type label */}
              <span className="text-[10px] text-gray-400">
                {sectionType.replace(/-/g, ' ')}
              </span>
            </div>

            {/* Quick Actions - Visible on hover */}
            <div className={cn(
              "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
              (isSelected || isExpanded) && "opacity-100"
            )}>
              {/* Edit button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuickEditMode(true);
                }}
                className="p-1 text-gray-400 hover:text-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-lighter)] rounded transition-all"
                title="Quick edit"
              >
                <Edit3 className="h-3 w-3" />
              </button>

              {/* Visibility toggle */}
              <button
                onClick={(e) => handleQuickAction('visibility', e)}
                className={cn(
                  "p-1 rounded transition-all",
                  section.enabled 
                    ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
                    : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                )}
                title={section.enabled ? "Hide section" : "Show section"}
              >
                {section.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              </button>

              {/* More menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                >
                  <MoreVertical className="h-3 w-3" />
                </button>
                
                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden py-1">
                    <button 
                      onClick={(e) => handleQuickAction('duplicate', e)}
                      className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Duplicate Section</span>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement lock/unlock
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Lock Position</span>
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Show code view
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Code className="h-3.5 w-3.5" />
                      <span>View Code</span>
                    </button>
                    
                    <div className="my-1 border-t border-gray-100" />
                    
                    <button 
                      onClick={(e) => handleQuickAction('delete', e)}
                      className="w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Section</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Expand indicator */}
            <ChevronRight 
              className={cn(
                "h-3 w-3 text-gray-400 transition-transform flex-shrink-0",
                isExpanded && "rotate-90"
              )}
            />
          </div>
        </div>

        {/* Expanded Settings Area */}
        {isExpanded && (
          <div className="p-4 bg-gray-50/50">
            <div className="space-y-3">
              {/* Quick settings preview */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Quick Settings</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Open full settings panel
                  }}
                  className="text-[var(--nuvi-primary)] hover:text-[var(--nuvi-primary-hover)] flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  <span>All Settings</span>
                </button>
              </div>

              {/* Common quick edits based on section type */}
              <div className="space-y-2">
                {sectionType === 'hero' && (
                  <>
                    <input
                      type="text"
                      placeholder="Heading"
                      value={section.settings?.heading || ''}
                      onChange={(e) => onUpdate?.(section.id, { 
                        settings: { ...section.settings, heading: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[var(--nuvi-primary)]"
                    />
                    <input
                      type="text"
                      placeholder="Subheading"
                      value={section.settings?.subheading || ''}
                      onChange={(e) => onUpdate?.(section.id, { 
                        settings: { ...section.settings, subheading: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:border-[var(--nuvi-primary)]"
                    />
                  </>
                )}
                
                {/* Add more quick edit fields based on section types */}
              </div>

              {/* Section info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div className="flex items-center gap-4 text-[10px] text-gray-400">
                  <span>ID: {section.id.slice(0, 8)}</span>
                  <span>Position: {section.position}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[var(--nuvi-primary)]" />
                  <span className="text-[10px] text-[var(--nuvi-primary)]">AI Ready</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}