'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Store } from '@prisma/client';
import { 
  Users, Shield, Activity, Lock,
  AlertCircle
} from 'lucide-react';

const tabs = [
  { id: 'staff' as const, label: 'Staff Members', icon: Users },
  { id: 'roles' as const, label: 'Roles & Permissions', icon: Shield },
  { id: 'activity' as const, label: 'Activity Log', icon: Activity },
  { id: 'security' as const, label: 'Security Settings', icon: Lock }
];

export function UsersFormV2({ store }: { store: Store }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveBar, setShowSaveBar] = useState(false);
  const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'activity' | 'security'>('staff');

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
        <h2 className="nuvi-page-title">Users & Permissions</h2>
        <p className="nuvi-page-description">
          Manage staff accounts and access permissions
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
        {activeTab === 'staff' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Staff Members</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Staff Members content */}
                <p className="nuvi-text-muted">Configure your staff members settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Roles & Permissions</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Roles & Permissions content */}
                <p className="nuvi-text-muted">Configure your roles & permissions settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Activity Log</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Activity Log content */}
                <p className="nuvi-text-muted">Configure your activity log settings here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Security Settings</h3>
              </div>
              <div className="nuvi-card-content">
                {/* TODO: Add Security Settings content */}
                <p className="nuvi-text-muted">Configure your security settings settings here.</p>
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