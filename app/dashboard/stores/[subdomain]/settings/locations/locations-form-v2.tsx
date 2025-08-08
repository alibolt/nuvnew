'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  MapPin, Package, Truck, Settings,
  Plus, Edit, Trash2, Clock,
  CheckCircle, XCircle, Phone, Mail,
  Globe, Calendar, Users, BarChart3,
  Zap, RefreshCw, Eye, Star
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'locations' as const, label: 'Locations', icon: MapPin },
  { id: 'inventory' as const, label: 'Inventory', icon: Package },
  { id: 'fulfillment' as const, label: 'Fulfillment', icon: Truck },
  { id: 'settings' as const, label: 'Settings', icon: Settings }
];

const initialFormData = {
    // Store Locations
    locations: [
      {
        id: 1,
        name: 'Main Store',
        type: 'store',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 555-123-4567',
        email: 'store@example.com',
        isDefault: true,
        status: 'active',
        operatingHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '17:00', closed: false },
          sunday: { open: '12:00', close: '16:00', closed: false }
        }
      },
      {
        id: 2,
        name: 'Warehouse',
        type: 'warehouse',
        address: '456 Industrial Blvd',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        country: 'United States',
        phone: '+1 555-987-6543',
        email: 'warehouse@example.com',
        isDefault: false,
        status: 'active',
        operatingHours: {
          monday: { open: '08:00', close: '17:00', closed: false },
          tuesday: { open: '08:00', close: '17:00', closed: false },
          wednesday: { open: '08:00', close: '17:00', closed: false },
          thursday: { open: '08:00', close: '17:00', closed: false },
          friday: { open: '08:00', close: '17:00', closed: false },
          saturday: { open: '00:00', close: '00:00', closed: true },
          sunday: { open: '00:00', close: '00:00', closed: true }
        }
      }
    ],
    
    // Inventory Settings
    inventory: {
      trackQuantity: true,
      showOutOfStock: true,
      allowBackorders: false,
      lowStockThreshold: 10,
      autoReorderEnabled: false,
      autoReorderThreshold: 5,
      autoReorderQuantity: 50,
      notifyLowStock: true,
      notifyOutOfStock: true,
      notificationEmail: 'inventory@example.com'
    },
    
    // Fulfillment Settings
    fulfillment: {
      defaultLocation: 1,
      splitShipments: true,
      partialFulfillment: true,
      autoAssignLocation: true,
      priorityRules: [
        { rule: 'closest_to_customer', priority: 1 },
        { rule: 'lowest_cost', priority: 2 },
        { rule: 'fastest_shipping', priority: 3 }
      ],
      cutoffTimes: {
        sameDay: '12:00',
        nextDay: '15:00',
        standard: '17:00'
      }
    },
    
    // Location Settings
    locationSettings: {
      requireLocationSelection: false,
      showLocationDetails: true,
      enableStorePickup: true,
      enableLocalDelivery: false,
      localDeliveryRadius: 10,
      localDeliveryFee: 5.00,
      enableClickAndCollect: true,
      pickupInstructions: 'Please bring your order confirmation and ID.'
    }
};

