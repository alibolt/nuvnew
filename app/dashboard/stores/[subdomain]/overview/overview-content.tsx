'use client';

import { 
  Package, ShoppingCart, DollarSign, Users, BarChart3, Clock, TrendingUp, Receipt
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  _count: {
    products: number;
    orders: number;
    categories: number;
    customers?: number;
  };
}

interface LineItem {
  id: string;
  quantity: number;
  price: number;
  productName: string | null;
  variantName: string | null;
}

interface Customer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalPrice: number | null;
  status: string;
  createdAt: Date;
  customer: Customer | null;
  lineItems: LineItem[];
}

interface SalesDataPoint {
  createdAt: Date;
  _sum: {
    totalPrice: number | null;
  };
}

interface OverviewContentProps {
  store: StoreData;
  recentOrders?: Order[];
  totalRevenue?: number;
  salesData?: SalesDataPoint[];
}

export function OverviewContent({ store, recentOrders = [], totalRevenue = 0, salesData = [] }: OverviewContentProps) {
  return (
    <div className="nuvi-tab-panel">
      {/* Quick Stats */}
      <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md nuvi-mb-lg">
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
              <DollarSign className="h-6 w-6 nuvi-text-primary" />
            </div>
            <h3 className="nuvi-text-2xl nuvi-font-bold">${totalRevenue.toFixed(2)}</h3>
            <p className="nuvi-text-secondary nuvi-text-sm">Total Revenue</p>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
              <ShoppingCart className="h-6 w-6 nuvi-text-primary" />
            </div>
            <h3 className="nuvi-text-2xl nuvi-font-bold">{store._count.orders}</h3>
            <p className="nuvi-text-secondary nuvi-text-sm">Total Orders</p>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
              <Package className="h-6 w-6 nuvi-text-primary" />
            </div>
            <h3 className="nuvi-text-2xl nuvi-font-bold">{store._count.products}</h3>
            <p className="nuvi-text-secondary nuvi-text-sm">Products</p>
          </div>
        </div>
        
        <div className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
              <Users className="h-6 w-6 nuvi-text-primary" />
            </div>
            <h3 className="nuvi-text-2xl nuvi-font-bold">{store._count.customers || 0}</h3>
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
            {salesData.length > 0 ? (
              <div className="nuvi-space-y-md">
                <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
                  <div>
                    <p className="nuvi-text-sm nuvi-text-muted">Last 7 days</p>
                    <p className="nuvi-text-2xl nuvi-font-bold">${salesData.reduce((sum, d) => sum + (d._sum.totalPrice || 0), 0).toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 nuvi-text-success" />
                </div>
                <div className="nuvi-h-48 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-bg-surface-hover nuvi-rounded-lg">
                  <p className="nuvi-text-sm nuvi-text-muted">Chart visualization coming soon</p>
                </div>
              </div>
            ) : (
              <div className="nuvi-h-64 nuvi-flex nuvi-items-center nuvi-justify-center nuvi-bg-surface-hover nuvi-rounded-lg">
                <div className="nuvi-text-center">
                  <BarChart3 className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                  <p className="nuvi-text-muted">No sales data yet</p>
                  <p className="nuvi-text-sm nuvi-text-muted">Sales data will appear here once you have orders</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="nuvi-card">
          <div className="nuvi-card-header">
            <h3 className="nuvi-card-title">Recent Activity</h3>
          </div>
          <div className="nuvi-card-content">
            {recentOrders.length > 0 ? (
              <div className="nuvi-space-y-md nuvi-max-h-64 nuvi-overflow-y-auto">
                {recentOrders.map((order) => (
                  <div key={order.id} className="nuvi-flex nuvi-items-center nuvi-gap-md nuvi-p-sm nuvi-bg-surface-hover nuvi-rounded-md">
                    <Receipt className="h-4 w-4 nuvi-text-primary" />
                    <div className="nuvi-flex-1">
                      <p className="nuvi-text-sm nuvi-font-medium">
                        Order #{order.orderNumber}
                      </p>
                      <p className="nuvi-text-xs nuvi-text-muted">
                        ${(order.totalPrice || 0).toFixed(2)} • {order.customer?.email || 'Guest'} • {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span className={`nuvi-badge nuvi-badge-sm ${
                      order.status === 'completed' ? 'nuvi-badge-success' : 
                      order.status === 'pending' ? 'nuvi-badge-warning' : 
                      'nuvi-badge-secondary'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="nuvi-text-center nuvi-py-lg">
                <Clock className="h-12 w-12 nuvi-text-muted nuvi-mx-auto nuvi-mb-md" />
                <p className="nuvi-text-muted">No recent activity</p>
                <p className="nuvi-text-sm nuvi-text-muted">Your store activity will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}