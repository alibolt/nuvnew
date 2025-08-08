// Block system type definitions

export interface Block {
  id: string;
  sectionId: string;
  type: string;
  position: number;
  enabled: boolean;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  templateId: string;
  sectionType: string;
  position: number;
  enabled: boolean;
  settings: Record<string, any>;  // Section-level settings
  blocks: Block[];                // Child blocks
  createdAt: string;
  updatedAt: string;
}

// Block operations
export interface BlockOperation {
  type: 'add' | 'update' | 'delete' | 'reorder';
  blockId?: string;
  blockType?: string;
  position?: number;
  settings?: Record<string, any>;
  newOrder?: string[]; // For reorder operations
}

// Section operations 
export interface SectionOperation {
  type: 'updateSettings' | 'blockOperation';
  settings?: Record<string, any>;
  blockOperation?: BlockOperation;
}

// API request/response types
export interface CreateBlockRequest {
  sectionId: string;
  type: string;
  position?: number;
  settings?: Record<string, any>;
}

export interface UpdateBlockRequest {
  settings?: Record<string, any>;
  position?: number;
  enabled?: boolean;
}

export interface ReorderBlocksRequest {
  blockIds: string[];
}

export interface BlocksResponse {
  blocks: Block[];
  total: number;
}

// Hook types for React components
export interface UseBlocksResult {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  addBlock: (type: string, position?: number) => Promise<Block>;
  updateBlock: (blockId: string, updates: Partial<Block>) => Promise<Block>;
  deleteBlock: (blockId: string) => Promise<void>;
  reorderBlocks: (newOrder: string[]) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface UseSectionResult {
  section: Section | null;
  loading: boolean;
  error: string | null;
  updateSection: (updates: Partial<Section>) => Promise<Section>;
  updateSectionSettings: (settings: Record<string, any>) => Promise<Section>;
  refresh: () => Promise<void>;
}

// Component prop types
export interface BlockInspectorProps {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onDuplicate?: () => void;
  storeId: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export interface BlockRendererProps {
  block: Block;
  isEditing?: boolean;
  storeId?: string;
}

export interface SectionWithBlocksProps {
  section: Section;
  onUpdateSection: (updates: Partial<Section>) => void;
  onAddBlock: (type: string, position?: number) => Promise<void>;
  onUpdateBlock: (blockId: string, updates: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onReorderBlocks: (newOrder: string[]) => void;
  storeId: string;
  isEditing?: boolean;
}

// Validation types
export interface BlockValidationError {
  blockId: string;
  field: string;
  message: string;
}

export interface SectionValidationResult {
  valid: boolean;
  errors: BlockValidationError[];
  warnings: BlockValidationError[];
}

// Block field types for dynamic forms
export type BlockFieldType = 
  | 'text' 
  | 'textarea' 
  | 'select' 
  | 'checkbox' 
  | 'color' 
  | 'number' 
  | 'range' 
  | 'url' 
  | 'image' 
  | 'media' 
  | 'code';

export interface BlockFieldSchema {
  type: BlockFieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  default?: any;
  options?: Array<{ value: any; label: string }>;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: string;
}

// Preset and template types
export interface BlockPreset {
  id: string;
  name: string;
  description: string;
  blockType: string;
  settings: Record<string, any>;
  preview?: string;
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  sectionType: string;
  settings: Record<string, any>;
  blocks: Array<{
    type: string;
    position: number;
    settings: Record<string, any>;
  }>;
  preview?: string;
  category: string;
}

// Theme integration types
export interface BlockThemeConfig {
  blockType: string;
  allowedInSections: string[];
  maxPerSection?: number;
  requiredFields?: string[];
  defaultSettings?: Record<string, any>;
}

export interface SectionThemeConfig {
  sectionType: string;
  allowedBlocks: string[];
  maxBlocks?: number;
  minBlocks?: number;
  requiredBlocks?: string[];
  defaultBlocks?: Array<{
    type: string;
    settings: Record<string, any>;
  }>;
}