'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, FileText, Plus, Edit2, Eye, Trash2, 
  Search, Filter, Check, X, Save, ArrowLeft,
  Copy, Send, AlertCircle, Loader2, Code,
  Type, Image, Link, List, AlignLeft, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { SimpleEditor } from '@/components/dashboard/simple-editor';
import { EmailTemplateBuilder } from '@/components/dashboard/email-editor/EmailTemplateBuilder';

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

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  enabled: boolean;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

const templateTypes = {
  // Transactional emails
  order_confirmation: { label: 'Order Confirmation', category: 'transactional' },
  order_shipped: { label: 'Order Shipped', category: 'transactional' },
  order_delivered: { label: 'Order Delivered', category: 'transactional' },
  order_cancelled: { label: 'Order Cancelled', category: 'transactional' },
  order_refunded: { label: 'Order Refunded', category: 'transactional' },
  
  // Customer emails
  welcome_email: { label: 'Welcome Email', category: 'customer' },
  password_reset: { label: 'Password Reset', category: 'customer' },
  account_created: { label: 'Account Created', category: 'customer' },
  
  // Marketing emails
  newsletter_welcome: { label: 'Newsletter Welcome', category: 'marketing' },
  abandoned_cart: { label: 'Abandoned Cart', category: 'marketing' },
  back_in_stock: { label: 'Back in Stock', category: 'marketing' },
  
  // Admin emails
  low_stock_alert: { label: 'Low Stock Alert', category: 'admin' },
  new_order_notification: { label: 'New Order (Admin)', category: 'admin' },
  
  // Custom
  custom: { label: 'Custom Template', category: 'custom' }
};

const templateVariables = {
  customer: ['{{customer_name}}', '{{customer_email}}', '{{customer_phone}}'],
  order: ['{{order_number}}', '{{order_date}}', '{{order_total}}', '{{order_status}}'],
  shipping: ['{{shipping_address}}', '{{tracking_number}}', '{{carrier}}', '{{expected_delivery}}'],
  store: ['{{store_name}}', '{{store_url}}', '{{store_email}}', '{{store_phone}}'],
  product: ['{{product_name}}', '{{product_price}}', '{{product_url}}', '{{product_image}}'],
  other: ['{{unsubscribe_url}}', '{{current_year}}', '{{current_date}}']
};

interface EmailTemplatesTabContentProps {
  store: StoreData;
}

