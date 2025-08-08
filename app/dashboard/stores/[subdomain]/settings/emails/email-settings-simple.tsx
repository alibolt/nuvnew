'use client';

import { useState } from 'react';
import type { Store } from '@prisma/client';
import { 
  Mail, Settings, Send, TestTube, 
  Check, X, Info, Loader2, AlertCircle
} from 'lucide-react';
import { SettingsPageLayout } from '@/components/dashboard/settings/SettingsPageLayout';
import { SettingsFormWrapper } from '@/components/dashboard/settings/SettingsFormWrapper';
import { toast } from 'sonner';

const tabs = [
  { id: 'settings' as const, label: 'Email Settings', icon: Settings },
  { id: 'test' as const, label: 'Test Email', icon: TestTube }
];

const initialFormData = {
  fromEmail: '',
  fromName: '',
  replyToEmail: ''
};

export function EmailSettingsSimple({ store }: { store: Store }) {
  const [activeTab, setActiveTab] = useState<'settings' | 'test'>('settings');
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingTest(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/email/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail })
      });

      if (response.ok) {
        toast.success('Test email sent successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <SettingsFormWrapper
      store={store}
      initialData={initialFormData}
      apiEndpoint={`/api/stores/${store.subdomain}/email/settings`}
    >
      {({ formData, handleChange, loading }) => (
        <SettingsPageLayout
          title="Email Settings"
          description="Configure email settings and notifications"
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
            {activeTab === 'settings' && (
              <div className="nuvi-space-y-lg">
                {/* Provider Info */}
                <div className="nuvi-card nuvi-border-green-200 nuvi-bg-green-50">
                  <div className="nuvi-card-content">
                    <div className="nuvi-flex nuvi-gap-md">
                      <Check className="h-5 w-5 nuvi-text-green-600 nuvi-flex-shrink-0 nuvi-mt-xs" />
                      <div>
                        <h3 className="nuvi-font-semibold nuvi-text-green-900 nuvi-mb-sm">Email Service Ready</h3>
                        <p className="nuvi-text-sm nuvi-text-green-800">
                          Your store is configured to send emails automatically. 
                          No additional setup required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sender Settings */}
                <div className="nuvi-card">
                  <div className="nuvi-card-header">
                    <h3 className="nuvi-card-title">Sender Information</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Configure how your emails appear to recipients
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-space-y-md">
                      <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                        <div>
                          <label className="nuvi-label nuvi-required">
                            From Name
                          </label>
                          <input
                            type="text"
                            className="nuvi-input"
                            placeholder="Your Store Name"
                            value={formData.fromName}
                            onChange={(e) => handleChange('fromName', e.target.value)}
                            required
                          />
                          <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                            The name recipients will see
                          </p>
                        </div>
                        <div>
                          <label className="nuvi-label nuvi-required">
                            From Email
                          </label>
                          <input
                            type="email"
                            className="nuvi-input"
                            placeholder="noreply@yourstore.com"
                            value={formData.fromEmail}
                            onChange={(e) => handleChange('fromEmail', e.target.value)}
                            required
                          />
                          <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                            Must be a verified domain
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="nuvi-label">
                          Reply-To Email
                        </label>
                        <input
                          type="email"
                          className="nuvi-input"
                          placeholder="support@yourstore.com"
                          value={formData.replyToEmail}
                          onChange={(e) => handleChange('replyToEmail', e.target.value)}
                        />
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                          Where customer replies will be sent (optional)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Limits Info */}
                <div className="nuvi-card">
                  <div className="nuvi-card-header">
                    <h3 className="nuvi-card-title">Email Limits</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Your current email usage and limits
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-grid nuvi-grid-cols-3 nuvi-gap-md">
                      <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">0</p>
                        <p className="nuvi-text-sm nuvi-text-muted">Sent Today</p>
                      </div>
                      <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">1,000</p>
                        <p className="nuvi-text-sm nuvi-text-muted">Daily Limit</p>
                      </div>
                      <div className="nuvi-text-center nuvi-p-md nuvi-border nuvi-rounded-lg">
                        <p className="nuvi-text-2xl nuvi-font-bold nuvi-text-primary">10,000</p>
                        <p className="nuvi-text-sm nuvi-text-muted">Monthly Limit</p>
                      </div>
                    </div>
                    <div className="nuvi-mt-md nuvi-p-md nuvi-bg-blue-50 nuvi-rounded-lg">
                      <div className="nuvi-flex nuvi-gap-sm">
                        <Info className="h-4 w-4 nuvi-text-blue-600 nuvi-flex-shrink-0 nuvi-mt-xs" />
                        <p className="nuvi-text-sm nuvi-text-blue-800">
                          Need more emails? Contact support to upgrade your email package.
                        </p>
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
                    <h3 className="nuvi-card-title">Send Test Email</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Test your email configuration by sending a test email
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-space-y-md">
                      <div>
                        <label className="nuvi-label">
                          <Mail className="h-4 w-4" />
                          Test Email Address
                        </label>
                        <input
                          type="email"
                          className="nuvi-input"
                          placeholder="test@example.com"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                        />
                        <p className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                          We'll send a test email to this address
                        </p>
                      </div>

                      <button
                        onClick={handleSendTestEmail}
                        disabled={sendingTest || !testEmail}
                        className="nuvi-btn nuvi-btn-primary"
                      >
                        {sendingTest ? (
                          <>
                            <Loader2 className="h-4 w-4 nuvi-animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Test Email
                          </>
                        )}
                      </button>

                      <div className="nuvi-p-md nuvi-bg-gray-50 nuvi-rounded-lg">
                        <h4 className="nuvi-font-medium nuvi-mb-sm">Test Email Contents:</h4>
                        <ul className="nuvi-space-y-xs nuvi-text-sm nuvi-text-muted">
                          <li>• Sender information verification</li>
                          <li>• Email formatting test</li>
                          <li>• Delivery confirmation</li>
                          <li>• Basic template rendering</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Preview */}
                <div className="nuvi-card">
                  <div className="nuvi-card-header">
                    <h3 className="nuvi-card-title">Email Preview</h3>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      This is how your emails will appear to customers
                    </p>
                  </div>
                  <div className="nuvi-card-content">
                    <div className="nuvi-border nuvi-rounded-lg nuvi-p-md nuvi-bg-gray-50">
                      <div className="nuvi-mb-md nuvi-pb-md nuvi-border-b">
                        <p className="nuvi-text-sm"><strong>From:</strong> {formData.fromName || 'Your Store'} &lt;{formData.fromEmail || 'noreply@store.com'}&gt;</p>
                        <p className="nuvi-text-sm"><strong>Reply-To:</strong> {formData.replyToEmail || formData.fromEmail || 'support@store.com'}</p>
                        <p className="nuvi-text-sm"><strong>Subject:</strong> Test Email from Nuvi</p>
                      </div>
                      <div className="nuvi-text-sm">
                        <p className="nuvi-mb-md">Hi there,</p>
                        <p className="nuvi-mb-md">This is a test email from your Nuvi store to verify that email sending is working correctly.</p>
                        <p className="nuvi-mb-md">If you received this email, your email configuration is working properly!</p>
                        <p>Best regards,<br/>{formData.fromName || 'Your Store Team'}</p>
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