'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { 
  GripVertical, Trash2, Plus, ChevronRight, ChevronDown,
  ExternalLink, Link as LinkIcon, Folder, FolderOpen,
  Edit2, X, Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkSelector } from './link-selector';

interface MenuItem {
  id: string;
  label: string;
  link: string;
  position: number;
  target?: '_self' | '_blank';
  parentId?: string | null;
  children?: MenuItem[];
}

interface NestedMenuItemProps {
  item: MenuItem;
  depth: number;
  onUpdate: (itemId: string, field: keyof MenuItem, value: any) => void;
  onDelete: (itemId: string) => void;
  onAddChild: (parentId: string) => void;
  maxDepth: number;
  isOver?: boolean;
  isDragging?: boolean;
  subdomain: string;
}

export function NestedMenuItemCompact({
  item,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
  maxDepth,
  isOver,
  isDragging,
  subdomain
}: NestedMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  // Start in edit mode if this is a new item
  const [isEditing, setIsEditing] = useState(item.label === 'New Item' && item.id.startsWith('temp-'));
  const [editLabel, setEditLabel] = useState(item.label);
  const [editLink, setEditLink] = useState(item.link);
  const [editTarget, setEditTarget] = useState(item.target || '_self');
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const linkButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  // Update edit states when item prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditLabel(item.label);
      setEditLink(item.link);
      setEditTarget(item.target || '_self');
    }
  }, [item.label, item.link, item.target, isEditing]);
  
  const hasChildren = item.children && item.children.length > 0;
  const canHaveChildren = depth < maxDepth - 1;

  // Sortable setup
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
    data: {
      type: 'menuItem',
      item,
      depth
    }
  });

  // Droppable setup for accepting children
  const { 
    setNodeRef: setDroppableRef, 
    isOver: isOverContainer 
  } = useDroppable({
    id: `container-${item.id}`,
    disabled: !canHaveChildren || !isExpanded,
    data: {
      type: 'container',
      itemId: item.id,
      accepts: ['menuItem']
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSaveEdit = () => {
    // Update all fields
    onUpdate(item.id, 'label', editLabel);
    onUpdate(item.id, 'link', editLink);
    onUpdate(item.id, 'target', editTarget);
    
    setIsEditing(false);
    setShowLinkSelector(false);
  };

  const handleCancelEdit = () => {
    setEditLabel(item.label);
    setEditLink(item.link);
    setEditTarget(item.target || '_self');
    setIsEditing(false);
    setShowLinkSelector(false);
  };

  // Handle link selector positioning and close on outside click
  useEffect(() => {
    if (showLinkSelector && linkButtonRef.current) {
      const rect = linkButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: Math.max(400, rect.width)
      });
    }

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (linkButtonRef.current && !linkButtonRef.current.contains(target) && 
          !target.closest('.link-selector-portal')) {
        setShowLinkSelector(false);
      }
    };

    if (showLinkSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showLinkSelector]);

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        if (canHaveChildren) {
          setDroppableRef(node);
        }
      }}
      style={style}
      className={cn(
        "transition-all",
        isDragging && "opacity-50"
      )}
    >
      {/* Menu Item - Theme Studio Compact Style */}
      <div
        className={cn(
          "group",
          depth > 0 && "ml-6"
        )}
      >
        {!isEditing ? (
          // Normal View
          <div className={cn(
            "flex items-center gap-1.5 py-1 px-2 rounded-md transition-all cursor-pointer group/item",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            isOver && "bg-blue-50 dark:bg-blue-900/20",
            isOverContainer && canHaveChildren && "ring-1 ring-blue-400"
          )}>
            {/* Expand/Collapse */}
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                type="button"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </button>
            )}
            {/* Spacer when no children */}
            {!hasChildren && canHaveChildren && (
              <div className="w-5" />
            )}
            
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="cursor-grab hover:cursor-grabbing opacity-30 group-hover/item:opacity-100 transition-opacity"
            >
              <GripVertical className="h-3 w-3 text-gray-400" />
            </div>
            
            {/* Icon */}
            {hasChildren ? (
              <Folder className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            ) : (
              <LinkIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            )}
            
            {/* Label */}
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {item.label}
            </span>
            
            {/* Quick Actions - More Compact */}
            <div className="flex items-center -mr-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-0.5 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              
              {canHaveChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(item.id);
                  }}
                  className="p-0.5 text-gray-400 hover:text-green-600 transition-colors"
                  title="Add submenu"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-0.5 text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode - Inline Style
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2 mb-1">
            <div className="flex items-start gap-2">
              {/* Drag Handle (disabled in edit mode) */}
              <div className="opacity-30 cursor-not-allowed pt-1">
                <GripVertical className="h-3 w-3 text-gray-400" />
              </div>
              
              {/* Inline Form */}
              <div className="flex-1 space-y-1.5">
                {/* Label Input */}
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded
                           bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Menu item name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      handleCancelEdit();
                    }
                  }}
                />
                
                {/* Link and Target Row */}
                <div className="flex gap-1.5">
                  {/* Link Selector */}
                  <button
                    ref={linkButtonRef}
                    type="button"
                    onClick={() => setShowLinkSelector(!showLinkSelector)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded
                             bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800
                             focus:outline-none focus:ring-1 focus:ring-blue-500 text-left flex items-center justify-between"
                  >
                    <span className={cn(
                      "truncate text-xs",
                      !editLink && "text-gray-400"
                    )}>
                      {editLink || "Select a link..."}
                    </span>
                    <ChevronDown className={cn(
                      "h-3 w-3 text-gray-400 transition-transform",
                      showLinkSelector && "rotate-180"
                    )} />
                  </button>
                  
                  {/* Target Select */}
                  <select
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded
                             bg-white dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    title="Link target"
                  >
                    <option value="_self">Same</option>
                    <option value="_blank">New</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-0.5 pt-1">
                <button
                  onClick={handleSaveEdit}
                  className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  title="Save (Enter)"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                  title="Cancel (Esc)"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
                
            {/* Link Selector Portal */}
            {showLinkSelector && typeof window !== 'undefined' && createPortal(
              <div 
                className="link-selector-portal"
                style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  zIndex: 9999,
                  marginTop: '4px'
                }}
              >
                <LinkSelector
                  value={editLink}
                  onChange={(value, label) => {
                    setEditLink(value);
                    // If label is empty or "New Item", auto-set from selected link
                    if (!editLabel || editLabel === 'New Item') {
                      setEditLabel(label || 'New Item');
                    }
                    setShowLinkSelector(false);
                  }}
                  subdomain={subdomain}
                  onClose={() => setShowLinkSelector(false)}
                />
              </div>,
              document.body
            )}
          </div>
        )}
        
        {/* Link Preview - Only in normal view and on hover */}
        {!isEditing && item.link !== '/' && (
          <div className="ml-9 -mt-1 text-[10px] text-gray-400 truncate max-w-xs opacity-0 group-hover/item:opacity-70 transition-opacity">
            {item.link}
            {item.target === '_blank' && (
              <ExternalLink className="inline-block w-2 h-2 ml-0.5" />
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && !isEditing && (
        <div className={cn(
          "ml-3 pl-3 border-l-2 transition-all",
          isOverContainer ? "border-blue-400" : "border-gray-200 dark:border-gray-700"
        )}>
          <SortableContext
            items={item.children!.map(child => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children!.map((child) => (
              <NestedMenuItemCompact
                key={`${child.id}-${child.label}`} // Add label to key to force re-render
                item={child}
                depth={depth + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
                maxDepth={maxDepth}
                subdomain={subdomain}
              />
            ))}
          </SortableContext>
          
          {/* Drop zone indicator when empty */}
          {canHaveChildren && item.children!.length === 0 && (
            <div className="text-xs text-gray-400 italic py-2 px-2">
              Drop items here...
            </div>
          )}
        </div>
      )}
    </div>
  );
}