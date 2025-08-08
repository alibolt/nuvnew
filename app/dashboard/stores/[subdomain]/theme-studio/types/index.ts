// Shared types for Theme Studio

export interface Block {
  id: string;
  type: string;
  position: number;
  enabled: boolean;
  settings: any;
  // For nested blocks
  blocks?: Block[];
}

export interface Section {
  id: string;
  sectionType: string;
  settings: any;
  enabled: boolean;
  position: number;
  blocks?: Block[];
  // For UI display
  type: string;
  title: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeSettings {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    [key: string]: string | undefined;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
    [key: string]: string | undefined;
  };
  layout?: {
    containerWidth?: string;
    spacing?: string;
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  themeCode?: string;
  logo?: string;
  email?: string;
  phone?: string;
  address?: string;
  defaultTemplateId?: string;
}

// Component Props Types
export interface BaseThemeStudioProps {
  store: Store;
  isPreview?: boolean;
  onBlockClick?: (section: Section, block: Block, event: React.MouseEvent) => void;
}

// State Types
export interface DraggedItem {
  id: string;
  type: 'section' | 'block';
  data: Section | Block;
}

// API Response Types
export interface SaveTemplateResponse {
  success: boolean;
  message?: string;
  template?: any;
}

export interface PublishTemplateResponse {
  success: boolean;
  message?: string;
}