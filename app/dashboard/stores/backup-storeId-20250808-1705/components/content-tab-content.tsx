'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, FileEdit, ImageIcon, Menu, Plus, Settings, Search, Filter, Eye, Edit, MoreVertical,
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, Clock, Globe, User, Calendar,
  Folder, Grid, List, Image as ImageIconAlt
} from 'lucide-react';
import { MediaLibrary } from '@/components/media/media-library';
import { MenuBuilder } from '@/components/menu/menu-builder';

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
  const [view, setView] = useState<ContentView>(viewParam || 'dashboard');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'content');
    if (view !== 'dashboard') {
      params.set('content_view', view);
    } else {
      params.delete('content_view');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, searchParams]);

  const handleViewChange = (newView: ContentView, itemId?: string) => {
    setView(newView);
    if (itemId) {
      setEditingItemId(itemId);
    } else {
      setEditingItemId(null);
    }
  };

  const handleBack = () => {
    setView('dashboard');
    setEditingItemId(null);
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
        <MenusManager 
          store={store} 
          onBack={handleBack} 
          currentMenu={currentMenu}
          setCurrentMenu={setCurrentMenu}
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
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">0</p>
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
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">0</p>
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
            <p className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">0</p>
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
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Pages</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Create and manage custom pages</p>
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
            Create Page
          </button>
        </div>
      </div>

      {/* Pages Stats */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Pages</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <FileText className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Published</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Draft</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Views</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <Eye className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Pages Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-text-center nuvi-py-xl">
            <FileText className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No pages yet</h3>
            <p className="nuvi-text-muted nuvi-mb-lg">Create your first page to get started</p>
            <button 
              onClick={() => onEdit('new')}
              className="nuvi-btn nuvi-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Create Page
            </button>
          </div>
        </div>
      </div>
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

      {/* Blog Stats */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Total Posts</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <FileEdit className="h-6 w-6 nuvi-text-primary" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Published</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <CheckCircle className="h-6 w-6 nuvi-text-success" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Draft</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <Clock className="h-6 w-6 nuvi-text-warning" />
            </div>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <p className="nuvi-text-sm nuvi-text-secondary">Views</p>
                <p className="nuvi-text-2xl nuvi-font-bold">0</p>
              </div>
              <Eye className="h-6 w-6 nuvi-text-info" />
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-text-center nuvi-py-xl">
            <FileEdit className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No blog posts yet</h3>
            <p className="nuvi-text-muted nuvi-mb-lg">Write your first blog post to get started</p>
            <button 
              onClick={() => onEdit('new')}
              className="nuvi-btn nuvi-btn-primary"
            >
              <Plus className="h-4 w-4" />
              Write Post
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Media Manager
function MediaManager({ store, onBack }: {
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
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Media Library</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Manage images, videos, and files</p>
          </div>
        </div>
      </div>

      {/* Media Library Component */}
      <div className="nuvi-card">
        <div className="nuvi-card-content nuvi-p-0">
          <MediaLibrary 
            storeId={store.id}
            selectionMode="multiple"
            onSelect={(files) => {
              console.log('Selected files:', files);
            }}
          />
        </div>
      </div>
    </>
  );
}

// Menus Manager
function MenusManager({ store, onBack, currentMenu, setCurrentMenu }: {
  store: StoreData;
  onBack: () => void;
  currentMenu: any;
  setCurrentMenu: (menu: any) => void;
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
            <h2 className="nuvi-text-2xl nuvi-font-bold">Navigation Menus</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Organize your store's navigation</p>
          </div>
        </div>
      </div>

      {/* Menu Builder Component */}
      <div className="nuvi-card">
        <div className="nuvi-card-content nuvi-p-0">
          <MenuBuilder 
            menu={currentMenu}
            storeId={store.id}
            onSave={(menu) => {
              console.log('Menu saved:', menu);
              setCurrentMenu(menu);
            }}
            onCancel={() => {
              console.log('Menu cancelled');
            }}
          />
        </div>
      </div>
    </>
  );
}

// Page Editor Placeholder
function PageEditor({ store, pageId, onBack }: {
  store: StoreData;
  pageId: string | null;
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
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {pageId === 'new' ? 'Create Page' : 'Edit Page'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {pageId === 'new' ? 'Create a new page' : 'Edit page content'}
            </p>
          </div>
        </div>
      </div>

      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-text-center nuvi-py-xl">
            <FileText className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">Page Editor</h3>
            <p className="nuvi-text-muted">Page editor integration coming soon</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Blog Editor Placeholder
function BlogEditor({ store, blogId, onBack }: {
  store: StoreData;
  blogId: string | null;
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
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {blogId === 'new' ? 'Write Post' : 'Edit Post'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {blogId === 'new' ? 'Create a new blog post' : 'Edit blog post'}
            </p>
          </div>
        </div>
      </div>

      <div className="nuvi-card">
        <div className="nuvi-card-content">
          <div className="nuvi-text-center nuvi-py-xl">
            <FileEdit className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">Blog Editor</h3>
            <p className="nuvi-text-muted">Blog editor integration coming soon</p>
          </div>
        </div>
      </div>
    </>
  );
}