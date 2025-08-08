'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginFormProps {
  settings: {
    title?: string;
    subtitle?: string;
    showRegisterLink?: boolean;
    registerLinkText?: string;
    showForgotPassword?: boolean;
    forgotPasswordText?: string;
    redirectUrl?: string;
    backgroundColor?: string;
    formBackgroundColor?: string;
    primaryColor?: string;
    textColor?: string;
  };
  store?: any;
  pageData?: any;
  isPreview?: boolean;
}

export function LoginForm({ settings, store, pageData, isPreview }: LoginFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const {
    title = 'Sign In',
    subtitle = 'Welcome back! Please sign in to your account.',
    showRegisterLink = true,
    registerLinkText = "Don't have an account? Sign up",
    showForgotPassword = true,
    forgotPasswordText = 'Forgot your password?',
    redirectUrl = pageData?.redirectUrl || '/account',
    backgroundColor = '#f9fafb',
    formBackgroundColor = '#ffffff',
    primaryColor = '#000000',
    textColor = '#111827'
  } = settings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPreview) {
      alert('Login functionality is disabled in preview mode');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/stores/${store?.subdomain}/customers/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store customer data in localStorage or context
        localStorage.setItem(`customer_${store?.subdomain}`, JSON.stringify(data.customer));
        
        // Redirect to the specified URL
        router.push(redirectUrl);
      } else {
        setError(data.error || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
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
            </div>

            {showForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href={`/account/forgot-password`}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    {forgotPasswordText}
                  </Link>
                </div>
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
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {showRegisterLink && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {registerLinkText.split('?')[0]}?{' '}
                <Link
                  href={`/account/register${redirectUrl !== '/account' ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {registerLinkText.split('?')[1] || 'Sign up'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}