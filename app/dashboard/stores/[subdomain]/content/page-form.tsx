'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, FileText, Link, Search, Eye, Code, Image, Settings, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic import for the rich text editor
const Editor = dynamic(() => import('@/components/editor/rich-text-editor'), { 
  ssr: false,
  loading: () => <div className="nuvi-h-96 nuvi-bg-muted nuvi-animate-pulse nuvi-rounded" />
});

interface PageFormProps {
  subdomain: string;
  pageId?: string;
  isNew?: boolean;
  onBack?: () => void;
}

export function PageForm({ subdomain, pageId, isNew = false, onBack }: PageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    isPublished: true,
    featuredImage: ''
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);

  useEffect(() => {
    if (!isNew && pageId && pageId !== 'new') {
      fetchPage();
    }
  }, [pageId, isNew]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/pages/${pageId}`);
      if (response.ok) {
        const page = await response.json();
        setFormData({
          title: page.title || '',
          slug: page.slug || '',
          content: page.content || '',
          seoTitle: page.seoTitle || '',
          seoDescription: page.seoDescription || '',
          isPublished: page.isPublished ?? true,
          featuredImage: page.featuredImage || ''
        });
        setAutoGenerateSlug(false);
      }
    } catch (error) {
      console.error('Failed to fetch page:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({ ...prev, title: value }));
    
    if (autoGenerateSlug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a page title');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('Please enter a URL slug');
      return;
    }

    setSaving(true);

    try {
      const url = isNew 
        ? `/api/stores/${subdomain}/pages`
        : `/api/stores/${subdomain}/pages/${pageId}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save page';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || error.message || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(isNew ? 'Page created successfully' : 'Page updated successfully');
      router.push(`/dashboard/stores/${subdomain}/content?tab=content&content_view=pages`);
      router.refresh();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-loading-spinner nuvi-loading-lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
      <div className="nuvi-page-header">
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
            <button 
              type="button"
              onClick={onBack || (() => router.push(`/dashboard/stores/${subdomain}/content?tab=content&content_view=pages`))}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="nuvi-page-title">
                {isNew ? 'Create Page' : 'Edit Page'}
              </h1>
              <p className="nuvi-page-description">
                {isNew 
                  ? 'Create a new page for your store' 
                  : 'Update your page information'}
              </p>
            </div>
          </div>
          <div className="nuvi-flex nuvi-gap-md nuvi-items-center">
            {!isNew && (
              <a
                href={`/s/${subdomain}/pages/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="nuvi-btn nuvi-btn-secondary"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </a>
            )}
            <button
              type="submit"
              className="nuvi-btn nuvi-btn-primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="nuvi-loading-spinner nuvi-loading-sm mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNew ? 'Create Page' : 'Save Page'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Page Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label nuvi-required">
                  <FileText className="h-4 w-4" />
                  Page Title
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter page title"
                  required
                />
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label nuvi-required">
                  <Link className="h-4 w-4" />
                  URL Slug
                </label>
                <div className="nuvi-space-y-sm">
                  <input
                    type="text"
                    className="nuvi-input"
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoGenerateSlug(false);
                      setFormData(prev => ({ ...prev, slug: e.target.value }));
                    }}
                    placeholder="page-url-slug"
                    required
                  />
                  {isNew && (
                    <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-text-sm">
                      <input
                        type="checkbox"
                        className="nuvi-checkbox"
                        checked={autoGenerateSlug}
                        onChange={(e) => setAutoGenerateSlug(e.target.checked)}
                      />
                      Auto-generate from title
                    </label>
                  )}
                  <p className="nuvi-text-xs nuvi-text-muted">
                    URL: /pages/{formData.slug || 'slug'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Page Content</h3>
            </div>
            <div className="nuvi-card-content">
              <Editor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Write your page content here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Publishing Options */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Publishing</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  className="nuvi-checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                />
                <span className="nuvi-text-sm">Publish page</span>
              </label>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">SEO Settings</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <Search className="h-4 w-4" />
                  Meta Title
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  {formData.seoTitle.length}/60 characters
                </p>
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <FileText className="h-4 w-4" />
                  Meta Description
                </label>
                <textarea
                  className="nuvi-input"
                  rows={3}
                  value={formData.seoDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="SEO description (optional)"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Featured Image</h3>
            </div>
            <div className="nuvi-card-content">
              {formData.featuredImage ? (
                <div className="nuvi-relative nuvi-group">
                  <img
                    src={formData.featuredImage}
                    alt="Featured"
                    className="nuvi-w-full nuvi-h-32 nuvi-object-cover nuvi-rounded"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    className="nuvi-absolute nuvi-top-sm nuvi-right-sm nuvi-btn nuvi-btn-sm nuvi-btn-error nuvi-opacity-0 nuvi-group-hover:opacity-100 nuvi-transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="nuvi-border-2 nuvi-border-dashed nuvi-rounded-lg nuvi-p-md nuvi-text-center">
                  <Image className="h-8 w-8 nuvi-text-muted nuvi-mx-auto nuvi-mb-sm" />
                  <input
                    type="text"
                    className="nuvi-input nuvi-text-sm"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                    placeholder="Enter image URL"
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