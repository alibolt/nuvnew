'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  Facebook, Instagram, Twitter, Youtube, Linkedin, Video,
  Building2, Clock, Globe, MapPin, Phone, Mail, User, Settings,
  Search, Calendar, ShoppingBag, CreditCard
} from 'lucide-react';

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

export function StoreDetailsFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'contact' | 'business' | 'social' | 'seo'>('contact');

  const [formData, setFormData] = useState({
    // Contact Information
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    customerServiceEmail: '',
    customerServicePhone: '',
    
    // Business Details
    businessName: store.name || '',
    businessType: '',
    businessRegNumber: '',
    taxId: '',
    timeZone: 'America/New_York',
    businessHours: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '12:00', close: '16:00', closed: true }
    },
    
    // Social Media
    facebook: store.facebook || '',
    instagram: store.instagram || '',
    twitter: store.twitter || '',
    youtube: store.youtube || '',
    linkedin: '',
    tiktok: '',
    
    // SEO Settings
    metaTitle: store.metaTitle || '',
    metaDescription: store.metaDescription || '',
    keywords: store.keywords || ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
    setShowSaveBar(true);
  };

  const updateBusinessHours = (day: string, type: 'open' | 'close' | 'closed', value: any) => {
    setFormData({
      ...formData,
      businessHours: {
        ...formData.businessHours,
        [day]: {
          ...formData.businessHours[day as keyof typeof formData.businessHours],
          [type]: value
        }
      }
    });
    setHasChanges(true);
    setShowSaveBar(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setHasChanges(false);
        setShowSaveBar(false);
        router.refresh();
        // Show success message
        const successToast = document.createElement('div');
        successToast.className = 'nuvi-toast nuvi-toast-success';
        successToast.textContent = 'Settings saved successfully';
        document.body.appendChild(successToast);
        setTimeout(() => successToast.remove(), 3000);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save changes');
      }
    } catch (error) {
      alert('An error occurred while saving');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    // Reset form data (simplified for brevity)
    setHasChanges(false);
    setShowSaveBar(false);
  };

  return (
    <>
      {/* Page Header */}
      <div className="nuvi-page-header">
        <h2 className="nuvi-page-title">Store Details</h2>
        <p className="nuvi-page-description">
          Manage your store's contact information, business details, and settings
        </p>
      </div>

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
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact Information Tab */}
      {activeTab === 'contact' && (
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-lg">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Contact Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="nuvi-input"
                    placeholder="contact@yourstore.com"
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
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Customer Service Email</label>
                  <input
                    type="email"
                    value={formData.customerServiceEmail}
                    onChange={(e) => handleChange('customerServiceEmail', e.target.value)}
                    className="nuvi-input"
                    placeholder="support@yourstore.com"
                  />
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Customer Service Phone</label>
                  <input
                    type="tel"
                    value={formData.customerServicePhone}
                    onChange={(e) => handleChange('customerServicePhone', e.target.value)}
                    className="nuvi-input"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
              <div className="nuvi-form-group">
                <label className="nuvi-label">Store Address</label>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="nuvi-input"
                  placeholder="123 Main St, City, State 12345, Country"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Business Details Tab */}
      {activeTab === 'business' && (
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-lg">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Building2 className="h-5 w-5" />
                Business Information
              </h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className="nuvi-input"
                    placeholder="Your Business Name Inc."
                  />
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Business Type</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleChange('businessType', e.target.value)}
                    className="nuvi-input"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Business Registration Number</label>
                  <input
                    type="text"
                    value={formData.businessRegNumber}
                    onChange={(e) => handleChange('businessRegNumber', e.target.value)}
                    className="nuvi-input"
                    placeholder="123456789"
                  />
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Tax ID / VAT Number</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) => handleChange('taxId', e.target.value)}
                    className="nuvi-input"
                    placeholder="12-3456789"
                  />
                </div>
                <div className="nuvi-form-group">
                  <label className="nuvi-label">Time Zone</label>
                  <select
                    value={formData.timeZone}
                    onChange={(e) => handleChange('timeZone', e.target.value)}
                    className="nuvi-input"
                  >
                    {timeZones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Clock className="h-5 w-5" />
                Business Hours
              </h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-sm">
                {Object.entries(formData.businessHours).map(([day, hours]) => (
                  <div key={day} className="nuvi-flex nuvi-items-center nuvi-gap-md">
                    <div className="w-24 capitalize nuvi-text-sm nuvi-font-medium">
                      {day}
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <input
                        type="checkbox"
                        checked={!hours.closed}
                        onChange={(e) => updateBusinessHours(day, 'closed', !e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="nuvi-text-sm">Open</span>
                    </div>
                    {!hours.closed && (
                      <>
                        <input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateBusinessHours(day, 'open', e.target.value)}
                          className="nuvi-input w-32"
                        />
                        <span className="nuvi-text-sm">to</span>
                        <input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateBusinessHours(day, 'close', e.target.value)}
                          className="nuvi-input w-32"
                        />
                      </>
                    )}
                    {hours.closed && (
                      <span className="nuvi-text-sm nuvi-text-muted italic">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
              <Globe className="h-5 w-5" />
              Social Media Links
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-lg">
              Add your social media links to help customers connect with you
            </p>
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Facebook className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => handleChange('facebook', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Instagram className="h-5 w-5 text-pink-600 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleChange('instagram', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Twitter className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleChange('twitter', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.youtube}
                  onChange={(e) => handleChange('youtube', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Linkedin className="h-5 w-5 text-blue-700 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <Video className="h-5 w-5 text-gray-800 flex-shrink-0" />
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => handleChange('tiktok', e.target.value)}
                  className="nuvi-input"
                  placeholder="https://tiktok.com/@yourhandle"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO Tab */}
      {activeTab === 'seo' && (
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
              <Search className="h-5 w-5" />
              SEO Settings
            </h3>
          </div>
          <div className="nuvi-card-content">
            <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-lg">
              Improve how your store appears in search engine results
            </p>
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-gap-md">
              <div className="nuvi-form-group">
                <label className="nuvi-label">Page Title</label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  className="nuvi-input"
                  placeholder={store.name}
                  maxLength={60}
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>
              <div className="nuvi-form-group">
                <label className="nuvi-label">Meta Description</label>
                <textarea
                  rows={3}
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  className="nuvi-input"
                  placeholder="Brief description of your store for search engines..."
                  maxLength={160}
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>
              <div className="nuvi-form-group">
                <label className="nuvi-label">Keywords</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => handleChange('keywords', e.target.value)}
                  className="nuvi-input"
                  placeholder="shop, store, products, online shopping"
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                  Separate keywords with commas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Bar */}
      {showSaveBar && (
        <div className="nuvi-save-bar">
          <div className="nuvi-save-bar-content">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              <AlertCircle className="h-5 w-5 nuvi-text-warning" />
              <span>You have unsaved changes</span>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <button
                onClick={handleDiscard}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}