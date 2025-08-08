'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  X, 
  Check, 
  Loader2, 
  Grid,
  List,
  ChevronLeft,
  Link
} from 'lucide-react';

interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  fileSize: number;
  metadata?: {
    title?: string;
    alt?: string;
    caption?: string;
    tags?: string[];
    folder?: string;
  };
  createdAt: string;
  usage?: string[];
}

interface ImagePickerPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  subdomain: string;
  currentValue?: string;
  title?: string;
  description?: string;
  allowedTypes?: string[];
  context?: string;
  contextId?: string;
}

export function ImagePickerPanel({
  isOpen,
  onClose,
  onSelect,
  subdomain,
  currentValue,
  title = 'Choose Image',
  description = 'Select an image from your media library or upload a new one',
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  context = 'theme',
  contextId
}: ImagePickerPanelProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentValue || '');
  const [activeTab, setActiveTab] = useState('library');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(-1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load media files
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setMediaFiles([]);
      setHasMore(true);
      loadMediaFiles(1, true);
      // Ensure file input is hidden
      if (fileInputRef.current) {
        fileInputRef.current.style.display = 'none';
      }
    }
  }, [isOpen, subdomain]);

  const loadMediaFiles = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const limit = 50;
      const offset = (pageNum - 1) * limit;
      
      const params = new URLSearchParams({
        type: 'image',
        limit: limit.toString(),
        offset: offset.toString()
      });
      
      if (context) params.append('context', context);
      if (contextId) params.append('contextId', contextId);
      
      const response = await fetch(`/api/stores/${subdomain}/media?${params}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Media API error:', response.status, errorText);
        throw new Error(`Failed to load media files: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Media API response:', data);
      const newFiles = data.files || [];
      
      if (reset) {
        setMediaFiles(newFiles);
      } else {
        // Prevent duplicates by checking existing IDs
        setMediaFiles(prev => {
          const existingIds = new Set(prev.map(f => f.id));
          const uniqueNewFiles = newFiles.filter(f => !existingIds.has(f.id));
          return [...prev, ...uniqueNewFiles];
        });
      }
      
      // Check if there are more files to load
      if (newFiles.length < limit) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Load media error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load media files');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreImages = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadMediaFiles(nextPage, false);
  }, [page, loadingMore, hasMore]);

  // Infinite scroll observer
  useEffect(() => {
    if (!isOpen || !hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMoreImages();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const currentRef = loadingRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [isOpen, hasMore, loadingMore, loading, loadMoreImages]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      setError(`File type ${file.type} is not allowed`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Upload file using FormData
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await fetch(`/api/stores/${subdomain}/media/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error('Upload error:', uploadRes.status, errorText);
        throw new Error('Failed to upload file');
      }

      const { url, media } = await uploadRes.json();
      console.log('Upload response:', { url, media });

      // Set the uploaded file as selected
      if (media) {
        setSelectedFile(media);
      }

      // Reload media files to show the new upload
      setPage(1);
      setMediaFiles([]);
      setHasMore(true);
      await loadMediaFiles(1, true);
      
      // Set uploading to false after successful upload
      setUploading(false);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
      setUploading(false);
    }
  };

  const handleSelect = () => {
    if (selectedFile) {
      onSelect(selectedFile.fileUrl);
      onClose();
    }
  };

  const handleUrlSelect = () => {
    if (urlInput.trim()) {
      onSelect(urlInput.trim());
      onClose();
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch = !searchTerm || 
      file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.metadata?.alt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Get search results for dropdown
  const searchResults = searchTerm.length >= 3 ? filteredFiles.slice(0, 5) : [];
  
  // Debug log
  console.log('Image picker panel - filtered files count:', filteredFiles.length);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-white" style={{ 
      width: '100%',
      minWidth: '500px',
      position: 'relative'
    }}>
      {/* Header */}
      <div className="px-4 py-2 border-b flex-shrink-0">
        <div className="flex items-start gap-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors mt-0.5"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2 mx-4 mt-2 mb-2 flex-shrink-0">
            <TabsTrigger value="library" className="flex items-center justify-center gap-1.5 text-xs">
              <ImageIcon className="w-3 h-3" />
              Media Library
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center justify-center gap-1.5 text-xs">
              <Link className="w-3 h-3" />
              From URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="mt-0 p-0 flex-1 overflow-hidden flex flex-col data-[state=active]:flex" style={{ minHeight: 0 }}>
            {/* Controls */}
            <div className="px-4 py-2 flex-shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSearchResults(e.target.value.length >= 3);
                        setSelectedSearchIndex(-1);
                      }}
                      onFocus={() => {
                        setSearchFocused(true);
                        setShowSearchResults(searchTerm.length >= 3);
                      }}
                      onBlur={() => {
                        // Delay to allow clicking on results
                        setTimeout(() => {
                          setSearchFocused(false);
                          setShowSearchResults(false);
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (!showSearchResults || searchResults.length === 0) return;
                        
                        switch (e.key) {
                          case 'ArrowDown':
                            e.preventDefault();
                            setSelectedSearchIndex(prev => 
                              prev < searchResults.length - 1 ? prev + 1 : 0
                            );
                            break;
                          case 'ArrowUp':
                            e.preventDefault();
                            setSelectedSearchIndex(prev => 
                              prev > 0 ? prev - 1 : searchResults.length - 1
                            );
                            break;
                          case 'Enter':
                            e.preventDefault();
                            if (selectedSearchIndex >= 0 && searchResults[selectedSearchIndex]) {
                              setSelectedFile(searchResults[selectedSearchIndex]);
                              setSearchTerm('');
                              setShowSearchResults(false);
                              setSelectedSearchIndex(-1);
                            }
                            break;
                          case 'Escape':
                            setShowSearchResults(false);
                            setSelectedSearchIndex(-1);
                            break;
                        }
                      }}
                      className="pl-8 h-9 w-full"
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((file, index) => (
                          <div
                            key={file.id}
                            className={cn(
                              "flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer transition-colors",
                              selectedSearchIndex === index && "bg-blue-50"
                            )}
                            onClick={() => {
                              setSelectedFile(file);
                              setSearchTerm('');
                              setShowSearchResults(false);
                              setSelectedSearchIndex(-1);
                            }}
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={file.thumbnailUrl || file.fileUrl}
                                alt={file.metadata?.alt || file.fileName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.fileName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                            {selectedFile?.id === file.id && (
                              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No Results Message */}
                    {showSearchResults && searchTerm.length >= 3 && searchResults.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-3">
                        <p className="text-sm text-gray-500 text-center">No images found</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setViewMode('grid')}
                    title="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'
                    )}
                    onClick={() => setViewMode('list')}
                    title="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  size="sm"
                  variant="secondary"
                  className="gap-1"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>Upload</span>
                </Button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mx-4 mb-3">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              </div>
            )}

            {/* Media Grid/List */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pb-2" style={{ minHeight: 0, maxHeight: 'calc(100vh - 300px)' }}>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="w-12 h-12 mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No images found</p>
                  <p className="text-xs text-gray-500 mt-1">Upload your first image to get started</p>
                </div>
              ) : (
                <div className={cn(
                  'w-full',
                  viewMode === 'grid' 
                    ? 'grid grid-cols-5 gap-3 pb-4' 
                    : 'space-y-1'
                )}>
                  {filteredFiles.map(file => (
                    <div
                      key={file.id}
                      className={cn(
                        'group border rounded-md cursor-pointer transition-all hover:shadow-lg hover:border-gray-300',
                        selectedFile?.id === file.id && 'ring-2 ring-blue-500',
                        viewMode === 'list' ? 'flex items-center gap-2 p-2' : 'p-1'
                      )}
                      onClick={() => setSelectedFile(file)}
                    >
                      {viewMode === 'grid' ? (
                        <>
                          <div className="relative pb-[100%] bg-gray-50 rounded overflow-hidden">
                            <img
                              src={file.thumbnailUrl || file.fileUrl}
                              alt={file.metadata?.alt || file.fileName}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                              }}
                            />
                            {selectedFile?.id === file.id && (
                              <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div className="mt-1 px-0.5">
                            <p className="text-[10px] font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity duration-200" title={file.fileName}>{file.fileName}</p>
                            <p className="text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">{formatFileSize(file.fileSize)}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 bg-gray-50 rounded flex-shrink-0 overflow-hidden">
                            <img
                              src={file.thumbnailUrl || file.fileUrl}
                              alt={file.metadata?.alt || file.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpolyline points="21 15 16 10 5 21"/%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{file.fileName}</p>
                            <p className="text-[10px] text-gray-500">{formatFileSize(file.fileSize)}</p>
                          </div>
                          {selectedFile?.id === file.id && (
                            <div className="bg-blue-500 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              
              {/* Loading indicator for infinite scroll */}
              {hasMore && (
                <div ref={loadingRef} className="py-4 flex justify-center">
                  {loadingMore && (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  )}
                </div>
              )}
            </div>

            {/* Select Button */}
            <div className="px-4 py-2 border-t flex-shrink-0 bg-white" style={{ borderTop: '1px solid #e5e7eb' }}>
              <Button 
                onClick={handleSelect}
                disabled={!selectedFile}
                className="w-full"
                size="sm"
                variant="primary"
              >
                Select Image
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="url" className="p-0 flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Image URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="h-9 w-full"
                  />
                </div>
                
                {urlInput && (
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-2">Preview:</p>
                    <div className="flex items-center justify-center min-h-[120px] bg-gray-50 rounded">
                      <img
                        src={urlInput}
                        alt="Preview"
                        className="max-w-full max-h-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 py-3 border-t flex-shrink-0">
              <Button 
                onClick={handleUrlSelect}
                disabled={!urlInput.trim()}
                className="w-full"
                size="sm"
                variant="primary"
              >
                Use URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.svg"
        onChange={handleFileUpload}
        className="hidden"
        style={{ display: 'none' }}
      />
    </div>
  );
}