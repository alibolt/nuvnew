import { useState, useCallback, useRef } from 'react';

interface HistoryEntry<T> {
  state: T;
  action: string;
  timestamp: Date;
  details?: string;
}

interface HistoryState<T> {
  entries: HistoryEntry<T>[];
  currentIndex: number;
  maxHistorySize: number;
}

export function useHistory<T>(initialState: T, maxSize = 50) {
  const [history, setHistory] = useState<HistoryState<T>>({
    entries: [{
      state: initialState,
      action: 'Initial state',
      timestamp: new Date()
    }],
    currentIndex: 0,
    maxHistorySize: maxSize
  });

  const isRecordingRef = useRef(true);

  const pushState = useCallback((newState: T, action: string = 'Change', details?: string) => {
    if (!isRecordingRef.current) return;

    // More comprehensive validation to prevent empty state that would clear existing data
    if (Array.isArray(newState) && newState.length === 0) {
      // Check if current state has data that would be lost
      const currentState = history.entries[history.currentIndex]?.state;
      if (Array.isArray(currentState) && currentState.length > 0) {
        console.warn('[useHistory] Preventing empty state that would clear existing data');
        return;
      }
    }

    setHistory(prev => {
      // Remove any entries after current index (when undoing and then making new changes)
      const newEntries = prev.entries.slice(0, prev.currentIndex + 1);
      
      // Add the new entry
      newEntries.push({
        state: newState,
        action,
        timestamp: new Date(),
        details
      });
      
      // Limit history size
      if (newEntries.length > prev.maxHistorySize) {
        newEntries.shift();
        return {
          ...prev,
          entries: newEntries,
          currentIndex: newEntries.length - 1
        };
      }
      
      return {
        ...prev,
        entries: newEntries,
        currentIndex: newEntries.length - 1
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.currentIndex > 0) {
        return {
          ...prev,
          currentIndex: prev.currentIndex - 1
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.currentIndex < prev.entries.length - 1) {
        return {
          ...prev,
          currentIndex: prev.currentIndex + 1
        };
      }
      return prev;
    });
  }, []);

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.entries.length - 1;
  const currentState = history.entries[history.currentIndex]?.state;
  const historyEntries = history.entries;

  const withoutRecording = useCallback((callback: () => void) => {
    isRecordingRef.current = false;
    callback();
    isRecordingRef.current = true;
  }, []);

  const clearHistory = useCallback((newInitialState: T, action: string = 'Reset') => {
    // More comprehensive validation - prevent clearing with empty state when current state has data
    if (Array.isArray(newInitialState) && newInitialState.length === 0) {
      // Check if current state has data that would be lost
      const currentState = history.entries[history.currentIndex]?.state;
      if (Array.isArray(currentState) && currentState.length > 0) {
        console.warn('[useHistory] Preventing history clear with empty state that would clear existing data');
        return;
      }
    }
    
    setHistory({
      entries: [{
        state: newInitialState,
        action,
        timestamp: new Date()
      }],
      currentIndex: 0,
      maxHistorySize: history.maxHistorySize
    });
  }, [history.maxHistorySize, history.entries, history.currentIndex]);

  const goToHistory = useCallback((index: number) => {
    setHistory(prev => ({
      ...prev,
      currentIndex: Math.max(0, Math.min(index, prev.entries.length - 1))
    }));
  }, []);

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    withoutRecording,
    clearHistory,
    goToHistory,
    historySize: history.entries.length,
    currentIndex: history.currentIndex,
    historyEntries
  };
}