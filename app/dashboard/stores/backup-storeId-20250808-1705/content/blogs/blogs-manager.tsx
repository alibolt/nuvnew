'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, FileText, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    posts: number;
  };
}

export default function BlogsManager({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', slug: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, [storeId]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async () => {
    if (!newBlog.title) {
      alert('Blog title is required');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`/api/stores/${storeId}/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBlog),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewBlog({ title: '', slug: '', description: '' });
        fetchBlogs();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create blog');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      alert('Failed to create blog');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading blogs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Your Blogs</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Blog
        </Button>
      </div>

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No blogs yet. Create your first blog!</p>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Blog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">{blog.title}</h3>
                {blog.description && (
                  <p className="text-gray-600 text-sm mb-4">{blog.description}</p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{blog._count.posts} posts</span>
                  <span>/{blog.slug}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/stores/${storeId}/content/blogs/${blog.id}/posts`}
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full">
                      Manage Posts
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Create New Blog</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newBlog.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    setNewBlog({ ...newBlog, title, slug });
                  }}
                  placeholder="News & Updates"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={newBlog.slug}
                  onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="news-updates"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newBlog.description}
                  onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                  placeholder="Brief description of this blog"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--nuvi-primary)]"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBlog({ title: '', slug: '', description: '' });
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBlog}
                disabled={creating}
                className="flex-1 bg-[var(--nuvi-primary)] hover:bg-[var(--nuvi-primary-hover)]"
              >
                {creating ? 'Creating...' : 'Create Blog'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}