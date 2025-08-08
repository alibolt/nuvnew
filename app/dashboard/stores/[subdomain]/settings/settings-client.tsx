'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', gap: '24px' }}>
      {/* Settings Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: 'white',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Back Button at top of sidebar */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => router.push(`/dashboard/stores/${store.subdomain}/overview`)}
            style={{
              width: '100%',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#f3f4f6',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
        
        {/* Settings Navigation */}
        <div style={{ flex: 1, padding: '8px', overflow: 'auto' }}>
          <SettingsNavigationUnified subdomain={store.subdomain} />
        </div>
      </aside>

      {/* Settings Content */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
      }}>
        {children}
      </div>
    </div>
  );
}