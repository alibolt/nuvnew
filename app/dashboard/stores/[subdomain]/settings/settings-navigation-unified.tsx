'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Store, 
  Globe, 
  CreditCard, 
  Users, 
  Truck, 
  Shield, 
  FileText,
  Palette,
  Languages,
  Receipt,
  Gift,
  Package,
  BarChart3,
  ShoppingCart,
  Mail,
  MapPin
} from 'lucide-react';

export function SettingsNavigationUnified({ subdomain }: { subdomain: string }) {
  const pathname = usePathname();
  
  const settingsNavigation = [
    { 
      section: 'General',
      items: [
        { name: 'Store Settings', href: `/dashboard/stores/${subdomain}/settings`, icon: Store },
        { name: 'Plan & Billing', href: `/dashboard/stores/${subdomain}/settings/billing`, icon: CreditCard },
        { name: 'Users & Permissions', href: `/dashboard/stores/${subdomain}/settings/users`, icon: Users },
      ]
    },
    {
      section: 'Store Setup',
      items: [
        { name: 'Domains & URLs', href: `/dashboard/stores/${subdomain}/settings/domains`, icon: Globe },
        { name: 'Languages', href: `/dashboard/stores/${subdomain}/settings/languages`, icon: Languages },
        { name: 'Currency', href: `/dashboard/stores/${subdomain}/settings/currency`, icon: Receipt },
        { name: 'Locations', href: `/dashboard/stores/${subdomain}/settings/locations`, icon: MapPin },
      ]
    },
    {
      section: 'Payments & Checkout',
      items: [
        { name: 'Payment Methods', href: `/dashboard/stores/${subdomain}/settings/payments`, icon: CreditCard },
        { name: 'Checkout', href: `/dashboard/stores/${subdomain}/settings/checkout`, icon: ShoppingCart },
        { name: 'Taxes', href: `/dashboard/stores/${subdomain}/settings/taxes`, icon: Receipt },
        { name: 'Gift Cards', href: `/dashboard/stores/${subdomain}/settings/gift-cards`, icon: Gift },
      ]
    },
    {
      section: 'Shipping & Delivery',
      items: [
        { name: 'Shipping Rates', href: `/dashboard/stores/${subdomain}/settings/shipping`, icon: Truck },
        { name: 'Custom Fields', href: `/dashboard/stores/${subdomain}/settings/custom-data`, icon: Package },
      ]
    },
    {
      section: 'Customer Experience',
      items: [
        { name: 'Store Policies', href: `/dashboard/stores/${subdomain}/settings/policies`, icon: Shield },
        { name: 'Email Templates', href: `/dashboard/stores/${subdomain}/settings/emails`, icon: Mail },
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