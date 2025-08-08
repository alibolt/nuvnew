'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Facebook, Instagram, Twitter, Youtube, Linkedin, Video,
  Building2, Clock, Globe, MapPin, Phone, Mail, User, Settings,
  Search, Calendar, ShoppingBag, CreditCard
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'contact' as const, label: 'Contact Info', icon: Phone },
  { id: 'business' as const, label: 'Business Details', icon: Building2 },
  { id: 'social' as const, label: 'Social Media', icon: Globe },
  { id: 'seo' as const, label: 'SEO Settings', icon: Search },
];

const timeZones = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney'
];

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

export function StoreDetailsFormV2({ store }: { store: Store & { settings?: any } }) {
  const [activeTab, setActiveTab] = useState<'contact' | 'business' | 'social' | 'seo'>('contact');

  // Initialize form data from store and settings
  const initialFormData = {
    // Store basic info
    name: store.name || '',
    description: store.description || '',
    
    // Contact Information
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    
    // Business Details from StoreSettings
    businessName: store.settings?.businessName || store.name || '',
    businessEmail: store.settings?.businessEmail || store.email || '',
    businessPhone: store.settings?.businessPhone || store.phone || '',
    businessAddress: store.settings?.businessAddress || store.address || '',
    businessCity: store.settings?.businessCity || '',
    businessState: store.settings?.businessState || '',
    businessZip: store.settings?.businessZip || '',
    businessCountry: store.settings?.businessCountry || 'United States',
    businessType: store.settings?.businessType || '',
    taxId: store.settings?.taxId || '',
    timeZone: store.settings?.timeZone || 'America/New_York',
    businessHours: store.settings?.businessHours || {
      enabled: true,
      timezone: 'America/New_York',
      hours: {
        monday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        tuesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        wednesday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        thursday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        friday: { enabled: true, openTime: '09:00', closeTime: '17:00' },
        saturday: { enabled: true, openTime: '10:00', closeTime: '16:00' },
        sunday: { enabled: false, openTime: '12:00', closeTime: '16:00' }
      }
    },
    
    // Social Media
    facebookUrl: store.settings?.facebookUrl || store.facebook || '',
    instagramUrl: store.settings?.instagramUrl || store.instagram || '',
    twitterUrl: store.settings?.twitterUrl || store.twitter || '',
    youtubeUrl: store.settings?.youtubeUrl || store.youtube || '',
    linkedinUrl: store.settings?.linkedinUrl || '',
    tiktokUrl: store.settings?.tiktokUrl || '',
    
    // SEO Settings
    metaTitle: store.settings?.metaTitle || store.metaTitle || '',
    metaDescription: store.settings?.metaDescription || store.metaDescription || '',
    metaKeywords: store.settings?.metaKeywords || store.keywords || ''
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    // Basic store fields
    name: data.name,
    description: data.description,
    email: data.email,
    phone: data.phone,
    address: data.address,
    facebook: data.facebookUrl,
    instagram: data.instagramUrl,
    twitter: data.twitterUrl,
    youtube: data.youtubeUrl,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    keywords: data.metaKeywords,
    // Store settings
    storeSettings: {
      businessName: data.businessName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
      businessAddress: data.businessAddress,
      businessCity: data.businessCity,
      businessState: data.businessState,
      businessZip: data.businessZip,
      businessCountry: data.businessCountry,
      businessType: data.businessType,
      taxId: data.taxId,
      timeZone: data.timeZone,
      businessHours: data.businessHours,
      facebookUrl: data.facebookUrl,
      instagramUrl: data.instagramUrl,
      twitterUrl: data.twitterUrl,
      youtubeUrl: data.youtubeUrl,
      linkedinUrl: data.linkedinUrl,
      tiktokUrl: data.tiktokUrl,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      metaKeywords: data.metaKeywords
    }
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Store Details"
          description="Manage your store's basic information and settings"
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
            {activeTab === 'contact' && (
              <ContactTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'business' && (
              <BusinessTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'social' && (
              <SocialTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'seo' && (
              <SeoTab formData={formData} handleChange={handleChange} />
            )}
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}

// Contact Tab Component
function ContactTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Store Information */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Store Information</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Store Name</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="My Awesome Store"
              />
            </div>

            <div>
              <label className="nuvi-label">Store Description</label>
              <textarea
                className="nuvi-textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Tell customers about your store..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Contact Details</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Email Address</label>
              <input
                type="email"
                className="nuvi-input"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@mystore.com"
              />
            </div>

            <div>
              <label className="nuvi-label">Phone Number</label>
              <input
                type="tel"
                className="nuvi-input"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="nuvi-label">Address</label>
              <textarea
                className="nuvi-textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="123 Main St, City, State 12345"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Business Tab Component
function BusinessTab({ formData, handleChange }: any) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  return (
    <div className="nuvi-space-y-lg">
      {/* Business Information */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Business Information</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
            <div>
              <label className="nuvi-label">Business Name</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Official Business Name"
              />
            </div>

            <div>
              <label className="nuvi-label">Business Type</label>
              <select
                className="nuvi-select"
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="nuvi-label">Business Email</label>
              <input
                type="email"
                className="nuvi-input"
                value={formData.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                placeholder="business@company.com"
              />
            </div>

            <div>
              <label className="nuvi-label">Business Phone</label>
              <input
                type="tel"
                className="nuvi-input"
                value={formData.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="nuvi-label">Tax ID</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.taxId}
                onChange={(e) => handleChange('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>

            <div>
              <label className="nuvi-label">Time Zone</label>
              <select
                className="nuvi-select"
                value={formData.timeZone}
                onChange={(e) => handleChange('timeZone', e.target.value)}
              >
                {timeZones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Business Address */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Business Address</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Street Address</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.businessAddress}
                onChange={(e) => handleChange('businessAddress', e.target.value)}
                placeholder="123 Business St"
              />
            </div>

            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
              <div>
                <label className="nuvi-label">City</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.businessCity}
                  onChange={(e) => handleChange('businessCity', e.target.value)}
                  placeholder="City"
                />
              </div>

              <div>
                <label className="nuvi-label">State/Province</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.businessState}
                  onChange={(e) => handleChange('businessState', e.target.value)}
                  placeholder="State"
                />
              </div>

              <div>
                <label className="nuvi-label">ZIP/Postal Code</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.businessZip}
                  onChange={(e) => handleChange('businessZip', e.target.value)}
                  placeholder="12345"
                />
              </div>
            </div>

            <div>
              <label className="nuvi-label">Country</label>
              <select
                className="nuvi-select"
                value={formData.businessCountry}
                onChange={(e) => handleChange('businessCountry', e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
                <option value="Japan">Japan</option>
                <option value="Brazil">Brazil</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <h3 className="nuvi-card-title">Business Hours</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.businessHours.enabled}
                onChange={(e) => handleChange('businessHours', {
                  ...formData.businessHours,
                  enabled: e.target.checked
                })}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
            </label>
          </div>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-sm">
            {days.map(day => (
              <div key={day} className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-w-32">
                  <label className="nuvi-capitalize">{day}</label>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.businessHours.hours[day].enabled}
                    onChange={(e) => handleChange('businessHours', {
                      ...formData.businessHours,
                      hours: {
                        ...formData.businessHours.hours,
                        [day]: {
                          ...formData.businessHours.hours[day],
                          enabled: e.target.checked
                        }
                      }
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                </label>
                <input
                  type="time"
                  className="nuvi-input nuvi-w-28"
                  value={formData.businessHours.hours[day].openTime}
                  onChange={(e) => handleChange('businessHours', {
                    ...formData.businessHours,
                    hours: {
                      ...formData.businessHours.hours,
                      [day]: {
                        ...formData.businessHours.hours[day],
                        openTime: e.target.value
                      }
                    }
                  })}
                  disabled={!formData.businessHours.hours[day].enabled}
                />
                <span>to</span>
                <input
                  type="time"
                  className="nuvi-input nuvi-w-28"
                  value={formData.businessHours.hours[day].closeTime}
                  onChange={(e) => handleChange('businessHours', {
                    ...formData.businessHours,
                    hours: {
                      ...formData.businessHours.hours,
                      [day]: {
                        ...formData.businessHours.hours[day],
                        closeTime: e.target.value
                      }
                    }
                  })}
                  disabled={!formData.businessHours.hours[day].enabled}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Social Tab Component
function SocialTab({ formData, handleChange }: any) {
  const socialNetworks = [
    { id: 'facebookUrl', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/mystore' },
    { id: 'instagramUrl', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/mystore' },
    { id: 'twitterUrl', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/mystore' },
    { id: 'youtubeUrl', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/c/mystore' },
    { id: 'linkedinUrl', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/mystore' },
    { id: 'tiktokUrl', label: 'TikTok', icon: Video, placeholder: 'https://tiktok.com/@mystore' },
  ];

  return (
    <div className="nuvi-space-y-lg">
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Social Media Links</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Connect your social media accounts to display links on your store
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {socialNetworks.map(network => {
              const Icon = network.icon;
              return (
                <div key={network.id}>
                  <label className="nuvi-label nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Icon className="h-4 w-4" />
                    {network.label}
                  </label>
                  <input
                    type="url"
                    className="nuvi-input"
                    value={formData[network.id]}
                    onChange={(e) => handleChange(network.id, e.target.value)}
                    placeholder={network.placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// SEO Tab Component
function SeoTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Search Engine Optimization</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Optimize your store for search engines
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Meta Title</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.metaTitle}
                onChange={(e) => handleChange('metaTitle', e.target.value)}
                placeholder="My Store - Best Products Online"
                maxLength={70}
              />
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                {formData.metaTitle.length}/70 characters
              </p>
            </div>

            <div>
              <label className="nuvi-label">Meta Description</label>
              <textarea
                className="nuvi-textarea"
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => handleChange('metaDescription', e.target.value)}
                placeholder="Shop the best products at amazing prices..."
                maxLength={160}
              />
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                {formData.metaDescription.length}/160 characters
              </p>
            </div>

            <div>
              <label className="nuvi-label">Meta Keywords</label>
              <input
                type="text"
                className="nuvi-input"
                value={formData.metaKeywords}
                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                placeholder="online store, shopping, products, deals"
              />
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                Separate keywords with commas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">SEO Preview</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-border nuvi-rounded-lg nuvi-p-md nuvi-bg-gray-50">
            <h3 className="nuvi-text-lg nuvi-font-medium nuvi-text-blue-600 nuvi-mb-sm">
              {formData.metaTitle || 'Store Title'}
            </h3>
            <p className="nuvi-text-sm nuvi-text-green-700 nuvi-mb-sm">
              {store.customDomain || `${store.subdomain}.nuvi.com`}
            </p>
            <p className="nuvi-text-sm nuvi-text-gray-600">
              {formData.metaDescription || 'Store description will appear here...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}