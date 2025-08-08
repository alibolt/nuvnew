'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface NewsletterProps {
  settings: {
    // General
    title?: string;
    subtitle?: string;
    
    // Form
    placeholder?: string;
    buttonText?: string;
    successMessage?: string;
    errorMessage?: string;
    invalidEmailMessage?: string;
    
    // Privacy
    showPrivacyNotice?: boolean;
    privacyText?: string;
    privacyPolicyLink?: string;
    
    // Social
    showSocialMedia?: boolean;
    socialTitle?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    
    // Benefits
    showBenefits?: boolean;
    benefit1Title?: string;
    benefit1Text?: string;
    benefit2Title?: string;
    benefit2Text?: string;
    benefit3Title?: string;
    benefit3Text?: string;
    
    // Appearance
    backgroundColor?: string;
    buttonColor?: string;
    buttonHoverColor?: string;
    inputBorderColor?: string;
  };
  store?: any;
  isPreview?: boolean;
}

export function Newsletter({ settings, store, isPreview }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage(settings.invalidEmailMessage || 'Please enter a valid email address');
      return;
    }

    setStatus('loading');
    
    try {
      // Use real API if store is available, otherwise simulate
      if (store?.subdomain && !isPreview) {
        const response = await fetch(`/api/stores/${store.subdomain}/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            source: 'website_footer',
            tags: ['newsletter']
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to subscribe');
        }
        
        setStatus('success');
        setMessage(data.isExisting 
          ? 'You are already subscribed to our newsletter!' 
          : (settings.successMessage || 'Thank you for subscribing! Check your email for confirmation.'));
        setEmail('');
      } else {
        // Simulate for preview
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus('success');
        setMessage(settings.successMessage || 'Thank you for subscribing! Check your email for confirmation.');
        setEmail('');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : (settings.errorMessage || 'Something went wrong. Please try again.'));
    }
  };

  const socialLinks = [
    { icon: Facebook, href: settings.facebookUrl || '#', label: 'Facebook', show: !!settings.facebookUrl },
    { icon: Twitter, href: settings.twitterUrl || '#', label: 'Twitter', show: !!settings.twitterUrl },
    { icon: Instagram, href: settings.instagramUrl || '#', label: 'Instagram', show: !!settings.instagramUrl },
    { icon: Youtube, href: settings.youtubeUrl || '#', label: 'YouTube', show: !!settings.youtubeUrl },
  ].filter(social => social.show);

  return (
    <section 
      className="py-16"
      style={{ backgroundColor: settings.backgroundColor || '#F8FAFC' }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {settings.title || 'Stay Updated'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {settings.subtitle || 'Subscribe to our newsletter for exclusive offers and updates'}
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-grow">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={settings.placeholder || "Enter your email address"}
                    className="w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    style={{ borderColor: settings.inputBorderColor || '#D1D5DB' }}
                    disabled={status === 'loading'}
                  />
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary min-w-[120px]"
              >
                {status === 'loading' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  settings.buttonText || 'Subscribe'
                )}
              </button>
            </div>

            {/* Status Messages */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg flex items-center justify-center ${
                status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm font-medium">{message}</span>
              </div>
            )}
          </form>

          {/* Privacy Notice */}
          {settings.showPrivacyNotice !== false && (
            <p className="text-sm text-gray-500 mb-8 max-w-lg mx-auto">
              {settings.privacyText?.split('Privacy Policy').map((part, index) => (
                <React.Fragment key={index}>
                  {part}
                  {index === 0 && (
                    <>
                      <a 
                        href={settings.privacyPolicyLink || "/privacy-policy"} 
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Privacy Policy
                      </a>
                    </>
                  )}
                </React.Fragment>
              )) || (
                <>
                  By subscribing, you agree to our{' '}
                  <a 
                    href={settings.privacyPolicyLink || "/privacy-policy"} 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Privacy Policy
                  </a>{' '}
                  and consent to receive updates from our company.
                </>
              )}
            </p>
          )}

          {/* Social Media Links */}
          {settings.showSocialMedia && socialLinks.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">
                {settings.socialTitle || 'Follow us on social media'}
              </p>
              <div className="flex justify-center space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      aria-label={social.label}
                      className="p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 text-gray-600 hover:text-blue-600 hover:scale-105"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Newsletter Benefits */}
        {settings.showBenefits !== false && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {settings.benefit1Title || 'Exclusive Offers'}
              </h3>
              <p className="text-gray-600">
                {settings.benefit1Text || 'Be the first to know about special discounts and promotions.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {settings.benefit2Title || 'New Arrivals'}
              </h3>
              <p className="text-gray-600">
                {settings.benefit2Text || 'Get notified when we launch new products and collections.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {settings.benefit3Title || 'Expert Tips'}
              </h3>
              <p className="text-gray-600">
                {settings.benefit3Text || 'Receive helpful guides and tips from our product experts.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}export default Newsletter;
