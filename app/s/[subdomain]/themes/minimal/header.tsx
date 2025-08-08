'use client';

import Link from 'next/link';
import { useTheme } from '../../theme-provider';
import { CartButton } from '../../cart-button';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useState, useEffect } from 'react';
import useSWR from 'swr';

interface HeaderProps {
  store: {
    id: string;
    name: string;
    logo: string | null;
    subdomain: string;
  };
  settings?: any; // Section-specific settings
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function MinimalFashionHeader({ store, settings: sectionSettings }: HeaderProps) {
  const { settings } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Get header settings from theme
  const headerStyle = settings.header?.style || 'solid';
  const isSticky = settings.header?.sticky || false;
  const mobileHeight = settings.header?.height?.mobile || '60px';
  const desktopHeight = settings.header?.height?.desktop || '80px';
  
  // Get announcement settings
  const announcementEnabled = settings.header?.announcement?.enabled || false;
  const announcementText = settings.header?.announcement?.text || '';
  const announcementBg = settings.header?.announcement?.backgroundColor || '#000000';
  const announcementColor = settings.header?.announcement?.textColor || '#FFFFFF';
  
  
  // Section-specific settings
  const logoType = sectionSettings?.logoType || 'text';
  const logoImage = sectionSettings?.logoImage;
  const logoText = sectionSettings?.logoText || store.name;
  const logoPosition = sectionSettings?.logoPosition || 'left';
  const menuHandle = sectionSettings?.menuHandle || 'main-menu';
  const showSearch = sectionSettings?.showSearch ?? true;
  const showAccount = sectionSettings?.showAccount ?? true;
  const showCart = sectionSettings?.showCart ?? true;
  const cartStyle = sectionSettings?.cartStyle || 'icon-count';
  const mobileMenuStyle = sectionSettings?.mobileMenuStyle || 'drawer';
  const mobileLogoAlignment = sectionSettings?.mobileLogoAlignment || 'center';

  // Fetch menu data
  const { data: menuData } = useSWR(
    menuHandle !== 'custom' ? `/api/stores/${store.id}/menus/by-handle/${menuHandle}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false
    }
  );

  // Use fetched menu items or fallback
  const menuItems = menuHandle === 'custom' 
    ? (sectionSettings?.menuItems || [
        { href: '/', label: 'Shop' },
        { href: '/collections', label: 'Collections' },
        { href: '/lookbook', label: 'Lookbook' },
        { href: '/about', label: 'About' },
      ])
    : (menuData?.items?.map((item: any) => ({
        id: item.id,
        href: item.link,
        link: item.link,
        label: item.label,
        children: item.children
      })) || []);
  
  // Handle scroll for sticky header
  useEffect(() => {
    if (!isSticky) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);
  
  // Determine header background based on style and scroll state
  const getHeaderStyles = () => {
    const baseStyles = {
      fontFamily: 'var(--theme-font-body)',
      height: desktopHeight,
      transitionDuration: 'var(--theme-transition-duration, 300ms)',
    };
    
    switch (headerStyle) {
      case 'transparent':
        return {
          ...baseStyles,
          backgroundColor: isScrolled ? 'var(--theme-background)' : 'transparent',
          backdropFilter: isScrolled ? 'none' : 'blur(10px)',
          borderBottom: isScrolled ? '1px solid var(--theme-border)' : 'none',
          boxShadow: isScrolled ? 'var(--theme-shadow-sm)' : 'none',
        };
      case 'border':
        return {
          ...baseStyles,
          backgroundColor: 'var(--theme-background)',
          borderBottom: '1px solid var(--theme-border)',
        };
      case 'solid':
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--theme-background)',
          boxShadow: 'var(--theme-shadow-sm)',
        };
    }
  };
  
  const headerStyles = getHeaderStyles();
  
  // Calculate announcement bar height
  const announcementHeight = announcementEnabled && announcementText ? '40px' : '0px';
  
  return (
    <>
      {/* Announcement Bar */}
      {announcementEnabled && announcementText && (
        <div 
          className={`text-center py-2 text-sm font-medium ${isSticky ? 'fixed top-0 w-full z-50' : 'relative'}`}
          style={{
            backgroundColor: announcementBg,
            color: announcementColor,
            fontSize: 'var(--theme-text-sm)',
            height: announcementHeight,
          }}
        >
          {announcementText}
        </div>
      )}

      {/* Spacer when sticky */}
      {isSticky && announcementEnabled && announcementText && (
        <div style={{ height: announcementHeight }} />
      )}

      {/* Main Header */}
      <header 
        className={`w-full z-40 transition-all ${isSticky ? 'fixed' : 'relative'}`}
        style={{
          ...headerStyles,
          top: isSticky ? announcementHeight : '0',
        }}
      >
        <div 
          className="container mx-auto"
          style={{
            maxWidth: 'var(--theme-container-max-width)',
            padding: '0 var(--theme-container-padding)',
          }}
        >
          <div 
            className="grid grid-cols-3 items-center w-full"
            style={{
              height: desktopHeight,
              padding: `0 var(--theme-container-padding)`,
            }}
          >
            {/* Left Section */}
            <div className="flex items-center justify-start">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 transition-colors hover:opacity-70"
                style={{
                  color: 'var(--theme-text)',
                  transitionDuration: 'var(--theme-transition-duration)',
                }}
              >
                {mobileMenuOpen ? <MinimalIcons.Close size={24} /> : <MinimalIcons.Menu size={24} />}
              </button>
              
              {/* Logo - Left Position */}
              {logoPosition === 'left' && (
                <Link 
                  href={`/s/${store.subdomain}`} 
                  className="flex items-center transition-opacity hover:opacity-80 ml-2 lg:ml-0"
                  style={{
                    transitionDuration: 'var(--theme-transition-duration)',
                  }}
                >
                  {logoType === 'image' && (logoImage || store.logo) ? (
                    <img 
                      src={logoImage || store.logo || ''} 
                      alt={store.name} 
                      className="object-contain"
                      style={{
                        height: sectionSettings?.logoHeight?.desktop || desktopHeight,
                        maxHeight: desktopHeight,
                      }}
                    />
                  ) : (
                    <h1 
                      className="font-light tracking-wider uppercase"
                      style={{
                        fontSize: 'var(--theme-text-xl)',
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text)',
                        fontWeight: 'var(--theme-font-weight-light, 300)',
                      }}
                    >
                      {logoText}
                    </h1>
                  )}
                </Link>
              )}

              {/* Navigation - Left Position (when logo is center/right) */}
              {logoPosition !== 'left' && (
                <nav className="hidden lg:block">
                  <ul className="flex items-center space-x-8">
                    {menuItems.map((item: any) => (
                      <li key={item.id || item.href || item.link}>
                        <Link 
                          href={item.link || item.href || '/'} 
                          className="uppercase tracking-wider transition-opacity hover:opacity-70"
                          style={{
                            fontSize: 'var(--theme-text-sm)',
                            color: 'var(--theme-text)',
                            fontWeight: 'var(--theme-font-weight-medium)',
                            transitionDuration: 'var(--theme-transition-duration)',
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </div>

            {/* Center Section */}
            <div className="flex items-center justify-center">
              {/* Logo - Center Position */}
              {logoPosition === 'center' && (
                <Link 
                  href={`/s/${store.subdomain}`} 
                  className="flex items-center transition-opacity hover:opacity-80"
                  style={{
                    transitionDuration: 'var(--theme-transition-duration)',
                  }}
                >
                  {logoType === 'image' && (logoImage || store.logo) ? (
                    <img 
                      src={logoImage || store.logo || ''} 
                      alt={store.name} 
                      className="object-contain"
                      style={{
                        height: sectionSettings?.logoHeight?.desktop || desktopHeight,
                        maxHeight: desktopHeight,
                      }}
                    />
                  ) : (
                    <h1 
                      className="font-light tracking-wider uppercase"
                      style={{
                        fontSize: 'var(--theme-text-xl)',
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text)',
                        fontWeight: 'var(--theme-font-weight-light, 300)',
                      }}
                    >
                      {logoText}
                    </h1>
                  )}
                </Link>
              )}
            </div>

            {/* Right Section */}
            <div className="flex items-center justify-end">
              {/* Logo - Right Position */}
              {logoPosition === 'right' && (
                <Link 
                  href={`/s/${store.subdomain}`} 
                  className="flex items-center transition-opacity hover:opacity-80 mr-4"
                  style={{
                    transitionDuration: 'var(--theme-transition-duration)',
                  }}
                >
                  {logoType === 'image' && (logoImage || store.logo) ? (
                    <img 
                      src={logoImage || store.logo || ''} 
                      alt={store.name} 
                      className="object-contain"
                      style={{
                        height: sectionSettings?.logoHeight?.desktop || desktopHeight,
                        maxHeight: desktopHeight,
                      }}
                    />
                  ) : (
                    <h1 
                      className="font-light tracking-wider uppercase"
                      style={{
                        fontSize: 'var(--theme-text-xl)',
                        fontFamily: 'var(--theme-font-heading)',
                        color: 'var(--theme-text)',
                        fontWeight: 'var(--theme-font-weight-light, 300)',
                      }}
                    >
                      {logoText}
                    </h1>
                  )}
                </Link>
              )}

              {/* Navigation - Right Position (when logo is left) */}
              {logoPosition === 'left' && (
                <nav className="hidden lg:block mr-4">
                  <ul className="flex items-center space-x-8">
                    {menuItems.map((item: any) => (
                      <li key={item.id || item.href || item.link}>
                        <Link 
                          href={item.link || item.href || '/'} 
                          className="uppercase tracking-wider transition-opacity hover:opacity-70"
                          style={{
                            fontSize: 'var(--theme-text-sm)',
                            color: 'var(--theme-text)',
                            fontWeight: 'var(--theme-font-weight-medium)',
                            transitionDuration: 'var(--theme-transition-duration)',
                          }}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              {/* Actions */}
              <div className="flex items-center space-x-4">
                {showSearch && (
                  <Link
                    href={`/s/${store.subdomain}/search`}
                    className="p-2 transition-opacity hover:opacity-70"
                    style={{
                      color: 'var(--theme-text)',
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                  >
                    <MinimalIcons.Search size={20} />
                  </Link>
                )}
                {showAccount && (
                  <Link
                    href={`/s/${store.subdomain}/account`}
                    className="hidden sm:block p-2 transition-opacity hover:opacity-70"
                    style={{
                      color: 'var(--theme-text)',
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                  >
                    <MinimalIcons.User size={20} />
                  </Link>
                )}
                {showCart && (
                  <CartButton 
                    storeId={store.id} 
                    primaryColor="var(--theme-primary)" 
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav 
            className="lg:hidden border-t"
            style={{
              backgroundColor: 'var(--theme-background)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <ul className="py-4">
              {menuItems.map((item: any) => (
                <li key={item.id || item.href || item.link}>
                  <Link 
                    href={item.link || item.href || '/'} 
                    className="block px-6 py-3 uppercase tracking-wider transition-colors hover:bg-opacity-50"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      color: 'var(--theme-text)',
                      fontWeight: 'var(--theme-font-weight-medium)',
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      
      {/* Spacer for sticky header - only when header is sticky */}
      {isSticky && (
        <div style={{ height: desktopHeight }} />
      )}
      
      {/* Responsive height adjustments */}
      <style jsx>{`
        @media (max-width: 768px) {
          header > div > div {
            height: ${mobileHeight} !important;
          }
        }
      `}</style>
    </>
  );
}