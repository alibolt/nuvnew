'use client';

import React from 'react';
import { 
  CreditCard, ShieldCheck, Truck, RefreshCw, Award, 
  CheckCircle, Star, Package, Zap, Heart 
} from 'lucide-react';

interface Logo {
  id: string;
  name: string;
  image?: string;
  url?: string;
  icon?: string;
}

interface LogoListProps {
  settings: {
    title?: string;
    subtitle?: string;
    layout?: 'carousel' | 'grid';
    columns?: string;
    logoSize?: 'small' | 'medium' | 'large';
    alignment?: 'left' | 'center' | 'right';
    showTitle?: boolean;
    showSubtitle?: boolean;
    backgroundColor?: string;
    titleColor?: string;
    subtitleColor?: string;
    logoType?: 'payment' | 'brand' | 'trust' | 'custom';
    grayscale?: boolean;
    hoverEffect?: boolean;
    spacing?: 'compact' | 'normal' | 'spacious';
  };
  logos?: Logo[];
  isPreview?: boolean;
}

// Predefined logo sets
const paymentLogos: Logo[] = [
  { id: 'visa', name: 'Visa', icon: 'credit-card' },
  { id: 'mastercard', name: 'Mastercard', icon: 'credit-card' },
  { id: 'amex', name: 'American Express', icon: 'credit-card' },
  { id: 'paypal', name: 'PayPal', icon: 'credit-card' },
  { id: 'apple-pay', name: 'Apple Pay', icon: 'credit-card' },
  { id: 'google-pay', name: 'Google Pay', icon: 'credit-card' }
];

const trustBadges: Logo[] = [
  { id: 'secure', name: 'Secure Checkout', icon: 'shield' },
  { id: 'shipping', name: 'Free Shipping', icon: 'truck' },
  { id: 'returns', name: 'Easy Returns', icon: 'refresh' },
  { id: 'quality', name: 'Premium Quality', icon: 'award' },
  { id: 'verified', name: 'Verified Seller', icon: 'check' },
  { id: 'rated', name: 'Top Rated', icon: 'star' }
];

const brandLogos: Logo[] = [
  { id: '1', name: 'Partner 1', image: '/placeholder-logo.svg' },
  { id: '2', name: 'Partner 2', image: '/placeholder-logo.svg' },
  { id: '3', name: 'Partner 3', image: '/placeholder-logo.svg' },
  { id: '4', name: 'Partner 4', image: '/placeholder-logo.svg' },
  { id: '5', name: 'Partner 5', image: '/placeholder-logo.svg' },
  { id: '6', name: 'Partner 6', image: '/placeholder-logo.svg' }
];

export function LogoList({ settings, logos = [], isPreview }: LogoListProps) {
  // Determine which logos to display based on type
  const getDisplayLogos = () => {
    if (logos && logos.length > 0) {
      return logos;
    }
    
    switch (settings.logoType) {
      case 'payment':
        return paymentLogos;
      case 'trust':
        return trustBadges;
      case 'brand':
        return isPreview ? brandLogos : [];
      default:
        return isPreview ? brandLogos : [];
    }
  };

  const displayLogos = getDisplayLogos();

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'credit-card': CreditCard,
      'shield': ShieldCheck,
      'truck': Truck,
      'refresh': RefreshCw,
      'award': Award,
      'check': CheckCircle,
      'star': Star,
      'package': Package,
      'zap': Zap,
      'heart': Heart
    };
    return iconMap[iconName] || CreditCard;
  };

  const getSizeClasses = () => {
    switch (settings.logoSize) {
      case 'small': return 'h-8 w-auto';
      case 'large': return 'h-16 w-auto';
      default: return 'h-12 w-auto';
    }
  };

  const getIconSizeClasses = () => {
    switch (settings.logoSize) {
      case 'small': return 'h-6 w-6';
      case 'large': return 'h-12 w-12';
      default: return 'h-8 w-8';
    }
  };

  const getColumnsClass = () => {
    switch (settings.columns) {
      case '3': return 'grid-cols-3';
      case '4': return 'grid-cols-2 sm:grid-cols-4';
      case '5': return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';
      case '6': return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
      case '8': return 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8';
      default: return 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6';
    }
  };

  const getSpacingClass = () => {
    switch (settings.spacing) {
      case 'compact': return 'gap-4';
      case 'spacious': return 'gap-12';
      default: return 'gap-8';
    }
  };

  const getAlignmentClass = () => {
    switch (settings.alignment) {
      case 'left': return 'text-left';
      case 'right': return 'text-right';
      default: return 'text-center';
    }
  };

  if (displayLogos.length === 0) {
    return null;
  }

  return (
    <section 
      className="py-12"
      style={{ backgroundColor: settings.backgroundColor || '#ffffff' }}
    >
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--theme-layout-container-width, 1280px)' }}
      >
        {/* Header */}
        {(settings.showTitle !== false || settings.showSubtitle) && (
          <div className={`mb-8 ${getAlignmentClass()}`}>
            {settings.showTitle !== false && settings.title && (
              <h2 
                className="text-2xl md:text-3xl font-bold mb-2"
                style={{ color: settings.titleColor || '#111827' }}
              >
                {settings.title}
              </h2>
            )}
            {settings.showSubtitle && settings.subtitle && (
              <p 
                className="text-lg"
                style={{ color: settings.subtitleColor || '#6b7280' }}
              >
                {settings.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Logo Grid */}
        <div className={`grid ${getColumnsClass()} ${getSpacingClass()} items-center justify-items-center`}>
          {displayLogos.map((logo) => {
            const LogoIcon = logo.icon ? getIconComponent(logo.icon) : null;
            const content = (
              <>
                {logo.image ? (
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className={`${getSizeClasses()} object-contain ${
                      settings.grayscale ? 'grayscale hover:grayscale-0' : ''
                    } ${
                      settings.hoverEffect ? 'opacity-70 hover:opacity-100' : ''
                    } transition-all duration-300`}
                  />
                ) : LogoIcon ? (
                  <div className={`flex flex-col items-center gap-2 ${
                    settings.grayscale ? 'text-gray-400 hover:text-gray-700' : 'text-gray-600'
                  } ${
                    settings.hoverEffect ? 'opacity-70 hover:opacity-100' : ''
                  } transition-all duration-300`}>
                    <LogoIcon className={getIconSizeClasses()} />
                    {settings.logoType === 'trust' && (
                      <span className="text-xs font-medium">{logo.name}</span>
                    )}
                  </div>
                ) : (
                  <div className={`${getSizeClasses()} bg-gray-200 rounded flex items-center justify-center`}>
                    <span className="text-xs text-gray-500">{logo.name}</span>
                  </div>
                )}
              </>
            );

            if (logo.url) {
              return (
                <a
                  key={logo.id}
                  href={logo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                  title={logo.name}
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={logo.id} title={logo.name}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}export default LogoUlist;
