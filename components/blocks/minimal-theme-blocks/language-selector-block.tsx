'use client';

import { useTranslation, LanguageSwitcher } from '@/lib/hooks/use-translations';

interface LanguageSelectorSettings {
  showFlag?: boolean;
  showName?: boolean;
  dropdownStyle?: 'minimal' | 'bordered' | 'rounded';
}

export function LanguageSelectorBlock({ settings }: { settings: LanguageSelectorSettings }) {
  const dropdownClass = {
    minimal: 'border-0 bg-transparent',
    bordered: 'border border-gray-300',
    rounded: 'border border-gray-300 rounded-full'
  }[settings.dropdownStyle || 'bordered'];

  return (
    <div className="language-selector">
      <LanguageSwitcher className={dropdownClass} />
    </div>
  );
}

export const languageSelectorSettings = {
  showFlag: {
    type: 'checkbox',
    label: 'Show flag icons',
    default: false
  },
  showName: {
    type: 'checkbox', 
    label: 'Show language name',
    default: true
  },
  dropdownStyle: {
    type: 'select',
    label: 'Dropdown style',
    default: 'bordered',
    options: [
      { value: 'minimal', label: 'Minimal' },
      { value: 'bordered', label: 'Bordered' },
      { value: 'rounded', label: 'Rounded' }
    ]
  }
};