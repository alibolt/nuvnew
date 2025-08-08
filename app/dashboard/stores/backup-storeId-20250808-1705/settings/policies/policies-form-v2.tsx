'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  RotateCcw, Shield, FileText, Truck,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'refund' as const, label: 'Refund Policy', icon: RotateCcw },
  { id: 'privacy' as const, label: 'Privacy Policy', icon: Shield },
  { id: 'terms' as const, label: 'Terms of Service', icon: FileText },
  { id: 'shipping' as const, label: 'Shipping Policy', icon: Truck }
];

export function PoliciesFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'refund' | 'privacy' | 'terms' | 'shipping'>('refund');

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
        <h2 className="nuvi-page-title">Store Policies</h2>
        <p className="nuvi-page-description">
          Manage your store policies and legal pages
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
        {activeTab === 'refund' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Refund Policy</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Refund Policy content */}
                <p className="nuvi-text-muted">Configure your refund policy settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Privacy Policy</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Privacy Policy content */}
                <p className="nuvi-text-muted">Configure your privacy policy settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'terms' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Terms of Service</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Terms of Service content */}
                <p className="nuvi-text-muted">Configure your terms of service settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Shipping Policy</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Shipping Policy content */}
                <p className="nuvi-text-muted">Configure your shipping policy settings here.</p>
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