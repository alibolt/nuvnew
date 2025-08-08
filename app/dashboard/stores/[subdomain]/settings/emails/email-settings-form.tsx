'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Mail, Settings, FileText, Send, Check,
  Info, ExternalLink, Server, Cloud, TestTube,
  Eye, EyeOff, Copy, ToggleLeft, ToggleRight, Edit,
  Code, Palette, Save, Undo, Plus
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';
import { EmailPackageManager } from './email-package-manager';

const tabs = [
  { id: 'package' as const, label: 'Email Package', icon: Mail },
  { id: 'provider' as const, label: 'Email Provider', icon: Settings },
  { id: 'settings' as const, label: 'Email Settings', icon: Settings },
  { id: 'templates' as const, label: 'Email Templates', icon: FileText },
  { id: 'test' as const, label: 'Test Email', icon: TestTube }
];

interface EmailSettings {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'ses';
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  
  sendgrid?: {
    apiKey: string;
  };
  
  mailgun?: {
    apiKey: string;
    domain: string;
  };
  
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  
  notifications: {
    orderConfirmation: boolean;
    orderShipped: boolean;
    orderCancelled: boolean;
    orderRefunded: boolean;
    customerWelcome: boolean;
    abandonedCart: boolean;
    lowStock: boolean;
  };
  
  templates: {
    orderConfirmation: {
      subject: string;
      enabled: boolean;
    };
    orderShipped: {
      subject: string;
      enabled: boolean;
    };
    customerWelcome: {
      subject: string;
      enabled: boolean;
    };
    abandonedCart: {
      subject: string;
      enabled: boolean;
      delayHours: number;
    };
  };
}

const initialFormData: EmailSettings = {
    provider: 'smtp',
    fromEmail: '',
    fromName: '',
    replyToEmail: '',
    
    smtp: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: '',
      },
    },
    
    sendgrid: {
      apiKey: '',
    },
    
    mailgun: {
      apiKey: '',
      domain: '',
    },
    
    ses: {
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1',
    },
    
    notifications: {
      orderConfirmation: true,
      orderShipped: true,
      orderCancelled: true,
      orderRefunded: true,
      customerWelcome: true,
      abandonedCart: false,
      lowStock: false,
    },
    
    templates: {
      orderConfirmation: {
        subject: 'Order Confirmation - #{{orderNumber}}',
        enabled: true,
      },
      orderShipped: {
        subject: 'Your order has been shipped - #{{orderNumber}}',
        enabled: true,
      },
      customerWelcome: {
        subject: 'Welcome to {{storeName}}!',
        enabled: true,
      },
      abandonedCart: {
        subject: 'You left something in your cart',
        enabled: false,
        delayHours: 24,
      },
    },
};

