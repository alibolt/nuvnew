// Shared Block type definitions
export interface Block {
  id: string;
  type: string;
  position: number;
  enabled: boolean;
  settings: any;
  blocks?: Block[];
  parentBlockId?: string; // For future parent-child relationships
  sectionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContainerBlock extends Block {
  type: 'container';
  settings: {
    layout?: 'horizontal' | 'vertical';
    alignment?: 'left' | 'center' | 'right' | 'between' | 'around';
    gap?: '0' | '2' | '4' | '6' | '8';
    padding?: '0' | '4' | '6' | '8';
    maxWidth?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    blocks?: Block[]; // Temporary until DB supports parent-child
  };
}

export interface Section {
  id: string;
  type?: string;
  sectionType: string;
  title?: string;
  settings: any;
  enabled: boolean;
  position: number;
  blocks?: Block[];
  isGlobal?: boolean;
  storeId?: string;
  templateId?: string;
}

export interface DragItem {
  id: string;
  type: 'block' | 'section';
  blockId?: string;
  sectionId?: string;
  isContainer?: boolean;
  depth?: number;
}

export interface BlockType {
  id: string;
  name: string;
  description?: string;
  icon: any;
  category: string;
  maxPerSection?: number;
  settings?: Record<string, any>;
}