
"use client";

import Link from 'next/link';
import {
  Package, ShoppingCart, DollarSign, Users, BarChart3, Store, Mail
} from 'lucide-react';

// Define types for the data
interface PlatformStats {
  totalRevenue: number;
  totalUsers: number;
  totalStores: number;
  totalOrders: number;
  totalEmailsSent?: number;
  activeEmailSubscriptions?: number;
  recentUsers: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: Date;
  }[];
}

interface AdminDashboardContentProps {
  stats: PlatformStats;
}

export function AdminDashboardContent({ stats }: AdminDashboardContentProps) {
  return (
    <div> {/* Removed p-4 md:p-8 */}
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <StatCard 
          title="Total Revenue"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6 text-gray-500" />}
        />
        <StatCard 
          title="Total Users"
          value={stats.totalUsers.toString()}
          icon={<Users className="h-6 w-6 text-gray-500" />}
          link="/admin/users"
        />
        <StatCard 
          title="Total Stores"
          value={stats.totalStores.toString()}
          icon={<Store className="h-6 w-6 text-gray-500" />}
        />
        <StatCard 
          title="Total Orders"
          value={stats.totalOrders.toString()}
          icon={<ShoppingCart className="h-6 w-6 text-gray-500" />}
        />
        <StatCard 
          title="Emails Sent"
          value={stats.totalEmailsSent?.toLocaleString() || '0'}
          icon={<Mail className="h-6 w-6 text-gray-500" />}
          link="/admin/email-packages/analytics"
        />
        <StatCard 
          title="Email Subscriptions"
          value={stats.activeEmailSubscriptions?.toString() || '0'}
          icon={<Package className="h-6 w-6 text-gray-500" />}
          link="/admin/email-packages"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Sales Overview</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Sales chart coming soon</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">Recent Signups</h3>
          <div className="space-y-4">
            {stats.recentUsers.map(user => (
              <div key={user.id} className="flex items-center">
                <div className="flex-1">
                  <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                    {user.name || 'Unnamed User'}
                  </Link>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
             {stats.recentUsers.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                    No recent signups.
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// A reusable StatCard component
function StatCard({ title, value, icon, link }: { title: string; value: string; icon: React.ReactNode; link?: string }) {
  const cardContent = (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        {icon}
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );

  if (link) {
    return <Link href={link}>{cardContent}</Link>;
  }
  return cardContent;
}
