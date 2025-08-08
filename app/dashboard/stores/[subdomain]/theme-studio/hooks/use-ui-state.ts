import { useState, useCallback } from 'react';

export type PanelId = 'sections' | 'inspector' | null;
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

export interface UIState {
  activePanelId: PanelId;
  sidebarVisible: boolean;
  showPageSelector: boolean;
  showHistoryPanel: boolean;
  showThemeSettings: boolean;
  showDebugPanel: boolean;
  selectorMode: boolean;
  previewDevice: PreviewDevice;
  previewRefreshKey: number;
  isImagePickerOpen: boolean;
}

export interface UIActions {
  setActivePanelId: (panelId: PanelId) => void;
  setSidebarVisible: (visible: boolean) => void;
  setShowPageSelector: (show: boolean) => void;
  setShowHistoryPanel: (show: boolean) => void;
  setShowThemeSettings: (show: boolean) => void;
  setShowDebugPanel: (show: boolean) => void;
  setSelectorMode: (mode: boolean) => void;
  toggleSelectorMode: () => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  setPreviewRefreshKey: (value: number | ((prev: number) => number)) => void;
  refreshPreview: () => void;
  toggleSidebar: () => void;
  toggleHistoryPanel: () => void;
  toggleThemeSettings: () => void;
  toggleDebugPanel: () => void;
  openInspector: () => void;
  closePanels: () => void;
  setIsImagePickerOpen: (isOpen: boolean) => void;
}

export function useUIState(): UIState & UIActions {
  const [activePanelId, setActivePanelId] = useState<PanelId>('sections');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectorMode, setSelectorMode] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

  const refreshPreview = useCallback(() => {
    setPreviewRefreshKey(prev => prev + 1);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarVisible(prev => !prev);
  }, []);

  const toggleHistoryPanel = useCallback(() => {
    setShowHistoryPanel(prev => !prev);
  }, []);

  const toggleThemeSettings = useCallback(() => {
    setShowThemeSettings(prev => !prev);
    // When opening theme settings, switch to inspector panel
    if (!showThemeSettings) {
      setActivePanelId('inspector');
    }
  }, [showThemeSettings]);

  const toggleDebugPanel = useCallback(() => {
    setShowDebugPanel(prev => !prev);
  }, []);

  const toggleSelectorMode = useCallback(() => {
    setSelectorMode(prev => !prev);
  }, []);

  const openInspector = useCallback(() => {
    setActivePanelId('inspector');
  }, []);

  const closePanels = useCallback(() => {
    setActivePanelId(null);
    setShowPageSelector(false);
    setShowHistoryPanel(false);
    setShowThemeSettings(false);
  }, []);

  return {
    // State
    activePanelId,
    sidebarVisible,
    showPageSelector,
    showHistoryPanel,
    showThemeSettings,
    showDebugPanel,
    selectorMode,
    previewDevice,
    previewRefreshKey,
    isImagePickerOpen,
    
    // Actions
    setActivePanelId,
    setSidebarVisible,
    setShowPageSelector,
    setShowHistoryPanel,
    setShowThemeSettings,
    setShowDebugPanel,
    setSelectorMode,
    toggleSelectorMode,
    setPreviewDevice,
    setPreviewRefreshKey,
    refreshPreview,
    toggleSidebar,
    toggleHistoryPanel,
    toggleThemeSettings,
    toggleDebugPanel,
    openInspector,
    closePanels,
    setIsImagePickerOpen,
  };
}