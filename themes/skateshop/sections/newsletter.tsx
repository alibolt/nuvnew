'use client';

import React, { useState } from 'react';
import { Mail } from 'lucide-react';

interface NewsletterProps {
  settings?: {
    title?: string;
    subtitle?: string;
    placeholder?: string;
    buttonText?: string;
    successMessage?: string;
  };
  store?: any;
}

export default function Newsletter({ settings = {}, store }: NewsletterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    title = 'Subscribe to our newsletter',
    subtitle = 'Get the latest updates on new products and upcoming sales',
    placeholder = 'Enter your email',
    buttonText = 'Subscribe',
    successMessage = 'Thank you for subscribing!'
  } = settings;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setEmail('');
    
    // Reset success message after 3 seconds
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="w-full py-14 md:py-20 lg:py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          {/* Icon */}
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>

          {/* Title & Subtitle */}
          {title && (
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mb-8 text-muted-foreground">
              {subtitle}
            </p>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mx-auto max-w-md">
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                required
                className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? 'Subscribing...' : buttonText}
              </button>
            </div>
            
            {/* Success Message */}
            {isSubmitted && (
              <p className="mt-4 text-sm text-green-600">
                {successMessage}
              </p>
            )}
          </form>

          {/* Privacy Note */}
          <p className="mt-4 text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

export const schema = {
  name: 'Newsletter',
  type: 'newsletter',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Subscribe to our newsletter'
    },
    {
      type: 'text',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Get the latest updates on new products and upcoming sales'
    },
    {
      type: 'text',
      id: 'placeholder',
      label: 'Email Placeholder',
      default: 'Enter your email'
    },
    {
      type: 'text',
      id: 'buttonText',
      label: 'Button Text',
      default: 'Subscribe'
    },
    {
      type: 'text',
      id: 'successMessage',
      label: 'Success Message',
      default: 'Thank you for subscribing!'
    }
  ]
};