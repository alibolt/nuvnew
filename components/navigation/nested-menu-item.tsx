'use client';

import React, { useState } from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { 
  GripVertical, Trash2, Plus, ChevronRight, ChevronDown,
  ExternalLink, Link as LinkIcon, Folder, FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export function NestedMenuItem({
  item,
  depth,
  onUpdate,
  onDelete,
  onAddChild,
  maxDepth,
  isOver,
  isDragging
}: NestedMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
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
      {/* Menu Item - Theme Studio Style */}
      <div
        className={cn(
          "group",
          depth > 0 && "ml-6"
        )}
      >
        <div className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md transition-all",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          isOver && "bg-blue-50 dark:bg-blue-900/20",
          isOverContainer && canHaveChildren && "ring-1 ring-blue-400"
        )}>
          {/* Expand/Collapse */}
          {(hasChildren || canHaveChildren) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                hasChildren ? <FolderOpen className="w-3 h-3 text-gray-500" /> : <Folder className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </button>
          )}
          
          {/* Drag Handle */}
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
          
          {/* Label */}
          <input
            type="text"
            value={item.label}
            onChange={(e) => onUpdate(item.id, 'label', e.target.value)}
            className="flex-1 bg-transparent border-0 text-sm font-medium text-gray-700 dark:text-gray-300 
                     focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 -mx-1"
            placeholder="Menu item name"
          />
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {canHaveChildren && (
              <button
                onClick={() => onAddChild(item.id)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Add submenu"
              >
                <Plus className="h-3 w-3" />
              </button>
            )}
            
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
        
        {/* Link Info - Compact Style */}
        <div className="ml-7 text-xs text-gray-500 mb-1">
          {item.link}
          {item.target === '_blank' && (
            <ExternalLink className="inline-block w-3 h-3 ml-1" />
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={cn(
          "ml-3 mt-1 pl-3 border-l-2 transition-all",
          isOverContainer ? "border-blue-400" : "border-gray-200 dark:border-gray-700"
        )}>
          <SortableContext
            items={item.children!.map(child => child.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children!.map((child) => (
              <NestedMenuItem
                key={child.id}
                item={child}
                depth={depth + 1}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddChild={onAddChild}
                maxDepth={maxDepth}
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