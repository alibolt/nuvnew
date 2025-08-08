'use client';

import React, { useState, memo } from 'react';
import { useSortable, useDroppable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DndContext, 
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { 
  Eye, EyeOff, GripVertical, Trash2, ChevronRight, 
  Plus, Copy, Settings, Folder, FolderOpen 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockType } from '@/lib/block-types';
import { Block } from '../types';

interface UnifiedSortableBlockProps {
  block: Block;
  isSelected: boolean;
  isNested?: boolean;
  depth?: number;
  onSelect: () => void;
  onToggleEnabled: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  onAddChild?: () => void;
  onReorderChildren?: (newOrder: string[]) => void;
  className?: string;
  selectedBlockId?: string;
  onSelectBlock?: (blockId: string) => void;
}

export const UnifiedSortableBlock = memo(function UnifiedSortableBlock({
  block,
  isSelected,
  isNested = false,
  depth = 0,
  onSelect,
  onToggleEnabled,
  onDelete,
  onDuplicate,
  onAddChild,
  onReorderChildren,
  className,
  selectedBlockId,
  onSelectBlock
}: UnifiedSortableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  
  const blockType = getBlockType(block.type);
  const isContainer = block.type === 'container' || block.type === 'columns' || !!block.blocks;
  const hasChildren = isContainer && block.blocks && block.blocks.length > 0;

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: {
      type: 'block',
      block,
      depth,
      parentId: block.id
    }
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `${block.id}-container`,
    data: {
      type: 'container',
      accepts: ['block'],
      containerId: block.id,
      depth: depth + 1
    },
    disabled: !isContainer || !isExpanded
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id || !block.blocks) return;

    const oldIndex = block.blocks.findIndex(b => b.id === active.id);
    const newIndex = block.blocks.findIndex(b => b.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(block.blocks, oldIndex, newIndex).map(b => b.id);
      onReorderChildren?.(newOrder);
    }
  };

  const renderBlockContent = () => (
    <div
      ref={setSortableRef}
      style={style}
      className={cn(
        "group relative rounded-lg transition-all duration-200",
        isSelected && "ring-2 ring-blue-500",
        isDragging && "opacity-50",
        !block.enabled && "opacity-50",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "flex items-center gap-2 p-3 rounded-lg cursor-pointer",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
          isSelected && "bg-blue-50 dark:bg-blue-900/20"
        )}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* Expand/Collapse for containers */}
        {isContainer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-gray-500" />
            ) : (
              <Folder className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}

        {/* Block Icon */}
        {blockType?.icon && (
          <blockType.icon className="h-4 w-4 text-gray-500 flex-shrink-0" />
        )}

        {/* Block Name */}
        <span className="flex-1 text-sm font-medium truncate">
          {blockType?.label || block.type}
        </span>

        {/* Block ID (for debugging) */}
        {process.env.NODE_ENV === 'development' && (
          <span className="text-xs text-gray-400">#{block.id.slice(-4)}</span>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Settings */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5 text-gray-500" />
            </button>

            {/* Toggle Visibility */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnabled();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title={block.enabled ? "Hide" : "Show"}
            >
              {block.enabled ? (
                <Eye className="h-3.5 w-3.5 text-gray-500" />
              ) : (
                <EyeOff className="h-3.5 w-3.5 text-gray-500" />
              )}
            </button>

            {/* Duplicate */}
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5 text-gray-500" />
              </button>
            )}

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
            </button>
          </div>
        )}
      </div>

      {/* Container Children */}
      {isContainer && isExpanded && (
        <div
          ref={setDroppableRef}
          className={cn(
            "ml-6 pl-4 border-l-2 border-gray-200 dark:border-gray-700",
            hasChildren ? "py-2" : "py-4"
          )}
        >
          {hasChildren ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={block.blocks?.map(b => b.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {block.blocks?.map((childBlock) => (
                    <UnifiedSortableBlock
                      key={childBlock.id}
                      block={childBlock}
                      isSelected={selectedBlockId === childBlock.id}
                      isNested={true}
                      depth={depth + 1}
                      onSelect={() => onSelectBlock?.(childBlock.id)}
                      onToggleEnabled={() => {
                        // Handle child block toggle
                      }}
                      onDelete={() => {
                        // Handle child block delete
                      }}
                      onDuplicate={() => {
                        // Handle child block duplicate
                      }}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={onSelectBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={() => onAddChild?.()}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Block
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return renderBlockContent();
});

UnifiedSortableBlock.displayName = 'UnifiedSortableBlock';