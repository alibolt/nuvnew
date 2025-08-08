import { useEffect, useCallback, useRef } from 'react';

interface Section {
  id: string;
  type: string;
  sectionType: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface RealtimeUpdate {
  type: 'SECTION_UPDATE' | 'SECTION_ADD' | 'SECTION_DELETE' | 'SECTIONS_REORDER';
  sectionId?: string;
  section?: Section;
  sections?: Section[];
  settings?: any;
  position?: number;
  enabled?: boolean;
}

export function useRealtimeSections(
  previewFrameRef: React.RefObject<HTMLIFrameElement>,
  sections: Section[]
) {
  const pendingUpdatesRef = useRef<RealtimeUpdate[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const sendToPreview = useCallback((update: RealtimeUpdate) => {
    if (!previewFrameRef.current?.contentWindow) {
      // Store update for later when iframe is ready
      pendingUpdatesRef.current.push(update);
      return;
    }

    try {
      previewFrameRef.current.contentWindow.postMessage({
        type: 'THEME_STUDIO_REALTIME',
        update
      }, '*');
    } catch (error) {
      console.warn('Failed to send update to preview:', error);
    }
  }, [previewFrameRef]);

  const batchedSendToPreview = useCallback((update: RealtimeUpdate) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Add to pending updates
    pendingUpdatesRef.current.push(update);

    // Send batched updates after a longer delay for text inputs
    updateTimeoutRef.current = setTimeout(() => {
      const updates = [...pendingUpdatesRef.current];
      pendingUpdatesRef.current = [];

      // Optimize updates - remove duplicates and merge similar updates
      const optimizedUpdates = optimizeUpdates(updates);

      optimizedUpdates.forEach(sendToPreview);
    }, 800); // Increased to 800ms to reduce update frequency during typing
  }, [sendToPreview]);

  const optimizeUpdates = (updates: RealtimeUpdate[]): RealtimeUpdate[] => {
    const optimized: RealtimeUpdate[] = [];
    const sectionUpdates = new Map<string, RealtimeUpdate>();

    for (const update of updates) {
      if (update.type === 'SECTION_UPDATE' && update.sectionId) {
        // Merge multiple updates for the same section
        const existing = sectionUpdates.get(update.sectionId);
        if (existing && existing.type === 'SECTION_UPDATE') {
          sectionUpdates.set(update.sectionId, {
            ...existing,
            settings: { ...existing.settings, ...update.settings },
            enabled: update.enabled !== undefined ? update.enabled : existing.enabled,
            position: update.position !== undefined ? update.position : existing.position
          });
        } else {
          sectionUpdates.set(update.sectionId, update);
        }
      } else {
        // Non-mergeable updates (add, delete, reorder)
        optimized.push(update);
      }
    }

    // Add merged section updates
    optimized.push(...sectionUpdates.values());

    return optimized;
  };

  // Keep a ref to current sections
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Send initial sections when iframe loads
  const sendInitialSections = useCallback(() => {
    sendToPreview({
      type: 'SECTIONS_REORDER',
      sections: sectionsRef.current
    });

    // Send any pending updates
    const pending = [...pendingUpdatesRef.current];
    pendingUpdatesRef.current = [];
    pending.forEach(sendToPreview);
  }, [sendToPreview]);

  // Section update methods
  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    batchedSendToPreview({
      type: 'SECTION_UPDATE',
      sectionId,
      settings: updates.settings,
      enabled: updates.enabled,
      position: updates.position
    });
  }, [batchedSendToPreview]);

  const addSection = useCallback((section: Section) => {
    sendToPreview({
      type: 'SECTION_ADD',
      section
    });
  }, [sendToPreview]);

  const deleteSection = useCallback((sectionId: string) => {
    sendToPreview({
      type: 'SECTION_DELETE',
      sectionId
    });
  }, [sendToPreview]);

  const reorderSections = useCallback((newSections: Section[]) => {
    sendToPreview({
      type: 'SECTIONS_REORDER',
      sections: newSections
    });
  }, [sendToPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return {
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    sendInitialSections
  };
}