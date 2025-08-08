'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Store } from '@prisma/client';
import { 
  Save, Search, Filter, Plus, Upload, Download,
  FileText, Package, Tag, Globe, Languages, ChevronRight, 
  Check, MoreVertical, Grid, List, Loader2, AlertCircle,
  Eye, Edit, Copy, Trash2, CheckCircle, Clock, X,
  ArrowLeft, Settings, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Translation {
  id: string;
  contentType: string;
  contentId: string;
  language: string;
  translations: Record<string, string>;
}

interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
  metaTitle?: string;
  metaDescription?: string;
  seoTitle?: string;
  seoDescription?: string;
  translations?: Translation[];
  translationCount?: number;
  lastTranslated?: string;
}

export function TranslationsContent({ store }: { store: Store }) {
  const [selectedContentType, setSelectedContentType] = useState<'product' | 'category' | 'page' | 'blogPost' | 'policy'>('product');
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('tr');
  const [languageSettings, setLanguageSettings] = useState<any>(null);
  const [searchValue, setSearchValue] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [savingTranslation, setSavingTranslation] = useState(false);
  const [contentTranslations, setContentTranslations] = useState<any>({});
  const [autoTranslating, setAutoTranslating] = useState(false);
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({
    product: 0,
    category: 0,
    page: 0,
    blogPost: 0,
    policy: 0
  });

  // Fetch language settings on mount
  useEffect(() => {
    fetchLanguageSettings();
  }, [store.subdomain]);

  useEffect(() => {
    loadContent();
  }, [selectedContentType, targetLanguage]);

  // Load all content counts on mount
  useEffect(() => {
    const loadAllCounts = async () => {
      try {
        const endpoints = {
          product: `/api/stores/${store.subdomain}/products?limit=1`,
          category: `/api/stores/${store.subdomain}/categories?limit=1`,
          page: `/api/stores/${store.subdomain}/pages?limit=1`,
          policy: `/api/stores/${store.subdomain}/settings` // Policies come from settings
        };

        const counts: Record<string, number> = {};

        // Fetch counts for all content types in parallel
        const promises = Object.entries(endpoints).map(async ([type, endpoint]) => {
          try {
            const response = await fetch(endpoint);
            if (response.ok) {
              const data = await response.json();
              
              // Handle policies differently
              if (type === 'policy') {
                let policyCount = 0;
                // Check if returnPolicy contains the new structure
                if (data.returnPolicy && typeof data.returnPolicy === 'object') {
                  const policyData = data.returnPolicy as any;
                  if (policyData.privacyPolicy?.enabled) policyCount++;
                  if (policyData.termsOfService?.enabled) policyCount++;
                  if (policyData.shippingPolicy?.enabled) policyCount++;
                  if (policyData.refundPolicy?.enabled) policyCount++;
                } else {
                  // Fallback to old structure
                  if (data.privacyPolicy) policyCount++;
                  if (data.termsOfService) policyCount++;
                  if (data.shippingPolicy) policyCount++;
                  if (data.refundPolicy) policyCount++;
                }
                counts[type] = policyCount;
              } else if (data.total !== undefined) {
                // Extract total count from response
                counts[type] = data.total;
              } else if (Array.isArray(data)) {
                // If no total field, we need to fetch all to get count
                const fullResponse = await fetch(endpoint.replace('limit=1', 'limit=1000'));
                const fullData = await fullResponse.json();
                counts[type] = Array.isArray(fullData) ? fullData.length : 
                  (fullData.items || fullData.data || fullData.products || fullData.categories || fullData.pages || []).length;
              } else if (data && typeof data === 'object') {
                const items = data.items || data.data || data.products || data.categories || data.pages || [];
                counts[type] = items.length;
              }
            } else {
              counts[type] = 0;
            }
          } catch (error) {
            console.error(`Error loading ${type} count:`, error);
            counts[type] = 0;
          }
        });

        // Handle blog posts separately
        try {
          const blogsResponse = await fetch(`/api/stores/${store.subdomain}/blogs`);
          if (blogsResponse.ok) {
            const blogs = await blogsResponse.json();
            let totalPosts = 0;
            if (Array.isArray(blogs) && blogs.length > 0) {
              for (const blog of blogs) {
                try {
                  const postsResponse = await fetch(`/api/stores/${store.subdomain}/blogs/${blog.id}/posts`);
                  if (postsResponse.ok) {
                    const posts = await postsResponse.json();
                    if (Array.isArray(posts)) {
                      totalPosts += posts.length;
                    }
                  }
                } catch (postError) {
                  console.error(`Error loading posts for blog ${blog.id}:`, postError);
                }
              }
            }
            counts.blogPost = totalPosts;
          } else {
            counts.blogPost = 0;
          }
        } catch (error) {
          console.error('Error loading blog post count:', error);
          counts.blogPost = 0;
        }

        await Promise.all(promises);
        setContentCounts(counts);
      } catch (error) {
        console.error('Error loading content counts:', error);
      }
    };

    loadAllCounts();
  }, [store.subdomain]);

  // Load translations when item is selected
  useEffect(() => {
    if (selectedItem) {
      loadContentTranslations(selectedItem.id);
    }
  }, [selectedItem]);

  const fetchLanguageSettings = async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/languages`);
      if (response.ok) {
        const data = await response.json();
        setLanguageSettings(data.languageSettings || {
          enabledLanguages: ['en', 'tr'],
          defaultLanguage: 'en'
        });
      }
    } catch (error) {
      console.error('Error fetching language settings:', error);
    }
  };

  // Load content for translation
  const loadContent = async () => {
    setLoadingContent(true);
    try {
      // For blog posts, we need to get all blogs first, then all posts
      if (selectedContentType === 'blogPost') {
        try {
          const blogsResponse = await fetch(`/api/stores/${store.subdomain}/blogs`);
          
          if (!blogsResponse.ok) {
            console.warn('No blogs found or blogs API not available');
            setContentList([]);
            setContentCounts(prev => ({ ...prev, blogPost: 0 }));
            return;
          }
          
          const blogs = await blogsResponse.json();
          const allPosts: ContentItem[] = [];
          
          // Fetch posts for each blog
          if (Array.isArray(blogs) && blogs.length > 0) {
            for (const blog of blogs) {
              try {
                const postsResponse = await fetch(`/api/stores/${store.subdomain}/blogs/${blog.id}/posts`);
                if (postsResponse.ok) {
                  const posts = await postsResponse.json();
                  if (Array.isArray(posts)) {
                    allPosts.push(...posts);
                  }
                }
              } catch (postError) {
                console.error(`Error loading posts for blog ${blog.id}:`, postError);
              }
            }
          }
          
          setContentList(allPosts);
          // Update count for blog posts
          setContentCounts(prev => ({ ...prev, blogPost: allPosts.length }));
        } catch (error) {
          console.error('Error loading blog posts:', error);
          setContentList([]);
          setContentCounts(prev => ({ ...prev, blogPost: 0 }));
        } finally {
          setLoadingContent(false);
        }
        return; // Early return for blog posts
      } else {
        // For other content types - fetch all items without limit
        const endpoint = {
          product: `/api/stores/${store.subdomain}/products?limit=1000`,
          category: `/api/stores/${store.subdomain}/categories?limit=1000`,
          page: `/api/stores/${store.subdomain}/pages?limit=1000`,
          policy: `/api/stores/${store.subdomain}/settings` // Policies are stored in settings
        }[selectedContentType];

        const response = await fetch(endpoint);
        if (!response.ok) {
          console.warn(`Failed to load ${selectedContentType}s`);
          setContentList([]);
          setContentCounts(prev => ({ ...prev, [selectedContentType]: 0 }));
          return;
        }
        
        const data = await response.json();
        let items: ContentItem[] = [];
        
        // Handle policies differently as they come from settings
        if (selectedContentType === 'policy') {
          const policies = [];
          // Check if returnPolicy contains the new structure
          if (data.returnPolicy && typeof data.returnPolicy === 'object') {
            const policyData = data.returnPolicy as any;
            
            if (policyData.privacyPolicy?.enabled) {
              policies.push({
                id: 'privacy-policy',
                name: 'Privacy Policy',
                title: 'Privacy Policy',
                content: policyData.privacyPolicy.content || ''
              });
            }
            if (policyData.termsOfService?.enabled) {
              policies.push({
                id: 'terms-of-service',
                name: 'Terms of Service',
                title: 'Terms of Service',
                content: policyData.termsOfService.content || ''
              });
            }
            if (policyData.shippingPolicy?.enabled) {
              policies.push({
                id: 'shipping-policy',
                name: 'Shipping Policy',
                title: 'Shipping Policy',
                content: policyData.shippingPolicy.content || ''
              });
            }
            if (policyData.refundPolicy?.enabled) {
              policies.push({
                id: 'refund-policy',
                name: 'Refund Policy',
                title: 'Refund Policy',
                content: policyData.refundPolicy.content || ''
              });
            }
          } else {
            // Fallback to old structure
            if (data.privacyPolicy) {
              policies.push({
                id: 'privacy-policy',
                name: 'Privacy Policy',
                title: 'Privacy Policy',
                content: data.privacyPolicy
              });
            }
            if (data.termsOfService) {
              policies.push({
                id: 'terms-of-service',
                name: 'Terms of Service',
                title: 'Terms of Service',
                content: data.termsOfService
              });
            }
            if (data.shippingPolicy) {
              policies.push({
                id: 'shipping-policy',
                name: 'Shipping Policy',
                title: 'Shipping Policy',
                content: data.shippingPolicy
              });
            }
            if (data.refundPolicy) {
              policies.push({
                id: 'refund-policy',
                name: 'Refund Policy',
                title: 'Refund Policy',
                content: data.refundPolicy
              });
            }
          }
          items = policies;
        } else {
          // Handle other content types normally
          if (Array.isArray(data)) {
            items = data;
          } else if (data && typeof data === 'object') {
            // If data is an object with items array
            items = data.items || data.data || data.products || data.categories || data.pages || [];
          }
        }

        // Add translation metadata
        const itemsWithMetadata = items.map((item: any) => ({
          ...item,
          translationCount: item.translations?.filter((t: any) => t.language === targetLanguage).length || 0,
          lastTranslated: item.translations?.find((t: any) => t.language === targetLanguage)?.updatedAt
        }));

        setContentList(itemsWithMetadata);
        // Update count for current content type
        setContentCounts(prev => ({ ...prev, [selectedContentType]: itemsWithMetadata.length }));
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
      setContentList([]);
    } finally {
      setLoadingContent(false);
    }
  };

  // Load translations for selected content
  const loadContentTranslations = async (contentId: string) => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/content-translations?type=${selectedContentType}&contentId=${contentId}`);
      if (!response.ok) throw new Error('Failed to load translations');
      
      const data = await response.json();
      const translations: any = {};
      
      // Format translations by language based on content type
      let contentKey = selectedContentType + 's';
      
      // Handle special cases
      if (selectedContentType === 'category') contentKey = 'categories';
      else if (selectedContentType === 'blogPost') contentKey = 'blogPosts';
      
      if (data[contentKey] && data[contentKey].length > 0) {
        const content = data[contentKey][0]; // Since we're fetching specific item
        
        if (content?.translations) {
          content.translations.forEach((trans: any) => {
            // Map fields based on content type
            if (selectedContentType === 'product') {
              translations[trans.language] = {
                ...trans,
                title: trans.name // Map name to title for products
              };
            } else {
              translations[trans.language] = trans;
            }
          });
        }
      }
      
      setContentTranslations(translations);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast.error('Failed to load translations');
      setContentTranslations({});
    }
  };

  // Save content translation
  const saveContentTranslation = async (field: string, value: string) => {
    setSavingTranslation(true);
    try {
      const translationData = {
        [field]: value
      };

      const response = await fetch(`/api/stores/${store.subdomain}/content-translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: selectedContentType,
          contentId: selectedItem?.id,
          language: targetLanguage,
          translations: translationData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save translation');
      }
      
      toast.success('Translation saved successfully');
      
      // Reload translations
      if (selectedItem?.id) {
        await loadContentTranslations(selectedItem.id);
      }
      
      // Update the item in the list to show it's translated
      setContentList(prev => prev.map(item => 
        item.id === selectedItem?.id 
          ? { ...item, translationCount: 1, lastTranslated: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Failed to save translation');
    } finally {
      setSavingTranslation(false);
    }
  };

  // Auto-translate with AI
  const autoTranslate = async (field: string, originalText: string) => {
    setAutoTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: originalText,
          fromLanguage: sourceLanguage,
          toLanguage: targetLanguage,
          context: selectedContentType
        })
      });

      if (!response.ok) throw new Error('Failed to auto-translate');
      
      const { translation } = await response.json();
      
      // Update the translation field
      setContentTranslations({
        ...contentTranslations,
        [targetLanguage]: {
          ...contentTranslations[targetLanguage],
          [field]: translation
        }
      });
      
      toast.success('Auto-translation completed');
    } catch (error) {
      console.error('Error auto-translating:', error);
      toast.error('Failed to auto-translate');
    } finally {
      setAutoTranslating(false);
    }
  };

  // Filter content based on search
  const filteredContent = useMemo(() => {
    let filtered = contentList;

    // Search filter
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(item => {
        const title = (item.title || item.name || '').toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        const description = (item.description || '').toLowerCase();
        return title.includes(searchTerm) || slug.includes(searchTerm) || description.includes(searchTerm);
      });
    }

    // Translation status filter
    if (appliedFilters.status) {
      filtered = filtered.filter(item => {
        const hasTranslation = item.translationCount && item.translationCount > 0;
        if (appliedFilters.status === 'translated') return hasTranslation;
        if (appliedFilters.status === 'untranslated') return !hasTranslation;
        return true;
      });
    }

    return filtered;
  }, [contentList, searchValue, appliedFilters]);

  // Content type tabs
  const contentTypeTabs = [
    { id: 'product' as const, label: 'Products', icon: Package, count: contentCounts.product },
    { id: 'category' as const, label: 'Categories', icon: Tag, count: contentCounts.category },
    { id: 'page' as const, label: 'Pages', icon: FileText, count: contentCounts.page },
    { id: 'blogPost' as const, label: 'Blog Posts', icon: Globe, count: contentCounts.blogPost },
    { id: 'policy' as const, label: 'Policies', icon: FileText, count: contentCounts.policy }
  ];

  // Export translations to CSV
  const handleExport = async () => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/content-translations/export?type=${selectedContentType}&language=${targetLanguage}`);
      if (!response.ok) throw new Error('Failed to export translations');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedContentType}-translations-${targetLanguage}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Translations exported successfully');
    } catch (error) {
      console.error('Error exporting translations:', error);
      toast.error('Failed to export translations');
    }
  };

  // Import translations from CSV
  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', selectedContentType);
    formData.append('language', targetLanguage);

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/content-translations/import`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to import translations');
      
      toast.success('Translations imported successfully');
      loadContent();
    } catch (error) {
      console.error('Error importing translations:', error);
      toast.error('Failed to import translations');
    }
  };

  return (
    <div className="nuvi-tab-panel" style={{ padding: 0 }}>
      {/* Header Section */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>Translations</h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Manage translations for your store content</p>
          </div>
          
          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Language Selector */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              padding: '8px 12px',
              border: '1px solid #e5e7eb'
            }}>
              <Languages style={{ width: '16px', height: '16px', color: '#6b7280' }} />
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {languageSettings?.enabledLanguages?.map((lang: string) => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
              <ChevronRight style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              <select
                value={targetLanguage}
                onChange={(e) => {
                  setTargetLanguage(e.target.value);
                  loadContent();
                }}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {languageSettings?.enabledLanguages?.filter((lang: string) => lang !== sourceLanguage).map((lang: string) => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={filteredContent.length === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: filteredContent.length === 0 ? 'not-allowed' : 'pointer',
                opacity: filteredContent.length === 0 ? 0.5 : 1
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              Export
            </button>

            {/* Import Button */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}>
              <Upload style={{ width: '14px', height: '14px' }} />
              Import
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
              />
            </label>

            {/* Settings Link */}
            <Link
              href={`/dashboard/stores/${store.subdomain}/settings/languages`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                fontSize: '12px',
                textDecoration: 'none',
                color: '#374151'
              }}
            >
              <Settings style={{ width: '14px', height: '14px' }} />
              Settings
            </Link>
          </div>
        </div>

        {/* Content Type Tabs */}
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #e5e7eb' }}>
          {contentTypeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedContentType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedContentType(tab.id);
                  setSelectedItem(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: isActive ? '#f9fafb' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #8B9F7E' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? '500' : '400',
                  color: isActive ? '#111827' : '#6b7280',
                  transition: 'all 0.2s'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {tab.label}
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: isActive ? '#8B9F7E' : '#e5e7eb',
                  color: isActive ? '#fff' : '#6b7280',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', height: 'calc(100vh - 220px)' }}>
        {/* Left Panel - Content List */}
        <div style={{ 
          width: '320px', 
          backgroundColor: '#fff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Search Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
              {selectedContentType === 'product' ? 'Products' : 
               selectedContentType === 'category' ? 'Categories' : 
               selectedContentType === 'page' ? 'Pages' : 
               selectedContentType === 'policy' ? 'Policies' : 'Blog Posts'}
              <span style={{ fontSize: '14px', fontWeight: '400', color: '#6b7280', marginLeft: '8px' }}>
                ({filteredContent.length})
              </span>
            </h3>
            <div style={{ position: 'relative' }}>
              <Search style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder={`Search ${selectedContentType === 'product' ? 'products' : selectedContentType === 'category' ? 'categories' : selectedContentType === 'page' ? 'pages' : selectedContentType === 'policy' ? 'policies' : 'blog posts'}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 40px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button style={{ 
                position: 'absolute', 
                right: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}>
                <Filter style={{ width: '16px', height: '16px', color: '#9ca3af' }} />
              </button>
            </div>
          </div>

          {/* Content List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingContent ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%' 
              }}>
                <Loader2 style={{ width: '32px', height: '32px', color: '#9ca3af', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredContent.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                padding: '40px'
              }}>
                <Package style={{ width: '48px', height: '48px', color: '#e5e7eb', marginBottom: '16px' }} />
                <p style={{ color: '#9ca3af', textAlign: 'center' }}>
                  No {selectedContentType === 'product' ? 'products' : 
                       selectedContentType === 'category' ? 'categories' : 
                       selectedContentType === 'page' ? 'pages' : 
                       selectedContentType === 'policy' ? 'policies' : 'blog posts'} found
                </p>
              </div>
            ) : (
              <div>
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      backgroundColor: selectedItem?.id === item.id ? '#f9fafb' : '#fff',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedItem?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedItem?.id !== item.id) {
                        e.currentTarget.style.backgroundColor = '#fff';
                      }
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#111827',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.title || item.name}
                      </h4>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {item.translationCount > 0 ? (
                        <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                      ) : (
                        <AlertCircle style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                      )}
                      <button 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          backgroundColor: '#8B9F7E',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          width: '28px',
                          height: '28px'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItem(item);
                        }}
                        title="Translate"
                      >
                        <Edit style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Translation Editor */}
        <div style={{ 
          flex: 1,
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {selectedItem ? (
            <>
              {/* Translation Header */}
              <div style={{ 
                backgroundColor: '#fff',
                padding: '20px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {selectedItem.title || selectedItem.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Translating from {sourceLanguage.toUpperCase()} to {targetLanguage.toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>

              {/* Translation Fields */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Title/Name Field */}
                  <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px', display: 'block' }}>
                      {selectedContentType === 'product' || selectedContentType === 'category' ? 'Name' : 'Title'}
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          Original ({sourceLanguage.toUpperCase()})
                        </div>
                        <input
                          type="text"
                          value={selectedContentType === 'product' ? selectedItem.title : (selectedItem.name || selectedItem.title)}
                          readOnly
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            backgroundColor: '#f9fafb',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                          Translation ({targetLanguage.toUpperCase()})
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={selectedContentType === 'product' ? (contentTranslations[targetLanguage]?.title || '') : (contentTranslations[targetLanguage]?.name || contentTranslations[targetLanguage]?.title || '')}
                            onChange={(e) => {
                              setContentTranslations({
                                ...contentTranslations,
                                [targetLanguage]: {
                                  ...contentTranslations[targetLanguage],
                                  [selectedContentType === 'product' ? 'title' : (selectedContentType === 'category' ? 'name' : 'title')]: e.target.value
                                }
                              });
                            }}
                            style={{
                              flex: 1,
                              padding: '8px 12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none'
                            }}
                            placeholder="Enter translation..."
                          />
                          <button
                            onClick={() => {
                              const fieldName = selectedContentType === 'product' ? 'title' : (selectedContentType === 'category' ? 'name' : 'title');
                              const originalText = selectedContentType === 'product' ? selectedItem.title : (selectedItem.name || selectedItem.title);
                              autoTranslate(fieldName, originalText || '');
                            }}
                            disabled={autoTranslating}
                            style={{
                              padding: '8px',
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              cursor: autoTranslating ? 'not-allowed' : 'pointer',
                              opacity: autoTranslating ? 0.5 : 1
                            }}
                            title="Auto-translate with AI"
                          >
                            {autoTranslating ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: '16px', height: '16px' }} />}
                          </button>
                          <button
                            onClick={() => saveContentTranslation(
                              selectedContentType === 'product' ? 'title' : (selectedContentType === 'category' ? 'name' : 'title'),
                              contentTranslations[targetLanguage]?.[selectedContentType === 'product' ? 'title' : (selectedContentType === 'category' ? 'name' : 'title')] || ''
                            )}
                            disabled={savingTranslation}
                            style={{
                              padding: '8px',
                              backgroundColor: '#8B9F7E',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: savingTranslation ? 'not-allowed' : 'pointer',
                              opacity: savingTranslation ? 0.5 : 1
                            }}
                          >
                            {savingTranslation ? <Loader2 style={{ width: '16px', height: '16px', color: '#fff', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '16px', height: '16px' }} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description/Content Field */}
                  {(selectedItem.description || selectedItem.content) && (
                    <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <label style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '12px', display: 'block' }}>
                        {selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'Content' : 'Description'}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            Original ({sourceLanguage.toUpperCase()})
                          </div>
                          <textarea
                            value={selectedItem.description || selectedItem.content}
                            readOnly
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              backgroundColor: '#f9fafb',
                              fontSize: '14px',
                              resize: 'none'
                            }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Translation ({targetLanguage.toUpperCase()})</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => {
                                  const fieldName = selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description';
                                  const originalText = selectedItem.description || selectedItem.content;
                                  autoTranslate(fieldName, originalText || '');
                                }}
                                disabled={autoTranslating}
                                style={{
                                  padding: '6px',
                                  backgroundColor: '#f3f4f6',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '4px',
                                  cursor: autoTranslating ? 'not-allowed' : 'pointer',
                                  opacity: autoTranslating ? 0.5 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px'
                                }}
                                title="Auto-translate with AI"
                              >
                                {autoTranslating ? <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> : <Sparkles style={{ width: '14px', height: '14px' }} />}
                                {!autoTranslating && 'AI Translate'}
                              </button>
                              <button
                                onClick={() => saveContentTranslation(
                                  selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description',
                                  contentTranslations[targetLanguage]?.[selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description'] || ''
                                )}
                                disabled={savingTranslation}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#8B9F7E',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: savingTranslation ? 'not-allowed' : 'pointer',
                                  opacity: savingTranslation ? 0.5 : 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '12px'
                                }}
                              >
                                {savingTranslation ? <Loader2 style={{ width: '14px', height: '14px', color: '#fff', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
                                Save
                              </button>
                            </div>
                          </div>
                          <textarea
                            value={contentTranslations[targetLanguage]?.description || contentTranslations[targetLanguage]?.content || ''}
                            onChange={(e) => {
                              setContentTranslations({
                                ...contentTranslations,
                                [targetLanguage]: {
                                  ...contentTranslations[targetLanguage],
                                  [selectedContentType === 'page' || selectedContentType === 'blogPost' ? 'content' : 'description']: e.target.value
                                }
                              });
                            }}
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              fontSize: '14px',
                              resize: 'none',
                              outline: 'none'
                            }}
                            placeholder="Enter translation..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              padding: '40px'
            }}>
              <Languages style={{ width: '48px', height: '48px', color: '#e5e7eb', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                Select content to translate
              </h3>
              <p style={{ color: '#6b7280', textAlign: 'center' }}>
                Choose a {selectedContentType === 'product' ? 'product' : 
                          selectedContentType === 'category' ? 'category' : 
                          selectedContentType === 'page' ? 'page' : 
                          selectedContentType === 'policy' ? 'policy' : 'blog post'} from the list to start translating
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}