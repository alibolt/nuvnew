'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, EyeOff, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';

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
  subdomain: string;
  pageId: string | null;
  initialData?: PageData;
}

export default function PageEditor({ subdomain, pageId, initialData }: PageEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PageData>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    content: initialData?.content || '',
    seoTitle: initialData?.seoTitle || '',
    seoDescription: initialData?.seoDescription || '',
    isPublished: initialData?.isPublished || false,
  });

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapLink.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing your page content...',
      }),
    ],
    content: initialData?.content || '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
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
        ? `/api/stores/${subdomain}/pages/${pageId}`
        : `/api/stores/${subdomain}/pages`;
      
      const method = pageId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/stores/${subdomain}/content/pages`);
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


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/stores/${subdomain}/content/pages`}
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
                  {/* Tiptap Toolbar */}
                  {editor && (
                    <div className="border-b p-2 flex flex-wrap gap-1">
                      <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        <em>I</em>
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        <s>S</s>
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        H1
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        H2
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        H3
                      </button>
                      <div className="w-px h-6 bg-gray-300 mx-1" />
                      <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        • List
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        1. List
                      </button>
                      <button
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
                        type="button"
                      >
                        "
                      </button>
                    </div>
                  )}
                  <EditorContent 
                    editor={editor} 
                    className="prose prose-sm max-w-none p-4 min-h-[350px] focus:outline-none"
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