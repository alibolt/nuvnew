'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Globe, Package, Image, FileText, Loader2, 
  Check, AlertCircle, Download, Eye, ChevronRight, Clock,
  Store, ShoppingBag, ImageIcon, FileTextIcon, Palette,
  Navigation, Import, Folder
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
  const [activeTab, setActiveTab] = useState<'products' | 'collections' | 'menus' | 'siteImages' | 'summary'>('summary');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [selectedItems, setSelectedItems] = useState({
    products: [] as string[],
    collections: [] as string[],
    menus: [] as string[],
    siteImages: [] as string[],
  });

  const analyzeStore = async () => {
    if (!shopifyUrl) return;

    console.log('🔍 Starting analysis for URL:', shopifyUrl);
    setAnalyzing(true);
    try {
      console.log('📞 Making API call to:', `/api/stores/${store.id}/apps/shopify-import/analyze`);
      const response = await fetch(`/api/stores/${store.subdomain}/apps/shopify-import/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shopifyUrl }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', errorData);
        throw new Error(`Failed to analyze store: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Analysis complete:', result);
      // Extract data from the nested response structure
      let data;
      if (result.success && result.data) {
        // New API response format: { success: true, data: { importId: ..., data: {...} } }
        console.log('📦 result.data:', result.data);
        console.log('📦 result.data.data:', result.data.data);
        data = result.data.data || result.data;
      } else {
        // Fallback for old format
        data = result.data || result;
      }
      console.log('📊 Final extracted data:', data);
      console.log('📊 Products count:', data?.products?.length || 0);
      console.log('📊 Collections count:', data?.collections?.length || 0);
      setShopifyData(data);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze store. Please check the URL and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getSelectedData = () => {
    if (!shopifyData) return null;

    return {
      products: selectedItems.products.map(id => {
        const index = parseInt(id.split('-')[1]);
        return shopifyData?.products?.[index];
      }).filter(Boolean),
      collections: selectedItems.collections.map(id => {
        const index = parseInt(id.split('-')[1]);
        return shopifyData?.collections?.[index];
      }).filter(Boolean),
      menus: selectedItems.menus.map(handle => {
        return shopifyData?.navigationMenus?.find((menu: any) => menu.handle === handle);
      }).filter(Boolean),
      siteImages: selectedItems.siteImages.map(url => {
        return shopifyData?.siteImages?.find((image: any) => image.url === url);
      }).filter(Boolean),
    };
  };

  const handleImport = async () => {
    const selectedData = getSelectedData();
    if (!selectedData) return;

    // Check if anything is selected
    const hasSelection = 
      selectedData.products.length > 0 || 
      selectedData.collections.length > 0 ||
      selectedData.menus.length > 0 ||
      selectedData.siteImages.length > 0;

    if (!hasSelection) {
      alert('Please select at least one item to import');
      return;
    }

    console.log('🚀 Starting import with selected data:', selectedData);
    setImporting(true);
    setImportProgress(0);

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/apps/shopify-import/import-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopifyUrl,
          selectedData,
          storeData: shopifyData?.store || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Import Error:', errorData);
        throw new Error(`Import failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Import complete:', result);

      // Clear selection and data
      setShopifyData(null);
      setShopifyUrl('');
      setSelectedItems({
        products: [],
        collections: [],
        menus: [],
        siteImages: [],
      });

      alert('Import completed successfully!');
      
      // Redirect to products page
      router.push(`/dashboard/stores/${store.subdomain}?tab=products`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const toggleAll = (type: 'products' | 'collections' | 'siteImages') => {
    let items: any[] = [];
    let selectedKey: keyof typeof selectedItems;
    let idPrefix: string;
    
    if (type === 'products') {
      items = shopifyData?.products || [];
      selectedKey = 'products';
      idPrefix = 'product';
    } else if (type === 'collections') {
      items = shopifyData?.collections || [];
      selectedKey = 'collections';
      idPrefix = 'collection';
    } else if (type === 'siteImages') {
      items = shopifyData?.siteImages || [];
      selectedKey = 'siteImages';
      idPrefix = 'siteImage';
    } else {
      return;
    }
    
    if (selectedItems[selectedKey].length === items.length) {
      setSelectedItems({ ...selectedItems, [selectedKey]: [] });
    } else {
      if (type === 'siteImages') {
        // For site images, use the URL as the identifier
        setSelectedItems({ 
          ...selectedItems, 
          [selectedKey]: items.map((item: any) => item.url) 
        });
      } else {
        // For products and collections, use index-based identifiers
        setSelectedItems({ 
          ...selectedItems, 
          [selectedKey]: items.map((_: any, i: number) => `${idPrefix}-${i}`) 
        });
      }
    }
  };

  const toggleAllMenus = () => {
    const items = shopifyData?.navigationMenus || [];
    if (selectedItems.menus.length === items.length) {
      setSelectedItems({ ...selectedItems, menus: [] });
    } else {
      setSelectedItems({ 
        ...selectedItems, 
        menus: items.map((menu: any) => menu.handle) 
      });
    }
  };

  return (
    <div className="nuvi-tab-panel">
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Shopify Import</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Import products, pages, and themes from your Shopify store</p>
        </div>
        <Link
          href={`/dashboard/stores/${store.subdomain}?tab=apps`}
          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Apps
        </Link>
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
                  {shopifyData?.store?.name || 'Shopify Store'}
                </h2>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-md:grid-cols-4 nuvi-gap-md">
                  <div className="nuvi-stat-card">
                    <Package className="h-5 w-5 nuvi-text-primary" />
                    <div>
                      <div className="nuvi-stat-value">{shopifyData?.products?.length || 0}</div>
                      <div className="nuvi-stat-label">Products</div>
                    </div>
                  </div>
                  <div className="nuvi-stat-card">
                    <Folder className="h-5 w-5 nuvi-text-primary" />
                    <div>
                      <div className="nuvi-stat-value">{shopifyData?.collections?.length || 0}</div>
                      <div className="nuvi-stat-label">Collections</div>
                    </div>
                  </div>
                  <div className="nuvi-stat-card">
                    <Navigation className="h-5 w-5 nuvi-text-primary" />
                    <div>
                      <div className="nuvi-stat-value">{shopifyData?.navigationMenus?.length || 0}</div>
                      <div className="nuvi-stat-label">Menus</div>
                    </div>
                  </div>
                  <div className="nuvi-stat-card">
                    <ImageIcon className="h-5 w-5 nuvi-text-primary" />
                    <div>
                      <div className="nuvi-stat-value">{shopifyData?.siteImages?.length || 0}</div>
                      <div className="nuvi-stat-label">Site Images</div>
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
                    className={`nuvi-tab ${activeTab === 'summary' ? 'nuvi-active' : ''}`}
                    onClick={() => setActiveTab('summary')}
                  >
                    <FileText className="nuvi-w-4 nuvi-h-4 nuvi-mr-1 nuvi-inline" />
                    Summary
                  </button>
                  <button
                    className={`nuvi-tab ${activeTab === 'products' ? 'nuvi-active' : ''}`}
                    onClick={() => setActiveTab('products')}
                  >
                    <Package className="nuvi-w-4 nuvi-h-4 nuvi-mr-1 nuvi-inline" />
                    Products ({shopifyData?.products?.length || 0})
                  </button>
                  <button
                    className={`nuvi-tab ${activeTab === 'collections' ? 'nuvi-active' : ''}`}
                    onClick={() => setActiveTab('collections')}
                  >
                    <Folder className="nuvi-w-4 nuvi-h-4 nuvi-mr-1 nuvi-inline" />
                    Collections ({shopifyData?.collections?.length || 0})
                  </button>
                  <button
                    className={`nuvi-tab ${activeTab === 'menus' ? 'nuvi-active' : ''}`}
                    onClick={() => setActiveTab('menus')}
                  >
                    <Navigation className="nuvi-w-4 nuvi-h-4 nuvi-mr-1 nuvi-inline" />
                    Menus ({shopifyData?.navigationMenus?.length || 0})
                  </button>
                  <button
                    className={`nuvi-tab ${activeTab === 'siteImages' ? 'nuvi-active' : ''}`}
                    onClick={() => setActiveTab('siteImages')}
                  >
                    <Palette className="nuvi-w-4 nuvi-h-4 nuvi-mr-1 nuvi-inline" />
                    Site Images ({shopifyData?.siteImages?.length || 0})
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                {activeTab === 'summary' && (
                  <div className="nuvi-space-y-md">
                    <h3 className="nuvi-font-medium">Ready to Import</h3>
                    <p className="nuvi-text-muted">Select the content you want to import from the tabs above.</p>
                    
                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md nuvi-mt-md">
                      <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <h4 className="nuvi-font-medium nuvi-mb-sm">Selected Items</h4>
                        <ul className="nuvi-space-y-xs nuvi-text-sm">
                          <li>Products: {selectedItems.products.length} selected</li>
                          <li>Collections: {selectedItems.collections.length} selected</li>
                          <li>Menus: {selectedItems.menus.length} selected</li>
                          <li>Site Images: {selectedItems.siteImages.length} selected</li>
                        </ul>
                      </div>
                    </div>

                    <div className="nuvi-flex nuvi-gap-sm nuvi-mt-lg">
                      <button
                        onClick={handleImport}
                        disabled={importing}
                        className="nuvi-btn nuvi-btn-primary"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Import className="h-4 w-4" />
                            Start Import
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShopifyData(null);
                          setShopifyUrl('');
                        }}
                        className="nuvi-btn nuvi-btn-ghost"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'products' && (
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                      <h3 className="nuvi-font-medium">Products</h3>
                      <button
                        onClick={() => toggleAll('products')}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        {selectedItems.products.length === shopifyData?.products?.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="nuvi-space-y-sm">
                      {(shopifyData?.products || []).map((product: any, index: number) => (
                        <label key={index} className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-border nuvi-rounded nuvi-hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={selectedItems.products.includes(`product-${index}`)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems({
                                  ...selectedItems,
                                  products: [...selectedItems.products, `product-${index}`]
                                });
                              } else {
                                setSelectedItems({
                                  ...selectedItems,
                                  products: selectedItems.products.filter(id => id !== `product-${index}`)
                                });
                              }
                            }}
                            className="nuvi-checkbox"
                          />
                          <div className="nuvi-flex-1">
                            <div className="nuvi-font-medium">{product.title}</div>
                            <div className="nuvi-text-sm nuvi-text-muted">
                              ${product?.variants?.[0]?.price || '0'} • {product?.variants?.length || 0} variants
                            </div>
                          </div>
                          {(product?.images?.[0]?.url || product?.image) && (
                            <img 
                              src={product?.images?.[0]?.url || product?.image} 
                              alt={product?.images?.[0]?.altText || product?.title || 'Product'} 
                              className="nuvi-w-12 nuvi-h-12 nuvi-rounded nuvi-object-cover" 
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}


                {activeTab === 'collections' && (
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                      <h3 className="nuvi-font-medium">Collections</h3>
                      <button
                        onClick={() => toggleAll('collections')}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        {selectedItems.collections.length === shopifyData?.collections?.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="nuvi-space-y-sm">
                      {(shopifyData?.collections || []).map((collection: any, index: number) => (
                        <label key={index} className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-p-sm nuvi-border nuvi-rounded nuvi-hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={selectedItems.collections.includes(`collection-${index}`)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems({
                                  ...selectedItems,
                                  collections: [...selectedItems.collections, `collection-${index}`]
                                });
                              } else {
                                setSelectedItems({
                                  ...selectedItems,
                                  collections: selectedItems.collections.filter(id => id !== `collection-${index}`)
                                });
                              }
                            }}
                            className="nuvi-checkbox"
                          />
                          <div className="nuvi-flex-1">
                            <div className="nuvi-font-medium">{collection.title}</div>
                            <div className="nuvi-text-sm nuvi-text-muted">{collection.handle}</div>
                          </div>
                          {collection.image?.url && (
                            <img 
                              src={collection.image.url} 
                              alt={collection.title} 
                              className="nuvi-w-12 nuvi-h-12 nuvi-rounded nuvi-object-cover" 
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'menus' && (
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                      <h3 className="nuvi-font-medium">Navigation Menus</h3>
                      <button
                        onClick={() => toggleAllMenus()}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        {selectedItems.menus.length === shopifyData?.navigationMenus?.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <p className="nuvi-text-muted">Select navigation menus to import to your store.</p>
                    
                    <div className="nuvi-space-y-sm">
                      {shopifyData?.navigationMenus?.map((menu: any, index: number) => (
                        <label 
                          key={index}
                          className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-cursor-pointer hover:nuvi-bg-gray-50"
                        >
                          <div className="nuvi-flex nuvi-items-center nuvi-space-x-sm">
                            <input
                              type="checkbox"
                              checked={selectedItems.menus.includes(menu.handle)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    menus: [...prev.menus, menu.handle]
                                  }));
                                } else {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    menus: prev.menus.filter(id => id !== menu.handle)
                                  }));
                                }
                              }}
                              className="nuvi-rounded"
                            />
                            <Navigation className="nuvi-w-5 nuvi-h-5 nuvi-text-blue-500" />
                            <div>
                              <div className="nuvi-font-medium">{menu.name}</div>
                              <div className="nuvi-text-sm nuvi-text-muted">{menu.items?.length || 0} items</div>
                            </div>
                          </div>
                          <div className="nuvi-text-sm nuvi-text-muted">
                            {menu.items?.slice(0, 3).map((item: any) => item.label).join(', ')}
                            {menu.items?.length > 3 && '...'}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'siteImages' && (
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                      <h3 className="nuvi-font-medium">Site Images</h3>
                      <button
                        onClick={() => toggleAll('siteImages')}
                        className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                      >
                        {selectedItems.siteImages.length === shopifyData?.siteImages?.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <p className="nuvi-text-muted">Import logos, banners, and other site images (excluding product photos).</p>
                    
                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
                      {shopifyData?.siteImages?.map((image: any, index: number) => (
                        <label 
                          key={index}
                          className="nuvi-block nuvi-border nuvi-rounded-lg nuvi-overflow-hidden nuvi-cursor-pointer hover:nuvi-border-blue-300"
                        >
                          <div className="nuvi-relative">
                            <input
                              type="checkbox"
                              checked={selectedItems.siteImages.includes(image.url)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    siteImages: [...prev.siteImages, image.url]
                                  }));
                                } else {
                                  setSelectedItems(prev => ({
                                    ...prev,
                                    siteImages: prev.siteImages.filter(url => url !== image.url)
                                  }));
                                }
                              }}
                              className="nuvi-absolute nuvi-top-2 nuvi-left-2 nuvi-rounded"
                            />
                            <img 
                              src={image.url} 
                              alt={image.alt} 
                              className="nuvi-w-full nuvi-h-32 nuvi-object-cover" 
                            />
                            <div className="nuvi-absolute nuvi-top-2 nuvi-right-2">
                              <span className="nuvi-inline-flex nuvi-items-center nuvi-px-2 nuvi-py-1 nuvi-rounded nuvi-text-xs nuvi-font-medium nuvi-bg-white nuvi-text-gray-700 nuvi-shadow-sm">
                                {image.type}
                              </span>
                            </div>
                          </div>
                          <div className="nuvi-p-3">
                            <div className="nuvi-font-medium nuvi-text-sm">{image.category}</div>
                            <div className="nuvi-text-xs nuvi-text-muted nuvi-truncate">{image.alt}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Import History */}
        {importSessions.length > 0 && (
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h2 className="nuvi-card-title">
                <Clock className="h-5 w-5" />
                Import History
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
  );
}