export function EmailTemplatesTabContent({ store }: EmailTemplatesTabContentProps) {
  const [view, setView] = useState<'list' | 'edit' | 'create'>('list');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, [store.subdomain]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
        credentials: 'same-origin'
      });
      const data = await res.json();
      
      // Get existing template types
      const existingTypes = new Set((data.templates || []).map((t: any) => t.type));
      
      // Only show default templates that haven't been created yet
      const defaultTemplatesList = Object.entries(templateTypes)
        .filter(([type]) => type !== 'custom' && !existingTypes.has(type))
        .map(([type, info]) => ({
          id: `default_${type}`,
          type,
          name: info.label,
          subject: `Default ${info.label} Subject`,
          htmlContent: '',
          enabled: false,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
      
      setTemplates([...defaultTemplatesList, ...(data.templates || [])]);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setView('edit');
  };

  const handleCreate = async (type: string) => {
    try {
      console.log('Creating template with type:', type);
      const res = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ fromTemplate: type })
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
        }
        
        console.error('Template creation error:', errorData);
        if (errorData.details) {
          console.error('Validation details:', errorData.details);
          // Extract validation errors if they exist
          const validationErrors = [];
          if (errorData.details._errors) {
            validationErrors.push(...errorData.details._errors);
          }
          Object.keys(errorData.details).forEach(key => {
            if (key !== '_errors' && errorData.details[key]?._errors) {
              validationErrors.push(`${key}: ${errorData.details[key]._errors.join(', ')}`);
            }
          });
          if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join('; ')}`);
          }
        }
        throw new Error(errorData.error || `Failed to create template (${res.status})`);
      }
      
      const data = await res.json();
      toast.success('Template created successfully');
      fetchTemplates();
      handleEdit(data.template);
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast.error(error.message || 'Failed to create template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || 
                           templateTypes[template.type as keyof typeof templateTypes]?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (view === 'edit' && selectedTemplate) {
    return (
      <EmailTemplateEditor
        store={store}
        template={selectedTemplate}
        templates={templates}
        onBack={() => {
          setView('list');
          setSelectedTemplate(null);
          fetchTemplates();
        }}
      />
    );
  }

  return (
    <div className="nuvi-space-y-lg">
      {/* Header */}
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold nuvi-text-gray-900">Email Templates</h2>
          <p className="nuvi-text-sm nuvi-text-gray-600 nuvi-mt-1">
            Manage email templates for transactional and marketing emails
          </p>
        </div>
        <button
          onClick={() => {
            // Create a new custom template directly
            const newTemplate: EmailTemplate = {
              id: `template_${Date.now()}`,
              type: 'custom',
              name: 'New Email Template',
              subject: 'Your Subject Line Here',
              htmlContent: '<h1>Welcome!</h1><p>Start designing your email template.</p>',
              textContent: '',
              enabled: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setSelectedTemplate(newTemplate);
            setView('edit');
          }}
          className="nuvi-btn nuvi-btn-primary"
        >
          <Plus className="h-4 w-4 nuvi-mr-2" />
          Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="nuvi-card nuvi-p-4">
        <div className="nuvi-flex nuvi-flex-col nuvi-sm:flex-row nuvi-gap-3">
          <div className="nuvi-flex-1">
            <div className="nuvi-relative">
              <Search className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 nuvi-h-4 nuvi-w-4 nuvi-text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or subject..."
                className="nuvi-w-full nuvi-pl-10 nuvi-pr-4 nuvi-py-2 nuvi-border nuvi-border-gray-300 nuvi-rounded-lg nuvi-text-sm focus:nuvi-outline-none focus:nuvi-ring-2 focus:nuvi-ring-primary focus:nuvi-border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="nuvi-flex nuvi-gap-2">
            <div className="nuvi-relative">
              <Filter className="nuvi-absolute nuvi-left-3 nuvi-top-1/2 -nuvi-translate-y-1/2 nuvi-h-4 nuvi-w-4 nuvi-text-gray-500 nuvi-pointer-events-none" />
              <select
                className="nuvi-pl-10 nuvi-pr-8 nuvi-py-2 nuvi-border nuvi-border-gray-300 nuvi-rounded-lg nuvi-text-sm nuvi-bg-white focus:nuvi-outline-none focus:nuvi-ring-2 focus:nuvi-ring-primary focus:nuvi-border-transparent nuvi-appearance-none nuvi-cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="transactional">Transactional</option>
                <option value="customer">Customer</option>
                <option value="marketing">Marketing</option>
                <option value="admin">Admin</option>
                <option value="custom">Custom</option>
              </select>
              <ChevronDown className="nuvi-absolute nuvi-right-3 nuvi-top-1/2 -nuvi-translate-y-1/2 nuvi-h-4 nuvi-w-4 nuvi-text-gray-500 nuvi-pointer-events-none" />
            </div>
            
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="nuvi-px-3 nuvi-py-2 nuvi-text-sm nuvi-text-gray-600 hover:nuvi-text-gray-900 nuvi-border nuvi-border-gray-300 nuvi-rounded-lg hover:nuvi-bg-gray-50 nuvi-transition-colors"
              >
                <X className="nuvi-h-4 nuvi-w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Active filters display */}
        {(searchQuery || categoryFilter !== 'all') && (
          <div className="nuvi-mt-3 nuvi-flex nuvi-items-center nuvi-gap-2 nuvi-text-sm">
            <span className="nuvi-text-gray-500">Active filters:</span>
            {searchQuery && (
              <span className="nuvi-inline-flex nuvi-items-center nuvi-gap-1 nuvi-px-2 nuvi-py-1 nuvi-bg-primary/10 nuvi-text-primary nuvi-rounded-md">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:nuvi-text-primary-dark"
                >
                  <X className="nuvi-h-3 nuvi-w-3" />
                </button>
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="nuvi-inline-flex nuvi-items-center nuvi-gap-1 nuvi-px-2 nuvi-py-1 nuvi-bg-primary/10 nuvi-text-primary nuvi-rounded-md">
                Type: {categoryFilter}
                <button
                  onClick={() => setCategoryFilter('all')}
                  className="hover:nuvi-text-primary-dark"
                >
                  <X className="nuvi-h-3 nuvi-w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Templates Table */}
      {loading ? (
        <div className="nuvi-flex nuvi-justify-center nuvi-py-xl">
          <Loader2 className="h-6 w-6 nuvi-animate-spin nuvi-text-primary" />
        </div>
      ) : (
        <div className="nuvi-card">
          <div className="nuvi-table-container">
            <table className="nuvi-table">
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="nuvi-text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="nuvi-text-center nuvi-py-lg">
                      <div className="nuvi-text-muted">
                        <Mail className="h-12 w-12 nuvi-mx-auto nuvi-mb-md nuvi-text-gray-300" />
                        <p className="nuvi-text-lg nuvi-font-medium">No templates found</p>
                        <p className="nuvi-text-sm">Create your first email template to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((template) => {
                    const templateInfo = templateTypes[template.type as keyof typeof templateTypes];
                    const isDefault = template.id.startsWith('default_');
                    
                    return (
                      <tr key={template.id} className="nuvi-hover:bg-gray-50">
                        <td>
                          <div>
                            <p className="nuvi-font-medium">{template.name}</p>
                            {isDefault && (
                              <p className="nuvi-text-xs nuvi-text-muted">Default template</p>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="nuvi-badge nuvi-badge-secondary nuvi-capitalize">
                            {templateInfo?.category || 'custom'}
                          </span>
                        </td>
                        <td>
                          <span className="nuvi-text-sm nuvi-text-secondary">
                            {template.subject || 'No subject set'}
                          </span>
                        </td>
                        <td>
                          {template.enabled ? (
                            <span className="nuvi-badge nuvi-badge-success">
                              <Check className="h-3 w-3" />
                              Active
                            </span>
                          ) : (
                            <span className="nuvi-badge nuvi-badge-secondary">
                              <X className="h-3 w-3" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="nuvi-text-sm nuvi-text-muted">
                            {new Date(template.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="nuvi-flex nuvi-justify-end nuvi-gap-xs">
                            {isDefault ? (
                              <button
                                onClick={() => handleCreate(template.type)}
                                className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                              >
                                <Plus className="h-4 w-4" />
                                Activate
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEdit(template)}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                                  title="Edit template"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTemplate(template);
                                    setShowPreview(true);
                                  }}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                                  title="Preview template"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    // Send test email
                                    const email = prompt('Enter email address to send test:');
                                    if (email) {
                                      fetch(`/api/stores/${store.subdomain}/email/test`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                          email,
                                          template: {
                                            subject: template.subject,
                                            htmlContent: template.htmlContent
                                          }
                                        })
                                      }).then(res => {
                                        if (res.ok) {
                                          toast.success('Test email sent successfully');
                                        } else {
                                          toast.error('Failed to send test email');
                                        }
                                      });
                                    }
                                  }}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                                  title="Send test email"
                                >
                                  <Send className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm('Are you sure you want to delete this template?')) {
                                      try {
                                        const res = await fetch(`/api/stores/${store.subdomain}/email-templates?id=${template.id}`, {
                                          method: 'DELETE',
                                          credentials: 'same-origin'
                                        });
                                        if (res.ok) {
                                          toast.success('Template deleted successfully');
                                          fetchTemplates();
                                        } else {
                                          toast.error('Failed to delete template');
                                        }
                                      } catch (error) {
                                        toast.error('Failed to delete template');
                                      }
                                    }
                                  }}
                                  className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600 hover:nuvi-bg-red-50"
                                  title="Delete template"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <EmailPreviewModal
          template={selectedTemplate}
          store={store}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </div>
  );
}

// Email Template Editor Component
interface EmailTemplateEditorProps {
  store: StoreData;
  template: EmailTemplate;
  templates: EmailTemplate[];
  onBack: () => void;
}

function EmailTemplateEditor({ store, template, templates, onBack }: EmailTemplateEditorProps) {
  const [formData, setFormData] = useState({
    name: template.name,
    subject: template.subject,
    htmlContent: template.htmlContent,
    textContent: template.textContent || '',
    enabled: template.enabled,
    blocks: template.blocks || null // Include blocks field
  });
  const [saving, setSaving] = useState(false);
  const [showVariables, setShowVariables] = useState(true);
  const [activeTab, setActiveTab] = useState<'visual' | 'html' | 'text'>('visual');
  const [useAdvancedBuilder, setUseAdvancedBuilder] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if this is a new template (not yet saved)
      const isNewTemplate = template.id.startsWith('template_') && !templates.find(t => t.id === template.id);
      
      const res = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
        method: isNewTemplate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isNewTemplate ? undefined : template.id,
          ...formData,
          type: template.type || 'custom',
          blocks: formData.blocks // Ensure blocks are included
        })
      });

      if (!res.ok) throw new Error('Failed to save template');
      
      toast.success('Template saved successfully');
      
      // Update email settings with template status
      await fetch(`/api/stores/${store.subdomain}/email/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notifications: {
            [template.type]: formData.enabled
          }
        })
      });
      
      onBack();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  const insertVariable = (variable: string) => {
    if (activeTab === 'visual' || activeTab === 'html') {
      // Insert at end of HTML content
      setFormData({ ...formData, htmlContent: formData.htmlContent + variable });
    } else if (activeTab === 'text') {
      setFormData({ ...formData, textContent: formData.textContent + variable });
    }
  };

  const sendTestEmail = async () => {
    const email = prompt('Enter email address to send test:');
    if (!email) return;

    try {
      const res = await fetch(`/api/stores/${store.subdomain}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          template: {
            subject: formData.subject,
            htmlContent: formData.htmlContent
          }
        })
      });

      if (!res.ok) throw new Error('Failed to send test email');
      
      toast.success('Test email sent successfully');
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  const handleBuilderSave = async (htmlContent: string, blocks?: any[]) => {
    // Save both HTML content and blocks structure
    const updatedFormData = { 
      ...formData, 
      htmlContent,
      blocks: blocks ? JSON.stringify(blocks) : undefined
    };
    setFormData(updatedFormData);
    
    // Check if this is a new template (not yet saved)
    const isNewTemplate = template.id.startsWith('template_') && !templates.find(t => t.id === template.id);
    
    // Save to API with blocks included
    setSaving(true);
    try {
      const res = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
        method: isNewTemplate ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: isNewTemplate ? undefined : template.id,
          ...updatedFormData,
          type: template.type || 'custom'
        })
      });

      if (!res.ok) throw new Error('Failed to save template');
      
      toast.success('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  // If using advanced builder, render it instead
  if (useAdvancedBuilder) {
    // Debug: log what blocks we're passing
    console.log('Template blocks:', template.blocks);
    console.log('FormData blocks:', formData.blocks);
    
    return (
      <EmailTemplateBuilder
        template={{ 
          ...template, 
          ...formData,
          blocks: formData.blocks || template.blocks || null
        }}
        store={store}
        onSave={handleBuilderSave}
        onBack={onBack}
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={onBack}
            className="nuvi-btn nuvi-btn-ghost"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div>
            <h3 className="nuvi-text-xl nuvi-font-semibold">Edit Email Template</h3>
            <p className="nuvi-text-sm nuvi-text-secondary">{template.type}</p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            onClick={() => setUseAdvancedBuilder(!useAdvancedBuilder)}
            className="nuvi-btn nuvi-btn-secondary"
          >
            {useAdvancedBuilder ? 'Simple Editor' : 'Advanced Builder'}
          </button>
          <button
            onClick={sendTestEmail}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <Send className="h-4 w-4" />
            Send Test
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="nuvi-btn nuvi-btn-primary"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 nuvi-animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Template
          </button>
        </div>
      </div>

      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Editor */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-md">
          {/* Basic Info */}
          <div className="nuvi-card">
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Template Name</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="nuvi-label">Subject Line</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Use variables like {{customer_name}} in subject"
                />
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="nuvi-checkbox"
                />
                <label htmlFor="enabled" className="nuvi-text-sm">
                  Enable this template
                </label>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <div className="nuvi-flex nuvi-gap-sm">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`nuvi-btn nuvi-btn-sm ${activeTab === 'visual' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
                >
                  <Type className="h-4 w-4" />
                  Visual
                </button>
                <button
                  onClick={() => setActiveTab('html')}
                  className={`nuvi-btn nuvi-btn-sm ${activeTab === 'html' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
                >
                  <Code className="h-4 w-4" />
                  HTML
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`nuvi-btn nuvi-btn-sm ${activeTab === 'text' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
                >
                  <AlignLeft className="h-4 w-4" />
                  Text
                </button>
              </div>
            </div>
            <div className="nuvi-card-content">
              {activeTab === 'visual' && (
                <div className="nuvi-min-h-[400px]">
                  <SimpleEditor
                    value={formData.htmlContent}
                    onChange={(value) => setFormData({ ...formData, htmlContent: value })}
                    placeholder="Start typing your email content..."
                  />
                </div>
              )}
              {activeTab === 'html' && (
                <textarea
                  className="nuvi-textarea nuvi-font-mono nuvi-text-sm"
                  rows={20}
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  placeholder="Enter HTML content..."
                />
              )}
              {activeTab === 'text' && (
                <textarea
                  className="nuvi-textarea"
                  rows={20}
                  value={formData.textContent}
                  onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                  placeholder="Enter plain text version..."
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Variables */}
        <div className="nuvi-space-y-md">
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h4 className="nuvi-card-title">Template Variables</h4>
              <p className="nuvi-text-sm nuvi-text-muted">
                Click to insert into template
              </p>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-md">
                {Object.entries(templateVariables).map(([category, variables]) => (
                  <div key={category}>
                    <h5 className="nuvi-font-medium nuvi-capitalize nuvi-mb-sm">{category}</h5>
                    <div className="nuvi-space-y-xs">
                      {variables.map((variable) => (
                        <button
                          key={variable}
                          onClick={() => insertVariable(variable)}
                          className="nuvi-block nuvi-w-full nuvi-text-left nuvi-px-sm nuvi-py-xs nuvi-rounded nuvi-hover:bg-gray-100 nuvi-transition-colors"
                        >
                          <code className="nuvi-text-xs nuvi-text-primary">{variable}</code>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="nuvi-card nuvi-border-blue-200 nuvi-bg-blue-50">
            <div className="nuvi-card-content">
              <div className="nuvi-flex nuvi-gap-sm">
                <AlertCircle className="h-4 w-4 nuvi-text-blue-600 nuvi-flex-shrink-0 nuvi-mt-xs" />
                <div className="nuvi-text-sm nuvi-text-blue-800">
                  <p className="nuvi-font-medium nuvi-mb-xs">Tips:</p>
                  <ul className="nuvi-space-y-xs nuvi-text-xs">
                    <li>• Use variables to personalize emails</li>
                    <li>• Test your template before enabling</li>
                    <li>• Keep subject lines under 50 characters</li>
                    <li>• Include both HTML and text versions</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Email Preview Modal
interface EmailPreviewModalProps {
  template: EmailTemplate;
  store: StoreData;
  onClose: () => void;
}

function EmailPreviewModal({ template, store, onClose }: EmailPreviewModalProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="nuvi-fixed nuvi-inset-0 nuvi-z-50 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-p-md">
      <div className="nuvi-absolute nuvi-inset-0 nuvi-bg-black nuvi-bg-opacity-50" onClick={onClose} />
      <div className="nuvi-relative nuvi-bg-white nuvi-rounded-lg nuvi-shadow-xl nuvi-w-full nuvi-max-w-4xl nuvi-max-h-[90vh] nuvi-overflow-hidden">
        {/* Header */}
        <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border-b">
          <div>
            <h3 className="nuvi-font-semibold">{template.name} - Preview</h3>
            <p className="nuvi-text-sm nuvi-text-muted">{template.subject}</p>
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
            <button
              onClick={() => setDevice('desktop')}
              className={`nuvi-btn nuvi-btn-sm ${device === 'desktop' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`nuvi-btn nuvi-btn-sm ${device === 'mobile' ? 'nuvi-btn-primary' : 'nuvi-btn-ghost'}`}
            >
              Mobile
            </button>
            <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="nuvi-p-md nuvi-bg-gray-100 nuvi-overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
          <div 
            className={`nuvi-bg-white nuvi-shadow-lg nuvi-mx-auto ${
              device === 'mobile' ? 'nuvi-max-w-sm' : 'nuvi-max-w-2xl'
            }`}
          >
            <div 
              dangerouslySetInnerHTML={{ __html: template.htmlContent }} 
              className="nuvi-p-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}