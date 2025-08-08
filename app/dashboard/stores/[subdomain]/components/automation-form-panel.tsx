'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Plus, X, Trash2, ShoppingCart, Mail, 
  Clock, Users, Zap, Send, Tag, Webhook, Timer, ChevronDown,
  ChevronUp, Move, Copy, Settings, Info, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
}

interface AutomationFormPanelProps {
  store: StoreData;
  automationId?: string;
  template?: string | null;
  isEdit?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'delay';
  config: any;
}

const TRIGGER_TYPES = [
  { value: 'abandoned_cart', label: 'Abandoned Cart', icon: ShoppingCart },
  { value: 'welcome_new_customer', label: 'New Customer Sign Up', icon: Users },
  { value: 'post_purchase', label: 'Order Placed', icon: Mail },
  { value: 'win_back', label: 'Win Back Inactive Customers', icon: Clock },
  { value: 'birthday', label: 'Customer Birthday', icon: Mail },
];

const ACTION_TYPES = [
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'send_sms', label: 'Send SMS', icon: Send },
  { value: 'add_tag', label: 'Add Customer Tag', icon: Tag },
  { value: 'create_discount', label: 'Create Discount Code', icon: Tag },
  { value: 'webhook', label: 'Send Webhook', icon: Webhook },
];