export function EmailSettingsForm({ store }: { store: Store & { storeSettings?: any } }) {
  const [testing, setTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'package' | 'provider' | 'settings' | 'templates' | 'test'>('package');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);


  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const handleTestEmail = async (formData: EmailSettings) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(`/api/stores/${store.subdomain}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          settings: formData
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({ success: true, message: 'Test email sent successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      setTestResult({ success: false, message: 'Network error occurred' });
    } finally {
      setTesting(false);
    }
  };

  const emailProviders = [
    { value: 'smtp', label: 'SMTP', icon: Server, description: 'Standard email protocol' },
    { value: 'sendgrid', label: 'SendGrid', icon: Cloud, description: 'Cloud email service' },
    { value: 'mailgun', label: 'Mailgun', icon: Cloud, description: 'Developer-friendly email' },
    { value: 'ses', label: 'Amazon SES', icon: Cloud, description: 'AWS email service' },
  ];

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint="/api/stores/{subdomain}/settings"
      transformDataForSave={(data) => ({ emailSettings: data })}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Email Settings"
          description="Configure email providers and notification settings"
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
        {activeTab === 'package' && (
          <EmailPackageManager subdomain={store.subdomain} />
        )}

        {activeTab === 'provider' && (
          <div className="nuvi-space-y-lg">
            {/* Provider Selection */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Email Provider</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                  {emailProviders.map((provider) => {
                    const Icon = provider.icon;
                    return (
                      <button
                        key={provider.value}
                        onClick={() => handleChange('provider', provider.value)}
                        className={`nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-text-left nuvi-transition ${
                          formData.provider === provider.value
                            ? 'nuvi-border-primary nuvi-bg-primary/10'
                            : 'nuvi-border-border hover:nuvi-border-primary'
                        }`}
                      >
                        <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                          <Icon className="h-6 w-6 nuvi-text-primary nuvi-mt-xs" />
                          <div>
                            <h4 className="nuvi-font-medium">{provider.label}</h4>
                            <p className="nuvi-text-sm nuvi-text-secondary">{provider.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Provider Configuration */}
            {formData.provider === 'smtp' && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">SMTP Configuration</h3>
                </div>
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                    <div>
                      <label className="nuvi-label" htmlFor="smtp-host">
                        SMTP Host
                      </label>
                      <input
                        id="smtp-host"
                        type="text"
                        value={formData.smtp?.host}
                        onChange={(e) => handleChange('smtp.host', e.target.value)}
                        className="nuvi-input"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label className="nuvi-label" htmlFor="smtp-port">
                        SMTP Port
                      </label>
                      <input
                        id="smtp-port"
                        type="number"
                        value={formData.smtp?.port}
                        onChange={(e) => handleChange('smtp.port', parseInt(e.target.value))}
                        className="nuvi-input"
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="smtp-user">
                      Username
                    </label>
                    <input
                      id="smtp-user"
                      type="text"
                      value={formData.smtp?.auth.user}
                      onChange={(e) => handleChange('smtp.auth.user', e.target.value)}
                      className="nuvi-input"
                      placeholder="your-email@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="smtp-pass">
                      Password
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="smtp-pass"
                        type={showSecrets['smtp-pass'] ? 'text' : 'password'}
                        value={formData.smtp?.auth.pass}
                        onChange={(e) => handleChange('smtp.auth.pass', e.target.value)}
                        className="nuvi-input nuvi-pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('smtp-pass')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['smtp-pass'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="nuvi-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.smtp?.secure}
                      onChange={(e) => handleChange('smtp.secure', e.target.checked)}
                      className="nuvi-checkbox"
                    />
                    <span>Use SSL/TLS (recommended for port 465)</span>
                  </label>
                </div>
              </div>
            )}

            {formData.provider === 'sendgrid' && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">SendGrid Configuration</h3>
                </div>
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your SendGrid API key to send emails.</p>
                      <a 
                        href="https://sendgrid.com/docs/ui/account-and-settings/api-keys/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-inline-flex nuvi-items-center nuvi-gap-xs nuvi-mt-xs"
                      >
                        Get your API key
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="sendgrid-api-key">
                      API Key
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="sendgrid-api-key"
                        type={showSecrets['sendgrid-key'] ? 'text' : 'password'}
                        value={formData.sendgrid?.apiKey}
                        onChange={(e) => handleChange('sendgrid.apiKey', e.target.value)}
                        className="nuvi-input nuvi-pr-12"
                        placeholder="SG.xxxxxxxxxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('sendgrid-key')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['sendgrid-key'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.provider === 'mailgun' && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Mailgun Configuration</h3>
                </div>
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your Mailgun settings to send emails.</p>
                      <a 
                        href="https://app.mailgun.com/app/account/security/api_keys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-inline-flex nuvi-items-center nuvi-gap-xs nuvi-mt-xs"
                      >
                        Mailgun Dashboard
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="mailgun-domain">
                      Domain
                    </label>
                    <input
                      id="mailgun-domain"
                      type="text"
                      value={formData.mailgun?.domain}
                      onChange={(e) => handleChange('mailgun.domain', e.target.value)}
                      className="nuvi-input"
                      placeholder="mg.yourdomain.com"
                    />
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="mailgun-api-key">
                      API Key
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="mailgun-api-key"
                        type={showSecrets['mailgun-key'] ? 'text' : 'password'}
                        value={formData.mailgun?.apiKey}
                        onChange={(e) => handleChange('mailgun.apiKey', e.target.value)}
                        className="nuvi-input nuvi-pr-12"
                        placeholder="key-xxxxxxxxxxxxxxxxxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('mailgun-key')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['mailgun-key'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.provider === 'ses' && (
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Amazon SES Configuration</h3>
                </div>
                <div className="nuvi-card-content nuvi-space-y-md">
                  <div className="nuvi-alert nuvi-alert-info nuvi-mb-md">
                    <Info className="h-4 w-4" />
                    <div>
                      <p>Configure your AWS SES credentials to send emails.</p>
                      <a 
                        href="https://console.aws.amazon.com/ses/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="nuvi-text-sm nuvi-text-primary hover:nuvi-underline nuvi-inline-flex nuvi-items-center nuvi-gap-xs nuvi-mt-xs"
                      >
                        AWS SES Console
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="ses-access-key">
                      Access Key ID
                    </label>
                    <input
                      id="ses-access-key"
                      type="text"
                      value={formData.ses?.accessKeyId}
                      onChange={(e) => handleChange('ses.accessKeyId', e.target.value)}
                      className="nuvi-input"
                      placeholder="AKIAXXXXXXXXXXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="ses-secret-key">
                      Secret Access Key
                    </label>
                    <div className="nuvi-relative">
                      <input
                        id="ses-secret-key"
                        type={showSecrets['ses-secret'] ? 'text' : 'password'}
                        value={formData.ses?.secretAccessKey}
                        onChange={(e) => handleChange('ses.secretAccessKey', e.target.value)}
                        className="nuvi-input nuvi-pr-12"
                        placeholder="••••••••••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecret('ses-secret')}
                        className="nuvi-absolute nuvi-right-md nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 nuvi-text-muted hover:nuvi-text-primary"
                      >
                        {showSecrets['ses-secret'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="ses-region">
                      AWS Region
                    </label>
                    <select
                      id="ses-region"
                      value={formData.ses?.region}
                      onChange={(e) => handleChange('ses.region', e.target.value)}
                      className="nuvi-select"
                    >
                      <option value="us-east-1">US East (N. Virginia)</option>
                      <option value="us-west-2">US West (Oregon)</option>
                      <option value="eu-west-1">EU (Ireland)</option>
                      <option value="eu-central-1">EU (Frankfurt)</option>
                      <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                      <option value="ap-northeast-1">Asia Pacific (Tokyo)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="nuvi-space-y-lg">
            {/* Sender Information */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Sender Information</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                  <div>
                    <label className="nuvi-label" htmlFor="from-name">
                      From Name
                    </label>
                    <input
                      id="from-name"
                      type="text"
                      value={formData.fromName}
                      onChange={(e) => handleChange('fromName', e.target.value)}
                      className="nuvi-input"
                      placeholder={store.name}
                    />
                  </div>

                  <div>
                    <label className="nuvi-label" htmlFor="from-email">
                      From Email
                    </label>
                    <input
                      id="from-email"
                      type="email"
                      value={formData.fromEmail}
                      onChange={(e) => handleChange('fromEmail', e.target.value)}
                      className="nuvi-input"
                      placeholder="noreply@yourdomain.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="nuvi-label" htmlFor="reply-to">
                    Reply-To Email
                  </label>
                  <input
                    id="reply-to"
                    type="email"
                    value={formData.replyToEmail}
                    onChange={(e) => handleChange('replyToEmail', e.target.value)}
                    className="nuvi-input"
                    placeholder="support@yourdomain.com"
                  />
                  <p className="nuvi-help-text">
                    Where customer replies should be sent (optional)
                  </p>
                </div>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Email Notifications</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <h4 className="nuvi-font-medium nuvi-mb-sm">Order Notifications</h4>
                
                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.orderConfirmation}
                    onChange={(e) => handleChange('notifications.orderConfirmation', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Order Confirmation</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Send confirmation email when order is placed
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.orderShipped}
                    onChange={(e) => handleChange('notifications.orderShipped', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Order Shipped</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Notify customer when order is shipped
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.orderCancelled}
                    onChange={(e) => handleChange('notifications.orderCancelled', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Order Cancelled</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Notify customer when order is cancelled
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.orderRefunded}
                    onChange={(e) => handleChange('notifications.orderRefunded', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Order Refunded</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Notify customer when refund is processed
                    </p>
                  </div>
                </label>

                <div className="nuvi-border-t nuvi-pt-md nuvi-mt-md">
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Customer Notifications</h4>
                </div>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.customerWelcome}
                    onChange={(e) => handleChange('notifications.customerWelcome', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Welcome Email</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Send welcome email to new customers
                    </p>
                  </div>
                </label>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.abandonedCart}
                    onChange={(e) => handleChange('notifications.abandonedCart', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Abandoned Cart Recovery</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Remind customers about items left in cart
                    </p>
                  </div>
                </label>

                <div className="nuvi-border-t nuvi-pt-md nuvi-mt-md">
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Admin Notifications</h4>
                </div>

                <label className="nuvi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.notifications.lowStock}
                    onChange={(e) => handleChange('notifications.lowStock', e.target.checked)}
                    className="nuvi-checkbox"
                  />
                  <div>
                    <span>Low Stock Alert</span>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Get notified when products are running low
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <h3 className="nuvi-card-title">Email Templates</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Customize email templates with full HTML/CSS editor
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm">
                    <Plus className="h-4 w-4" />
                    Create Template
                  </button>
                </div>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                {/* Template Editor Notice */}
                <div className="nuvi-alert nuvi-alert-success">
                  <Check className="h-4 w-4" />
                  <span>Full email template editor is now available! Customize subject lines, HTML content, and styling.</span>
                </div>

                {/* Order Confirmation */}
                <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-md">
                    <div>
                      <h4 className="nuvi-font-medium">Order Confirmation</h4>
                      <p className="nuvi-text-sm nuvi-text-secondary">Sent when customer places an order</p>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                        <Edit className="h-4 w-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleChange('templates.orderConfirmation.enabled', !formData.templates.orderConfirmation.enabled)}
                        className={`nuvi-toggle ${formData.templates.orderConfirmation.enabled ? 'nuvi-toggle-on' : ''}`}
                      >
                        {formData.templates.orderConfirmation.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formData.templates.orderConfirmation.enabled && (
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Subject Line</label>
                        <input
                          type="text"
                          value={formData.templates.orderConfirmation.subject}
                          onChange={(e) => handleChange('templates.orderConfirmation.subject', e.target.value)}
                          className="nuvi-input"
                        />
                        <p className="nuvi-help-text">
                          Available variables: {'{{orderNumber}}'}, {'{{storeName}}'}, {'{{customerName}}'}
                        </p>
                      </div>
                      
                      {/* Template Editor Tabs */}
                      <div className="nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-border-b nuvi-p-sm">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-bg-blue-50 nuvi-text-blue-700">
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                              <Code className="h-4 w-4" />
                              HTML
                            </button>
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                              <Palette className="h-4 w-4" />
                              Design
                            </button>
                          </div>
                        </div>
                        <div className="nuvi-p-md">
                          {/* Email Preview */}
                          <div className="nuvi-bg-gray-50 nuvi-p-md nuvi-rounded nuvi-border">
                            <div className="nuvi-bg-white nuvi-p-lg nuvi-rounded nuvi-shadow-sm">
                              <div className="nuvi-text-center nuvi-mb-lg">
                                <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary nuvi-mb-sm">
                                  Thank you for your order!
                                </div>
                                <div className="nuvi-text-lg nuvi-text-muted">
                                  Order #12345
                                </div>
                              </div>
                              <div className="nuvi-mb-lg">
                                <p className="nuvi-text-base nuvi-mb-md">Hi John Doe,</p>
                                <p className="nuvi-text-base nuvi-mb-md">
                                  Thank you for your order from My Store. We're getting your order ready and will let you know when it ships.
                                </p>
                              </div>
                              <div className="nuvi-border nuvi-rounded nuvi-p-md nuvi-mb-lg">
                                <div className="nuvi-font-medium nuvi-mb-sm">Order Summary</div>
                                <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                                  <span>Product Name</span>
                                  <span>$99.99</span>
                                </div>
                                <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                                  <span>Shipping</span>
                                  <span>$9.99</span>
                                </div>
                                <div className="nuvi-flex nuvi-justify-between nuvi-font-medium nuvi-text-lg nuvi-border-t nuvi-pt-xs">
                                  <span>Total</span>
                                  <span>$109.98</span>
                                </div>
                              </div>
                              <div className="nuvi-text-center">
                                <button className="nuvi-btn nuvi-btn-primary">
                                  Track Your Order
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Actions */}
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </button>
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Undo className="h-4 w-4" />
                          Reset to Default
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                          <Save className="h-4 w-4" />
                          Save Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Shipped */}
                <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-md">
                    <div>
                      <h4 className="nuvi-font-medium">Order Shipped</h4>
                      <p className="nuvi-text-sm nuvi-text-secondary">Sent when order is marked as shipped</p>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                        <Edit className="h-4 w-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleChange('templates.orderShipped.enabled', !formData.templates.orderShipped.enabled)}
                        className={`nuvi-toggle ${formData.templates.orderShipped.enabled ? 'nuvi-toggle-on' : ''}`}
                      >
                        {formData.templates.orderShipped.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formData.templates.orderShipped.enabled && (
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Subject Line</label>
                        <input
                          type="text"
                          value={formData.templates.orderShipped.subject}
                          onChange={(e) => handleChange('templates.orderShipped.subject', e.target.value)}
                          className="nuvi-input"
                        />
                        <p className="nuvi-help-text">
                          Available variables: {'{{orderNumber}}'}, {'{{trackingNumber}}'}, {'{{carrier}}'}
                        </p>
                      </div>
                      
                      {/* Template Editor */}
                      <div className="nuvi-border nuvi-rounded-lg">
                        <div className="nuvi-border-b nuvi-p-sm">
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm nuvi-bg-blue-50 nuvi-text-blue-700">
                              <Eye className="h-4 w-4" />
                              Preview
                            </button>
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                              <Code className="h-4 w-4" />
                              HTML
                            </button>
                            <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                              <Palette className="h-4 w-4" />
                              Design
                            </button>
                          </div>
                        </div>
                        <div className="nuvi-p-md">
                          <div className="nuvi-bg-gray-50 nuvi-p-md nuvi-rounded nuvi-border">
                            <div className="nuvi-bg-white nuvi-p-lg nuvi-rounded nuvi-shadow-sm">
                              <div className="nuvi-text-center nuvi-mb-lg">
                                <div className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary nuvi-mb-sm">
                                  Your order has shipped!
                                </div>
                                <div className="nuvi-text-lg nuvi-text-muted">
                                  Order #12345
                                </div>
                              </div>
                              <div className="nuvi-mb-lg">
                                <p className="nuvi-text-base nuvi-mb-md">Hi John Doe,</p>
                                <p className="nuvi-text-base nuvi-mb-md">
                                  Great news! Your order has shipped and is on its way to you.
                                </p>
                              </div>
                              <div className="nuvi-border nuvi-rounded nuvi-p-md nuvi-mb-lg">
                                <div className="nuvi-font-medium nuvi-mb-sm">Shipping Details</div>
                                <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                                  <span>Carrier</span>
                                  <span>UPS</span>
                                </div>
                                <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                                  <span>Tracking Number</span>
                                  <span>1Z999AA1234567890</span>
                                </div>
                                <div className="nuvi-flex nuvi-justify-between">
                                  <span>Estimated Delivery</span>
                                  <span>March 20, 2024</span>
                                </div>
                              </div>
                              <div className="nuvi-text-center">
                                <button className="nuvi-btn nuvi-btn-primary">
                                  Track Package
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </button>
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Undo className="h-4 w-4" />
                          Reset to Default
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                          <Save className="h-4 w-4" />
                          Save Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Welcome */}
                <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-md">
                    <div>
                      <h4 className="nuvi-font-medium">Customer Welcome</h4>
                      <p className="nuvi-text-sm nuvi-text-secondary">Sent when customer creates an account</p>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                        <Edit className="h-4 w-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleChange('templates.customerWelcome.enabled', !formData.templates.customerWelcome.enabled)}
                        className={`nuvi-toggle ${formData.templates.customerWelcome.enabled ? 'nuvi-toggle-on' : ''}`}
                      >
                        {formData.templates.customerWelcome.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formData.templates.customerWelcome.enabled && (
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Subject Line</label>
                        <input
                          type="text"
                          value={formData.templates.customerWelcome.subject}
                          onChange={(e) => handleChange('templates.customerWelcome.subject', e.target.value)}
                          className="nuvi-input"
                        />
                        <p className="nuvi-help-text">
                          Available variables: {'{{storeName}}'}, {'{{customerName}}'}
                        </p>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                          <Save className="h-4 w-4" />
                          Save Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Abandoned Cart */}
                <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                  <div className="nuvi-flex nuvi-items-start nuvi-justify-between nuvi-mb-md">
                    <div>
                      <h4 className="nuvi-font-medium">Abandoned Cart</h4>
                      <p className="nuvi-text-sm nuvi-text-secondary">Remind customers about items in cart</p>
                    </div>
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                      <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                        <Edit className="h-4 w-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleChange('templates.abandonedCart.enabled', !formData.templates.abandonedCart.enabled)}
                        className={`nuvi-toggle ${formData.templates.abandonedCart.enabled ? 'nuvi-toggle-on' : ''}`}
                      >
                        {formData.templates.abandonedCart.enabled ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {formData.templates.abandonedCart.enabled && (
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Subject Line</label>
                        <input
                          type="text"
                          value={formData.templates.abandonedCart.subject}
                          onChange={(e) => handleChange('templates.abandonedCart.subject', e.target.value)}
                          className="nuvi-input"
                        />
                        <p className="nuvi-help-text">
                          Available variables: {'{{customerName}}'}, {'{{cartValue}}'}, {'{{itemCount}}'}
                        </p>
                      </div>
                      <div>
                        <label className="nuvi-label nuvi-text-sm">Send After (hours)</label>
                        <input
                          type="number"
                          min="1"
                          max="168"
                          value={formData.templates.abandonedCart.delayHours}
                          onChange={(e) => handleChange('templates.abandonedCart.delayHours', parseInt(e.target.value))}
                          className="nuvi-input"
                        />
                        <p className="nuvi-help-text">
                          How many hours to wait before sending (1-168)
                        </p>
                      </div>
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <button className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm">
                          <Copy className="h-4 w-4" />
                          Copy Template
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
                          <Save className="h-4 w-4" />
                          Save Template
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Global Template Settings */}
                <div className="nuvi-card">
                  <div className="nuvi-card-header">
                    <h3 className="nuvi-card-title">Global Template Settings</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Configure global settings for all email templates
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-space-y-md">
                      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                        <div>
                          <label className="nuvi-label">Default font family</label>
                          <select className="nuvi-select">
                            <option value="inter">Inter (Default)</option>
                            <option value="arial">Arial</option>
                            <option value="helvetica">Helvetica</option>
                            <option value="georgia">Georgia</option>
                            <option value="times">Times New Roman</option>
                          </select>
                        </div>
                        <div>
                          <label className="nuvi-label">Primary brand color</label>
                          <input type="color" className="nuvi-input" defaultValue="#3b82f6" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="nuvi-label">Header logo URL</label>
                        <input 
                          type="url" 
                          className="nuvi-input" 
                          placeholder="https://yourstore.com/logo.png" 
                        />
                        <p className="nuvi-help-text">
                          Logo that appears at the top of all email templates
                        </p>
                      </div>
                      
                      <div>
                        <label className="nuvi-label">Footer text</label>
                        <textarea 
                          className="nuvi-input" 
                          rows={3}
                          placeholder="© 2024 Your Store Name. All rights reserved."
                        />
                        <p className="nuvi-help-text">
                          Text that appears at the bottom of all email templates
                        </p>
                      </div>
                      
                      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <div>
                          <h4 className="nuvi-font-medium">Include unsubscribe link</h4>
                          <p className="nuvi-text-sm nuvi-text-muted">
                            Automatically add unsubscribe link to all emails
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--nuvi-primary-light)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--nuvi-primary)]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="nuvi-space-y-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Test Email Configuration</h3>
              </div>
              <div className="nuvi-card-content nuvi-space-y-md">
                <div className="nuvi-alert nuvi-alert-info">
                  <Info className="h-4 w-4" />
                  <span>Send a test email to verify your configuration is working correctly.</span>
                </div>

                <div>
                  <label className="nuvi-label" htmlFor="test-email">
                    Test Email Address
                  </label>
                  <input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="nuvi-input"
                    placeholder="test@example.com"
                  />
                </div>

                <button
                  onClick={() => handleTestEmail(formData)}
                  disabled={testing || !testEmail}
                  className="nuvi-btn nuvi-btn-primary"
                >
                  <Send className="h-4 w-4" />
                  {testing ? 'Sending...' : 'Send Test Email'}
                </button>

                {testResult && (
                  <div className={`nuvi-alert ${testResult.success ? 'nuvi-alert-success' : 'nuvi-alert-error'}`}>
                    {testResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}

                <div className="nuvi-border-t nuvi-pt-md">
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Configuration Summary</h4>
                  <div className="nuvi-space-y-sm nuvi-text-sm">
                    <div className="nuvi-flex nuvi-justify-between">
                      <span className="nuvi-text-secondary">Provider:</span>
                      <span className="nuvi-font-medium">{formData.provider.toUpperCase()}</span>
                    </div>
                    <div className="nuvi-flex nuvi-justify-between">
                      <span className="nuvi-text-secondary">From:</span>
                      <span className="nuvi-font-medium">{formData.fromName} &lt;{formData.fromEmail || 'not set'}&gt;</span>
                    </div>
                    {formData.replyToEmail && (
                      <div className="nuvi-flex nuvi-justify-between">
                        <span className="nuvi-text-secondary">Reply-To:</span>
                        <span className="nuvi-font-medium">{formData.replyToEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

        </SettingsPageLayout>
      )}
    </SettingsFormWrapper>
  );
}