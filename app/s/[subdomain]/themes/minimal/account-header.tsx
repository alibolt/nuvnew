'use client';

import { useTheme } from '../../theme-provider';
import { MinimalIcons } from '@/components/icons/minimal-icons';

interface AccountHeaderProps {
  settings?: any;
  pageData?: {
    customer?: any;
  };
}

export function AccountHeader({ settings: sectionSettings, pageData }: AccountHeaderProps) {
  const { settings } = useTheme();
  
  const showGreeting = sectionSettings?.showGreeting ?? true;
  const showStats = sectionSettings?.showStats ?? true;
  
  const customer = pageData?.customer;
  const firstName = customer?.firstName || '';
  const lastName = customer?.lastName || '';
  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : customer?.email?.split('@')[0] || 'Customer';
  const orderCount = customer?._count?.orders || 0;
  const memberSince = customer?.createdAt ? new Date(customer.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <section 
      className="py-12 border-b"
      style={{
        backgroundColor: 'var(--theme-background)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div className="text-center">
          {showGreeting && (
            <h1 
              className="mb-4"
              style={{
                fontSize: 'var(--theme-text-3xl)',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: 'var(--theme-font-weight-light)',
                color: 'var(--theme-text)',
              }}
            >
              Welcome back, {displayName}
            </h1>
          )}

          {showStats && (
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MinimalIcons.Package 
                    size={24} 
                    style={{ color: 'var(--theme-primary)' }}
                  />
                </div>
                <div 
                  className="text-2xl font-light"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-heading)',
                  }}
                >
                  {orderCount}
                </div>
                <div 
                  className="text-sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Total Orders
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <MinimalIcons.Calendar 
                    size={24} 
                    style={{ color: 'var(--theme-primary)' }}
                  />
                </div>
                <div 
                  className="text-2xl font-light"
                  style={{
                    color: 'var(--theme-text)',
                    fontFamily: 'var(--theme-font-heading)',
                  }}
                >
                  {memberSince}
                </div>
                <div 
                  className="text-sm"
                  style={{
                    color: 'var(--theme-text-secondary)',
                    fontFamily: 'var(--theme-font-body)',
                  }}
                >
                  Member Since
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}