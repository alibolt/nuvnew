'use client';

import { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface SettingsPageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  showSaveBar?: boolean;
  hasChanges?: boolean;
  loading?: boolean;
  onSave?: () => void;
  onDiscard?: () => void;
}

export function SettingsPageLayout({
  title,
  description,
  children,
  showSaveBar = false,
  hasChanges = false,
  loading = false,
  onSave,
  onDiscard,
}: SettingsPageLayoutProps) {
  return (
    <>
      {/* Page Header */}
      <div className="nuvi-page-header">
        <h2 className="nuvi-page-title">{title}</h2>
        {description && (
          <p className="nuvi-page-description">{description}</p>
        )}
      </div>

      {/* Content */}
      {children}

      {/* Save Bar */}
      {showSaveBar && (
        <div className="nuvi-save-bar">
          <div className="nuvi-save-bar-content">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              <AlertCircle className="h-5 w-5 nuvi-text-warning" />
              <span>You have unsaved changes</span>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <button
                onClick={onDiscard}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={onSave}
                className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}