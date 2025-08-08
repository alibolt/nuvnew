export interface FieldSchema {
  key: string;
  label: string;
  type: 'text' | 'select' | 'checkbox' | 'color' | 'number' | 'textarea' | 'range' | 'media' | 'image' | 'product_picker' | 'collection_picker';
  placeholder?: string;
  helperText?: string;
  options?: Array<{ value: any; label: string }>;
  default?: any;
  debounce?: boolean;
  multiple?: boolean; // For product_picker and collection_picker
  conditional?: {
    field: string;
    value: any;
  }; // Field key to depend on
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface GroupSchema {
  title: string;
  icon: string;
  fields: FieldSchema[];
}

export interface SectionSchema {
  [groupKey: string]: GroupSchema;
}

// Helper function to convert mevcut InputField'ları schema'ya
export function createInputFieldSchema(
  key: string,
  label: string,
  type: string = 'text',
  options?: any
): FieldSchema {
  const field: FieldSchema = {
    key,
    label,
    type: type as any
  };

  if (options?.placeholder) field.placeholder = options.placeholder;
  if (options?.options) field.options = options.options;
  if (options?.default) field.default = options.default;
  if (options?.debounce) field.debounce = options.debounce;
  if (options?.conditional) field.conditional = options.conditional;

  return field;
}