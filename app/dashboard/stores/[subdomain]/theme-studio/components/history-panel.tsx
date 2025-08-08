'use client';

import React from 'react';
import { X, Clock, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HistoryItem {
  timestamp: Date;
  action: string;
  details?: string;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  currentIndex: number;
  onSelectHistory: (index: number) => void;
}

export function HistoryPanel({ isOpen, onClose, historyItems, currentIndex, onSelectHistory }: HistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Edit History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4">
          {historyItems.length === 0 ? (
            <div className="text-center py-8">
              <RotateCcw className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No history yet</p>
              <p className="text-sm text-gray-400 mt-1">Changes will appear here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => onSelectHistory(index)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all group",
                    index === currentIndex
                      ? "bg-[var(--nuvi-primary-lighter)] border border-[var(--nuvi-primary)]"
                      : "hover:bg-gray-50 border border-transparent"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium",
                          index === currentIndex ? "text-[var(--nuvi-primary)]" : "text-gray-900"
                        )}>
                          {item.action}
                        </span>
                        {index === currentIndex && (
                          <span className="text-xs bg-[var(--nuvi-primary)] text-white px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      {item.details && (
                        <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatRelativeTime(item.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                      index === currentIndex ? "text-[var(--nuvi-primary)]" : "text-gray-400"
                    )} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing last {historyItems.length} changes (max 5)
          </p>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}