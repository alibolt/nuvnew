'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, FileText, Link, Copy, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface MediaEditFormProps {
  subdomain: string;
  mediaId: string;
}

interface MediaData {
  id: string;
  originalName: string;
  alt: string;
  title: string;
  description: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export function MediaEditForm({ subdomain, mediaId }: MediaEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [media, setMedia] = useState<MediaData | null>(null);
  
  const [formData, setFormData] = useState({
    alt: '',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchMedia();
  }, [mediaId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/media/${mediaId}`);
      if (response.ok) {
        const data = await response.json();
        setMedia(data);
        setFormData({
          alt: data.alt || '',
          title: data.title || '',
          description: data.description || ''
        });
      } else {
        toast.error('Failed to load media file');
      }
    } catch (error) {
      console.error('Failed to fetch media:', error);
      toast.error('Failed to load media file');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/stores/${subdomain}/media/${mediaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update media');
      }

      toast.success('Media updated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error updating media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update media');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading || !media) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-loading-spinner nuvi-loading-lg" />
      </div>
    );
  }

  const isImage = media.mimeType.startsWith('image/');

  return (
    <form onSubmit={handleSubmit} className="nuvi-space-y-lg">
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Preview */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Preview</h3>
            </div>
            <div className="nuvi-card-content">
              {isImage ? (
                <img
                  src={media.fileUrl}
                  alt={media.alt || media.originalName}
                  className="nuvi-max-w-full nuvi-h-auto nuvi-rounded nuvi-border"
                />
              ) : (
                <div className="nuvi-bg-muted nuvi-rounded nuvi-p-xl nuvi-text-center">
                  <ImageIcon className="h-16 w-16 nuvi-text-muted-foreground nuvi-mx-auto nuvi-mb-md" />
                  <p className="nuvi-text-muted">{media.originalName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Media Details</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <FileText className="h-4 w-4" />
                  Title
                </label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Media title"
                />
              </div>

              {isImage && (
                <div className="nuvi-form-group">
                  <label className="nuvi-label">
                    <ImageIcon className="h-4 w-4" />
                    Alt Text
                  </label>
                  <input
                    type="text"
                    className="nuvi-input"
                    value={formData.alt}
                    onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                    placeholder="Describe this image for accessibility"
                  />
                  <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                    Important for SEO and accessibility
                  </p>
                </div>
              )}

              <div className="nuvi-form-group">
                <label className="nuvi-label">
                  <FileText className="h-4 w-4" />
                  Description
                </label>
                <textarea
                  className="nuvi-input"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes or description"
                />
              </div>

              <div className="nuvi-flex nuvi-gap-sm">
                <button
                  type="submit"
                  className="nuvi-btn nuvi-btn-primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="nuvi-loading-spinner nuvi-loading-sm" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* File Info */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">File Information</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-sm">
              <div>
                <p className="nuvi-text-sm nuvi-text-muted">File Name</p>
                <p className="nuvi-text-sm nuvi-font-medium">{media.originalName}</p>
              </div>
              <div>
                <p className="nuvi-text-sm nuvi-text-muted">File Type</p>
                <p className="nuvi-text-sm nuvi-font-medium">{media.mimeType}</p>
              </div>
              <div>
                <p className="nuvi-text-sm nuvi-text-muted">File Size</p>
                <p className="nuvi-text-sm nuvi-font-medium">{formatFileSize(media.fileSize)}</p>
              </div>
              {media.width && media.height && (
                <div>
                  <p className="nuvi-text-sm nuvi-text-muted">Dimensions</p>
                  <p className="nuvi-text-sm nuvi-font-medium">{media.width} × {media.height}px</p>
                </div>
              )}
            </div>
          </div>

          {/* URL */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">File URL</h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-sm">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-bg-muted nuvi-rounded">
                  <Link className="h-4 w-4 nuvi-text-muted-foreground nuvi-flex-shrink-0" />
                  <input
                    type="text"
                    value={media.fileUrl}
                    readOnly
                    className="nuvi-bg-transparent nuvi-border-0 nuvi-outline-none nuvi-text-sm nuvi-flex-1 nuvi-min-w-0"
                  />
                </div>
                <div className="nuvi-flex nuvi-gap-sm">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(media.fileUrl)}
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-flex-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy URL
                  </button>
                  <a
                    href={media.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}