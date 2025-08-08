'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from 'next-auth';
import { 
  User, Mail, Store, Calendar, Shield, Bell, CreditCard, 
  Settings, Camera, Save, AlertCircle, CheckCircle, 
  Key, Globe, Trash2, Plus, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: Date;
  emailVerified: Date | null;
}

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  plan: string;
  status: string;
  createdAt: Date;
  _count: {
    products: number;
    orders: number;
    customers: number;
  };
}

interface DashboardSettingsContentProps {
  user: UserData;
  stores: StoreData[];
  session: Session;
}

export function DashboardSettingsContent({ user, stores, session }: DashboardSettingsContentProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'stores' | 'billing' | 'notifications'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name || '',
    email: user.email,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('An error occurred');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="nuvi-mb-lg">
        <h1 className="nuvi-text-3xl nuvi-font-bold nuvi-mb-sm">Account Settings</h1>
        <p className="nuvi-text-secondary">Manage your account settings and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="nuvi-flex nuvi-gap-lg">
        {/* Sidebar */}
        <div className="nuvi-w-64">
          <nav className="nuvi-space-y-sm">
            <button
              onClick={() => setActiveTab('profile')}
              className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-sm nuvi-rounded-md nuvi-transition ${
                activeTab === 'profile' 
                  ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                  : 'hover:nuvi-bg-muted'
              }`}
            >
              <User className="h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-sm nuvi-rounded-md nuvi-transition ${
                activeTab === 'security' 
                  ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                  : 'hover:nuvi-bg-muted'
              }`}
            >
              <Shield className="h-4 w-4" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-sm nuvi-rounded-md nuvi-transition ${
                activeTab === 'stores' 
                  ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                  : 'hover:nuvi-bg-muted'
              }`}
            >
              <Store className="h-4 w-4" />
              Stores
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-sm nuvi-rounded-md nuvi-transition ${
                activeTab === 'billing' 
                  ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                  : 'hover:nuvi-bg-muted'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`nuvi-w-full nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-px-md nuvi-py-sm nuvi-rounded-md nuvi-transition ${
                activeTab === 'notifications' 
                  ? 'nuvi-bg-primary/10 nuvi-text-primary' 
                  : 'hover:nuvi-bg-muted'
              }`}
            >
              <Bell className="h-4 w-4" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="nuvi-flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">Profile Information</h2>
              </div>
              <div className="nuvi-card-content">
                <form onSubmit={handleProfileUpdate} className="nuvi-space-y-md">
                  <div>
                    <label className="nuvi-label">Profile Picture</label>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                      <div className="nuvi-w-20 nuvi-h-20 nuvi-rounded-full nuvi-bg-muted nuvi-flex nuvi-items-center nuvi-justify-center nuvi-overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt="Profile" className="nuvi-w-full nuvi-h-full nuvi-object-cover" />
                        ) : (
                          <User className="h-8 w-8 nuvi-text-muted" />
                        )}
                      </div>
                      <button type="button" className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                        <Camera className="h-4 w-4" />
                        Change Photo
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label">Name</label>
                    <input
                      type="text"
                      className="nuvi-input"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="nuvi-label">Email</label>
                    <div className="nuvi-relative">
                      <input
                        type="email"
                        className="nuvi-input"
                        value={profileData.email}
                        disabled
                      />
                      {user.emailVerified && (
                        <div className="nuvi-absolute nuvi-right-3 nuvi-top-1/2 -nuvi-translate-y-1/2">
                          <CheckCircle className="h-4 w-4 nuvi-text-success" />
                        </div>
                      )}
                    </div>
                    {!user.emailVerified && (
                      <p className="nuvi-text-sm nuvi-text-warning nuvi-mt-xs">
                        Email not verified. <a href="#" className="nuvi-link">Verify now</a>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="nuvi-label">Member Since</label>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      <Calendar className="h-4 w-4 nuvi-inline nuvi-mr-xs" />
                      {new Date(user.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>

                  <div className="nuvi-pt-md">
                    <button type="submit" className="nuvi-btn nuvi-btn-primary" disabled={loading}>
                      <Save className="h-4 w-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="nuvi-space-y-lg">
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title">Password</h2>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                    Change your password to keep your account secure
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <Key className="h-4 w-4" />
                    Change Password
                  </button>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title">Two-Factor Authentication</h2>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                    Add an extra layer of security to your account
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <Shield className="h-4 w-4" />
                    Enable 2FA
                  </button>
                </div>
              </div>

              <div className="nuvi-card nuvi-border-error">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title nuvi-text-error">Danger Zone</h2>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="nuvi-btn nuvi-btn-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stores Tab */}
          {activeTab === 'stores' && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                  <h2 className="nuvi-card-title">Your Stores</h2>
                  <button 
                    onClick={() => router.push('/dashboard/stores/new')}
                    className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add Store
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  {stores.map((store) => (
                    <div key={store.id} className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                      <div className="nuvi-flex nuvi-justify-between nuvi-items-start">
                        <div>
                          <h3 className="nuvi-font-semibold nuvi-mb-sm">{store.name}</h3>
                          <div className="nuvi-space-y-xs nuvi-text-sm nuvi-text-muted">
                            <p>
                              <Globe className="h-4 w-4 nuvi-inline nuvi-mr-xs" />
                              {store.customDomain || `${store.subdomain}.usenuvi.com`}
                            </p>
                            <p>
                              Plan: <span className="nuvi-font-medium nuvi-text-primary">{store.plan}</span>
                            </p>
                            <p>
                              {store._count.products} products · {store._count.orders} orders · {store._count.customers} customers
                            </p>
                          </div>
                        </div>
                        <div className="nuvi-flex nuvi-gap-sm">
                          <button 
                            onClick={() => router.push(`/dashboard/stores/${store.subdomain}`)}
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
                          >
                            <Settings className="h-4 w-4" />
                            Manage
                          </button>
                          <button 
                            onClick={() => window.open(`/s/${store.subdomain}`, '_blank')}
                            className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {stores.length === 0 && (
                    <div className="nuvi-text-center nuvi-py-xl">
                      <Store className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                      <p className="nuvi-text-muted">You don't have any stores yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="nuvi-space-y-lg">
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title">Billing Information</h2>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                    Manage your billing information and subscriptions
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary">
                    <CreditCard className="h-4 w-4" />
                    Manage Billing
                  </button>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h2 className="nuvi-card-title">Invoices</h2>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-muted">
                    No invoices available yet
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h2 className="nuvi-card-title">Email Notifications</h2>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <label className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-font-medium">Order Updates</p>
                      <p className="nuvi-text-sm nuvi-text-muted">Get notified when you receive new orders</p>
                    </div>
                    <input type="checkbox" className="nuvi-toggle" defaultChecked />
                  </label>

                  <label className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-font-medium">Product Alerts</p>
                      <p className="nuvi-text-sm nuvi-text-muted">Low stock and product performance alerts</p>
                    </div>
                    <input type="checkbox" className="nuvi-toggle" defaultChecked />
                  </label>

                  <label className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-font-medium">Marketing Updates</p>
                      <p className="nuvi-text-sm nuvi-text-muted">Tips and updates from Nuvi</p>
                    </div>
                    <input type="checkbox" className="nuvi-toggle" />
                  </label>

                  <label className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-font-medium">Security Alerts</p>
                      <p className="nuvi-text-sm nuvi-text-muted">Important security notifications</p>
                    </div>
                    <input type="checkbox" className="nuvi-toggle" defaultChecked disabled />
                  </label>
                </div>

                <div className="nuvi-pt-md nuvi-mt-lg nuvi-border-t">
                  <button className="nuvi-btn nuvi-btn-primary">
                    <Save className="h-4 w-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}