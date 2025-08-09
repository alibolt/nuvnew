'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Palette, 
  Check, 
  Eye, 
  Settings, 
  Code, 
  Download,
  Upload,
  MoreVertical,
  Loader2,
  Clock,
  User,
  TrendingUp,
  Sparkles,
  Layers,
  Globe,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X,
  Monitor,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

interface Theme {
  id: string;
  name: string;
  description: string;
  image?: string;
  version: string;
  author: string;
  active: boolean;
  category: string;
  lastModified?: string;
  performance?: {
    desktop: number;
    mobile: number;
  };
  features?: string[];
  status?: 'active' | 'inactive' | 'draft';
}

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  themeCode?: string;
  _count?: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface ThemesContentProps {
  store: StoreData;
}

const availableThemes: Theme[] = [
  {
    id: 'base',
    name: 'Base Theme',
    description: 'A clean and modern e-commerce theme with essential features',
    version: '1.0.0',
    author: 'Nuvi Team',
    active: false,
    category: 'General',
    performance: { desktop: 95, mobile: 88 },
    features: ['Responsive', 'SEO Ready', 'Fast Loading'],
    status: 'active',
    lastModified: '2 days ago'
  },
  {
    id: 'skateshop',
    name: 'Skateshop',
    description: 'Professional skateboard shop theme with modern features',
    version: '1.0.0',
    author: 'Skateshop Team',
    active: false,
    category: 'Sports',
    performance: { desktop: 92, mobile: 85 },
    features: ['Video Support', 'Product Zoom', 'Reviews'],
    status: 'active',
    lastModified: 'Yesterday'
  }
];

