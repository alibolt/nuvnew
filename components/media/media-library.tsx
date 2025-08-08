'use client';

import { useState, useRef } from 'react';
import { 
  Upload, FolderPlus, Search, Grid, List, MoreHorizontal, 
  Trash2, Edit, Download, Copy, Image as ImageIcon, File,
  Video, Music, FileText, X, Check, Eye, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  altText?: string;
  caption?: string;
  folderId?: string;
  createdAt: Date;
  dimensions?: { width: number; height: number };
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  fileCount: number;
  createdAt: Date;
}

interface MediaLibraryProps {
  subdomain: string;
  selectionMode?: 'single' | 'multiple' | 'none';
  allowedTypes?: string[];
  onSelect?: (files: MediaFile[]) => void;
  onClose?: () => void;
  isEmbedded?: boolean; // Add flag to know if it's embedded in tab
}

export function MediaLibrary({ 
  storeId, 
  selectionMode = 'none', 
  allowedTypes,
  onSelect,
  onClose,
  isEmbedded = false 
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFileDetails, setSelectedFileDetails] = useState<MediaFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File type icons
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    if (currentFolder) {
      formData.append('folderId', currentFolder);
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/media/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newFiles = await response.json();
        setFiles(prev => [...prev, ...newFiles]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setShowUpload(false);
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch(`/api/stores/${subdomain}/media/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder,
        }),
      });

      if (response.ok) {
        const folder = await response.json();
        setFolders(prev => [...prev, folder]);
        setNewFolderName('');
        setShowNewFolder(false);
      }
    } catch (error) {
      console.error('Folder creation failed:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (file: MediaFile) => {
    if (selectionMode === 'none') {
      setSelectedFileDetails(file);
      return;
    }

    const newSelected = new Set(selectedFiles);
    
    if (selectionMode === 'single') {
      newSelected.clear();
      newSelected.add(file.id);
    } else {
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else {
        newSelected.add(file.id);
      }
    }
    
    setSelectedFiles(newSelected);
  };

  // Handle selection confirmation
  const handleConfirmSelection = () => {
    const selectedFileObjects = files.filter(file => selectedFiles.has(file.id));
    onSelect?.(selectedFileObjects);
  };

  // Filter files based on search and folder
  const filteredFiles = files.filter(file => {
    if (currentFolder && file.folderId !== currentFolder) return false;
    if (!currentFolder && file.folderId) return false;
    if (searchQuery && !file.originalName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (allowedTypes && !allowedTypes.some(type => file.mimeType.includes(type))) return false;
    return true;
  });

  // Filter folders
  const currentFolders = folders.filter(folder => folder.parentId === currentFolder);

  return (
    <div className="nuvi-flex nuvi-h-full nuvi-bg-background">
      {/* Sidebar */}
      <div className="nuvi-w-64 nuvi-border-r nuvi-p-md">
        <div className="nuvi-space-y-md">
          {/* Upload Button */}
          <button
            onClick={() => setShowUpload(true)}
            className="nuvi-btn nuvi-btn-primary nuvi-w-full"
          >
            <Upload className="h-4 w-4" />
            Upload Files
          </button>

          {/* New Folder Button */}
          <button
            onClick={() => setShowNewFolder(true)}
            className="nuvi-btn nuvi-btn-secondary nuvi-w-full"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </button>

          {/* Folder Navigation */}
          <div className="nuvi-space-y-sm">
            <h3 className="nuvi-text-sm nuvi-font-medium">Folders</h3>
            
            {/* All Files */}
            <button
              onClick={() => setCurrentFolder(null)}
              className={`nuvi-w-full nuvi-text-left nuvi-p-sm nuvi-rounded-md nuvi-text-sm nuvi-transition-colors ${
                currentFolder === null 
                  ? 'nuvi-bg-muted nuvi-text-foreground' 
                  : 'nuvi-text-secondary hover:nuvi-bg-muted/50'
              }`}
            >
              All Files
            </button>

            {/* Folder List */}
            {currentFolders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setCurrentFolder(folder.id)}
                className={`nuvi-w-full nuvi-text-left nuvi-p-sm nuvi-rounded-md nuvi-text-sm nuvi-flex nuvi-items-center nuvi-justify-between nuvi-transition-colors ${
                  currentFolder === folder.id 
                    ? 'nuvi-bg-muted nuvi-text-foreground' 
                    : 'nuvi-text-secondary hover:nuvi-bg-muted/50'
                }`}
              >
                <span>{folder.name}</span>
                <span className="nuvi-badge nuvi-badge-secondary nuvi-text-xs">
                  {folder.fileCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="nuvi-flex-1 nuvi-flex nuvi-flex-col">
        {/* Header */}
        <div className="nuvi-border-b nuvi-p-md">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
            <h2 className="nuvi-text-xl nuvi-font-semibold">
              Media Library
            </h2>
            
            {onClose && !isEmbedded && (
              <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search and View Controls */}
          <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
            <div className="nuvi-relative nuvi-flex-1 nuvi-max-w-md">
              <Search className="h-4 w-4 nuvi-absolute nuvi-left-sm nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nuvi-input nuvi-pl-lg"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="nuvi-flex nuvi-border nuvi-rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`nuvi-p-sm nuvi-rounded-l-md nuvi-transition-colors ${
                  viewMode === 'grid' 
                    ? 'nuvi-bg-muted nuvi-text-foreground' 
                    : 'nuvi-text-muted hover:nuvi-text-secondary'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`nuvi-p-sm nuvi-rounded-r-md nuvi-transition-colors ${
                  viewMode === 'list' 
                    ? 'nuvi-bg-muted nuvi-text-foreground' 
                    : 'nuvi-text-muted hover:nuvi-text-secondary'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Selection Actions */}
            {selectionMode !== 'none' && selectedFiles.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedFiles.size} selected
                </span>
                <Button onClick={handleConfirmSelection}>
                  <Check className="h-4 w-4 mr-2" />
                  Select
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* File Grid/List */}
        <div className="flex-1 p-4 overflow-auto">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.mimeType);
                const isSelected = selectedFiles.has(file.id);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`relative group cursor-pointer border rounded-lg overflow-hidden transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {selectionMode !== 'none' && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'bg-white border-gray-300'
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    )}

                    {/* File Preview */}
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-2">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 bg-white rounded shadow">
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map(file => {
                const FileIcon = getFileIcon(file.mimeType);
                const isSelected = selectedFiles.has(file.id);
                
                return (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection Checkbox */}
                    {selectionMode !== 'none' && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected 
                          ? 'bg-blue-500 border-blue-500' 
                          : 'bg-white border-gray-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                    )}

                    {/* File Icon/Thumbnail */}
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      {file.mimeType.startsWith('image/') ? (
                        <img
                          src={file.url}
                          alt={file.altText || file.originalName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <FileIcon className="h-6 w-6 text-gray-400" />
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{file.originalName}</p>
                      <p className="text-sm text-gray-500">
                        {file.mimeType} • {formatFileSize(file.size)}
                        {file.dimensions && ` • ${file.dimensions.width}×${file.dimensions.height}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Drag and drop files here, or click to select
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept={allowedTypes?.join(',')}
              />
              <Button onClick={() => fileInputRef.current?.click()}>
                Select Files
              </Button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowUpload(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            
            <Input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewFolder(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}