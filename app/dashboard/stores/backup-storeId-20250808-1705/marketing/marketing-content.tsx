'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Tag, Zap, Plug, Plus, Send, Users, ArrowLeft, Clock, 
  ShoppingCart, GitBranch, Save, Eye, Wand2, Globe, BarChart3, 
  Trash2
} from 'lucide-react';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface MarketingContentProps {
  store: StoreData;
}

export function MarketingContent({ store }: MarketingContentProps) {
  const router = useRouter();
  const [marketingSubTab, setMarketingSubTab] = useState<'campaigns' | 'discounts' | 'automations' | 'integrations'>('campaigns');
  const [marketingView, setMarketingView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  return (
    <div className="nuvi-tab-panel">
      {/* Marketing Sub-tabs */}
      <div className="nuvi-sub-tabs">
        <div className="nuvi-sub-tabs-list">
          <button 
            className={`nuvi-tab ${marketingSubTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => {
              setMarketingSubTab('campaigns');
              setMarketingView('list');
            }}
          >
            <Mail className="h-4 w-4" />
            Campaigns
          </button>
          <button 
            className={`nuvi-tab ${marketingSubTab === 'discounts' ? 'active' : ''}`}
            onClick={() => {
              setMarketingSubTab('discounts');
              setMarketingView('list');
            }}
          >
            <Tag className="h-4 w-4" />
            Discounts
          </button>
          <button 
            className={`nuvi-tab ${marketingSubTab === 'automations' ? 'active' : ''}`}
            onClick={() => {
              setMarketingSubTab('automations');
              setMarketingView('list');
            }}
          >
            <Zap className="h-4 w-4" />
            Automations
          </button>
          <button 
            className={`nuvi-tab ${marketingSubTab === 'integrations' ? 'active' : ''}`}
            onClick={() => {
              setMarketingSubTab('integrations');
              setMarketingView('list');
            }}
          >
            <Plug className="h-4 w-4" />
            Integrations
          </button>
        </div>
      </div>

      {/* Campaigns Sub-tab */}
      {marketingSubTab === 'campaigns' && (
        <div className="nuvi-sub-tab-content">
          {marketingView === 'list' && (
            <>
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
                <div>
                  <h3 className="nuvi-text-xl nuvi-font-semibold">Email Campaigns</h3>
                  <p className="nuvi-text-sm nuvi-text-secondary">Engage customers with targeted email marketing</p>
                </div>
                <button 
                  className="nuvi-btn nuvi-btn-primary"
                  onClick={() => setMarketingView('create')}
                >
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </button>
              </div>

              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md nuvi-mb-lg">
                <div className="nuvi-card nuvi-card-compact">
                  <div className="nuvi-card-content">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <Send className="h-5 w-5 nuvi-text-primary" />
                      <span className="nuvi-text-sm nuvi-text-success">+12%</span>
                    </div>
                    <h3 className="nuvi-text-2xl nuvi-font-bold">0</h3>
                    <p className="nuvi-text-sm nuvi-text-secondary">Campaigns Sent</p>
                  </div>
                </div>
                <div className="nuvi-card nuvi-card-compact">
                  <div className="nuvi-card-content">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <Mail className="h-5 w-5 nuvi-text-primary" />
                      <span className="nuvi-text-sm nuvi-text-muted">0%</span>
                    </div>
                    <h3 className="nuvi-text-2xl nuvi-font-bold">0%</h3>
                    <p className="nuvi-text-sm nuvi-text-secondary">Open Rate</p>
                  </div>
                </div>
                <div className="nuvi-card nuvi-card-compact">
                  <div className="nuvi-card-content">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <Users className="h-5 w-5 nuvi-text-primary" />
                      <span className="nuvi-text-sm nuvi-text-muted">0</span>
                    </div>
                    <h3 className="nuvi-text-2xl nuvi-font-bold">0</h3>
                    <p className="nuvi-text-sm nuvi-text-secondary">Subscribers</p>
                  </div>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-content">
                  <div className="nuvi-text-center nuvi-py-xl">
                    <Mail className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No campaigns yet</h3>
                    <p className="nuvi-text-muted nuvi-mb-lg">Create your first email campaign to engage customers</p>
                    <button 
                      className="nuvi-btn nuvi-btn-primary"
                      onClick={() => setMarketingView('create')}
                    >
                      <Plus className="h-4 w-4" />
                      Create Campaign
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Discounts Sub-tab */}
      {marketingSubTab === 'discounts' && (
        <div className="nuvi-sub-tab-content">
          {marketingView === 'list' && (
            <>
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
                <div>
                  <h3 className="nuvi-text-xl nuvi-font-semibold">Discount Codes</h3>
                  <p className="nuvi-text-sm nuvi-text-secondary">Create and manage promotional discounts</p>
                </div>
                <button 
                  className="nuvi-btn nuvi-btn-primary"
                  onClick={() => setMarketingView('create')}
                >
                  <Plus className="h-4 w-4" />
                  Create Discount
                </button>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-content">
                  <div className="nuvi-text-center nuvi-py-xl">
                    <Tag className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No discount codes yet</h3>
                    <p className="nuvi-text-muted nuvi-mb-lg">Create discount codes to attract customers</p>
                    <button 
                      className="nuvi-btn nuvi-btn-primary"
                      onClick={() => setMarketingView('create')}
                    >
                      <Plus className="h-4 w-4" />
                      Create Discount
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Automations Sub-tab */}
      {marketingSubTab === 'automations' && (
        <div className="nuvi-sub-tab-content">
          {marketingView === 'list' && (
            <>
              <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
                <div>
                  <h3 className="nuvi-text-xl nuvi-font-semibold">Marketing Automations</h3>
                  <p className="nuvi-text-sm nuvi-text-secondary">Automate your marketing workflows</p>
                </div>
                <button 
                  className="nuvi-btn nuvi-btn-primary"
                  onClick={() => setMarketingView('create')}
                >
                  <Plus className="h-4 w-4" />
                  Create Automation
                </button>
              </div>

              <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                <div 
                  className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate('abandoned-cart');
                    setMarketingView('create');
                  }}
                >
                  <ShoppingCart className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Abandoned Cart Recovery</h4>
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Automatically send reminders to customers who left items in their cart
                  </p>
                  <p className="nuvi-text-xs nuvi-text-muted">
                    <Clock className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                    Triggers after 1 hour
                  </p>
                </div>

                <div 
                  className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate('welcome-series');
                    setMarketingView('create');
                  }}
                >
                  <Mail className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Welcome Series</h4>
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Greet new subscribers with a series of welcome emails
                  </p>
                  <p className="nuvi-text-xs nuvi-text-muted">
                    <Users className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                    3 email sequence
                  </p>
                </div>

                <div 
                  className="nuvi-p-lg nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition nuvi-cursor-pointer"
                  onClick={() => {
                    setSelectedTemplate('custom');
                    setMarketingView('create');
                  }}
                >
                  <Zap className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                  <h4 className="nuvi-font-medium nuvi-mb-sm">Custom Workflow</h4>
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Build your own automation from scratch
                  </p>
                  <p className="nuvi-text-xs nuvi-text-muted">
                    <GitBranch className="h-3 w-3 nuvi-inline nuvi-mr-xs" />
                    Unlimited steps
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Integrations Sub-tab */}
      {marketingSubTab === 'integrations' && (
        <div className="nuvi-sub-tab-content">
          <div className="nuvi-mb-lg">
            <h3 className="nuvi-text-xl nuvi-font-semibold">Marketing Integrations</h3>
            <p className="nuvi-text-sm nuvi-text-secondary">Connect your marketing tools and platforms</p>
          </div>

          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-blue-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <Globe className="h-6 w-6 nuvi-text-blue-600" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Google Ads</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Track conversions and manage campaigns
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-blue-600 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <span className="nuvi-text-white nuvi-font-bold">f</span>
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Facebook Ads</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Sync audiences and track ROI
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-orange-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <BarChart3 className="h-6 w-6 nuvi-text-orange-600" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Google Analytics</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Advanced ecommerce tracking
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-green-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <Mail className="h-6 w-6 nuvi-text-green-600" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Mailchimp</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Email marketing automation
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-purple-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <Send className="h-6 w-6 nuvi-text-purple-600" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">SendGrid</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Transactional email service
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-indigo-100 nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                    <Users className="h-6 w-6 nuvi-text-indigo-600" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Klaviyo</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Advanced customer segmentation
                    </p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-secondary nuvi-w-full">
                      <Plug className="h-4 w-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}