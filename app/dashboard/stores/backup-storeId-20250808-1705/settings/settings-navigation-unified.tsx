'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  Globe, 
  CreditCard, 
  Users, 
  Truck, 
  Bell, 
  Shield, 
  FileText,
  Palette,
  Languages,
  Receipt,
  Gift,
  Package,
  BarChart3,
  ShoppingCart
} from 'lucide-react';

export function SettingsNavigationUnified({ storeId }: { storeId: string }) {
  const pathname = usePathname();
  
  const settingsNavigation = [
    { 
      section: 'Store settings',
      items: [
        { name: 'General', href: `/dashboard/stores/${storeId}/settings`, icon: Store },
        { name: 'Store details', href: `/dashboard/stores/${storeId}/settings/store-details`, icon: FileText },
        { name: 'Plan & Billing', href: `/dashboard/stores/${storeId}/settings/billing`, icon: CreditCard },
        { name: 'Users and permissions', href: `/dashboard/stores/${storeId}/settings/users`, icon: Users },
      ]
    },
    {
      section: 'Store management',
      items: [
        { name: 'Languages', href: `/dashboard/stores/${storeId}/settings/languages`, icon: Languages },
        { name: 'Store currency', href: `/dashboard/stores/${storeId}/settings/currency`, icon: Receipt },
        { name: 'Taxes and duties', href: `/dashboard/stores/${storeId}/settings/taxes`, icon: Receipt },
      ]
    },
    {
      section: 'Sales channels',
      items: [
        { name: 'Domains', href: `/dashboard/stores/${storeId}/settings/domains`, icon: Globe },
      ]
    },
    {
      section: 'Payments',
      items: [
        { name: 'Payment providers', href: `/dashboard/stores/${storeId}/settings/payments`, icon: CreditCard },
        { name: 'Checkout', href: `/dashboard/stores/${storeId}/settings/checkout`, icon: ShoppingCart },
        { name: 'Gift cards', href: `/dashboard/stores/${storeId}/settings/gift-cards`, icon: Gift },
      ]
    },
    {
      section: 'Fulfillment',
      items: [
        { name: 'Shipping & Delivery', href: `/dashboard/stores/${storeId}/settings/shipping`, icon: Truck },
        { name: 'Locations', href: `/dashboard/stores/${storeId}/settings/locations`, icon: Package },
        { name: 'Custom data', href: `/dashboard/stores/${storeId}/settings/custom-data`, icon: BarChart3 },
      ]
    },
    {
      section: 'Store policies',
      items: [
        { name: 'Policies', href: `/dashboard/stores/${storeId}/settings/policies`, icon: Shield },
        { name: 'Notifications', href: `/dashboard/stores/${storeId}/settings/notifications`, icon: Bell },
      ]
    }
  ];

  return (
    <nav className="nuvi-sidebar-nav">
      {settingsNavigation.map((section, sectionIndex) => (
        <div key={sectionIndex} className="nuvi-sidebar-section">
          <h3 className="nuvi-sidebar-section-title">
            {section.section}
          </h3>
          <div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nuvi-sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nuvi-sidebar-link-icon" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}