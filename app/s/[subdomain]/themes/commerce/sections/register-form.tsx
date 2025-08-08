'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RegisterFormProps {
  settings: {
    title?: string;
    subtitle?: string;
    showLoginLink?: boolean;
    loginLinkText?: string;
    showMarketingConsent?: boolean;
    marketingConsentText?: string;
    redirectUrl?: string;
    backgroundColor?: string;
    formBackgroundColor?: string;
    primaryColor?: string;
    textColor?: string;
    requirePhone?: boolean;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
}

export function RegisterForm({ settings, store, pageData, isPreview }: RegisterFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptsMarketing: false
  });

  const {
    title = 'Create Account',
    subtitle = 'Join us and enjoy exclusive benefits!',
    showLoginLink = true,
    loginLinkText = 'Already have an account? Sign in',
    showMarketingConsent = true,
    marketingConsentText = 'I would like to receive exclusive offers and promotions',
    redirectUrl = pageData?.redirectUrl || '/account',
    backgroundColor = '#f9fafb',
    formBackgroundColor = '#ffffff',
    primaryColor = '#000000',
    textColor = '#111827',
    requirePhone = false
  } = settings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      alert('Registration functionality is disabled in preview mode');
      return;
    }

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

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/stores/${store?.subdomain}/customers/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          acceptsMarketing: formData.acceptsMarketing
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // Store customer data in localStorage
        localStorage.setItem(`customer_${store?.subdomain}`, JSON.stringify(data.customer));
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(redirectUrl);
        }, 2000);
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (success) {
    return (
      <section 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        style={{ backgroundColor }}
      >
        <div className="max-w-md w-full">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Account Created Successfully!</h2>
            <p className="text-gray-600 mb-4">
              Welcome to {store?.name}! You will be redirected to your account shortly.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 
            className="text-3xl md:text-4xl font-bold"
            style={{ color: textColor }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        <div 
          className="mt-8 bg-white p-8 rounded-lg shadow-lg"
          style={{ backgroundColor: formBackgroundColor }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="John"
                  />
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {requirePhone && (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                  <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {showMarketingConsent && (
              <div className="flex items-start">
                <input
                  id="acceptsMarketing"
                  name="acceptsMarketing"
                  type="checkbox"
                  checked={formData.acceptsMarketing}
                  onChange={handleChange}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="acceptsMarketing" className="ml-2 block text-sm text-gray-700">
                  {marketingConsentText}
                </label>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {showLoginLink && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {loginLinkText.split('?')[0]}?{' '}
                <Link
                  href={`/account/login${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {loginLinkText.split('?')[1] || 'Sign in'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}