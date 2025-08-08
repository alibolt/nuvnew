
'use client';

import { InstagramMinimalIcon } from '@/components/icons/minimal-icons';
import { useState } from 'react';

export function MinimalFashionInstagram({ settings }: any) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Settings with defaults
  const title = settings.title || 'Follow us on Instagram';
  const subtitle = settings.subtitle || '';
  const username = settings.username || '@yourstore';
  const buttonText = settings.buttonText || 'Follow Us';
  const buttonLink = settings.buttonLink || 'https://instagram.com';
  const imageCount = settings.imageCount || 6;
  const mobileColumns = settings.columns?.mobile || 2;
  const tabletColumns = settings.columns?.tablet || 3;
  const desktopColumns = settings.columns?.desktop || 6;
  
  // Default images if none provided
  const defaultImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1020&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    'https://images.unsplash.com/photo-1581044777550-4cfa6ce67943?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=772&q=80',
    'https://images.unsplash.com/photo-1545291730-faff8ca1d4b0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80',
    'https://images.unsplash.com/photo-1584377334018-935295d34260?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80',
  ];
  
  const images = (settings.images && settings.images.length > 0) 
    ? settings.images.slice(0, imageCount) 
    : defaultImages.slice(0, imageCount);

  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-background)',
        fontFamily: 'var(--theme-font-body)'
      }}
    >
      <div 
        className="mx-auto"
        style={{
          maxWidth: 'var(--theme-container-max-width)',
          padding: '0 var(--theme-container-padding)'
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          {title && (
            <h2 
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'var(--theme-text-3xl)',
                fontWeight: 'var(--theme-font-weight-bold)',
                color: 'var(--theme-text)',
                marginBottom: subtitle ? '1rem' : '2rem'
              }}
            >
              {title}
            </h2>
          )}
          
          {subtitle && (
            <p 
              style={{
                fontSize: 'var(--theme-text-lg)',
                color: 'var(--theme-text-muted)',
                marginBottom: '2rem'
              }}
            >
              {subtitle}
            </p>
          )}
          
          {username && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <span style={{ color: 'var(--theme-text-muted)' }}>
                <InstagramMinimalIcon className="h-5 w-5" />
              </span>
              <span 
                style={{
                  fontSize: 'var(--theme-text-base)',
                  color: 'var(--theme-text-muted)',
                  fontWeight: 'var(--theme-font-weight-medium)'
                }}
              >
                {username}
              </span>
            </div>
          )}
        </div>
        
        {/* Images Grid */}
        <div 
          className={`grid gap-2 grid-cols-${mobileColumns} sm:grid-cols-${tabletColumns} lg:grid-cols-${desktopColumns}`}
          style={{
            gap: 'var(--theme-spacing-component-gap-sm)'
          }}
        >
          {images.map((image: string, index: number) => (
            <a
              key={index}
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square overflow-hidden group cursor-pointer"
              style={{
                borderRadius: 'var(--theme-radius-md)'
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <img
                src={image}
                alt={`Instagram post ${index + 1}`}
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              
              {/* Hover Overlay */}
              <div 
                className={`absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <InstagramMinimalIcon size={32} color="white" />
              </div>
            </a>
          ))}
        </div>
        
        {/* Follow Button */}
        {buttonText && (
          <div className="text-center mt-8">
            <a
              href={buttonLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-medium transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-background)',
                padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-md)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
              }}
            >
              <InstagramMinimalIcon size={16} />
              {buttonText}
            </a>
          </div>
        )}
      </div>
      
      {/* Responsive padding */}
      <style jsx>{`
        @media (min-width: 768px) {
          section {
            padding: var(--theme-section-padding-tablet) 0;
          }
        }
        @media (min-width: 1024px) {
          section {
            padding: var(--theme-section-padding-desktop) 0;
          }
        }
      `}</style>
    </section>
  );
}
