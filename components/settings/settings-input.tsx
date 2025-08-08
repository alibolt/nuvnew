import { InputHTMLAttributes } from 'react';

interface SettingsInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  error?: string;
  onChange?: (value: string) => void;
}

export function SettingsInput({ error, className = '', onChange, ...props }: SettingsInputProps) {
  return (
    <>
      <input
        className={`w-full px-3 py-2 border rounded-lg transition-colors
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-2 focus:ring-[#8B9F7E] focus:border-[#8B9F7E]'}
          ${className}`}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </>
  );
}