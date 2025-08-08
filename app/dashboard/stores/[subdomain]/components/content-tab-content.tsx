'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, FileEdit, ImageIcon, Menu, Plus, Settings, Search, Filter, Eye, Edit, MoreVertical,
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, Clock, Globe, User, Calendar,
  Folder, Grid, List, Image as ImageIconAlt
} from 'lucide-react';
import { MediaTabContent } from './media-tab-content';
import { NestedMenuManager } from '@/components/navigation/nested-menu-manager';
import { PageForm } from '../content/page-form';
import { BlogForm } from '../content/blog-form';
import PagesManagerComponent from '../content/pages/pages-manager';
import BlogPostsManagerComponent from '../content/blogs/blog-posts-manager';

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

type ContentView = 'dashboard' | 'pages' | 'blogs' | 'media' | 'menus' | 'page-editor' | 'blog-editor';

export function ContentTabContent({ store }: ContentTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('content_view') as ContentView | null;
  const editParam = searchParams.get('edit');
  
  // Use URL params as the source of truth instead of state
  const view = viewParam || 'dashboard';
  const editingItemId = editParam;
  const [currentMenu, setCurrentMenu] = useState<any>(null);

  // Load default menu when view is menus
  useEffect(() => {
    if (view === 'menus' && !currentMenu) {
      // Set a default menu structure
      setCurrentMenu({
        id: 'main-menu',
        name: 'Main Menu',
        handle: 'main-menu',
        location: 'header',
        items: []
      });
    }
  }, [view, currentMenu]);


  const handleViewChange = (newView: ContentView, itemId?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'content');
    
    if (newView !== 'dashboard') {
      params.set('content_view', newView);
    } else {
      params.delete('content_view');
    }
    
    if (itemId) {
      params.set('edit', itemId);
    } else {
      params.delete('edit');
    }
    
    router.push(`?${params.toString()}`);
  };

  const handleBack = () => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'content');
    params.delete('content_view');
    params.delete('edit');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'dashboard' ? (
        <ContentDashboard store={store} onViewChange={handleViewChange} />
      ) : view === 'pages' ? (
        <PagesManager store={store} onBack={handleBack} onEdit={(id) => handleViewChange('page-editor', id)} />
      ) : view === 'blogs' ? (
        <BlogsManager store={store} onBack={handleBack} onEdit={(id) => handleViewChange('blog-editor', id)} />
      ) : view === 'media' ? (
        <MediaManager store={store} onBack={handleBack} />
      ) : view === 'menus' ? (
        <MenusManagerWrapper 
          store={store} 
          onBack={handleBack} 
        />
      ) : view === 'page-editor' ? (
        <PageEditor store={store} pageId={editingItemId} onBack={() => handleViewChange('pages')} />
      ) : view === 'blog-editor' ? (
        <BlogEditor store={store} blogId={editingItemId} onBack={() => handleViewChange('blogs')} />
      ) : (
        <ContentDashboard store={store} onViewChange={handleViewChange} />
      )}
    </div>
  );
}

