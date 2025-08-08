'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { TemplatePreset } from '@/lib/template-presets';

interface PresetSelectorProps {
  preset: TemplatePreset;
  subdomain: string;
}

export default function PresetSelector({ preset, subdomain }: PresetSelectorProps) {
  const router = useRouter();
  const [applying, setApplying] = useState(false);

  const handleApplyPreset = async () => {
    if (!confirm('Bu şablon mevcut tasarımınızın üzerine yazılacak. Devam etmek istiyor musunuz?')) {
      return;
    }

    setApplying(true);
    try {
      const response = await fetch(`/api/stores/${subdomain}/templates/apply-preset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId: preset.id }),
      });

      if (!response.ok) throw new Error('Şablon uygulanamadı');

      toast.success('Şablon başarıyla uygulandı!');
      router.push(`/dashboard/stores/${subdomain}/theme-studio`);
    } catch (error) {
      toast.error('Şablon uygulanırken hata oluştu');
    } finally {
      setApplying(false);
    }
  };

  const categoryColors = {
    fashion: 'bg-pink-100 text-pink-800',
    electronics: 'bg-blue-100 text-blue-800',
    food: 'bg-[#8B9F7E]/10 text-[#8B9F7E]',
    beauty: 'bg-purple-100 text-purple-800',
    general: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-100 relative">
        {preset.preview ? (
          <Image
            src={preset.preview}
            alt={preset.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🎨</div>
              <p className="text-gray-500">{preset.name}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">{preset.name}</h3>
          <Badge className={categoryColors[preset.category]}>
            {preset.category}
          </Badge>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{preset.description}</p>
        
        <div className="space-y-3">
          {/* Renk paleti önizleme */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Renkler:</span>
            <div className="flex gap-1">
              {Object.entries(preset.settings.colors).slice(0, 4).map(([key, color]) => (
                <div
                  key={key}
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={key}
                />
              ))}
            </div>
          </div>
          
          {/* Font önizleme */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Fontlar:</span>
            <span className="text-sm">{preset.settings.fonts.heading}</span>
          </div>
          
          <Button
            onClick={handleApplyPreset}
            disabled={applying}
            className="w-full"
          >
            {applying ? 'Uygulanıyor...' : 'Bu Şablonu Kullan'}
          </Button>
        </div>
      </div>
    </div>
  );
}