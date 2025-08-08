'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';
import { useCustomer } from '@/lib/customer-context';

interface AccountNavigationProps {
  settings?: any;
  pageData?: {
    storeSubdomain?: string;
  };
}

export function AccountNavigation({ settings: sectionSettings, pageData }: AccountNavigationProps) {
  const { settings } = useTheme();
  const pathname = usePathname();
  const { logout } = useCustomer();
  
  const showOrders = sectionSettings?.showOrders ?? true;
  const showAddresses = sectionSettings?.showAddresses ?? true;
  const showProfile = sectionSettings?.showProfile ?? true;
  const showWishlist = sectionSettings?.showWishlist ?? true;
  
  const storeSubdomain = pageData?.storeSubdomain || '';

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    {
      show: true,
      href: `/s/${storeSubdomain}/account`,
      label: 'Dashboard',
      icon: MinimalIcons.Home,
    },
    {
      show: showOrders,
      href: `/s/${storeSubdomain}/account/orders`,
      label: 'Orders',
      icon: MinimalIcons.Package,
    },
    {
      show: showProfile,
      href: `/s/${storeSubdomain}/account/profile`,
      label: 'Profile',
      icon: MinimalIcons.User,
    },
    {
      show: showAddresses,
      href: `/s/${storeSubdomain}/account/addresses`,
      label: 'Addresses',
      icon: MinimalIcons.MapPin,
    },
    {
      show: showWishlist,
      href: `/s/${storeSubdomain}/account/wishlist`,
      label: 'Wishlist',
      icon: MinimalIcons.Heart,
    },
  ].filter(item => item.show);

  return (
    <section 
      className="py-8"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <nav className="flex flex-wrap justify-center gap-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
                style={{
                  color: isActive ? 'var(--theme-primary)' : 'var(--theme-text)',
                  fontFamily: 'var(--theme-font-body)',
                  fontSize: 'var(--theme-text-sm)',
                  fontWeight: isActive ? 'var(--theme-font-weight-medium)' : 'normal',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:bg-gray-50"
            style={{
              color: 'var(--theme-text-secondary)',
              fontFamily: 'var(--theme-font-body)',
              fontSize: 'var(--theme-text-sm)',
            }}
          >
            <MinimalIcons.LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </section>
  );
}