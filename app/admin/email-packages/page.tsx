'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mail, Search, Filter, MoreHorizontal, TrendingUp, 
  Users, DollarSign, Package, AlertTriangle, CheckCircle,
  Clock, Calendar, ExternalLink, Edit, Trash2
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface EmailPackageData {
  storeId: string;
  storeName: string;
  subdomain: string;
  planId: string;
  planName: string;
  monthlyLimit: number;
  currentUsage: number;
  remainingEmails: number;
  isActive: boolean;
  subscribedAt: string;
  expiresAt: string;
  billingCycle: string;
  price: number;
  usagePercentage: number;
}

interface EmailStats {
  totalStores: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalEmailsSent: number;
  planDistribution: Record<string, number>;
}

// Server-side imports removed - authentication should be handled at a higher level
// import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

function EmailPackagesAdminContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [packages, setPackages] = useState<EmailPackageData[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEmailPackages();
    fetchEmailStats();
  }, [currentPage, searchTerm, filterPlan, filterStatus]);

  const fetchEmailPackages = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        plan: filterPlan,
        status: filterStatus,
      });
      
      const response = await fetch(`/api/admin/email-packages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching email packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailStats = async () => {
    try {
      const response = await fetch('/api/admin/email-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching email stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmailPackages();
  };

  const getStatusColor = (isActive: boolean, expiresAt: string) => {
    if (!isActive) return 'nuvi-text-error';
    if (new Date(expiresAt) < new Date()) return 'nuvi-text-warning';
    return 'nuvi-text-success';
  };

  const getStatusText = (isActive: boolean, expiresAt: string) => {
    if (!isActive) return 'Inactive';
    if (new Date(expiresAt) < new Date()) return 'Expired';
    return 'Active';
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'nuvi-bg-error';
    if (percentage >= 70) return 'nuvi-bg-warning';
    return 'nuvi-bg-primary';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => formatPrice(amount, 'USD', 'en-US');

  if (loading) {
    return (
      <div className="nuvi-container nuvi-py-lg">
        <div className="nuvi-animate-pulse nuvi-space-y-lg">
          <div className="nuvi-h-8 nuvi-bg-muted nuvi-rounded nuvi-w-64"></div>
          <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-4 nuvi-gap-lg">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="nuvi-h-24 nuvi-bg-muted nuvi-rounded-lg"></div>
            ))}
          </div>
          <div className="nuvi-h-96 nuvi-bg-muted nuvi-rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="nuvi-flex nuvi-justify-between nuvi-items-center nuvi-mb-lg">
        <div>
          <h1 className="nuvi-text-2xl nuvi-font-bold">Email Package Management</h1>
          <p className="nuvi-text-secondary nuvi-mt-xs">
            Manage email packages and monitor usage across all stores
          </p>
        </div>
        
        <div className="nuvi-flex nuvi-gap-md">
          <button
            onClick={() => router.push('/admin/email-packages/analytics')}
            className="nuvi-btn nuvi-btn-secondary"
          >
            <TrendingUp className="h-4 w-4" />
            Analytics
          </button>
          <button
            onClick={() => router.push('/admin/email-packages/settings')}
            className="nuvi-btn nuvi-btn-primary"
          >
            <Package className="h-4 w-4" />
            Package Settings
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-lg nuvi-mb-lg">
          <div className="nuvi-card">
            <div className="nuvi-card-content nuvi-p-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-bg-blue-100 nuvi-rounded-lg">
                  <Users className="h-5 w-5 nuvi-text-blue-600" />
                </div>
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Total Stores</p>
                  <p className="nuvi-text-xl nuvi-font-bold">{stats.totalStores}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="nuvi-card">
            <div className="nuvi-card-content nuvi-p-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-bg-green-100 nuvi-rounded-lg">
                  <CheckCircle className="h-5 w-5 nuvi-text-green-600" />
                </div>
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Active Subscriptions</p>
                  <p className="nuvi-text-xl nuvi-font-bold">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="nuvi-card">
            <div className="nuvi-card-content nuvi-p-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-bg-purple-100 nuvi-rounded-lg">
                  <DollarSign className="h-5 w-5 nuvi-text-purple-600" />
                </div>
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Monthly Revenue</p>
                  <p className="nuvi-text-xl nuvi-font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="nuvi-card">
            <div className="nuvi-card-content nuvi-p-md">
              <div className="nuvi-flex nuvi-items-center nuvi-gap-md">
                <div className="nuvi-p-sm nuvi-bg-orange-100 nuvi-rounded-lg">
                  <Mail className="h-5 w-5 nuvi-text-orange-600" />
                </div>
                <div>
                  <p className="nuvi-text-sm nuvi-text-secondary">Emails Sent</p>
                  <p className="nuvi-text-xl nuvi-font-bold">{stats.totalEmailsSent.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="nuvi-card nuvi-mb-lg">
        <div className="nuvi-card-content nuvi-p-md">
          <div className="nuvi-flex nuvi-flex-col nuvi-md:flex-row nuvi-gap-md">
            <form onSubmit={handleSearch} className="nuvi-flex nuvi-gap-md nuvi-flex-1">
              <div className="nuvi-relative nuvi-flex-1">
                <Search className="nuvi-absolute nuvi-left-sm nuvi-top-1/2 nuvi-transform -nuvi-translate-y-1/2 h-4 w-4 nuvi-text-muted" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="nuvi-input nuvi-pl-lg"
                />
              </div>
              <button type="submit" className="nuvi-btn nuvi-btn-primary">
                Search
              </button>
            </form>
            
            <div className="nuvi-flex nuvi-gap-md">
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="nuvi-select"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="nuvi-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Table */}
      <div className="nuvi-card">
        <div className="nuvi-card-content nuvi-p-0">
          <div className="nuvi-overflow-x-auto">
            <table className="nuvi-w-full">
              <thead>
                <tr className="nuvi-border-b nuvi-border-border">
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Store</th>
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Plan</th>
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Usage</th>
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Status</th>
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Billing</th>
                  <th className="nuvi-text-left nuvi-p-md nuvi-font-medium nuvi-text-secondary">Expires</th>
                  <th className="nuvi-text-right nuvi-p-md nuvi-font-medium nuvi-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((pkg) => (
                  <tr key={pkg.storeId} className="nuvi-border-b nuvi-border-border hover:nuvi-bg-muted/50">
                    <td className="nuvi-p-md">
                      <div>
                        <div className="nuvi-font-medium">{pkg.storeName}</div>
                        <div className="nuvi-text-sm nuvi-text-secondary">
                          {pkg.subdomain}.nuvi.com
                        </div>
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-sm">
                        <div className={`nuvi-w-2 nuvi-h-2 nuvi-rounded-full ${{
                          free: 'nuvi-bg-gray-400',
                          starter: 'nuvi-bg-blue-400',
                          professional: 'nuvi-bg-purple-400',
                          enterprise: 'nuvi-bg-amber-400'
                        }[pkg.planId]}`}></div>
                        <span className="nuvi-font-medium">{pkg.planName}</span>
                      </div>
                      <div className="nuvi-text-sm nuvi-text-secondary">
                        {pkg.monthlyLimit === -1 ? 'Unlimited' : `${pkg.monthlyLimit.toLocaleString()} emails/mo`}
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className="nuvi-space-y-xs">
                        <div className="nuvi-flex nuvi-justify-between nuvi-text-sm">
                          <span>{pkg.currentUsage.toLocaleString()}</span>
                          <span className="nuvi-text-secondary">
                            {pkg.monthlyLimit === -1 ? '∞' : pkg.monthlyLimit.toLocaleString()}
                          </span>
                        </div>
                        {pkg.monthlyLimit !== -1 && (
                          <div className="nuvi-w-full nuvi-bg-gray-200 nuvi-rounded-full nuvi-h-1.5">
                            <div 
                              className={`nuvi-h-1.5 nuvi-rounded-full ${getUsageColor(pkg.usagePercentage)}`}
                              style={{ width: `${Math.min(pkg.usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className={`nuvi-flex nuvi-items-center nuvi-gap-xs ${getStatusColor(pkg.isActive, pkg.expiresAt)}`}>
                        {pkg.isActive && new Date(pkg.expiresAt) >= new Date() ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                        <span className="nuvi-text-sm nuvi-font-medium">
                          {getStatusText(pkg.isActive, pkg.expiresAt)}
                        </span>
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className="nuvi-font-medium">{formatCurrency(pkg.price)}</div>
                      <div className="nuvi-text-sm nuvi-text-secondary nuvi-capitalize">
                        {pkg.billingCycle}
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-xs">
                        <Calendar className="h-4 w-4 nuvi-text-muted" />
                        <span className="nuvi-text-sm">
                          {formatDate(pkg.expiresAt)}
                        </span>
                      </div>
                    </td>
                    <td className="nuvi-p-md">
                      <div className="nuvi-flex nuvi-items-center nuvi-gap-xs nuvi-justify-end">
                        <button
                          onClick={() => router.push(`/admin/stores/${pkg.subdomain}`)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                          title="View Store"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/email-packages/${pkg.storeId}/edit`)}
                          className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost"
                          title="Edit Package"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="nuvi-btn nuvi-btn-sm nuvi-btn-ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="nuvi-flex nuvi-justify-center nuvi-mt-lg">
          <div className="nuvi-flex nuvi-gap-sm">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`nuvi-btn nuvi-btn-sm ${
                  currentPage === i + 1 ? 'nuvi-btn-primary' : 'nuvi-btn-secondary'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="nuvi-btn nuvi-btn-secondary nuvi-btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailPackagesAdmin() {
  // Note: Authentication should be handled at a higher level or through middleware
  // For now, we'll render the content directly
  return <EmailPackagesAdminContent />;
}