import { useState, useCallback, ChangeEvent } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface UseFormHandlerOptions<T> {
  initialState: T;
  validationSchema?: ValidationSchema;
  onSubmit?: (data: T) => void | Promise<void>;
}

interface UseFormHandlerReturn<T> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  hasChanges: boolean;
  handleChange: (field: keyof T | string, value: any) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  validateField: (field: string, value: any) => string | null;
  validateForm: () => boolean;
}

export function useFormHandler<T extends Record<string, any>>({
  initialState,
  validationSchema = {},
  onSubmit,
}: UseFormHandlerOptions<T>): UseFormHandlerReturn<T> {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const validateField = useCallback((field: string, value: any): string | null => {
    const rules = validationSchema[field];
    if (!rules) return null;

    if (rules.required && (!value || value === '')) {
      return 'This field is required';
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      return `Minimum length is ${rules.minLength} characters`;
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      return `Maximum length is ${rules.maxLength} characters`;
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      return 'Invalid format';
    }

    if (rules.custom) {
      const result = rules.custom(value);
      if (typeof result === 'string') return result;
      if (!result) return 'Invalid value';
    }

    return null;
  }, [validationSchema]);

  const handleChange = useCallback((field: keyof T | string, value: any) => {
    // Handle nested fields like "settings.theme.color"
    if (typeof field === 'string' && field.includes('.')) {
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let obj: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!obj[keys[i]]) {
            obj[keys[i]] = {};
          }
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Validate field
    const error = validateField(field as string, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }

    setHasChanges(true);
  }, [validateField]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    handleChange(name as keyof T, finalValue);
  }, [handleChange]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(field => {
      const value = field.includes('.') 
        ? field.split('.').reduce((obj, key) => obj?.[key], formData as any)
        : formData[field];
      
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formData, validationSchema, validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm]);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setHasChanges(false);
    setIsSubmitting(false);
  }, [initialState]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    hasChanges,
    handleChange,
    handleInputChange,
    handleSubmit,
    resetForm,
    setFieldError,
    clearFieldError,
    validateField,
    validateForm,
  };
}

// Example usage:
// const {
//   formData,
//   errors,
//   isSubmitting,
//   handleChange,
//   handleSubmit,
//   resetForm
// } = useFormHandler({
//   initialState: { name: '', email: '', age: 0 },
//   validationSchema: {
//     name: { required: true, minLength: 2 },
//     email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
//     age: { required: true, custom: (value) => value >= 18 || 'Must be 18 or older' }
//   },
//   onSubmit: async (data) => {
//     const response = await fetch('/api/users', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(data)
//     });
//     if (!response.ok) throw new Error('Failed to save');
//   }
// });