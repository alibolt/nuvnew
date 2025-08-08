'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingCart, Users, DollarSign, Calendar, Package, Search } from 'lucide-react';
import Link from 'next/link';

interface AnalyticsClientProps {
  storeId: string;
  subdomain: string;
  initialStats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
  };
}

export function AnalyticsClient({ storeId, subdomain, initialStats }: AnalyticsClientProps) {
  const [timeRange, setTimeRange] = useState('7days');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${subdomain}/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setSalesData(data.salesData || []);
        setTopProducts(data.topProducts || []);
        setOrdersByStatus(data.ordersByStatus || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Revenue',
      value: `$${initialStats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-[#8B9F7E]',
      bgColor: 'bg-[#8B9F7E]/10',
      trend: '+12.5%',
      trendUp: true
    },
    {
      title: 'Total Orders',
      value: initialStats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+5.2%',
      trendUp: true
    },
    {
      title: 'Total Products',
      value: initialStats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+2',
      trendUp: true
    },
    {
      title: 'Total Customers',
      value: initialStats.totalCustomers.toString(),
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '+8.1%',
      trendUp: true
    }
  ];

  const COLORS = ['#3B82F6', '#8B9F7E', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="nuvi-tab-panel">
      <div className="nuvi-mb-lg">
        <div className="nuvi-flex nuvi-justify-between nuvi-items-center">
          <div>
            <h2 className="nuvi-text-2xl nuvi-font-bold">Analytics Dashboard</h2>
            <p className="nuvi-text-secondary nuvi-text-sm">Track your store's performance and insights</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="nuvi-select nuvi-w-40"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="12months">Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                  <div className={`nuvi-p-sm nuvi-rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <span className={`nuvi-text-sm nuvi-font-medium ${stat.trendUp ? 'nuvi-text-success' : 'nuvi-text-destructive'}`}>
                    {stat.trend}
                  </span>
                </div>
                <h3 className="nuvi-text-2xl nuvi-font-bold">{stat.value}</h3>
                <p className="nuvi-text-secondary nuvi-text-sm">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-md">
        {/* Sales Over Time */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h2 className="nuvi-card-title">Sales Over Time</h2>
          </div>
          <div className="nuvi-card-content">
            {loading ? (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center">
                <div className="nuvi-loading-spinner nuvi-loading-lg" />
              </div>
            ) : salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-text-muted">
                <p>No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h2 className="nuvi-card-title">Top Products</h2>
          </div>
          <div className="nuvi-card-content">
            {loading ? (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center">
                <div className="nuvi-loading-spinner nuvi-loading-lg" />
              </div>
            ) : topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <BarChart data={topProducts} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-text-muted">
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h2 className="nuvi-card-title">Orders by Status</h2>
          </div>
          <div className="nuvi-card-content">
            {loading ? (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center">
                <div className="nuvi-loading-spinner nuvi-loading-lg" />
              </div>
            ) : ordersByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={256}>
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-text-muted">
                <p>No order data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Search Analytics Link */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h2 className="nuvi-card-title">Search Analytics</h2>
          </div>
          <div className="nuvi-card-content">
            <div className="nuvi-space-y-md">
              <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                  <div className="nuvi-p-sm nuvi-rounded-full nuvi-bg-[#8B9F7E]/10">
                    <Search className="h-4 w-4 nuvi-text-[#8B9F7E]" />
                  </div>
                  <div>
                    <p className="nuvi-text-sm nuvi-font-medium">Search Performance</p>
                    <p className="nuvi-text-xs nuvi-text-muted">View detailed search analytics</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/stores/${subdomain}/analytics/search`}
                  className="nuvi-btn nuvi-btn-outline nuvi-btn-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h2 className="nuvi-card-title">Recent Activity</h2>
          </div>
          <div className="nuvi-card-content">
            <div className="nuvi-space-y-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-rounded-full nuvi-bg-blue-100">
                  <ShoppingCart className="h-4 w-4 nuvi-text-blue-600" />
                </div>
                <div className="nuvi-flex-1">
                  <p className="nuvi-text-sm nuvi-font-medium">New Order #1234</p>
                  <p className="nuvi-text-xs nuvi-text-muted">2 minutes ago</p>
                </div>
                <span className="nuvi-text-sm nuvi-font-medium">$125.00</span>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-rounded-full nuvi-bg-[#8B9F7E]/10">
                  <Users className="h-4 w-4 nuvi-text-[#8B9F7E]" />
                </div>
                <div className="nuvi-flex-1">
                  <p className="nuvi-text-sm nuvi-font-medium">New Customer Registration</p>
                  <p className="nuvi-text-xs nuvi-text-muted">15 minutes ago</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-rounded-full nuvi-bg-purple-100">
                  <Package className="h-4 w-4 nuvi-text-purple-600" />
                </div>
                <div className="nuvi-flex-1">
                  <p className="nuvi-text-sm nuvi-font-medium">Product Stock Updated</p>
                  <p className="nuvi-text-xs nuvi-text-muted">1 hour ago</p>
                </div>
              </div>
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-rounded-full nuvi-bg-orange-100">
                  <TrendingUp className="h-4 w-4 nuvi-text-orange-600" />
                </div>
                <div className="nuvi-flex-1">
                  <p className="nuvi-text-sm nuvi-font-medium">Daily Sales Goal Reached</p>
                  <p className="nuvi-text-xs nuvi-text-muted">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}