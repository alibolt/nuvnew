'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Palette, Settings, Check, ExternalLink, Plus, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Theme {
  id: string;
  name: string;
  description: string;
  preview?: string;
  isActive: boolean;
}

interface ThemesClientProps {
  store: {
    id: string;
    name: string;
    subdomain: string;
  };
  themes: Theme[];
}

export function ThemesClient({ store, themes }: ThemesClientProps) {
  const router = useRouter();
  const [activatingTheme, setActivatingTheme] = useState<string | null>(null);

  const handleActivateTheme = async (themeId: string) => {
    if (themes.find(t => t.id === themeId)?.isActive) {
      return;
    }

    setActivatingTheme(themeId);
    try {
      const response = await fetch(`/api/stores/${store.id}/themes/${themeId}/activate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to activate theme');
      }

      toast.success('Theme activated successfully');
      router.refresh();
    } catch (error) {
      console.error('Error activating theme:', error);
      toast.error('Failed to activate theme');
    } finally {
      setActivatingTheme(null);
    }
  };

  return (
    <div className="nuvi-tab-panel">
      {/* Header */}
      <div className="nuvi-mb-lg">
        <h2 className="nuvi-text-2xl nuvi-font-bold">Theme Library</h2>
        <p className="nuvi-text-secondary nuvi-text-sm">Choose and customize your store's theme</p>
      </div>

      {/* Current Theme */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-content">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
              <div className="nuvi-w-16 nuvi-h-12 nuvi-bg-surface-hover nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                <Palette className="h-6 w-6 nuvi-text-primary" />
              </div>
              <div>
                <h3 className="nuvi-font-semibold nuvi-mb-xs">Current Theme</h3>
                <p className="nuvi-text-sm nuvi-text-secondary">
                  {themes.find(t => t.isActive)?.name || 'No theme selected'}
                </p>
              </div>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <Link
                href={`/dashboard/stores/${store.id}/theme-studio`}
                className="nuvi-btn nuvi-btn-secondary"
              >
                <Palette className="h-4 w-4" />
                Customize
              </Link>
              <Link
                href={`/dashboard/stores/${store.id}/theme-settings`}
                className="nuvi-btn nuvi-btn-secondary"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Available Themes */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
        {themes.map((theme) => (
          <div key={theme.id} className="nuvi-card">
            <div className="nuvi-aspect-video nuvi-bg-surface-hover nuvi-relative nuvi-rounded-t-lg nuvi-overflow-hidden">
              {/* Grid Layout Preview */}
              <div className="nuvi-w-full nuvi-h-full nuvi-p-4">
                <div className="nuvi-h-full nuvi-bg-white nuvi-rounded nuvi-shadow-sm nuvi-p-3 nuvi-flex nuvi-flex-col nuvi-gap-2">
                  {/* Header */}
                  <div className="nuvi-h-8 nuvi-bg-gray-100 nuvi-rounded nuvi-flex nuvi-items-center nuvi-px-2 nuvi-gap-2">
                    <div className="nuvi-w-20 nuvi-h-4 nuvi-bg-gray-300 nuvi-rounded"></div>
                    <div className="nuvi-flex-1"></div>
                    <div className="nuvi-flex nuvi-gap-1">
                      <div className="nuvi-w-12 nuvi-h-4 nuvi-bg-gray-200 nuvi-rounded"></div>
                      <div className="nuvi-w-12 nuvi-h-4 nuvi-bg-gray-200 nuvi-rounded"></div>
                    </div>
                  </div>
                  {/* Hero */}
                  <div className="nuvi-h-24 nuvi-bg-gradient-to-r nuvi-from-blue-100 nuvi-to-purple-100 nuvi-rounded nuvi-flex nuvi-items-center nuvi-justify-center">
                    <div className="nuvi-text-center">
                      <div className="nuvi-w-32 nuvi-h-3 nuvi-bg-white/60 nuvi-rounded nuvi-mx-auto nuvi-mb-2"></div>
                      <div className="nuvi-w-20 nuvi-h-2 nuvi-bg-white/40 nuvi-rounded nuvi-mx-auto"></div>
                    </div>
                  </div>
                  {/* Grid */}
                  <div className="nuvi-flex-1 nuvi-grid nuvi-grid-cols-3 nuvi-gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="nuvi-bg-gray-50 nuvi-rounded nuvi-p-1">
                        <div className="nuvi-aspect-square nuvi-bg-gray-200 nuvi-rounded nuvi-mb-1"></div>
                        <div className="nuvi-h-1.5 nuvi-bg-gray-300 nuvi-rounded nuvi-mb-0.5"></div>
                        <div className="nuvi-h-1.5 nuvi-bg-gray-200 nuvi-rounded nuvi-w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {theme.isActive && (
                <div className="nuvi-absolute nuvi-top-sm nuvi-right-sm nuvi-bg-success nuvi-text-white nuvi-px-sm nuvi-py-xs nuvi-rounded-md nuvi-text-xs nuvi-flex nuvi-items-center nuvi-gap-xs">
                  <Check className="h-3 w-3" />
                  Active
                </div>
              )}
            </div>
            <div className="nuvi-card-content">
              <h3 className="nuvi-font-semibold nuvi-mb-xs">{theme.name}</h3>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">{theme.description}</p>
              <div className="nuvi-flex nuvi-gap-sm">
                <button
                  onClick={() => handleActivateTheme(theme.id)}
                  disabled={theme.isActive || activatingTheme === theme.id}
                  className={`nuvi-btn ${theme.isActive ? 'nuvi-btn-secondary' : 'nuvi-btn-primary'} nuvi-flex-1`}
                >
                  {theme.isActive ? 'Current Theme' : 'Activate'}
                </button>
                <a
                  href={`https://${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}?theme=${theme.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nuvi-btn nuvi-btn-secondary nuvi-w-10 nuvi-h-10 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Coming Soon Card */}
        <div className="nuvi-card nuvi-border-dashed nuvi-border-2 nuvi-border-gray-300">
          <div className="nuvi-aspect-video nuvi-bg-surface-hover nuvi-relative nuvi-rounded-t-lg nuvi-overflow-hidden nuvi-flex nuvi-items-center nuvi-justify-center">
            <div className="nuvi-text-center">
              <div className="nuvi-w-16 nuvi-h-16 nuvi-bg-gray-200 nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-mx-auto nuvi-mb-3">
                <Lock className="h-8 w-8 nuvi-text-gray-400" />
              </div>
              <p className="nuvi-text-sm nuvi-font-medium nuvi-text-gray-600">More Themes</p>
              <p className="nuvi-text-xs nuvi-text-gray-500">Coming Soon</p>
            </div>
          </div>
          <div className="nuvi-card-content">
            <h3 className="nuvi-font-semibold nuvi-mb-xs">New Themes</h3>
            <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">We're working on new themes for different industries</p>
            <button
              disabled
              className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-opacity-50 nuvi-cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}