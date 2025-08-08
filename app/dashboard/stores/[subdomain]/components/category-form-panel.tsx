'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
}

interface CategoryFormPanelProps {
  store: StoreData;
  categoryId?: string;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function CategoryFormPanel({ 
  store, 
  categoryId, 
  isEdit = false, 
  onSave, 
  onCancel 
}: CategoryFormPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<'manual' | 'automatic'>('manual');
  const [isActive, setIsActive] = useState(true);
  const [image, setImage] = useState('');
  
  // Load category data if editing
  useEffect(() => {
    if (isEdit && categoryId) {
      loadCategory();
    }
  }, [isEdit, categoryId, store.subdomain]);

  const loadCategory = async () => {
    if (!categoryId) {
      console.error('No categoryId provided');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/categories/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded category data:', data);
        setName(data.name || '');
        setDescription(data.description || '');
        setSlug(data.slug || '');
        setType(data.type || 'manual');
        setIsActive(data.isActive ?? true);
        setImage(data.image || '');
      } else {
        console.error('Failed to load category, status:', response.status);
        const error = await response.text();
        console.error('Error response:', error);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a collection name');
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type,
        isActive,
        image,
      };

      const url = isEdit 
        ? `/api/stores/${store.subdomain}/categories/${categoryId}`
        : `/api/stores/${store.subdomain}/categories`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        const error = await response.text();
        alert(`Failed to save collection: ${error}`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save collection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        setImage(url);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  if (isLoading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-btn-loading nuvi-mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isEdit ? 'Edit Collection' : 'Create Collection'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isEdit ? 'Update collection details' : 'Add a new collection to organize products'}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Collection'}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Basic Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Basic Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Collection Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Collection"
                  className="nuvi-input"
                  required
                />
              </div>
              
              <div>
                <label className="nuvi-label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe this collection..."
                  className="nuvi-textarea"
                  rows={4}
                />
              </div>

              <div>
                <label className="nuvi-label">URL Handle</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="summer-collection"
                  className="nuvi-input"
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                  Leave blank to auto-generate from name
                </p>
              </div>
            </div>
          </div>

          {/* Collection Type */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Collection Type</h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-sm">
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="manual"
                    checked={type === 'manual'}
                    onChange={(e) => setType(e.target.value as 'manual')}
                    className="nuvi-radio"
                  />
                  <div>
                    <p className="nuvi-font-medium">Manual</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Add products to this collection one by one</p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="automatic"
                    checked={type === 'automatic'}
                    onChange={(e) => setType(e.target.value as 'automatic')}
                    className="nuvi-radio"
                  />
                  <div>
                    <p className="nuvi-font-medium">Automatic</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Products are added based on conditions</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Status */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Status</h3>
            </div>
            <div className="nuvi-card-content">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <span>Active</span>
              </label>
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                Active collections are visible on your store
              </p>
            </div>
          </div>

          {/* Collection Image */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Collection Image</h3>
            </div>
            <div className="nuvi-card-content">
              {image ? (
                <div className="nuvi-relative">
                  <img
                    src={image}
                    alt="Collection"
                    className="nuvi-w-full nuvi-h-48 nuvi-object-cover nuvi-rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="nuvi-absolute nuvi-top-2 nuvi-right-2 nuvi-btn nuvi-btn-sm nuvi-btn-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="nuvi-border-2 nuvi-border-dashed nuvi-border-muted nuvi-rounded-lg nuvi-p-md nuvi-text-center">
                  <Upload className="h-8 w-8 nuvi-mx-auto nuvi-mb-sm nuvi-text-muted" />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-sm">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="nuvi-absolute nuvi-inset-0 nuvi-opacity-0 nuvi-cursor-pointer"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}