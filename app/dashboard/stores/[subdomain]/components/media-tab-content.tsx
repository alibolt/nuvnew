'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Image as ImageIcon, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Folder, TrendingUp, Package,
  ChevronLeft, ChevronRight, FileText, Video, File
} from 'lucide-react';
import { MediaUpload } from '@/components/media/media-upload';
import { MediaEditForm } from '@/components/media/media-edit-form';

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

interface MediaTabContentProps {
  store: StoreData;
}

type ViewType = 'list' | 'upload' | 'edit';

export function MediaTabContent({ store }: MediaTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as ViewType | null;
  const [view, setView] = useState<ViewType>(viewParam || 'list');
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'content');
    params.set('content_view', 'media');
    if (view !== 'list') {
      params.set('view', view);
    } else {
      params.delete('view');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, searchParams]);

  const handleViewChange = (newView: ViewType, mediaId?: string) => {
    setView(newView);
    if (mediaId) {
      setEditingMediaId(mediaId);
    } else {
      setEditingMediaId(null);
    }
  };

  const handleBack = () => {
    setView('list');
    setEditingMediaId(null);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <MediaListView 
          store={store} 
          onViewChange={handleViewChange}
          refreshKey={refreshKey}
        />
      ) : view === 'upload' ? (
        <MediaUploadView 
          store={store} 
          onBack={handleBack}
          onSuccess={handleRefresh}
        />
      ) : (
        <MediaEditView 
          store={store} 
          mediaId={editingMediaId}
          onBack={handleBack}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}

