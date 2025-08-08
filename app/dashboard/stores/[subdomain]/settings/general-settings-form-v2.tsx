'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  ChevronRight, Eye, Copy, Check, Settings,
  Store as StoreIcon, Info, Shield, Activity, Globe, 
  Package, Users, ShoppingCart, Palette, Link as LinkIcon,
  Phone, Building2, Mail, MapPin, Facebook, Instagram,
  Twitter, Youtube, Linkedin, Search, Clock
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'basic' as const, label: 'Store Information', icon: StoreIcon },
  { id: 'contact' as const, label: 'Contact & Address', icon: Phone },
  { id: 'social' as const, label: 'Social & SEO', icon: Globe },
  { id: 'analytics' as const, label: 'Analytics', icon: Activity },
  { id: 'advanced' as const, label: 'Advanced', icon: Settings },
];

const initialFormData = {
    // Basic Information
    name: '',
    description: '',
    businessType: '',
    timeZone: 'America/New_York',
    weekStartsOn: 'monday',
    weightUnit: 'kg',
    lengthUnit: 'cm',
    
    // Contact & Address
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    
    // Social & SEO
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
    tiktok: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    
    // Analytics & Tracking
    googleAnalyticsId: '',
    facebookPixelId: '',
    tiktokPixelId: '',
    snapchatPixelId: '',
    hotjarId: '',
    clarityId: '',
    
    // Advanced Settings
    enablePasswordProtection: false,
    password: '',
    enableAgeVerification: false,
    minimumAge: 18,
    enableMaintenanceMode: false,
    maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
    customScripts: {
      header: '',
      footer: ''
    },
};

const businessTypes = [
  'Fashion & Apparel',
  'Electronics & Technology',
  'Food & Beverage',
  'Health & Beauty',
  'Home & Garden',
  'Sports & Fitness',
  'Books & Media',
  'Jewelry & Accessories',
  'Toys & Games',
  'Arts & Crafts',
  'Other'
];

