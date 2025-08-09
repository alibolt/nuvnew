'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  settings?: {
    logoText?: string;
    description?: string;
    showNewsletter?: boolean;
    showSocial?: boolean;
    copyrightText?: string;
    columns?: Array<{
      title: string;
      links: Array<{
        label: string;
        href: string;
      }>;
    }>;
    contact?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    social?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
  };
  store?: any;
}

export default function Footer({ settings = {}, store }: FooterProps) {
  const {
    logoText = store?.name || 'Store',
    description = 'Your trusted online shopping destination for quality products and exceptional service.',
    showNewsletter = true,
    showSocial = true,
    copyrightText = `© ${new Date().getFullYear()} ${store?.name || 'Store'}. All rights reserved.`,
    columns = [
      {
        title: 'Company',
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Careers', href: '/careers' },
          { label: 'Press', href: '/press' },
          { label: 'Blog', href: '/blog' },
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '/help' },
          { label: 'Contact Us', href: '/contact' },
          { label: 'Shipping Info', href: '/shipping' },
          { label: 'Returns', href: '/returns' },
        ]
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
          { label: 'Disclaimer', href: '/disclaimer' },
        ]
      }
    ],
    contact = {
      email: 'support@store.com',
      phone: '+1 (555) 123-4567',
      address: '123 Commerce St, Business City, BC 12345'
    },
    social = {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
      youtube: 'https://youtube.com'
    }
  } = settings;

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      {showNewsletter && (
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-white mb-2">
                Subscribe to our Newsletter
              </h3>
              <p className="text-gray-400 mb-6">
                Get the latest updates on new products and upcoming sales
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-500"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold text-white">
                {logoText}
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm">
              {description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white transition-colors">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <a href={`tel:${contact.phone}`} className="hover:text-white transition-colors">
                    {contact.phone}
                  </a>
                </div>
              )}
              {contact.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <span className="text-sm">{contact.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Links Columns */}
          {columns.map((column, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              {copyrightText}
            </p>

            {/* Social Links */}
            {showSocial && (
              <div className="flex items-center gap-4">
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* Payment Methods */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Secure Payments</span>
              {/* Payment icons would go here */}
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
      id: 'logoText',
      label: 'Logo Text',
      default: 'Store'
    },
    {
      type: 'textarea',
      id: 'description',
      label: 'Description',
      default: 'Your trusted online shopping destination.'
    },
    {
      type: 'checkbox',
      id: 'showNewsletter',
      label: 'Show Newsletter',
      default: true
    },
    {
      type: 'checkbox',
      id: 'showSocial',
      label: 'Show Social Links',
      default: true
    },
    {
      type: 'text',
      id: 'copyrightText',
      label: 'Copyright Text',
      default: '© 2024 Store. All rights reserved.'
    },
    {
      type: 'heading',
      label: 'Contact Information'
    },
    {
      type: 'text',
      id: 'contact.email',
      label: 'Email',
      default: 'support@store.com'
    },
    {
      type: 'text',
      id: 'contact.phone',
      label: 'Phone',
      default: '+1 (555) 123-4567'
    },
    {
      type: 'text',
      id: 'contact.address',
      label: 'Address',
      default: '123 Commerce St, Business City, BC 12345'
    },
    {
      type: 'heading',
      label: 'Social Media'
    },
    {
      type: 'text',
      id: 'social.facebook',
      label: 'Facebook URL',
      default: 'https://facebook.com'
    },
    {
      type: 'text',
      id: 'social.twitter',
      label: 'Twitter URL',
      default: 'https://twitter.com'
    },
    {
      type: 'text',
      id: 'social.instagram',
      label: 'Instagram URL',
      default: 'https://instagram.com'
    },
    {
      type: 'text',
      id: 'social.youtube',
      label: 'YouTube URL',
      default: 'https://youtube.com'
    }
  ]
};