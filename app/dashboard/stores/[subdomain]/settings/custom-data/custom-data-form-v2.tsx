'use client';

import { useState, useEffect } from 'react';
import type { Store, MetafieldDefinition, Metafield } from '@prisma/client';
import { Database, Plus, Edit2, Trash2, Code, AlertCircle, Tag, Calendar, Hash, Type, Loader2 } from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CustomField extends MetafieldDefinition {}

interface ExtendedMetafield extends Metafield {
  definition?: MetafieldDefinition | null;
}

interface StoreWithMetafields extends Store {
  metafieldDefinitions?: MetafieldDefinition[];
  metafields?: ExtendedMetafield[];
}

export function CustomDataFormV2({ store }: { store: StoreWithMetafields }) {
  const router = useRouter();
  const [showAddField, setShowAddField] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'definitions' | 'data'>('definitions');
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>(store.metafieldDefinitions || []);
  const [recentMetafields, setRecentMetafields] = useState<ExtendedMetafield[]>(store.metafields || []);
  
  // Form state for new definition
  const [newDefinition, setNewDefinition] = useState({
    name: '',
    namespace: '',
    key: '',
    type: 'text' as 'text' | 'number' | 'date' | 'boolean' | 'json',
    description: '',
    appliesTo: 'products' as 'products' | 'customers' | 'orders' | 'collections'
  });

  const typeIcons = {
    text: <Type className="h-4 w-4" />,
    number: <Hash className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    boolean: <Tag className="h-4 w-4" />,
    json: <Code className="h-4 w-4" />
  };

  // Load latest data
  const loadData = async () => {
    try {
      // Load definitions
      const defResponse = await fetch(`/api/stores/${store.subdomain}/metafields/definitions`);
      if (defResponse.ok) {
        const defData = await defResponse.json();
        setCustomFields(defData.definitions || []);
      }

      // Load recent metafields
      const metaResponse = await fetch(`/api/stores/${store.subdomain}/metafields?limit=10`);
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        setRecentMetafields(metaData.metafields || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Create new definition
  const handleCreateDefinition = async () => {
    if (!newDefinition.name || !newDefinition.namespace || !newDefinition.key) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/metafields/definitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDefinition)
      });

      if (response.ok) {
        const data = await response.json();
        setCustomFields([data.definition, ...customFields]);
        setShowAddField(false);
        setNewDefinition({
          name: '',
          namespace: '',
          key: '',
          type: 'text',
          description: '',
          appliesTo: 'products'
        });
        toast.success('Custom field definition created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create definition');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete definition
  const handleDeleteField = async (id: string) => {
    if (!confirm('Are you sure you want to delete this definition?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/metafields/definitions?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCustomFields(customFields.filter(field => field.id !== id));
        toast.success('Definition deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete definition');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Delete metafield
  const handleDeleteMetafield = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metafield?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/metafields?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setRecentMetafields(recentMetafields.filter(field => field.id !== id));
        toast.success('Metafield deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete metafield');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsPageLayout
      title="Custom data"
      description="Store additional information with metafields and custom definitions"
    >
      <div className="max-w-4xl">

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('definitions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'definitions'
                ? 'border-[#8B9F7E] text-[#8B9F7E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Field definitions ({customFields.length})
          </button>
          <button
            onClick={() => setSelectedTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'data'
                ? 'border-[#8B9F7E] text-[#8B9F7E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Metafield data ({recentMetafields.length})
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {selectedTab === 'definitions' ? (
          <>
            {/* Custom Field Definitions */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Custom field definitions</h3>
                  <button
                    onClick={() => setShowAddField(true)}
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Add definition
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                {customFields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No field definitions yet</p>
                    <p className="text-sm mt-1">Create your first custom field definition to get started</p>
                  </div>
                ) : (
                  <div className="nuvi-space-y-sm">
                    {customFields.map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded">
                          {typeIcons[field.type as keyof typeof typeIcons]}
                        </div>
                        <div>
                          <p className="font-medium">{field.name}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {field.namespace}.{field.key} • {field.appliesTo}
                          </p>
                          {field.description && (
                            <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteField(field.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Field Form */}
            {showAddField && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Add custom field definition</h3>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">Name *</label>
                        <input
                          type="text"
                          className="nuvi-input"
                          placeholder="e.g., Care Instructions"
                          value={newDefinition.name}
                          onChange={(e) => setNewDefinition({ ...newDefinition, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="nuvi-label">Applies to *</label>
                        <select 
                          className="nuvi-select"
                          value={newDefinition.appliesTo}
                          onChange={(e) => setNewDefinition({ ...newDefinition, appliesTo: e.target.value as any })}
                        >
                          <option value="products">Products</option>
                          <option value="customers">Customers</option>
                          <option value="orders">Orders</option>
                          <option value="collections">Collections</option>
                        </select>
                      </div>
                    </div>

                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">Namespace *</label>
                        <input
                          type="text"
                          className="nuvi-input"
                          placeholder="e.g., product_info"
                          value={newDefinition.namespace}
                          onChange={(e) => setNewDefinition({ ...newDefinition, namespace: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="nuvi-label">Key *</label>
                        <input
                          type="text"
                          className="nuvi-input"
                          placeholder="e.g., care_instructions"
                          value={newDefinition.key}
                          onChange={(e) => setNewDefinition({ ...newDefinition, key: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="nuvi-label">Type *</label>
                      <div className="nuvi-grid nuvi-grid-cols-5 nuvi-gap-sm">
                        {Object.entries(typeIcons).map(([type, icon]) => (
                          <button
                            key={type}
                            onClick={() => setNewDefinition({ ...newDefinition, type: type as any })}
                            className={`nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-sm nuvi-p-md nuvi-border nuvi-rounded-lg hover:nuvi-bg-muted transition-all ${
                              newDefinition.type === type ? 'nuvi-border-primary nuvi-bg-muted' : ''
                            }`}
                          >
                            {icon}
                            <span className="nuvi-text-sm nuvi-capitalize">{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="nuvi-label">Description</label>
                      <textarea
                        className="nuvi-input"
                        rows={3}
                        placeholder="Describe what this field is used for..."
                        value={newDefinition.description}
                        onChange={(e) => setNewDefinition({ ...newDefinition, description: e.target.value })}
                      />
                    </div>

                    <div className="nuvi-flex nuvi-gap-sm">
                      <button 
                        onClick={handleCreateDefinition}
                        className="nuvi-btn nuvi-btn-primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Creating...
                          </>
                        ) : (
                          'Create definition'
                        )}
                      </button>
                      <button
                        onClick={() => setShowAddField(false)}
                        className="nuvi-btn nuvi-btn-secondary"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Recent Metafields */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <h3 className="nuvi-card-title">Recent metafields</h3>
                  <button
                    onClick={loadData}
                    className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                {recentMetafields.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No metafields yet</p>
                    <p className="text-sm mt-1">Metafields will appear here once you add them to your resources</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Owner</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Namespace.Key</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Value</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Type</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Created</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {recentMetafields.map((metafield) => (
                        <tr key={metafield.id}>
                          <td className="py-3">
                            <p className="text-sm font-medium">{metafield.ownerType}</p>
                            <p className="text-sm text-gray-500">{metafield.ownerId.substring(0, 8)}...</p>
                          </td>
                          <td className="py-3">
                            <p className="text-sm font-mono text-gray-600">
                              {metafield.namespace}.{metafield.key}
                            </p>
                            {metafield.definition && (
                              <p className="text-xs text-gray-500">{metafield.definition.name}</p>
                            )}
                          </td>
                          <td className="py-3">
                            <p className="text-sm text-gray-600 max-w-xs truncate" title={metafield.value}>
                              {metafield.value}
                            </p>
                          </td>
                          <td className="py-3">
                            <span className="text-sm text-gray-500">{metafield.type}</span>
                          </td>
                          <td className="py-3">
                            <p className="text-sm text-gray-500">
                              {new Date(metafield.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => handleDeleteMetafield(metafield.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Bulk Import/Export */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div>
                  <h3 className="nuvi-card-title">Import/Export</h3>
                  <p className="nuvi-text-sm nuvi-text-muted">Bulk manage metafields using CSV files</p>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-gap-sm">
                  <button className="nuvi-btn nuvi-btn-secondary" disabled>
                    Import CSV (Coming soon)
                  </button>
                  <button className="nuvi-btn nuvi-btn-secondary" disabled>
                    Export CSV (Coming soon)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* API Access */}
        <div className="nuvi-card">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-md">
              <Code className="h-5 w-5 nuvi-text-muted" />
              <h3 className="nuvi-card-title">API access</h3>
            </div>
            <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
              Access and modify metafields programmatically using our API
            </p>
            <div className="nuvi-bg-muted nuvi-rounded-lg nuvi-p-md nuvi-font-mono nuvi-text-sm">
              <p className="nuvi-text-muted">GET /api/stores/{store.subdomain}/metafields</p>
              <p className="nuvi-text-muted">POST /api/stores/{store.subdomain}/metafields</p>
              <p className="nuvi-text-muted">PUT /api/stores/{store.subdomain}/metafields</p>
              <p className="nuvi-text-muted">DELETE /api/stores/{store.subdomain}/metafields?id=:id</p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="nuvi-alert nuvi-alert-info">
          <AlertCircle className="h-5 w-5" />
          <div>
            <p className="nuvi-font-medium">
              About metafields
            </p>
            <p className="nuvi-text-sm">
              Metafields let you add custom data to products, customers, orders, and other resources. Use them to store additional information that doesn't fit into standard fields.
            </p>
            <p className="nuvi-text-sm nuvi-mt-sm">
              <strong>Definitions</strong> define the structure and type of your custom fields. <strong>Metafields</strong> are the actual data attached to your resources.
            </p>
          </div>
        </div>
      </div>
    </div>
    </SettingsPageLayout>
  );
}