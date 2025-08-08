'use client';

import React, { useState } from 'react';
import { 
  Save, 
  Globe, 
  Eye, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DraftPublishToolbarProps {
  hasChanges: boolean;
  isDraft: boolean;
  lastSaved?: Date;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onPreview: () => void;
  isSaving?: boolean;
  isPublishing?: boolean;
}

export function DraftPublishToolbar({
  hasChanges,
  isDraft,
  lastSaved,
  onSaveDraft,
  onPublish,
  onPreview,
  isSaving = false,
  isPublishing = false
}: DraftPublishToolbarProps) {
  const [showConfirmPublish, setShowConfirmPublish] = useState(false);

  const handlePublish = async () => {
    if (hasChanges) {
      // Save draft first, then publish
      await onSaveDraft();
    }
    await onPublish();
    setShowConfirmPublish(false);
  };

  const formatLastSaved = (date?: Date) => {
    if (!date) return 'Never saved';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ago`;
    } else if (seconds > 10) {
      return `${seconds}s ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
      {/* Status & Last Saved */}
      <div className="flex items-center gap-3">
        {/* Draft/Published Status */}
        <div className="flex items-center gap-2">
          {isDraft ? (
            <>
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-orange-700">Draft</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">Published</span>
            </>
          )}
        </div>

        {/* Last Saved */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Saved {formatLastSaved(lastSaved)}</span>
        </div>

        {/* Unsaved Changes Indicator */}
        {hasChanges && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600">
            <AlertCircle className="h-3 w-3" />
            <span>Unsaved changes</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Preview Button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>

        {/* Save Draft Button */}
        <button
          onClick={onSaveDraft}
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
            hasChanges && !isSaving
              ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              : "text-gray-400 cursor-not-allowed"
          )}
        >
          {isSaving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}
          {isSaving ? 'Saving...' : 'Save Draft'}
        </button>

        {/* Publish Button */}
        <div className="relative">
          <button
            onClick={() => setShowConfirmPublish(true)}
            disabled={isPublishing}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
              "bg-[var(--nuvi-primary)] text-white hover:bg-[var(--nuvi-primary-hover)] shadow-sm"
            )}
          >
            {isPublishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            )}
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>

          {/* Publish Confirmation Modal */}
          {showConfirmPublish && (
            <>
              <div 
                className="fixed inset-0 z-40 bg-black/20" 
                onClick={() => setShowConfirmPublish(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Publish Changes
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      This will make your changes live on your store. Visitors will see the updated design immediately.
                    </p>
                    
                    {hasChanges && (
                      <div className="flex items-center gap-1.5 text-xs text-orange-600 mb-3">
                        <AlertCircle className="h-3 w-3" />
                        <span>You have unsaved changes that will be saved first</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowConfirmPublish(false)}
                        className="flex-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="flex-1 px-3 py-1.5 text-xs bg-[var(--nuvi-primary)] text-white hover:bg-[var(--nuvi-primary-hover)] rounded transition-colors flex items-center justify-center gap-1"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3" />
                        )}
                        {isPublishing ? 'Publishing...' : 'Publish Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}