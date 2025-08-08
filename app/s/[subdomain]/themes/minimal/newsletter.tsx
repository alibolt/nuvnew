
'use client';

import { useState } from 'react';

export function MinimalFashionNewsletter({ settings }: any) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };
  
  // Determine layout alignment
  const getLayoutClass = () => {
    switch (settings.layout) {
      case 'left': return 'text-left items-start';
      case 'right': return 'text-right items-end';
      case 'centered':
      default: return 'text-center items-center';
    }
  };
  
  return (
    <section 
      style={{
        padding: 'var(--theme-section-padding-mobile) 0',
        backgroundColor: 'var(--theme-surface)',
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
        <div className={`max-w-2xl mx-auto flex flex-col ${getLayoutClass()}`}>
          {/* Title */}
          {settings.title && (
            <h2 
              className="mb-4"
              style={{
                fontFamily: 'var(--theme-font-heading)',
                fontSize: 'var(--theme-text-3xl)',
                fontWeight: 'var(--theme-font-weight-bold)',
                color: 'var(--theme-text)',
                marginBottom: 'var(--theme-spacing-component-gap-md)'
              }}
            >
              {settings.title}
            </h2>
          )}
          
          {/* Subtitle */}
          {settings.subtitle && (
            <p 
              className="mb-8"
              style={{
                fontSize: 'var(--theme-text-lg)',
                color: 'var(--theme-text-muted)',
                lineHeight: 'var(--theme-line-height-relaxed)',
                marginBottom: 'var(--theme-spacing-component-gap-lg)'
              }}
            >
              {settings.subtitle}
            </p>
          )}
          
          {/* Success Message */}
          {status === 'success' && (
            <div 
              className="mb-6 p-4 rounded-md"
              style={{
                backgroundColor: 'var(--theme-success)',
                color: 'var(--theme-background)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-sm)',
                marginBottom: 'var(--theme-spacing-component-gap-md)'
              }}
            >
              {settings.successMessage || 'Thank you for subscribing!'}
            </div>
          )}
          
          {/* Newsletter Form */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row max-w-md mx-auto w-full"
            style={{
              gap: 'var(--theme-spacing-component-gap-sm)'
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="flex-1 border focus:outline-none focus:ring-2"
              style={{
                padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-md)',
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--theme-primary)';
                e.target.style.boxShadow = '0 0 0 2px rgba(0, 0, 0, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--theme-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button
              type="submit"
              disabled={status === 'loading' || !email}
              className="font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'var(--theme-background)',
                padding: 'var(--theme-spacing-component-gap-sm) var(--theme-spacing-component-gap-md)',
                borderRadius: 'var(--theme-radius-md)',
                fontSize: 'var(--theme-text-base)',
                fontWeight: 'var(--theme-font-weight-semibold)',
                transitionDuration: 'var(--theme-transition-duration)',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                }
              }}
            >
              {status === 'loading' ? 'Subscribing...' : (settings.buttonText || 'Subscribe')}
            </button>
          </form>
        </div>
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
