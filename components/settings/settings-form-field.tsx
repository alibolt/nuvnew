import { ReactNode } from 'react';

interface SettingsFormFieldProps {
  label: string;
  description?: string;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
}

export function SettingsFormField({ 
  label, 
  description, 
  htmlFor, 
  required = false,
  children 
}: SettingsFormFieldProps) {
  return (
    <div>
      <label 
        htmlFor={htmlFor} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}