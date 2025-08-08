'use client';

import React, { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Linkedin,
  Music2,
  Mail, 
  Phone, 
  MapPin, 
  ArrowUp,
  CreditCard,
  Shield,
  Truck,
  RotateCcw,
  Clock,
  Star,
  Heart
} from 'lucide-react';
import { BlockListRenderer } from '@/components/blocks/block-renderer';

interface FooterProps {
  settings: {
    // General
    layout?: 'simple' | 'columns' | 'full';
    alignment?: 'left' | 'center' | 'right';
    
    // Company Info
    showLogo?: boolean;
    showDescription?: boolean;
    description?: string;
    showContact?: boolean;
    
    // Bottom Bar
    showCopyright?: boolean;
    copyrightText?: string;
    showSocialIcons?: boolean;
    showPaymentIcons?: boolean;
    
    // Features
    showFeatures?: boolean;
    feature1Icon?: string;
    feature1Title?: string;
    feature1Description?: string;
    feature2Icon?: string;
    feature2Title?: string;
    feature2Description?: string;
    feature3Icon?: string;
    feature3Title?: string;
    feature3Description?: string;
    feature4Icon?: string;
    feature4Title?: string;
    feature4Description?: string;
    showNewsletter?: boolean;
    newsletterTitle?: string;
    newsletterSubtitle?: string;
    showBackToTop?: boolean;
    
    // Design
    colorScheme?: 'dark' | 'light' | 'primary' | 'custom';
    backgroundColor?: string;
    textColor?: string;
    linkColor?: string;
    borderColor?: string;
    spacing?: 'compact' | 'normal' | 'spacious';
  };
  blocks?: any[];
  store?: any;
  isPreview?: boolean;
  onBlockClick?: (section: any, block: any, event: React.MouseEvent) => void;
}

