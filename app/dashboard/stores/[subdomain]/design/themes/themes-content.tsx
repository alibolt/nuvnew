'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check, Eye, Edit, ExternalLink, Layers } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ThemesContentProps {
  subdomain: string;
}

interface Theme {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  features: string[];
  preview?: string;
  styles?: {
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      background?: string;
      text?: string;
    };
    typography?: {
      headingFont?: string;
      bodyFont?: string;
      fontFamily?: {
        heading?: string;
        body?: string;
      };
    };
  };
}

export function ThemesContent({ subdomain }: ThemesContentProps) {
  const router = useRouter();
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [appliedThemeId, setAppliedThemeId] = useState<string | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loadingThemes, setLoadingThemes] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);

  // Load available themes
  useEffect(() => {
    const loadThemes = async () => {
      try {
        // For now, we'll hardcode the themes since we don't have an API endpoint
        // In a real implementation, this would fetch from an API
        const availableThemes: Theme[] = [
          {
            id: 'commerce',
            name: 'Commerce Pro',
            version: '1.0.0',
            description: 'Professional e-commerce theme with modern design and conversion optimization',
            author: 'Nuvi Commerce',
            category: 'ecommerce',
            features: ['Product showcase', 'Shopping cart', 'User reviews', 'Wishlist', 'Search & filters', 'Mobile responsive', 'SEO optimized'],
            styles: {
              colors: {
                primary: '#2563EB',
                secondary: '#64748B',
                accent: '#F59E0B',
                background: '#FFFFFF',
                text: '#1E293B'
              },
              typography: {
                headingFont: 'Inter',
                bodyFont: 'Inter'
              }
            }
          },
          {
            id: 'cotton-yarn',
            name: 'Cotton Yarn',
            version: '1.0.0',
            description: 'A sophisticated theme for yarn and craft stores inspired by Urth Yarns',
            author: 'Your Store',
            category: 'craft',
            features: ['Product quick-view', 'Mega menu', 'Sticky header', 'Product zoom', 'Newsletter', 'Wishlist', 'Multi-currency', 'Multi-language'],
            styles: {
              colors: {
                primary: '#2c3e50',
                secondary: '#8b7355',
                accent: '#d4a574',
                background: '#faf8f5',
                text: '#2c3e50'
              },
              typography: {
                fontFamily: {
                  heading: 'Playfair Display',
                  body: 'Lato'
                }
              }
            }
          }
        ];
        
        setThemes(availableThemes);
        
        // Check current theme
        try {
          const response = await fetch(`/api/stores/${subdomain}/theme-instance`);
          if (response.ok) {
            const data = await response.json();
            setCurrentTheme(data.themeCode || 'commerce');
          }
        } catch (error) {
          console.error('Error fetching current theme:', error);
        }
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setLoadingThemes(false);
      }
    };

    loadThemes();
  }, [subdomain]);


  const handleApplyTheme = async (themeId: string) => {
    if (applyingTheme) return;
    
    const confirmed = window.confirm(
      'This will change your store\'s visual theme. Your content and template customizations will be preserved. Continue?'
    );
    
    if (!confirmed) return;

    setApplyingTheme(themeId);

    try {
      const response = await fetch(`/api/stores/${subdomain}/theme-instance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ themeCode: themeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply theme');
      }

      toast.success('Theme applied successfully!');
      setCurrentTheme(themeId);
      setAppliedThemeId(themeId);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error applying theme:', error);
      toast.error('Failed to apply theme');
    } finally {
      setApplyingTheme(null);
    }
  };

  const handlePreviewTheme = (themeId: string) => {
    // Open preview in new tab
    window.open(`/dashboard/stores/${subdomain}/design/themes/preview/${themeId}`, '_blank');
  };

  const handleEditTheme = () => {
    router.push(`/dashboard/stores/${subdomain}/theme-studio`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-2">What are Themes?</h3>
        <p className="text-sm text-gray-600">
          Themes are complete visual frameworks that define the overall look and feel of your store. 
          They include color schemes, typography, component styles, and layout structures.
        </p>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{theme.name}</h3>
                    {currentTheme === theme.id && (
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{theme.description}</p>

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {theme.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {theme.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{theme.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Color Palette */}
                  {theme.styles?.colors && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Color Palette</p>
                      <div className="flex gap-1">
                        {Object.entries(theme.styles.colors).slice(0, 5).map(([key, color]) => (
                          <div
                            key={key}
                            className="w-8 h-8 rounded border border-gray-200"
                            style={{ backgroundColor: color as string }}
                            title={key}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewTheme(theme.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {currentTheme === theme.id ? (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleEditTheme}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          className="flex-1"
                          disabled
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Active
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleEditTheme}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={() => handleApplyTheme(theme.id)}
                          disabled={applyingTheme === theme.id}
                        >
                          {applyingTheme === theme.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Apply
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <span className="text-2xl">💡</span>
          Information
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>
            • Themes define the visual framework of your store including colors, typography, and styles
          </p>
          <p>
            • You can switch between themes without losing your content or customizations
          </p>
          <p>
            • After selecting a theme, you can apply template presets and customize everything in <strong>Theme Studio</strong>
          </p>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Theme Applied Successfully!</DialogTitle>
            <DialogDescription>
              Your new theme has been applied. What would you like to do next?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                window.open(`http://${subdomain}.lvh.me:3000`, '_blank');
                setShowSuccessDialog(false);
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview Your Store
              <span className="ml-auto text-xs text-muted-foreground">Opens in new tab</span>
            </Button>
            <Button
              className="w-full justify-start"
              onClick={() => {
                router.push(`/dashboard/stores/${subdomain}/theme-studio`);
                setShowSuccessDialog(false);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit in Theme Studio
              <span className="ml-auto text-xs text-muted-foreground">Customize your theme</span>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSuccessDialog(false)}
            >
              Stay Here
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}