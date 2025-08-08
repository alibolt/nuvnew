'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  CreditCard, Settings, Receipt, Shield,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'providers' as const, label: 'Payment Providers', icon: CreditCard },
  { id: 'settings' as const, label: 'Payment Settings', icon: Settings },
  { id: 'taxes' as const, label: 'Tax Configuration', icon: Receipt },
  { id: 'test' as const, label: 'Test Mode', icon: Shield }
];

export function PaymentsFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'providers' | 'settings' | 'taxes' | 'test'>('providers');

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
        <h2 className="nuvi-page-title">Payment Settings</h2>
        <p className="nuvi-page-description">
          Configure payment methods and processing options
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
        {activeTab === 'providers' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Payment Providers</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Payment Providers content */}
                <p className="nuvi-text-muted">Configure your payment providers settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Payment Settings</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Payment Settings content */}
                <p className="nuvi-text-muted">Configure your payment settings settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'taxes' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Tax Configuration</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Tax Configuration content */}
                <p className="nuvi-text-muted">Configure your tax configuration settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Test Mode</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Test Mode content */}
                <p className="nuvi-text-muted">Configure your test mode settings here.</p>
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