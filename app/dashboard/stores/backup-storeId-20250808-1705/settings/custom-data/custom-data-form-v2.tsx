'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { Database, Plus, Edit2, Trash2, Code, AlertCircle, Tag, Calendar, Hash, Type } from 'lucide-react';
import {
  SettingsPageHeader,
  SettingsCard,
  SettingsSaveBar,
  SettingsFormField,
  SettingsInput,
  SettingsTextarea
} from '@/components/settings';

interface CustomField {
  id: string;
  name: string;
  namespace: string;
  key: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'json';
  description: string;
  appliesTo: 'products' | 'customers' | 'orders' | 'collections';
}

interface Metafield {
  id: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  ownerType: string;
  ownerId: string;
  createdAt: string;
}

export function CustomDataFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [customFields, setCustomFields] = useState<CustomField[]>([
    {
      id: '1',
      name: 'Product Care Instructions',
      namespace: 'product_info',
      key: 'care_instructions',
      type: 'text',
      description: 'Detailed care and maintenance instructions for products',
      appliesTo: 'products'
    },
    {
      id: '2',
      name: 'Customer Birthday',
      namespace: 'customer_data',
      key: 'birthday',
      type: 'date',
      description: 'Customer birth date for birthday promotions',
      appliesTo: 'customers'
    },
    {
      id: '3',
      name: 'Product Dimensions',
      namespace: 'product_specs',
      key: 'dimensions',
      type: 'json',
      description: 'Product dimensions in JSON format',
      appliesTo: 'products'
    }
  ]);

  const [recentMetafields] = useState<Metafield[]>([
    {
      id: '1',
      namespace: 'product_info',
      key: 'care_instructions',
      value: 'Machine wash cold, tumble dry low',
      type: 'single_line_text_field',
      ownerType: 'Product',
      ownerId: 'prod_123',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      namespace: 'customer_data',
      key: 'birthday',
      value: '1990-05-15',
      type: 'date',
      ownerType: 'Customer',
      ownerId: 'cust_456',
      createdAt: '2024-01-14T15:30:00Z'
    }
  ]);

  const [showAddField, setShowAddField] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'definitions' | 'data'>('definitions');

  const typeIcons = {
    text: <Type className="h-4 w-4" />,
    number: <Hash className="h-4 w-4" />,
    date: <Calendar className="h-4 w-4" />,
    boolean: <Tag className="h-4 w-4" />,
    json: <Code className="h-4 w-4" />
  };

  const handleDeleteField = (id: string) => {
    setCustomFields(customFields.filter(field => field.id !== id));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasChanges(false);
      router.refresh();
    } catch (error) {
      alert('Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    // Reset to original values
    setHasChanges(false);
    setShowAddField(false);
    router.refresh();
  };

  return (
    <div className="max-w-4xl">
      <SettingsPageHeader
        title="Custom data"
        description="Store additional information with metafields and custom definitions"
      />

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
            Field definitions
          </button>
          <button
            onClick={() => setSelectedTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'data'
                ? 'border-[#8B9F7E] text-[#8B9F7E]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Metafield data
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {selectedTab === 'definitions' ? (
          <>
            {/* Custom Field Definitions */}
            <SettingsCard
              title="Custom field definitions"
              action={
                <button
                  onClick={() => setShowAddField(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#8B9F7E] hover:bg-[#7A8E6D] text-white rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add definition
                </button>
              }
            >
              <div className="space-y-3">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded">
                        {typeIcons[field.type]}
                      </div>
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {field.namespace}.{field.key} • {field.appliesTo}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{field.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SettingsCard>

            {/* Add Field Form */}
            {showAddField && (
              <SettingsCard title="Add custom field definition">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <SettingsFormField label="Name">
                      <SettingsInput placeholder="e.g., Care Instructions" />
                    </SettingsFormField>
                    <SettingsFormField label="Applies to">
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B9F7E] focus:border-[#8B9F7E]">
                        <option value="products">Products</option>
                        <option value="customers">Customers</option>
                        <option value="orders">Orders</option>
                        <option value="collections">Collections</option>
                      </select>
                    </SettingsFormField>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <SettingsFormField label="Namespace">
                      <SettingsInput placeholder="e.g., product_info" />
                    </SettingsFormField>
                    <SettingsFormField label="Key">
                      <SettingsInput placeholder="e.g., care_instructions" />
                    </SettingsFormField>
                  </div>

                  <SettingsFormField label="Type">
                    <div className="grid grid-cols-5 gap-2">
                      {Object.entries(typeIcons).map(([type, icon]) => (
                        <button
                          key={type}
                          className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-gray-50 hover:border-[#8B9F7E] transition-all"
                        >
                          {icon}
                          <span className="text-sm capitalize">{type}</span>
                        </button>
                      ))}
                    </div>
                  </SettingsFormField>

                  <SettingsFormField label="Description">
                    <SettingsTextarea
                      placeholder="Describe what this field is used for..."
                      rows={3}
                    />
                  </SettingsFormField>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        setHasChanges(true);
                        setShowAddField(false);
                      }}
                      className="px-4 py-2 bg-[#8B9F7E] hover:bg-[#7A8E6D] text-white rounded-lg transition-colors"
                    >
                      Create definition
                    </button>
                    <button
                      onClick={() => setShowAddField(false)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </SettingsCard>
            )}
          </>
        ) : (
          <>
            {/* Recent Metafields */}
            <SettingsCard title="Recent metafields">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Owner</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Namespace.Key</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Value</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Type</th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-3">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentMetafields.map((metafield) => (
                      <tr key={metafield.id}>
                        <td className="py-3">
                          <p className="text-sm font-medium">{metafield.ownerType}</p>
                          <p className="text-sm text-gray-500">{metafield.ownerId}</p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm font-mono text-gray-600">
                            {metafield.namespace}.{metafield.key}
                          </p>
                        </td>
                        <td className="py-3">
                          <p className="text-sm text-gray-600 max-w-xs truncate">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SettingsCard>

            {/* Bulk Import/Export */}
            <SettingsCard title="Import/Export" description="Bulk manage metafields using CSV files">
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Import CSV
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Export CSV
                </button>
              </div>
            </SettingsCard>
          </>
        )}

        {/* API Access */}
        <SettingsCard>
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-5 w-5 text-gray-600" />
            <h3 className="text-base font-semibold">API access</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Access and modify metafields programmatically using our API
          </p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-600">GET /api/stores/{store.id}/metafields</p>
            <p className="text-gray-600">POST /api/stores/{store.id}/metafields</p>
            <p className="text-gray-600">PUT /api/stores/{store.id}/metafields/:id</p>
            <p className="text-gray-600">DELETE /api/stores/{store.id}/metafields/:id</p>
          </div>
          <button className="mt-4 text-sm text-[#8B9F7E] hover:text-[#7A8E6D] font-medium">
            View API documentation →
          </button>
        </SettingsCard>

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                About metafields
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Metafields let you add custom data to products, customers, orders, and other resources. Use them to store additional information that doesn't fit into standard fields.
              </p>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
                Learn more about metafields →
              </a>
            </div>
          </div>
        </div>
      </div>

      <SettingsSaveBar
        show={hasChanges}
        loading={loading}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}