export function Footer({ settings, blocks = [], store, isPreview = false, onBlockClick }: FooterProps) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterMessage, setNewsletterMessage] = useState('');

  // Set defaults
  const layout = settings.layout || 'full';
  const alignment = settings.alignment || 'left';
  const colorScheme = settings.colorScheme || 'dark';
  const spacing = settings.spacing || 'normal';
  
  // Track scroll position for back-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setNewsletterStatus('error');
      setNewsletterMessage('Please enter a valid email address');
      return;
    }

    setNewsletterStatus('loading');
    
    try {
      if (store?.subdomain && !isPreview) {
        const response = await fetch(`/api/stores/${store.subdomain}/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            source: 'website_footer',
            tags: ['footer_newsletter']
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to subscribe');
        }
        
        setNewsletterStatus('success');
        setNewsletterMessage(data.isExisting 
          ? 'You are already subscribed!' 
          : 'Thank you for subscribing!');
        setEmail('');
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setNewsletterStatus('idle');
          setNewsletterMessage('');
        }, 3000);
      } else {
        // Simulate for preview
        await new Promise(resolve => setTimeout(resolve, 1000));
        setNewsletterStatus('success');
        setNewsletterMessage('Thank you for subscribing!');
        setEmail('');
        
        setTimeout(() => {
          setNewsletterStatus('idle');
          setNewsletterMessage('');
        }, 3000);
      }
    } catch (error) {
      setNewsletterStatus('error');
      setNewsletterMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterMessage('');
      }, 3000);
    }
  };

  // Get social links from store settings
  const socialLinks = [];
  
  if (settings.showSocialIcons !== false) {
    if (store?.storeSettings?.facebookUrl || store?.facebook) {
      socialLinks.push({ 
        icon: Facebook, 
        href: store.storeSettings?.facebookUrl || store.facebook, 
        label: 'Facebook' 
      });
    }
    
    if (store?.storeSettings?.twitterUrl || store?.twitter) {
      socialLinks.push({ 
        icon: Twitter, 
        href: store.storeSettings?.twitterUrl || store.twitter, 
        label: 'Twitter' 
      });
    }
    
    if (store?.storeSettings?.instagramUrl || store?.instagram) {
      socialLinks.push({ 
        icon: Instagram, 
        href: store.storeSettings?.instagramUrl || store.instagram, 
        label: 'Instagram' 
      });
    }
    
    if (store?.storeSettings?.youtubeUrl || store?.youtube) {
      socialLinks.push({ 
        icon: Youtube, 
        href: store.storeSettings?.youtubeUrl || store.youtube, 
        label: 'YouTube' 
      });
    }
    
    if (store?.storeSettings?.linkedinUrl) {
      socialLinks.push({ 
        icon: Linkedin, 
        href: store.storeSettings.linkedinUrl, 
        label: 'LinkedIn' 
      });
    }
    
    if (store?.storeSettings?.tiktokUrl) {
      socialLinks.push({ 
        icon: Music2, 
        href: store.storeSettings.tiktokUrl, 
        label: 'TikTok' 
      });
    }
  }

  const paymentMethods = [
    'Visa', 'Mastercard', 'American Express', 'PayPal', 'Apple Pay', 'Google Pay'
  ];

  // Get features from settings or use defaults
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'truck': Truck,
      'rotate': RotateCcw,
      'shield': Shield,
      'phone': Phone,
      'clock': Clock,
      'star': Star,
      'heart': Heart,
      'check': Shield // Using Shield as a check alternative
    };
    return iconMap[iconName] || Shield;
  };

  const features = [
    {
      icon: getIconComponent(settings.feature1Icon || 'truck'),
      title: settings.feature1Title || 'Free Shipping',
      description: settings.feature1Description || 'On orders over $100'
    },
    {
      icon: getIconComponent(settings.feature2Icon || 'rotate'),
      title: settings.feature2Title || 'Easy Returns',
      description: settings.feature2Description || '30-day return policy'
    },
    {
      icon: getIconComponent(settings.feature3Icon || 'shield'),
      title: settings.feature3Title || 'Secure Payment',
      description: settings.feature3Description || 'SSL encrypted checkout'
    },
    {
      icon: getIconComponent(settings.feature4Icon || 'phone'),
      title: settings.feature4Title || '24/7 Support',
      description: settings.feature4Description || 'Always here to help'
    }
  ];

  // Determine colors based on color scheme
  const getColors = () => {
    switch (colorScheme) {
      case 'light':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-900',
          link: 'text-gray-600 hover:text-gray-900',
          border: 'border-gray-200',
          iconColor: 'text-blue-600'
        };
      case 'primary':
        return {
          bg: 'bg-blue-900',
          text: 'text-white',
          link: 'text-blue-200 hover:text-white',
          border: 'border-blue-800',
          iconColor: 'text-blue-300'
        };
      case 'custom':
        return {
          bg: '',
          text: '',
          link: '',
          border: '',
          iconColor: ''
        };
      default: // dark
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          link: 'text-gray-400 hover:text-white',
          border: 'border-gray-800',
          iconColor: 'text-blue-400'
        };
    }
  };

  const colors = getColors();
  
  // Get spacing classes
  const getSpacing = () => {
    switch (spacing) {
      case 'compact':
        return { py: 'py-4', gap: 'gap-4' };
      case 'spacious':
        return { py: 'py-16', gap: 'gap-12' };
      default:
        return { py: 'py-8', gap: 'gap-8' };
    }
  };

  const spacingClasses = getSpacing();

  // Format copyright text
  const formatCopyright = () => {
    const text = settings.copyrightText || '© {year} {storeName}. All rights reserved.';
    const currentYear = new Date().getFullYear();
    const storeName = store?.name || 'Your Store';
    
    return text
      .replace('{year}', currentYear.toString())
      .replace('{storeName}', storeName);
  };

  // Custom styles for custom color scheme
  const customStyles = colorScheme === 'custom' ? {
    backgroundColor: settings.backgroundColor,
    color: settings.textColor
  } : {};

  // Alignment classes
  const getAlignmentClass = () => {
    switch (alignment) {
      case 'center':
        return 'text-center items-center';
      case 'right':
        return 'text-right items-end';
      default:
        return 'text-left items-start';
    }
  };

  const alignmentClass = getAlignmentClass();

  // If blocks are provided and layout is columns, render using blocks
  if (blocks && blocks.length > 0 && layout === 'columns') {
    return (
      <footer className={`${colors.bg} ${colors.text}`} style={customStyles}>
        {/* Features Bar */}
        {settings.showFeatures !== false && layout === 'full' && (
          <div className={`${colors.border} border-b`}>
            <div 
              className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
              style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
            >
              <div className={`grid grid-cols-2 md:grid-cols-4 ${spacingClasses.gap}`}>
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className={`h-8 w-8 ${colors.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{feature.title}</h3>
                        <p className={`${colors.link.split(' ')[0]} text-xs`}>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div 
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <BlockListRenderer
            blocks={blocks}
            context={{ store, section: { settings } }}
            isPreview={isPreview}
            isEditing={isPreview}
            onBlockClick={onBlockClick}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${spacingClasses.gap}`}
          />
        </div>

        {/* Newsletter */}
        {settings.showNewsletter !== false && layout !== 'simple' && (
          <div className={`${colors.border} border-t`}>
            <div 
              className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
              style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
            >
              <div className={`${alignmentClass} mb-8`}>
                <h3 className="text-xl font-semibold mb-2">
                  {settings.newsletterTitle || 'Stay Connected'}
                </h3>
                <p className={`${colors.link.split(' ')[0]} text-sm`}>
                  {settings.newsletterSubtitle || 'Get the latest updates and exclusive offers'}
                </p>
              </div>
              
              <form 
                onSubmit={handleNewsletterSubmit}
                className={`flex flex-col sm:flex-row max-w-md ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''}`}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`flex-grow px-4 py-2 bg-gray-800 border ${colors.border} rounded-l-lg sm:rounded-r-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400`}
                  disabled={newsletterStatus === 'loading'}
                />
                <button
                  type="submit"
                  className="btn btn-primary rounded-l-none"
                  disabled={newsletterStatus === 'loading'}
                >
                  {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {newsletterMessage && (
                <p className={`mt-2 text-sm ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {newsletterMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar */}
        <div className={`${colors.border} border-t`}>
          <div 
            className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
            style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
          >
            <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}>
              
              {/* Copyright */}
              {settings.showCopyright !== false && (
                <div className={`${colors.link.split(' ')[0]} text-sm`}>
                  {formatCopyright()}
                </div>
              )}

              {/* Social Media */}
              {socialLinks.length > 0 && (
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className={`${colors.link} transition-colors duration-200`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="h-5 w-5" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Payment Methods */}
              {settings.showPaymentIcons && (
                <div className="flex items-center space-x-2">
                  <span className={`${colors.link.split(' ')[0]} text-sm mr-2`}>We accept:</span>
                  <div className="flex space-x-1">
                    {paymentMethods.map((method, index) => (
                      <div
                        key={index}
                        className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium"
                      >
                        {method}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Simple layout
  if (layout === 'simple') {
    return (
      <footer className={`${colors.bg} ${colors.text}`} style={customStyles}>
        <div 
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 ${alignmentClass}`}>
            {/* Logo */}
            {settings.showLogo !== false && (
              <div>
                {store?.logo ? (
                  <img src={store.logo} alt={store.name} className="h-10 w-auto" />
                ) : (
                  <div className="text-2xl font-bold">{store?.name || 'Store'}</div>
                )}
              </div>
            )}

            {/* Copyright */}
            {settings.showCopyright !== false && (
              <div className={`${colors.link.split(' ')[0]} text-sm`}>
                {formatCopyright()}
              </div>
            )}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className={`${colors.link} transition-colors duration-200`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </footer>
    );
  }

  // Full layout (default)
  return (
    <footer className={`${colors.bg} ${colors.text}`} style={customStyles}>
      
      {/* Features Bar */}
      {settings.showFeatures !== false && (
        <div className={`${colors.border} border-b`}>
          <div 
            className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
            style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
          >
            <div className={`grid grid-cols-2 md:grid-cols-4 ${spacingClasses.gap}`}>
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className={`h-8 w-8 ${colors.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className={`${colors.link.split(' ')[0]} text-xs`}>{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Company Info */}
      <div 
        className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        <div className={`max-w-2xl ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''} ${alignmentClass}`}>
          
          {/* Logo */}
          {settings.showLogo !== false && (
            <div className="mb-6">
              {store?.logo ? (
                <img src={store.logo} alt={store.name} className="h-12 w-auto" />
              ) : (
                <div className="text-3xl font-bold">{store?.name || 'Store'}</div>
              )}
            </div>
          )}
          
          {/* Description */}
          {settings.showDescription !== false && (
            <p className={`${colors.link.split(' ')[0]} text-sm mb-6 leading-relaxed max-w-md`}>
              {settings.description || 'Your trusted partner for quality products and exceptional service.'}
            </p>
          )}

          {/* Contact Info */}
          {settings.showContact !== false && (
            <div className={`space-y-3 text-sm ${spacingClasses.gap}`}>
              {store?.email && (
                <div className="flex items-center space-x-3">
                  <Mail className={`h-4 w-4 ${colors.iconColor}`} />
                  <span className={colors.link.split(' ')[0]}>{store.email}</span>
                </div>
              )}
              {store?.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className={`h-4 w-4 ${colors.iconColor}`} />
                  <span className={colors.link.split(' ')[0]}>{store.phone}</span>
                </div>
              )}
              {store?.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className={`h-4 w-4 ${colors.iconColor}`} />
                  <span className={colors.link.split(' ')[0]}>{store.address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Blocks */}
        {blocks && blocks.length > 0 && (
          <div className={`mt-12 pt-8 ${colors.border} border-t`}>
            <BlockListRenderer
              blocks={blocks}
              context={{ store, section: { settings } }}
              isPreview={isPreview}
              isEditing={isPreview}
              onBlockClick={onBlockClick}
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${spacingClasses.gap}`}
            />
          </div>
        )}

        {/* Newsletter Signup */}
        {settings.showNewsletter !== false && (
          <div className={`mt-12 pt-8 ${colors.border} border-t`}>
            <div className={`${alignmentClass} mb-8`}>
              <h3 className="text-xl font-semibold mb-2">
                {settings.newsletterTitle || 'Stay Connected'}
              </h3>
              <p className={`${colors.link.split(' ')[0]} text-sm`}>
                {settings.newsletterSubtitle || 'Get the latest updates and exclusive offers'}
              </p>
            </div>
            
            <form 
              onSubmit={handleNewsletterSubmit}
              className={`flex flex-col sm:flex-row max-w-md ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''}`}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`flex-grow px-4 py-2 bg-gray-800 border ${colors.border} rounded-l-lg sm:rounded-r-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400`}
                disabled={newsletterStatus === 'loading'}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-l-none"
                disabled={newsletterStatus === 'loading'}
              >
                {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
            {newsletterMessage && (
              <p className={`mt-2 text-sm ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {newsletterMessage}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`${colors.border} border-t`}>
        <div 
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${spacingClasses.py}`}
          style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
        >
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0`}>
            
            {/* Copyright */}
            {settings.showCopyright !== false && (
              <div className={`${colors.link.split(' ')[0]} text-sm`}>
                {formatCopyright()}
              </div>
            )}

            {/* Social Media */}
            {socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className={`${colors.link} transition-colors duration-200`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            )}

            {/* Payment Methods */}
            {settings.showPaymentIcons && (
              <div className="flex items-center space-x-2">
                <span className={`${colors.link.split(' ')[0]} text-sm mr-2`}>We accept:</span>
                <div className="flex space-x-1">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="bg-white text-gray-900 px-2 py-1 rounded text-xs font-medium"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {settings.showBackToTop && showBackToTop && (
        <button
          onClick={scrollToTop}
          className="btn btn-primary fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </footer>
  );
}