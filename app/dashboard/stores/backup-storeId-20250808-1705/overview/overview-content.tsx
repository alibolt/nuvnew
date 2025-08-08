'use client';

import Link from 'next/link';
import { 
  Package, ShoppingCart, DollarSign, Users, BarChart3, 
  Plus, Palette, Settings, Store
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

interface OverviewContentProps {
  store: StoreData;
}

export function OverviewContent({ store }: OverviewContentProps) {
  return (
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
            <Link 
              href={`/dashboard/stores/${store.id}/products`} 
              className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
            <Link 
              href={`/dashboard/stores/${store.id}/theme-studio`} 
              className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2"
            >
              <Palette className="h-4 w-4" />
              Customize Theme
            </Link>
            <Link 
              href={`/dashboard/stores/${store.id}/settings`} 
              className="nuvi-btn nuvi-btn-secondary nuvi-w-full nuvi-flex nuvi-items-center nuvi-justify-center nuvi-gap-2"
            >
              <Settings className="h-4 w-4" />
              Store Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}