export function LocationsFormV2({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'locations' | 'inventory' | 'fulfillment' | 'settings'>('locations');

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Locations"
          description="Manage store locations, inventory, and fulfillment settings"
        >

      {/* Tabs */}
      <div className="nuvi-settings-tabs">
        <div className="nuvi-settings-tabs-list">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nuvi-settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="nuvi-tab-content">
        {activeTab === 'locations' && (
          <div className="nuvi-space-y-lg">
            {/* Store Locations */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Store Locations</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Manage your physical store locations and warehouses
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                    <Plus className="h-4 w-4" />
                    Add Location
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  {formData.locations.map((location) => (
                    <div key={location.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-sm">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <MapPin className="h-5 w-5 nuvi-text-primary" />
                          <div>
                            <h4 className="nuvi-font-medium nuvi-flex nuvi-items-center nuvi-gap-sm">
                              {location.name}
                              {location.isDefault && (
                                <span className="nuvi-badge nuvi-badge-primary">Default</span>
                              )}
                            </h4>
                            <p className="nuvi-text-sm nuvi-text-muted">
                              {location.type === 'store' ? 'Retail Store' : 'Warehouse'}
                            </p>
                          </div>
                        </div>
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <span className={`nuvi-badge ${
                            location.status === 'active' ? 'nuvi-badge-success' : 'nuvi-badge-secondary'
                          }`}>
                            {location.status}
                          </span>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md nuvi-mb-md">
                        <div>
                          <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Address</p>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            {location.address}<br />
                            {location.city}, {location.state} {location.zipCode}<br />
                            {location.country}
                          </p>
                        </div>
                        <div>
                          <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Contact</p>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-text-sm nuvi-text-muted">
                            <Phone className="h-3 w-3" />
                            <span>{location.phone}</span>
                          </div>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-text-sm nuvi-text-muted">
                            <Mail className="h-3 w-3" />
                            <span>{location.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">Operating Hours</p>
                        <div className="nuvi-grid nuvi-grid-cols-2 nuvi-md:grid-cols-4 nuvi-gap-xs nuvi-text-xs">
                          {Object.entries(location.operatingHours).map(([day, hours]) => (
                            <div key={day} className="nuvi-flex nuvi-justify-between">
                              <span className="nuvi-capitalize">{day.slice(0, 3)}</span>
                              <span className="nuvi-text-muted">
                                {hours.closed ? 'Closed' : `${hours.open}-${hours.close}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Analytics */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Location Analytics</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Performance metrics for your locations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <BarChart3 className="h-8 w-8 nuvi-text-primary nuvi-mx-auto nuvi-mb-sm" />
                    <h4 className="nuvi-font-medium">Total Orders</h4>
                    <p className="nuvi-text-2xl nuvi-font-bold">1,234</p>
                    <p className="nuvi-text-sm nuvi-text-muted">This month</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <Users className="h-8 w-8 nuvi-text-green-600 nuvi-mx-auto nuvi-mb-sm" />
                    <h4 className="nuvi-font-medium">Active Customers</h4>
                    <p className="nuvi-text-2xl nuvi-font-bold">456</p>
                    <p className="nuvi-text-sm nuvi-text-muted">This month</p>
                  </div>
                  <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <Star className="h-8 w-8 nuvi-text-yellow-600 nuvi-mx-auto nuvi-mb-sm" />
                    <h4 className="nuvi-font-medium">Avg Rating</h4>
                    <p className="nuvi-text-2xl nuvi-font-bold">4.8</p>
                    <p className="nuvi-text-sm nuvi-text-muted">Based on reviews</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="nuvi-space-y-lg">
            {/* Inventory Tracking */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Inventory Tracking</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how inventory is tracked across locations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Track inventory quantities</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Monitor stock levels for all products
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.inventory.trackQuantity}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          trackQuantity: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show out of stock products</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display products even when inventory is zero
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.inventory.showOutOfStock}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          showOutOfStock: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow backorders</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Accept orders when inventory is insufficient
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.inventory.allowBackorders}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          allowBackorders: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label">Low stock threshold</label>
                      <input
                        type="number"
                        className="nuvi-input"
                        value={formData.inventory.lowStockThreshold}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          lowStockThreshold: parseInt(e.target.value)
                        })}
                        min="0"
                      />
                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                        Alert when inventory falls below this number
                      </p>
                    </div>
                    <div>
                      <label className="nuvi-label">Notification email</label>
                      <input
                        type="email"
                        className="nuvi-input"
                        value={formData.inventory.notificationEmail}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          notificationEmail: e.target.value
                        })}
                        placeholder="inventory@example.com"
                      />
                      <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                        Receive inventory alerts at this email
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Reorder */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Auto Reorder</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Automatically reorder products when stock is low
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable auto reorder</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Automatically create purchase orders when stock is low
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.inventory.autoReorderEnabled}
                        onChange={(e) => handleChange('inventory', {
                          ...formData.inventory,
                          autoReorderEnabled: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  {formData.inventory.autoReorderEnabled && (
                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">Auto reorder threshold</label>
                        <input
                          type="number"
                          className="nuvi-input"
                          value={formData.inventory.autoReorderThreshold}
                          onChange={(e) => handleChange('inventory', {
                            ...formData.inventory,
                            autoReorderThreshold: parseInt(e.target.value)
                          })}
                          min="0"
                        />
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                          Trigger reorder when stock falls below this number
                        </p>
                      </div>
                      <div>
                        <label className="nuvi-label">Auto reorder quantity</label>
                        <input
                          type="number"
                          className="nuvi-input"
                          value={formData.inventory.autoReorderQuantity}
                          onChange={(e) => handleChange('inventory', {
                            ...formData.inventory,
                            autoReorderQuantity: parseInt(e.target.value)
                          })}
                          min="1"
                        />
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                          Default quantity to reorder
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fulfillment' && (
          <div className="nuvi-space-y-lg">
            {/* Fulfillment Settings */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Fulfillment Settings</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how orders are fulfilled across your locations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Default fulfillment location</label>
                    <select 
                      className="nuvi-select"
                      value={formData.fulfillment.defaultLocation}
                      onChange={(e) => handleChange('fulfillment', {
                        ...formData.fulfillment,
                        defaultLocation: parseInt(e.target.value)
                      })}
                    >
                      {formData.locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} - {location.type}
                        </option>
                      ))}
                    </select>
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Location to use when automatic assignment is disabled
                    </p>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow split shipments</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Fulfill orders from multiple locations if needed
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.fulfillment.splitShipments}
                        onChange={(e) => handleChange('fulfillment', {
                          ...formData.fulfillment,
                          splitShipments: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Allow partial fulfillment</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Ship available items before the full order is ready
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.fulfillment.partialFulfillment}
                        onChange={(e) => handleChange('fulfillment', {
                          ...formData.fulfillment,
                          partialFulfillment: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Auto-assign fulfillment location</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Automatically choose the best location for each order
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.fulfillment.autoAssignLocation}
                        onChange={(e) => handleChange('fulfillment', {
                          ...formData.fulfillment,
                          autoAssignLocation: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Rules */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Priority Rules</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Set the priority order for automatic location assignment
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {formData.fulfillment.priorityRules
                    .sort((a, b) => a.priority - b.priority)
                    .map((rule, index) => (
                      <div key={rule.rule} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-sm nuvi-border nuvi-rounded">
                        <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                          <span className="nuvi-text-sm nuvi-font-medium">{index + 1}.</span>
                          <span className="nuvi-text-sm nuvi-capitalize">
                            {rule.rule.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="nuvi-flex nuvi-gap-xs">
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm" disabled={index === 0}>
                            ↑
                          </button>
                          <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm" disabled={index === formData.fulfillment.priorityRules.length - 1}>
                            ↓
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Cutoff Times */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Order Cutoff Times</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Set cutoff times for different shipping speeds
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div>
                    <label className="nuvi-label">Same day delivery</label>
                    <input
                      type="time"
                      className="nuvi-input"
                      value={formData.fulfillment.cutoffTimes.sameDay}
                      onChange={(e) => handleChange('fulfillment', {
                        ...formData.fulfillment,
                        cutoffTimes: {
                          ...formData.fulfillment.cutoffTimes,
                          sameDay: e.target.value
                        }
                      })}
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Orders placed before this time qualify for same-day delivery
                    </p>
                  </div>
                  <div>
                    <label className="nuvi-label">Next day delivery</label>
                    <input
                      type="time"
                      className="nuvi-input"
                      value={formData.fulfillment.cutoffTimes.nextDay}
                      onChange={(e) => handleChange('fulfillment', {
                        ...formData.fulfillment,
                        cutoffTimes: {
                          ...formData.fulfillment.cutoffTimes,
                          nextDay: e.target.value
                        }
                      })}
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Orders placed before this time qualify for next-day delivery
                    </p>
                  </div>
                  <div>
                    <label className="nuvi-label">Standard shipping</label>
                    <input
                      type="time"
                      className="nuvi-input"
                      value={formData.fulfillment.cutoffTimes.standard}
                      onChange={(e) => handleChange('fulfillment', {
                        ...formData.fulfillment,
                        cutoffTimes: {
                          ...formData.fulfillment.cutoffTimes,
                          standard: e.target.value
                        }
                      })}
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Orders placed before this time ship the same day
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="nuvi-space-y-lg">
            {/* Customer Experience */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Customer Experience</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure how customers interact with your locations
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Require location selection</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Force customers to choose a location during checkout
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.locationSettings.requireLocationSelection}
                        onChange={(e) => handleChange('locationSettings', {
                          ...formData.locationSettings,
                          requireLocationSelection: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Show location details</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Display address and contact information for locations
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.locationSettings.showLocationDetails}
                        onChange={(e) => handleChange('locationSettings', {
                          ...formData.locationSettings,
                          showLocationDetails: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Pickup */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Store Pickup</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure in-store pickup options
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable store pickup</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to pick up orders at your stores
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.locationSettings.enableStorePickup}
                        onChange={(e) => handleChange('locationSettings', {
                          ...formData.locationSettings,
                          enableStorePickup: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable click and collect</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Allow customers to order online and collect in-store
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.locationSettings.enableClickAndCollect}
                        onChange={(e) => handleChange('locationSettings', {
                          ...formData.locationSettings,
                          enableClickAndCollect: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="nuvi-label">Pickup instructions</label>
                    <textarea
                      className="nuvi-input"
                      rows={3}
                      value={formData.locationSettings.pickupInstructions}
                      onChange={(e) => handleChange('locationSettings', {
                        ...formData.locationSettings,
                        pickupInstructions: e.target.value
                      })}
                      placeholder="Enter pickup instructions for customers..."
                    />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                      Instructions displayed to customers when they select pickup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Local Delivery */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Local Delivery</h3>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Configure local delivery options
                </p>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div>
                      <h4 className="nuvi-font-medium">Enable local delivery</h4>
                      <p className="nuvi-text-sm nuvi-text-muted">
                        Offer delivery within a specific radius of your stores
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.locationSettings.enableLocalDelivery}
                        onChange={(e) => handleChange('locationSettings', {
                          ...formData.locationSettings,
                          enableLocalDelivery: e.target.checked
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                    </label>
                  </div>

                  {formData.locationSettings.enableLocalDelivery && (
                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">Delivery radius (miles)</label>
                        <input
                          type="number"
                          className="nuvi-input"
                          value={formData.locationSettings.localDeliveryRadius}
                          onChange={(e) => handleChange('locationSettings', {
                            ...formData.locationSettings,
                            localDeliveryRadius: parseInt(e.target.value)
                          })}
                          min="1"
                          max="50"
                        />
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                          Maximum distance for local delivery
                        </p>
                      </div>
                      <div>
                        <label className="nuvi-label">Delivery fee</label>
                        <div className="nuvi-input-group">
                          <span className="nuvi-input-group-text">$</span>
                          <input
                            type="number"
                            className="nuvi-input"
                            value={formData.locationSettings.localDeliveryFee}
                            onChange={(e) => handleChange('locationSettings', {
                              ...formData.locationSettings,
                              localDeliveryFee: parseFloat(e.target.value)
                            })}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                          Fixed fee for local delivery
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}