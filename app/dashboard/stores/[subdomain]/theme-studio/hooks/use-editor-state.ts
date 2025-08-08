import { useState, useCallback, useMemo } from 'react';

export interface EditorState {
  isDraft: boolean;
  saving: boolean;
  isPublishing: boolean;
  loading: boolean;
  lastSaved: Date | undefined;
  currentTheme: string;
  currentTemplate: any;
}

export interface EditorActions {
  setIsDraft: (isDraft: boolean) => void;
  setSaving: (saving: boolean) => void;
  setIsPublishing: (isPublishing: boolean) => void;
  setLoading: (loading: boolean) => void;
  setCurrentTheme: (theme: string) => void;
  setCurrentTemplate: (template: any) => void;
  updateLastSaved: () => void;
  startSaving: () => void;
  finishSaving: () => void;
  startPublishing: () => void;
  finishPublishing: () => void;
}

export interface EditorComputed {
  hasUnsavedChanges: boolean;
  canPublish: boolean;
  isWorking: boolean;
  saveStatus: 'saved' | 'saving' | 'draft' | 'error';
}

export function useEditorState(): EditorState & EditorActions & EditorComputed {
  const [isDraft, setIsDraft] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | undefined>();
  const [currentTheme, setCurrentTheme] = useState<string>('commerce'); // This will be overridden by activeTheme
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);

  const updateLastSaved = useCallback(() => {
    setLastSaved(new Date());
  }, []);

  const startSaving = useCallback(() => {
    setSaving(true);
  }, []);

  const finishSaving = useCallback(() => {
    setSaving(false);
    updateLastSaved();
  }, [updateLastSaved]);

  const startPublishing = useCallback(() => {
    setIsPublishing(true);
    setSaving(true);
  }, []);

  const finishPublishing = useCallback(() => {
    setIsPublishing(false);
    setSaving(false);
    setIsDraft(false);
    updateLastSaved();
  }, [updateLastSaved]);

  // Computed state
  const hasUnsavedChanges = useMemo(() => {
    return isDraft || saving;
  }, [isDraft, saving]);

  const canPublish = useMemo(() => {
    return isDraft && !saving && !isPublishing;
  }, [isDraft, saving, isPublishing]);

  const isWorking = useMemo(() => {
    return saving || isPublishing || loading;
  }, [saving, isPublishing, loading]);

  const saveStatus = useMemo(() => {
    if (saving) return 'saving';
    if (isDraft) return 'draft';
    if (lastSaved) return 'saved';
    return 'draft';
  }, [saving, isDraft, lastSaved]);

  return {
    // State
    isDraft,
    saving,
    isPublishing,
    loading,
    lastSaved,
    currentTheme,
    currentTemplate,
    
    // Actions
    setIsDraft,
    setSaving,
    setIsPublishing,
    setLoading,
    setCurrentTheme,
    setCurrentTemplate,
    updateLastSaved,
    startSaving,
    finishSaving,
    startPublishing,
    finishPublishing,
    
    // Computed
    hasUnsavedChanges,
    canPublish,
    isWorking,
    saveStatus,
  };
}