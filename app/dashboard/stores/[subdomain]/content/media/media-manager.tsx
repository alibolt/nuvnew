'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Trash2, Eye, Search, ExternalLink, Download,
  MoreVertical, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Video, File, Upload, Calendar, HardDrive
} from 'lucide-react';

interface MediaFile {
  id: string;
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  alt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MediaManager({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchMediaFiles();
  }, [subdomain]);

  const fetchMediaFiles = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/media`);
      if (response.ok) {
        const result = await response.json();
        // Handle different API response formats
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

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMediaFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} files?`)) return;
    
    for (const fileId of selectedFiles) {
      await fetch(`/api/stores/${subdomain}/media/${fileId}`, {
        method: 'DELETE',
      });
    }
    
    await fetchMediaFiles();
    setSelectedFiles([]);
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const handleSelectFile = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
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
    return File;
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = file.originalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          file.alt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                       (typeFilter === 'images' && file.mimeType?.startsWith('image/')) ||
                       (typeFilter === 'videos' && file.mimeType?.startsWith('video/')) ||
                       (typeFilter === 'documents' && !file.mimeType?.startsWith('image/') && !file.mimeType?.startsWith('video/'));
    return matchesSearch && matchesType;
  });

  // Statistics
  const stats = {
    images: mediaFiles.filter(f => f.mimeType?.startsWith('image/')).length,
    videos: mediaFiles.filter(f => f.mimeType?.startsWith('video/')).length,
    documents: mediaFiles.filter(f => !f.mimeType?.startsWith('image/') && !f.mimeType?.startsWith('video/')).length
  };

  // Pagination
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const paginatedFiles = filteredFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      {/* Header - Minimal like Products */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Media Library</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your store images, videos and documents</p>
        </div>
        <button 
          onClick={() => router.push(`/dashboard/stores/${subdomain}/content/media/upload`)}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Upload className="h-4 w-4" />
          Upload Files
        </button>
      </div>

      {/* Table Card */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {loading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading media files...</p>
            </div>
          ) : mediaFiles.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <ImageIcon className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No files yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Upload your first files to get started</p>
              <button 
                onClick={() => router.push(`/dashboard/stores/${subdomain}/content/media/upload`)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Upload className="h-4 w-4" />
                Upload Files
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
                      placeholder="Search files..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Files ({mediaFiles.length})</option>
                  <option value="images">Images ({stats.images})</option>
                  <option value="videos">Videos ({stats.videos})</option>
                  <option value="documents">Documents ({stats.documents})</option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedFiles.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
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

              {/* Files Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">File</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Type</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Size</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Uploaded</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedFiles.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          No files found matching your filters
                        </td>
                      </tr>
                    ) : (
                      paginatedFiles.map((file) => {
                        const Icon = getFileIcon(file.mimeType);
                        return (
                          <tr key={file.id} className="nuvi-border-b">
                            <td className="nuvi-py-md nuvi-px-md">
                              <input
                                type="checkbox"
                                checked={selectedFiles.includes(file.id)}
                                onChange={() => handleSelectFile(file.id)}
                                className="nuvi-checkbox"
                              />
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                                {file.mimeType?.startsWith('image/') ? (
                                  <img 
                                    src={file.fileUrl} 
                                    alt={file.alt || file.originalName}
                                    className="nuvi-w-10 nuvi-h-10 nuvi-object-cover nuvi-rounded-lg"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('nuvi-hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`nuvi-w-10 nuvi-h-10 nuvi-bg-gray-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center ${file.mimeType?.startsWith('image/') ? 'nuvi-hidden' : ''}`}>
                                  <Icon className="h-5 w-5 nuvi-text-gray-500" />
                                </div>
                                <div>
                                  <p className="nuvi-font-medium">{file.originalName}</p>
                                  {file.alt && (
                                    <p className="nuvi-text-sm nuvi-text-muted">{file.alt}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <span className="nuvi-badge nuvi-badge-secondary">
                                {file.mimeType?.split('/')[0] || 'file'}
                              </span>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <HardDrive className="h-4 w-4 nuvi-text-muted" />
                                <span className="nuvi-text-sm">{formatFileSize(file.fileSize)}</span>
                              </div>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <Calendar className="h-4 w-4 nuvi-text-muted" />
                                <p className="nuvi-text-sm nuvi-text-muted">
                                  {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                                <a 
                                  href={file.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <Eye className="h-4 w-4" />
                                </a>
                                <a 
                                  href={file.fileUrl}
                                  download={file.originalName}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                                <button 
                                  onClick={() => router.push(`/dashboard/stores/${subdomain}/content/media/${file.id}/edit`)}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(file.id)}
                                  className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost nuvi-text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredFiles.length)} of {filteredFiles.length} files
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