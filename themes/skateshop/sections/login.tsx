'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LoginSectionProps {
  title?: string;
  subtitle?: string;
  logoUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  primaryColor?: string;
  showSocialLogin?: boolean;
  redirectUrl?: string;
}

export default function LoginSection({
  title = "Welcome Back",
  subtitle = "Log in to your account to continue",
  logoUrl = "/skateshop-logo.svg",
  backgroundColor = "#000000",
  textColor = "#FFFFFF",
  primaryColor = "#DC2626",
  showSocialLogin = true,
  redirectUrl = "/account"
}: LoginSectionProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        router.push(redirectUrl);
      } else {
        const data = await response.json();
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
             style={{ backgroundColor }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          {logoUrl && (
            <img className="mx-auto h-12 w-auto mb-8" src={logoUrl} alt="Logo" />
          )}
          <h2 className="text-center text-3xl font-extrabold" style={{ color: textColor }}>
            {title}
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: `${textColor}99` }}>
            {subtitle}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  color: textColor,
                  borderColor: '#333',
                  focusRingColor: primaryColor
                }}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: textColor }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                style={{ 
                  backgroundColor: '#1A1A1A',
                  color: textColor,
                  borderColor: '#333',
                  focusRingColor: primaryColor
                }}
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded"
                style={{ accentColor: primaryColor }}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: textColor }}>
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium hover:opacity-80" style={{ color: primaryColor }}>
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
              style={{ 
                backgroundColor: primaryColor,
                focusRingColor: primaryColor
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          {showSocialLogin && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: '#333' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ backgroundColor, color: `${textColor}99` }}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 transition-colors"
                  style={{ 
                    borderColor: '#333',
                    color: textColor,
                    backgroundColor: '#1A1A1A'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">GitHub</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium hover:bg-gray-800 transition-colors"
                  style={{ 
                    borderColor: '#333',
                    color: textColor,
                    backgroundColor: '#1A1A1A'
                  }}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.865 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .26.18.57.69.48A10 10 0 0020 10c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
              </div>
            </>
          )}

          <p className="mt-4 text-center text-sm" style={{ color: `${textColor}99` }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-medium hover:opacity-80" style={{ color: primaryColor }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}