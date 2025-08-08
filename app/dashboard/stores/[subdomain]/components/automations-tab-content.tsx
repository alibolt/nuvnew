'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Zap, Plus, Search, Filter, Eye, Edit2, MoreVertical, 
  ArrowLeft, Download, Upload, ShoppingCart, Mail, 
  Clock, Users, GitBranch, Play, Pause, Trash2,
  ChevronLeft, ChevronRight, Copy, CheckCircle, XCircle
} from 'lucide-react';
import { AutomationFormPanel } from './automation-form-panel';
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

interface AutomationsTabContentProps {
  store: StoreData;
}

interface Automation {
  id: string;
  name: string;
  description?: string;
  type: string;
  trigger: {
    type: string;
    conditions?: any;
  };
  actions: any[];
  enabled: boolean;
  stats?: {
    triggered: number;
    actionsExecuted: number;
    successRate: number;
    lastTriggered: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export function AutomationsTabContent({ store }: AutomationsTabContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get view from URL params
  const viewParam = searchParams.get('view') as 'list' | 'create' | 'edit' | null;
  const automationIdParam = searchParams.get('automationId');
  const templateParam = searchParams.get('template');
  const [view, setView] = useState<'list' | 'create' | 'edit'>(viewParam || 'list');
  const [editingAutomationId, setEditingAutomationId] = useState<string | null>(automationIdParam);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(templateParam);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'automations');
    if (view !== 'list') {
      params.set('view', view);
      if (view === 'edit' && editingAutomationId) {
        params.set('automationId', editingAutomationId);
      }
      if (selectedTemplate) {
        params.set('template', selectedTemplate);
      }
    } else {
      params.delete('view');
      params.delete('automationId');
      params.delete('template');
    }
    
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `?${params.toString()}`);
    }
  }, [view, editingAutomationId, selectedTemplate, searchParams]);

  const handleSelectTemplate = (template: string) => {
    setSelectedTemplate(template);
    setView('create');
  };

  const handleEditAutomation = (automationId: string) => {
    setEditingAutomationId(automationId);
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setEditingAutomationId(null);
    setSelectedTemplate(null);
  };

  const handleSave = () => {
    setView('list');
    setEditingAutomationId(null);
    setSelectedTemplate(null);
    // Trigger a refresh of the automations list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="nuvi-tab-panel">
      {view === 'list' ? (
        <AutomationsListPanel 
          store={store}
          onSelectTemplate={handleSelectTemplate}
          onEditAutomation={handleEditAutomation}
          refreshKey={refreshKey}
        />
      ) : view === 'create' ? (
        <AutomationFormPanel 
          store={store}
          template={selectedTemplate}
          onSave={handleSave}
          onCancel={handleBack}
        />
      ) : (
        <AutomationFormPanel 
          store={store}
          automationId={editingAutomationId!}
          isEdit
          onSave={handleSave}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// Automations List Panel
function AutomationsListPanel({ store, onSelectTemplate, onEditAutomation, refreshKey }: {
  store: StoreData;
  onSelectTemplate: (template: string) => void;
  onEditAutomation: (id: string) => void;
  refreshKey?: number;
}) {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplates, setShowTemplates] = useState(true);

  // Fetch automations from API
  useEffect(() => {
    const fetchAutomations = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/stores/${store.subdomain}/marketing/automations`);
        if (response.ok) {
          const data = await response.json();
          setAutomations(data.automations || []);
          // If automations exist, hide templates
          if (data.automations && data.automations.length > 0) {
            setShowTemplates(false);
          }
        }
      } catch (error) {
        console.error('Error fetching automations:', error);
        setAutomations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAutomations();
  }, [store.subdomain, refreshKey]);

  const handleToggleAutomation = async (automation: Automation) => {
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/automations/${automation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: !automation.enabled
        }),
      });

      if (response.ok) {
        setAutomations(prev => prev.map(a => 
          a.id === automation.id ? { ...a, enabled: !a.enabled } : a
        ));
        toast.success(`Automation ${automation.enabled ? 'disabled' : 'enabled'} successfully`);
      } else {
        toast.error('Failed to update automation');
      }
    } catch (error) {
      console.error('Error updating automation:', error);
      toast.error('Failed to update automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/automations/${automationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAutomations(prev => prev.filter(a => a.id !== automationId));
        toast.success('Automation deleted successfully');
        // Show templates if no automations left
        if (automations.length === 1) {
          setShowTemplates(true);
        }
      } else {
        toast.error('Failed to delete automation');
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast.error('Failed to delete automation');
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'abandoned_cart':
        return <ShoppingCart className="h-4 w-4" />;
      case 'welcome_new_customer':
        return <Users className="h-4 w-4" />;
      case 'post_purchase':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (type: string) => {
    switch (type) {
      case 'abandoned_cart':
        return 'Abandoned Cart';
      case 'welcome_new_customer':
        return 'New Customer';
      case 'post_purchase':
        return 'Post Purchase';
      case 'win_back':
        return 'Win Back';
      case 'birthday':
        return 'Birthday';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (isLoading) {
    return (
      <div className="nuvi-text-center nuvi-py-xl">
        <div className="nuvi-btn-loading nuvi-mx-auto nuvi-mb-md" />
        <p className="nuvi-text-muted">Loading automations...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Marketing Automations</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Automate your marketing workflows</p>
        </div>
        <button 
          onClick={() => setShowTemplates(!showTemplates)}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Create Automation
        </button>
      </div>

      {/* Templates Section */}
      {showTemplates && (
        <div className="nuvi-mb-lg">
          <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-md">Choose a template to get started</h3>
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
            <div 
              className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
              onClick={() => onSelectTemplate('abandoned-cart')}
            >
              <ShoppingCart className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">Abandoned Cart Recovery</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Automatically send reminders to customers who left items in their cart
              </p>
              <p className="nuvi-text-xs nuvi-text-muted">
                <Clock className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                Triggers after 1 hour
              </p>
            </div>

            <div 
              className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
              onClick={() => onSelectTemplate('welcome-series')}
            >
              <Mail className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">Welcome Series</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Greet new subscribers with a series of welcome emails
              </p>
              <p className="nuvi-text-xs nuvi-text-muted">
                <Users className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                3 email sequence
              </p>
            </div>

            <div 
              className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
              onClick={() => onSelectTemplate('custom')}
            >
              <Zap className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
              <h4 className="nuvi-font-medium nuvi-mb-sm">Custom Workflow</h4>
              <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                Build your own automation from scratch
              </p>
              <p className="nuvi-text-xs nuvi-text-muted">
                <GitBranch className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                Unlimited steps
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Automations */}
      {automations.length > 0 && (
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">Active Automations</h3>
          </div>
          <div className="nuvi-card-content">
            <div className="nuvi-overflow-x-auto">
              <table className="nuvi-w-full">
                <thead>
                  <tr className="nuvi-border-b">
                    <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Automation</th>
                    <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Trigger</th>
                    <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Performance</th>
                    <th className="nuvi-text-left nuvi-py-md nuvi-px-md nuvi-font-medium">Status</th>
                    <th className="nuvi-text-right nuvi-py-md nuvi-px-md nuvi-font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {automations.map((automation) => (
                    <tr key={automation.id} className="nuvi-border-b">
                      <td className="nuvi-py-md nuvi-px-md">
                        <div>
                          <p className="nuvi-font-medium">{automation.name}</p>
                          {automation.description && (
                            <p className="nuvi-text-sm nuvi-text-muted">{automation.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="nuvi-py-md nuvi-px-md">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          {getTriggerIcon(automation.trigger.type)}
                          <span>{getTriggerLabel(automation.trigger.type)}</span>
                        </div>
                      </td>
                      <td className="nuvi-py-md nuvi-px-md">
                        <div className="nuvi-text-sm">
                          <p>{automation.stats?.triggered || 0} triggered</p>
                          <p className="nuvi-text-muted">
                            {automation.stats?.successRate || 0}% success rate
                          </p>
                        </div>
                      </td>
                      <td className="nuvi-py-md nuvi-px-md">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          {automation.enabled ? (
                            <>
                              <CheckCircle className="h-4 w-4 nuvi-text-success" />
                              <span className="nuvi-text-success">Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 nuvi-text-muted" />
                              <span className="nuvi-text-muted">Inactive</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="nuvi-py-md nuvi-px-md nuvi-text-right">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-justify-end">
                          <button 
                            onClick={() => handleToggleAutomation(automation)}
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                            title={automation.enabled ? 'Disable' : 'Enable'}
                          >
                            {automation.enabled ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </button>
                          <button 
                            onClick={() => onEditAutomation(automation.id)}
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAutomation(automation.id)}
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showTemplates && automations.length === 0 && (
        <div className="nuvi-text-center nuvi-py-xl">
          <Zap className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
          <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No automations yet</h3>
          <p className="nuvi-text-muted nuvi-mb-lg">Create your first automation to engage customers automatically</p>
          <button 
            onClick={() => setShowTemplates(true)}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Plus className="h-4 w-4" />
            Create Automation
          </button>
        </div>
      )}
    </>
  );
}