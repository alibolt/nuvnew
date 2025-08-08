'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FacebookMinimalIcon, InstagramMinimalIcon, TwitterMinimalIcon, MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';

interface FooterProps {
  store: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    youtube: string | null;
  };
  settings?: any; // Section-specific settings
}

export function MinimalFashionFooter({ store, settings: sectionSettings }: FooterProps) {
  const { settings } = useTheme();
  
  // Get footer settings - prioritize section settings over theme settings
  const footerStyle = sectionSettings?.style || settings.footer?.style || 'simple';
  const backgroundColor = settings.footer?.backgroundColor || '#FAFAFA';
  const textColor = settings.footer?.textColor || '#000000';
  
  // Section-specific settings with defaults
  const description = sectionSettings?.description || 'Discover our latest collection of premium fashion pieces.';
  const showSocialLinks = sectionSettings?.showSocialLinks ?? true;
  const showContact = sectionSettings?.showContact ?? true;
  const quickLinks = sectionSettings?.quickLinks || [
    { id: '1', label: 'About Us', url: '/about' },
    { id: '2', label: 'Shipping', url: '/shipping' },
    { id: '3', label: 'Returns', url: '/returns' },
    { id: '4', label: 'FAQ', url: '/faq' },
  ];
  const showPrivacyPolicy = sectionSettings?.showPrivacyPolicy ?? true;
  const showTermsOfService = sectionSettings?.showTermsOfService ?? true;
  const privacyPolicyUrl = sectionSettings?.privacyPolicyUrl || '/privacy';
  const termsOfServiceUrl = sectionSettings?.termsOfServiceUrl || '/terms';

  const socialLinks = [
    { icon: FacebookMinimalIcon, href: store.facebook, label: 'Facebook' },
    { icon: InstagramMinimalIcon, href: store.instagram, label: 'Instagram' },
    { icon: TwitterMinimalIcon, href: store.twitter, label: 'Twitter' },
    { icon: MinimalIcons.Youtube, href: store.youtube, label: 'YouTube' },
  ].filter(link => link.href);

  const legalLinks = [];
  if (showPrivacyPolicy) legalLinks.push({ label: 'Privacy Policy', url: privacyPolicyUrl });
  if (showTermsOfService) legalLinks.push({ label: 'Terms of Service', url: termsOfServiceUrl });

  const renderSimpleFooter = () => (
    <div className="text-center py-12">
      {/* Store Name */}
      <h3 
        className="mb-6 uppercase tracking-wider"
        style={{
          fontSize: 'var(--theme-text-xl)',
          fontFamily: 'var(--theme-font-heading)',
          fontWeight: 'var(--theme-font-weight-light, 300)',
          color: textColor,
        }}
      >
        {store.name}
      </h3>
      
      {/* Description */}
      {description && (
        <p 
          className="mb-6 opacity-80 max-w-md mx-auto"
          style={{
            fontSize: 'var(--theme-text-sm)',
            color: textColor,
            lineHeight: 'var(--theme-line-height-relaxed)',
          }}
        >
          {description}
        </p>
      )}

      {/* Quick Links */}
      {quickLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {quickLinks.map((link) => (
            <Link 
              key={link.id}
              href={link.url} 
              className="transition-opacity hover:opacity-70"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: textColor,
                opacity: 0.8,
                transitionDuration: 'var(--theme-transition-duration)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
      
      {/* Social Links */}
      {showSocialLinks && socialLinks.length > 0 && (
        <div className="flex justify-center gap-4 mb-8">
          {socialLinks.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href!}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              style={{
                color: textColor,
                opacity: 0.7,
                transitionDuration: 'var(--theme-transition-duration)',
              }}
              aria-label={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      )}
      
      {/* Copyright and Legal Links */}
      <div className="space-y-3">
        {legalLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {legalLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.url} 
                className="transition-opacity hover:opacity-70"
                style={{
                  fontSize: 'var(--theme-text-xs)',
                  color: textColor,
                  opacity: 0.6,
                  transitionDuration: 'var(--theme-transition-duration)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        <p 
          className="opacity-50"
          style={{
            fontSize: 'var(--theme-text-xs)',
            color: textColor,
          }}
        >
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
      </div>
    </div>
  );

  const renderDetailedFooter = () => (
    <div className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Store Info */}
        <div>
          <h3 
            className="mb-4 uppercase tracking-wider"
            style={{
              fontSize: 'var(--theme-text-lg)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-light, 300)',
              color: textColor,
            }}
          >
            {store.name}
          </h3>
          {description && (
            <p 
              className="mb-6 opacity-80 leading-relaxed"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: textColor,
                lineHeight: 'var(--theme-line-height-relaxed)',
              }}
            >
              {description}
            </p>
          )}

          {/* Social Links */}
          {showSocialLinks && socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  style={{
                    color: textColor,
                    opacity: 0.7,
                    transitionDuration: 'var(--theme-transition-duration)',
                  }}
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 
            className="uppercase tracking-wider mb-4"
            style={{
              fontSize: 'var(--theme-text-sm)',
              fontWeight: 'var(--theme-font-weight-semibold)',
              color: textColor,
            }}
          >
            Quick Links
          </h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.id}>
                <Link 
                  href={link.url} 
                  className="transition-opacity hover:opacity-70"
                  style={{
                    fontSize: 'var(--theme-text-sm)',
                    color: textColor,
                    opacity: 0.7,
                    transitionDuration: 'var(--theme-transition-duration)',
                  }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        {showContact && (store.email || store.phone || store.address) && (
          <div>
            <h4 
              className="uppercase tracking-wider mb-4"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                color: textColor,
              }}
            >
              Contact
            </h4>
            <ul className="space-y-3">
              {store.email && (
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 opacity-60" style={{ color: textColor }} />
                  <a 
                    href={`mailto:${store.email}`} 
                    className="transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      color: textColor,
                      opacity: 0.7,
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                  >
                    {store.email}
                  </a>
                </li>
              )}
              {store.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 opacity-60" style={{ color: textColor }} />
                  <a 
                    href={`tel:${store.phone}`} 
                    className="transition-opacity hover:opacity-70"
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      color: textColor,
                      opacity: 0.7,
                      transitionDuration: 'var(--theme-transition-duration)',
                    }}
                  >
                    {store.phone}
                  </a>
                </li>
              )}
              {store.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 opacity-60" style={{ color: textColor }} />
                  <span 
                    style={{
                      fontSize: 'var(--theme-text-sm)',
                      color: textColor,
                      opacity: 0.7,
                    }}
                  >
                    {store.address}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div 
        className="pt-6 flex flex-col md:flex-row justify-between items-center"
        style={{
          borderTop: `1px solid ${textColor}20`,
        }}
      >
        <p 
          style={{
            fontSize: 'var(--theme-text-xs)',
            color: textColor,
            opacity: 0.5,
          }}
        >
          © {new Date().getFullYear()} {store.name}. All rights reserved.
        </p>
        {legalLinks.length > 0 && (
          <div className="flex gap-4 mt-3 md:mt-0">
            {legalLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.url} 
                className="transition-opacity hover:opacity-70"
                style={{
                  fontSize: 'var(--theme-text-xs)',
                  color: textColor,
                  opacity: 0.6,
                  transitionDuration: 'var(--theme-transition-duration)',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <footer 
      data-clickable-section
      data-section-id="footer"
      data-section-type="footer"
      style={{
        backgroundColor: backgroundColor,
        color: textColor,
        fontFamily: 'var(--theme-font-body)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        {footerStyle === 'simple' ? renderSimpleFooter() : renderDetailedFooter()}
      </div>
    </footer>
  );
}