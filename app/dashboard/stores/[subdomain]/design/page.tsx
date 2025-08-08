import Link from 'next/link';
import { ArrowRight, Palette, Edit3, FileText } from 'lucide-react';

export default function DesignPage({
  params,
}: {
  params: { subdomain: string };
}) {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Tasarım Merkezi</h1>
        <p className="text-gray-600 text-lg">
          Mağazanızın görünümünü özelleştirin
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Theme Studio */}
        <Link 
          href={`/dashboard/stores/${params.subdomain}/theme-studio`}
          className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Edit3 className="h-6 w-6 text-primary" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Theme Studio</h3>
          <p className="text-gray-600 text-sm">
            Mağazanızı görsel olarak düzenleyin. Sürükle-bırak ile section ve block'ları özelleştirin.
          </p>
        </Link>

        {/* Hazır Temalar */}
        <Link 
          href={`/dashboard/stores/${params.subdomain}/design/themes`}
          className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Palette className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Hazır Temalar</h3>
          <p className="text-gray-600 text-sm">
            Profesyonel tasarlanmış hazır temalardan birini seçin ve hızlıca başlayın.
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8B9F7E]/10 text-[#8B9F7E]">
              Yeni
            </span>
          </div>
        </Link>

        {/* Şablonlar */}
        <Link 
          href={`/dashboard/stores/${params.subdomain}/templates`}
          className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Sayfa Şablonları</h3>
          <p className="text-gray-600 text-sm">
            Her sayfa tipi için özel şablonlar oluşturun ve yönetin.
          </p>
        </Link>
      </div>

      {/* Hızlı Bilgiler */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          İpucu
        </h3>
        <p className="text-gray-700">
          Yeni başlıyorsanız, önce <strong>Hazır Temalar</strong> bölümünden bir tema seçmenizi öneririz. 
          Daha sonra <strong>Theme Studio</strong> ile detaylı özelleştirmeler yapabilirsiniz.
        </p>
      </div>
    </div>
  );
}