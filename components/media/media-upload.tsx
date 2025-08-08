'use client';

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image, FileVideo, FileAudio, File, Cloud } from 'lucide-react';
import { toast } from 'sonner';

interface MediaUploadProps {
  subdomain: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

export function MediaUpload({ subdomain, onSuccess, onCancel }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...uploadFiles]);
    
    // Start uploading immediately
    uploadFiles.forEach(file => {
      uploadFile(file);
    });
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    const formData = new FormData();
    formData.append('file', uploadFile.file);
    formData.append('type', uploadFile.file.type);

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id ? { ...f, progress } : f
          ));
        }
      };

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            // Handle API response format { success: true, data: { file: { fileUrl: ... } } }
            const fileUrl = response.data?.file?.fileUrl || 
                          response.file?.fileUrl ||
                          response.data?.url || 
                          response.url;
                          
            if (!fileUrl) {
              throw new Error('No file URL in response');
            }
            
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'success', progress: 100, url: fileUrl } 
                : f
            ));
            toast.success(`${uploadFile.file.name} uploaded successfully`);
          } catch (e) {
            console.error('Error parsing response:', e);
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: 'Invalid response format' } 
                : f
            ));
            toast.error(`Failed to upload ${uploadFile.file.name}: Invalid response`);
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorResponse.message || errorMessage;
          } catch (e) {
            errorMessage = `Upload failed: ${xhr.status} ${xhr.statusText}`;
          }
          setFiles(prev => prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error: errorMessage } 
              : f
          ));
          toast.error(`Failed to upload ${uploadFile.file.name}: ${errorMessage}`);
        }
      };

      // Handle errors
      xhr.onerror = () => {
        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'error', error: 'Upload failed' } 
            : f
        ));
        toast.error(`Failed to upload ${uploadFile.file.name}`);
      };

      // Send request
      xhr.open('POST', `/api/stores/${subdomain}/media`);
      xhr.send(formData);
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', error: 'Upload failed' } 
          : f
      ));
      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return FileVideo;
    if (type.startsWith('audio/')) return FileAudio;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const allUploadsComplete = files.length > 0 && files.every(f => f.status === 'success' || f.status === 'error');
  const hasErrors = files.some(f => f.status === 'error');

  return (
    <div className="nuvi-space-y-lg">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`nuvi-border-2 nuvi-border-dashed nuvi-rounded-lg nuvi-p-xl nuvi-text-center nuvi-transition ${
          isDragging 
            ? 'nuvi-border-primary nuvi-bg-primary/5' 
            : 'nuvi-border-muted-foreground/25 nuvi-hover:border-muted-foreground/50'
        }`}
      >
        <Cloud className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
        <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">
          Drop files here or click to upload
        </h3>
        <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
          Supports images, videos, and documents up to 10MB
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="nuvi-hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Upload className="h-4 w-4" />
          Select Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">Uploading {files.length} files</h3>
          </div>
          <div className="nuvi-card-content nuvi-space-y-sm">
            {files.map(file => {
              const Icon = getFileIcon(file.file.type);
              return (
                <div key={file.id} className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-sm nuvi-rounded nuvi-bg-muted/50">
                  <Icon className="h-8 w-8 nuvi-text-muted-foreground nuvi-flex-shrink-0" />
                  
                  <div className="nuvi-flex-1 nuvi-min-w-0">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-xs">
                      <h4 className="nuvi-text-sm nuvi-font-medium nuvi-truncate">{file.file.name}</h4>
                      <span className="nuvi-text-xs nuvi-text-muted">{formatFileSize(file.file.size)}</span>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="nuvi-w-full nuvi-bg-muted nuvi-rounded-full nuvi-h-2">
                        <div 
                          className="nuvi-bg-primary nuvi-h-2 nuvi-rounded-full nuvi-transition-all"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {file.status === 'error' && (
                      <p className="nuvi-text-xs nuvi-text-destructive">{file.error}</p>
                    )}
                  </div>
                  
                  <div className="nuvi-flex-shrink-0">
                    {file.status === 'pending' && (
                      <div className="nuvi-loading-spinner nuvi-loading-sm" />
                    )}
                    {file.status === 'uploading' && (
                      <span className="nuvi-text-xs nuvi-text-muted">{file.progress}%</span>
                    )}
                    {file.status === 'success' && (
                      <CheckCircle className="h-5 w-5 nuvi-text-success" />
                    )}
                    {file.status === 'error' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {allUploadsComplete && (
            <div className="nuvi-card-footer nuvi-flex nuvi-gap-sm nuvi-justify-end">
              <button
                onClick={onCancel}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSuccess?.();
                  setFiles([]);
                }}
                className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                disabled={hasErrors && files.every(f => f.status === 'error')}
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}