'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Send, X, Type, Clock, Users, Wand2, FileText, Loader2, Check, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
}

interface CampaignFormPanelProps {
  store: StoreData;
  campaignId?: string;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function CampaignFormPanel({ 
  store, 
  campaignId, 
  isEdit = false, 
  onSave, 
  onCancel 
}: CampaignFormPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  
  // Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [fromName, setFromName] = useState(store.name);
  const [fromEmail, setFromEmail] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [textContent, setTextContent] = useState('');
  const [audienceType, setAudienceType] = useState<'all' | 'segment' | 'custom'>('all');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduleDate, setScheduleDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled' | 'sent'>('draft');
  
  // Fetch newsletter subscribers count
  useEffect(() => {
    fetch(`/api/stores/${store.subdomain}/newsletter/subscribers/count`)
      .then(res => res.json())
      .then(data => setSubscribersCount(data.count || 0))
      .catch(err => console.error('Error fetching subscribers:', err));
  }, [store.subdomain]);
  
  // Fetch email templates
  useEffect(() => {
    setLoadingTemplates(true);
    fetch(`/api/stores/${store.subdomain}/email-templates?enabled=true`)
      .then(res => res.json())
      .then(data => {
        const activeTemplates = (data.templates || []).filter((t: any) => t.enabled);
        setTemplates(activeTemplates);
        setLoadingTemplates(false);
      })
      .catch(err => {
        console.error('Error fetching templates:', err);
        setLoadingTemplates(false);
      });
  }, [store.subdomain]);
  
  // Load template content when selected
  useEffect(() => {
    if (selectedTemplateId && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        setSubject(template.subject || subject);
        setHtmlContent(template.htmlContent || '');
        setTextContent(template.textContent || '');
      }
    }
  }, [selectedTemplateId, templates]);
  
  // Load campaign data if editing
  useEffect(() => {
    if (isEdit && campaignId) {
      loadCampaign();
    }
  }, [isEdit, campaignId, store.subdomain]);

