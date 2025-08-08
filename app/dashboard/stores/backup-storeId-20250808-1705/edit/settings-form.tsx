'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';

export function SettingsForm({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: store.name,
    description: store.description || '',
    logo: store.logo || '',
    primaryColor: store.primaryColor || '#8B9F7E',
    email: store.email || '',
    phone: store.phone || '',
    address: store.address || '',
    facebook: store.facebook || '',
    instagram: store.instagram || '',
    twitter: store.twitter || '',
    youtube: store.youtube || '',
    metaTitle: store.metaTitle || '',
    metaDescription: store.metaDescription || '',
    keywords: store.keywords || '',
    bannerImage: store.bannerImage || '',
    bannerTitle: store.bannerTitle || '',
    bannerSubtitle: store.bannerSubtitle || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to update store');
      } else {
        setSuccess('Store settings updated successfully!');
        setTimeout(() => {
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Store Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Store Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="Tell customers about your store..."
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
              Store Logo URL
            </label>
            <input
              type="url"
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo && (
              <div className="mt-2">
                <img
                  src={formData.logo}
                  alt="Store logo preview"
                  className="h-20 w-20 object-contain rounded-md border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
              Primary Brand Color
            </label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
                pattern="^#[0-9A-Fa-f]{6}$"
                placeholder="#8B9F7E"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              This color will be used for buttons and links in your store
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="contact@yourstore.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Business Address
            </label>
            <textarea
              id="address"
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="123 Main St, City, State 12345"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <input
              type="url"
              id="facebook"
              value={formData.facebook}
              onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://facebook.com/yourpage"
            />
          </div>

          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">
              Instagram
            </label>
            <input
              type="url"
              id="instagram"
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>

          <div>
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
              Twitter (X)
            </label>
            <input
              type="url"
              id="twitter"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>

          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700">
              YouTube
            </label>
            <input
              type="url"
              id="youtube"
              value={formData.youtube}
              onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://youtube.com/@yourchannel"
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">
              Meta Title
            </label>
            <input
              type="text"
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder={store.name}
              maxLength={60}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.metaTitle.length}/60 characters. This appears in search results and browser tabs.
            </p>
          </div>

          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">
              Meta Description
            </label>
            <textarea
              id="metaDescription"
              rows={3}
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="Brief description of your store for search engines..."
              maxLength={160}
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.metaDescription.length}/160 characters. This appears in search results.
            </p>
          </div>

          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
              Keywords
            </label>
            <input
              type="text"
              id="keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="shop, store, products, online shopping"
            />
            <p className="mt-1 text-sm text-gray-500">
              Comma-separated keywords that describe your store
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Banner</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700">
              Banner Image URL
            </label>
            <input
              type="url"
              id="bannerImage"
              value={formData.bannerImage}
              onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="https://example.com/banner.jpg"
            />
            {formData.bannerImage && (
              <div className="mt-2">
                <img
                  src={formData.bannerImage}
                  alt="Banner preview"
                  className="w-full h-48 object-cover rounded-md border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Recommended size: 1920x400 pixels for best results
            </p>
          </div>

          <div>
            <label htmlFor="bannerTitle" className="block text-sm font-medium text-gray-700">
              Banner Title
            </label>
            <input
              type="text"
              id="bannerTitle"
              value={formData.bannerTitle}
              onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="Welcome to Our Store"
            />
          </div>

          <div>
            <label htmlFor="bannerSubtitle" className="block text-sm font-medium text-gray-700">
              Banner Subtitle
            </label>
            <input
              type="text"
              id="bannerSubtitle"
              value={formData.bannerSubtitle}
              onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#8B9F7E] focus:border-[#8B9F7E] sm:text-sm"
              placeholder="Discover amazing products at great prices"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#8B9F7E] hover:bg-opacity-90 disabled:opacity-50"
          style={{ backgroundColor: formData.primaryColor }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}