'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Trash2 } from 'lucide-react';

interface SortableMenuItemProps {
  item: {
    id: string;
    label: string;
    link: string;
    target: '_self' | '_blank';
  };
  index: number;
  updateMenuItem: (index: number, field: string, value: string) => void;
  removeMenuItem: (index: number) => void;
}

export function SortableMenuItem({ item, index, updateMenuItem, removeMenuItem }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="nuvi-border nuvi-rounded-lg nuvi-p-md nuvi-bg-muted/30"
    >
      <div className="nuvi-flex nuvi-items-start nuvi-gap-sm">
        <div
          {...attributes}
          {...listeners}
          className="nuvi-mt-sm nuvi-cursor-grab"
        >
          <GripVertical className="h-4 w-4 nuvi-text-muted" />
        </div>
        <div className="nuvi-flex-1 nuvi-space-y-sm">
          <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-sm">
            <div className="nuvi-form-group">
              <label className="nuvi-label nuvi-text-xs">Label</label>
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                className="nuvi-input nuvi-input-sm"
                placeholder="Menu item label"
              />
            </div>
            <div className="nuvi-form-group">
              <label className="nuvi-label nuvi-text-xs">Link</label>
              <input
                type="text"
                value={item.link}
                onChange={(e) => updateMenuItem(index, 'link', e.target.value)}
                className="nuvi-input nuvi-input-sm"
                placeholder="/path or https://..."
              />
            </div>
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
            <label className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-text-xs nuvi-cursor-pointer">
              <input
                type="checkbox"
                checked={item.target === '_blank'}
                onChange={(e) => updateMenuItem(index, 'target', e.target.checked ? '_blank' : '_self')}
                className="nuvi-checkbox nuvi-checkbox-xs"
              />
              <ExternalLink className="h-3 w-3" />
              Open in new tab
            </label>
            <button
              onClick={() => removeMenuItem(index)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs nuvi-text-destructive hover:nuvi-text-destructive nuvi-ml-auto"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}