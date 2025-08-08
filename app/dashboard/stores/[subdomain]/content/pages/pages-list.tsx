'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceList } from '@/components/ui/resource-list';
import { 
  Plus, Eye, Edit, MoreVertical, Trash2, FileText, Globe,
  EyeOff, Calendar, Clock, ExternalLink
} from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metaDescription?: string;
}

interface PagesListProps {
  store: any;
}

export function PagesList({ store }: PagesListProps) {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${store.subdomain}/pages`);
      if (response.ok) {
        const result = await response.json();
        const pagesArray = result.data || result.pages || result || [];
        const pages = Array.isArray(pagesArray) ? pagesArray : [];
        setPages(pages);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/pages/${pageId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPages();
      } else {
        alert('Failed to delete page');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      alert('Failed to delete page');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} pages?`)) return;
    
    try {
      await Promise.all(
        selectedItems.map(id => 
          fetch(`/api/stores/${store.subdomain}/pages/${id}`, {
            method: 'DELETE'
          })
        )
      );
      
      setSelectedItems([]);
      fetchPages();
    } catch (error) {
      console.error('Error deleting pages:', error);
      alert('Failed to delete pages');
    }
  };

  const handleBulkPublish = async () => {
    try {
      await Promise.all(
        selectedItems.map(id => 
          fetch(`/api/stores/${store.subdomain}/pages/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPublished: true })
          })
        )
      );
      
      setSelectedItems([]);
      fetchPages();
    } catch (error) {
      console.error('Error publishing pages:', error);
      alert('Failed to publish pages');
    }
  };

  const bulkActions = [
    {
      content: 'Publish pages',
      onAction: handleBulkPublish
    },
    {
      content: 'Delete pages',
      onAction: handleBulkDelete,
      destructive: true
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const rowMarkup = (page: Page) => {
    const isSelected = selectedItems.includes(page.id);
    
    return (
      <div
        key={page.id}
        className={`nuvi-resource-item ${isSelected ? 'selected' : ''}`}
        onClick={() => {
          const newSelected = isSelected
            ? selectedItems.filter(id => id !== page.id)
            : [...selectedItems, page.id];
          setSelectedItems(newSelected);
        }}
      >
        <div className="nuvi-flex nuvi-items-center nuvi-gap-4 nuvi-flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {}}
            className="nuvi-checkbox"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="nuvi-flex nuvi-items-center nuvi-gap-3 nuvi-min-w-0 nuvi-flex-1">
            <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-primary/10 nuvi-rounded nuvi-flex nuvi-items-center nuvi-justify-center">
              <FileText className="nuvi-h-5 nuvi-w-5 nuvi-text-primary" />
            </div>
            <div className="nuvi-min-w-0">
              <h4 className="nuvi-font-medium nuvi-text-primary nuvi-truncate">{page.title}</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-truncate">
                /{page.slug}
                {page.metaDescription && ` • ${page.metaDescription.substring(0, 60)}...`}
              </p>
            </div>
          </div>

          <div className="nuvi-hidden md:nuvi-flex nuvi-items-center nuvi-gap-8 nuvi-ml-auto">
            <span className={`nuvi-badge ${
              page.isPublished ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
            }`}>
              {page.isPublished ? (
                <>
                  <Globe className="nuvi-h-3 nuvi-w-3 nuvi-mr-1" />
                  Published
                </>
              ) : (
                <>
                  <EyeOff className="nuvi-h-3 nuvi-w-3 nuvi-mr-1" />
                  Draft
                </>
              )}
            </span>
            
            <div className="nuvi-text-center">
              <span className="nuvi-text-sm nuvi-text-secondary">
                {formatDate(page.updatedAt)}
              </span>
              <p className="nuvi-text-xs nuvi-text-secondary">Updated</p>
            </div>
          </div>

          <div 
            className="nuvi-flex nuvi-items-center nuvi-gap-1" 
            onClick={(e) => e.stopPropagation()}
          >
            {page.isPublished && (
              <button
                onClick={() => window.open(`/s/${store.subdomain}/pages/${page.slug}`, '_blank')}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                title="View page"
              >
                <ExternalLink className="nuvi-h-4 nuvi-w-4" />
              </button>
            )}
            <button
              onClick={() => router.push(`/dashboard/stores/${store.subdomain}/content/pages/${page.id}/page-editor`)}
              className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              title="Edit page"
            >
              <Edit className="nuvi-h-4 nuvi-w-4" />
            </button>
            <button
              onClick={() => handleDelete(page.id)}
              className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-destructive"
              title="Delete page"
            >
              <Trash2 className="nuvi-h-4 nuvi-w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const publishedCount = pages.filter(p => p.isPublished).length;
  const draftCount = pages.filter(p => !p.isPublished).length;

  return (
    <ResourceList
      items={pages}
      resourceName={{ singular: 'page', plural: 'Pages' }}
      renderItem={rowMarkup}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      bulkActions={bulkActions}
      loading={loading}
      totalCount={pages.length}
      searchPlaceholder="Search pages..."
      primaryAction={{
        content: 'Create page',
        icon: Plus,
        onAction: () => router.push(`/dashboard/stores/${store.subdomain}/content?tab=content&content_view=page-editor&edit=new`)
      }}
      emptyState={{
        heading: 'No pages yet',
        description: 'Create your first page to start building your store content',
        action: {
          content: 'Create page',
          icon: Plus,
          onAction: () => router.push(`/dashboard/stores/${store.subdomain}/content?tab=content&content_view=page-editor&edit=new`)
        },
        image: <FileText className="nuvi-h-16 nuvi-w-16 nuvi-text-muted" />
      }}
      sortOptions={[
        { label: 'Title', value: 'title' },
        { label: 'Last updated', value: 'updated' },
        { label: 'Created date', value: 'created' },
        { label: 'Published date', value: 'published' }
      ]}
      filterOptions={[
        { label: 'All pages', value: 'all' },
        { label: 'Published', value: 'published' },
        { label: 'Drafts', value: 'draft' }
      ]}
      stats={[
        {
          label: 'Total Pages',
          value: pages.length,
          icon: FileText,
          color: 'primary'
        },
        {
          label: 'Published',
          value: publishedCount,
          icon: Globe,
          color: 'success'
        },
        {
          label: 'Drafts',
          value: draftCount,
          icon: EyeOff,
          color: 'warning'
        }
      ]}
    />
  );
}