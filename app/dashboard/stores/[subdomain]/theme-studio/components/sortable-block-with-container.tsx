'use client';

import React, { useState, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Trash2, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockType } from '@/lib/block-types';
import { Block } from '../types';

interface SortableBlockWithContainerProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateBlock: (blockId: string, updates: any) => void;
  onDeleteBlock: (sectionId: string, blockId: string) => void;
  onDropInContainer?: (containerId: string, draggedBlockId: string) => void;
  onSelectBlock?: (blockId: string) => void;
  onAddBlock?: (containerId: string, buttonElement?: HTMLElement) => void;
  sectionId: string;
  isNested?: boolean;
  depth?: number;
}

export const SortableBlockWithContainer = memo(function SortableBlockWithContainer({ 
  block, 
  isSelected, 
  onSelect, 
  onUpdateBlock, 
  onDeleteBlock,
  onDropInContainer,
  onSelectBlock,
  onAddBlock,
  sectionId,
  isNested = false,
  depth = 0,
  selectedBlockId
}: SortableBlockWithContainerProps & { selectedBlockId?: string }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isContainer = block.type === 'container' || block.type === 'icon-group' || block.type === 'mega-menu' || block.type === 'mega-menu-column';
  // Check both blocks and settings.blocks for child blocks
  // IMPORTANT: Check array length, not just existence, because empty arrays are truthy
  let childBlocks = (block.blocks && block.blocks.length > 0) 
    ? block.blocks 
    : (block.settings?.blocks || []);
  
  
  // Sort child blocks by position
  if (childBlocks.length > 0) {
    childBlocks = [...childBlocks].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
  }
  
  const hasChildren = isContainer && childBlocks.length > 0;
  
  
  // Sortable setup
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `block-${block.id}`,
    data: {
      type: 'block',
      blockId: block.id,
      isContainer,
      depth
    }
  });

  // Droppable setup for containers
  const {
    isOver,
    setNodeRef: setDroppableRef
  } = useDroppable({
    id: `container-drop-${block.id}`,
    disabled: !isContainer || !isExpanded,
    data: {
      type: 'container',
      containerId: block.id,
      accepts: ['block']
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const blockType = getBlockType(block.type);
  if (!blockType) {
    console.error('[SortableBlockWithContainer] Block type not found:', block.type, 'for block:', block.id);
    return null;
  }

  return (
    <>
      <div
        ref={setSortableRef}
        style={style}
        {...attributes}
        className={cn(
          "relative flex items-center gap-1.5 py-1.5 cursor-pointer rounded-md transition-colors group",
          isSelected 
            ? "bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-primary)]" 
            : "hover:bg-[var(--nuvi-primary-lighter)] text-[var(--nuvi-text-secondary)]",
          isDragging && "opacity-50",
          isNested ? `pr-2` : "px-2",
          // Dynamic left padding based on depth
          depth === 1 && "pl-6",
          depth === 2 && "pl-10",
          depth >= 3 && "pl-14"
        )}
        onClick={(e) => {
          // console.log(`[SortableBlockWithContainer] Click on block ${block.id}, type: ${block.type}, depth: ${depth}`);
          // For parent blocks, use onSelectBlock if available, otherwise use onSelect
          if (onSelectBlock) {
            onSelectBlock(block.id);
          } else {
            onSelect();
          }
        }}
      >
        {/* Nested indicator */}
        {isNested && !isContainer && (
          <div className="w-3 h-3 mr-1 flex items-center justify-center">
            <div className="w-1 h-1 bg-[var(--nuvi-text-muted)] rounded-full"></div>
          </div>
        )}
        
        {/* Expand/Collapse for containers */}
        {isContainer && (
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
        <blockType.icon className="h-2.5 w-2.5 flex-shrink-0" />

        {/* Block Title */}
        <span className="text-xs font-medium flex-1 truncate" title={blockType.name}>
          {blockType.name}
          {hasChildren && <span className="text-[var(--nuvi-text-muted)] ml-1">({childBlocks.length})</span>}
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

      {/* Container drop zone and children */}
      {isContainer && isExpanded && (
        <div 
          ref={setDroppableRef}
          className={cn(
            "ml-8 mt-1 border-l-2 pl-2 min-h-[40px] transition-all relative",
            isOver ? "border-blue-400 bg-blue-50/50" : "border-gray-200"
          )}
          style={{ maxHeight: '400px', overflowY: 'auto' }}
        >
          {/* Drop indicator overlay */}
          {isOver && (
            <div className="absolute inset-0 bg-blue-100/30 rounded pointer-events-none z-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-blue-500 animate-pulse" />
            </div>
          )}
          
          {childBlocks && childBlocks.length > 0 ? (
            <>
              <div className="relative z-0">
                {childBlocks.map((childBlock, index) => (
                  <SortableBlockWithContainer
                    key={childBlock.id || `${block.id}-child-${index}`}
                    block={childBlock}
                    isSelected={selectedBlockId === childBlock.id}
                    onSelect={() => {
                      // console.log(`[SortableBlockWithContainer] Nested block onSelect called for: ${childBlock.id}`);
                      // console.log(`[SortableBlockWithContainer] onSelectBlock function exists: ${!!onSelectBlock}`);
                      if (onSelectBlock) {
                        onSelectBlock(childBlock.id);
                      }
                      // If onSelectBlock is not provided, just use the regular onSelect
                      else if (onSelect) {
                        onSelect();
                      }
                    }}
                    onUpdateBlock={onUpdateBlock}
                    onDeleteBlock={onDeleteBlock}
                    onDropInContainer={onDropInContainer}
                    onSelectBlock={onSelectBlock}
                    onAddBlock={onAddBlock}
                    sectionId={sectionId}
                    isNested={true}
                    depth={depth + 1}
                    selectedBlockId={selectedBlockId}
                  />
                ))}
              </div>
              {/* Add Block button after existing blocks */}
              {onAddBlock && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBlock(block.id, e.currentTarget);
                  }}
                  className="flex items-center gap-1 px-2 py-1 w-full text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-dashed border-gray-300 hover:border-blue-400 transition-all mt-2"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Block</span>
                </button>
              )}
            </>
          ) : (
            <div>
              <div className={cn(
                "text-xs text-gray-400 italic py-2 px-2 text-center border-2 border-dashed rounded transition-all mb-2",
                isOver ? "border-blue-400 bg-blue-50 text-blue-600 font-medium" : "border-gray-300"
              )}>
                {isOver ? "Drop block here" : "Empty container"}
              </div>
              {/* Add Block button for empty containers */}
              {onAddBlock && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBlock(block.id, e.currentTarget);
                  }}
                  className="flex items-center gap-1 px-2 py-1 w-full text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-dashed border-gray-300 hover:border-blue-400 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Block</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
});