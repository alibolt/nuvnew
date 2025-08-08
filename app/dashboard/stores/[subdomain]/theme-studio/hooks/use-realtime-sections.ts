import { useEffect, useCallback, useRef } from 'react';
import { Section } from '../types';

interface RealtimeUpdate {
  type: 'SECTION_UPDATE' | 'SECTION_ADD' | 'SECTION_DELETE' | 'SECTIONS_REORDER' | 'BLOCK_UPDATE' | 'BLOCK_ADD' | 'BLOCK_DELETE' | 'BLOCK_REORDER';
  sectionId?: string;
  section?: Section;
  sections?: Section[];
  settings?: any;
  position?: number;
  enabled?: boolean;
  // Block-specific fields
  blockId?: string;
  block?: any;
  blockIds?: string[];
}

export function useRealtimeSections(
  previewFrameRef: React.RefObject<HTMLIFrameElement>,
  sections: Section[]
) {
  const pendingUpdatesRef = useRef<RealtimeUpdate[]>([]);

  const sendToPreview = useCallback((update: RealtimeUpdate) => {
    // console.log('[useRealtimeSections] sendToPreview called:', update);
    // Manual iframe state check
    const frameRef = previewFrameRef.current;
    const frameState = {
      hasFrame: !!frameRef,
      hasContentWindow: !!frameRef?.contentWindow,
      frameType: typeof frameRef
    };
    
    // console.log('[useRealtimeSections] Frame state:', frameState);
    
    const attemptSend = (delayMs = 0) => {
      setTimeout(() => {
        // Access contentWindow from the ref object
        const contentWindow = previewFrameRef.current?.contentWindow;
        if (!contentWindow) {
          // console.log('[useRealtimeSections] Preview frame not ready, contentWindow not available');
          return;
        }

        try {
          // console.log('[useRealtimeSections] Sending message to preview frame:', {
          //   type: 'THEME_STUDIO_REALTIME',
          //   update
          // });
          contentWindow.postMessage({
            type: 'THEME_STUDIO_REALTIME',
            update
          }, '*');
          // console.log('[useRealtimeSections] Message sent successfully to preview frame');
        } catch (error) {
          console.warn('[useRealtimeSections] Failed to send update to preview:', error);
        }
      }, delayMs);
    };
    
    // Access contentWindow from the ref object
    const contentWindow = previewFrameRef.current?.contentWindow;
    
    if (contentWindow) {
      // Frame is ready, send immediately
      attemptSend(0);
    } else {
      // Frame not ready, try after a delay
      // console.log('[useRealtimeSections] Frame not ready, will retry in 300ms');
      attemptSend(300);
    }
  }, [previewFrameRef]);

  // Keep a ref to current sections
  const sectionsRef = useRef(sections);
  useEffect(() => {
    sectionsRef.current = sections;
  }, [sections]);

  // Send initial sections when iframe loads
  const sendInitialSections = useCallback(() => {
    // console.log(`[useRealtimeSections] Sending initial sections:`, sectionsRef.current.length);
    // console.log(`[useRealtimeSections] Iframe state check:`, {
    //   hasFrame: !!previewFrameRef.current,
    //   hasContentWindow: !!previewFrameRef.current?.contentWindow,
    //   frameSrc: previewFrameRef.current?.src,
    //   readyState: previewFrameRef.current?.contentDocument?.readyState
    // });
    
    // Give iframe more time to be fully ready
    setTimeout(() => {
      // console.log(`[useRealtimeSections] Delayed iframe check:`, {
      //   hasFrame: !!previewFrameRef.current,
      //   hasContentWindow: !!previewFrameRef.current?.contentWindow,
      //   frameSrc: previewFrameRef.current?.src,
      //   readyState: previewFrameRef.current?.contentDocument?.readyState
      // });
      
      if (previewFrameRef.current?.contentWindow) {
        try {
          previewFrameRef.current.contentWindow.postMessage({
            type: 'THEME_STUDIO_REALTIME',
            update: {
              type: 'SECTIONS_REORDER',
              sections: sectionsRef.current
            }
          }, '*');
          
          // console.log(`[useRealtimeSections] Successfully sent initial sections`);
          
          // Send any pending updates directly (iframe is already confirmed ready)
          const pending = [...pendingUpdatesRef.current];
          pendingUpdatesRef.current = [];
          // console.log('[useRealtimeSections] Sending pending updates:', pending.length);
          pending.forEach(update => {
            try {
              // console.log('[useRealtimeSections] Sending pending update:', update);
              previewFrameRef.current!.contentWindow!.postMessage({
                type: 'THEME_STUDIO_REALTIME',
                update
              }, '*');
              // console.log('[useRealtimeSections] Pending update sent successfully');
            } catch (error) {
              console.warn('[useRealtimeSections] Failed to send pending update:', error);
            }
          });
        } catch (error) {
          console.warn(`[useRealtimeSections] Failed to send initial sections:`, error);
        }
      } else {
        // console.log(`[useRealtimeSections] Iframe still not ready after delay, fallback refresh disabled to prevent page refreshes`);
        // DISABLED: This was causing full page refreshes when iframe contentWindow was not available
        // const frameElement = previewFrameRef.current;
        // if (frameElement) {
        //   let currentSrc = frameElement.src;
        //   
        //   // If no src, try to build it from scratch
        //   if (!currentSrc) {
        //     const pathMatch = window.location.pathname.match(/\/stores\/([^\/]+)\//);
        //     if (pathMatch) {
        //       const subdomain = pathMatch[1];
        //       currentSrc = `/s/${subdomain}/preview`;
        //       console.log('[useRealtimeSections] Built fallback src for initial:', currentSrc);
        //     }
        //   }
        //   
        //   if (currentSrc) {
        //     try {
        //       const url = new URL(currentSrc, window.location.origin);
        //       url.searchParams.set('refresh', Date.now().toString());
        //       url.searchParams.set('initial', 'true');
        //       console.log('[useRealtimeSections] Forcing iframe refresh for initial sections:', url.toString());
        //       frameElement.src = url.toString();
        //     } catch (e) {
        //       const timestamp = Date.now();
        //       const separator = currentSrc.includes('?') ? '&' : '?';
        //       const newSrc = `${currentSrc}${separator}refresh=${timestamp}&initial=true`;
        //       console.log('[useRealtimeSections] Direct src change for initial sections:', newSrc);
        //       frameElement.src = newSrc;
        //     }
        //   }
        // }
      }
    }, 500); // Wait 500ms for iframe to be fully ready
  }, []);

  // Section update methods
  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    // Use immediate send for better real-time experience
    sendToPreview({
      type: 'SECTION_UPDATE',
      sectionId,
      settings: updates.settings,
      enabled: updates.enabled,
      position: updates.position,
      blocks: updates.blocks // Include blocks in the update
    });
  }, [sendToPreview]);

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

  const updateBlock = useCallback((sectionId: string, blockId?: string, block?: any) => {
    sendToPreview({
      type: 'BLOCK_UPDATE',
      sectionId,
      blockId,
      block
    });
  }, [sendToPreview]);

  const addBlock = useCallback((sectionId: string, block: any) => {
    // console.log('[useRealtimeSections] addBlock called:', { sectionId, block });
    sendToPreview({
      type: 'BLOCK_ADD',
      sectionId,
      block
    });
  }, [sendToPreview]);

  const deleteBlock = useCallback((sectionId: string, blockId: string) => {
    sendToPreview({
      type: 'BLOCK_DELETE',
      sectionId,
      blockId
    });
  }, [sendToPreview]);

  const reorderBlocks = useCallback((sectionId: string, blockIds: string[]) => {
    sendToPreview({
      type: 'BLOCK_REORDER',
      sectionId,
      blockIds
    });
  }, [sendToPreview]);

  return {
    updateSection,
    addSection,
    deleteSection,
    reorderSections,
    updateBlock,
    addBlock,
    deleteBlock,
    reorderBlocks,
    sendInitialSections
  };
}