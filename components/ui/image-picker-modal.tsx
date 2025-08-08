'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  Search, 
  Image as ImageIcon, 
  X, 
  Check, 
  Loader2, 
  FolderOpen,
  Filter,
  Grid,
  List,
  Eye,
  Trash2,
  Edit3
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

interface ImagePickerModalProps {
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

export function ImagePickerModal({
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
}: ImagePickerModalProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(currentValue || '');
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media files
  useEffect(() => {
    if (isOpen) {
      loadMediaFiles();
    }
  }, [isOpen, subdomain]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        type: 'image',
        limit: '500'
      });
      
      if (context) params.append('context', context);
      if (contextId) params.append('contextId', contextId);
      
      const response = await fetch(`/api/stores/${subdomain}/media?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load media files');
      }
      
      const data = await response.json();
      setMediaFiles(data.files || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media files');
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error('Failed to upload file');
      }

      const { url, media } = await uploadRes.json();

      // Set the uploaded file as selected
      if (media) {
        setSelectedFile(media);
      }

      // Reload media files to show the new upload
      await loadMediaFiles();
      
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="library" className="h-full">
            <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="library">Media Library</TabsTrigger>
                <TabsTrigger value="url">From URL</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="library" className="px-6 pb-6 mt-0 h-full overflow-hidden flex flex-col">
              {/* Controls */}
              <div className="flex items-center gap-4 mb-4 flex-shrink-0">
                <div className="flex-1 relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <Input
                      placeholder="Search images..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
                
                
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Media Grid/List */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <ImageIcon className="w-12 h-12 mb-2" />
                    <p>No images found</p>
                    <p className="text-sm">Upload your first image to get started</p>
                  </div>
                ) : (
                  <div className={cn(
                    viewMode === 'grid' 
                      ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' 
                      : 'space-y-2'
                  )}>
                    {filteredFiles.map(file => (
                      <div
                        key={file.id}
                        className={cn(
                          'border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:scale-105',
                          selectedFile?.id === file.id ? 'ring-2 ring-blue-500 shadow-lg' : '',
                          viewMode === 'list' ? 'flex items-center p-2' : ''
                        )}
                        onClick={() => setSelectedFile(file)}
                      >
                        {viewMode === 'grid' ? (
                          <>
                            <div className="aspect-square bg-gray-100 relative group">
                              <img
                                src={file.thumbnailUrl || file.fileUrl}
                                alt={file.metadata?.alt || file.fileName}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              {selectedFile?.id === file.id && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                                  <Check className="w-4 h-4" />
                                </div>
                              )}
                              {/* Hover overlay with filename */}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-end p-2 opacity-0 group-hover:opacity-100">
                                <p className="text-white text-xs font-medium truncate w-full">{file.fileName}</p>
                              </div>
                            </div>
                            <div className="p-2">
                              <p className="text-xs font-medium truncate" title={file.fileName}>{file.fileName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gray-100 rounded mr-3 flex-shrink-0">
                              <img
                                src={file.thumbnailUrl || file.fileUrl}
                                alt={file.metadata?.alt || file.fileName}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{file.fileName}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                            </div>
                            {selectedFile?.id === file.id && (
                              <div className="ml-2 bg-blue-500 text-white rounded-full p-1">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="url" className="px-6 pb-6 mt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                  />
                </div>
                
                {urlInput && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <img
                      src={urlInput}
                      alt="Preview"
                      className="max-w-full max-h-48 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            {selectedFile && (
              <span>Selected: {selectedFile.fileName}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={selectedFile ? handleSelect : handleUrlSelect}
              disabled={!selectedFile && !urlInput.trim()}
            >
              {selectedFile ? 'Select Image' : 'Use URL'}
            </Button>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.svg"
          onChange={handleFileUpload}
          className="hidden"
        />
      </DialogContent>
    </Dialog>
  );
}