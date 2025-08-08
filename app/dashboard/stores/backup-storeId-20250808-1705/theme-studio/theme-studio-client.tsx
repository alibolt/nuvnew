'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';
import { 
  ArrowLeft, Save, Eye, EyeOff, Undo, Redo, 
  Monitor, Tablet, Smartphone, Plus, Settings2,
  Palette, Type, Layout, Sparkles, X, Check,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react';
import { SectionList } from './components/section-list';
import { SectionSettings } from './components/section-settings';
import { ThemeSettingsV2 } from './components/theme-settings-v2';
import { AddSectionModal } from './components/add-section-modal';
import { PreviewFrame } from './components/preview-frame';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Section {
  id: string;
  type: string;
  title: string;
  settings: any;
  enabled: boolean;
  position: number;
}

interface ThemeStudioClientProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export function ThemeStudioClient({ store }: ThemeStudioClientProps) {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [activeTab, setActiveTab] = useState<'sections' | 'theme'>('sections');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [showAddSection, setShowAddSection] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [draggedSection, setDraggedSection] = useState<Section | null>(null);
  const [history, setHistory] = useState<Section[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [themeSettings, setThemeSettings] = useState({
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#8B9F7E',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      text: '#000000',
      textMuted: '#666666',
      textLight: '#999999',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    typography: {
      headingFont: "'Playfair Display', serif",
      bodyFont: "'Inter', sans-serif",
      baseFontSize: 16,
      fontSize: {
        xs: 0.75,
        sm: 0.875,
        base: 1,
        lg: 1.125,
        xl: 1.25,
        '2xl': 1.5,
        '3xl': 1.875,
        '4xl': 2.25,
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    spacing: {
      sectionGap: 80,
      containerPadding: 20,
      sectionPadding: {
        mobile: 3,
        tablet: 4,
        desktop: 5,
      },
      container: {
        maxWidth: 1280,
        padding: 1,
      },
      componentGap: {
        sm: 1,
        md: 2,
        lg: 3,
      },
    },
    buttons: {
      style: 'square',
      hoverEffect: 'darken',
      size: {
        sm: {
          padding: '0.5rem 1rem',
          fontSize: 0.875,
        },
        md: {
          padding: '0.75rem 1.5rem',
          fontSize: 1,
        },
        lg: {
          padding: '1rem 2rem',
          fontSize: 1.125,
        },
      },
    },
    layout: {
      type: 'full-width',
      borderRadius: {
        none: 0,
        sm: 0.125,
        md: 0.375,
        lg: 0.5,
        xl: 0.75,
      },
    },
    animations: {
      sectionAnimation: 'fade',
      duration: 'normal',
      transitionDuration: 300,
      easingFunction: 'ease-in-out',
    },
    header: {
      style: 'solid',
      sticky: true,
      height: {
        mobile: 60,
        desktop: 80,
      },
      announcement: {
        enabled: false,
        text: '',
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
      },
    },
    footer: {
      style: 'minimal',
      backgroundColor: '#FAFAFA',
      textColor: '#000000',
      showSocial: true,
      showNewsletter: false,
      showPayment: true,
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load sections on mount
  useEffect(() => {
    loadSections();
    loadThemeSettings();
  }, []);

  // Add to history when sections change
  useEffect(() => {
    if (sections.length > 0 && !loading) {
      const newHistory = [...history.slice(0, historyIndex + 1), sections];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setHasChanges(true);
    }
  }, [sections]);

  const loadSections = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/sections`);
      if (response.ok) {
        const data = await response.json();
        setSections(data.sort((a: Section, b: Section) => a.position - b.position));
      }
    } catch (error) {
      console.error('Failed to load sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const loadThemeSettings = async () => {
    try {
      const response = await fetch(`/api/stores/${store.id}/theme-settings`);
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          // Deep merge the settings
          const mergedSettings = JSON.parse(JSON.stringify(themeSettings));
          
          const deepMerge = (target: any, source: any) => {
            for (const key in source) {
              if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
              }
            }
            Object.assign(target, source);
            return target;
          };
          
          deepMerge(mergedSettings, data);
          setThemeSettings(mergedSettings);
        }
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const section = sections.find(s => s.id === active.id);
    setDraggedSection(section || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedSection(null);

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update positions
        return newItems.map((item, index) => ({
          ...item,
          position: index,
        }));
      });
    }
  };

  const handleSectionUpdate = (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const handleSectionDelete = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const response = await fetch(`/api/stores/${store.id}/sections/${sectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSections(prev => prev.filter(s => s.id !== sectionId));
        if (selectedSection?.id === sectionId) {
          setSelectedSection(null);
        }
        toast.success('Section deleted');
      }
    } catch (error) {
      toast.error('Failed to delete section');
    }
  };

  const handleAddSection = async (sectionData: any) => {
    try {
      const response = await fetch(`/api/stores/${store.id}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sectionData,
          position: sections.length,
        }),
      });

      if (response.ok) {
        const newSection = await response.json();
        setSections(prev => [...prev, newSection]);
        setSelectedSection(newSection);
        toast.success('Section added');
      }
    } catch (error) {
      toast.error('Failed to add section');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save sections order
      const reorderResponse = await fetch(`/api/stores/${store.id}/sections/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map(s => ({ id: s.id, position: s.position })),
        }),
      });

      // Save individual section updates
      for (const section of sections) {
        await fetch(`/api/stores/${store.id}/sections/${section.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(section),
        });
      }

      // Save theme settings
      await fetch(`/api/stores/${store.id}/theme-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(themeSettings),
      });

      setHasChanges(false);
      toast.success('Changes saved successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setSections(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setSections(history[historyIndex + 1]);
    }
  };

  const getDeviceWidth = () => {
    switch (previewDevice) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Modern Header */}
      <div className="h-14 bg-white border-b border-gray-200 shadow-sm">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href={`/dashboard/stores/${store.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Theme Studio</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={cn(
                  "p-2 text-gray-600 hover:bg-gray-50 transition-colors border-r border-gray-200",
                  historyIndex <= 0 && "opacity-40 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={cn(
                  "p-2 text-gray-600 hover:bg-gray-50 transition-colors",
                  historyIndex >= history.length - 1 && "opacity-40 cursor-not-allowed hover:bg-transparent"
                )}
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  previewDevice === 'desktop' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  previewDevice === 'tablet' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={cn(
                  "p-2 rounded-md transition-all duration-200",
                  previewDevice === 'mobile' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2",
                hasChanges
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tab Switcher */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('sections')}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
                  activeTab === 'sections' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Layout className="h-4 w-4" />
                Sections
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2",
                  activeTab === 'theme' 
                    ? "bg-white text-gray-900 shadow-sm" 
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Palette className="h-4 w-4" />
                Theme
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'sections' ? (
              <div className="p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <SectionList
                      sections={sections}
                      selectedSection={selectedSection}
                      onSelectSection={setSelectedSection}
                      onUpdateSection={handleSectionUpdate}
                      onDeleteSection={handleSectionDelete}
                    />
                  </SortableContext>
                  <DragOverlay modifiers={[restrictToWindowEdges]}>
                    {draggedSection && (
                      <div className="bg-background border rounded-lg p-3 shadow-lg opacity-90">
                        <p className="font-medium">{draggedSection.title}</p>
                        <p className="text-sm text-muted-foreground">{draggedSection.type}</p>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>

                <button
                  onClick={() => setShowAddSection(true)}
                  className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 font-medium"
                >
                  <Plus className="h-5 w-5" />
                  Add Section
                </button>
              </div>
            ) : (
              <ThemeSettingsV2
                settings={themeSettings}
                onChange={setThemeSettings}
              />
            )}
          </div>
        </div>

        {/* Preview Area */}
        {showPreview && (
          <div className="flex-1 bg-gray-50 overflow-hidden">
            <PreviewFrame
              storeSubdomain={store.subdomain}
              device={previewDevice}
              themeSettings={themeSettings}
            />
          </div>
        )}

        {/* Right Sidebar - Section Settings */}
        {selectedSection && activeTab === 'sections' && (
          <div className="w-80 bg-white border-l border-gray-200">
            <SectionSettings
              section={selectedSection}
              onUpdate={(updates) => handleSectionUpdate(selectedSection.id, updates)}
              onClose={() => setSelectedSection(null)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddSection && (
        <AddSectionModal
          onAdd={handleAddSection}
          onClose={() => setShowAddSection(false)}
        />
      )}
    </div>
  );
}