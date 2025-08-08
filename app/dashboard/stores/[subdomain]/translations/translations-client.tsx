'use client';

import { useState, useEffect } from 'react';
import type { Store } from '@prisma/client';
import { 
  Globe, Languages, Package, Tag, FileText, Sparkles,
  BarChart, Clock, CheckCircle, AlertCircle, Loader2,
  Play, Settings, RefreshCw, Download, History
} from 'lucide-react';
import { toast } from 'sonner';
import { TranslationProgressModal, useTranslationProgress } from '@/components/dashboard/translation-progress';

interface TranslationStats {
  products: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
  categories: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
  pages: {
    total: number;
    translations: Array<{ language: string; _count: number }>;
  };
}

const languageInfo: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇬🇧' },
  tr: { name: 'Turkish', flag: '🇹🇷' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  de: { name: 'German', flag: '🇩🇪' },
  it: { name: 'Italian', flag: '🇮🇹' },
  pt: { name: 'Portuguese', flag: '🇵🇹' },
  ru: { name: 'Russian', flag: '🇷🇺' },
  zh: { name: 'Chinese', flag: '🇨🇳' },
  ja: { name: 'Japanese', flag: '🇯🇵' },
  ko: { name: 'Korean', flag: '🇰🇷' },
  ar: { name: 'Arabic', flag: '🇸🇦' },
  hi: { name: 'Hindi', flag: '🇮🇳' },
  nl: { name: 'Dutch', flag: '🇳🇱' },
  sv: { name: 'Swedish', flag: '🇸🇪' },
  pl: { name: 'Polish', flag: '🇵🇱' },
};

