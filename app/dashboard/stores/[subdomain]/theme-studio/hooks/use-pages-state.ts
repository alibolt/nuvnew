import { useState, useCallback } from 'react';
import { Page } from '../types';

export interface PagesState {
  pages: Page[];
  selectedPage: string;
}

export interface PagesActions {
  setPages: (pages: Page[]) => void;
  setSelectedPage: (pageId: string) => void;
  addPage: (page: Page) => void;
  updatePage: (pageId: string, updates: Partial<Page>) => void;
  removePage: (pageId: string) => void;
  selectHomePage: () => void;
}

export function usePagesState(): PagesState & PagesActions {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('homepage');

  const addPage = useCallback((page: Page) => {
    setPages(current => [...current, page]);
  }, []);

  const updatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    setPages(current => 
      current.map(page => 
        page.id === pageId 
          ? { ...page, ...updates }
          : page
      )
    );
  }, []);

  const removePage = useCallback((pageId: string) => {
    setPages(current => current.filter(page => page.id !== pageId));
    
    // If removed page was selected, switch to homepage
    if (selectedPage === pageId) {
      setSelectedPage('homepage');
    }
  }, [selectedPage]);

  const selectHomePage = useCallback(() => {
    setSelectedPage('homepage');
  }, []);

  return {
    // State
    pages,
    selectedPage,
    
    // Actions
    setPages,
    setSelectedPage,
    addPage,
    updatePage,
    removePage,
    selectHomePage,
  };
}