export function AutomationFormPanel({ 
  store, 
  automationId, 
  template,
  isEdit = false, 
  onSave, 
  onCancel 
}: AutomationFormPanelProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  
  // Initialize with template
  useEffect(() => {
    if (template && !isEdit) {
      initializeFromTemplate(template);
    }
  }, [template, isEdit]);
  
  // Load automation data if editing
  useEffect(() => {
    if (isEdit && automationId) {
      loadAutomation();
    }
  }, [isEdit, automationId, store.subdomain]);

  const initializeFromTemplate = (templateType: string) => {
    switch (templateType) {
      case 'abandoned-cart':
        setName('Abandoned Cart Recovery');
        setDescription('Send reminders to customers who left items in their cart');
        setWorkflow([
          {
            id: 'trigger-1',
            type: 'trigger',
            config: {
              type: 'abandoned_cart',
              delay: { value: 1, unit: 'hours' }
            }
          },
          {
            id: 'action-1',
            type: 'action',
            config: {
              type: 'send_email',
              subject: 'You left something in your cart!',
              emailTemplate: 'abandoned-cart-reminder',
              fromEmail: 'noreply@' + store.subdomain + '.com',
              fromName: store.name
            }
          },
          {
            id: 'delay-1',
            type: 'delay',
            config: {
              value: 24,
              unit: 'hours'
            }
          },
          {
            id: 'action-2',
            type: 'action',
            config: {
              type: 'send_email',
              subject: 'Still thinking about it? Here\'s 10% off',
              emailTemplate: 'abandoned-cart-discount',
              fromEmail: 'noreply@' + store.subdomain + '.com',
              fromName: store.name
            }
          }
        ]);
        break;
        
      case 'welcome-series':
        setName('Welcome Series');
        setDescription('Welcome new customers with a series of emails');
        setWorkflow([
          {
            id: 'trigger-1',
            type: 'trigger',
            config: {
              type: 'welcome_new_customer'
            }
          },
          {
            id: 'action-1',
            type: 'action',
            config: {
              type: 'send_email',
              subject: 'Welcome to ' + store.name + '!',
              emailTemplate: 'welcome-email-1',
              fromEmail: 'noreply@' + store.subdomain + '.com',
              fromName: store.name
            }
          },
          {
            id: 'delay-1',
            type: 'delay',
            config: {
              value: 3,
              unit: 'days'
            }
          },
          {
            id: 'action-2',
            type: 'action',
            config: {
              type: 'send_email',
              subject: 'Get to know us better',
              emailTemplate: 'welcome-email-2',
              fromEmail: 'noreply@' + store.subdomain + '.com',
              fromName: store.name
            }
          },
          {
            id: 'delay-2',
            type: 'delay',
            config: {
              value: 7,
              unit: 'days'
            }
          },
          {
            id: 'action-3',
            type: 'action',
            config: {
              type: 'send_email',
              subject: 'Here\'s a special gift for you',
              emailTemplate: 'welcome-email-3-discount',
              fromEmail: 'noreply@' + store.subdomain + '.com',
              fromName: store.name
            }
          }
        ]);
        break;
        
      case 'custom':
      default:
        setName('Custom Automation');
        setDescription('');
        setWorkflow([
          {
            id: 'trigger-1',
            type: 'trigger',
            config: {
              type: 'abandoned_cart'
            }
          }
        ]);
        break;
    }
  };

  const loadAutomation = async () => {
    if (!automationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stores/${store.subdomain}/marketing/automations/${automationId}`);
      if (response.ok) {
        const data = await response.json();
        const automation = data.automation;
        
        setName(automation.name || '');
        setDescription(automation.description || '');
        setEnabled(automation.enabled !== false);
        
        // Convert the automation data to workflow steps
        const steps: WorkflowStep[] = [];
        
        // Add trigger
        if (automation.trigger) {
          steps.push({
            id: 'trigger-1',
            type: 'trigger',
            config: automation.trigger
          });
        }
        
        // Add actions
        if (automation.actions) {
          automation.actions.forEach((action: any, index: number) => {
            steps.push({
              id: `action-${index + 1}`,
              type: 'action',
              config: action
            });
          });
        }
        
        setWorkflow(steps);
      } else {
        toast.error('Failed to load automation');
      }
    } catch (error) {
      console.error('Error loading automation:', error);
      toast.error('Failed to load automation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter an automation name');
      return;
    }
    
    if (workflow.length === 0 || workflow[0].type !== 'trigger') {
      toast.error('Automation must start with a trigger');
      return;
    }
    
    const hasActions = workflow.some(step => step.type === 'action');
    if (!hasActions) {
      toast.error('Automation must have at least one action');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Extract trigger and actions from workflow
      const trigger = workflow.find(step => step.type === 'trigger')?.config;
      
      // Convert workflow steps to actions (including delays as actions)
      const actions = workflow
        .filter(step => step.type === 'action' || step.type === 'delay')
        .map(step => {
          if (step.type === 'delay') {
            // Convert delay to a delay action
            return {
              type: 'delay',
              config: {
                ...step.config
              }
            };
          }
          // For regular actions, ensure config is properly structured
          const { type, ...configWithoutType } = step.config;
          return {
            type: type,
            config: configWithoutType
          };
        });
      
      const payload = {
        name: name.trim(),
        description: description.trim(),
        enabled,
        trigger,
        actions
      };
      
      const url = isEdit 
        ? `/api/stores/${store.subdomain}/marketing/automations/${automationId}`
        : `/api/stores/${store.subdomain}/marketing/automations`;
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(isEdit ? 'Automation updated!' : 'Automation created!');
        onSave();
      } else {
        const error = await response.text();
        toast.error(`Failed to save automation: ${error}`);
      }
    } catch (error) {
      console.error('Error saving automation:', error);
      toast.error('Failed to save automation');
    } finally {
      setIsSaving(false);
    }
  };

  const addStep = (type: 'action' | 'delay', afterId?: string) => {
    const newStep: WorkflowStep = {
      id: `${type}-${Date.now()}`,
      type,
      config: type === 'delay' 
        ? { value: 1, unit: 'hours' }
        : { 
            type: 'send_email',
            subject: '',
            emailTemplate: '',
            fromEmail: 'noreply@' + store.subdomain + '.com',
            fromName: store.name
          }
    };
    
    if (afterId) {
      const index = workflow.findIndex(step => step.id === afterId);
      const newWorkflow = [...workflow];
      newWorkflow.splice(index + 1, 0, newStep);
      setWorkflow(newWorkflow);
    } else {
      setWorkflow([...workflow, newStep]);
    }
  };

  const updateStep = (stepId: string, config: any) => {
    setWorkflow(workflow.map(step => 
      step.id === stepId ? { ...step, config } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setWorkflow(workflow.filter(step => step.id !== stepId));
  };

  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = workflow.findIndex(step => step.id === stepId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 1) { // Can't move above trigger
      const newWorkflow = [...workflow];
      [newWorkflow[index - 1], newWorkflow[index]] = [newWorkflow[index], newWorkflow[index - 1]];
      setWorkflow(newWorkflow);
    } else if (direction === 'down' && index < workflow.length - 1) {
      const newWorkflow = [...workflow];
      [newWorkflow[index], newWorkflow[index + 1]] = [newWorkflow[index + 1], newWorkflow[index]];
      setWorkflow(newWorkflow);
    }
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
              {isEdit ? 'Edit Automation' : 'Create Automation'}
            </h2>
            <p className="nuvi-text-secondary nuvi-text-sm">
              {isEdit ? 'Update your marketing automation' : 'Set up automated marketing workflows'}
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
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Automation')}
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
        {/* Main Content - Workflow Builder */}
        <div className="nuvi-lg:col-span-2 nuvi-space-y-lg">
          {/* Basic Information */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Automation Details</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-md">
              <div>
                <label className="nuvi-label">Automation Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Welcome Email Series"
                  className="nuvi-input"
                  required
                />
              </div>
              
              <div>
                <label className="nuvi-label">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this automation does"
                  className="nuvi-textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Workflow Builder */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Workflow</h3>
              <p className="nuvi-text-sm nuvi-text-muted">Build your automation step by step</p>
            </div>
            <div className="nuvi-card-content">
              <div className="nuvi-space-y-md">
                {workflow.map((step, index) => (
                  <WorkflowStepComponent
                    key={step.id}
                    step={step}
                    index={index}
                    isFirst={index === 0}
                    isLast={index === workflow.length - 1}
                    onUpdate={(config) => updateStep(step.id, config)}
                    onRemove={() => removeStep(step.id)}
                    onMove={(direction) => moveStep(step.id, direction)}
                    onAddAfter={() => addStep('action', step.id)}
                  />
                ))}
                
                {workflow.length === 0 && (
                  <div className="nuvi-text-center nuvi-py-lg nuvi-border nuvi-border-dashed nuvi-rounded-lg">
                    <Zap className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <p className="nuvi-text-muted nuvi-mb-md">Start by adding a trigger</p>
                    <button
                      type="button"
                      onClick={() => addStep('action')}
                      className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Trigger
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="nuvi-space-y-lg">
          {/* Status */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Status</h3>
            </div>
            <div className="nuvi-card-content">
              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="nuvi-checkbox"
                />
                <div>
                  <span className="nuvi-font-medium">Enable automation</span>
                  <p className="nuvi-text-sm nuvi-text-muted">
                    {enabled ? 'Automation will run automatically' : 'Automation is paused'}
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Help */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Quick Tips</h3>
            </div>
            <div className="nuvi-card-content nuvi-space-y-sm">
              <div className="nuvi-flex nuvi-gap-sm">
                <Info className="h-4 w-4 nuvi-text-primary nuvi-mt-1" />
                <p className="nuvi-text-sm">
                  Start with a trigger that defines when the automation should run
                </p>
              </div>
              <div className="nuvi-flex nuvi-gap-sm">
                <Info className="h-4 w-4 nuvi-text-primary nuvi-mt-1" />
                <p className="nuvi-text-sm">
                  Add delays between actions to avoid overwhelming customers
                </p>
              </div>
              <div className="nuvi-flex nuvi-gap-sm">
                <Info className="h-4 w-4 nuvi-text-primary nuvi-mt-1" />
                <p className="nuvi-text-sm">
                  Test your automation with a small group before enabling it for all customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// Workflow Step Component
function WorkflowStepComponent({ 
  step, 
  index, 
  isFirst, 
  isLast, 
  onUpdate, 
  onRemove, 
  onMove, 
  onAddAfter 
}: {
  step: WorkflowStep;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (config: any) => void;
  onRemove: () => void;
  onMove: (direction: 'up' | 'down') => void;
  onAddAfter: () => void;
}) {
  const [expanded, setExpanded] = useState(true);

  const getStepIcon = () => {
    if (step.type === 'trigger') {
      const triggerType = TRIGGER_TYPES.find(t => t.value === step.config.type);
      return triggerType?.icon || Zap;
    } else if (step.type === 'action') {
      const actionType = ACTION_TYPES.find(a => a.value === step.config.type);
      return actionType?.icon || Zap;
    } else if (step.type === 'delay') {
      return Timer;
    }
    return Zap;
  };

  const getStepTitle = () => {
    if (step.type === 'trigger') {
      const triggerType = TRIGGER_TYPES.find(t => t.value === step.config.type);
      return triggerType?.label || 'Trigger';
    } else if (step.type === 'action') {
      const actionType = ACTION_TYPES.find(a => a.value === step.config.type);
      return actionType?.label || 'Action';
    } else if (step.type === 'delay') {
      return `Wait ${step.config.value} ${step.config.unit}`;
    }
    return 'Step';
  };

  const Icon = getStepIcon();

  return (
    <div>
      <div className="nuvi-border nuvi-rounded-lg nuvi-p-md">
        <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
            <Icon className="h-5 w-5 nuvi-text-primary" />
            <h4 className="nuvi-font-medium">{getStepTitle()}</h4>
            {step.type === 'trigger' && (
              <span className="nuvi-badge nuvi-badge-primary nuvi-badge-sm">Trigger</span>
            )}
          </div>
          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
            {!isFirst && (
              <button
                type="button"
                onClick={() => onMove('up')}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={() => onMove('down')}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
            {step.type !== 'trigger' && (
              <button
                type="button"
                onClick={onRemove}
                className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="nuvi-space-y-md">
            {step.type === 'trigger' && (
              <div>
                <label className="nuvi-label">Trigger Type</label>
                <select
                  value={step.config.type}
                  onChange={(e) => onUpdate({ ...step.config, type: e.target.value })}
                  className="nuvi-select"
                >
                  {TRIGGER_TYPES.map(trigger => (
                    <option key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step.type === 'action' && (
              <>
                <div>
                  <label className="nuvi-label">Action Type</label>
                  <select
                    value={step.config.type}
                    onChange={(e) => onUpdate({ ...step.config, type: e.target.value })}
                    className="nuvi-select"
                  >
                    {ACTION_TYPES.map(action => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
                  </select>
                </div>

                {step.config.type === 'send_email' && (
                  <>
                    <div>
                      <label className="nuvi-label">Email Subject</label>
                      <input
                        type="text"
                        value={step.config.subject || ''}
                        onChange={(e) => onUpdate({ ...step.config, subject: e.target.value })}
                        placeholder="Enter email subject"
                        className="nuvi-input"
                      />
                    </div>
                    <div>
                      <label className="nuvi-label">Email Template</label>
                      <select
                        value={step.config.emailTemplate || ''}
                        onChange={(e) => onUpdate({ ...step.config, emailTemplate: e.target.value })}
                        className="nuvi-select"
                      >
                        <option value="">Select a template</option>
                        <option value="abandoned-cart-reminder">Abandoned Cart Reminder</option>
                        <option value="welcome-email-1">Welcome Email 1</option>
                        <option value="welcome-email-2">Welcome Email 2</option>
                        <option value="custom">Custom HTML</option>
                      </select>
                    </div>
                    <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                      <div>
                        <label className="nuvi-label">From Name</label>
                        <input
                          type="text"
                          value={step.config.fromName || ''}
                          onChange={(e) => onUpdate({ ...step.config, fromName: e.target.value })}
                          placeholder="Your Store Name"
                          className="nuvi-input"
                        />
                      </div>
                      <div>
                        <label className="nuvi-label">From Email</label>
                        <input
                          type="email"
                          value={step.config.fromEmail || ''}
                          onChange={(e) => onUpdate({ ...step.config, fromEmail: e.target.value })}
                          placeholder="noreply@example.com"
                          className="nuvi-input"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step.config.type === 'add_tag' && (
                  <div>
                    <label className="nuvi-label">Tag Name</label>
                    <input
                      type="text"
                      value={step.config.tagName || ''}
                      onChange={(e) => onUpdate({ ...step.config, tagName: e.target.value })}
                      placeholder="e.g., vip-customer"
                      className="nuvi-input"
                    />
                  </div>
                )}
              </>
            )}

            {step.type === 'delay' && (
              <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                <div>
                  <label className="nuvi-label">Duration</label>
                  <input
                    type="number"
                    value={step.config.value}
                    onChange={(e) => onUpdate({ ...step.config, value: parseInt(e.target.value) })}
                    min="1"
                    className="nuvi-input"
                  />
                </div>
                <div>
                  <label className="nuvi-label">Unit</label>
                  <select
                    value={step.config.unit}
                    onChange={(e) => onUpdate({ ...step.config, unit: e.target.value })}
                    className="nuvi-select"
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Step Button */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-my-md">
        <div className="nuvi-relative">
          <div className="nuvi-absolute nuvi-inset-x-0 nuvi-top-1/2 -nuvi-translate-y-1/2 nuvi-h-px nuvi-bg-border"></div>
          <div className="nuvi-relative nuvi-flex nuvi-gap-sm">
            <button
              type="button"
              onClick={onAddAfter}
              className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
            >
              <Plus className="h-4 w-4" />
              Add Action
            </button>
            <button
              type="button"
              onClick={() => {
                const newStep: WorkflowStep = {
                  id: `delay-${Date.now()}`,
                  type: 'delay',
                  config: { value: 1, unit: 'hours' }
                };
                // Add delay after this step
                const currentIndex = index;
                onAddAfter();
              }}
              className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary"
            >
              <Timer className="h-4 w-4" />
              Add Delay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}