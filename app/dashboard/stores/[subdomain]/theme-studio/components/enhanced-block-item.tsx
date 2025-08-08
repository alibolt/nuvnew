'use client';

import React, { useState } from 'react';
import { useSortable, useDroppable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Trash2, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockType } from '@/lib/block-types';
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
import { Block } from '../types';

interface BlockExtended extends Block {
  position?: number;
  blocks?: Block[]; // Child blocks for containers
}

interface EnhancedBlockItemProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onReorderChildBlocks?: (parentId: string, newOrder: string[]) => void;
  sectionId: string;
  depth?: number;
  parentId?: string;
  selectedBlockId?: string;
  onSelectBlock?: (blockId: string) => void;
}

// Individual sortable block component
function SortableBlock({
  block,
  isSelected,
  onSelect,
  onUpdateBlock,
  onDeleteBlock,
  sectionId,
  depth = 0
}: Omit<EnhancedBlockItemProps, 'onReorderChildBlocks' | 'parentId' | 'selectedBlockId' | 'onSelectBlock'>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `block-${block.id}`,
    data: {
      type: 'block',
      block,
      depth
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockType = getBlockType(block.type);
  if (!blockType) return null;

  const isContainer = block.type === 'container';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "flex items-center gap-1.5 py-1.5 cursor-pointer rounded-md transition-colors group",
        isSelected 
          ? "bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)]" 
          : "hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-text-secondary)]",
        isDragging && "opacity-50",
        depth > 0 ? "pl-6 pr-2" : "px-2"
      )}
      onClick={onSelect}
    >
      {/* Container icon */}
      {isContainer && (
        <blockType.icon className="h-2.5 w-2.5 flex-shrink-0 text-[var(--nuvi-text-muted)]" />
      )}
      
      {/* Drag Handle */}
      <GripVertical 
        {...listeners}
        data-drag-handle="true"
        className="h-2.5 w-2.5 text-[var(--nuvi-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-move" 
      />
      
      {/* Status indicator */}
      <div className={cn(
        "w-1 h-1 rounded-full flex-shrink-0",
        block.enabled ? "bg-[#8B9F7E]" : "bg-gray-300"
      )} />

      {/* Block Icon */}
      {!isContainer && <blockType.icon className="h-2.5 w-2.5 flex-shrink-0" />}

      {/* Block Title */}
      <span className="text-xs font-medium flex-1 truncate">
        {blockType.name}
        {isContainer && block.blocks && block.blocks.length > 0 && (
          <span className="text-[var(--nuvi-text-muted)] ml-1">({block.blocks.length})</span>
        )}
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
            onDeleteBlock(sectionId, block.id);
          }}
          className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-red-600"
        >
          <Trash2 className="h-2 w-2" />
        </button>
      </div>
    </div>
  );
}

export function EnhancedBlockItem({
  block,
  isSelected,
  onSelect,
  onUpdateBlock,
  onDeleteBlock,
  onReorderChildBlocks,
  sectionId,
  depth = 0,
  parentId,
  selectedBlockId,
  onSelectBlock
}: EnhancedBlockItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isContainer = block.type === 'container';
  const hasChildren = isContainer && block.blocks && block.blocks.length > 0;

  // Sensors for drag and drop
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
    
    if (!over || !onReorderChildBlocks) return;
    
    const activeId = active.id.toString().replace('block-', '');
    const overId = over.id.toString().replace('block-', '');
    
    if (activeId !== overId && block.blocks) {
      const oldIndex = block.blocks.findIndex(b => b.id === activeId);
      const newIndex = block.blocks.findIndex(b => b.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(block.blocks, oldIndex, newIndex).map(b => b.id);
        onReorderChildBlocks(block.id, newOrder);
      }
    }
  };

  return (
    <div className="relative">
      {/* Main block item */}
      {isContainer ? (
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
          {/* Expand/Collapse */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronRight className={cn(
              "h-2.5 w-2.5 transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
          
          {/* Container icon */}
          {isExpanded ? (
            <FolderOpen className="h-2.5 w-2.5 flex-shrink-0 text-[var(--nuvi-text-muted)]" />
          ) : (
            <Folder className="h-2.5 w-2.5 flex-shrink-0 text-[var(--nuvi-text-muted)]" />
          )}
          
          {/* Block Title */}
          <span className="text-xs font-medium flex-1 truncate">
            Container
            {hasChildren && (
              <span className="text-[var(--nuvi-text-muted)] ml-1">({block.blocks!.length})</span>
            )}
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
                onDeleteBlock(sectionId, block.id);
              }}
              className="p-0.5 rounded-md text-[var(--nuvi-text-muted)] hover:text-red-600"
            >
              <Trash2 className="h-2 w-2" />
            </button>
          </div>
        </div>
      ) : (
        <SortableBlock
          block={block}
          isSelected={isSelected}
          onSelect={onSelect}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          sectionId={sectionId}
          depth={depth}
        />
      )}

      {/* Container children */}
      {isContainer && isExpanded && (
        <div className={cn(
          "ml-4 mt-1 mb-1 border-l-2 pl-2 transition-colors",
          "border-gray-200"
        )}>
          {block.blocks && block.blocks.length > 0 ? (
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleChildDragEnd}
              sensors={sensors}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={block.blocks.map(b => `block-${b.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {block.blocks.map((childBlock) => (
                    <EnhancedBlockItem
                      key={childBlock.id}
                      block={childBlock}
                      isSelected={selectedBlockId === childBlock.id}
                      onSelect={() => onSelectBlock?.(childBlock.id)}
                      onUpdateBlock={onUpdateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onReorderChildBlocks={onReorderChildBlocks}
                      sectionId={sectionId}
                      depth={depth + 1}
                      parentId={block.id}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={onSelectBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-xs text-gray-400 italic py-2 px-2">
              Drag blocks here...
            </div>
          )}
        </div>
      )}
    </div>
  );
}