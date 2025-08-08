'use client';

import { Loader2 } from 'lucide-react';

interface SettingsSaveBarProps {
  show: boolean;
  loading?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SettingsSaveBar({ show, loading, onSave, onDiscard }: SettingsSaveBarProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Unsaved changes</p>
          <div className="flex gap-3">
            <button
              onClick={onDiscard}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={loading}
              className="px-4 py-2 bg-[#8B9F7E] text-white rounded-lg hover:bg-[#7A8C6E] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}