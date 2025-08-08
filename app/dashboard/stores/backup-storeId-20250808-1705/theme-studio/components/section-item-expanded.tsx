'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Eye, EyeOff, GripVertical, Layout, ShoppingBag, 
  Type, Image, Mail, Users, MessageSquare, Instagram, 
  Palette, Layers, MoreVertical, Copy, Trash2, 
  ChevronDown, Settings, Sparkles
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

interface SectionItemExpandedProps {
  section: Section;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onDelete?: (sectionId: string) => void;
  onToggleVisibility?: (sectionId: string, enabled: boolean) => void;
  onDuplicate?: () => void;
  onUpdate?: (sectionId: string, updates: any) => void;
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

export function SectionItemExpanded({ 
  section, 
  isSelected, 
  isExpanded,
  onSelect, 
  onToggleExpand,
  onDelete,
  onToggleVisibility,
  onDuplicate,
  onUpdate
}: SectionItemExpandedProps) {
  const [showMenu, setShowMenu] = useState(false);
  
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative transition-all duration-200 mb-1",
        isDragging && "opacity-30 z-50"
      )}
    >
      {/* Section Header */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg transition-all duration-200",
          isExpanded ? "bg-white shadow-sm ring-1 ring-[var(--nuvi-primary)]/20" : "",
          isSelected && !isExpanded ? "bg-[var(--nuvi-primary-lighter)]" : "",
          !isExpanded && "hover:bg-gray-50"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-2 cursor-pointer",
            !section.enabled && "opacity-50"
          )}
          onClick={onSelect}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className={cn(
              "flex items-center justify-center cursor-grab active:cursor-grabbing p-1 rounded transition-all",
              "text-gray-400 hover:text-gray-600",
              isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <GripVertical className="h-3.5 w-3.5" />
          </div>

          {/* Section Icon */}
          <div 
            className={cn(
              "transition-colors flex-shrink-0",
              isSelected || isExpanded
                ? "text-[var(--nuvi-primary)]" 
                : "text-gray-400"
            )}
          >
            <SectionIcon className="h-3.5 w-3.5" />
          </div>

          {/* Section Details */}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-[13px] font-medium transition-colors leading-tight",
              isSelected || isExpanded ? "text-gray-900" : "text-gray-700"
            )}>
              {section.title}
            </h3>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">

            {/* Visibility Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility?.(section.id, !section.enabled);
              }}
              className={cn(
                "p-1 rounded transition-all opacity-0 group-hover:opacity-100",
                section.enabled 
                  ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" 
                  : "text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              )}
              title={section.enabled ? "Hide section" : "Show section"}
            >
              {section.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </button>
            
            {/* Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-3 w-3" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden py-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate?.();
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-1.5 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Duplicate
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(section.id);
                        setShowMenu(false);
                      }} 
                      className="w-full px-3 py-1.5 text-sm text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hidden Badge */}
          {!section.enabled && (
            <div className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Hidden
            </div>
          )}
        </div>

        {/* Expanded Settings Panel */}
        {isExpanded && (
          <div className="border-t border-gray-100 bg-gray-50/50">
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-[var(--nuvi-primary)]" />
                <span className="text-xs font-medium text-gray-700">Section Settings</span>
              </div>
              <SectionInspector
                section={section}
                onUpdate={(updates) => onUpdate?.(section.id, updates)}
                compact={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}