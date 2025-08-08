'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Package, Image, FileText, Loader2, 
  Check, AlertCircle, Download, Eye, ChevronRight, Clock,
  Store, ShoppingBag, ImageIcon, FileTextIcon, Palette,
  Navigation, Import
} from 'lucide-react';

interface ShopifyImportClientProps {
  store: any;
  appInstall: any;
  importSessions: any[];
}

export function ShopifyImportClient({ store, appInstall, importSessions }: ShopifyImportClientProps) {
  const router = useRouter();
  const [shopifyUrl, setShopifyUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [shopifyData, setShopifyData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'pages' | 'theme' | 'summary'>('summary');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedItems, setSelectedItems] = useState({
    products: [] as string[],
    pages: [] as string[],
    collections: [] as string[],
    theme: false,
    sections: [] as string[],
  });

  const analyzeStore = async () => {
    if (!shopifyUrl) return;

    console.log('🔍 Starting analysis for URL:', shopifyUrl);
    setAnalyzing(true);
    try {
      console.log('📞 Making API call to:', `/api/stores/${store.id}/apps/shopify-import/analyze`);
      const response = await fetch(`/api/stores/${store.id}/apps/shopify-import/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopifyUrl }),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Analyze error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze store');
      }

      const data = await response.json();
      console.log('✅ Received data:', data);
      console.log('📦 Products count:', data.data?.products?.length || 0);
      console.log('🏷️ Collections count:', data.data?.collections?.length || 0);
      console.log('📄 Pages count:', data.data?.pages?.length || 0);
      
      setShopifyData(data.data);
      
      // Pre-select all items
      setSelectedItems({
        products: data.data.products.map((p: any, i: number) => `product-${i}`),
        pages: data.data.pages.map((p: any, i: number) => `page-${i}`),
        collections: data.data.collections.map((c: any, i: number) => `collection-${i}`),
        theme: true,
        sections: data.data.sections.map((s: any, i: number) => `section-${i}`),
      });
    } catch (error) {
      console.error('Error analyzing store:', error);
      alert('Failed to analyze store. Please check the URL and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const importSelected = async () => {
    if (!shopifyData) return;

    setImporting(true);
    setImportProgress(0);

    try {
      // Import products
      if (selectedItems.products.length > 0) {
        setImportProgress(10);
        const selectedProducts = selectedItems.products.map(id => {
          const index = parseInt(id.split('-')[1]);
          return shopifyData.products[index];
        });

        await fetch(`/api/stores/${store.id}/apps/shopify-import/import-products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: selectedProducts }),
        });
      }

      // Import pages
      if (selectedItems.pages.length > 0) {
        setImportProgress(40);
        const selectedPages = selectedItems.pages.map(id => {
          const index = parseInt(id.split('-')[1]);
          return shopifyData.pages[index];
        });

        await fetch(`/api/stores/${store.id}/apps/shopify-import/import-pages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pages: selectedPages }),
        });
      }

      // Import theme and sections
      if (selectedItems.theme && selectedItems.sections.length > 0) {
        setImportProgress(70);
        const selectedSections = selectedItems.sections.map(id => {
          const index = parseInt(id.split('-')[1]);
          return shopifyData.sections[index];
        });

        await fetch(`/api/stores/${store.id}/apps/shopify-import/import-theme`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            theme: shopifyData.theme,
            sections: selectedSections,
          }),
        });
      }

      setImportProgress(100);
      alert('Import completed successfully!');
      router.push(`/dashboard/stores/${store.id}?tab=products`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const toggleAll = (type: 'products' | 'pages' | 'collections' | 'sections') => {
    if (selectedItems[type].length === shopifyData[type].length) {
      setSelectedItems({ ...selectedItems, [type]: [] });
    } else {
      setSelectedItems({ 
        ...selectedItems, 
        [type]: shopifyData[type].map((_: any, i: number) => `${type.slice(0, -1)}-${i}`) 
      });
    }
  };

  return (
    <div className="nuvi-admin">
      <div className="nuvi-container">
        {/* Header */}
        <div className="nuvi-page-header">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
            <Link
              href={`/dashboard/stores/${store.id}?tab=apps`}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="nuvi-page-title">Shopify Import</h1>
              <p className="nuvi-text-muted">Import products, pages, and themes from your Shopify store</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-lg">
          {!shopifyData ? (
            // Step 1: Enter URL
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">
                  <Globe className="h-5 w-5" />
                  Enter Your Shopify Store URL
                </h2>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Shopify Store URL</label>
                  <input
                    type="text"
                    value={shopifyUrl}
                    onChange={(e) => setShopifyUrl(e.target.value)}
                    placeholder="mystore.myshopify.com"
                    className="nuvi-input"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                    Enter your Shopify store's URL (e.g., mystore.myshopify.com)
                  </p>
                </div>

                <div className="nuvi-flex nuvi-gap-sm nuvi-mt-md">
                  <button
                    onClick={analyzeStore}
                    disabled={!shopifyUrl || analyzing}
                    className="nuvi-btn nuvi-btn-primary"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing Store...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Analyze Store
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Step 2: Review and Import
            <>
              {/* Summary Card */}
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title">
                    <Store className="h-5 w-5" />
                    {shopifyData.store.name}
                  </h2>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-grid nuvi-grid-cols-2 nuvi-md:grid-cols-4 nuvi-gap-md">
                    <div className="nuvi-stat-card">
                      <Package className="h-5 w-5 nuvi-text-primary" />
                      <div>
                        <div className="nuvi-stat-value">{shopifyData.summary.totalProducts}</div>
                        <div className="nuvi-stat-label">Products</div>
                      </div>
                    </div>
                    <div className="nuvi-stat-card">
                      <FileText className="h-5 w-5 nuvi-text-primary" />
                      <div>
                        <div className="nuvi-stat-value">{shopifyData.summary.totalPages}</div>
                        <div className="nuvi-stat-label">Pages</div>
                      </div>
                    </div>
                    <div className="nuvi-stat-card">
                      <ImageIcon className="h-5 w-5 nuvi-text-primary" />
                      <div>
                        <div className="nuvi-stat-value">{shopifyData.summary.totalImages}</div>
                        <div className="nuvi-stat-label">Images</div>
                      </div>
                    </div>
                    <div className="nuvi-stat-card">
                      <Palette className="h-5 w-5 nuvi-text-primary" />
                      <div>
                        <div className="nuvi-stat-value">{shopifyData.summary.totalSections}</div>
                        <div className="nuvi-stat-label">Sections</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <div className="nuvi-tabs">
                    <button
                      onClick={() => setActiveTab('summary')}
                      className={`nuvi-tab ${activeTab === 'summary' ? 'active' : ''}`}
                    >
                      <Store className="h-4 w-4" />
                      Summary
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`nuvi-tab ${activeTab === 'products' ? 'active' : ''}`}
                    >
                      <Package className="h-4 w-4" />
                      Products ({shopifyData.products.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('pages')}
                      className={`nuvi-tab ${activeTab === 'pages' ? 'active' : ''}`}
                    >
                      <FileText className="h-4 w-4" />
                      Pages ({shopifyData.pages.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('theme')}
                      className={`nuvi-tab ${activeTab === 'theme' ? 'active' : ''}`}
                    >
                      <Palette className="h-4 w-4" />
                      Theme & Sections
                    </button>
                  </div>
                </div>

                <div className="nuvi-card-content">
                  {activeTab === 'summary' && (
                    <div className="nuvi-space-y-lg">
                      <div>
                        <h3 className="nuvi-font-semibold nuvi-mb-md">Store Information</h3>
                        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                          <div>
                            <label className="nuvi-text-sm nuvi-text-muted">Store Name</label>
                            <p className="nuvi-font-medium">{shopifyData.store.name}</p>
                          </div>
                          <div>
                            <label className="nuvi-text-sm nuvi-text-muted">Domain</label>
                            <p className="nuvi-font-medium">{shopifyData.store.domain}</p>
                          </div>
                          {shopifyData.store.description && (
                            <div className="nuvi-col-span-2">
                              <label className="nuvi-text-sm nuvi-text-muted">Description</label>
                              <p className="nuvi-font-medium">{shopifyData.store.description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="nuvi-font-semibold nuvi-mb-md">What will be imported</h3>
                        <div className="nuvi-space-y-sm">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{selectedItems.products.length} Products with all variants and images</span>
                          </div>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{selectedItems.collections.length} Collections/Categories</span>
                          </div>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{selectedItems.pages.length} Pages with content</span>
                          </div>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{selectedItems.sections.length} Theme sections</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'products' && (
                    <div>
                      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
                        <label className="nuvi-checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedItems.products.length === shopifyData.products.length}
                            onChange={() => toggleAll('products')}
                          />
                          <span className="nuvi-checkbox"></span>
                          <span className="nuvi-ml-sm">Select All</span>
                        </label>
                        <span className="nuvi-text-sm nuvi-text-muted">
                          {selectedItems.products.length} of {shopifyData.products.length} selected
                        </span>
                      </div>

                      <div className="nuvi-space-y-sm nuvi-max-h-96 nuvi-overflow-y-auto">
                        {shopifyData.products.map((product: any, index: number) => (
                          <div key={index} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                            <label className="nuvi-checkbox-container nuvi-flex nuvi-items-start">
                              <input
                                type="checkbox"
                                checked={selectedItems.products.includes(`product-${index}`)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems({
                                      ...selectedItems,
                                      products: [...selectedItems.products, `product-${index}`],
                                    });
                                  } else {
                                    setSelectedItems({
                                      ...selectedItems,
                                      products: selectedItems.products.filter(id => id !== `product-${index}`),
                                    });
                                  }
                                }}
                              />
                              <span className="nuvi-checkbox"></span>
                              <div className="nuvi-ml-md nuvi-flex-1">
                                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                                  {product.images?.[0] && (
                                    <img
                                      src={product.images[0].url}
                                      alt={product.title}
                                      className="nuvi-w-16 nuvi-h-16 nuvi-object-cover nuvi-rounded"
                                    />
                                  )}
                                  <div className="nuvi-flex-1">
                                    <h4 className="nuvi-font-medium">{product.title}</h4>
                                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                                      {product.variants?.length || 0} variants • {product.images?.length || 0} images
                                    </p>
                                    {product.description && (
                                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm nuvi-line-clamp-2">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pages' && (
                    <div>
                      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
                        <label className="nuvi-checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedItems.pages.length === shopifyData.pages.length}
                            onChange={() => toggleAll('pages')}
                          />
                          <span className="nuvi-checkbox"></span>
                          <span className="nuvi-ml-sm">Select All</span>
                        </label>
                        <span className="nuvi-text-sm nuvi-text-muted">
                          {selectedItems.pages.length} of {shopifyData.pages.length} selected
                        </span>
                      </div>

                      <div className="nuvi-space-y-sm nuvi-max-h-96 nuvi-overflow-y-auto">
                        {shopifyData.pages.map((page: any, index: number) => (
                          <div key={index} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                            <label className="nuvi-checkbox-container">
                              <input
                                type="checkbox"
                                checked={selectedItems.pages.includes(`page-${index}`)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems({
                                      ...selectedItems,
                                      pages: [...selectedItems.pages, `page-${index}`],
                                    });
                                  } else {
                                    setSelectedItems({
                                      ...selectedItems,
                                      pages: selectedItems.pages.filter(id => id !== `page-${index}`),
                                    });
                                  }
                                }}
                              />
                              <span className="nuvi-checkbox"></span>
                              <div className="nuvi-ml-md">
                                <h4 className="nuvi-font-medium">{page.title}</h4>
                                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                                  {page.handle}
                                </p>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'theme' && (
                    <div>
                      <div className="nuvi-mb-lg">
                        <label className="nuvi-checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedItems.theme}
                            onChange={(e) => setSelectedItems({ ...selectedItems, theme: e.target.checked })}
                          />
                          <span className="nuvi-checkbox"></span>
                          <div className="nuvi-ml-md">
                            <h4 className="nuvi-font-medium">Import Theme Settings</h4>
                            <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                              Colors, fonts, and general theme configuration
                            </p>
                          </div>
                        </label>
                      </div>

                      <div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-md">
                          <h4 className="nuvi-font-medium">Sections</h4>
                          <label className="nuvi-checkbox-container">
                            <input
                              type="checkbox"
                              checked={selectedItems.sections.length === shopifyData.sections.length}
                              onChange={() => toggleAll('sections')}
                            />
                            <span className="nuvi-checkbox"></span>
                            <span className="nuvi-ml-sm">Select All</span>
                          </label>
                        </div>

                        <div className="nuvi-space-y-sm nuvi-max-h-96 nuvi-overflow-y-auto">
                          {shopifyData.sections.map((section: any, index: number) => (
                            <div key={index} className="nuvi-border nuvi-rounded-lg nuvi-p-md">
                              <label className="nuvi-checkbox-container">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.sections.includes(`section-${index}`)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems({
                                        ...selectedItems,
                                        sections: [...selectedItems.sections, `section-${index}`],
                                      });
                                    } else {
                                      setSelectedItems({
                                        ...selectedItems,
                                        sections: selectedItems.sections.filter(id => id !== `section-${index}`),
                                      });
                                    }
                                  }}
                                />
                                <span className="nuvi-checkbox"></span>
                                <div className="nuvi-ml-md">
                                  <h4 className="nuvi-font-medium">{section.name || section.type}</h4>
                                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                                    {section.type}
                                  </p>
                                </div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Import Actions */}
                <div className="nuvi-card-footer">
                  <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                    <button
                      onClick={() => {
                        setShopifyData(null);
                        setSelectedItems({
                          products: [],
                          pages: [],
                          collections: [],
                          theme: false,
                          sections: [],
                        });
                      }}
                      className="nuvi-btn nuvi-btn-ghost"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Start Over
                    </button>
                    <button
                      onClick={importSelected}
                      disabled={importing || (
                        selectedItems.products.length === 0 &&
                        selectedItems.pages.length === 0 &&
                        selectedItems.collections.length === 0 &&
                        !selectedItems.theme
                      )}
                      className="nuvi-btn nuvi-btn-primary"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Importing... {importProgress}%
                        </>
                      ) : (
                        <>
                          <Import className="h-4 w-4" />
                          Import Selected Items
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Previous Imports */}
          {importSessions.length > 0 && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">
                  <Clock className="h-5 w-5" />
                  Previous Imports
                </h2>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {importSessions.map((session) => (
                    <div key={session.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm nuvi-border nuvi-rounded">
                      <div>
                        <p className="nuvi-font-medium">{session.storeUrl}</p>
                        <p className="nuvi-text-sm nuvi-text-muted">
                          {new Date(session.startedAt).toLocaleDateString()} • {session.status}
                        </p>
                      </div>
                      {session.status === 'completed' && session.data && (
                        <button
                          onClick={() => setShopifyData(session.data)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}