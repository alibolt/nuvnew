'use client';

import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  subdomain: string;
}

export function ProductImageUploader({ images, onChange, subdomain }: ProductImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newImageUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const uploadRes = await fetch(`/api/stores/${subdomain}/media/upload`, {
          method: 'POST',
          body: formData
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          newImageUrls.push(url);
        } else {
          console.error('Failed to upload image:', await uploadRes.text());
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    onChange([...images, ...newImageUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>Product Images</Label>
      <div className="flex flex-wrap gap-2">
        {/* Existing images */}
        {images.map((url, index) => (
          <div key={`image-${index}`} className="relative group">
            <img
              src={url}
              alt={`Product ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {/* Upload button */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
        >
          <Upload className="h-5 w-5 text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">
            {uploading ? 'Uploading...' : 'Add Image'}
          </span>
        </button>
      </div>
    </div>
  );
}