'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Mail, Users, 
  DollarSign, Calendar, PieChart, BarChart3, Activity,
  Download, RefreshCw
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface EmailStats {
  totalStores: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalEmailsSent: number;
  planDistribution: Record<string, number>;
  planDistributionWithPercentages: Array<{
    plan: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    month: string;
    emails: number;
  }>;
  topStores: Array<{
    storeId: string;
    storeName: string;
    subdomain: string;
    emailCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    storeName: string;
    subdomain: string;
    to: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  generatedAt: string;
}

export default function EmailAnalyticsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/email-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => formatPrice(amount, 'USD', 'en-US');

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const downloadCSV = () => {
    if (!stats) return;
    
    // Create CSV content
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Stores', stats.totalStores],
      ['Active Subscriptions', stats.activeSubscriptions],
      ['Total Revenue', stats.totalRevenue],
      ['Total Emails Sent', stats.totalEmailsSent],
      ...Object.entries(stats.planDistribution).map(([plan, count]) => [
        `${plan} Plan Stores`, count
      ])
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="nuvi-flex nuvi-items-center nuvi-justify-center nuvi-h-screen">
        <div className="nuvi-text-center">
          <div className="nuvi-spinner nuvi-mb-lg"></div>
          <p className="nuvi-text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nuvi-p-xl">
      {/* Header */}
      <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-xl">
        <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
          <button
            onClick={() => router.push('/admin/email-packages')}
            className="nuvi-btn nuvi-btn-ghost nuvi-btn-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="nuvi-text-2xl nuvi-font-bold">Email Analytics</h1>
            <p className="nuvi-text-sm nuvi-text-muted">
              Track email usage and subscription performance
            </p>
          </div>
        </div>
        <div className="nuvi-flex nuvi-gap-sm">
          <button
            onClick={downloadCSV}
            className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="nuvi-btn nuvi-btn-primary nuvi-btn-sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Key Metrics */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total Stores</p>
                    <p className="nuvi-text-2xl nuvi-font-bold">{formatNumber(stats.totalStores)}</p>
                  </div>
                  <Users className="h-8 w-8 nuvi-text-primary nuvi-opacity-20" />
                </div>
              </div>
            </div>
            
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <p className="nuvi-text-sm nuvi-text-muted">Active Subscriptions</p>
                    <p className="nuvi-text-2xl nuvi-font-bold">{formatNumber(stats.activeSubscriptions)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 nuvi-text-success nuvi-opacity-20" />
                </div>
              </div>
            </div>
            
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <p className="nuvi-text-sm nuvi-text-muted">Total Revenue</p>
                    <p className="nuvi-text-2xl nuvi-font-bold">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 nuvi-text-warning nuvi-opacity-20" />
                </div>
              </div>
            </div>
            
            <div className="nuvi-card">
              <div className="nuvi-card-content">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between">
                  <div>
                    <p className="nuvi-text-sm nuvi-text-muted">Emails Sent</p>
                    <p className="nuvi-text-2xl nuvi-font-bold">{formatNumber(stats.totalEmailsSent)}</p>
                  </div>
                  <Mail className="h-8 w-8 nuvi-text-info nuvi-opacity-20" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-md nuvi-mb-lg">
            {/* Plan Distribution */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <PieChart className="h-5 w-5" />
                  Plan Distribution
                </h3>
              </div>
              <div className="nuvi-card-content">
                {stats.planDistributionWithPercentages.map(({ plan, count, percentage }) => (
                  <div key={plan} className="nuvi-mb-md">
                    <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-sm">
                      <span className="nuvi-text-sm nuvi-font-medium">{plan}</span>
                      <span className="nuvi-text-sm nuvi-text-muted">
                        {count} stores ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="nuvi-progress">
                      <div 
                        className="nuvi-progress-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Usage Trend */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <BarChart3 className="h-5 w-5" />
                  Email Usage Trend
                </h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {stats.monthlyStats.map((stat) => (
                    <div key={stat.month} className="nuvi-flex nuvi-items-center nuvi-justify-between">
                      <span className="nuvi-text-sm">{stat.month}</span>
                      <span className="nuvi-text-sm nuvi-font-medium">
                        {formatNumber(stat.emails)} emails
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Stores and Recent Activity */}
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-lg:grid-cols-2 nuvi-gap-md">
            {/* Top Stores */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <TrendingUp className="h-5 w-5" />
                  Top Stores by Email Usage
                </h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {stats.topStores.map((store, index) => (
                    <div key={store.storeId} className="nuvi-flex nuvi-items-center nuvi-justify-between">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <span className="nuvi-badge nuvi-badge-secondary nuvi-badge-sm">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="nuvi-font-medium">{store.storeName}</p>
                          <p className="nuvi-text-xs nuvi-text-muted">{store.subdomain}</p>
                        </div>
                      </div>
                      <span className="nuvi-text-sm nuvi-font-medium">
                        {formatNumber(store.emailCount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="nuvi-card">
              <div className="nuvi-card-header">
                <h3 className="nuvi-card-title nuvi-flex nuvi-items-center nuvi-gap-sm">
                  <Activity className="h-5 w-5" />
                  Recent Email Activity
                </h3>
              </div>
              <div className="nuvi-card-content">
                <div className="nuvi-space-y-sm">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="nuvi-border-b nuvi-pb-sm">
                      <div className="nuvi-flex nuvi-items-start nuvi-justify-between">
                        <div className="nuvi-flex-1">
                          <p className="nuvi-text-sm nuvi-font-medium">
                            {activity.storeName}
                          </p>
                          <p className="nuvi-text-xs nuvi-text-muted nuvi-truncate">
                            To: {activity.to}
                          </p>
                          <p className="nuvi-text-xs nuvi-text-muted nuvi-truncate">
                            {activity.subject}
                          </p>
                        </div>
                        <div className="nuvi-text-right">
                          <span className={`nuvi-badge nuvi-badge-sm ${
                            activity.status === 'sent' ? 'nuvi-badge-success' : 'nuvi-badge-error'
                          }`}>
                            {activity.status}
                          </span>
                          <div className="nuvi-text-xs nuvi-text-muted nuvi-mt-xs">
                            {new Date(activity.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}