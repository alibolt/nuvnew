'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Globe, DollarSign, Truck, Package, Plus, Edit2, Trash2, X
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';
import { toast } from 'sonner';

const tabs = [
  { id: 'zones' as const, label: 'Shipping Zones', icon: Globe },
  { id: 'rates' as const, label: 'Shipping Rates', icon: DollarSign },
  { id: 'carriers' as const, label: 'Carriers', icon: Truck },
  { id: 'packaging' as const, label: 'Packaging', icon: Package }
];

export function ShippingFormV2({ store }: { store: Store & { storeSettings?: any } }) {
  const [activeTab, setActiveTab] = useState<'zones' | 'rates' | 'carriers' | 'packaging'>('zones');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const initialFormData = {
    // Shipping Zones
    zones: (store.storeSettings as any)?.shippingZones || [],
    
    // Shipping Rates
    freeShippingThreshold: (store.storeSettings as any)?.freeShippingThreshold || 50,
    enableFreeShipping: (store.storeSettings as any)?.enableFreeShipping ?? true,
    defaultShippingRate: (store.storeSettings as any)?.defaultShippingRate || 5.99,
    
    // Carriers
    enabledCarriers: (store.storeSettings as any)?.enabledCarriers || {
      ups: false,
      fedex: false,
      usps: true,
      dhl: false
    },
    
    // Packaging
    defaultPackaging: (store.storeSettings as any)?.defaultPackaging || 'box',
    packageSizes: (store.storeSettings as any)?.packageSizes || [
      { name: 'Small', dimensions: '6x4x2', weight: 1 },
      { name: 'Medium', dimensions: '10x8x6', weight: 5 },
      { name: 'Large', dimensions: '16x12x10', weight: 10 }
    ],
    enablePackageTracking: (store.storeSettings as any)?.enablePackageTracking ?? true,
    requireSignature: (store.storeSettings as any)?.requireSignature ?? false
  };

  const transformDataForSave = (data: typeof initialFormData) => ({
    shippingZones: data.zones,
    freeShippingThreshold: data.freeShippingThreshold,
    enableFreeShipping: data.enableFreeShipping,
    defaultShippingRate: data.defaultShippingRate,
    enabledCarriers: data.enabledCarriers,
    defaultPackaging: data.defaultPackaging,
    packageSizes: data.packageSizes,
    enablePackageTracking: data.enablePackageTracking,
    requireSignature: data.requireSignature
  });

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
      onDataChange={transformDataForSave}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Shipping Settings"
          description="Configure shipping zones, rates, and carriers"
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
            {activeTab === 'zones' && (
              <ZonesTab formData={formData} handleChange={handleChange} store={store} />
            )}
            {activeTab === 'rates' && (
              <RatesTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'carriers' && (
              <CarriersTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'packaging' && (
              <PackagingTab formData={formData} handleChange={handleChange} />
            )}
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}

// Zones Tab Component
function ZonesTab({ formData, handleChange, store }: any) {
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const handleAddZone = () => {
    setEditingZone(null);
    setShowZoneModal(true);
  };

  const handleEditZone = (zone: any) => {
    setEditingZone(zone);
    setShowZoneModal(true);
  };

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('Are you sure you want to delete this shipping zone?')) {
      const updatedZones = formData.zones.filter((z: any) => z.id !== zoneId);
      handleChange('zones', updatedZones);
      toast.success('Shipping zone deleted');
    }
  };

  const handleSaveZone = (zoneData: any) => {
    if (editingZone) {
      // Update existing zone
      const updatedZones = formData.zones.map((z: any) => 
        z.id === editingZone.id ? { ...z, ...zoneData } : z
      );
      handleChange('zones', updatedZones);
      toast.success('Shipping zone updated');
    } else {
      // Add new zone
      const newZone = {
        id: `zone_${Date.now()}`,
        ...zoneData,
        methods: []
      };
      handleChange('zones', [...formData.zones, newZone]);
      toast.success('Shipping zone added');
    }
    setShowZoneModal(false);
  };

  const handleAddMethod = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setEditingMethod(null);
    setShowMethodModal(true);
  };

  const handleEditMethod = (zoneId: string, method: any) => {
    setSelectedZoneId(zoneId);
    setEditingMethod(method);
    setShowMethodModal(true);
  };

  const handleDeleteMethod = (zoneId: string, methodId: string) => {
    if (confirm('Are you sure you want to delete this shipping method?')) {
      const updatedZones = formData.zones.map((zone: any) => {
        if (zone.id === zoneId) {
          return {
            ...zone,
            methods: zone.methods.filter((m: any) => m.id !== methodId)
          };
        }
        return zone;
      });
      handleChange('zones', updatedZones);
      toast.success('Shipping method deleted');
    }
  };

  const handleSaveMethod = (methodData: any) => {
    const updatedZones = formData.zones.map((zone: any) => {
      if (zone.id === selectedZoneId) {
        if (editingMethod) {
          // Update existing method
          return {
            ...zone,
            methods: zone.methods.map((m: any) => 
              m.id === editingMethod.id ? { ...m, ...methodData } : m
            )
          };
        } else {
          // Add new method
          const newMethod = {
            id: `method_${Date.now()}`,
            ...methodData
          };
          return {
            ...zone,
            methods: [...(zone.methods || []), newMethod]
          };
        }
      }
      return zone;
    });
    handleChange('zones', updatedZones);
    toast.success(editingMethod ? 'Shipping method updated' : 'Shipping method added');
    setShowMethodModal(false);
  };

  return (
    <div className="nuvi-space-y-lg">
      {/* Shipping Zones */}
      <div className="nuvi-card">
        <div className="nuvi-card-header nuvi-flex nuvi-items-center nuvi-justify-between">
          <div>
            <h3 className="nuvi-card-title">Shipping Zones</h3>
            <p className="nuvi-text-sm nuvi-text-muted">
              Create shipping zones to define rates for different regions
            </p>
          </div>
          <button 
            onClick={handleAddZone}
            className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Zone
          </button>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {formData.zones.length === 0 ? (
              <div className="nuvi-text-center nuvi-py-lg">
                <Globe className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-sm" />
                <p className="nuvi-text-muted">No shipping zones configured</p>
                <button 
                  onClick={handleAddZone}
                  className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-mt-md"
                >
                  Add Your First Zone
                </button>
              </div>
            ) : (
              formData.zones.map((zone: any) => (
                <div key={zone.id} className="nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-p-md">
                    <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-sm">
                      <div>
                        <h4 className="nuvi-font-medium nuvi-flex nuvi-items-center nuvi-gap-sm">
                          {zone.name}
                          {!zone.enabled && (
                            <span className="nuvi-badge nuvi-badge-secondary">Disabled</span>
                          )}
                        </h4>
                        <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                          Countries: {zone.countries.join(', ')}
                        </p>
                      </div>
                      <div className="nuvi-flex nuvi-gap-sm">
                        <button 
                          onClick={() => handleEditZone(zone)}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteZone(zone.id)}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Shipping Methods */}
                    <div className="nuvi-mt-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                        <h5 className="nuvi-text-sm nuvi-font-medium">Shipping Methods</h5>
                        <button 
                          onClick={() => handleAddMethod(zone.id)}
                          className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Method
                        </button>
                      </div>
                      {zone.methods && zone.methods.length > 0 ? (
                        <div className="nuvi-space-y-sm">
                          {zone.methods.map((method: any) => (
                            <div key={method.id} className="nuvi-bg-secondary nuvi-p-sm nuvi-rounded">
                              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                                <div>
                                  <span className="nuvi-text-sm nuvi-font-medium">{method.name}</span>
                                  <span className="nuvi-text-sm nuvi-text-muted nuvi-ml-sm">
                                    ${method.pricing?.baseRate || 0}
                                  </span>
                                </div>
                                <div className="nuvi-flex nuvi-gap-xs">
                                  <button 
                                    onClick={() => handleEditMethod(zone.id, method)}
                                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs"
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteMethod(zone.id, method.id)}
                                    className="nuvi-btn nuvi-btn-ghost nuvi-btn-xs nuvi-text-danger"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="nuvi-text-sm nuvi-text-muted">No shipping methods configured</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <ZoneModal
          zone={editingZone}
          onSave={handleSaveZone}
          onClose={() => setShowZoneModal(false)}
        />
      )}

      {/* Method Modal */}
      {showMethodModal && (
        <MethodModal
          method={editingMethod}
          onSave={handleSaveMethod}
          onClose={() => setShowMethodModal(false)}
        />
      )}
    </div>
  );
}

// Rates Tab Component
function RatesTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Free Shipping */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Free Shipping</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Enable free shipping</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Offer free shipping on qualifying orders
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.enableFreeShipping}
                  onChange={(e) => handleChange('enableFreeShipping', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div>
              <label className="nuvi-label">Free shipping threshold ($)</label>
              <input
                type="number"
                className="nuvi-input"
                value={formData.freeShippingThreshold}
                onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="nuvi-label">Default shipping rate ($)</label>
              <input
                type="number"
                className="nuvi-input"
                value={formData.defaultShippingRate}
                onChange={(e) => handleChange('defaultShippingRate', parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Carriers Tab Component
function CarriersTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Enabled Carriers */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Shipping Carriers</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Enable carriers to calculate real-time shipping rates
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {Object.entries(formData.enabledCarriers).map(([carrier, enabled]) => (
              <div key={carrier} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div>
                  <h4 className="nuvi-font-medium">{carrier.toUpperCase()}</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Calculate rates with {carrier.toUpperCase()}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={enabled as boolean}
                    onChange={(e) => handleChange('enabledCarriers', {
                      ...formData.enabledCarriers,
                      [carrier]: e.target.checked
                    })}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Zone Modal Component
function ZoneModal({ zone, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    countries: zone?.countries || [],
    enabled: zone?.enabled ?? true
  });

  const availableCountries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: '*', name: 'Rest of World' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.countries.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="nuvi-modal-backdrop">
      <div className="nuvi-modal-content" style={{ maxWidth: '500px' }}>
        <div className="nuvi-modal-header">
          <h3 className="nuvi-modal-title">
            {zone ? 'Edit Shipping Zone' : 'Add Shipping Zone'}
          </h3>
          <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="nuvi-modal-body">
            <div className="nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Zone Name *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Domestic, International"
                  required
                />
              </div>

              <div>
                <label className="nuvi-label">Countries *</label>
                <div className="nuvi-space-y-sm nuvi-max-h-48 nuvi-overflow-y-auto nuvi-border nuvi-rounded nuvi-p-sm">
                  {availableCountries.map((country) => (
                    <label key={country.code} className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <input
                        type="checkbox"
                        checked={formData.countries.includes(country.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              countries: [...formData.countries, country.code]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              countries: formData.countries.filter(c => c !== country.code)
                            });
                          }
                        }}
                        className="nuvi-checkbox"
                      />
                      <span className="nuvi-text-sm">{country.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  id="zone-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="nuvi-checkbox"
                />
                <label htmlFor="zone-enabled" className="nuvi-text-sm">
                  Enable this shipping zone
                </label>
              </div>
            </div>
          </div>
          <div className="nuvi-modal-footer">
            <button type="button" onClick={onClose} className="nuvi-btn nuvi-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="nuvi-btn nuvi-btn-primary">
              {zone ? 'Update' : 'Create'} Zone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Method Modal Component
function MethodModal({ method, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: method?.name || '',
    description: method?.description || '',
    type: method?.type || 'flat_rate',
    enabled: method?.enabled ?? true,
    pricing: {
      baseRate: method?.pricing?.baseRate || 0,
      perKgRate: method?.pricing?.perKgRate || 0,
      freeShippingThreshold: method?.pricing?.freeShippingThreshold || 0
    },
    deliveryTime: {
      min: method?.deliveryTime?.min || 1,
      max: method?.deliveryTime?.max || 7,
      unit: method?.deliveryTime?.unit || 'days'
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter a method name');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="nuvi-modal-backdrop">
      <div className="nuvi-modal-content" style={{ maxWidth: '600px' }}>
        <div className="nuvi-modal-header">
          <h3 className="nuvi-modal-title">
            {method ? 'Edit Shipping Method' : 'Add Shipping Method'}
          </h3>
          <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="nuvi-modal-body">
            <div className="nuvi-space-y-md">
              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">Method Name *</label>
                  <input
                    type="text"
                    className="nuvi-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Standard Shipping"
                    required
                  />
                </div>
                <div>
                  <label className="nuvi-label">Type</label>
                  <select
                    className="nuvi-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="flat_rate">Flat Rate</option>
                    <option value="weight_based">Weight Based</option>
                    <option value="price_based">Price Based</option>
                    <option value="free">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="nuvi-label">Description</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Delivery in 5-7 business days"
                />
              </div>

              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">Base Rate ($)</label>
                  <input
                    type="number"
                    className="nuvi-input"
                    value={formData.pricing.baseRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      pricing: { ...formData.pricing, baseRate: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                    step="0.01"
                  />
                </div>
                {formData.type === 'weight_based' && (
                  <div>
                    <label className="nuvi-label">Per Kg Rate ($)</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      value={formData.pricing.perKgRate}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, perKgRate: parseFloat(e.target.value) || 0 }
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
                {formData.type === 'free' && (
                  <div>
                    <label className="nuvi-label">Minimum Order ($)</label>
                    <input
                      type="number"
                      className="nuvi-input"
                      value={formData.pricing.freeShippingThreshold}
                      onChange={(e) => setFormData({
                        ...formData,
                        pricing: { ...formData.pricing, freeShippingThreshold: parseFloat(e.target.value) || 0 }
                      })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="nuvi-label">Estimated Delivery Time</label>
                <div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-sm">
                  <input
                    type="number"
                    className="nuvi-input"
                    value={formData.deliveryTime.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryTime: { ...formData.deliveryTime, min: parseInt(e.target.value) || 1 }
                    })}
                    min="1"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    className="nuvi-input"
                    value={formData.deliveryTime.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryTime: { ...formData.deliveryTime, max: parseInt(e.target.value) || 1 }
                    })}
                    min="1"
                    placeholder="Max"
                  />
                  <select
                    className="nuvi-select"
                    value={formData.deliveryTime.unit}
                    onChange={(e) => setFormData({
                      ...formData,
                      deliveryTime: { ...formData.deliveryTime, unit: e.target.value }
                    })}
                  >
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>

              <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  id="method-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="nuvi-checkbox"
                />
                <label htmlFor="method-enabled" className="nuvi-text-sm">
                  Enable this shipping method
                </label>
              </div>
            </div>
          </div>
          <div className="nuvi-modal-footer">
            <button type="button" onClick={onClose} className="nuvi-btn nuvi-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="nuvi-btn nuvi-btn-primary">
              {method ? 'Update' : 'Create'} Method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Packaging Tab Component
function PackagingTab({ formData, handleChange }: any) {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddPackage = () => {
    setEditingPackage(null);
    setEditingIndex(null);
    setShowPackageModal(true);
  };

  const handleEditPackage = (pkg: any, index: number) => {
    setEditingPackage(pkg);
    setEditingIndex(index);
    setShowPackageModal(true);
  };

  const handleDeletePackage = (index: number) => {
    if (confirm('Are you sure you want to delete this package size?')) {
      const updatedSizes = formData.packageSizes.filter((_: any, i: number) => i !== index);
      handleChange('packageSizes', updatedSizes);
      toast.success('Package size deleted');
    }
  };

  const handleSavePackage = (packageData: any) => {
    if (editingIndex !== null) {
      // Update existing package
      const updatedSizes = [...formData.packageSizes];
      updatedSizes[editingIndex] = packageData;
      handleChange('packageSizes', updatedSizes);
      toast.success('Package size updated');
    } else {
      // Add new package
      handleChange('packageSizes', [...formData.packageSizes, packageData]);
      toast.success('Package size added');
    }
    setShowPackageModal(false);
  };

  return (
    <div className="nuvi-space-y-lg">
      {/* Packaging Options */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Packaging Options</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Default packaging type</label>
              <select 
                className="nuvi-select"
                value={formData.defaultPackaging}
                onChange={(e) => handleChange('defaultPackaging', e.target.value)}
              >
                <option value="box">Box</option>
                <option value="envelope">Envelope</option>
                <option value="tube">Tube</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Enable package tracking</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Provide tracking numbers for shipments
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.enablePackageTracking}
                  onChange={(e) => handleChange('enablePackageTracking', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Require signature on delivery</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Customer must sign for packages
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.requireSignature}
                  onChange={(e) => handleChange('requireSignature', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Package Sizes */}
      <div className="nuvi-card">
        <div className="nuvi-card-header nuvi-flex nuvi-items-center nuvi-justify-between">
          <div>
            <h3 className="nuvi-card-title">Package Sizes</h3>
            <p className="nuvi-text-sm nuvi-text-muted">
              Define standard package sizes for your products
            </p>
          </div>
          <button 
            onClick={handleAddPackage}
            className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Size
          </button>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {formData.packageSizes.length === 0 ? (
              <div className="nuvi-text-center nuvi-py-lg">
                <Package className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-sm" />
                <p className="nuvi-text-muted">No package sizes configured</p>
                <button 
                  onClick={handleAddPackage}
                  className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-mt-md"
                >
                  Add Your First Package Size
                </button>
              </div>
            ) : (
              formData.packageSizes.map((size: any, index: number) => (
                <div key={index} className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h4 className="nuvi-font-medium">{size.name}</h4>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Dimensions: {size.dimensions} • Weight: {size.weight} {size.weightUnit || 'lbs'}
                    </p>
                  </div>
                  <div className="nuvi-flex nuvi-gap-sm">
                    <button 
                      onClick={() => handleEditPackage(size, index)}
                      className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePackage(index)}
                      className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Package Modal */}
      {showPackageModal && (
        <PackageModal
          package={editingPackage}
          onSave={handleSavePackage}
          onClose={() => setShowPackageModal(false)}
        />
      )}
    </div>
  );
}

// Package Modal Component
function PackageModal({ package: pkg, onSave, onClose }: any) {
  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    dimensions: pkg?.dimensions || '',
    weight: pkg?.weight || 0,
    weightUnit: pkg?.weightUnit || 'lbs',
    maxWeight: pkg?.maxWeight || 0,
    type: pkg?.type || 'box'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dimensions) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="nuvi-modal-backdrop">
      <div className="nuvi-modal-content" style={{ maxWidth: '500px' }}>
        <div className="nuvi-modal-header">
          <h3 className="nuvi-modal-title">
            {pkg ? 'Edit Package Size' : 'Add Package Size'}
          </h3>
          <button onClick={onClose} className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="nuvi-modal-body">
            <div className="nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Package Name *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Small Box, Large Envelope"
                  required
                />
              </div>

              <div>
                <label className="nuvi-label">Type</label>
                <select
                  className="nuvi-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="box">Box</option>
                  <option value="envelope">Envelope</option>
                  <option value="tube">Tube</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="nuvi-label">Dimensions *</label>
                <input
                  type="text"
                  className="nuvi-input"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g., 12x9x3 inches"
                  required
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Enter dimensions as LxWxH with unit
                </p>
              </div>

              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">Empty Weight</label>
                  <input
                    type="number"
                    className="nuvi-input"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="nuvi-label">Weight Unit</label>
                  <select
                    className="nuvi-select"
                    value={formData.weightUnit}
                    onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                    <option value="oz">oz</option>
                    <option value="g">g</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="nuvi-label">Max Weight Capacity</label>
                <input
                  type="number"
                  className="nuvi-input"
                  value={formData.maxWeight}
                  onChange={(e) => setFormData({ ...formData, maxWeight: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                  Maximum weight this package can hold
                </p>
              </div>
            </div>
          </div>
          <div className="nuvi-modal-footer">
            <button type="button" onClick={onClose} className="nuvi-btn nuvi-btn-secondary">
              Cancel
            </button>
            <button type="submit" className="nuvi-btn nuvi-btn-primary">
              {pkg ? 'Update' : 'Create'} Package Size
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}