import { TEMPLATE_PRESETS } from '@/lib/template-presets';
import PresetSelector from './preset-selector';

export default function TemplatePresetsPage({
  params,
}: {
  params: { subdomain: string };
}) {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Mağaza Şablonları</h1>
        <p className="text-gray-600">
          Mağazanız için hazır bir şablon seçin. Daha sonra Theme Studio'dan özelleştirebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_PRESETS.map((preset) => (
          <PresetSelector
            key={preset.id}
            preset={preset}
            subdomain={params.subdomain}
          />
        ))}
      </div>
    </div>
  );
}