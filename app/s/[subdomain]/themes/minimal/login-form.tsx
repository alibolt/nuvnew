'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MinimalIcons } from '@/components/icons/minimal-icons';
import { useTheme } from '../../theme-provider';
import { useCustomer } from '@/lib/customer-context';

interface LoginFormProps {
  settings?: any;
  pageData?: {
    storeSubdomain?: string;
    redirectUrl?: string;
  };
}

export function LoginForm({ settings: sectionSettings, pageData }: LoginFormProps) {
  const { settings } = useTheme();
  const router = useRouter();
  const { login } = useCustomer();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const title = sectionSettings?.title || 'Sign In';
  const subtitle = sectionSettings?.subtitle || 'Welcome back!';
  const showRegisterLink = sectionSettings?.showRegisterLink ?? true;
  const registerLinkText = sectionSettings?.registerLinkText || "Don't have an account? Sign up";
  const showForgotPassword = sectionSettings?.showForgotPassword ?? true;
  const forgotPasswordText = sectionSettings?.forgotPasswordText || 'Forgot your password?';
  const redirectUrl = pageData?.redirectUrl || sectionSettings?.redirectUrl || '/account';
  const storeSubdomain = pageData?.storeSubdomain || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
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
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              htmlFor="password" 
              className="block mb-2"
              style={{
                fontSize: 'var(--theme-text-sm)',
                fontWeight: 'var(--theme-font-weight-medium)',
                color: 'var(--theme-text)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border transition-all focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--theme-background)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text)',
                fontSize: 'var(--theme-text-base)',
                fontFamily: 'var(--theme-font-body)',
              }}
              placeholder="Enter your password"
            />
          </div>

          {showForgotPassword && (
            <div className="text-right">
              <Link
                href={`/s/${storeSubdomain}/account/forgot-password`}
                className="text-sm transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--theme-primary)',
                  fontFamily: 'var(--theme-font-body)',
                }}
              >
                {forgotPasswordText}
              </Link>
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {showRegisterLink && (
            <p 
              className="text-center"
              style={{
                fontSize: 'var(--theme-text-sm)',
                color: 'var(--theme-text-secondary)',
                fontFamily: 'var(--theme-font-body)',
              }}
            >
              {registerLinkText.split('?')[0]}?{' '}
              <Link
                href={`/s/${storeSubdomain}/account/register`}
                className="transition-opacity hover:opacity-70"
                style={{
                  color: 'var(--theme-primary)',
                  fontWeight: 'var(--theme-font-weight-medium)',
                }}
              >
                {registerLinkText.split('?')[1] || 'Sign up'}
              </Link>
            </p>
          )}
        </form>
      </div>
    </section>
  );
}