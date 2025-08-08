'use client';

import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  DndContext, 
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { Eye, EyeOff, GripVertical, Trash2, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockType } from '@/lib/block-types';
import { Block } from '../types';

interface NestedSortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderBlocks: (blockId: string, newOrder: string[]) => void;
  sectionId: string;
  depth?: number;
  parentId?: string;
}

export function NestedSortableBlock({
  block,
  isSelected,
  onSelect,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  sectionId,
  depth = 0,
  parentId
}: NestedSortableBlockProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOverContainer, setIsDragOverContainer] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `block-${block.id}`,
    data: {
      type: 'block',
      block,
      parentId,
      depth
    }
  });

  // Droppable setup for container blocks
  const { 
    setNodeRef: setDroppableNodeRef, 
    isOver 
  } = useDroppable({
    id: `container-${block.id}`,
    disabled: block.type !== 'container' || !isExpanded,
    data: {
      type: 'container',
      blockId: block.id,
      accepts: ['block']
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockType = getBlockType(block.type);
  if (!blockType) return null;

  const isContainer = block.type === 'container';
  const hasChildren = isContainer && block.blocks && block.blocks.length > 0;
  const childBlocks = block.blocks || [];

  // Sensors for nested drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChildDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString().replace('block-', '');
    const overId = over.id.toString().replace('block-', '');
    
    if (activeId !== overId) {
      const oldIndex = childBlocks.findIndex(b => b.id === activeId);
      const newIndex = childBlocks.findIndex(b => b.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(childBlocks, oldIndex, newIndex).map(b => b.id);
        onReorderBlocks(block.id, newOrder);
      }
    }
  };

  return (
    <div
      ref={(node) => {
        setSortableNodeRef(node);
        if (isContainer) {
          setDroppableNodeRef(node);
        }
      }}
      style={style}
      className={cn(
        "transition-all",
        isDragging && "opacity-50",
        isOver && isContainer && "ring-2 ring-blue-400 ring-offset-2 rounded-md"
      )}
    >
      {/* Block Item */}
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 cursor-pointer rounded-md transition-colors group",
          isSelected 
            ? "bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)]" 
            : "hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-text-secondary)]",
          depth > 0 ? "pl-6 pr-2" : "px-2"
        )}
        onClick={onSelect}
      >
        {/* Expand/Collapse for containers */}
        {isContainer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            {isExpanded ? (
              <FolderOpen className="w-3 h-3" />
            ) : (
              <Folder className="w-3 h-3" />
            )}
          </button>
        )}
        
        {/* Drag Handle */}
        <GripVertical 
          {...attributes}
          {...listeners}
          className="h-2.5 w-2.5 text-[var(--nuvi-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" 
        />
        
        {/* Status indicator */}
        <div className={cn(
          "w-1 h-1 rounded-full flex-shrink-0",
          block.enabled ? "bg-[#8B9F7E]" : "bg-gray-300"
        )} />

        {/* Block Icon */}
        <blockType.icon className="h-2.5 w-2.5 flex-shrink-0" />

        {/* Block Title */}
        <span className="text-xs font-medium flex-1 truncate">
          {blockType.name}
          {hasChildren && <span className="text-gray-400 ml-1">({childBlocks.length})</span>}
        </span>

        {/* Quick Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateBlock(block.id, { enabled: !block.enabled });
            }}
            className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-[var(--nuvi-text-primary)]"
          >
            {block.enabled ? <Eye className="h-2 w-2" /> : <EyeOff className="h-2 w-2" />}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteBlock(block.id);
            }}
            className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-red-600"
          >
            <Trash2 className="h-2 w-2" />
          </button>
        </div>
      </div>

      {/* Container Drop Zone & Children */}
      {isContainer && isExpanded && (
        <div className={cn(
          "ml-4 mt-1 mb-1 border-l-2 pl-2 transition-colors",
          isOver ? "border-blue-400" : "border-gray-200"
        )}>
          {childBlocks.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleChildDragEnd}
              sensors={sensors}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={childBlocks.map(b => `block-${b.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {childBlocks.map((childBlock) => (
                    <NestedSortableBlock
                      key={childBlock.id}
                      block={childBlock}
                      isSelected={false} // You'll need to pass this from parent
                      onSelect={() => {}} // You'll need to pass this from parent
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onReorderBlocks={onReorderBlocks}
                      sectionId={sectionId}
                      depth={depth + 1}
                      parentId={block.id}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-xs text-gray-400 italic py-2 px-2">
              Drop blocks here...
            </div>
          )}
        </div>
      )}
    </div>
  );
}