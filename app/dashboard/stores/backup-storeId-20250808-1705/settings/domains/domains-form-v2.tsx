'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  Globe, Link, Shield, ArrowRight,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'primary' as const, label: 'Primary Domain', icon: Globe },
  { id: 'custom' as const, label: 'Custom Domains', icon: Link },
  { id: 'ssl' as const, label: 'SSL Certificates', icon: Shield },
  { id: 'redirects' as const, label: 'Redirects', icon: ArrowRight }
];

export function DomainsFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'primary' | 'custom' | 'ssl' | 'redirects'>('primary');

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
        <h2 className="nuvi-page-title">Domain Settings</h2>
        <p className="nuvi-page-description">
          Manage your store domains and SSL certificates
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
        {activeTab === 'primary' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Primary Domain</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Primary Domain content */}
                <p className="nuvi-text-muted">Configure your primary domain settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Custom Domains</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Custom Domains content */}
                <p className="nuvi-text-muted">Configure your custom domains settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ssl' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">SSL Certificates</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add SSL Certificates content */}
                <p className="nuvi-text-muted">Configure your ssl certificates settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'redirects' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Redirects</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Redirects content */}
                <p className="nuvi-text-muted">Configure your redirects settings here.</p>
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