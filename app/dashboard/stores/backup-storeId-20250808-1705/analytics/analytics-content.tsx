'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package,
  Calendar, Filter, Download, RefreshCw, ArrowUp, ArrowDown, Activity,
  BarChart3, PieChart as PieChartIcon, Clock, AlertTriangle, Mail, AlertCircle
} from 'lucide-react';

interface AnalyticsContentProps {
  storeId: string;
}

export function AnalyticsContent({ storeId }: AnalyticsContentProps) {
  const [dateRange, setDateRange] = useState('30'); // days
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'customers'>('overview');
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = `/api/stores/${storeId}/analytics/${activeTab}?period=${dateRange}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Analytics API error:', response.status, errorData);
        throw new Error(errorData.error || `Failed to fetch analytics: ${response.status}`);
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [storeId, dateRange, activeTab]);

  // Chart colors
  const COLORS = ['#008060', '#D4A5A5', '#8B9F7E', '#F59E0B', '#3B82F6', '#8B5CF6'];

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.0%';
    }
    const formatted = value.toFixed(1);
    return value > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  return (
    <div className="nuvi-tab-panel nuvi-animate-slide-up">
      {/* Header */}
      <div className="nuvi-page-header">
        <div>
          <h2 className="nuvi-page-title">Analytics Dashboard</h2>
          <p className="nuvi-page-description">
            Track your store performance and gain insights
          </p>
        </div>
        <div className="nuvi-flex nuvi-gap-md">
          {/* Date Range Selector */}
          <select
            className="nuvi-select nuvi-btn-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          
          <button 
            onClick={fetchAnalytics}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button className="nuvi-btn nuvi-btn-primary nuvi-btn-sm">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="nuvi-sub-tabs">
        <div className="nuvi-sub-tabs-list">
          <button
            onClick={() => setActiveTab('overview')}
            className={`nuvi-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <BarChart3 className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`nuvi-tab ${activeTab === 'products' ? 'active' : ''}`}
          >
            <Package className="h-4 w-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`nuvi-tab ${activeTab === 'customers' ? 'active' : ''}`}
          >
            <Users className="h-4 w-4" />
            Customers
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="nuvi-text-center nuvi-py-xl">
          <RefreshCw className="h-8 w-8 animate-spin nuvi-mx-auto nuvi-text-primary" />
          <p className="nuvi-text-muted nuvi-mt-md">Loading analytics data...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-text-center nuvi-py-xl">
            <AlertCircle className="h-12 w-12 nuvi-mx-auto nuvi-text-error nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">Failed to Load Analytics</h3>
            <p className="nuvi-text-muted nuvi-mb-md">{error}</p>
            <button 
              onClick={fetchAnalytics}
              className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && !data && (
        <div className="nuvi-card">
          <div className="nuvi-card-content nuvi-text-center nuvi-py-xl">
            <BarChart3 className="h-12 w-12 nuvi-mx-auto nuvi-text-muted nuvi-mb-md" />
            <h3 className="nuvi-text-lg nuvi-font-semibold nuvi-mb-sm">No Analytics Data</h3>
            <p className="nuvi-text-muted">Start making sales to see your analytics data here.</p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {!loading && !error && activeTab === 'overview' && data?.overview && (
        <div className="nuvi-space-y-lg">
          {/* Key Metrics */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md">
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <div className="nuvi-p-2 nuvi-bg-green-100 nuvi-rounded-lg">
                    <DollarSign className="h-6 w-6 nuvi-text-green-600" />
                  </div>
                  <span className={`nuvi-text-sm nuvi-font-medium ${
                    data.overview.revenueChange >= 0 ? 'nuvi-text-success' : 'nuvi-text-error'
                  }`}>
                    {data.overview.revenueChange >= 0 ? <ArrowUp className="h-4 w-4 inline" /> : <ArrowDown className="h-4 w-4 inline" />}
                    {formatPercentage(data.overview.revenueChange)}
                  </span>
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(data.overview.totalRevenue)}</h3>
                <p className="nuvi-text-sm nuvi-text-muted">Total Revenue</p>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <div className="nuvi-p-2 nuvi-bg-blue-100 nuvi-rounded-lg">
                    <ShoppingCart className="h-6 w-6 nuvi-text-blue-600" />
                  </div>
                  <span className={`nuvi-text-sm nuvi-font-medium ${
                    data.overview.orderCountChange >= 0 ? 'nuvi-text-success' : 'nuvi-text-error'
                  }`}>
                    {data.overview.orderCountChange >= 0 ? <ArrowUp className="h-4 w-4 inline" /> : <ArrowDown className="h-4 w-4 inline" />}
                    {formatPercentage(data.overview.orderCountChange)}
                  </span>
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{data.overview.ordersInPeriod}</h3>
                <p className="nuvi-text-sm nuvi-text-muted">Orders</p>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <div className="nuvi-p-2 nuvi-bg-purple-100 nuvi-rounded-lg">
                    <Activity className="h-6 w-6 nuvi-text-purple-600" />
                  </div>
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(data.overview.averageOrderValue)}</h3>
                <p className="nuvi-text-sm nuvi-text-muted">Avg Order Value</p>
              </div>
            </div>

            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                  <div className="nuvi-p-2 nuvi-bg-orange-100 nuvi-rounded-lg">
                    <Users className="h-6 w-6 nuvi-text-orange-600" />
                  </div>
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{data.overview.totalCustomers}</h3>
                <p className="nuvi-text-sm nuvi-text-muted">Total Customers</p>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Sales Over Time</h3>
            </div>
            <div className="nuvi-card-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.charts.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6d7175"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis 
                    stroke="#6d7175"
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'revenue') return formatCurrency(value);
                      return value;
                    }}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#008060" 
                    fill="#008060" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-lg">
            {/* Order Status Breakdown */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Order Status Distribution</h3>
              </div>
              <div className="nuvi-card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.charts.orderStatusBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ status, percentage }) => `${status} (${percentage}%)`}
                    >
                      {data.charts.orderStatusBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Recent Orders</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {data.recentActivity.orders.map((order: any) => (
                    <div key={order.id} className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-py-sm nuvi-border-b">
                      <div>
                        <p className="nuvi-font-medium">#{order.orderNumber}</p>
                        <p className="nuvi-text-sm nuvi-text-muted">{order.customerName}</p>
                      </div>
                      <div className="nuvi-text-right">
                        <p className="nuvi-font-medium">{formatCurrency(order.totalAmount)}</p>
                        <p className="nuvi-text-xs nuvi-text-muted">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {data.recentActivity.orders.length === 0 && (
                    <p className="nuvi-text-center nuvi-text-muted nuvi-py-md">No recent orders</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {!loading && !error && activeTab === 'products' && data?.summary && (
        <div className="nuvi-space-y-lg">
          {/* Product Summary Stats */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-5 nuvi-gap-md">
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <Package className="h-5 w-5 nuvi-text-primary" />
                  <h4 className="nuvi-font-medium">Total Products</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.totalProducts}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <DollarSign className="h-5 w-5 nuvi-text-green-600" />
                  <h4 className="nuvi-font-medium">Inventory Value</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(data.summary.totalInventoryValue)}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <Package className="h-5 w-5 nuvi-text-blue-600" />
                  <h4 className="nuvi-font-medium">Stock Units</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.totalStockUnits}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <AlertTriangle className="h-5 w-5 nuvi-text-warning" />
                  <h4 className="nuvi-font-medium">Low Stock</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.lowStockCount}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <AlertTriangle className="h-5 w-5 nuvi-text-error" />
                  <h4 className="nuvi-font-medium">Out of Stock</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.outOfStockCount}</p>
              </div>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Best Selling Products</h3>
            </div>
            <div className="nuvi-card-content nuvi-p-0">
              <div className="nuvi-table-container">
                <table className="nuvi-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Sold</th>
                      <th>Revenue</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bestSellers.map((product: any) => (
                      <tr key={product.id}>
                        <td>
                          <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                            {product.imageUrl && (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name}
                                className="nuvi-w-10 nuvi-h-10 nuvi-rounded nuvi-object-cover"
                              />
                            )}
                            <span className="nuvi-font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>{product.totalQuantitySold}</td>
                        <td className="nuvi-font-medium">{formatCurrency(product.totalRevenue)}</td>
                        <td>
                          <span className={`nuvi-badge ${
                            product.outOfStock ? 'nuvi-badge-error' :
                            product.lowStock ? 'nuvi-badge-warning' :
                            'nuvi-badge-success'
                          }`}>
                            {product.currentStock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Category Performance */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Category Performance</h3>
            </div>
            <div className="nuvi-card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="category" stroke="#6d7175" fontSize={12} />
                  <YAxis stroke="#6d7175" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#008060" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {!loading && !error && activeTab === 'customers' && data?.summary && (
        <div className="nuvi-space-y-lg">
          {/* Customer Summary */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md">
            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <Users className="h-5 w-5 nuvi-text-primary" />
                  <h4 className="nuvi-font-medium">Total Customers</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.totalCustomers}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <TrendingUp className="h-5 w-5 nuvi-text-success" />
                  <h4 className="nuvi-font-medium">New This Period</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.newCustomersInPeriod}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <DollarSign className="h-5 w-5 nuvi-text-green-600" />
                  <h4 className="nuvi-font-medium">Avg Lifetime Value</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(data.summary.averageLifetimeValue)}</p>
              </div>
            </div>

            <div className="nuvi-card nuvi-card-compact">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-sm nuvi-mb-sm">
                  <Mail className="h-5 w-5 nuvi-text-blue-600" />
                  <h4 className="nuvi-font-medium">Marketing Consent</h4>
                </div>
                <p className="nuvi-text-2xl nuvi-font-bold">{data.summary.marketingConsentRate?.toFixed(1) || '0.0'}%</p>
              </div>
            </div>
          </div>

          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-lg">
            {/* Customer Segments */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Customer Segments</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-md">
                  <div>
                    <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                      <span className="nuvi-font-medium">VIP Customers ($1000+)</span>
                      <span>{data.segments.vip.count} ({data.segments.vip.percentage?.toFixed(1) || '0.0'}%)</span>
                    </div>
                    <div className="nuvi-progress-bar">
                      <div 
                        className="nuvi-progress-fill nuvi-bg-purple-600" 
                        style={{ width: `${data.segments.vip.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                      <span className="nuvi-font-medium">Regular ($100-$1000)</span>
                      <span>{data.segments.regular.count} ({data.segments.regular.percentage?.toFixed(1) || '0.0'}%)</span>
                    </div>
                    <div className="nuvi-progress-bar">
                      <div 
                        className="nuvi-progress-fill nuvi-bg-blue-600" 
                        style={{ width: `${data.segments.regular.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                      <span className="nuvi-font-medium">Occasional ($0-$100)</span>
                      <span>{data.segments.occasional.count} ({data.segments.occasional.percentage?.toFixed(1) || '0.0'}%)</span>
                    </div>
                    <div className="nuvi-progress-bar">
                      <div 
                        className="nuvi-progress-fill nuvi-bg-green-600" 
                        style={{ width: `${data.segments.occasional.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="nuvi-flex nuvi-justify-between nuvi-mb-xs">
                      <span className="nuvi-font-medium">Inactive ($0)</span>
                      <span>{data.segments.inactive.count} ({data.segments.inactive.percentage?.toFixed(1) || '0.0'}%)</span>
                    </div>
                    <div className="nuvi-progress-bar">
                      <div 
                        className="nuvi-progress-fill nuvi-bg-gray-600" 
                        style={{ width: `${data.segments.inactive.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Customers */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title">Top Customers</h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {data.topCustomers.map((customer: any, index: number) => (
                    <div key={customer.id} className="nuvi-flex nuvi-items-center nuvi-justify-between">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <span className="nuvi-text-sm nuvi-text-muted">#{index + 1}</span>
                        <div>
                          <p className="nuvi-font-medium">{customer.name}</p>
                          <p className="nuvi-text-xs nuvi-text-muted">{customer.email}</p>
                        </div>
                      </div>
                      <div className="nuvi-text-right">
                        <p className="nuvi-font-medium">{formatCurrency(customer.totalSpent)}</p>
                        <p className="nuvi-text-xs nuvi-text-muted">{customer.orderCount} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Growth Chart */}
          <div className="nuvi-card">
            <div className="nuvi-card-header">
              <h3 className="nuvi-card-title">Customer Growth</h3>
            </div>
            <div className="nuvi-card-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.customerGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6d7175"
                    fontSize={12}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis stroke="#6d7175" fontSize={12} />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString();
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalCustomers" 
                    stroke="#008060" 
                    strokeWidth={2}
                    name="Total Customers"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newCustomers" 
                    stroke="#D4A5A5" 
                    strokeWidth={2}
                    name="New Customers"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}