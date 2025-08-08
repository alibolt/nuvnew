'use client';

import { ReactNode, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { toast } from 'sonner';

interface SettingsFormWrapperProps<T> {
  store: Store;
  initialData: T;
  apiEndpoint: string;
  onDataChange?: (data: T) => T;
  children: (props: {
    formData: T;
    handleChange: (field: keyof T | string, value: any) => void;
    loading: boolean;
  }) => ReactNode;
}

export function SettingsFormWrapper<T extends Record<string, any>>({
  store,
  initialData,
  apiEndpoint,
  onDataChange,
  children,
}: SettingsFormWrapperProps<T>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [formData, setFormData] = useState<T>(initialData);

  const handleChange = useCallback((field: keyof T | string, value: any) => {
    if (typeof field === 'string' && field.includes('.')) {
      // Handle nested fields like "securitySettings.requireTwoFactor"
      const keys = field.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let obj: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        return newData;
      });
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    setHasChanges(true);
    setShowSaveBar(true);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSave = onDataChange ? onDataChange(formData) : formData;
      const response = await fetch(apiEndpoint.replace('{subdomain}', store.subdomain), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      if (response.ok) {
        setHasChanges(false);
        setShowSaveBar(false);
        toast.success('Settings saved successfully!');
        router.refresh();
      } else {
        try {
          const errorData = await response.json();
          console.error('Settings save error:', errorData);
          toast.error(errorData.error || 'Failed to save changes');
        } catch {
          const error = await response.text();
          toast.error(`Failed to save changes: ${error}`);
        }
      }
    } catch (error) {
      toast.error('An error occurred while saving');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    setFormData(initialData);
    setHasChanges(false);
    setShowSaveBar(false);
  };

  return (
    <>
      {children({ formData, handleChange, loading })}
      {showSaveBar && (
        <div className="nuvi-save-bar">
          <div className="nuvi-save-bar-content">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              <span>You have unsaved changes</span>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <button
                onClick={handleDiscard}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
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