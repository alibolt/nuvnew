'use client';

import { TEMPLATE_PRESETS } from '@/lib/template-presets';
import { Badge } from '@/components/ui/badge';

interface TemplateSelectionStepProps {
  selectedPreset: string | null;
  onSelectPreset: (presetId: string) => void;
}

export default function TemplateSelectionStep({ 
  selectedPreset, 
  onSelectPreset 
}: TemplateSelectionStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Mağaza Temanızı Seçin</h2>
        <p className="text-gray-600">
          İşletmenize uygun bir tema seçin. Daha sonra özelleştirebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_PRESETS.map((preset) => (
          <div
            key={preset.id}
            onClick={() => onSelectPreset(preset.id)}
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all
              ${selectedPreset === preset.id 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {/* Seçili göstergesi */}
            {selectedPreset === preset.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="text-2xl">{
                preset.category === 'fashion' ? '👗' :
                preset.category === 'electronics' ? '📱' :
                preset.category === 'food' ? '🥗' :
                preset.category === 'beauty' ? '💄' : '🛍️'
              }</div>
              <div className="flex-1">
                <h3 className="font-medium">{preset.name}</h3>
                <p className="text-sm text-gray-600">{preset.description}</p>
              </div>
            </div>

            {/* Renk paleti önizleme */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Renkler:</span>
              <div className="flex gap-1">
                {Object.entries(preset.settings.colors).slice(0, 5).map(([key, color]) => (
                  <div
                    key={key}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Boş mağaza seçeneği */}
      <div
        onClick={() => onSelectPreset('blank')}
        className={`
          relative border-2 rounded-lg p-4 cursor-pointer transition-all
          ${selectedPreset === 'blank' 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
      >
        {selectedPreset === 'blank' && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="text-2xl">📄</div>
          <div>
            <h3 className="font-medium">Boş Mağaza</h3>
            <p className="text-sm text-gray-600">
              Sıfırdan başlayın ve kendi tasarımınızı oluşturun
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}