'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  settings?: {
    companyName?: string;
    description?: string;
    copyrightText?: string;
    showSocial?: boolean;
    showNewsletter?: boolean;
  };
  store?: any;
}

export default function Footer({ settings = {}, store }: FooterProps) {
  const {
    companyName = 'Skateshop',
    description = 'Your premier destination for skateboarding gear and accessories.',
    copyrightText = '© 2024 Skateshop. All rights reserved.',
    showSocial = true,
    showNewsletter = false
  } = settings;

  const footerLinks = {
    Shop: [
      { name: 'Decks', href: '/collections/decks' },
      { name: 'Wheels', href: '/collections/wheels' },
      { name: 'Trucks', href: '/collections/trucks' },
      { name: 'Bearings', href: '/collections/bearings' },
      { name: 'All Products', href: '/products' }
    ],
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' }
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'Size Guide', href: '/size-guide' },
      { name: 'Track Order', href: '/track-order' }
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'YouTube', icon: Youtube, href: '#' }
  ];

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Main Footer Content */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <circle cx="7" cy="15" r="2" />
                  <circle cx="17" cy="15" r="2" />
                  <path d="M3 9a2 1 0 0 0 2 1h14a2 1 0 0 0 2 -1" />
                </svg>
                <span className="text-xl font-bold">{companyName}</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                {description}
              </p>
              
              {/* Social Links */}
              {showSocial && (
                <div className="mt-6 flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Link
                        key={social.name}
                        href={social.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={social.name}
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="mb-4 text-sm font-semibold">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-12 border-t pt-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                {copyrightText}
              </p>
              
              {/* Payment Methods */}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Accepted Payments:</span>
                <span>Visa</span>
                <span>Mastercard</span>
                <span>PayPal</span>
                <span>Crypto</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const schema = {
  name: 'Footer',
  type: 'footer',
  settings: [
    {
      type: 'text',
      id: 'companyName',
      label: 'Company Name',
      default: 'Skateshop'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Company Description',
      default: 'Your premier destination for skateboarding gear and accessories.'
    },
    {
      type: 'text',
      id: 'copyrightText',
      label: 'Copyright Text',
      default: '© 2024 Skateshop. All rights reserved.'
    },
    {
      type: 'checkbox',
      id: 'showSocial',
      label: 'Show Social Links',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showNewsletter',
      label: 'Show Newsletter',
      default: false
    }
  ]
};