export function ThemesContent({ store }: ThemesContentProps) {
  const router = useRouter();
  const [activeThemeId, setActiveThemeId] = useState<string>(store.themeCode || 'base');
  const [loading, setLoading] = useState(false);
  const [activatingTheme, setActivatingTheme] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Stats
  const stats = {
    desktop: availableThemes.find(t => t.id === activeThemeId)?.performance?.desktop || 0,
    mobile: availableThemes.find(t => t.id === activeThemeId)?.performance?.mobile || 0,
    totalThemes: availableThemes.length,
    activeTheme: availableThemes.find(t => t.id === activeThemeId)?.name || 'None'
  };

  // Load current theme on mount
  useEffect(() => {
    const loadCurrentTheme = async () => {
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/theme`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setActiveThemeId(data.themeCode || 'base');
        }
      } catch (error) {
        console.error('Failed to load current theme:', error);
      }
    };

    loadCurrentTheme();
  }, [store.subdomain]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as HTMLElement).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleActivateTheme = async (themeId: string) => {
    setActivatingTheme(themeId);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/theme`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeCode: themeId }),
        credentials: 'include'
      });

      if (response.ok) {
        setActiveThemeId(themeId);
        toast.success('Theme activated successfully');
      } else {
        toast.error('Failed to activate theme');
      }
    } catch (error) {
      console.error('Error activating theme:', error);
      toast.error('Error activating theme');
    } finally {
      setActivatingTheme(null);
    }
  };

  const handleCustomizeTheme = (themeId: string) => {
    router.push(`/dashboard/stores/${store.subdomain}/theme-studio?theme=${themeId}`);
  };

  const handleEditCode = (themeId: string) => {
    router.push(`/dashboard/stores/${store.subdomain}/themes/code-editor?theme=${themeId}`);
  };

  const handlePreviewTheme = (themeId: string) => {
    window.open(`/s/${store.subdomain}?preview=true&theme=${themeId}`, '_blank');
  };

  const handleExportTheme = async (themeId: string) => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/themes/${themeId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${themeId}-theme.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Theme exported successfully');
      } else {
        toast.error('Failed to export theme');
      }
    } catch (error) {
      toast.error('Error exporting theme');
    }
  };

  // Filter themes
  const filteredThemes = availableThemes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          theme.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && theme.id === activeThemeId) ||
                         (filterStatus === 'inactive' && theme.id !== activeThemeId);
    return matchesSearch && matchesStatus;
  });

  // Update theme data with active status
  const themes = filteredThemes.map(theme => ({
    ...theme,
    active: theme.id === activeThemeId
  }));

  return (
    <div className="nuvi-tab-panel">
      {/* Header - Matching Products/Apps style */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Themes</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage your store appearance and customize themes</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            onClick={() => setShowUploadModal(true)}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Upload className="h-4 w-4" />
            Import Theme
          </button>
          <button
            onClick={() => router.push(`/dashboard/stores/${store.subdomain}/theme-studio`)}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Settings className="h-4 w-4" />
            Theme Studio
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
              <span className="nuvi-text-sm nuvi-text-secondary">Active Theme</span>
              <Palette className="h-4 w-4 nuvi-text-primary" />
            </div>
            <div className="nuvi-text-2xl nuvi-font-bold">{stats.activeTheme}</div>
            <div className="nuvi-flex nuvi-items-center nuvi-mt-xs">
              <CheckCircle className="h-3 w-3 nuvi-text-success nuvi-mr-xs" />
              <span className="nuvi-text-xs nuvi-text-success">Published</span>
            </div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
              <span className="nuvi-text-sm nuvi-text-secondary">Desktop Score</span>
              <TrendingUp className="h-4 w-4 nuvi-text-success" />
            </div>
            <div className="nuvi-text-2xl nuvi-font-bold">{stats.desktop}</div>
            <div className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">Performance</div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
              <span className="nuvi-text-sm nuvi-text-secondary">Mobile Score</span>
              <TrendingUp className="h-4 w-4 nuvi-text-success" />
            </div>
            <div className="nuvi-text-2xl nuvi-font-bold">{stats.mobile}</div>
            <div className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">Performance</div>
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-p-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
              <span className="nuvi-text-sm nuvi-text-secondary">Total Themes</span>
              <Layers className="h-4 w-4 nuvi-text-primary" />
            </div>
            <div className="nuvi-text-2xl nuvi-font-bold">{stats.totalThemes}</div>
            <div className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">Available</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="nuvi-flex nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-flex-1">
          <div className="nuvi-relative">
            <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
            <input
              type="text"
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="nuvi-input nuvi-pl-10"
            />
          </div>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="nuvi-input"
          style={{ width: '180px' }}
        >
          <option value="all">All Themes</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Themes Grid - Card with Image style */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
        {themes.map((theme) => (
          <div 
            key={theme.id} 
            className="nuvi-card nuvi-transition-all nuvi-duration-200 hover:nuvi-shadow-lg"
            style={{ cursor: 'pointer', overflow: 'visible' }}
          >
            {/* Theme Preview Image */}
            <div 
              style={{ 
                height: '200px', 
                background: `linear-gradient(135deg, ${theme.id === 'base' ? '#3B82F6' : '#8B5CF6'} 0%, ${theme.id === 'base' ? '#1E40AF' : '#6D28D9'} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <Palette className="h-16 w-16 nuvi-text-white nuvi-opacity-50" />
              
              {/* Active Badge */}
              {theme.active && (
                <div className="nuvi-absolute nuvi-top-3 nuvi-right-3">
                  <span className="nuvi-badge nuvi-badge-success">
                    <CheckCircle className="h-3 w-3 nuvi-mr-xs" />
                    Active
                  </span>
                </div>
              )}
              
              {/* Performance Scores */}
              <div className="nuvi-absolute nuvi-bottom-3 nuvi-left-3 nuvi-flex nuvi-gap-sm">
                <div className="nuvi-bg-white/90 nuvi-backdrop-blur nuvi-rounded nuvi-px-sm nuvi-py-xs">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                    <Monitor className="h-3 w-3 nuvi-text-gray-600" />
                    <span className="nuvi-text-xs nuvi-font-medium">{theme.performance?.desktop}</span>
                  </div>
                </div>
                <div className="nuvi-bg-white/90 nuvi-backdrop-blur nuvi-rounded nuvi-px-sm nuvi-py-xs">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                    <Smartphone className="h-3 w-3 nuvi-text-gray-600" />
                    <span className="nuvi-text-xs nuvi-font-medium">{theme.performance?.mobile}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card Content */}
            <div className="nuvi-card-content">
              <div className="nuvi-mb-md">
                <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-sm">
                  <h4 className="nuvi-font-semibold nuvi-text-lg">{theme.name}</h4>
                  <span className="nuvi-badge nuvi-badge-secondary nuvi-text-xs">
                    {theme.category}
                  </span>
                </div>
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">{theme.description}</p>
                
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-text-xs nuvi-text-muted">
                  <span className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                    <Clock className="h-3 w-3" />
                    {theme.lastModified}
                  </span>
                  <span>v{theme.version}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="nuvi-flex nuvi-gap-sm">
                {!theme.active ? (
                  <button
                    onClick={() => handleActivateTheme(theme.id)}
                    disabled={activatingTheme === theme.id}
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-flex-1"
                  >
                    {activatingTheme === theme.id ? (
                      <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                    ) : (
                      <>Activate</>  
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleCustomizeTheme(theme.id)}
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-flex-1"
                  >
                    <Settings className="h-4 w-4" />
                    Customize
                  </button>
                )}
                
                <button
                  onClick={() => handlePreviewTheme(theme.id)}
                  className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </button>
                
                {/* More Options Dropdown */}
                <div className="dropdown-container" style={{ position: 'relative' }}>
                  <button 
                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === theme.id ? null : theme.id);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {openDropdown === theme.id && (
                    <div style={{
                      position: 'absolute',
                      right: '0',
                      top: '100%',
                      marginTop: '4px',
                      width: '192px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #E5E7EB',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCode(theme.id);
                          setOpenDropdown(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderBottom: '1px solid #E5E7EB',
                          backgroundColor: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <Code className="h-4 w-4" />
                        Edit Code
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportTheme(theme.id);
                          setOpenDropdown(null);
                        }}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                      >
                        <Download className="h-4 w-4" />
                        Export Theme
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {themes.length === 0 && (
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="nuvi-text-center nuvi-py-xl">
              <Palette className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No themes found</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Try adjusting your search or filters</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Upload className="h-4 w-4" />
                Import Theme
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="nuvi-fixed nuvi-inset-0 nuvi-bg-black/50 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-z-50">
          <div className="nuvi-bg-white nuvi-rounded-lg nuvi-shadow-xl nuvi-w-full nuvi-max-w-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-lg nuvi-border-b">
              <h3 className="nuvi-text-lg nuvi-font-semibold">Import Theme</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="nuvi-p-lg">
              <div className="nuvi-border-2 nuvi-border-dashed nuvi-border-gray-300 nuvi-rounded-lg nuvi-p-xl nuvi-text-center">
                <Upload className="h-12 w-12 nuvi-text-gray-400 nuvi-mx-auto nuvi-mb-md" />
                <p className="nuvi-text-base nuvi-mb-sm">Drop your theme ZIP file here</p>
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">or</p>
                <button className="nuvi-btn nuvi-btn-primary">
                  Browse Files
                </button>
              </div>
              <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-md">
                Maximum file size: 50MB. Supported format: ZIP
              </p>
            </div>
            <div className="nuvi-flex nuvi-justify-end nuvi-gap-sm nuvi-p-lg nuvi-border-t">
              <button
                onClick={() => setShowUploadModal(false)}
                className="nuvi-btn nuvi-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.info('Theme upload coming soon');
                  setShowUploadModal(false);
                }}
                className="nuvi-btn nuvi-btn-primary"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}