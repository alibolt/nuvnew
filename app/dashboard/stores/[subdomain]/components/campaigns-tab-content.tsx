'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Mail, Plus, Search, Filter, Eye, Edit, MoreVertical, 
  ArrowLeft, Download, Upload, AlertCircle, CheckCircle, 
  Clock, Send, Users, TrendingUp, BarChart3,
  ChevronLeft, ChevronRight, Trash2, Copy, Calendar
} from 'lucide-react';
import { CampaignFormPanel } from './campaign-form-panel';
import { toast } from 'sonner';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface CampaignsTabContentProps {
  store: StoreData;
}

export function CampaignsTabContent({ store }: CampaignsTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const campaignIdParam = searchParams.get('campaignId');
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(campaignIdParam);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'campaigns');
    if (view !== 'list') {
      params.set('view', view);
      if (view === 'edit' && editingCampaignId) {
        params.set('campaignId', editingCampaignId);
      }
    } else {
      params.delete('view');
      params.delete('campaignId');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, editingCampaignId, searchParams]);

  const handleAddCampaign = () => {
    setView('create');
  };

  const handleEditCampaign = (campaignId: string) => {
    setEditingCampaignId(campaignId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingCampaignId(null);
    // Clear campaignId from URL
    const params = new URLSearchParams(searchParams);
    params.delete('campaignId');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  };

  const handleSave = () => {
    setView('list');
    setEditingCampaignId(null);
    // Trigger a refresh of the campaigns list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <CampaignsListPanel 
          store={store}
          onAddCampaign={handleAddCampaign}
          onEditCampaign={handleEditCampaign}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <CampaignFormPanel 
          store={store}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <CampaignFormPanel 
          store={store}
          campaignId={editingCampaignId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Campaigns List Panel
function CampaignsListPanel({ store, onAddCampaign, onEditCampaign, refreshKey }: {
  store: StoreData;
  onAddCampaign: () => void;
  onEditCampaign: (id: string) => void;
  refreshKey?: number;
}) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);

  // Fetch campaigns from API
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
          setPagination(data.pagination || null);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [store.subdomain, currentPage, refreshKey]);

  // Filter campaigns based on search and filters
  const filteredCampaigns = (campaigns || []).filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesType = filterType === 'all' || campaign.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle select all
  const handleSelectAll = () => {
    if (selectedCampaigns.length === filteredCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(c => c.id));
    }
  };

  // Handle individual selection
  const handleSelectCampaign = (campaignId: string) => {
    if (selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId));
    } else {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCampaigns.length} campaigns?`)) return;
    
    try {
      // Delete campaigns one by one
      for (const campaignId of selectedCampaigns) {
        await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${campaignId}`, {
          method: 'DELETE'
        });
      }
      
      // Refresh and clear selection
      const fetchCampaigns = async () => {
        const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns?page=${currentPage}&limit=50`);
        if (response.ok) {
          const data = await response.json();
          setCampaigns(data.campaigns || []);
        }
      };
      await fetchCampaigns();
      setSelectedCampaigns([]);
      toast.success('Campaigns deleted successfully');
    } catch (error) {
      console.error('Error deleting campaigns:', error);
      toast.error('Failed to delete some campaigns');
    }
  };

  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${campaignId}/duplicate`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const fetchCampaigns = async () => {
          const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns?page=${currentPage}&limit=50`);
          if (response.ok) {
            const data = await response.json();
            setCampaigns(data.campaigns || []);
          }
        };
        await fetchCampaigns();
        toast.success('Campaign duplicated successfully');
      } else {
        toast.error('Failed to duplicate campaign');
      }
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${campaignId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
        toast.success('Campaign deleted successfully');
      } else {
        toast.error('Failed to delete campaign');
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {/* Campaigns Header - Minimal */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Email Campaigns</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Engage customers with targeted email marketing</p>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button className="nuvi-btn nuvi-btn-secondary">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={onAddCampaign}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content">
          {isLoading ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
              <p className="nuvi-text-muted">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="nuvi-text-center nuvi-py-xl">
              <Mail className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
              <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No campaigns yet</h3>
              <p className="nuvi-text-muted nuvi-mb-lg">Create your first email campaign to engage customers</p>
              <button 
                onClick={onAddCampaign}
                className="nuvi-btn nuvi-btn-primary"
              >
                <Plus className="h-4 w-4" />
                Create Campaign
              </button>
            </div>
          ) : (
            <div>
              {/* Search and Filter */}
              <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                <div className="nuvi-flex-1">
                  <div className="nuvi-relative">
                    <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      className="nuvi-input nuvi-pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types ({campaigns.length})</option>
                  <option value="email">Email ({campaigns.filter(c => c.type === 'email').length})</option>
                  <option value="sms">SMS ({campaigns.filter(c => c.type === 'sms').length})</option>
                </select>
                <select 
                  className="nuvi-input" 
                  style={{ width: '180px' }}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">
                    All Status ({campaigns.length})
                  </option>
                  <option value="draft">
                    Draft ({campaigns.filter(c => c.status === 'draft').length})
                  </option>
                  <option value="scheduled">
                    Scheduled ({campaigns.filter(c => c.status === 'scheduled').length})
                  </option>
                  <option value="sent">
                    Sent ({campaigns.filter(c => c.status === 'sent').length})
                  </option>
                </select>
              </div>

              {/* Bulk Actions Bar */}
              {selectedCampaigns.length > 0 && (
                <div className="nuvi-mb-md nuvi-p-md nuvi-bg-primary/10 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <span className="nuvi-text-sm nuvi-font-medium">
                    {selectedCampaigns.length} campaign{selectedCampaigns.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={handleBulkDelete}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Campaigns Table */}
              <div className="nuvi-overflow-x-auto">
                <table className="nuvi-w-full">
                  <thead>
                    <tr className="nuvi-border-b">
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium" style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                          onChange={handleSelectAll}
                          className="nuvi-checkbox"
                        />
                      </th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Campaign</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Sent</th>
                      <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Performance</th>
                      <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="nuvi-py-xl nuvi-text-center nuvi-text-muted">
                          {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                            ? 'No campaigns found matching your filters' 
                            : 'No campaigns yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <tr key={campaign.id} className="nuvi-border-b">
                          <td className="nuvi-py-md nuvi-px-md">
                            <input
                              type="checkbox"
                              checked={selectedCampaigns.includes(campaign.id)}
                              onChange={() => handleSelectCampaign(campaign.id)}
                              className="nuvi-checkbox"
                            />
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div>
                              <p className="nuvi-font-medium">{campaign.name}</p>
                              <p className="nuvi-text-sm nuvi-text-muted">
                                {campaign.subject}
                              </p>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <span className={`nuvi-badge ${
                              campaign.status === 'sent' ? 'nuvi-badge-success' :
                              campaign.status === 'scheduled' ? 'nuvi-badge-warning' :
                              'nuvi-badge-secondary'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                              <Calendar className="h-4 w-4 nuvi-text-muted" />
                              <span className="nuvi-text-sm">
                                {formatDate(campaign.sentAt || campaign.scheduledAt)}
                              </span>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md">
                            <div className="nuvi-text-sm">
                              <p>{campaign.stats?.sent || 0} sent</p>
                              <p className="nuvi-text-muted">
                                {campaign.stats?.opened || 0} opened ({campaign.stats?.openRate || 0}%)
                              </p>
                            </div>
                          </td>
                          <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                              <button 
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                onClick={() => toast.info('Campaign stats coming soon!')}
                              >
                                <BarChart3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDuplicateCampaign(campaign.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => onEditCampaign(campaign.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                                disabled={campaign.status === 'sent'}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteCampaign(campaign.id)}
                                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="nuvi-mt-lg nuvi-flex nuvi-items-center nuvi-justify-between nuvi-border-t nuvi-pt-md">
                  <div className="nuvi-text-sm nuvi-text-muted">
                    Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} campaigns
                  </div>
                  
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const page = startPage + i;
                        
                        if (page > pagination.pages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`nuvi-btn nuvi-btn-sm ${
                              page === currentPage 
                                ? 'nuvi-btn-primary' 
                                : 'nuvi-btn-ghost'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                      disabled={currentPage === pagination.pages}
                      className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}