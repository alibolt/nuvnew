'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Users, Shield, Activity, Lock,
  Plus, Edit, Trash2, Mail,
  Calendar, Clock, CheckCircle, XCircle, 
  UserPlus, Eye, X, Settings, Key,
  UserCheck, UserX, Globe, Smartphone
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';

const tabs = [
  { id: 'staff' as const, label: 'Staff Members', icon: Users },
  { id: 'roles' as const, label: 'Roles & Permissions', icon: Shield },
  { id: 'activity' as const, label: 'Activity Log', icon: Activity },
  { id: 'security' as const, label: 'Security Settings', icon: Lock }
];

export function UsersFormV2({ store }: { store: Store & { staffMembers?: any[] } }) {
  const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'activity' | 'security'>('staff');
  
  const initialFormData = {
    // Staff Members
    staffMembers: store.staffMembers || [],
    
    // Roles & Permissions
    roles: [
      { 
        id: 1, 
        name: 'Owner', 
        description: 'Full access to all store features',
        permissions: ['all']
      },
      { 
        id: 2, 
        name: 'Manager', 
        description: 'Manage products, orders, and customers',
        permissions: ['products', 'orders', 'customers', 'analytics']
      },
      { 
        id: 3, 
        name: 'Staff', 
        description: 'View and process orders',
        permissions: ['orders', 'customers']
      }
    ],
    
    // Activity Log (will be populated from real activity data)
    activityLog: [],
    
    // Security Settings
    securitySettings: {
      requireTwoFactor: false,
      sessionTimeout: 60,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSymbols: false
      },
      allowedIpAddresses: [],
      restrictByLocation: false
    }
  };

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/staff"
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Users & Permissions"
          description="Manage staff accounts and access permissions"
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
            {activeTab === 'staff' && (
              <StaffTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'roles' && (
              <RolesTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'activity' && (
              <ActivityTab formData={formData} handleChange={handleChange} />
            )}
            {activeTab === 'security' && (
              <SecurityTab formData={formData} handleChange={handleChange} />
            )}
          </div>
        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}

// Staff Tab Component
function StaffTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Staff Members List */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <h3 className="nuvi-card-title">Staff Members</h3>
            <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
              <Plus className="h-4 w-4" />
              Invite Staff
            </button>
          </div>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {/* Store Owner */}
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-primary nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                  <Users className="h-5 w-5 nuvi-text-white" />
                </div>
                <div>
                  <h4 className="nuvi-font-medium">John Doe</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">john@example.com</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <span className="nuvi-badge nuvi-badge-success">Owner</span>
                <CheckCircle className="h-4 w-4 nuvi-text-success" />
              </div>
            </div>

            {/* Staff Member 1 */}
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-secondary nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                  <Users className="h-5 w-5 nuvi-text-white" />
                </div>
                <div>
                  <h4 className="nuvi-font-medium">Jane Smith</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">jane@example.com</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <span className="nuvi-badge nuvi-badge-primary">Manager</span>
                <CheckCircle className="h-4 w-4 nuvi-text-success" />
                <div className="nuvi-flex nuvi-gap-xs">
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Pending Invitation */}
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-border-dashed nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-w-10 nuvi-h-10 nuvi-bg-warning nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                  <Mail className="h-5 w-5 nuvi-text-white" />
                </div>
                <div>
                  <h4 className="nuvi-font-medium">mike@example.com</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">Invitation sent 2 days ago</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <span className="nuvi-badge nuvi-badge-warning">Pending</span>
                <Clock className="h-4 w-4 nuvi-text-warning" />
                <div className="nuvi-flex nuvi-gap-xs">
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                    Resend
                  </button>
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-error">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Staff Form */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Invite New Staff Member</h3>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
            <div>
              <label className="nuvi-label">Email Address</label>
              <input
                type="email"
                className="nuvi-input"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="nuvi-label">Role</label>
              <select className="nuvi-select">
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="nuvi-mt-md">
            <button className="nuvi-btn nuvi-btn-primary">
              <UserPlus className="h-4 w-4" />
              Send Invitation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Roles Tab Component  
function RolesTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Roles List */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <div>
              <h3 className="nuvi-card-title">Roles & Permissions</h3>
              <p className="nuvi-text-sm nuvi-text-muted">
                Manage user roles and their permissions
              </p>
            </div>
            <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
              <Plus className="h-4 w-4" />
              Create Role
            </button>
          </div>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {formData.roles.map((role: any) => (
              <div key={role.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                  <Shield className="h-5 w-5 nuvi-text-muted" />
                  <div>
                    <h4 className="nuvi-font-medium">{role.name}</h4>
                    <p className="nuvi-text-sm nuvi-text-muted">{role.description}</p>
                    <div className="nuvi-flex nuvi-gap-xs nuvi-mt-sm">
                      {role.permissions.map((permission: string) => (
                        <span key={permission} className="nuvi-badge nuvi-badge-secondary nuvi-badge-sm">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                    <Edit className="h-4 w-4" />
                  </button>
                  {role.name !== 'Owner' && (
                    <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Permissions Matrix</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Overview of permissions for each role
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-sm font-medium text-gray-700 pb-3">Permission</th>
                  <th className="text-center text-sm font-medium text-gray-700 pb-3">Owner</th>
                  <th className="text-center text-sm font-medium text-gray-700 pb-3">Manager</th>
                  <th className="text-center text-sm font-medium text-gray-700 pb-3">Staff</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Products', key: 'products' },
                  { name: 'Orders', key: 'orders' },
                  { name: 'Customers', key: 'customers' },
                  { name: 'Analytics', key: 'analytics' },
                  { name: 'Settings', key: 'settings' },
                  { name: 'Staff Management', key: 'staff' },
                  { name: 'Store Configuration', key: 'config' }
                ].map((permission) => (
                  <tr key={permission.key} className="border-b">
                    <td className="py-3">
                      <span className="nuvi-font-medium">{permission.name}</span>
                    </td>
                    <td className="py-3 text-center">
                      <CheckCircle className="h-4 w-4 nuvi-text-green-600 nuvi-mx-auto" />
                    </td>
                    <td className="py-3 text-center">
                      {['products', 'orders', 'customers', 'analytics'].includes(permission.key) ? (
                        <CheckCircle className="h-4 w-4 nuvi-text-green-600 nuvi-mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 nuvi-text-red-600 nuvi-mx-auto" />
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {['orders', 'customers'].includes(permission.key) ? (
                        <CheckCircle className="h-4 w-4 nuvi-text-green-600 nuvi-mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 nuvi-text-red-600 nuvi-mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Activity Log */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
            <div>
              <h3 className="nuvi-card-title">Activity Log</h3>
              <p className="nuvi-text-sm nuvi-text-muted">
                Track user actions and system events
              </p>
            </div>
            <div className="nuvi-flex nuvi-gap-sm">
              <select className="nuvi-select nuvi-select-sm">
                <option value="all">All Users</option>
                <option value="owner">Owner</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
              </select>
              <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                Export Log
              </button>
            </div>
          </div>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            {formData.activityLog.map((log: any) => (
              <div key={log.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                  <Activity className="h-5 w-5 nuvi-text-muted" />
                  <div>
                    <h4 className="nuvi-font-medium">{log.action}</h4>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      by {log.user} • {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                    <p className="nuvi-text-xs nuvi-text-muted">IP: {log.ip}</p>
                  </div>
                </div>
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Activity Statistics</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Overview of user activity for the last 30 days
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md">
            <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">324</div>
              <p className="nuvi-text-sm nuvi-text-muted">Total Actions</p>
            </div>
            <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">87</div>
              <p className="nuvi-text-sm nuvi-text-muted">Product Updates</p>
            </div>
            <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">156</div>
              <p className="nuvi-text-sm nuvi-text-muted">Order Actions</p>
            </div>
            <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">23</div>
              <p className="nuvi-text-sm nuvi-text-muted">Settings Changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Log Settings */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Log Settings</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Configure activity logging preferences
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Log user actions</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Track all user actions and changes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Log system events</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Track system events and errors
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div>
              <label className="nuvi-label">Log retention period</label>
              <select className="nuvi-select">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Tab Component
function SecurityTab({ formData, handleChange }: any) {
  return (
    <div className="nuvi-space-y-lg">
      {/* Two-Factor Authentication */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Two-Factor Authentication</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Add an extra layer of security to your account
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Require 2FA for all users</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Force all staff members to enable two-factor authentication
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.securitySettings.requireTwoFactor}
                  onChange={(e) => handleChange('securitySettings.requireTwoFactor', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
              <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                  <Smartphone className="h-5 w-5 nuvi-text-muted" />
                  <h4 className="nuvi-font-medium">Authenticator App</h4>
                </div>
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                  Use Google Authenticator or similar app
                </p>
                <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                  Setup
                </button>
              </div>
              <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                  <Mail className="h-5 w-5 nuvi-text-muted" />
                  <h4 className="nuvi-font-medium">Email Codes</h4>
                </div>
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mb-md">
                  Receive codes via email
                </p>
                <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Policy */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Password Policy</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Set password requirements for all users
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Minimum password length</label>
              <input
                type="number"
                className="nuvi-input"
                min="6"
                max="32"
                value={formData.securitySettings.passwordPolicy.minLength}
                onChange={(e) => handleChange('securitySettings.passwordPolicy.minLength', parseInt(e.target.value))}
              />
            </div>

            <div className="nuvi-space-y-md">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div>
                  <h4 className="nuvi-font-medium">Require uppercase letters</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Password must contain at least one uppercase letter
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.securitySettings.passwordPolicy.requireUppercase}
                    onChange={(e) => handleChange('securitySettings.passwordPolicy.requireUppercase', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                </label>
              </div>

              <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div>
                  <h4 className="nuvi-font-medium">Require numbers</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Password must contain at least one number
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.securitySettings.passwordPolicy.requireNumbers}
                    onChange={(e) => handleChange('securitySettings.passwordPolicy.requireNumbers', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                </label>
              </div>

              <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                <div>
                  <h4 className="nuvi-font-medium">Require special characters</h4>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Password must contain at least one special character
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.securitySettings.passwordPolicy.requireSymbols}
                    onChange={(e) => handleChange('securitySettings.passwordPolicy.requireSymbols', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session Management */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Session Management</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Control user session settings
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div>
              <label className="nuvi-label">Session timeout (minutes)</label>
              <input
                type="number"
                className="nuvi-input"
                min="15"
                max="480"
                value={formData.securitySettings.sessionTimeout}
                onChange={(e) => handleChange('securitySettings.sessionTimeout', parseInt(e.target.value))}
              />
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                Automatically log out users after this period of inactivity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* IP Restrictions */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">IP Restrictions</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Control access based on IP addresses
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-space-y-md">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div>
                <h4 className="nuvi-font-medium">Restrict by location</h4>
                <p className="nuvi-text-sm nuvi-text-muted">
                  Block access from certain countries or regions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.securitySettings.restrictByLocation}
                  onChange={(e) => handleChange('securitySettings.restrictByLocation', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
              </label>
            </div>

            <div>
              <label className="nuvi-label">Allowed IP addresses</label>
              <textarea
                className="nuvi-textarea"
                rows={3}
                placeholder="Enter IP addresses, one per line (e.g., 192.168.1.1)"
              ></textarea>
              <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">
                Leave empty to allow all IP addresses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="nuvi-card">
        <div className="nuvi-card-header">
          <h3 className="nuvi-card-title">Security Status</h3>
          <p className="nuvi-text-sm nuvi-text-muted">
            Overview of your current security settings
          </p>
        </div>
        <div className="nuvi-card-content">
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                <h4 className="nuvi-font-medium">Strong Password Policy</h4>
              </div>
              <p className="nuvi-text-sm nuvi-text-muted">
                Password requirements are configured
              </p>
            </div>
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                <XCircle className="h-5 w-5 nuvi-text-red-600" />
                <h4 className="nuvi-font-medium">Two-Factor Authentication</h4>
              </div>
              <p className="nuvi-text-sm nuvi-text-muted">
                2FA is not required for all users
              </p>
            </div>
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                <h4 className="nuvi-font-medium">Session Management</h4>
              </div>
              <p className="nuvi-text-sm nuvi-text-muted">
                Session timeout is configured
              </p>
            </div>
            <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-mb-sm">
                <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                <h4 className="nuvi-font-medium">Activity Logging</h4>
              </div>
              <p className="nuvi-text-sm nuvi-text-muted">
                All activities are being logged
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}