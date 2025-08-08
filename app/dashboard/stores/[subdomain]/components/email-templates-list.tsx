'use client';

import { useState, useMemo } from 'react';
import { ResourceList } from '@/components/ui/resource-list';
import { 
  Plus, Edit, Trash2, Mail, Eye, Send, 
  Check, X, Copy, FileText, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { EmailTemplateBuilder } from '@/components/dashboard/email-editor/EmailTemplateBuilder';

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  enabled: boolean;
  variables?: string[];
  blocks?: string;
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

export function EmailTemplatesList({ 
  templates: initialTemplates, 
  store 
}: { 
  templates: EmailTemplate[];
  store: StoreData;
}) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
  const [sortValue, setSortValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [view, setView] = useState<'list' | 'edit'>('list');
  const [activeView, setActiveView] = useState('all');

  // Get unique categories for filters
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    Object.values(templateTypes).forEach(type => {
      uniqueCategories.add(type.category);
    });
    return Array.from(uniqueCategories).map(cat => ({ 
      label: cat.charAt(0).toUpperCase() + cat.slice(1), 
      value: cat 
    }));
  }, []);

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // View filter
    if (activeView === 'active') {
      filtered = filtered.filter(t => t.enabled);
    } else if (activeView === 'inactive') {
      filtered = filtered.filter(t => !t.enabled);
    }

    // Search filter
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(template => {
        const matchesName = template.name.toLowerCase().includes(searchTerm);
        const matchesSubject = template.subject?.toLowerCase().includes(searchTerm);
        const matchesType = template.type.toLowerCase().includes(searchTerm);
        return matchesName || matchesSubject || matchesType;
      });
    }

    // Category filter
    if (appliedFilters.category) {
      filtered = filtered.filter(template => {
        const templateInfo = templateTypes[template.type as keyof typeof templateTypes];
        return templateInfo?.category === appliedFilters.category;
      });
    }

    // Sorting
    if (sortValue) {
      const [column, direction] = sortValue.split('_');
      filtered = [...filtered].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (column) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'status':
            aValue = a.enabled ? 1 : 0;
            bValue = b.enabled ? 1 : 0;
            break;
          case 'date':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          default:
            return 0;
        }

        if (direction === 'ascending') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [templates, searchValue, appliedFilters, sortValue, activeView]);

  // View counts for tabs
  const viewCounts = useMemo(() => {
    const active = templates.filter(t => t.enabled).length;
    const inactive = templates.filter(t => !t.enabled).length;
    return { all: templates.length, active, inactive };
  }, [templates]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    setDeletingIds(prev => new Set(prev).add(id));
    
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/email-templates?id=${id}`, {
        method: 'DELETE',
        credentials: 'same-origin'
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        toast.success('Template deleted successfully');
      } else {
        toast.error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('An error occurred');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} templates?`)) return;

    try {
      for (const id of selectedIds) {
        await handleDelete(id);
      }
      setSelectedItems([]);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Some templates could not be deleted');
    }
  };

  const handleBulkStatusChange = async (selectedIds: string[], status: boolean) => {
    try {
      for (const id of selectedIds) {
        const template = templates.find(t => t.id === id);
        if (!template) continue;

        const response = await fetch(`/api/stores/${store.subdomain}/email-templates`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id, 
            enabled: status 
          }),
        });

        if (response.ok) {
          setTemplates(prev => prev.map(t => 
            t.id === id ? { ...t, enabled: status } : t
          ));
        }
      }
      toast.success(`${selectedIds.length} templates updated`);
      setSelectedItems([]);
    } catch (error) {
      console.error('Error updating templates:', error);
      toast.error('Some templates could not be updated');
    }
  };

  const handleSendTest = async (template: EmailTemplate) => {
    const email = prompt('Enter email address to send test:');
    if (!email) return;

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          template: {
            subject: template.subject,
            htmlContent: template.htmlContent
          }
        })
      });

      if (response.ok) {
        toast.success('Test email sent successfully');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('An error occurred');
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setView('edit');
  };

  const handleCreate = () => {
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
  };

  // If in edit mode, show the editor
  if (view === 'edit' && selectedTemplate) {
    return (
      <EmailTemplateBuilder
        template={selectedTemplate}
        store={store}
        onSave={async (htmlContent: string, blocks?: any[]) => {
          // Save logic here
          toast.success('Template saved successfully');
          setView('list');
          // Refresh templates
          window.location.reload();
        }}
        onBack={() => {
          setView('list');
          setSelectedTemplate(null);
        }}
      />
    );
  }

  // Render template row
  const renderTemplateRow = (template: EmailTemplate, index: number) => {
    const templateInfo = templateTypes[template.type as keyof typeof templateTypes];
    const isDeleting = deletingIds.has(template.id);

    return (
      <>
        <td className="nuvi-p-3">
          <div>
            <p className="nuvi-font-medium">{template.name}</p>
            <p className="nuvi-text-sm nuvi-text-secondary">{template.subject || 'No subject'}</p>
          </div>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-badge nuvi-badge-secondary nuvi-capitalize">
            {templateInfo?.category || 'custom'}
          </span>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-capitalize">{template.type.replace(/_/g, ' ')}</span>
        </td>
        <td className="nuvi-p-3">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-2">
            {template.enabled ? (
              <>
                <span className="nuvi-inline-block nuvi-w-2 nuvi-h-2 nuvi-bg-success nuvi-rounded-full"></span>
                <span className="nuvi-text-sm">Active</span>
              </>
            ) : (
              <>
                <span className="nuvi-inline-block nuvi-w-2 nuvi-h-2 nuvi-bg-muted nuvi-rounded-full"></span>
                <span className="nuvi-text-sm nuvi-text-secondary">Inactive</span>
              </>
            )}
          </div>
        </td>
        <td className="nuvi-p-3">
          <span className="nuvi-text-sm nuvi-text-secondary">
            {new Date(template.updatedAt).toLocaleDateString()}
          </span>
        </td>
        <td className="nuvi-p-3">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-end nuvi-gap-1">
            <button
              onClick={() => handleEdit(template)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              title="Edit"
            >
              <Edit className="nuvi-h-4 nuvi-w-4" />
            </button>
            <button
              onClick={() => handleSendTest(template)}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
              title="Send test"
            >
              <Send className="nuvi-h-4 nuvi-w-4" />
            </button>
            <button
              onClick={() => handleDelete(template.id)}
              disabled={isDeleting}
              className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error"
              title="Delete"
            >
              <Trash2 className="nuvi-h-4 nuvi-w-4" />
            </button>
          </div>
        </td>
      </>
    );
  };

  return (
    <ResourceList
      resourceName={{ singular: 'template', plural: 'Templates' }}
      items={filteredTemplates}
      totalCount={templates.length}
      columns={[
        { id: 'name', title: 'Template', width: '30%' },
        { id: 'category', title: 'Category', width: '15%' },
        { id: 'type', title: 'Type', width: '20%' },
        { id: 'status', title: 'Status', width: '15%' },
        { id: 'updated', title: 'Last Updated', width: '15%' },
        { id: 'actions', title: '', width: '15%', align: 'end' },
      ]}
      renderItem={renderTemplateRow}
      
      // Selection
      selectable={true}
      selectedItems={selectedItems}
      onSelectionChange={setSelectedItems}
      
      // Primary action
      primaryAction={{
        content: 'Create template',
        icon: Plus,
        onAction: handleCreate,
      }}
      
      // Bulk actions
      bulkActions={[
        {
          id: 'activate',
          content: 'Activate',
          icon: Check,
          onAction: (ids) => handleBulkStatusChange(ids, true),
        },
        {
          id: 'deactivate',
          content: 'Deactivate',
          icon: X,
          onAction: (ids) => handleBulkStatusChange(ids, false),
        },
        {
          id: 'delete',
          content: 'Delete',
          icon: Trash2,
          destructive: true,
          onAction: handleBulkDelete,
        },
      ]}
      
      // Filters
      filters={[
        {
          id: 'category',
          label: 'Category',
          type: 'select',
          options: [{ label: 'All categories', value: '' }, ...categories],
        },
      ]}
      appliedFilters={appliedFilters}
      onFiltersChange={setAppliedFilters}
      onFiltersReset={() => setAppliedFilters({})}
      
      // Sorting
      sortOptions={[
        { label: 'Name (A-Z)', value: 'name_ascending' },
        { label: 'Name (Z-A)', value: 'name_descending' },
        { label: 'Type', value: 'type_ascending' },
        { label: 'Newest first', value: 'date_descending' },
        { label: 'Oldest first', value: 'date_ascending' },
      ]}
      sortValue={sortValue}
      onSortChange={setSortValue}
      
      // Views
      views={[
        { id: 'all', title: 'All', count: viewCounts.all },
        { id: 'active', title: 'Active', count: viewCounts.active },
        { id: 'inactive', title: 'Inactive', count: viewCounts.inactive },
      ]}
      activeView={activeView}
      onViewChange={setActiveView}
      
      // Search
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search templates by name, subject, or type"
      
      // Empty state
      emptyState={{
        heading: 'No email templates yet',
        content: 'Create your first email template to start sending beautiful emails to your customers.',
        action: {
          content: 'Create template',
          onAction: handleCreate,
        },
      }}
    />
  );
}