export function TranslationsClient({ store, stats }: { store: Store; stats: TranslationStats }) {
  const [languageSettings, setLanguageSettings] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('tr');
  const [selectedContentType, setSelectedContentType] = useState<'product' | 'category' | 'page'>('product');
  const [translationHistory, setTranslationHistory] = useState<any[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const {
    progress,
    startTranslation,
    updateProgress,
    completeTranslation,
    resetProgress
  } = useTranslationProgress();

  useEffect(() => {
    fetchLanguageSettings();
    fetchTranslationHistory();
  }, [store.subdomain]);

  const fetchLanguageSettings = async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/languages`);
      if (response.ok) {
        const data = await response.json();
        setLanguageSettings(data.languageSettings || {
          enabledLanguages: ['en'],
          defaultLanguage: 'en'
        });
      }
    } catch (error) {
      console.error('Error fetching language settings:', error);
    }
  };

  const fetchTranslationHistory = async () => {
    // In a real app, you would fetch from a translation history endpoint
    // For now, we'll use localStorage
    const history = localStorage.getItem(`translation-history-${store.id}`);
    if (history) {
      setTranslationHistory(JSON.parse(history));
    }
  };

  const saveToHistory = (action: any) => {
    const newHistory = [
      {
        ...action,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
      },
      ...translationHistory
    ].slice(0, 50); // Keep last 50 items
    
    setTranslationHistory(newHistory);
    localStorage.setItem(`translation-history-${store.id}`, JSON.stringify(newHistory));
  };

  const handleTranslateContent = async (contentType: 'product' | 'category' | 'page', targetLang: string) => {
    setIsTranslating(true);
    startTranslation(contentType, targetLang, 0);
    
    try {
      // Get item count
      const endpoint = contentType === 'product' ? 'products' : 
                      contentType === 'category' ? 'categories' : 'pages';
      const countResponse = await fetch(`/api/stores/${store.subdomain}/${endpoint}`);
      const items = await countResponse.json();
      const totalItems = Array.isArray(items) ? items.length : 0;
      
      updateProgress({ 
        status: 'translating',
        totalItems 
      });
      
      // Batch translate
      const response = await fetch('/api/ai/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_translate',
          subdomain: store.subdomain,
          data: {
            contentType,
            targetLanguage: targetLang,
            sourceLanguage: languageSettings?.defaultLanguage || 'en',
            limit: 100
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        completeTranslation(
          result.data?.translatedCount || 0,
          result.data?.savedCount || 0,
          result.data?.errors || []
        );
        
        // Save to history
        saveToHistory({
          action: 'batch_translate',
          contentType,
          targetLanguage: targetLang,
          itemsTranslated: result.data?.translatedCount || 0,
          itemsSaved: result.data?.savedCount || 0,
          success: true
        });
        
        toast.success(`Successfully translated ${result.data?.translatedCount || 0} ${contentType}s`);
        
        // Refresh stats
        setTimeout(() => window.location.reload(), 2000);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Translation error:', error);
      updateProgress({ status: 'error' });
      toast.error('Failed to translate content');
      
      saveToHistory({
        action: 'batch_translate',
        contentType,
        targetLanguage: targetLang,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const getTranslationCoverage = (contentType: 'products' | 'categories' | 'pages', language: string) => {
    const stat = stats[contentType];
    const translationData = stat.translations.find(t => t.language === language);
    const count = translationData?._count || 0;
    const percentage = stat.total > 0 ? Math.round((count / stat.total) * 100) : 0;
    return { count, percentage };
  };

  const enabledLanguages = languageSettings?.enabledLanguages?.filter(
    (lang: string) => lang !== languageSettings?.defaultLanguage
  ) || [];

  return (
    <div className="nuvi-container nuvi-mx-auto nuvi-p-lg">
      {/* Header */}
      <div className="nuvi-mb-lg">
        <h1 className="nuvi-text-2xl nuvi-font-bold nuvi-mb-sm">Translation Management</h1>
        <p className="nuvi-text-muted">
          Manage translations for your store content across multiple languages
        </p>
      </div>

      {/* Overview Cards */}
      <div className="nuvi-grid nuvi-grid-cols-1 md:nuvi-grid-cols-3 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <Package className="h-8 w-8 nuvi-text-primary nuvi-mb-sm" />
                <h3 className="nuvi-font-medium">Products</h3>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.products.total}</p>
              </div>
              <div className="nuvi-text-right">
                <BarChart className="h-5 w-5 nuvi-text-muted nuvi-mb-sm" />
                <p className="nuvi-text-sm nuvi-text-muted">Coverage</p>
                <p className="nuvi-text-lg nuvi-font-semibold">
                  {enabledLanguages.length > 0 
                    ? Math.round(
                        enabledLanguages.reduce((acc: number, lang: string) => 
                          acc + getTranslationCoverage('products', lang).percentage, 0
                        ) / enabledLanguages.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <Tag className="h-8 w-8 nuvi-text-primary nuvi-mb-sm" />
                <h3 className="nuvi-font-medium">Categories</h3>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.categories.total}</p>
              </div>
              <div className="nuvi-text-right">
                <BarChart className="h-5 w-5 nuvi-text-muted nuvi-mb-sm" />
                <p className="nuvi-text-sm nuvi-text-muted">Coverage</p>
                <p className="nuvi-text-lg nuvi-font-semibold">
                  {enabledLanguages.length > 0 
                    ? Math.round(
                        enabledLanguages.reduce((acc: number, lang: string) => 
                          acc + getTranslationCoverage('categories', lang).percentage, 0
                        ) / enabledLanguages.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
              <div>
                <FileText className="h-8 w-8 nuvi-text-primary nuvi-mb-sm" />
                <h3 className="nuvi-font-medium">Pages</h3>
                <p className="nuvi-text-2xl nuvi-font-bold">{stats.pages.total}</p>
              </div>
              <div className="nuvi-text-right">
                <BarChart className="h-5 w-5 nuvi-text-muted nuvi-mb-sm" />
                <p className="nuvi-text-sm nuvi-text-muted">Coverage</p>
                <p className="nuvi-text-lg nuvi-font-semibold">
                  {enabledLanguages.length > 0 
                    ? Math.round(
                        enabledLanguages.reduce((acc: number, lang: string) => 
                          acc + getTranslationCoverage('pages', lang).percentage, 0
                        ) / enabledLanguages.length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Coverage */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-header">
          <h2 className="nuvi-card-title">Translation Coverage by Language</h2>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {enabledLanguages.map((lang: string) => {
              const langData = languageInfo[lang] || { name: lang, flag: '🌐' };
              const productCoverage = getTranslationCoverage('products', lang);
              const categoryCoverage = getTranslationCoverage('categories', lang);
              const pageCoverage = getTranslationCoverage('pages', lang);
              const avgCoverage = Math.round((productCoverage.percentage + categoryCoverage.percentage + pageCoverage.percentage) / 3);

              return (
                <div key={lang} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <span className="nuvi-text-2xl">{langData.flag}</span>
                      <div>
                        <h3 className="nuvi-font-medium">{langData.name}</h3>
                        <p className="nuvi-text-sm nuvi-text-muted">
                          Overall coverage: {avgCoverage}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="nuvi-flex nuvi-gap-sm">
                      <button
                        onClick={() => handleTranslateContent('product', lang)}
                        disabled={isTranslating || productCoverage.percentage === 100}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                        title="Translate products"
                      >
                        <Package className="h-4 w-4" />
                        {productCoverage.percentage}%
                      </button>
                      <button
                        onClick={() => handleTranslateContent('category', lang)}
                        disabled={isTranslating || categoryCoverage.percentage === 100}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                        title="Translate categories"
                      >
                        <Tag className="h-4 w-4" />
                        {categoryCoverage.percentage}%
                      </button>
                      <button
                        onClick={() => handleTranslateContent('page', lang)}
                        disabled={isTranslating || pageCoverage.percentage === 100}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                        title="Translate pages"
                      >
                        <FileText className="h-4 w-4" />
                        {pageCoverage.percentage}%
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="nuvi-w-full nuvi-bg-gray-200 nuvi-rounded-full nuvi-h-2">
                    <div 
                      className="nuvi-bg-primary nuvi-h-2 nuvi-rounded-full nuvi-transition-all"
                      style={{ width: `${avgCoverage}%` }}
                    />
                  </div>
                  
                  <div className="nuvi-flex nuvi-justify-between nuvi-mt-sm nuvi-text-xs nuvi-text-muted">
                    <span>Products: {productCoverage.count}/{stats.products.total}</span>
                    <span>Categories: {categoryCoverage.count}/{stats.categories.total}</span>
                    <span>Pages: {pageCoverage.count}/{stats.pages.total}</span>
                  </div>
                </div>
              );
            })}
            
            {enabledLanguages.length === 0 && (
              <div className="nuvi-text-center nuvi-py-lg">
                <Globe className="nuvi-inline-block h-12 w-12 nuvi-text-muted nuvi-mb-sm" />
                <p className="nuvi-text-muted">No additional languages enabled</p>
                <a 
                  href={`/dashboard/stores/${store.subdomain}/settings/languages`}
                  className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-mt-md"
                >
                  <Settings className="h-4 w-4" />
                  Configure Languages
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Translation History */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <h2 className="nuvi-card-title">
              <History className="h-5 w-5 nuvi-inline-block nuvi-mr-sm" />
              Recent Translation Activity
            </h2>
            {translationHistory.length > 0 && (
              <button
                onClick={() => {
                  setTranslationHistory([]);
                  localStorage.removeItem(`translation-history-${store.id}`);
                  toast.success('History cleared');
                }}
                className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              >
                Clear History
              </button>
            )}
          </div>
        </div>
        <div className="nuvi-card-content">
          {translationHistory.length > 0 ? (
            <div className="nuvi-space-y-sm">
              {translationHistory.slice(0, 10).map((item) => (
                <div key={item.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-py-sm nuvi-border-b">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    {item.success ? (
                      <CheckCircle className="h-4 w-4 nuvi-text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 nuvi-text-red-600" />
                    )}
                    <div>
                      <p className="nuvi-text-sm">
                        Translated {item.itemsTranslated || 0} {item.contentType}s to{' '}
                        {languageInfo[item.targetLanguage]?.name || item.targetLanguage}
                      </p>
                      <p className="nuvi-text-xs nuvi-text-muted">
                        <Clock className="h-3 w-3 nuvi-inline-block" />
                        {' '}{new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {item.itemsSaved !== undefined && (
                    <span className="nuvi-text-sm nuvi-text-muted">
                      {item.itemsSaved} saved
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="nuvi-text-center nuvi-py-lg">
              <Clock className="nuvi-inline-block h-8 w-8 nuvi-text-muted nuvi-mb-sm" />
              <p className="nuvi-text-muted">No translation history yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Translation Progress Modal */}
      {progress.status !== 'idle' && (
        <TranslationProgressModal
          progress={progress}
          onClose={() => resetProgress()}
        />
      )}
    </div>
  );
}