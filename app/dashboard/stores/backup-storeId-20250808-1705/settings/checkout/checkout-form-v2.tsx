'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  FileText, Settings, Users, Package,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'fields' as const, label: 'Form Fields', icon: FileText },
  { id: 'behavior' as const, label: 'Checkout Behavior', icon: Settings },
  { id: 'accounts' as const, label: 'Customer Accounts', icon: Users },
  { id: 'post' as const, label: 'Post-Purchase', icon: Package }
];

export function CheckoutFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'fields' | 'behavior' | 'accounts' | 'post'>('fields');

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
        <h2 className="nuvi-page-title">Checkout Settings</h2>
        <p className="nuvi-page-description">
          Customize your checkout process and form fields
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
        {activeTab === 'fields' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Form Fields</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Form Fields content */}
                <p className="nuvi-text-muted">Configure your form fields settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Checkout Behavior</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Checkout Behavior content */}
                <p className="nuvi-text-muted">Configure your checkout behavior settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Customer Accounts</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Customer Accounts content */}
                <p className="nuvi-text-muted">Configure your customer accounts settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'post' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Post-Purchase</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Post-Purchase content */}
                <p className="nuvi-text-muted">Configure your post-purchase settings here.</p>
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