'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Rich text editor - dynamically imported to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface PageData {
  id?: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isPublished: boolean;
}

interface PageEditorProps {
  storeId: string;
  pageId: string | null;
  initialData?: PageData;
}

export default function PageEditor({ storeId, pageId, initialData }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PageData>({
    title: '',
    slug: '',
    content: '',
    seoTitle: '',
    seoDescription: '',
    isPublished: false,
    ...initialData
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!pageId && formData.title && !formData.slug) {
      const slug = formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, pageId]);

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      alert('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const url = pageId 
        ? `/api/stores/${storeId}/pages/${pageId}`
        : `/api/stores/${storeId}/pages`;
      
      const method = pageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/stores/${storeId}/content/pages`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save page');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/stores/${storeId}/content/pages`}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold">
            {pageId ? 'Edit Page' : 'Create New Page'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setFormData(prev => ({ ...prev, isPublished: !prev.isPublished }))}
          >
            {formData.isPublished ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Published
              </>
            ) : (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Draft
              </>
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Page Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="About Us"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-1">/pages/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    placeholder="about-us"
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Content
                </label>
                <div className="border rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                    modules={modules}
                    style={{ height: '350px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* SEO Settings */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              SEO Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder={formData.title || 'Page title'}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use page title
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  SEO Description
                </label>
                <textarea
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Brief description for search engines"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  160 characters recommended
                </p>
              </div>
            </div>
          </div>

          {/* Page Status */}
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="font-medium mb-4">Page Status</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Publish this page</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Published pages are visible to customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}