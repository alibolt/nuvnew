'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Eye, EyeOff, Search, ExternalLink, 
  MoreVertical, ChevronLeft, ChevronRight, FileText, Clock, Globe
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function PagesManager({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchPages();
  }, [subdomain]);

  const fetchPages = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/pages`);
      if (response.ok) {
        const result = await response.json();
        const pagesArray = result.data || result.pages || result || [];
        const pages = Array.isArray(pagesArray) ? pagesArray : [];
        setPages(pages);
      } else {
        setPages([]);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPages();
      }
    } catch (error) {
      console.error('Error deleting page:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPages.length} pages?`)) return;
    
    for (const pageId of selectedPages) {
      await fetch(`/api/stores/${subdomain}/pages/${pageId}`, {
        method: 'DELETE',
      });
    }
    
    await fetchPages();
    setSelectedPages([]);
  };

  const handleSelectAll = () => {
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

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          page.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && page.isPublished) ||
                         (statusFilter === 'draft' && !page.isPublished);
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPages.length / itemsPerPage);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Header - Minimal like Products */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Pages</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your store pages</p>
        </div>
        <button 
          onClick={() => router.push(`/dashboard/stores/${subdomain}/content/pages/new`)}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Page
        </button>
      </div>

      {/* Table Card */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {loading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <FileText className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No pages yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first page to get started</p>
              <button 
                onClick={() => router.push(`/dashboard/stores/${subdomain}/content/pages/new`)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Page
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
                      placeholder="Search pages..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status ({pages.length})</option>
                  <option value="published">Published ({pages.filter(p => p.isPublished).length})</option>
                  <option value="draft">Draft ({pages.filter(p => !p.isPublished).length})</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedPages.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedPages.length} page{selectedPages.length > 1 ? 's' : ''} selected
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

              {/* Pages Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedPages.length === filteredPages.length && filteredPages.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Page</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Slug</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Last Updated</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          No pages found matching your filters
                        </td>
                      </tr>
                    ) : (
                      paginatedPages.map((page) => (
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
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                              <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                                <FileText className="h-5 w-5 nuvi-text-gray-500" />
                              </div>
                              <div>
                                <p className="nuvi-font-medium">{page.title}</p>
                                <p className="nuvi-text-sm nuvi-text-muted">
                                  Created {new Date(page.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                              <code className="nuvi-text-sm">/{page.slug}</code>
                              <a 
                                href={`http://localhost:3000/s/${subdomain}/pages/${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="nuvi-text-muted hover:nuvi-text-primary"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className={`nuvi-badge ${
                              page.isPublished ? 'nuvi-badge-success' : 'nuvi-badge-warning'
                            }`}>
                              {page.isPublished ? (
                                <><Globe className="h-3 w-3" /> Published</>
                              ) : (
                                <><Clock className="h-3 w-3" /> Draft</>
                              )}
                            </span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <p className="nuvi-text-sm nuvi-text-muted">
                              {new Date(page.updatedAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                              <button 
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                onClick={() => window.open(`http://localhost:3000/s/${subdomain}/pages/${page.slug}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => router.push(`/dashboard/stores/${subdomain}/content/pages/${page.id}`)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(page.id)}
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
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPages.length)} of {filteredPages.length} pages
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
    </>
  );
}