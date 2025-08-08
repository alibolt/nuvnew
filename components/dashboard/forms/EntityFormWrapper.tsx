'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

interface EntityFormWrapperProps<T> {
  mode: 'create' | 'edit';
  entityId?: string;
  initialData?: T;
  apiEndpoint: string;
  onDataChange?: (data: T) => any;
  redirectPath?: string;
  onSuccess?: () => void;
  children: (props: {
    formData: T;
    handleChange: (field: string, value: any) => void;
    loading: boolean;
    saving: boolean;
    error: string | null;
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    handleDelete?: () => Promise<void>;
  }) => ReactNode;
}

export function EntityFormWrapper<T extends Record<string, any>>({
  mode,
  entityId,
  initialData,
  apiEndpoint,
  onDataChange,
  redirectPath,
  onSuccess,
  children
}: EntityFormWrapperProps<T>) {
  const router = useRouter();
  const [formData, setFormData] = useState<T>(initialData || {} as T);
  const [loading, setLoading] = useState(mode === 'edit' && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data for edit mode
  useEffect(() => {
    if (mode === 'edit' && entityId && !initialData) {
      loadEntityData();
    }
  }, [mode, entityId]);

  const loadEntityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoint}/${entityId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load data');
      }

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields
      const keys = field.split('.');
      const newData = { ...formData };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      setFormData(newData);
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    try {
      setSaving(true);
      setError(null);

      const dataToSave = onDataChange ? onDataChange(formData) : formData;
      
      const url = mode === 'create' 
        ? apiEndpoint 
        : `${apiEndpoint}/${entityId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save');
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectPath) {
        if (mode === 'create' && result.id) {
          router.push(redirectPath.replace('[id]', result.id));
        } else {
          router.push(redirectPath);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (mode !== 'edit' || !entityId) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`${apiEndpoint}/${entityId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      if (onSuccess) {
        onSuccess();
      }
      
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
      
      {children({
        formData,
        handleChange,
        loading,
        saving,
        error,
        handleSubmit,
        handleDelete: mode === 'edit' ? handleDelete : undefined
      })}
    </>
  );
}