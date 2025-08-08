'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Package, ShoppingCart, LayoutGrid, FileText, Image, Settings, 
  ExternalLink, ChevronDown, Plus, Store, LogOut, BarChart,
  Users, TrendingUp, DollarSign, FileEdit, BookOpen, Sparkles,
  ArrowLeft, Globe, CreditCard, Truck, Bell, Shield, Languages,
  Receipt, Gift, BarChart3, Palette, Eye, Check, Smartphone, 
  Monitor, Tablet, Brush, Layout, Search, Filter, Loader2, Wand2,
  UserCircle, Megaphone, Puzzle, Mail, Tag, BarChart2, Plug,
  Menu, ImageIcon, Type, Save, Send, Code, FileCode, GitBranch,
  Zap, Clock, Trash2, AlertCircle, Import, ShoppingBag, FileTextIcon,
  Download, User, Upload
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from '@/components/ui/select';
import { CustomerForm } from './customers/customer-form';
import { AnalyticsContent } from './analytics/analytics-content';
import { ProductsTabContent } from './components/products-tab-content';
import { ContentTabContent } from './components/content-tab-content';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface DashboardClientProps {
  store: StoreData;
  allStores: StoreData[];
  session: any;
}

export function DashboardClient({ store, allStores, session }: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const tabParam = searchParams.get('tab') as any;
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'customers' | 'marketing' | 'content' | 'analytics' | 'apps' | 'ai'>(tabParam || 'overview');
  const [customerView, setCustomerView] = useState<'list' | 'new' | 'edit'>('list');
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importUrl, setImportUrl] = useState('');
  
  // Marketing tab states
  const [marketingSubTab, setMarketingSubTab] = useState<'campaigns' | 'discounts' | 'automations' | 'integrations'>('campaigns');
  const [marketingView, setMarketingView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowNodes, setWorkflowNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', activeTab);
    const newUrl = `/dashboard/stores/${store.id}?${params.toString()}`;
    
    // Use history API to avoid page reload
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab, store.id, searchParams]);

  return (
    <div className="nuvi-dashboard">
      <div className="nuvi-tabs">
        <div className="nuvi-tabs-list">
          <div className="nuvi-tabs-left">
            <Select value={store.id} onValueChange={(value) => {
              if (value === 'add-store') {
                router.push('/dashboard/stores/new');
              } else if (value === 'settings') {
                router.push('/dashboard/settings');
              } else if (value === 'signout') {
                router.push('/api/auth/signout');
              } else {
                router.push(`/dashboard/stores/${value}`);
              }
            }}>
              <SelectTrigger className="nuvi-select-trigger">
                <SelectValue>{store.name}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {allStores.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="add-store">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <Plus className="h-4 w-4" />
                    Add Store
                  </div>
                </SelectItem>
                <SelectSeparator />
                <SelectItem value="settings">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </div>
                </SelectItem>
                <SelectItem value="signout">
                  <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="nuvi-tabs-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`nuvi-tab ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <BarChart className="h-4 w-4" />
              <span className="nuvi-tab-label">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`nuvi-tab ${activeTab === 'products' ? 'active' : ''}`}
            >
              <Package className="h-4 w-4" />
              <span className="nuvi-tab-label">Products</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`nuvi-tab ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="nuvi-tab-label">Orders</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`nuvi-tab ${activeTab === 'customers' ? 'active' : ''}`}
            >
              <Users className="h-4 w-4" />
              <span className="nuvi-tab-label">Customers</span>
            </button>
            <button
              onClick={() => setActiveTab('marketing')}
              className={`nuvi-tab ${activeTab === 'marketing' ? 'active' : ''}`}
            >
              <Megaphone className="h-4 w-4" />
              <span className="nuvi-tab-label">Marketing</span>
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`nuvi-tab ${activeTab === 'content' ? 'active' : ''}`}
            >
              <FileText className="h-4 w-4" />
              <span className="nuvi-tab-label">Content</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`nuvi-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="nuvi-tab-label">Analytics</span>
            </button>
            <button
              onClick={() => router.push(`/dashboard/stores/${store.id}/themes`)}
              className={`nuvi-tab`}
            >
              <Palette className="h-4 w-4" />
              <span className="nuvi-tab-label">Themes</span>
            </button>
            <button
              onClick={() => setActiveTab('apps')}
              className={`nuvi-tab ${activeTab === 'apps' ? 'active' : ''}`}
            >
              <Puzzle className="h-4 w-4" />
              <span className="nuvi-tab-label">Apps</span>
            </button>
            <button
              onClick={() => router.push(`/dashboard/stores/${store.id}/settings`)}
              className={`nuvi-tab ${activeTab === 'settings' ? 'active' : ''}`}
            >
              <Settings className="h-4 w-4" />
              <span className="nuvi-tab-label">Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`nuvi-tab ${activeTab === 'ai' ? 'active' : ''}`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="nuvi-tab-label">AI Tools</span>
            </button>
          </div>
        </div>
      </div>

      <div className="nuvi-tab-content">
        {activeTab === 'overview' && (
          <div className="nuvi-tab-panel">
            {/* Quick Stats */}
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <DollarSign className="h-6 w-6 nuvi-text-primary" />
                    <span className="nuvi-text-sm nuvi-text-success">+12.5%</span>
                  </div>
                  <h3 className="nuvi-text-2xl nuvi-font-bold">$0</h3>
                  <p className="nuvi-text-secondary nuvi-text-sm">Total Revenue</p>
                </div>
              </div>
              
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <ShoppingCart className="h-6 w-6 nuvi-text-primary" />
                    <span className="nuvi-text-sm nuvi-text-muted">0%</span>
                  </div>
                  <h3 className="nuvi-text-2xl nuvi-font-bold">{store._count.orders}</h3>
                  <p className="nuvi-text-secondary nuvi-text-sm">Total Orders</p>
                </div>
              </div>
              
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <Package className="h-6 w-6 nuvi-text-primary" />
                    <span className="nuvi-text-sm nuvi-text-muted">Active</span>
                  </div>
                  <h3 className="nuvi-text-2xl nuvi-font-bold">{store._count.products}</h3>
                  <p className="nuvi-text-secondary nuvi-text-sm">Products</p>
                </div>
              </div>
              
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                    <Users className="h-6 w-6 nuvi-text-primary" />
                    <span className="nuvi-text-sm nuvi-text-success">+5</span>
                  </div>
                  <h3 className="nuvi-text-2xl nuvi-font-bold">0</h3>
                  <p className="nuvi-text-secondary nuvi-text-sm">Customers</p>
                </div>
              </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-md">
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Sales Overview</h3>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-bg-surface-hover nuvi-rounded-lg">
                    <div className="nuvi-text-center">
                      <BarChart3 className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                      <p className="nuvi-text-muted">No sales data yet</p>
                      <p className="nuvi-text-sm nuvi-text-muted">Start selling to see analytics</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">Recent Activity</h3>
                </div>
                <div className="nuvi-card-content">
                  <div className="nuvi-space-y-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-sm nuvi-bg-surface-hover nuvi-rounded-md">
                      <Store className="h-4 w-4 nuvi-text-primary" />
                      <div className="nuvi-flex-1">
                        <p className="nuvi-text-sm nuvi-font-medium">Store created</p>
                        <p className="nuvi-text-xs nuvi-text-muted">Welcome to Nuvi!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="nuvi-card nuvi-mt-lg">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Quick Actions</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <button onClick={() => setActiveTab('products')} className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                  <Link href={`/dashboard/stores/${store.id}/theme-studio`} className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2">
                    <Palette className="h-4 w-4" />
                    Customize Theme
                  </Link>
                  <button onClick={() => setActiveTab('settings')} className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Settings className="h-4 w-4" />
                    Store Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductsTabContent store={store} />
        )}

        {activeTab === 'orders' && (
          <div className="nuvi-tab-panel">
            {/* Orders Header */}
            <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
              <div>
                <h2 className="nuvi-text-2xl nuvi-font-bold">Orders</h2>
                <p className="nuvi-text-secondary nuvi-text-sm">Manage your store orders</p>
              </div>
              <div className="nuvi-flex nuvi-gap-sm">
                <button className="nuvi-btn nuvi-btn-secondary">
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button className="nuvi-btn nuvi-btn-primary">
                  <Plus className="h-4 w-4" />
                  Create Order
                </button>
              </div>
            </div>

            {/* Order Stats */}
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-text-sm nuvi-text-secondary">Unfulfilled</p>
                      <p className="nuvi-text-2xl nuvi-font-bold">0</p>
                    </div>
                    <ShoppingCart className="h-6 w-6 nuvi-text-warning" />
                  </div>
                </div>
              </div>
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-text-sm nuvi-text-secondary">Unpaid</p>
                      <p className="nuvi-text-2xl nuvi-font-bold">0</p>
                    </div>
                    <CreditCard className="h-6 w-6 nuvi-text-error" />
                  </div>
                </div>
              </div>
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-text-sm nuvi-text-secondary">Shipped</p>
                      <p className="nuvi-text-2xl nuvi-font-bold">0</p>
                    </div>
                    <Truck className="h-6 w-6 nuvi-text-primary" />
                  </div>
                </div>
              </div>
              <div className="nuvi-card nuvi-card-compact">
                <div className="nuvi-card-content">
                  <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                    <div>
                      <p className="nuvi-text-sm nuvi-text-secondary">Completed</p>
                      <p className="nuvi-text-2xl nuvi-font-bold">{store._count.orders}</p>
                    </div>
                    <Check className="h-6 w-6 nuvi-text-success" />
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                {store._count.orders === 0 ? (
                  <div className="nuvi-text-center nuvi-py-xl">
                    <ShoppingCart className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                    <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No orders yet</h3>
                    <p className="nuvi-text-muted">Your orders will appear here when customers make purchases</p>
                  </div>
                ) : (
                  <div>
                    <div className="nuvi-flex nuvi-gap-md nuvi-mb-md">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        className="nuvi-input nuvi-flex-1"
                      />
                      <select className="nuvi-input" style={{ width: '150px' }}>
                        <option>All Orders</option>
                        <option>Unfulfilled</option>
                        <option>Unpaid</option>
                        <option>Completed</option>
                      </select>
                    </div>
                    <p className="nuvi-text-center nuvi-text-muted nuvi-py-md">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="nuvi-tab-panel">
            {customerView === 'list' ? (
              <>
                {/* Customers Header */}
                <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
                  <div>
                    <h2 className="nuvi-text-2xl nuvi-font-bold">Customers</h2>
                    <p className="nuvi-text-secondary nuvi-text-sm">Manage your customer relationships</p>
                  </div>
                  <button 
                    className="nuvi-btn nuvi-btn-primary"
                    onClick={() => setCustomerView('new')}
                  >
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </button>
                </div>

                {/* Customer Stats */}
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md nuvi-mb-lg">
                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <h3 className="nuvi-card-title">
                        <Users className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                        Customer Segments
                      </h3>
                    </div>
                    <div className="nuvi-card-content">
                      <div className="nuvi-space-y-sm">
                        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                          <span className="nuvi-text-sm">New Customers</span>
                          <span className="nuvi-badge nuvi-badge-primary">0</span>
                        </div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                          <span className="nuvi-text-sm">Returning Customers</span>
                          <span className="nuvi-badge nuvi-badge-primary">0</span>
                        </div>
                        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
                          <span className="nuvi-text-sm">Email Subscribers</span>
                          <span className="nuvi-badge nuvi-badge-primary">0</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <h3 className="nuvi-card-title">
                        <Mail className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                        Email Marketing
                      </h3>
                    </div>
                    <div className="nuvi-card-content">
                      <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                        Build customer relationships with email campaigns
                      </p>
                      <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                        Create Campaign
                      </button>
                    </div>
                  </div>

                  <div className="nuvi-card">
                    <div className="nuvi-card-header">
                      <h3 className="nuvi-card-title">
                        <Gift className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                        Loyalty Program
                      </h3>
                    </div>
                    <div className="nuvi-card-content">
                      <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                        Reward loyal customers with points and perks
                      </p>
                      <button className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm nuvi-w-full">
                        Setup Program
                      </button>
                    </div>
                  </div>
                </div>

                {/* Customers List */}
                <div className="nuvi-card">
                  <div className="nuvi-card-content">
                    <div className="nuvi-text-center nuvi-py-xl">
                      <Users className="h-16 w-16 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                      <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No customers yet</h3>
                      <p className="nuvi-text-muted nuvi-mb-lg">Customers will appear here after their first purchase</p>
                      <button 
                        className="nuvi-btn nuvi-btn-primary"
                        onClick={() => setCustomerView('new')}
                      >
                        <Plus className="h-4 w-4" />
                        Add Customer
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <CustomerForm
                storeId={store.id}
                customer={editingCustomerId ? customers.find(c => c.id === editingCustomerId) : undefined}
                onSuccess={() => {
                  setCustomerView('list');
                  setEditingCustomerId(null);
                  // Optionally refresh customer list here
                }}
                onCancel={() => {
                  setCustomerView('list');
                  setEditingCustomerId(null);
                }}
              />
            )}
          </div>
        )}

        {activeTab === 'marketing' && (
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

                {marketingView === 'create' && (
                  <div className="nuvi-container">
                    <div className="nuvi-flex nuvi-items-center nuvi-mb-lg">
                      <button 
                        className="nuvi-btn nuvi-btn-ghost nuvi-mr-md"
                        onClick={() => setMarketingView('list')}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <h3 className="nuvi-text-xl nuvi-font-semibold">Create Email Campaign</h3>
                        <p className="nuvi-text-sm nuvi-text-secondary">Design and send targeted email campaigns</p>
                      </div>
                    </div>

                    <div className="nuvi-card">
                      <div className="nuvi-card-content">
                        <div className="nuvi-space-y-lg">
                          <div>
                            <h4 className="nuvi-font-medium nuvi-mb-md">Campaign Details</h4>
                            <div className="nuvi-space-y-md">
                              <div className="nuvi-form-group">
                                <label className="nuvi-label">Campaign Name</label>
                                <input 
                                  type="text" 
                                  className="nuvi-input" 
                                  placeholder="e.g., Summer Sale Announcement"
                                />
                              </div>
                              <div className="nuvi-form-group">
                                <label className="nuvi-label">Subject Line</label>
                                <input 
                                  type="text" 
                                  className="nuvi-input" 
                                  placeholder="e.g., Don't miss our biggest sale of the year!"
                                />
                              </div>
                              <div className="nuvi-form-group">
                                <label className="nuvi-label">Preview Text</label>
                                <input 
                                  type="text" 
                                  className="nuvi-input" 
                                  placeholder="e.g., Save up to 50% on selected items"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="nuvi-font-medium nuvi-mb-md">Recipients</h4>
                            <div className="nuvi-space-y-md">
                              <div className="nuvi-form-group">
                                <label className="nuvi-label">Send To</label>
                                <select className="nuvi-input">
                                  <option>All Subscribers</option>
                                  <option>New Customers (Last 30 days)</option>
                                  <option>VIP Customers</option>
                                  <option>Custom Segment</option>
                                </select>
                              </div>
                              <div className="nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                                <p className="nuvi-text-sm nuvi-text-secondary">
                                  <Users className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                                  This campaign will be sent to <strong>0 recipients</strong>
                                </p>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="nuvi-font-medium nuvi-mb-md">Email Content</h4>
                            <div className="nuvi-border nuvi-rounded-lg nuvi-p-lg nuvi-min-h-[400px]">
                              <div className="nuvi-text-center nuvi-py-xl">
                                <FileText className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                                <p className="nuvi-text-muted nuvi-mb-md">Design your email</p>
                                <div className="nuvi-flex nuvi-gap-sm nuvi-justify-center">
                                  <button className="nuvi-btn nuvi-btn-secondary">
                                    <Code className="h-4 w-4" />
                                    HTML Editor
                                  </button>
                                  <button className="nuvi-btn nuvi-btn-secondary">
                                    <Brush className="h-4 w-4" />
                                    Visual Editor
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="nuvi-font-medium nuvi-mb-md">Schedule</h4>
                            <div className="nuvi-space-y-sm">
                              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <input type="radio" name="schedule" defaultChecked />
                                <span>Send immediately</span>
                              </label>
                              <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                <input type="radio" name="schedule" />
                                <span>Schedule for later</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="nuvi-card-footer nuvi-flex nuvi-justify-end nuvi-gap-sm">
                        <button 
                          className="nuvi-btn nuvi-btn-secondary"
                          onClick={() => setMarketingView('list')}
                        >
                          Save as Draft
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary">
                          <Send className="h-4 w-4" />
                          Send Campaign
                        </button>
                      </div>
                    </div>
                  </div>
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

                {marketingView === 'create' && (
                  <div className="nuvi-container">
                    <div className="nuvi-flex nuvi-items-center nuvi-mb-lg">
                      <button 
                        className="nuvi-btn nuvi-btn-ghost nuvi-mr-md"
                        onClick={() => setMarketingView('list')}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <h3 className="nuvi-text-xl nuvi-font-semibold">Create Discount Code</h3>
                        <p className="nuvi-text-sm nuvi-text-secondary">Set up a new promotional discount</p>
                      </div>
                    </div>

                    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-3 nuvi-gap-lg">
                      <div className="nuvi-lg:col-span-2">
                        <div className="nuvi-card">
                          <div className="nuvi-card-content">
                            <div className="nuvi-space-y-lg">
                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Discount Code</h4>
                                <div className="nuvi-form-group">
                                  <label className="nuvi-label">Code</label>
                                  <div className="nuvi-flex nuvi-gap-sm">
                                    <input 
                                      type="text" 
                                      className="nuvi-input nuvi-flex-1" 
                                      placeholder="e.g., SUMMER2024"
                                    />
                                    <button className="nuvi-btn nuvi-btn-secondary">
                                      <Wand2 className="h-4 w-4" />
                                      Generate
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Discount Type</h4>
                                <div className="nuvi-space-y-sm">
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="type" defaultChecked />
                                    <span>Percentage discount</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="type" />
                                    <span>Fixed amount discount</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="type" />
                                    <span>Free shipping</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Discount Value</h4>
                                <div className="nuvi-form-group">
                                  <label className="nuvi-label">Percentage off</label>
                                  <div className="nuvi-flex nuvi-gap-sm nuvi-items-center">
                                    <input 
                                      type="number" 
                                      className="nuvi-input" 
                                      placeholder="10"
                                      style={{ width: '100px' }}
                                    />
                                    <span className="nuvi-text-secondary">%</span>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Applies To</h4>
                                <div className="nuvi-space-y-sm">
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="applies" defaultChecked />
                                    <span>All products</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="applies" />
                                    <span>Specific collections</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="radio" name="applies" />
                                    <span>Specific products</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Minimum Requirements</h4>
                                <div className="nuvi-space-y-sm">
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="checkbox" />
                                    <span>Minimum purchase amount</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="checkbox" />
                                    <span>Minimum quantity of items</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Usage Limits</h4>
                                <div className="nuvi-space-y-md">
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="checkbox" />
                                    <span>Limit number of times this discount can be used in total</span>
                                  </label>
                                  <label className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                    <input type="checkbox" />
                                    <span>Limit to one use per customer</span>
                                  </label>
                                </div>
                              </div>

                              <div>
                                <h4 className="nuvi-font-medium nuvi-mb-md">Active Dates</h4>
                                <div className="nuvi-grid nuvi-grid-cols-2 nuvi-gap-md">
                                  <div className="nuvi-form-group">
                                    <label className="nuvi-label">Start date</label>
                                    <input type="date" className="nuvi-input" />
                                  </div>
                                  <div className="nuvi-form-group">
                                    <label className="nuvi-label">End date (optional)</label>
                                    <input type="date" className="nuvi-input" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="nuvi-card">
                          <div className="nuvi-card-header">
                            <h4 className="nuvi-card-title">Summary</h4>
                          </div>
                          <div className="nuvi-card-content">
                            <div className="nuvi-space-y-md">
                              <div className="nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                                <p className="nuvi-text-sm nuvi-font-medium nuvi-mb-xs">SUMMER2024</p>
                                <p className="nuvi-text-xs nuvi-text-secondary">10% off all products</p>
                              </div>
                              <div className="nuvi-text-sm nuvi-space-y-sm">
                                <p><strong>Type:</strong> Percentage discount</p>
                                <p><strong>Value:</strong> 10% off</p>
                                <p><strong>Applies to:</strong> All products</p>
                                <p><strong>Usage:</strong> No limits</p>
                              </div>
                            </div>
                          </div>
                          <div className="nuvi-card-footer">
                            <button className="nuvi-btn nuvi-btn-primary nuvi-w-full">
                              <Save className="h-4 w-4" />
                              Save Discount
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

                {marketingView === 'create' && (
                  <div className="nuvi-container-fluid">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-lg">
                      <div className="nuvi-flex nuvi-items-center">
                        <button 
                          className="nuvi-btn nuvi-btn-ghost nuvi-mr-md"
                          onClick={() => {
                            setMarketingView('list');
                            setSelectedTemplate(null);
                            setWorkflowNodes([]);
                            setSelectedNode(null);
                          }}
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <h3 className="nuvi-text-xl nuvi-font-semibold">Create Marketing Automation</h3>
                          <p className="nuvi-text-sm nuvi-text-secondary">
                            {selectedTemplate === 'abandoned-cart' && 'Abandoned Cart Recovery'}
                            {selectedTemplate === 'welcome-series' && 'Welcome Series'}
                            {selectedTemplate === 'custom' && 'Custom Workflow'}
                          </p>
                        </div>
                      </div>
                      <div className="nuvi-flex nuvi-gap-sm">
                        <button className="nuvi-btn nuvi-btn-secondary">
                          <Eye className="h-4 w-4" />
                          Preview
                        </button>
                        <button className="nuvi-btn nuvi-btn-primary">
                          <Save className="h-4 w-4" />
                          Save & Activate
                        </button>
                      </div>
                    </div>

                    <div className="nuvi-grid nuvi-grid-cols-12 nuvi-gap-lg">
                      {/* Workflow Canvas */}
                      <div className="nuvi-col-span-9">
                        <div className="nuvi-bg-surface nuvi-rounded-lg nuvi-p-lg nuvi-min-h-[600px]">
                          <div className="nuvi-mb-md">
                            <input
                              type="text"
                              className="nuvi-input"
                              placeholder="Workflow Name"
                              value={workflowName}
                              onChange={(e) => setWorkflowName(e.target.value)}
                            />
                          </div>

                          <div className="nuvi-bg-white nuvi-rounded-lg nuvi-p-lg nuvi-min-h-[500px] nuvi-relative">
                            {/* Start Node */}
                            <div className="nuvi-absolute nuvi-top-8 nuvi-left-1/2 nuvi-transform nuvi--translate-x-1/2">
                              <div className="nuvi-bg-primary nuvi-text-white nuvi-rounded-full nuvi-w-16 nuvi-h-16 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-shadow-lg">
                                <Zap className="h-6 w-6" />
                              </div>
                              <p className="nuvi-text-center nuvi-text-sm nuvi-mt-sm">Start</p>
                            </div>

                            {/* Workflow Nodes */}
                            {selectedTemplate === 'abandoned-cart' && (
                              <div className="nuvi-mt-32 nuvi-space-y-8">
                                <div className="nuvi-flex nuvi-justify-center">
                                  <div className="nuvi-bg-white nuvi-border-2 nuvi-border-primary nuvi-rounded-lg nuvi-p-md nuvi-w-64 nuvi-shadow-md">
                                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                                      <Clock className="h-5 w-5 nuvi-text-primary" />
                                      <span className="nuvi-font-medium">Wait 1 hour</span>
                                    </div>
                                    <p className="nuvi-text-sm nuvi-text-secondary">After cart abandonment</p>
                                  </div>
                                </div>
                                <div className="nuvi-flex nuvi-justify-center">
                                  <div className="nuvi-bg-white nuvi-border-2 nuvi-border-primary nuvi-rounded-lg nuvi-p-md nuvi-w-64 nuvi-shadow-md">
                                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                                      <Mail className="h-5 w-5 nuvi-text-primary" />
                                      <span className="nuvi-font-medium">Send Email</span>
                                    </div>
                                    <p className="nuvi-text-sm nuvi-text-secondary">Cart reminder email</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedTemplate === 'welcome-series' && (
                              <div className="nuvi-mt-32 nuvi-space-y-8">
                                <div className="nuvi-flex nuvi-justify-center">
                                  <div className="nuvi-bg-white nuvi-border-2 nuvi-border-primary nuvi-rounded-lg nuvi-p-md nuvi-w-64 nuvi-shadow-md">
                                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                                      <Mail className="h-5 w-5 nuvi-text-primary" />
                                      <span className="nuvi-font-medium">Welcome Email</span>
                                    </div>
                                    <p className="nuvi-text-sm nuvi-text-secondary">Send immediately</p>
                                  </div>
                                </div>
                                <div className="nuvi-flex nuvi-justify-center">
                                  <div className="nuvi-bg-white nuvi-border-2 nuvi-border-secondary nuvi-rounded-lg nuvi-p-md nuvi-w-64 nuvi-shadow-md">
                                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                                      <Clock className="h-5 w-5 nuvi-text-secondary" />
                                      <span className="nuvi-font-medium">Wait 3 days</span>
                                    </div>
                                    <p className="nuvi-text-sm nuvi-text-secondary">Then continue</p>
                                  </div>
                                </div>
                                <div className="nuvi-flex nuvi-justify-center">
                                  <div className="nuvi-bg-white nuvi-border-2 nuvi-border-primary nuvi-rounded-lg nuvi-p-md nuvi-w-64 nuvi-shadow-md">
                                    <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                                      <Mail className="h-5 w-5 nuvi-text-primary" />
                                      <span className="nuvi-font-medium">Tips Email</span>
                                    </div>
                                    <p className="nuvi-text-sm nuvi-text-secondary">Product usage tips</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {selectedTemplate === 'custom' && workflowNodes.length === 0 && (
                              <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-full nuvi-mt-32">
                                <div className="nuvi-text-center">
                                  <GitBranch className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                                  <p className="nuvi-text-muted nuvi-mb-md">Drag and drop nodes to build your workflow</p>
                                  <p className="nuvi-text-sm nuvi-text-muted">Start by adding a trigger from the right panel</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Node Palette */}
                      <div className="nuvi-col-span-3">
                        <div className="nuvi-card">
                          <div className="nuvi-card-header">
                            <h4 className="nuvi-card-title">Workflow Nodes</h4>
                          </div>
                          <div className="nuvi-card-content">
                            <div className="nuvi-space-y-sm">
                              <div className="nuvi-p-sm nuvi-border nuvi-rounded nuvi-cursor-pointer nuvi-hover:border-primary nuvi-transition">
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                  <Zap className="h-4 w-4 nuvi-text-primary" />
                                  <span className="nuvi-text-sm nuvi-font-medium">Trigger</span>
                                </div>
                              </div>
                              <div className="nuvi-p-sm nuvi-border nuvi-rounded nuvi-cursor-pointer nuvi-hover:border-primary nuvi-transition">
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                  <Mail className="h-4 w-4 nuvi-text-primary" />
                                  <span className="nuvi-text-sm nuvi-font-medium">Send Email</span>
                                </div>
                              </div>
                              <div className="nuvi-p-sm nuvi-border nuvi-rounded nuvi-cursor-pointer nuvi-hover:border-primary nuvi-transition">
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                  <Clock className="h-4 w-4 nuvi-text-primary" />
                                  <span className="nuvi-text-sm nuvi-font-medium">Wait</span>
                                </div>
                              </div>
                              <div className="nuvi-p-sm nuvi-border nuvi-rounded nuvi-cursor-pointer nuvi-hover:border-primary nuvi-transition">
                                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                                  <GitBranch className="h-4 w-4 nuvi-text-primary" />
                                  <span className="nuvi-text-sm nuvi-font-medium">Condition</span>
                                </div>
                              </div>
                            </div>

                            <div className="nuvi-mt-lg nuvi-pt-lg nuvi-border-t">
                              <h5 className="nuvi-font-medium nuvi-mb-md">Node Settings</h5>
                              {selectedNode ? (
                                <div className="nuvi-space-y-md">
                                  <div className="nuvi-form-group">
                                    <label className="nuvi-label">Node Name</label>
                                    <input type="text" className="nuvi-input" />
                                  </div>
                                  <button className="nuvi-btn nuvi-btn-sm nuvi-btn-error nuvi-w-full">
                                    <Trash2 className="h-4 w-4" />
                                    Delete Node
                                  </button>
                                </div>
                              ) : (
                                <p className="nuvi-text-sm nuvi-text-muted">Select a node to configure</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
        )}

        {activeTab === 'content' && (
          <ContentTabContent store={store} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsContent storeId={store.id} />
        )}


        {activeTab === 'apps' && (
          <div className="nuvi-tab-panel">
            {/* Apps Header */}
            <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
              <div>
                <h2 className="nuvi-text-2xl nuvi-font-bold">Apps</h2>
                <p className="nuvi-text-secondary nuvi-text-sm">Extend your store with powerful apps</p>
              </div>
              <button className="nuvi-btn nuvi-btn-secondary">
                <Search className="h-4 w-4" />
                Browse App Store
              </button>
            </div>

            {/* Installed Apps */}
            <div className="nuvi-card nuvi-mb-lg">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Installed Apps</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg">
                    <div className="nuvi-flex nuvi-items-start nuvi-gap-md">
                      <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-surface-hover nuvi-rounded-lg nuvi-flex nuvi-items-center nuvi-justify-center">
                        <Plug className="h-6 w-6 nuvi-text-primary" />
                      </div>
                      <div className="nuvi-flex-1">
                        <h4 className="nuvi-font-medium">Shopify Import</h4>
                        <p className="nuvi-text-sm nuvi-text-secondary">Import products from Shopify</p>
                        <div className="nuvi-mt-md">
                          <div className="nuvi-flex nuvi-gap-sm">
                            <button 
                              className="nuvi-btn nuvi-btn-sm nuvi-btn-primary"
                              onClick={() => {
                                router.push(`/dashboard/stores/${store.id}/apps/shopify-import`);
                              }}
                            >
                              <>
                                <Upload className="h-4 w-4" />
                                Open Import Tool
                              </>
                              )}
                            </button>
                            <button className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost">Remove</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Apps */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Recommended for You</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <Mail className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Email Marketing</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Send beautiful emails</p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full">Install</button>
                  </div>
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <BarChart2 className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-xs">Advanced Analytics</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Deep insights and reports</p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full">Install</button>
                  </div>
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <Zap className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-xs">SEO Optimizer</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">Boost search rankings</p>
                    <button className="nuvi-btn nuvi-btn-sm nuvi-btn-primary nuvi-w-full">Install</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'ai' && (
          <div className="nuvi-tab-panel">
            {/* AI Header */}
            <div className="nuvi-mb-lg">
              <h2 className="nuvi-text-2xl nuvi-font-bold">AI Tools</h2>
              <p className="nuvi-text-secondary nuvi-text-sm">Leverage AI to build and optimize your store</p>
            </div>

            {/* AI Store Builder */}
            <div className="nuvi-card nuvi-mb-lg">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">
                  <Wand2 className="h-5 w-5 nuvi-inline nuvi-mr-sm" />
                  AI Store Builder
                </h3>
              </div>
              <div className="nuvi-card-content">
                <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-lg">
                  Build your entire store with AI. Choose how you want to start:
                </p>
                
                <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-3 nuvi-gap-md">
                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <Type className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">From Description</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Describe your business and let AI create your store
                    </p>
                    <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                      Start with Text
                    </button>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <Globe className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">From Website</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Import content from your existing website
                    </p>
                    <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                      Import Website
                    </button>
                  </div>

                  <div className="nuvi-p-md nuvi-border nuvi-rounded-lg nuvi-hover:border-primary nuvi-transition">
                    <ImageIcon className="h-8 w-8 nuvi-text-primary nuvi-mb-md" />
                    <h4 className="nuvi-font-medium nuvi-mb-sm">From Images</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                      Upload product images and let AI do the rest
                    </p>
                    <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm nuvi-w-full">
                      Upload Images
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Tools Grid */}
            <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-gap-md">
              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">
                    <FileEdit className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                    AI Content Writer
                  </h3>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Generate product descriptions, blog posts, and marketing copy
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Sparkles className="h-4 w-4" />
                    Open AI Writer
                  </button>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">
                    <ImageIcon className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                    AI Image Generator
                  </h3>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Create unique product images and marketing visuals
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Sparkles className="h-4 w-4" />
                    Generate Images
                  </button>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">
                    <BarChart3 className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                    AI Analytics
                  </h3>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Get AI-powered insights and recommendations
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Sparkles className="h-4 w-4" />
                    View Insights
                  </button>
                </div>
              </div>

              <div className="nuvi-card">
                <div className="nuvi-card-header">
                  <h3 className="nuvi-card-title">
                    <Send className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                    AI Marketing
                  </h3>
                </div>
                <div className="nuvi-card-content">
                  <p className="nuvi-text-sm nuvi-text-secondary nuvi-mb-md">
                    Automate email campaigns and social media posts
                  </p>
                  <button className="nuvi-btn nuvi-btn-secondary nuvi-w-full">
                    <Sparkles className="h-4 w-4" />
                    Setup Automation
                  </button>
                </div>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="nuvi-card nuvi-mt-lg">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">
                  <Sparkles className="h-4 w-4 nuvi-inline nuvi-mr-sm" />
                  AI Assistant
                </h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-md nuvi-bg-surface-hover nuvi-rounded-lg">
                  <div className="nuvi-w-12 nuvi-h-12 nuvi-bg-primary-light nuvi-rounded-full nuvi-flex nuvi-items-center nuvi-justify-center">
                    <Sparkles className="h-6 w-6 nuvi-text-primary" />
                  </div>
                  <div className="nuvi-flex-1">
                    <h4 className="nuvi-font-medium">Need help with your store?</h4>
                    <p className="nuvi-text-sm nuvi-text-secondary">
                      Ask our AI assistant anything about building and growing your online store
                    </p>
                  </div>
                  <button className="nuvi-btn nuvi-btn-primary">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}