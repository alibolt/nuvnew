'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  Globe, DollarSign, Truck, Package,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'zones' as const, label: 'Shipping Zones', icon: Globe },
  { id: 'rates' as const, label: 'Shipping Rates', icon: DollarSign },
  { id: 'carriers' as const, label: 'Carriers', icon: Truck },
  { id: 'packaging' as const, label: 'Packaging', icon: Package }
];

export function ShippingFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'zones' | 'rates' | 'carriers' | 'packaging'>('zones');

  const [formData, setFormData] = useState({
    // TODO: Add form fields for each tab
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
    setShowSaveBar(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setHasChanges(false);
        setShowSaveBar(false);
        router.refresh();
      } else {
        alert('Failed to save changes');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    // Reset form data
    setHasChanges(false);
    setShowSaveBar(false);
  };

  return (
    <>
      {/* Page Header */}
      <div className="nuvi-page-header">
        <h2 className="nuvi-page-title">Shipping Settings</h2>
        <p className="nuvi-page-description">
          Configure shipping zones, rates, and delivery options
        </p>
      </div>

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
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Shipping Zones</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Shipping Zones content */}
                <p className="nuvi-text-muted">Configure your shipping zones settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rates' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Shipping Rates</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Shipping Rates content */}
                <p className="nuvi-text-muted">Configure your shipping rates settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carriers' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Carriers</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Carriers content */}
                <p className="nuvi-text-muted">Configure your carriers settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'packaging' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Packaging</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Packaging content */}
                <p className="nuvi-text-muted">Configure your packaging settings here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Bar */}
      {showSaveBar && (
        <div className="nuvi-save-bar">
          <div className="nuvi-save-bar-content">
            <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
              <AlertCircle className="h-5 w-5 nuvi-text-warning" />
              <span>You have unsaved changes</span>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <button
                onClick={handleDiscard}
                className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                disabled={loading}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}