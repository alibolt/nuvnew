'use client';

import { useRouter } from 'next/navigation';
import { 
  Search, Plug, Upload, Mail, BarChart2, Zap
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

interface AppsContentProps {
  store: StoreData;
}

export function AppsContent({ store }: AppsContentProps) {
  const router = useRouter();

  return (
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
                        <Upload className="h-4 w-4" />
                        Open Import Tool
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
  );
}