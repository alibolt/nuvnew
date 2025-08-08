'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Trash2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  type: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface SectionItemProps {
  section: Section;
  isSelected: boolean;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}

function SectionItem({ section, isSelected, onSelect, onToggleVisibility, onDelete }: SectionItemProps) {
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
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer transition-all hover:bg-gray-100",
        isSelected && "ring-2 ring-blue-500 bg-blue-50 border-blue-200",
        isDragging && "opacity-50 shadow-lg",
        !section.enabled && "opacity-60"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-900">{section.title}</h4>
          <p className="text-xs text-gray-500 capitalize">
            {section.type.replace(/-/g, ' ')}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
          >
            {section.enabled ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 rounded text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionListProps {
  sections: Section[];
  selectedSection: Section | null;
  onSelectSection: (section: Section) => void;
  onUpdateSection: (sectionId: string, updates: Partial<Section>) => void;
  onDeleteSection: (sectionId: string) => void;
}

export function SectionList({
  sections,
  selectedSection,
  onSelectSection,
  onUpdateSection,
  onDeleteSection,
}: SectionListProps) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-1">Homepage Sections</h3>
        <p className="text-xs text-muted-foreground">
          Drag to reorder, click to edit
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No sections yet</p>
          <p className="text-xs mt-1">Add your first section to get started</p>
        </div>
      ) : (
        <div>
          {sections.map((section) => (
            <SectionItem
              key={section.id}
              section={section}
              isSelected={selectedSection?.id === section.id}
              onSelect={() => onSelectSection(section)}
              onToggleVisibility={() => 
                onUpdateSection(section.id, { enabled: !section.enabled })
              }
              onDelete={() => onDeleteSection(section.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}