export function GeneralSettingsFormV2({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'social' | 'analytics' | 'advanced'>('basic');
  const [copiedStoreId, setCopiedStoreId] = useState(false);
  const [copiedSubdomain, setCopiedSubdomain] = useState(false);

  const copyToClipboard = (text: string, type: 'id' | 'subdomain') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedStoreId(true);
      setTimeout(() => setCopiedStoreId(false), 2000);
    } else {
      setCopiedSubdomain(true);
      setTimeout(() => setCopiedSubdomain(false), 2000);
    }
  };

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}"
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Store Settings"
          description="Manage your store information, contact details, and preferences"
        >

      {/* Tabs */}
      <div className="nuvi-settings-tabs">
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
      <div className="nuvi-tab-content">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Store Information</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Store Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="nuvi-input"
                    placeholder="My Online Store"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This is your store's display name
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Store Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    className="nuvi-input"
                    rows={3}
                    placeholder="A brief description of your store"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Describe what your store sells or offers
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    className="nuvi-select"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    This helps us provide relevant features and recommendations
                  </p>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Regional Settings</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Time Zone</label>
                    <select
                      value={formData.timeZone}
                      onChange={(e) => handleChange('timeZone', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEDT)</option>
                    </select>
                  </div>

                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Week Starts On</label>
                    <select
                      value={formData.weekStartsOn}
                      onChange={(e) => handleChange('weekStartsOn', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="sunday">Sunday</option>
                      <option value="monday">Monday</option>
                    </select>
                  </div>
                </div>

                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Weight Unit</label>
                    <select
                      value={formData.weightUnit}
                      onChange={(e) => handleChange('weightUnit', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="g">Grams (g)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="oz">Ounces (oz)</option>
                    </select>
                  </div>

                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Length Unit</label>
                    <select
                      value={formData.lengthUnit}
                      onChange={(e) => handleChange('lengthUnit', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="m">Meters (m)</option>
                      <option value="in">Inches (in)</option>
                      <option value="ft">Feet (ft)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Address Tab */}
        {activeTab === 'contact' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Contact Information</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Email Address</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="nuvi-input"
                      placeholder="store@example.com"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="nuvi-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Business Address</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="nuvi-input"
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="nuvi-input"
                      placeholder="New York"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">State/Province</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      className="nuvi-input"
                      placeholder="NY"
                    />
                  </div>
                </div>
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      className="nuvi-input"
                      placeholder="10001"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Country</label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="ES">Spain</option>
                      <option value="IT">Italy</option>
                      <option value="JP">Japan</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social & SEO Tab */}
        {activeTab === 'social' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Social Media Links</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Facebook</label>
                    <input
                      type="url"
                      value={formData.facebook}
                      onChange={(e) => handleChange('facebook', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://facebook.com/yourstore"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Instagram</label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => handleChange('instagram', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://instagram.com/yourstore"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Twitter</label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => handleChange('twitter', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://twitter.com/yourstore"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Youtube</label>
                    <input
                      type="url"
                      value={formData.youtube}
                      onChange={(e) => handleChange('youtube', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://youtube.com/@yourstore"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://linkedin.com/company/yourstore"
                    />
                  </div>
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">TikTok</label>
                    <input
                      type="url"
                      value={formData.tiktok}
                      onChange={(e) => handleChange('tiktok', e.target.value)}
                      className="nuvi-input"
                      placeholder="https://tiktok.com/@yourstore"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">SEO Settings</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleChange('metaTitle', e.target.value)}
                    className="nuvi-input"
                    placeholder="Your Store - Quality Products Online"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Appears in browser tabs and search results
                  </p>
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Meta Description</label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                    className="nuvi-input"
                    rows={3}
                    placeholder="Shop the best quality products at great prices..."
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Appears in search engine results
                  </p>
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.metaKeywords}
                    onChange={(e) => handleChange('metaKeywords', e.target.value)}
                    className="nuvi-input"
                    placeholder="online store, shopping, products"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Comma-separated keywords for search engines
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Analytics Services</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Google Analytics ID</label>
                  <input
                    type="text"
                    value={formData.googleAnalyticsId}
                    onChange={(e) => handleChange('googleAnalyticsId', e.target.value)}
                    className="nuvi-input"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Track visitor behavior with Google Analytics
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Hotjar ID</label>
                  <input
                    type="text"
                    value={formData.hotjarId}
                    onChange={(e) => handleChange('hotjarId', e.target.value)}
                    className="nuvi-input"
                    placeholder="1234567"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Understand user behavior with heatmaps and recordings
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Microsoft Clarity ID</label>
                  <input
                    type="text"
                    value={formData.clarityId}
                    onChange={(e) => handleChange('clarityId', e.target.value)}
                    className="nuvi-input"
                    placeholder="abcdef1234"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Free heatmaps and session recordings
                  </p>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Marketing Pixels</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={formData.facebookPixelId}
                    onChange={(e) => handleChange('facebookPixelId', e.target.value)}
                    className="nuvi-input"
                    placeholder="1234567890123456"
                  />
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">TikTok Pixel ID</label>
                  <input
                    type="text"
                    value={formData.tiktokPixelId}
                    onChange={(e) => handleChange('tiktokPixelId', e.target.value)}
                    className="nuvi-input"
                    placeholder="XXXXXXXXXXXXXXXXX"
                  />
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Snapchat Pixel ID</label>
                  <input
                    type="text"
                    value={formData.snapchatPixelId}
                    onChange={(e) => handleChange('snapchatPixelId', e.target.value)}
                    className="nuvi-input"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Access Control</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <label className="nuvi-label">Password Protection</label>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Restrict access to your store with a password
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enablePasswordProtection}
                      onChange={(e) => handleChange('enablePasswordProtection', e.target.checked)}
                      className="nuvi-toggle"
                    />
                  </div>
                  {formData.enablePasswordProtection && (
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="nuvi-input nuvi-mt-md"
                      placeholder="Enter password"
                    />
                  )}
                </div>

                <div className="nuvi-form-group">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <label className="nuvi-label">Age Verification</label>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Require visitors to confirm their age
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableAgeVerification}
                      onChange={(e) => handleChange('enableAgeVerification', e.target.checked)}
                      className="nuvi-toggle"
                    />
                  </div>
                  {formData.enableAgeVerification && (
                    <div className="nuvi-mt-md">
                      <label className="nuvi-label">Minimum Age</label>
                      <input
                        type="number"
                        value={formData.minimumAge}
                        onChange={(e) => handleChange('minimumAge', parseInt(e.target.value))}
                        className="nuvi-input"
                        min="13"
                        max="99"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Maintenance Mode</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <label className="nuvi-label">Enable Maintenance Mode</label>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Temporarily close your store to visitors
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.enableMaintenanceMode}
                      onChange={(e) => handleChange('enableMaintenanceMode', e.target.checked)}
                      className="nuvi-toggle"
                    />
                  </div>
                </div>

                {formData.enableMaintenanceMode && (
                  <div className="nuvi-form-group">
                    <label className="nuvi-label">Maintenance Message</label>
                    <textarea
                      value={formData.maintenanceMessage}
                      onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                      className="nuvi-input"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Custom Scripts</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Header Scripts</label>
                  <textarea
                    value={formData.customScripts.header}
                    onChange={(e) => handleChange('customScripts.header', e.target.value)}
                    className="nuvi-input nuvi-font-mono nuvi-text-sm"
                    rows={4}
                    placeholder="<!-- Scripts to be added to <head> -->"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Added before closing &lt;/head&gt; tag
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Footer Scripts</label>
                  <textarea
                    value={formData.customScripts.footer}
                    onChange={(e) => handleChange('customScripts.footer', e.target.value)}
                    className="nuvi-input nuvi-font-mono nuvi-text-sm"
                    rows={4}
                    placeholder="<!-- Scripts to be added before </body> -->"
                  />
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Added before closing &lt;/body&gt; tag
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Store ID Info - Always visible at the bottom */}
        <div className="nuvi-mt-xl nuvi-pt-lg nuvi-border-t">
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Store Identifiers</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Store ID</label>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <input
                      type="text"
                      value={store.id}
                      readOnly
                      className="nuvi-input nuvi-bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(store.id, 'id')}
                      className="nuvi-btn nuvi-btn-secondary"
                    >
                      {copiedStoreId ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedStoreId ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Unique identifier for API requests
                  </p>
                </div>

                <div className="nuvi-form-group">
                  <label className="nuvi-label">Subdomain</label>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <input
                      type="text"
                      value={store.subdomain}
                      readOnly
                      className="nuvi-input nuvi-bg-gray-50"
                    />
                    <button
                      onClick={() => copyToClipboard(store.subdomain, 'subdomain')}
                      className="nuvi-btn nuvi-btn-secondary"
                    >
                      {copiedSubdomain ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedSubdomain ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                    Your store's subdomain URL
                  </p>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">API Information</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-bg-blue-50 nuvi-border nuvi-border-blue-200 nuvi-p-md nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-gap-sm">
                    <Info className="h-5 w-5 nuvi-text-blue-600 nuvi-flex-shrink-0" />
                    <div>
                      <h4 className="nuvi-font-medium nuvi-text-blue-900">API Access</h4>
                      <p className="nuvi-text-sm nuvi-text-blue-700 nuvi-mt-xs">
                        To access the API, generate API keys from your account settings.
                        Use the Store subdomain above when making API requests.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Store Statistics</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-text-center nuvi-p-md nuvi-bg-gray-50 nuvi-rounded-lg">
                    <Package className="h-8 w-8 nuvi-text-primary nuvi-mx-auto nuvi-mb-sm" />
                    <p className="nuvi-text-2xl nuvi-font-bold">{(store as any)._count?.products || 0}</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Products</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-bg-gray-50 nuvi-rounded-lg">
                    <ShoppingCart className="h-8 w-8 nuvi-text-primary nuvi-mx-auto nuvi-mb-sm" />
                    <p className="nuvi-text-2xl nuvi-font-bold">{(store as any)._count?.orders || 0}</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Orders</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-bg-gray-50 nuvi-rounded-lg">
                    <Users className="h-8 w-8 nuvi-text-primary nuvi-mx-auto nuvi-mb-sm" />
                    <p className="nuvi-text-2xl nuvi-font-bold">{(store as any)._count?.customers || 0}</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}