'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  Mail, Bell, FileText, MessageSquare,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'customer' as const, label: 'Customer Emails', icon: Mail },
  { id: 'admin' as const, label: 'Admin Alerts', icon: Bell },
  { id: 'templates' as const, label: 'Email Templates', icon: FileText },
  { id: 'sms' as const, label: 'SMS Settings', icon: MessageSquare }
];

export function NotificationsFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'customer' | 'admin' | 'templates' | 'sms'>('customer');

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
        <h2 className="nuvi-page-title">Notification Settings</h2>
        <p className="nuvi-page-description">
          Configure email templates and notification preferences
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
        {activeTab === 'customer' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Customer Emails</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Customer Emails content */}
                <p className="nuvi-text-muted">Configure your customer emails settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Admin Alerts</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Admin Alerts content */}
                <p className="nuvi-text-muted">Configure your admin alerts settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Email Templates</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Email Templates content */}
                <p className="nuvi-text-muted">Configure your email templates settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">SMS Settings</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add SMS Settings content */}
                <p className="nuvi-text-muted">Configure your sms settings settings here.</p>
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