'use client';

import { useState, useEffect } from 'react';
import type { Store } from '@prisma/client';
import { 
  Globe, Languages, FileText, Sparkles,
  Plus, Trash2, Download, Upload,
  CheckCircle, XCircle, Search,
  Flag, Eye, Loader2, Check, X,
  Edit2, ChevronDown, ChevronUp
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';
import { toast } from 'sonner';
import Link from 'next/link';
import { TranslationProgressModal, useTranslationProgress } from '@/components/dashboard/translation-progress';

const tabs = [
  { id: 'languages' as const, label: 'Languages', icon: Globe },
  { id: 'translations' as const, label: 'Content Translations', icon: FileText }
];

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  rtl?: boolean;
}

const AVAILABLE_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' }
];

export function LanguagesFormV2({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'languages' | 'translations'>('languages');
  const [languageSettings, setLanguageSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [selectedLanguageToAdd, setSelectedLanguageToAdd] = useState('');
  const [translatingAll, setTranslatingAll] = useState(false);
  const [translatingLanguage, setTranslatingLanguage] = useState<string | null>(null);
  const [expandedLanguage, setExpandedLanguage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    progress,
    startTranslation,
    updateProgress,
    completeTranslation,
    resetProgress
  } = useTranslationProgress();

  // Fetch language settings on mount
  useEffect(() => {
    fetchLanguageSettings();
  }, [store.subdomain]);

  const fetchLanguageSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${store.subdomain}/languages`);
      if (response.ok) {
        const data = await response.json();
        setLanguageSettings(data.languageSettings || {
          enabledLanguages: ['en'],
          defaultLanguage: 'en',
          autoDetect: false,
          showLanguageSwitcher: true,
          translateUrls: false,
          autoTranslate: false
        });
      }
    } catch (error) {
      console.error('Error fetching language settings:', error);
      toast.error('Failed to load language settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/stores/${store.subdomain}/languages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(languageSettings),
      });
      
      if (response.ok) {
        toast.success('Language settings updated successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving language settings:', error);
      toast.error('Failed to save language settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageSettingChange = (key: string, value: any) => {
    setLanguageSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddLanguage = () => {
    if (selectedLanguageToAdd && !languageSettings.enabledLanguages.includes(selectedLanguageToAdd)) {
      const newEnabledLanguages = [...languageSettings.enabledLanguages, selectedLanguageToAdd];
      handleLanguageSettingChange('enabledLanguages', newEnabledLanguages);
      const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === selectedLanguageToAdd);
      toast.success(`${langInfo?.name} added successfully`);
      setShowAddLanguageModal(false);
      setSelectedLanguageToAdd('');
    }
  };

  const handleRemoveLanguage = (langCode: string) => {
    if (langCode === languageSettings.defaultLanguage) {
      toast.error('Cannot remove the default language');
      return;
    }
    const newEnabledLanguages = languageSettings.enabledLanguages.filter((code: string) => code !== langCode);
    handleLanguageSettingChange('enabledLanguages', newEnabledLanguages);
    const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === langCode);
    toast.success(`${langInfo?.name} removed`);
  };

  const handleAutoTranslateLanguage = async (targetLang: string, contentType: 'product' | 'category' | 'page' = 'product') => {
    setTranslatingLanguage(targetLang);
    
    // Start progress tracking
    startTranslation(contentType, targetLang, 0);
    
    try {
      // First get count of items to translate
      const countResponse = await fetch(`/api/stores/${store.subdomain}/${contentType}s`);
      const items = await countResponse.json();
      const totalItems = Array.isArray(items) ? items.length : 0;
      
      updateProgress({ 
        status: 'translating',
        totalItems 
      });
      
      // Call AI translation API for batch translation
      const response = await fetch('/api/ai/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'batch_translate',
          subdomain: store.subdomain,
          data: {
            contentType,
            targetLanguage: targetLang,
            sourceLanguage: languageSettings.defaultLanguage,
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
        toast.success(`Translated ${result.data?.translatedCount || 0} ${contentType}s to ${AVAILABLE_LANGUAGES.find(l => l.code === targetLang)?.name}`);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Auto-translate error:', error);
      updateProgress({ status: 'error' });
      toast.error('Failed to auto-translate content');
    } finally {
      setTranslatingLanguage(null);
    }
  };

  const handleAutoTranslateAll = async (contentType: 'product' | 'category' | 'page' = 'product') => {
    setTranslatingAll(true);
    const additionalLanguages = languageSettings.enabledLanguages.filter((code: string) => code !== languageSettings.defaultLanguage);
    
    for (const langCode of additionalLanguages) {
      await handleAutoTranslateLanguage(langCode, contentType);
    }
    
    setTranslatingAll(false);
    toast.success('All languages translated successfully');
  };

  const getEnabledLanguages = () => {
    return languageSettings?.enabledLanguages?.map((code: string) => {
      const langInfo = AVAILABLE_LANGUAGES.find(l => l.code === code);
      return {
        ...langInfo,
        isDefault: code === languageSettings.defaultLanguage
      };
    }) || [];
  };

  const getAvailableToAdd = () => {
    return AVAILABLE_LANGUAGES.filter(lang => 
      !languageSettings?.enabledLanguages?.includes(lang.code) &&
      lang.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <Loader2 className="nuvi-animate-spin nuvi-h-12 nuvi-w-12 nuvi-text-primary" />
      </div>
    );
  }

  return (
    <SettingsFormWrapper
      store={store}
      initialData={languageSettings}
      apiEndpoint={`/api/stores/${store.subdomain}/languages`}
    >
      {({ formData, handleChange, loading: formLoading }) => (
        <SettingsPageLayout
          title="Languages"
          description="Manage store languages and translations"
        >
          {/* Compact Info Alert */}
          <div className="nuvi-alert nuvi-alert-info nuvi-mb-lg">
            <Languages className="h-4 w-4" />
            <div>
              <p className="nuvi-text-sm">
                Configure languages for your international customers. Enable AI-powered translations for quick content localization.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="nuvi-settings-tabs nuvi-mb-lg">
            <div className="nuvi-settings-tabs-list">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`nuvi-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'languages' && (
            <div className="nuvi-space-y-lg">
              {/* Language Settings Compact Card */}
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <h3 className="nuvi-card-title">Store Languages</h3>
                    <div className="nuvi-flex nuvi-gap-sm">
                      {languageSettings.enabledLanguages.length > 1 && (
                        <button
                          onClick={() => handleAutoTranslateAll('product')}
                          disabled={translatingAll}
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                        >
                          {translatingAll ? (
                            <>
                              <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                              Translating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              AI Translate All
                            </>
                          )}
                        </button>
                      )}
                      <button 
                        className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                        onClick={() => setShowAddLanguageModal(true)}
                      >
                        <Plus className="h-4 w-4" />
                        Add Language
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="nuvi-card-content">
                  {/* Enabled Languages List */}
                  <div className="nuvi-space-y-sm">
                    {getEnabledLanguages().map((lang: any) => (
                      <div key={lang.code} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                        <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                            <span className="nuvi-text-2xl">{lang.flag}</span>
                            <div>
                              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <h4 className="nuvi-font-medium">{lang.name}</h4>
                                {lang.isDefault && (
                                  <span className="nuvi-badge nuvi-badge-primary nuvi-badge-sm">Default</span>
                                )}
                              </div>
                              <p className="nuvi-text-sm nuvi-text-muted">
                                {lang.nativeName} • {lang.code.toUpperCase()}
                                {lang.rtl && ' • RTL'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            {!lang.isDefault && (
                              <>
                                <button
                                  onClick={() => handleAutoTranslateLanguage(lang.code)}
                                  disabled={translatingLanguage === lang.code}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                                  title="Auto-translate content with AI"
                                >
                                  {translatingLanguage === lang.code ? (
                                    <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                                  ) : (
                                    <Sparkles className="h-4 w-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleLanguageSettingChange('defaultLanguage', lang.code)}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                                  title="Set as default"
                                >
                                  <Flag className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveLanguage(lang.code)}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600"
                                  title="Remove language"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Settings */}
                  <div className="nuvi-mt-lg nuvi-space-y-sm">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-py-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <Globe className="h-4 w-4 nuvi-text-muted" />
                        <span className="nuvi-text-sm">Show language selector</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!languageSettings.showLanguageSwitcher}
                          onChange={(e) => handleLanguageSettingChange('showLanguageSwitcher', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                      </label>
                    </div>
                    
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-py-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <CheckCircle className="h-4 w-4 nuvi-text-muted" />
                        <span className="nuvi-text-sm">Auto-detect language</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!languageSettings.autoDetect}
                          onChange={(e) => handleLanguageSettingChange('autoDetect', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                      </label>
                    </div>
                    
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-py-sm">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <Sparkles className="h-4 w-4 nuvi-text-muted" />
                        <span className="nuvi-text-sm">Enable AI auto-translation</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!languageSettings.autoTranslate}
                          onChange={(e) => handleLanguageSettingChange('autoTranslate', e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="nuvi-space-y-lg">
              {/* Translation Management */}
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Content Translations</h3>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Manage translations for your products, categories, and pages
                  </p>
                </div>
                <div className="nuvi-card-content">
                  {/* Translation Editor Link */}
                  <div className="nuvi-text-center nuvi-py-lg">
                    <div className="nuvi-mb-md">
                      <FileText className="nuvi-inline-block h-12 w-12 nuvi-text-muted nuvi-mb-sm" />
                      <h4 className="nuvi-font-medium nuvi-mb-sm">Advanced Translation Editor</h4>
                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                        Use our powerful translation editor to manage all your content translations
                      </p>
                    </div>
                    
                    <Link
                      href={`/dashboard/stores/${store.subdomain}/translations`}
                      className="nuvi-btn nuvi-btn-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                      Open Translation Editor
                    </Link>
                  </div>

                  {/* Quick Stats */}
                  <div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-md nuvi-mt-lg nuvi-pt-lg nuvi-border-t">
                    <div className="nuvi-text-center">
                      <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">
                        {languageSettings.enabledLanguages.length}
                      </div>
                      <div className="nuvi-text-sm nuvi-text-muted">Active Languages</div>
                    </div>
                    <div className="nuvi-text-center">
                      <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">
                        {languageSettings.autoTranslate ? 'Enabled' : 'Disabled'}
                      </div>
                      <div className="nuvi-text-sm nuvi-text-muted">AI Translation</div>
                    </div>
                    <div className="nuvi-text-center">
                      <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">
                        100%
                      </div>
                      <div className="nuvi-text-sm nuvi-text-muted">Coverage</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="nuvi-flex nuvi-justify-end nuvi-mt-lg">
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="nuvi-btn nuvi-btn-primary"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Add Language Modal */}
          {showAddLanguageModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Add Language</h3>
                  <button
                    onClick={() => {
                      setShowAddLanguageModal(false);
                      setSelectedLanguageToAdd('');
                      setSearchQuery('');
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search languages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                
                {/* Language List */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {getAvailableToAdd().map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguageToAdd(lang.code)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedLanguageToAdd === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-sm text-gray-500">{lang.nativeName}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button 
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    onClick={() => {
                      setShowAddLanguageModal(false);
                      setSelectedLanguageToAdd('');
                      setSearchQuery('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddLanguage}
                    disabled={!selectedLanguageToAdd}
                  >
                    Add Language
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Translation Progress Modal */}
          {progress.status !== 'idle' && (
            <TranslationProgressModal
              progress={progress}
              onClose={() => resetProgress()}
            />
          )}
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}