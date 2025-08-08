'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  CreditCard, TrendingUp, Receipt, FileText,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'current' as const, label: 'Current Plan', icon: CreditCard },
  { id: 'upgrade' as const, label: 'Available Plans', icon: TrendingUp },
  { id: 'billing' as const, label: 'Billing Details', icon: Receipt },
  { id: 'history' as const, label: 'Invoice History', icon: FileText }
];

export function PlanFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'upgrade' | 'billing' | 'history'>('current');

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
        <h2 className="nuvi-page-title">Plan & Billing</h2>
        <p className="nuvi-page-description">
          Manage your subscription plan and billing information
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
        {activeTab === 'current' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Current Plan</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Current Plan content */}
                <p className="nuvi-text-muted">Configure your current plan settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upgrade' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Available Plans</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Available Plans content */}
                <p className="nuvi-text-muted">Configure your available plans settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Billing Details</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Billing Details content */}
                <p className="nuvi-text-muted">Configure your billing details settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Invoice History</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Invoice History content */}
                <p className="nuvi-text-muted">Configure your invoice history settings here.</p>
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