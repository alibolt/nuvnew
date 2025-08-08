'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Send, ArrowLeft, 
  Type, FileText, Eye, Loader2, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { CampaignsTabContent } from '../components/campaigns-tab-content';
import { EmailTemplatesList } from '../components/email-templates-list';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface MarketingContentProps {
  store: StoreData;
}


interface CampaignCreateFormProps {
  store: StoreData;
  onBack: () => void;
  onSuccess: () => void;
}

function CampaignCreateForm({ store, onBack, onSuccess }: CampaignCreateFormProps) {
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    fromName: store.name,
    fromEmail: '',
    replyTo: '',
    content: {
      html: '',
      text: ''
    },
    audience: {
      type: 'all' as 'all' | 'segment' | 'custom',
      segmentId: '',
      filters: [] as any[]
    },
    schedule: {
      type: 'immediate' as 'immediate' | 'scheduled',
      date: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  });

  // Fetch newsletter subscribers count
  const [subscribersCount, setSubscribersCount] = useState(0);
  useEffect(() => {
    fetch(`/api/stores/${store.subdomain}/newsletter/subscribers/count`)
      .then(res => res.json())
      .then(data => setSubscribersCount(data.count || 0))
      .catch(err => console.error('Error fetching subscribers:', err));
  }, [store.subdomain]);

  // Fetch email templates
  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`/api/stores/${store.subdomain}/email-templates?enabled=true`)
      .then(res => res.json())
      .then(data => {
        const activeTemplates = (data.templates || []).filter((t: any) => t.enabled && !t.id.startsWith('default_'));
        setTemplates(activeTemplates);
        setLoadingTemplates(false);
      })
      .catch(err => {
        console.error('Error fetching templates:', err);
        setLoadingTemplates(false);
      });
  }, [store.subdomain]);

  // Load template content when selected
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setCampaign(prev => ({
          ...prev,
          subject: template.subject || prev.subject,
          content: {
            html: template.htmlContent || '',
            text: template.textContent || ''
          }
        }));
      }
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Must select a template
    if (!selectedTemplateId) {
      toast.error('Please select an email template');
      return;
    }
    
    if (!campaign.name || !campaign.subject || !campaign.fromEmail) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!campaign.content.html) {
      toast.error('No email content found. Please select a template.');
      return;
    }

    setLoading(true);
    try {
      // Create campaign
      const res = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'email',
          ...campaign
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create campaign');
      }

      const data = await res.json();
      
      // If not test mode, send immediately (if schedule is immediate)
      if (!testMode && campaign.schedule.type === 'immediate') {
        await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${data.campaign.id}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      toast.success(testMode ? 'Test campaign created!' : 'Campaign created and sent!');
      onSuccess();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="nuvi-flex nuvi-items-center nuvi-mb-lg">
        <button
          onClick={onBack}
          className="nuvi-btn nuvi-btn-ghost nuvi-mr-md"
          disabled={loading}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h3 className="nuvi-text-xl nuvi-font-semibold">Create Email Campaign</h3>
          <p className="nuvi-text-sm nuvi-text-secondary">
            Send targeted emails to your subscribers ({subscribersCount} total)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="nuvi-space-y-lg">
        {/* Campaign Details */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h4 className="nuvi-card-title">Campaign Details</h4>
          </div>
          <div className="nuvi-card-content nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Campaign Name</label>
              <input
                type="text"
                className="nuvi-input"
                placeholder="e.g., Holiday Sale Announcement"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                required
              />
              <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                Internal name for your reference
              </p>
            </div>

            <div>
              <label className="nuvi-label">Subject Line</label>
              <div className="nuvi-relative">
                <Type className="nuvi-absolute nuvi-left-3 nuvi-top-3 h-4 w-4 nuvi-text-muted" />
                <input
                  type="text"
                  className="nuvi-input nuvi-pl-10"
                  placeholder="e.g., 🎉 Exclusive Holiday Sale - 30% Off Everything!"
                  value={campaign.subject}
                  onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
              <div>
                <label className="nuvi-label">From Name</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={campaign.fromName}
                  onChange={(e) => setCampaign({ ...campaign, fromName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="nuvi-label">From Email</label>
                <input
                  type="email"
                  className="nuvi-input"
                  placeholder="hello@yourstore.com"
                  value={campaign.fromEmail}
                  onChange={(e) => setCampaign({ ...campaign, fromEmail: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Template Selection */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <div className="flex items-center justify-between">
              <h4 className="nuvi-card-title">Email Template</h4>
              <button
                type="button"
                onClick={() => {
                  // Save current form data to localStorage before navigating
                  localStorage.setItem('draftCampaign', JSON.stringify(campaign));
                  // Navigate to templates
                  window.location.href = '/dashboard/stores/' + store.subdomain + '/marketing#templates';
                }}
                className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
              >
                <FileText className="h-4 w-4" />
                Manage Templates
              </button>
            </div>
          </div>
          <div className="nuvi-card-content">
            {/* Template Selection Only - No content editing */}
            <div>
              <label className="nuvi-label required">Select Email Template *</label>
              <p className="text-xs text-gray-500 mb-3">Choose a pre-designed template for your campaign</p>
              {loadingTemplates ? (
                <div className="text-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Loading templates...</p>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <FileText className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700">No templates available</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You need to create email templates before sending campaigns
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      // Save draft and navigate to templates
                      localStorage.setItem('draftCampaign', JSON.stringify(campaign));
                      window.location.href = '/dashboard/stores/' + store.subdomain + '/marketing#templates';
                    }}
                    className="mt-4 px-4 py-2 bg-[#8B9F7E] text-white rounded-lg hover:bg-[#7A8B6D] inline-flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Template
                  </button>
                </div>
                ) : (
                  <div className="space-y-2">
                    {templates.map((template) => (
                      <label
                        key={template.id}
                        className={`flex items-start p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplateId === template.id
                            ? 'border-[#8B9F7E] bg-[#8B9F7E]/5'
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="template"
                          value={template.id}
                          checked={selectedTemplateId === template.id}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="mt-1"
                        />
                        <div className="ml-3 flex-1">
                          <p className="font-medium">{template.name}</p>
                          <p className="text-sm text-gray-600">{template.type}</p>
                          {template.subject && (
                            <p className="text-xs text-gray-500 mt-1">
                              Subject: {template.subject}
                            </p>
                          )}
                        </div>
                        {selectedTemplateId === template.id && (
                          <Check className="h-5 w-5 text-[#8B9F7E] ml-auto" />
                        )}
                      </label>
                    ))}
                  </div>
                )}
                {selectedTemplateId && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>Note:</strong> The template content has been loaded. You can still modify the subject line above.
                    </p>
                  </div>
                )}
            </div>

            {/* Preview Button */}
            {selectedTemplateId && campaign.content.html && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const previewWindow = window.open('', '_blank', 'width=600,height=800');
                    if (previewWindow) {
                      previewWindow.document.write(campaign.content.html);
                      previewWindow.document.close();
                    }
                  }}
                  className="btn btn-secondary btn-sm inline-flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview Email
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Audience */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h4 className="nuvi-card-title">Audience</h4>
          </div>
          <div className="nuvi-card-content">
            <div className="nuvi-space-y-sm">
              <label className="nuvi-flex nuvi-items-center nuvi-cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  className="nuvi-radio"
                  checked={campaign.audience.type === 'all'}
                  onChange={() => setCampaign({
                    ...campaign,
                    audience: { ...campaign.audience, type: 'all' }
                  })}
                />
                <span className="nuvi-ml-sm">
                  <span className="nuvi-font-medium">All subscribers</span>
                  <span className="nuvi-text-sm nuvi-text-secondary nuvi-block">
                    Send to all {subscribersCount} active subscribers
                  </span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h4 className="nuvi-card-title">Schedule</h4>
          </div>
          <div className="nuvi-card-content">
            <div className="nuvi-space-y-sm">
              <label className="nuvi-flex nuvi-items-center nuvi-cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  className="nuvi-radio"
                  checked={campaign.schedule.type === 'immediate'}
                  onChange={() => setCampaign({
                    ...campaign,
                    schedule: { ...campaign.schedule, type: 'immediate' }
                  })}
                />
                <span className="nuvi-ml-sm">Send immediately</span>
              </label>
              <label className="nuvi-flex nuvi-items-center nuvi-cursor-pointer">
                <input
                  type="radio"
                  name="schedule"
                  className="nuvi-radio"
                  checked={campaign.schedule.type === 'scheduled'}
                  onChange={() => setCampaign({
                    ...campaign,
                    schedule: { ...campaign.schedule, type: 'scheduled' }
                  })}
                />
                <span className="nuvi-ml-sm">Schedule for later</span>
              </label>
            </div>

            {campaign.schedule.type === 'scheduled' && (
              <div className="nuvi-mt-md">
                <input
                  type="datetime-local"
                  className="nuvi-input"
                  value={campaign.schedule.date}
                  onChange={(e) => setCampaign({
                    ...campaign,
                    schedule: { ...campaign.schedule, date: e.target.value }
                  })}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
          <label className="nuvi-flex nuvi-items-center">
            <input
              type="checkbox"
              className="nuvi-checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
            />
            <span className="nuvi-ml-sm">Send as test (won't send to subscribers)</span>
          </label>
          
          <div className="nuvi-flex nuvi-gap-sm">
            <button
              type="button"
              className="nuvi-btn nuvi-btn-secondary"
              onClick={onBack}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nuvi-btn nuvi-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="nuvi-animate-spin nuvi-rounded-full nuvi-h-4 nuvi-w-4 nuvi-border-2 nuvi-border-white nuvi-border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {testMode ? 'Create Test' : 'Create & Send'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Email Templates Wrapper Component
function EmailTemplatesWrapper({ store }: { store: StoreData }) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [store.subdomain]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
        credentials: 'same-origin'
      });
      const data = await res.json();
      
      // Get existing templates
      const existingTemplates = data.templates || [];
      
      // Add default templates that haven't been created yet
      const templateTypes = {
        order_confirmation: { label: 'Order Confirmation', category: 'transactional' },
        order_shipped: { label: 'Order Shipped', category: 'transactional' },
        order_delivered: { label: 'Order Delivered', category: 'transactional' },
        order_cancelled: { label: 'Order Cancelled', category: 'transactional' },
        order_refunded: { label: 'Order Refunded', category: 'transactional' },
        welcome_email: { label: 'Welcome Email', category: 'customer' },
        password_reset: { label: 'Password Reset', category: 'customer' },
        account_created: { label: 'Account Created', category: 'customer' },
        newsletter_welcome: { label: 'Newsletter Welcome', category: 'marketing' },
        abandoned_cart: { label: 'Abandoned Cart', category: 'marketing' },
        back_in_stock: { label: 'Back in Stock', category: 'marketing' },
        low_stock_alert: { label: 'Low Stock Alert', category: 'admin' },
        new_order_notification: { label: 'New Order (Admin)', category: 'admin' },
      };
      
      const existingTypes = new Set(existingTemplates.map((t: any) => t.type));
      
      // Add missing default templates as inactive
      Object.entries(templateTypes).forEach(([type, info]) => {
        if (!existingTypes.has(type)) {
          existingTemplates.push({
            id: `default_${type}`,
            type,
            name: info.label,
            subject: `Default ${info.label} Subject`,
            htmlContent: '',
            enabled: false,
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      setTemplates(existingTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-justify-center nuvi-py-xl">
        <Loader2 className="h-6 w-6 nuvi-animate-spin nuvi-text-primary" />
      </div>
    );
  }

  return <EmailTemplatesList templates={templates} store={store} />;
}

export function MarketingContent({ store }: MarketingContentProps) {

  return (
    <div>
      <CampaignsTabContent store={store} />
    </div>
  );
}