// Media List View
function MediaListView({ 
  store, 
  onViewChange, 
  refreshKey 
}: { 
  store: StoreData; 
  onViewChange: (view: ViewType, mediaId?: string) => void;
  refreshKey: number;
}) {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch media files
  useEffect(() => {
    fetchMediaFiles();
  }, [refreshKey]);

  const fetchMediaFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${store.subdomain}/media`);
      if (response.ok) {
        const result = await response.json();
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
        setMediaFiles(files);
      } else {
        setMediaFiles([]);
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort media files
  const filteredMedia = (Array.isArray(mediaFiles) ? mediaFiles : [])
    .filter(media => {
      const matchesSearch = media.originalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           media.alt?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || 
                         (filterType === 'images' && media.mimeType?.startsWith('image/')) ||
                         (filterType === 'videos' && media.mimeType?.startsWith('video/')) ||
                         (filterType === 'documents' && !media.mimeType?.startsWith('image/') && !media.mimeType?.startsWith('video/'));
      return matchesSearch && matchesType;
    });

  const safeMediaFiles = Array.isArray(mediaFiles) ? mediaFiles : [];
  const stats = {
    total: safeMediaFiles.length,
    images: safeMediaFiles.filter(m => m.mimeType?.startsWith('image/')).length,
    videos: safeMediaFiles.filter(m => m.mimeType?.startsWith('video/')).length,
    documents: safeMediaFiles.filter(m => !m.mimeType?.startsWith('image/') && !m.mimeType?.startsWith('video/')).length,
    totalSize: safeMediaFiles.reduce((sum, m) => sum + (m.fileSize || 0), 0)
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return ImageIcon;
    if (mimeType?.startsWith('video/')) return Video;
    return FileText;
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/media/${mediaId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchMediaFiles(); // Refresh list
      } else {
        alert('Failed to delete file');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  return (
    <>
      {/* Header */}
      <div className="nuvi-mb-lg">
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Media Library</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Manage your images, videos, and files</p>
          </div>
          <button 
            onClick={() => onViewChange('upload')}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>
        </div>

        {/* Stats Cards */}
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Total Files</p>
                  <p className="nuvi-text-2xl nuvi-font-bold">{stats.total}</p>
                </div>
                <File className="h-6 w-6 nuvi-text-primary" />
              </div>
            </div>
          </div>
          
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Images</p>
                  <p className="nuvi-text-2xl nuvi-font-bold">{stats.images}</p>
                </div>
                <ImageIcon className="h-6 w-6 nuvi-text-success" />
              </div>
            </div>
          </div>
          
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Videos</p>
                  <p className="nuvi-text-2xl nuvi-font-bold">{stats.videos}</p>
                </div>
                <Video className="h-6 w-6 nuvi-text-info" />
              </div>
            </div>
          </div>
          
          <div className="nuvi-card nuvi-card-compact">
            <div className="nuvi-card-content">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Storage</p>
                  <p className="nuvi-text-2xl nuvi-font-bold">{formatFileSize(stats.totalSize)}</p>
                </div>
                <TrendingUp className="h-6 w-6 nuvi-text-warning" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="nuvi-flex nuvi-flex-col nuvi-md:flex-row nuvi-gap-md nuvi-items-center nuvi-justify-between">
          <div className="nuvi-flex nuvi-gap-sm nuvi-w-full nuvi-md:w-auto">
            <div className="nuvi-relative nuvi-flex-grow nuvi-w-full nuvi-md:w-80">
              <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 nuvi-transform nuvi--translate-y-1/2 nuvi-text-muted h-4 w-4" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="nuvi-input nuvi-pl-10 nuvi-w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="nuvi-select nuvi-w-32 nuvi-shrink-0"
            >
              <option value="all">All</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="documents">Documents</option>
            </select>
          </div>
          
          <div className="nuvi-flex nuvi-gap-sm">
            <div className="nuvi-btn-group">
              <button
                onClick={() => setViewMode('grid')}
                className={`nuvi-btn nuvi-btn-sm ${viewMode === 'grid' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`nuvi-btn nuvi-btn-sm ${viewMode === 'list' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="nuvi-text-center nuvi-py-xl">
          <div className="nuvi-animate-spin nuvi-inline-block nuvi-w-8 nuvi-h-8 nuvi-border-4 nuvi-border-current nuvi-border-t-transparent nuvi-rounded-full"></div>
          <p className="nuvi-mt-sm nuvi-text-muted">Loading files...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="nuvi-text-center nuvi-py-xl">
              <ImageIcon className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">
                {searchTerm || filterType !== 'all' ? 'No files found' : 'No files yet'}
              </h3>
              <p className="nuvi-text-muted nuvi-mb-lg">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter' 
                  : 'Upload your first files to get started'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <button 
                  onClick={() => onViewChange('upload')}
                  className="nuvi-btn nuvi-btn-primary"
                >
                  <Upload className="h-4 w-4" />
                  Upload Files
                </button>
              )}
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-lg:grid-cols-4 nuvi-gap-md">
          {filteredMedia.map((media) => {
            const Icon = getFileIcon(media.mimeType);
            return (
              <div key={media.id} className="nuvi-card nuvi-card-hover">
                <div className="nuvi-card-content nuvi-p-0">
                  <div className="nuvi-relative nuvi-aspect-square nuvi-bg-muted nuvi-rounded-t nuvi-overflow-hidden">
                    {media.mimeType?.startsWith('image/') ? (
                      <>
                        <img 
                          src={media.fileUrl || media.url} 
                          alt={media.alt || media.originalName}
                          className="nuvi-w-full nuvi-h-full nuvi-object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('nuvi-hidden');
                          }}
                        />
                        <div className="nuvi-hidden nuvi-w-full nuvi-h-full nuvi-flex nuvi-items-center nuvi-justify-center">
                          <Icon className="h-12 w-12 nuvi-text-muted-foreground" />
                        </div>
                      </>
                    ) : (
                      <div className="nuvi-w-full nuvi-h-full nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Icon className="h-12 w-12 nuvi-text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="nuvi-p-md">
                    <h4 className="nuvi-font-medium nuvi-text-sm nuvi-truncate nuvi-mb-xs">
                      {(media.originalName || media.fileName || 'Untitled').length > 15 
                        ? (media.originalName || media.fileName || 'Untitled').substring(0, 15) + '...' 
                        : (media.originalName || media.fileName || 'Untitled')}
                    </h4>
                    <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-md">
                      {formatFileSize(media.fileSize || 0)}
                    </p>
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                      <span className="nuvi-text-xs nuvi-text-secondary">
                        {media.mimeType?.split('/')[0] || 'file'}
                      </span>
                      <div className="nuvi-flex nuvi-gap-xs">
                        <button
                          onClick={() => onViewChange('edit', media.id)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(media.id)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-destructive"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-0">
            <div className="nuvi-overflow-x-auto">
              <table className="nuvi-table">
                <thead>
                  <tr className="nuvi-border-b">
                    <th className="nuvi-text-left nuvi-p-md">File</th>
                    <th className="nuvi-text-left nuvi-p-md">Type</th>
                    <th className="nuvi-text-left nuvi-p-md">Size</th>
                    <th className="nuvi-text-left nuvi-p-md">Uploaded</th>
                    <th className="nuvi-text-right nuvi-p-md">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedia.map((media) => {
                    const Icon = getFileIcon(media.mimeType);
                    return (
                      <tr key={media.id} className="nuvi-border-b nuvi-hover:bg-muted/50">
                        <td className="nuvi-p-md">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                            {media.mimeType?.startsWith('image/') ? (
                              <>
                                <img 
                                  src={media.fileUrl || media.url} 
                                  alt={media.alt || media.originalName}
                                  className="nuvi-w-12 nuvi-h-12 nuvi-object-cover nuvi-rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('nuvi-hidden');
                                  }}
                                />
                                <div className="nuvi-hidden nuvi-w-12 nuvi-h-12 nuvi-bg-muted nuvi-rounded nuvi-flex nuvi-items-center nuvi-justify-center">
                                  <Icon className="h-6 w-6 nuvi-text-muted-foreground" />
                                </div>
                              </>
                            ) : (
                              <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-muted nuvi-rounded nuvi-flex nuvi-items-center nuvi-justify-center">
                                <Icon className="h-6 w-6 nuvi-text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <h4 className="nuvi-font-medium">
                                {(media.originalName || media.fileName || 'Untitled').length > 15 
                                  ? (media.originalName || media.fileName || 'Untitled').substring(0, 15) + '...' 
                                  : (media.originalName || media.fileName || 'Untitled')}
                              </h4>
                              <p className="nuvi-text-sm nuvi-text-muted">
                                {media.alt || 'No description'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="nuvi-p-md">
                          <span className="nuvi-text-sm">{media.mimeType || 'Unknown'}</span>
                        </td>
                        <td className="nuvi-p-md">
                          <span className="nuvi-text-sm">{formatFileSize(media.fileSize || 0)}</span>
                        </td>
                        <td className="nuvi-p-md">
                          <span className="nuvi-text-sm nuvi-text-muted">
                            {media.createdAt ? new Date(media.createdAt).toLocaleDateString() : 'Unknown'}
                          </span>
                        </td>
                        <td className="nuvi-p-md nuvi-text-right">
                          <div className="nuvi-flex nuvi-gap-xs nuvi-justify-end">
                            <button
                              onClick={() => onViewChange('edit', media.id)}
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(media.id)}
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-destructive"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Media Upload View
function MediaUploadView({ 
  store, 
  onBack, 
  onSuccess 
}: { 
  store: StoreData; 
  onBack: () => void;
  onSuccess: () => void;
}) {
  return (
    <div>
      <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-lg">
        <button 
          onClick={onBack}
          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Upload Files</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Add images, videos, and documents to your library</p>
        </div>
      </div>
      
      <MediaUpload 
        subdomain={store.subdomain}
        onSuccess={() => {
          onSuccess();
          onBack();
        }}
        onCancel={onBack}
      />
    </div>
  );
}

// Media Edit View
function MediaEditView({ 
  store, 
  mediaId, 
  onBack, 
  onSuccess 
}: { 
  store: StoreData; 
  mediaId: string | null;
  onBack: () => void;
  onSuccess: () => void;
}) {
  if (!mediaId) {
    return null;
  }
  
  return (
    <div>
      <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-lg">
        <button 
          onClick={onBack}
          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Edit File</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Update file details and metadata</p>
        </div>
      </div>
      
      <MediaEditForm 
        subdomain={store.subdomain}
        mediaId={mediaId}
      />
    </div>
  );
}