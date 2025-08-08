import { TextareaHTMLAttributes } from 'react';

interface SettingsTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function SettingsTextarea({ error, className = '', ...props }: SettingsTextareaProps) {
  return (
    <>
      <textarea
        className={`w-full px-3 py-2 border rounded-lg transition-colors
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[#8B9F7E] focus:border-[#8B9F7E]'}
          ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </>
  );
}