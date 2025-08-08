'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Eye, Edit, MoreVertical,
  CheckCircle, Clock, Trash2
} from 'lucide-react';
import { PageForm } from '../content/page-form';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface ContentTabContentProps {
  store: StoreData;
}

export function ContentTabContent({ store }: ContentTabContentProps) {
  const [contentView, setContentView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  
  // Pages data
  const [pages, setPages] = useState<any[]>([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [pagesSearchTerm, setPagesSearchTerm] = useState('');
  const [pagesStatusFilter, setPagesStatusFilter] = useState('all');

  // Fetch pages on mount
  useEffect(() => {
    fetchPages();
  }, [store.subdomain]);

  const fetchPages = async () => {
    setLoadingPages(true);
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/pages`);
      if (res.ok) {
        const result = await res.json();
        const pagesData = result.data || result || [];
        setPages(Array.isArray(pagesData) ? pagesData : []);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoadingPages(false);
    }
  };


  // Handle bulk actions for pages
  const handleSelectAllPages = () => {
    if (selectedPages.length === filteredPages.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(filteredPages.map(p => p.id));
    }
  };

  const handleSelectPage = (pageId: string) => {
    if (selectedPages.includes(pageId)) {
      setSelectedPages(selectedPages.filter(id => id !== pageId));
    } else {
      setSelectedPages([...selectedPages, pageId]);
    }
  };

  const handleBulkDeletePages = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPages.length} pages?`)) return;
    
    try {
      for (const pageId of selectedPages) {
        await fetch(`/api/stores/${store.subdomain}/pages/${pageId}`, {
          method: 'DELETE'
        });
      }
      await fetchPages();
      setSelectedPages([]);
    } catch (error) {
      console.error('Error deleting pages:', error);
      alert('Failed to delete some pages');
    }
  };

  const handleBulkStatusChangePages = async (status: string) => {
    try {
      for (const pageId of selectedPages) {
        await fetch(`/api/stores/${store.subdomain}/pages/${pageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      await fetchPages();
      setSelectedPages([]);
    } catch (error) {
      console.error('Error updating pages:', error);
      alert('Failed to update some pages');
    }
  };

  // Handle bulk actions for blogs
  const handleSelectAllBlogs = () => {
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

  const handleBulkDeleteBlogs = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedBlogs.length} blog posts?`)) return;
    
    try {
      for (const blogId of selectedBlogs) {
        await fetch(`/api/stores/${store.subdomain}/blog-posts/${blogId}`, {
          method: 'DELETE'
        });
      }
      await fetchBlogs();
      setSelectedBlogs([]);
    } catch (error) {
      console.error('Error deleting blogs:', error);
      alert('Failed to delete some blog posts');
    }
  };

  const handleBulkStatusChangeBlogs = async (status: string) => {
    try {
      for (const blogId of selectedBlogs) {
        await fetch(`/api/stores/${store.subdomain}/blog-posts/${blogId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
      }
      await fetchBlogs();
      setSelectedBlogs([]);
    } catch (error) {
      console.error('Error updating blogs:', error);
      alert('Failed to update some blog posts');
    }
  };

  // Filter pages
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(pagesSearchTerm.toLowerCase());
    const matchesStatus = pagesStatusFilter === 'all' || page.status === pagesStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEditPage = (pageId: string) => {
    setEditingItemId(pageId);
    setContentView('edit');
  };


  const handleCreateNew = () => {
    setEditingItemId('new');
    setContentView('create');
  };

  const handleBack = () => {
    setContentView('list');
    setEditingItemId(null);
    fetchPages();
  };

  return (
    <div>
      {/* Pages Content */}
        <div className="nuvi-sub-tab-content">
          {contentView === 'list' ? (
            <>
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
                <div>
                  <h3 className="nuvi-text-xl nuvi-font-semibold">Pages</h3>
                  <p className="nuvi-text-sm nuvi-text-secondary">Create and manage custom pages</p>
                </div>
                <button 
                  className="nuvi-btn nuvi-btn-primary"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4" />
                  Create Page
                </button>
              </div>

              {/* Search and Filter */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search pages..."
                      className="nuvi-input nuvi-pl-10"
                      value={pagesSearchTerm}
                      onChange={(e) => setPagesSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '150px' }}
                  value={pagesStatusFilter}
                  onChange={(e) => setPagesStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedPages.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => handleBulkStatusChangePages('published')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Publish
                    </button>
                    <button
                      onClick={() => handleBulkStatusChangePages('draft')}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                    >
                      <Clock className="h-4 w-4" />
                      Draft
                    </button>
                    <button
                      onClick={handleBulkDeletePages}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Pages Table */}
              <div className="nuvi-card">
                <div className="nuvi-card-content">
                  {loadingPages ? (
                    <div className="nuvi-text-center nuvi-py-xl">
                      <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
                      <p className="nuvi-text-muted">Loading pages...</p>
                    </div>
                  ) : filteredPages.length === 0 ? (
                    <div className="nuvi-text-center nuvi-py-xl">
                      <FileText className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                      <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No pages yet</h3>
                      <p className="nuvi-text-muted nuvi-mb-lg">Create your first page</p>
                      <button 
                        onClick={handleCreateNew}
                        className="nuvi-btn nuvi-btn-primary"
                      >
                        <Plus className="h-4 w-4" />
                        Create Page
                      </button>
                    </div>
                  ) : (
                    <div className="nuvi-overflow-x-auto">
                      <table className="nuvi-w-full">
                        <thead>
                          <tr className="nuvi-border-b">
                            <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                              <input
                                type="checkbox"
                                checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                                onChange={handleSelectAllPages}
                                className="nuvi-checkbox"
                              />
                            </th>
                            <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Title</th>
                            <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Slug</th>
                            <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                            <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Modified</th>
                            <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPages.map((page) => (
                            <tr key={page.id} className="nuvi-border-b">
                              <td className="nuvi-py-md nuvi-px-md">
                                <input
                                  type="checkbox"
                                  checked={selectedPages.includes(page.id)}
                                  onChange={() => handleSelectPage(page.id)}
                                  className="nuvi-checkbox"
                                />
                              </td>
                              <td className="nuvi-py-md nuvi-px-md">
                                <p className="nuvi-font-medium">{page.title}</p>
                              </td>
                              <td className="nuvi-py-md nuvi-px-md">
                                <span className="nuvi-text-sm nuvi-text-muted">/{page.slug}</span>
                              </td>
                              <td className="nuvi-py-md nuvi-px-md">
                                <span className={`nuvi-badge ${
                                  page.status === 'published' ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
                                }`}>
                                  {page.status}
                                </span>
                              </td>
                              <td className="nuvi-py-md nuvi-px-md">
                                <span className="nuvi-text-sm nuvi-text-muted">
                                  {new Date(page.updatedAt).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                                  <button 
                                    className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                    onClick={() => window.open(`/s/${store.subdomain}/pages/${page.slug}`, '_blank')}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleEditPage(page.id)}
                                    className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost">
                                    <MoreVertical className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : contentView === 'create' || contentView === 'edit' ? (
            <PageEditor 
              store={store} 
              pageId={editingItemId} 
              onBack={handleBack} 
            />
          ) : null}
        </div>
    </div>
  );
}

// Page Editor component
function PageEditor({ store, pageId, onBack }: {
  store: StoreData;
  pageId: string | null;
  onBack: () => void;
}) {
  const isNew = pageId === 'new';
  
  return (
    <PageForm 
      subdomain={store.subdomain} 
      pageId={isNew ? undefined : pageId || undefined}
      isNew={isNew}
      onBack={onBack}
    />
  );
}
