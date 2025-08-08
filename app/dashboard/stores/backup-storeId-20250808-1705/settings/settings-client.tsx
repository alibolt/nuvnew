'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { 
  Store as StoreIcon, CreditCard, Users, Truck, Globe, Shield, 
  Bell, Languages, Mail, Palette, Code, Database, Smartphone,
  Settings as SettingsIcon
} from 'lucide-react';
import { SettingsNavigationUnified } from './settings-navigation-unified';

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  customDomain: string | null;
  _count: {
    products: number;
    orders: number;
    categories: number;
  };
}

interface SettingsClientProps {
  store: StoreData;
  children: React.ReactNode;
}

export function SettingsClient({ store, children }: SettingsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Determine active section from pathname
  const getActiveSection = () => {
    if (pathname.includes('/store-details')) return 'store-details';
    if (pathname.includes('/payments')) return 'payments';
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/shipping')) return 'shipping';
    if (pathname.includes('/domains')) return 'domains';
    if (pathname.includes('/checkout')) return 'checkout';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/languages')) return 'languages';
    if (pathname.includes('/customer-accounts')) return 'customer-accounts';
    if (pathname.includes('/brand')) return 'brand';
    if (pathname.includes('/code')) return 'code';
    if (pathname.includes('/data')) return 'data';
    if (pathname.includes('/apps')) return 'apps';
    return 'general';
  };

  const [activeSection, setActiveSection] = useState(getActiveSection());
  
  useEffect(() => {
    setActiveSection(getActiveSection());
  }, [pathname]);

  return (
    <div className="nuvi-tab-panel">
      <div className="nuvi-flex nuvi-gap-lg">
        {/* Settings Sidebar */}
        <div className="nuvi-w-64 nuvi-flex-shrink-0">
          <SettingsNavigationUnified storeId={store.id} />
        </div>

        {/* Settings Content */}
        <div className="nuvi-flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}