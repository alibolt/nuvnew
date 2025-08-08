'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle, Globe, FileText, Package, Tag } from 'lucide-react';

interface TranslationProgress {
  status: 'idle' | 'preparing' | 'translating' | 'saving' | 'completed' | 'error';
  contentType: string;
  targetLanguage: string;
  totalItems: number;
  processedItems: number;
  translatedItems: number;
  savedItems: number;
  errors: Array<{ itemName: string; error: string }>;
  currentItem?: string;
  startTime?: number;
  estimatedTimeRemaining?: number;
}

interface TranslationProgressProps {
  progress: TranslationProgress;
  onClose?: () => void;
}

const contentTypeIcons = {
  product: Package,
  category: Tag,
  page: FileText,
};

const languageFlags: Record<string, string> = {
  en: '🇬🇧',
  tr: '🇹🇷',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  it: '🇮🇹',
  pt: '🇵🇹',
  ru: '🇷🇺',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
  ar: '🇸🇦',
  hi: '🇮🇳',
  nl: '🇳🇱',
  sv: '🇸🇪',
  pl: '🇵🇱',
};

export function TranslationProgressModal({ progress, onClose }: TranslationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (progress.status === 'translating' && progress.startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - progress.startTime!);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.status, progress.startTime]);

  const getProgressPercentage = () => {
    if (progress.totalItems === 0) return 0;
    return Math.round((progress.processedItems / progress.totalItems) * 100);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const ContentIcon = contentTypeIcons[progress.contentType as keyof typeof contentTypeIcons] || Globe;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ContentIcon className="h-6 w-6 text-primary" />
            <h3 className="text-lg font-semibold">
              Translating {progress.contentType}s
            </h3>
            <span className="text-2xl">{languageFlags[progress.targetLanguage]}</span>
          </div>
          {progress.status === 'completed' && onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{progress.processedItems} of {progress.totalItems}</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                progress.status === 'error' ? 'bg-red-500' :
                progress.status === 'completed' ? 'bg-green-500' :
                'bg-primary'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            >
              {progress.status === 'translating' && (
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            {progress.status === 'preparing' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm">Preparing items for translation...</span>
              </>
            )}
            {progress.status === 'translating' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">
                  Translating: {progress.currentItem || 'Processing...'}
                </span>
              </>
            )}
            {progress.status === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-green-500" />
                <span className="text-sm">Saving translations to database...</span>
              </>
            )}
            {progress.status === 'completed' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Translation completed!</span>
              </>
            )}
            {progress.status === 'error' && (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600">Translation failed</span>
              </>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-lg font-semibold text-primary">
              {progress.translatedItems}
            </div>
            <div className="text-xs text-gray-500">Translated</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-lg font-semibold text-green-600">
              {progress.savedItems}
            </div>
            <div className="text-xs text-gray-500">Saved</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
            <div className="text-lg font-semibold text-red-600">
              {progress.errors.length}
            </div>
            <div className="text-xs text-gray-500">Errors</div>
          </div>
        </div>

        {/* Time Information */}
        {progress.status === 'translating' && elapsedTime > 0 && (
          <div className="text-xs text-gray-500 mb-4">
            Elapsed: {formatTime(elapsedTime)}
            {progress.estimatedTimeRemaining && (
              <> • Remaining: ~{formatTime(progress.estimatedTimeRemaining)}</>
            )}
          </div>
        )}

        {/* Errors */}
        {progress.errors.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">
                {progress.errors.length} item{progress.errors.length > 1 ? 's' : ''} failed
              </span>
            </div>
            <div className="max-h-20 overflow-y-auto">
              {progress.errors.slice(0, 3).map((error, idx) => (
                <div key={idx} className="text-xs text-red-700 dark:text-red-300">
                  • {error.itemName}: {error.error}
                </div>
              ))}
              {progress.errors.length > 3 && (
                <div className="text-xs text-red-600 mt-1">
                  ...and {progress.errors.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {progress.status === 'completed' && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Done
            </button>
            {progress.errors.length > 0 && (
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Errors
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook for managing translation progress
export function useTranslationProgress() {
  const [progress, setProgress] = useState<TranslationProgress>({
    status: 'idle',
    contentType: '',
    targetLanguage: '',
    totalItems: 0,
    processedItems: 0,
    translatedItems: 0,
    savedItems: 0,
    errors: [],
  });

  const startTranslation = (contentType: string, targetLanguage: string, totalItems: number) => {
    setProgress({
      status: 'preparing',
      contentType,
      targetLanguage,
      totalItems,
      processedItems: 0,
      translatedItems: 0,
      savedItems: 0,
      errors: [],
      startTime: Date.now(),
    });
  };

  const updateProgress = (update: Partial<TranslationProgress>) => {
    setProgress(prev => ({ ...prev, ...update }));
  };

  const completeTranslation = (translatedItems: number, savedItems: number, errors: any[] = []) => {
    setProgress(prev => ({
      ...prev,
      status: 'completed',
      processedItems: prev.totalItems,
      translatedItems,
      savedItems,
      errors,
    }));
  };

  const resetProgress = () => {
    setProgress({
      status: 'idle',
      contentType: '',
      targetLanguage: '',
      totalItems: 0,
      processedItems: 0,
      translatedItems: 0,
      savedItems: 0,
      errors: [],
    });
  };

  return {
    progress,
    startTranslation,
    updateProgress,
    completeTranslation,
    resetProgress,
  };
}