  const loadCampaign = async () => {
    if (!campaignId) {
      console.error('No campaignId provided');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded campaign data:', data);
        const campaign = data.campaign;
        
        setName(campaign.name || '');
        setSubject(campaign.subject || '');
        setPreviewText(campaign.previewText || '');
        setFromName(campaign.fromName || store.name);
        setFromEmail(campaign.fromEmail || '');
        setReplyTo(campaign.replyTo || '');
        setHtmlContent(campaign.content?.html || '');
        setTextContent(campaign.content?.text || '');
        setAudienceType(campaign.audience?.type || 'all');
        setScheduleType(campaign.schedule?.type || 'immediate');
        setScheduleDate(campaign.schedule?.date || '');
        setStatus(campaign.status || 'draft');
      } else {
        console.error('Failed to load campaign, status:', response.status);
        const error = await response.text();
        console.error('Error response:', error);
        toast.error('Failed to load campaign');
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast.error('Failed to load campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    
    if (!subject.trim()) {
      toast.error('Please enter a subject line');
      return;
    }
    
    if (!fromEmail.trim()) {
      toast.error('Please enter a from email');
      return;
    }
    
    if (!htmlContent.trim()) {
      toast.error('Please enter email content');
      return;
    }

    setIsSaving(true);
    
    try {
      const payload = {
        type: 'email',
        name: name.trim(),
        subject: subject.trim(),
        previewText: previewText.trim(),
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
        replyTo: replyTo.trim() || fromEmail.trim(),
        content: {
          html: htmlContent,
          text: textContent
        },
        audience: {
          type: audienceType,
          segmentId: '',
          filters: []
        },
        schedule: {
          type: scheduleType,
          date: scheduleDate,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        status: testMode ? 'draft' : status
      };

      const url = isEdit 
        ? `/api/stores/${store.subdomain}/marketing/campaigns/${campaignId}`
        : `/api/stores/${store.subdomain}/marketing/campaigns`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        // If not test mode and schedule is immediate, send the campaign
        if (!testMode && !isEdit && scheduleType === 'immediate') {
          await fetch(`/api/stores/${store.subdomain}/marketing/campaigns/${data.campaign.id}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          toast.success('Campaign created and sent!');
        } else {
          toast.success(isEdit ? 'Campaign updated!' : 'Campaign created!');
        }
        
        onSave();
      } else {
        const error = await response.text();
        toast.error(`Failed to save campaign: ${error}`);
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save campaign');
    } finally {
      setIsSaving(false);
    }
  };

  const generateAIContent = async () => {
    toast.info('AI content generation coming soon!');
  };

  if (isLoading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-96">
        <div className="nuvi-btn-loading nuvi-mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">
              {isEdit ? 'Edit Campaign' : 'Create Email Campaign'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isEdit ? 'Update campaign details' : `Send targeted emails to ${subscribersCount} subscribers`}
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            type="button"
            onClick={onCancel}
            className="nuvi-btn nuvi-btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Send className="h-4 w-4" />
            {isSaving ? 'Saving...' : (isEdit ? 'Save Campaign' : (testMode ? 'Create Test' : 'Create & Send'))}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Campaign Details */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Campaign Details</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Campaign Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Holiday Sale Announcement"
                  className="nuvi-input"
                  required
                />
                <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-xs">
                  Internal name for your reference
                </p>
              </div>
              
              <div>
                <label className="nuvi-label">Subject Line</label>
                <div className="nuvi-relative">
                  <Type className="nuvi-absolute nuvi-left-3 nuvi-top-3 h-4 w-4 nuvi-text-muted" />
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., 🎉 Exclusive Holiday Sale - 30% Off Everything!"
                    className="nuvi-input nuvi-pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="nuvi-label">Preview Text</label>
                <input
                  type="text"
                  value={previewText}
                  onChange={(e) => setPreviewText(e.target.value)}
                  placeholder="This text appears in the inbox preview"
                  className="nuvi-input"
                />
              </div>

              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">From Name</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="nuvi-input"
                    required
                  />
                </div>
                <div>
                  <label className="nuvi-label">From Email</label>
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="hello@yourstore.com"
                    className="nuvi-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="nuvi-label">Reply-To Email</label>
                <input
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="Leave blank to use from email"
                  className="nuvi-input"
                />
              </div>
            </div>
          </div>

          {/* Email Template Selection */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                <h3 className="nuvi-card-title">Email Template</h3>
                <button
                  type="button"
                  onClick={() => {
                    // Navigate to Email Templates page
                    window.location.href = `/dashboard/stores/${store.subdomain}/marketing?tab=templates`;
                  }}
                  className="nuvi-text-sm nuvi-text-primary hover:nuvi-text-primary-dark nuvi-flex nuvi-items-center nuvi-gap-xs"
                >
                  <FileText className="h-4 w-4" />
                  Manage Templates
                </button>
              </div>
            </div>
            <div className="nuvi-card-content">
              <div>
                <label className="nuvi-label required">Select Email Template *</label>
                <p className="nuvi-text-xs nuvi-text-muted nuvi-mb-sm">Choose a pre-designed template for your campaign</p>
                
                {loadingTemplates ? (
                  <div className="nuvi-text-center nuvi-py-lg">
                    <Loader2 className="h-5 w-5 nuvi-animate-spin nuvi-mx-auto" />
                    <p className="nuvi-text-sm nuvi-text-muted nuvi-mt-sm">Loading templates...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="nuvi-text-center nuvi-py-lg nuvi-border-2 nuvi-border-dashed nuvi-border-gray-300 nuvi-rounded-lg nuvi-bg-gray-50">
                    <FileText className="h-10 w-10 nuvi-text-gray-400 nuvi-mx-auto nuvi-mb-sm" />
                    <p className="nuvi-font-medium nuvi-text-gray-700">No templates available</p>
                    <p className="nuvi-text-sm nuvi-text-gray-500 nuvi-mt-xs">
                      You need to create email templates before sending campaigns
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `/dashboard/stores/${store.subdomain}/marketing?tab=templates`;
                      }}
                      className="nuvi-mt-md nuvi-px-md nuvi-py-sm nuvi-bg-primary nuvi-text-white nuvi-rounded-lg hover:nuvi-bg-primary-dark nuvi-inline-flex nuvi-items-center nuvi-gap-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Template
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedTemplateId || ''}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="nuvi-select"
                    required
                  >
                    <option value="">Select a template...</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.type}
                      </option>
                    ))}
                  </select>
                )}
                
                {/* Show selected template info */}
                {selectedTemplateId && (
                  <div className="nuvi-mt-md nuvi-p-sm nuvi-bg-blue-50 nuvi-border nuvi-border-blue-200 nuvi-rounded">
                    <p className="nuvi-text-xs nuvi-text-blue-800">
                      <strong>Template loaded!</strong> The email content has been set from your selected template.
                    </p>
                  </div>
                )}
                
                {/* Preview Button */}
                {selectedTemplateId && htmlContent && (
                  <div className="nuvi-mt-md nuvi-flex nuvi-justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const previewWindow = window.open('', '_blank', 'width=600,height=800');
                        if (previewWindow) {
                          previewWindow.document.write(htmlContent);
                          previewWindow.document.close();
                        }
                      }}
                      className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
                    >
                      Preview Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Send Options */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Send Options</h3>
            </div>
            <div className="nuvi-card-content">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-md">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <div>
                  <span className="nuvi-font-medium">Test Mode</span>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    Send test email to your address only
                  </p>
                </div>
              </label>
              
              {testMode && (
                <div className="nuvi-p-md nuvi-bg-warning/10 nuvi-rounded-lg nuvi-text-sm">
                  Test mode is enabled. Campaign will be saved as draft and not sent to subscribers.
                </div>
              )}
            </div>
          </div>

          {/* Audience */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Audience</h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-sm">
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="all"
                    checked={audienceType === 'all'}
                    onChange={(e) => setAudienceType('all')}
                    className="nuvi-radio"
                  />
                  <div>
                    <p className="nuvi-font-medium">All subscribers</p>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Send to all {subscribersCount} active subscribers
                    </p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="segment"
                    checked={audienceType === 'segment'}
                    onChange={(e) => setAudienceType('segment')}
                    className="nuvi-radio"
                    disabled
                  />
                  <div className="nuvi-opacity-50">
                    <p className="nuvi-font-medium">Segment</p>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Target specific customer groups (Coming soon)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Schedule</h3>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-sm">
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="immediate"
                    checked={scheduleType === 'immediate'}
                    onChange={(e) => setScheduleType('immediate')}
                    className="nuvi-radio"
                    disabled={isEdit}
                  />
                  <div>
                    <p className="nuvi-font-medium">Send immediately</p>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Campaign will be sent right after creation
                    </p>
                  </div>
                </label>
                
                <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={scheduleType === 'scheduled'}
                    onChange={(e) => setScheduleType('scheduled')}
                    className="nuvi-radio"
                  />
                  <div>
                    <p className="nuvi-font-medium">Schedule for later</p>
                    <p className="nuvi-text-sm nuvi-text-muted">
                      Choose when to send the campaign
                    </p>
                  </div>
                </label>
              </div>

              {scheduleType === 'scheduled' && (
                <div className="nuvi-mt-md">
                  <input
                    type="datetime-local"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="nuvi-input"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Campaign Status (for edit mode) */}
          {isEdit && (
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Status</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <div className={`nuvi-badge ${
                    status === 'sent' ? 'nuvi-badge-success' :
                    status === 'scheduled' ? 'nuvi-badge-warning' :
                    'nuvi-badge-secondary'
                  }`}>
                    {status}
                  </div>
                  {status === 'sent' && (
                    <p className="nuvi-text-sm nuvi-text-muted">
                      This campaign has already been sent
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}