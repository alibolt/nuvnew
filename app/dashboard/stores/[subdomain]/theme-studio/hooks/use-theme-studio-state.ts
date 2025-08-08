import { useCallback, useMemo } from 'react';
import { useSectionsState, Section } from './use-sections-state';
import { useUIState } from './use-ui-state';
import { useEditorState } from './use-editor-state';
import { usePagesState } from './use-pages-state';
import { useDragState } from './use-drag-state';

export interface ThemeStudioState {
  // Sections
  sections: Section[];
  selectedSection: Section | null;
  selectedBlockId: string | null;
  currentTemplate: any;
  activeSectionId: string | null;
  
  // UI
  activePanelId: 'sections' | 'inspector' | null;
  sidebarVisible: boolean;
  showPageSelector: boolean;
  showHistoryPanel: boolean;
  showThemeSettings: boolean;
  showDebugPanel: boolean;
  selectorMode: boolean;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  previewRefreshKey: number;
  
  // Editor
  isDraft: boolean;
  saving: boolean;
  isPublishing: boolean;
  loading: boolean;
  lastSaved: Date | undefined;
  currentTheme: string;
  
  // Pages
  pages: any[];
  selectedPage: string;
  
  // Drag
  draggedSection: Section | null;
  isDragging: boolean;
}

export interface ThemeStudioActions {
  // Section actions
  setSections: (sections: Section[]) => void;
  setSelectedSection: (section: Section | null) => void;
  setSelectedBlockId: (blockId: string | null) => void;
  selectSection: (sectionId: string) => void;
  clearSelection: () => void;
  updateSectionInState: (sectionId: string, updates: Partial<Section>) => void;
  addSectionToState: (section: Section) => void;
  removeSectionFromState: (sectionId: string) => void;
  reorderSectionsInState: (fromIndex: number, toIndex: number) => void;
  
  // UI actions
  setActivePanelId: (panelId: 'sections' | 'inspector' | null) => void;
  toggleSidebar: () => void;
  toggleHistoryPanel: () => void;
  openInspector: () => void;
  setPreviewDevice: (device: 'desktop' | 'tablet' | 'mobile') => void;
  refreshPreview: () => void;
  
  // Editor actions
  startSaving: () => void;
  finishSaving: () => void;
  startPublishing: () => void;
  finishPublishing: () => void;
  setLoading: (loading: boolean) => void;
  
  // Page actions
  setSelectedPage: (pageId: string) => void;
  selectHomePage: () => void;
  
  // Drag actions
  startDragging: (section: Section) => void;
  stopDragging: () => void;
}

export interface ThemeStudioComputed {
  hasUnsavedChanges: boolean;
  canPublish: boolean;
  isWorking: boolean;
  saveStatus: 'saved' | 'saving' | 'draft' | 'error';
  hasSelection: boolean;
  selectedSectionIndex: number;
}

export function useThemeStudioState() {
  // Individual state hooks
  const sectionsState = useSectionsState();
  const uiState = useUIState();
  const editorState = useEditorState();
  const pagesState = usePagesState();
  const dragState = useDragState();

  // Enhanced actions that coordinate between states
  const enhancedActions = {
    selectSection: useCallback((sectionId: string) => {
      sectionsState.selectSection(sectionId);
      uiState.openInspector();
      // Close theme settings when selecting a section
      uiState.setShowThemeSettings(false);
    }, [sectionsState.selectSection, uiState.openInspector, uiState.setShowThemeSettings]),

    clearSelection: useCallback(() => {
      sectionsState.clearSelection();
      uiState.setActivePanelId('sections');
    }, [sectionsState.clearSelection, uiState.setActivePanelId]),

    startSectionUpdate: useCallback(() => {
      editorState.startSaving();
      editorState.setIsDraft(true);
    }, [editorState.startSaving, editorState.setIsDraft]),

    finishSectionUpdate: useCallback(() => {
      editorState.finishSaving();
    }, [editorState.finishSaving]),
  };

  // Computed state
  const computed = useMemo(() => ({
    hasSelection: sectionsState.selectedSection !== null,
    selectedSectionIndex: sectionsState.selectedSection 
      ? sectionsState.sections.findIndex(s => s.id === sectionsState.selectedSection?.id)
      : -1,
  }), [sectionsState.selectedSection, sectionsState.sections]);

  return {
    // Combined state
    ...sectionsState,
    ...uiState,
    ...editorState,
    ...pagesState,
    ...dragState,
    ...computed,
    
    // Enhanced actions
    ...enhancedActions,
  };
}