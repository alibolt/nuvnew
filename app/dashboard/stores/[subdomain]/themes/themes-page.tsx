'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Plus, Check, Eye, Settings, Code, Download } from 'lucide-react';

interface Theme {
  id: string;
  name: string;
  description: string;
  image: string;
  version: string;
  author: string;
  active: boolean;
  category: string;
}

const themes: Theme[] = [
  {
    id: 'base',
    name: 'Base Theme',
    description: 'A clean and modern e-commerce theme with essential features for any online store.',
    image: '/themes/base-preview.jpg',
    version: '1.0.0',
    author: 'Nuvi Team',
    active: true,
    category: 'General'
  },
  {
    id: 'skateshop',
    name: 'Skateshop',
    description: 'Professional skateboard shop theme with authentic design from the Skateshop repository.',
    image: '/themes/skateshop-preview.jpg',
    version: '1.0.0',
    author: 'Skateshop Team',
    active: false,
    category: 'Sports'
  }
];

export function ThemesPage({ subdomain }: { subdomain: string }) {
  const router = useRouter();
  const [activeThemeId, setActiveThemeId] = useState<string>('base');
  const [loading, setLoading] = useState(true);

  // Load current theme on mount
  useEffect(() => {
    const loadCurrentTheme = async () => {
      try {
        const response = await fetch(`/api/stores/${subdomain}/theme`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveThemeId(data.themeCode || 'base');
        }
      } catch (error) {
        console.error('Failed to load current theme:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentTheme();
  }, [subdomain]);

  const handleActivateTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeCode: themeId }),
        credentials: 'include'
      });

      if (response.ok) {
        setActiveThemeId(themeId);
        // You could also show a toast notification here
        // toast.success(`Theme activated successfully`);
      } else {
        console.error('Failed to activate theme');
        // toast.error('Failed to activate theme');
      }
    } catch (error) {
      console.error('Error activating theme:', error);
      // toast.error('Error activating theme');
    }
  };

  const handleCustomizeTheme = (themeId: string) => {
    // Navigate to theme studio with the selected theme
    router.push(`/dashboard/stores/${subdomain}/theme-studio?theme=${themeId}`);
  };

  const handlePreviewTheme = (themeId: string) => {
    // Open preview in a new tab
    window.open(`/preview/${subdomain}?theme=${themeId}`, '_blank');
  };

  const handleEditCode = (themeId: string) => {
    router.push(`/dashboard/stores/${subdomain}/themes/code-editor?theme=${themeId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Themes</h1>
          <p className="text-gray-600">Loading themes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Themes</h1>
            <p className="text-gray-600">Manage and customize your store themes</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/stores/${subdomain}/theme-studio`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <Settings size={16} />
            Theme Studio
          </button>
        </div>
      </div>

      {themes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <Palette className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-xl font-semibold mb-2">No themes available</h2>
            <p className="text-gray-600 mb-6">
              There are currently no themes installed. Add a theme to customize your store's appearance.
            </p>
            <button
              onClick={() => router.push(`/dashboard/stores/${subdomain}/theme-studio`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <Plus size={16} />
              Go to Theme Studio
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                theme.id === activeThemeId ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {/* Theme Preview Image */}
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Palette className="text-gray-400" size={48} />
                </div>
                {theme.id === activeThemeId && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Check size={12} />
                    Active
                  </div>
                )}
              </div>

              {/* Theme Info */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-lg">{theme.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {theme.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>v{theme.version}</span>
                    <span>by {theme.author}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {theme.id !== activeThemeId && (
                      <button
                        onClick={() => handleActivateTheme(theme.id)}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleCustomizeTheme(theme.id)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition flex items-center justify-center gap-1"
                    >
                      <Settings size={14} />
                      Customize
                    </button>
                    <button
                      onClick={() => handlePreviewTheme(theme.id)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition"
                      title="Preview"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleEditCode(theme.id)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <Code size={14} />
                    Edit Code
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
