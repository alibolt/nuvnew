'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';
import { useCustomer } from '@/lib/customer-context';

interface RegisterFormProps {
  settings?: any;
  pageData?: {
    storeSubdomain?: string;
    redirectUrl?: string;
  };
}

export function RegisterForm({ settings: sectionSettings, pageData }: RegisterFormProps) {
  const { settings } = useTheme();
  const router = useRouter();
  const { register } = useCustomer();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    acceptsMarketing: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = sectionSettings?.title || 'Create Account';
  const subtitle = sectionSettings?.subtitle || 'Join us today!';
  const showLoginLink = sectionSettings?.showLoginLink ?? true;
  const loginLinkText = sectionSettings?.loginLinkText || 'Already have an account? Sign in';
  const showMarketingConsent = sectionSettings?.showMarketingConsent ?? true;
  const marketingConsentText = sectionSettings?.marketingConsentText || 'I would like to receive exclusive offers and promotions';
  const redirectUrl = pageData?.redirectUrl || sectionSettings?.redirectUrl || '/account';
  const storeSubdomain = pageData?.storeSubdomain || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        acceptsMarketing: formData.acceptsMarketing,
      });
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: 'var(--theme-background)',
      }}
    >
      <div 
        className="container mx-auto"
        style={{
          maxWidth: '480px',
          padding: '0 var(--theme-container-padding)',
        }}
      >
        <div className="text-center mb-8">
          <h1 
            className="mb-2"
            style={{
              fontSize: 'var(--theme-text-3xl)',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: 'var(--theme-font-weight-light)',
              color: 'var(--theme-text)',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p 
              style={{
                fontSize: 'var(--theme-text-base)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div 
              className="p-4 rounded-lg bg-red-50 text-red-700 text-sm"
              style={{ fontFamily: 'var(--theme-font-body)' }}
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="firstName" 
                className="block mb-2"
                style={{
                  fontSize: 'var(--theme-text-sm)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  fontSize: 'var(--theme-text-base)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              />
            </div>

            <div>
              <label 
                htmlFor="lastName" 
                className="block mb-2"
                style={{
                  fontSize: 'var(--theme-text-sm)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                  color: 'var(--theme-text)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--theme-background)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text)',
                  fontSize: 'var(--theme-text-base)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="email" 
              className="block mb-2"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
              }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label 
              htmlFor="phone" 
              className="block mb-2"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
              }}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block mb-2"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
              }}
              placeholder="Create a password"
            />
          </div>

          <div>
            <label 
              htmlFor="confirmPassword" 
              className="block mb-2"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
              }}
              placeholder="Confirm your password"
            />
          </div>

          {showMarketingConsent && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="acceptsMarketing"
                name="acceptsMarketing"
                checked={formData.acceptsMarketing}
                onChange={handleChange}
                className="mt-1"
              />
              <label 
                htmlFor="acceptsMarketing" 
                className="cursor-pointer"
                style={{
                  fontSize: 'var(--theme-text-sm)',
                  color: 'var(--theme-text-secondary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                {marketingConsentText}
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--theme-primary)',
              color: 'white',
              fontSize: 'var(--theme-text-base)',
              fontFamily: 'var(--theme-font-body)',
              fontWeight: 'var(--theme-font-weight-medium)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <MinimalIcons.Loader className="animate-spin" size={20} />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>

          {showLoginLink && (
            <p 
              className="text-center"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              {loginLinkText.split('?')[0]}?{' '}
              <Link
                href={`/s/${storeSubdomain}/account/login`}
                className="transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--theme-primary)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                }}
              >
                {loginLinkText.split('?')[1] || 'Sign in'}
              </Link>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}