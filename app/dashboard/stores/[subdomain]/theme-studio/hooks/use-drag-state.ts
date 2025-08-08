import { useState, useCallback } from 'react';
import { Section } from './use-sections-state';

export interface DragState {
  draggedSection: Section | null;
  isDragging: boolean;
}

export interface DragActions {
  setDraggedSection: (section: Section | null) => void;
  startDragging: (section: Section) => void;
  stopDragging: () => void;
}

export function useDragState(): DragState & DragActions {
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);

  const startDragging = useCallback((section: Section) => {
    setDraggedSection(section);
  }, []);

  const stopDragging = useCallback(() => {
    setDraggedSection(null);
  }, []);

  const isDragging = draggedSection !== null;

  return {
    // State
    draggedSection,
    isDragging,
    
    // Actions
    setDraggedSection,
    startDragging,
    stopDragging,
  };
}