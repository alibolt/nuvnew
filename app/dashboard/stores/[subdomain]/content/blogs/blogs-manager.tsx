'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, ExternalLink, 
  MoreVertical, ChevronLeft, ChevronRight, FileText, Clock, Globe,
  BookOpen, Calendar, MessageSquare
} from 'lucide-react';

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

export default function BlogsManager({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBlog, setNewBlog] = useState({ title: '', slug: '', description: '' });
  const [creating, setCreating] = useState(false);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchBlogs();
  }, [subdomain]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(Array.isArray(data) ? data : []);
      } else {
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
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
      const response = await fetch(`/api/stores/${subdomain}/blogs`, {
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

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog? All posts will be deleted.')) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/blogs/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBlogs.length} blogs? All posts will be deleted.`)) return;
    
    for (const blogId of selectedBlogs) {
      await fetch(`/api/stores/${subdomain}/blogs/${blogId}`, {
        method: 'DELETE',
      });
    }
    
    await fetchBlogs();
    setSelectedBlogs([]);
  };

  const handleSelectAll = () => {
    if (selectedBlogs.length === filteredBlogs.length) {
      setSelectedBlogs([]);
    } else {
      setSelectedBlogs(filteredBlogs.map(b => b.id));
    }
  };

  const handleSelectBlog = (blogId: string) => {
    if (selectedBlogs.includes(blogId)) {
      setSelectedBlogs(selectedBlogs.filter(id => id !== blogId));
    } else {
      setSelectedBlogs([...selectedBlogs, blogId]);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          blog.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (blog.description && blog.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Header - Minimal like Products */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Blogs</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your store blogs and articles</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Blog
        </button>
      </div>

      {/* Table Card */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {loading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <BookOpen className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No blogs yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first blog to start writing articles</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Blog
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Bulk Actions Bar */}
              {selectedBlogs.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedBlogs.length} blog{selectedBlogs.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="nuvi-btn nuvi-btn-sm nuvi-btn-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected
                  </button>
                </div>
              )}

              {/* Blogs Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedBlogs.length === filteredBlogs.length && filteredBlogs.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Blog</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Slug</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Posts</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Created</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          No blogs found matching your search
                        </td>
                      </tr>
                    ) : (
                      paginatedBlogs.map((blog) => (
                        <tr key={blog.id} className="nuvi-border-b">
                          <td className="nuvi-py-md nuvi-px-md">
                            <input
                              type="checkbox"
                              checked={selectedBlogs.includes(blog.id)}
                              onChange={() => handleSelectBlog(blog.id)}
                              className="nuvi-checkbox"
                            />
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                              <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                                <BookOpen className="h-5 w-5 nuvi-text-gray-500" />
                              </div>
                              <div>
                                <p className="nuvi-font-medium">{blog.title}</p>
                                {blog.description && (
                                  <p className="nuvi-text-sm nuvi-text-muted nuvi-line-clamp-1">
                                    {blog.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <code className="nuvi-text-sm">/{blog.slug}</code>
                              <a 
                                href={`http://localhost:3000/s/${subdomain}/blog/${blog.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nuvi-text-muted hover:nuvi-text-primary"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <MessageSquare className="h-4 w-4 nuvi-text-muted" />
                              <span className="nuvi-text-sm">
                                {blog._count.posts} {blog._count.posts === 1 ? 'post' : 'posts'}
                              </span>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <Calendar className="h-4 w-4 nuvi-text-muted" />
                              <p className="nuvi-text-sm nuvi-text-muted">
                                {new Date(blog.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                              <button 
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                onClick={() => window.open(`http://localhost:3000/s/${subdomain}/blog/${blog.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/dashboard/stores/${subdomain}/content/blogs/${blog.id}/posts`)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/dashboard/stores/${subdomain}/content/blogs/${blog.id}/edit`)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(blog.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBlogs.length)} of {filteredBlogs.length} blogs
                  </div>
                  
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const pageNum = startPage + i;
                        
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`nuvi-btn nuvi-btn-sm ${
                              pageNum === currentPage 
                                ? 'nuvi-btn-primary' 
                                : 'nuvi-btn-ghost'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Blog Modal */}
      {showCreateModal && (
        <div className="nuvi-modal-overlay">
          <div className="nuvi-modal">
            <div className="nuvi-modal-header">
              <h3 className="nuvi-text-lg nuvi-font-medium">Create New Blog</h3>
            </div>
            <div className="nuvi-modal-content">
              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  Blog Title <span className="nuvi-text-destructive">*</span>
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
                  className="nuvi-input"
                />
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={newBlog.slug}
                  onChange={(e) => setNewBlog({ ...newBlog, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="news-updates"
                  className="nuvi-input"
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                  Will be accessible at /blog/{newBlog.slug || 'slug'}
                </p>
              </div>

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  Description (optional)
                </label>
                <textarea
                  value={newBlog.description}
                  onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
                  placeholder="Brief description of this blog"
                  rows={3}
                  className="nuvi-textarea"
                />
              </div>
            </div>
            <div className="nuvi-modal-footer">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewBlog({ title: '', slug: '', description: '' });
                }}
                className="nuvi-btn nuvi-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBlog}
                disabled={creating}
                className="nuvi-btn nuvi-btn-primary"
              >
                {creating ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}