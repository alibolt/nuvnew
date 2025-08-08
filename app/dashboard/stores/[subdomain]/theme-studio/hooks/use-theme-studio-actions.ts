import { useCallback } from 'react';
import { useThemeStudio } from '../context/theme-studio-context';
import { Section, Page } from '../types';

/**
 * Custom hook that provides all Theme Studio actions
 * This consolidates all the separate action hooks into one place
 */
export function useThemeStudioActions() {
  const { state, dispatch } = useThemeStudio();

  // Section actions
  const setSections = useCallback((sections: Section[]) => {
    dispatch({ type: 'SET_SECTIONS', payload: sections });
  }, [dispatch]);

  const selectSection = useCallback((section: Section | null) => {
    dispatch({ type: 'SELECT_SECTION', payload: section });
  }, [dispatch]);

  const selectSectionById = useCallback((sectionId: string) => {
    const section = state.sections.find(s => s.id === sectionId);
    if (section) {
      dispatch({ type: 'SELECT_SECTION', payload: section });
    }
  }, [state.sections, dispatch]);

  const selectBlock = useCallback((blockId: string | null) => {
    dispatch({ type: 'SELECT_BLOCK', payload: blockId });
  }, [dispatch]);

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { sectionId, updates } });
  }, [dispatch]);

  const addSection = useCallback((section: Section) => {
    dispatch({ type: 'ADD_SECTION', payload: section });
  }, [dispatch]);

  const removeSection = useCallback((sectionId: string) => {
    dispatch({ type: 'REMOVE_SECTION', payload: sectionId });
  }, [dispatch]);

  const reorderSections = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_SECTIONS', payload: { fromIndex, toIndex } });
  }, [dispatch]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [dispatch]);

  // UI actions
  const setActivePanel = useCallback((panelId: 'sections' | 'inspector' | null) => {
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: panelId });
  }, [dispatch]);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, [dispatch]);

  const toggleHistoryPanel = useCallback(() => {
    dispatch({ type: 'TOGGLE_HISTORY_PANEL' });
  }, [dispatch]);

  const toggleThemeSettings = useCallback(() => {
    dispatch({ type: 'TOGGLE_THEME_SETTINGS' });
  }, [dispatch]);

  const openInspector = useCallback(() => {
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'inspector' });
  }, [dispatch]);

  const setPreviewDevice = useCallback((device: 'desktop' | 'tablet' | 'mobile') => {
    dispatch({ type: 'SET_PREVIEW_DEVICE', payload: device });
  }, [dispatch]);

  const refreshPreview = useCallback(() => {
    dispatch({ type: 'REFRESH_PREVIEW' });
  }, [dispatch]);

  // Editor actions
  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, [dispatch]);

  const startSaving = useCallback(() => {
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_DRAFT', payload: true });
  }, [dispatch]);

  const finishSaving = useCallback(() => {
    dispatch({ type: 'SET_SAVING', payload: false });
    dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
  }, [dispatch]);

  const startPublishing = useCallback(() => {
    dispatch({ type: 'SET_PUBLISHING', payload: true });
  }, [dispatch]);

  const finishPublishing = useCallback(() => {
    dispatch({ type: 'SET_PUBLISHING', payload: false });
    dispatch({ type: 'SET_DRAFT', payload: false });
  }, [dispatch]);

  // Page actions
  const setPages = useCallback((pages: Page[]) => {
    dispatch({ type: 'SET_PAGES', payload: pages });
  }, [dispatch]);

  const setSelectedPage = useCallback((pageId: string) => {
    dispatch({ type: 'SET_SELECTED_PAGE', payload: pageId });
  }, [dispatch]);

  const selectHomePage = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_PAGE', payload: 'homepage' });
  }, [dispatch]);

  // Drag actions
  const startDragging = useCallback((section: Section) => {
    dispatch({ type: 'START_DRAGGING', payload: section });
  }, [dispatch]);

  const stopDragging = useCallback(() => {
    dispatch({ type: 'STOP_DRAGGING' });
  }, [dispatch]);

  // Computed values
  const hasUnsavedChanges = state.isDraft;
  const canPublish = state.isDraft && !state.saving && !state.isPublishing;
  const isWorking = state.saving || state.isPublishing || state.loading;
  const hasSelection = state.selectedSection !== null;
  const selectedSectionIndex = state.selectedSection 
    ? state.sections.findIndex(s => s.id === state.selectedSection?.id)
    : -1;

  return {
    // State
    ...state,
    
    // Computed
    hasUnsavedChanges,
    canPublish,
    isWorking,
    hasSelection,
    selectedSectionIndex,
    
    // Section actions
    setSections,
    selectSection,
    selectSectionById,
    selectBlock,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    clearSelection,
    
    // UI actions
    setActivePanel,
    toggleSidebar,
    toggleHistoryPanel,
    toggleThemeSettings,
    openInspector,
    setPreviewDevice,
    refreshPreview,
    
    // Editor actions
    setLoading,
    startSaving,
    finishSaving,
    startPublishing,
    finishPublishing,
    
    // Page actions
    setPages,
    setSelectedPage,
    selectHomePage,
    
    // Drag actions
    startDragging,
    stopDragging
  };
}