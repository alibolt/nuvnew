'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, FileEdit, Link, Search, Eye, Image, Settings, Calendar, Tag, User, Folder } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic import for the rich text editor
const Editor = dynamic(() => import('@/components/editor/rich-text-editor'), { 
  ssr: false,
  loading: () => <div className="nuvi-h-96 nuvi-bg-muted nuvi-animate-pulse nuvi-rounded" />
});

interface BlogFormProps {
  subdomain: string;
  blogId?: string;
  isNew?: boolean;
}

export function BlogForm({ subdomain, blogId, isNew = false }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: false,
    publishedAt: new Date().toISOString().split('T')[0],
    featuredImage: '',
    author: '',
    tags: '',
    blogCategoryId: ''
  });

  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchBlogCategories();
    if (!isNew && blogId && blogId !== 'new') {
      fetchBlog();
    }
  }, [blogId]);

  const fetchBlogCategories = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/blog/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch blog categories:', error);
    }
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/blog-posts/${blogId}`);
      if (response.ok) {
        const result = await response.json();
        const blog = result.data || result;
        setFormData({
          title: blog.title || '',
          slug: blog.slug || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          isPublished: blog.isPublished ?? false,
          publishedAt: blog.publishedAt ? new Date(blog.publishedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          featuredImage: blog.featuredImage || '',
          author: blog.author || '',
          tags: blog.tags ? blog.tags.join(', ') : '',
          blogCategoryId: blog.blogCategoryId || ''
        });
        setAutoGenerateSlug(false);
      }
    } catch (error) {
      console.error('Failed to fetch blog:', error);
      toast.error('Failed to load blog post');
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
      toast.error('Please enter a post title');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('Please enter a URL slug');
      return;
    }

    setSaving(true);

    try {
      const url = isNew 
        ? `/api/stores/${subdomain}/blog-posts`
        : `/api/stores/${subdomain}/blog-posts/${blogId}`;
      
      const method = isNew ? 'POST' : 'PUT';

      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
          publishedAt: formData.isPublished ? new Date(formData.publishedAt).toISOString() : null
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save blog post';
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
      toast.success(isNew ? 'Blog post created successfully' : 'Blog post updated successfully');
      router.push(`/dashboard/stores/${subdomain}/content?tab=content&content_view=blogs`);
      router.refresh();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save blog post');
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
    <form onSubmit={handleSubmit} className="nuvi-space-y-lg">
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Basic Info */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Blog Post Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label nuvi-required">
                  <FileEdit className="h-4 w-4" />
                  Post Title
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
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
                    placeholder="blog-post-url"
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
                    URL: /blog/{formData.slug || 'slug'}
                  </p>
                </div>
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <FileEdit className="h-4 w-4" />
                  Excerpt
                </label>
                <textarea
                  className="nuvi-input"
                  rows={3}
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of your post..."
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  This will appear in blog listings and search results
                </p>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Post Content</h3>
            </div>
            <div className="nuvi-card-content">
              <Editor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Write your blog post content here..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
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
                <span className="nuvi-text-sm">Publish post</span>
              </label>

              {formData.isPublished && (
                <div className="nuvi-form-group">
                  <label className="nuvi-label">
                    <Calendar className="h-4 w-4" />
                    Publish Date
                  </label>
                  <input
                    type="date"
                    className="nuvi-input"
                    value={formData.publishedAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="nuvi-flex nuvi-gap-sm">
                <button
                  type="submit"
                  className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-flex-1"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="nuvi-loading-spinner nuvi-loading-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isNew ? 'Create Post' : 'Update Post'}
                    </>
                  )}
                </button>
                {!isNew && (
                  <a
                    href={`/s/${subdomain}/blog/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Post Details */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Post Details</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <User className="h-4 w-4" />
                  Author
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <Folder className="h-4 w-4" />
                  Category
                </label>
                <select
                  className="nuvi-input"
                  value={formData.blogCategoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, blogCategoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <Tag className="h-4 w-4" />
                  Tags
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="technology, news, updates"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Separate tags with commas
                </p>
              </div>
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
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title (optional)"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <FileEdit className="h-4 w-4" />
                  Meta Description
                </label>
                <textarea
                  className="nuvi-input"
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description (optional)"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  {formData.metaDescription.length}/160 characters
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