// Content Dashboard
function ContentDashboard({ store, onViewChange }: {
  store: StoreData;
  onViewChange: (view: ContentView) => void;
}) {
  const [pageCount, setPageCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);

  useEffect(() => {
    // Fetch page count
    fetch(`/api/stores/${store.subdomain}/pages`)
      .then(res => res.json())
      .then(result => {
        // Handle API response format { success: true, data: [...] }
        const pages = result.data || result || [];
        if (Array.isArray(pages)) {
          setPageCount(pages.length);
        }
      })
      .catch(err => console.error('Error fetching pages:', err));

    // Fetch media count
    fetch(`/api/stores/${store.subdomain}/media`)
      .then(res => res.json())
      .then(result => {
        // Handle API response format { success: true, data: { files: [...] } }
        let files = [];
        if (result.data?.files) {
          files = result.data.files;
        } else if (result.files) {
          files = result.files;
        } else if (Array.isArray(result.data)) {
          files = result.data;
        } else if (Array.isArray(result)) {
          files = result;
        }
        setMediaCount(files.length);
      })
      .catch(err => console.error('Error fetching media:', err));

    // Fetch blog posts count
    fetch(`/api/stores/${store.subdomain}/blog-posts`)
      .then(res => res.json())
      .then(result => {
        // Handle API response format { success: true, data: [...] }
        const posts = result.data || result || [];
        if (Array.isArray(posts)) {
          setBlogCount(posts.length);
        }
      })
      .catch(err => console.error('Error fetching blog posts:', err));
  }, [store.subdomain]);

  return (
    <>
      {/* Content Header */}
      <div className="nuvi-mb-lg">
        <h2 className="nuvi-text-2xl nuvi-font-bold">Content</h2>
        <p className="nuvi-text-secondary nuvi-text-sm">Manage pages, blogs, and media files</p>
      </div>

      {/* Content Types Grid */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
        <div className="nuvi-card nuvi-card-hover">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <FileText className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              Pages
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">{pageCount}</p>
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Create custom pages for your store
            </p>
            <button 
              onClick={() => onViewChange('pages')}
              className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full"
            >
              <Plus className="h-4 w-4" />
              Manage Pages
            </button>
          </div>
        </div>

        <div className="nuvi-card nuvi-card-hover">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <FileEdit className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              Blog Posts
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">{blogCount}</p>
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Share stories and updates
            </p>
            <button 
              onClick={() => onViewChange('blogs')}
              className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full"
            >
              <Plus className="h-4 w-4" />
              Manage Blog
            </button>
          </div>
        </div>

        <div className="nuvi-card nuvi-card-hover">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">
              <ImageIcon className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
              Media Library
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">{mediaCount}</p>
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
              Images, videos, and files
            </p>
            <button 
              onClick={() => onViewChange('media')}
              className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full"
            >
              <Plus className="h-4 w-4" />
              Media Library
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="nuvi-card nuvi-mt-lg">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">
            <Menu className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
            Navigation Menu
          </h3>
        </div>
        <div className="nuvi-card-content">
          <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
            Organize your store's navigation structure
          </p>
          <button 
            onClick={() => onViewChange('menus')}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Settings className="h-4 w-4" />
            Manage Menus
          </button>
        </div>
      </div>
    </>
  );
}

// Pages Manager
function PagesManager({ store, onBack, onEdit }: {
  store: StoreData;
  onBack: () => void;
  onEdit: (id: string) => void;
}) {
  return (
    <>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button 
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Use the PagesManagerComponent here */}
      <PagesManagerComponent subdomain={store.subdomain} />
    </>
  );
}

// Blogs Manager
function BlogsManager({ store, onBack, onEdit }: {
  store: StoreData;
  onBack: () => void;
  onEdit: (id: string) => void;
}) {
  return (
    <>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button 
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Blog</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Create and manage blog posts</p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={() => onEdit('new')}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Write Post
          </button>
        </div>
      </div>

      {/* Use the BlogPostsManagerComponent here */}
      <BlogPostsManagerComponent subdomain={store.subdomain} />
    </>
  );
}

// Media Manager
function MediaManager({ store, onBack }: {
  store: StoreData;
  onBack: () => void;
}) {
  return (
    <MediaTabContent store={store} />
  );
}

// Menus Manager Wrapper
function MenusManagerWrapper({ store, onBack }: {
  store: StoreData;
  onBack: () => void;
}) {
  return (
    <>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button 
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Nested Menu Manager */}
      <NestedMenuManager subdomain={store.subdomain} />
    </>
  );
}

// Page Editor
function PageEditor({ store, pageId, onBack }: {
  store: StoreData;
  pageId: string | null;
  onBack: () => void;
}) {
  const isNew = pageId === 'new';
  
  return (
    <>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button 
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isNew ? 'Create Page' : 'Edit Page'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isNew ? 'Create a new page' : 'Edit page content'}
            </p>
          </div>
        </div>
      </div>

      <PageForm 
        subdomain={store.subdomain} 
        pageId={isNew ? undefined : pageId || undefined}
        isNew={isNew}
      />
    </>
  );
}

// Blog Editor
function BlogEditor({ store, blogId, onBack }: {
  store: StoreData;
  blogId: string | null;
  onBack: () => void;
}) {
  const isNew = blogId === 'new';
  
  return (
    <>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button 
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isNew ? 'Write Post' : 'Edit Post'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isNew ? 'Create a new blog post' : 'Edit blog post'}
            </p>
          </div>
        </div>
      </div>

      <BlogForm 
        subdomain={store.subdomain} 
        blogId={blogId || undefined}
        isNew={isNew}
      />
    </>
  );
}