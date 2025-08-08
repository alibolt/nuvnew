'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Block, Section, Page } from '../types';

// State types
interface ThemeStudioState {
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
  pages: Page[];
  selectedPage: string;
  
  // Drag
  draggedSection: Section | null;
  isDragging: boolean;
}

// Action types
type ThemeStudioAction =
  | { type: 'SET_SECTIONS'; payload: Section[] }
  | { type: 'SELECT_SECTION'; payload: Section | null }
  | { type: 'SELECT_BLOCK'; payload: string | null }
  | { type: 'UPDATE_SECTION'; payload: { sectionId: string; updates: Partial<Section> } }
  | { type: 'ADD_SECTION'; payload: Section }
  | { type: 'REMOVE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: { fromIndex: number; toIndex: number } }
  | { type: 'SET_ACTIVE_PANEL'; payload: 'sections' | 'inspector' | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_HISTORY_PANEL' }
  | { type: 'TOGGLE_THEME_SETTINGS' }
  | { type: 'SET_PREVIEW_DEVICE'; payload: 'desktop' | 'tablet' | 'mobile' }
  | { type: 'REFRESH_PREVIEW' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_PUBLISHING'; payload: boolean }
  | { type: 'SET_DRAFT'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: Date }
  | { type: 'SET_PAGES'; payload: Page[] }
  | { type: 'SET_SELECTED_PAGE'; payload: string }
  | { type: 'START_DRAGGING'; payload: Section }
  | { type: 'STOP_DRAGGING' }
  | { type: 'CLEAR_SELECTION' };

// Initial state
const initialState: ThemeStudioState = {
  sections: [],
  selectedSection: null,
  selectedBlockId: null,
  currentTemplate: null,
  activeSectionId: null,
  activePanelId: 'sections',
  sidebarVisible: true,
  showPageSelector: false,
  showHistoryPanel: false,
  showThemeSettings: false,
  showDebugPanel: false,
  selectorMode: false,
  previewDevice: 'desktop',
  previewRefreshKey: 0,
  isDraft: false,
  saving: false,
  isPublishing: false,
  loading: false,
  lastSaved: undefined,
  currentTheme: 'commerce',
  pages: [],
  selectedPage: 'homepage',
  draggedSection: null,
  isDragging: false,
};

// Reducer
function themeStudioReducer(state: ThemeStudioState, action: ThemeStudioAction): ThemeStudioState {
  switch (action.type) {
    case 'SET_SECTIONS':
      return { ...state, sections: action.payload };
      
    case 'SELECT_SECTION':
      return { 
        ...state, 
        selectedSection: action.payload,
        selectedBlockId: null,
        activeSectionId: action.payload?.id || null,
        activePanelId: action.payload ? 'inspector' : state.activePanelId,
        showThemeSettings: false
      };
      
    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.payload };
      
    case 'UPDATE_SECTION': {
      const { sectionId, updates } = action.payload;
      const updatedSections = state.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      );
      return {
        ...state,
        sections: updatedSections,
        selectedSection: state.selectedSection?.id === sectionId
          ? { ...state.selectedSection, ...updates }
          : state.selectedSection
      };
    }
    
    case 'ADD_SECTION':
      return { ...state, sections: [...state.sections, action.payload] };
      
    case 'REMOVE_SECTION': {
      const filteredSections = state.sections.filter(s => s.id !== action.payload);
      return {
        ...state,
        sections: filteredSections,
        selectedSection: state.selectedSection?.id === action.payload ? null : state.selectedSection,
        selectedBlockId: null,
        activeSectionId: state.activeSectionId === action.payload ? null : state.activeSectionId
      };
    }
    
    case 'REORDER_SECTIONS': {
      const { fromIndex, toIndex } = action.payload;
      const newSections = [...state.sections];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      
      // Update positions
      const updatedSections = newSections.map((section, index) => ({
        ...section,
        position: index
      }));
      
      return { ...state, sections: updatedSections };
    }
    
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanelId: action.payload };
      
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarVisible: !state.sidebarVisible };
      
    case 'TOGGLE_HISTORY_PANEL':
      return { ...state, showHistoryPanel: !state.showHistoryPanel };
      
    case 'TOGGLE_THEME_SETTINGS':
      return { ...state, showThemeSettings: !state.showThemeSettings };
      
    case 'SET_PREVIEW_DEVICE':
      return { ...state, previewDevice: action.payload };
      
    case 'REFRESH_PREVIEW':
      return { ...state, previewRefreshKey: state.previewRefreshKey + 1 };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_SAVING':
      return { ...state, saving: action.payload };
      
    case 'SET_PUBLISHING':
      return { ...state, isPublishing: action.payload };
      
    case 'SET_DRAFT':
      return { ...state, isDraft: action.payload };
      
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
      
    case 'SET_PAGES':
      return { ...state, pages: action.payload };
      
    case 'SET_SELECTED_PAGE':
      return { ...state, selectedPage: action.payload };
      
    case 'START_DRAGGING':
      return { ...state, draggedSection: action.payload, isDragging: true };
      
    case 'STOP_DRAGGING':
      return { ...state, draggedSection: null, isDragging: false };
      
    case 'CLEAR_SELECTION':
      return { 
        ...state, 
        selectedSection: null,
        selectedBlockId: null,
        activeSectionId: null,
        activePanelId: 'sections'
      };
      
    default:
      return state;
  }
}

// Context
interface ThemeStudioContextType {
  state: ThemeStudioState;
  dispatch: React.Dispatch<ThemeStudioAction>;
}

const ThemeStudioContext = createContext<ThemeStudioContextType | undefined>(undefined);

// Provider
export function ThemeStudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(themeStudioReducer, initialState);
  
  return (
    <ThemeStudioContext.Provider value={{ state, dispatch }}>
      {children}
    </ThemeStudioContext.Provider>
  );
}

// Hook
export function useThemeStudio() {
  const context = useContext(ThemeStudioContext);
  if (!context) {
    throw new Error('useThemeStudio must be used within a ThemeStudioProvider');
  }
  return context;
}

// Selector hooks for convenience
export function useThemeStudioState() {
  const { state } = useThemeStudio();
  return state;
}

export function useThemeStudioDispatch() {
  const { dispatch } = useThemeStudio();
  return dispatch;
}