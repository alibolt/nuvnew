'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Check, Copy, Layout } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  templateType: string;
  isDefault: boolean;
  _count?: {
    sections: number;
  };
}

const templateTypeLabels: Record<string, string> = {
  homepage: 'Homepage',
  collection: 'Collection',
  product: 'Product',
  search: 'Search',
  account: 'Account',
  cart: 'Cart',
  page: 'Static Page',
};

interface TemplatesClientProps {
  subdomain: string;
}

export function TemplatesClient({ subdomain }: TemplatesClientProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<{ subdomain: string } | null>(null);

  useEffect(() => {
    loadTemplates();
    loadStore();
  }, [subdomain]);

  const loadStore = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}`);
      if (response.ok) {
        const storeData = await response.json();
        setStore(storeData);
      }
    } catch (error) {
      console.error('Error loading store:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/templates`);
      if (response.ok) {
        const data = await response.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success('Default template updated');
        loadTemplates();
      } else {
        toast.error('Failed to update default template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update default template');
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const response = await fetch(`/api/stores/${subdomain}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          type: template.templateType,
          themeId: 'commerce', // Default to commerce theme
          duplicateFromId: template.id,
        }),
      });

      if (response.ok) {
        toast.success('Template duplicated');
        loadTemplates();
      } else {
        toast.error('Failed to duplicate template');
      }
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast.error('Failed to duplicate template');
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${subdomain}/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Template deleted');
        loadTemplates();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  // Group templates by type
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.templateType]) {
      acc[template.templateType] = [];
    }
    acc[template.templateType].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-min-h-96">
        <div className="nuvi-animate-spin nuvi-rounded-full nuvi-h-12 nuvi-w-12 nuvi-border-b-2 nuvi-border-primary"></div>
      </div>
    );
  }

  return (
    <div className="nuvi-tab-panel">
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div>
          <h2 className="nuvi-text-2xl nuvi-font-bold">Page Templates</h2>
          <p className="nuvi-text-secondary nuvi-text-sm">Manage templates for different page types</p>
        </div>
        <Link href={`/dashboard/stores/${subdomain}/theme-studio`}>
          <button className="nuvi-btn nuvi-btn-primary">
            <Layout className="h-4 w-4" />
            Theme Studio
          </button>
        </Link>
      </div>

      <div className="nuvi-space-y-lg">
        {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
          <div key={type} className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">{templateTypeLabels[type] || type}</h3>
              <p className="nuvi-text-sm nuvi-text-secondary">
                Templates for {templateTypeLabels[type]?.toLowerCase() || type} pages
              </p>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-md">
                {typeTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg"
                  >
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <h4 className="nuvi-font-medium">{template.name}</h4>
                          {template.isDefault && (
                            <span className="nuvi-px-sm nuvi-py-xs nuvi-text-xs nuvi-bg-success nuvi-text-white nuvi-rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="nuvi-text-sm nuvi-text-secondary nuvi-mt-xs">
                          {template._count?.sections || 0} sections
                        </p>
                      </div>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      {!template.isDefault && (
                        <button
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                          onClick={() => handleSetDefault(template.id)}
                        >
                          <Check className="h-4 w-4" />
                          Set as Default
                        </button>
                      )}
                      <Link
                        href={`/dashboard/stores/${subdomain}/theme-studio?page=${type}&template=${template.id}`}
                      >
                        <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                      </Link>
                      <button
                        className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                        onClick={() => handleDuplicate(template)}
                      >
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </button>
                      {!template.isDefault && (
                        <button
                          className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {typeTemplates.length === 0 && (
                  <p className="nuvi-text-muted nuvi-text-center nuvi-py-xl">
                    No templates for this page type yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}