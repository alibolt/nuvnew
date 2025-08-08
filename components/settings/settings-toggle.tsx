'use client';

interface SettingsToggleProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function SettingsToggle({ 
  id, 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false 
}: SettingsToggleProps) {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <div className="flex items-center justify-between py-4">
      <div className="pr-4">
        <label htmlFor={toggleId} className="font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          id={toggleId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <label
          htmlFor={toggleId}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer
            ${checked ? 'bg-[#8B9F7E]' : 'bg-gray-200'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-90'}
            peer-focus:ring-2 peer-focus:ring-[#8B9F7E] peer-focus:ring-offset-2`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${checked ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </label>
      </div>
    </div>
  );
}