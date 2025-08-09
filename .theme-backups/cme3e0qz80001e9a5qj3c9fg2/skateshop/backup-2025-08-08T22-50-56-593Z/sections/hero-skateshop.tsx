'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Github } from 'lucide-react';

interface HeroProps {
  settings?: {
    title?: string;
    subtitle?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    showGithubStars?: boolean;
    githubStars?: number;
  };
  store?: any;
}

export default function HeroSkateshop({ settings = {}, store }: HeroProps) {
  const {
    title = 'Foundation for your commerce platform',
    subtitle = 'Skateshop is an open-source platform for building and customizing your own commerce platform with ease.',
    primaryButtonText = 'Buy now',
    primaryButtonLink = '/products',
    secondaryButtonText = 'Sell now',
    secondaryButtonLink = '/dashboard/stores',
    showGithubStars = true,
    githubStars = 1337
  } = settings;

  return (
    <section className="relative w-full py-12 md:py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* GitHub Badge */}
            {showGithubStars && (
              <Link
                href="https://github.com/sadmann7/skateshop"
                target="_blank"
                rel="noreferrer"
                className="animate-fade-up"
                style={{ animationDelay: '0.10s', animationFillMode: 'both' }}
              >
                <div className="inline-flex items-center rounded-full bg-neutral-100 dark:bg-neutral-800 px-3.5 py-1.5 text-sm">
                  <Github className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    {githubStars.toLocaleString()} stars on GitHub
                  </span>
                </div>
              </Link>
            )}

            {/* Main Heading */}
            <h1 
              className="animate-fade-up max-w-3xl text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-5xl md:text-6xl lg:text-7xl"
              style={{ animationDelay: '0.20s', animationFillMode: 'both' }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p 
              className="animate-fade-up max-w-[46.875rem] text-lg text-neutral-600 dark:text-neutral-400 sm:text-xl"
              style={{ animationDelay: '0.30s', animationFillMode: 'both' }}
            >
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div 
              className="animate-fade-up flex flex-col gap-4 sm:flex-row"
              style={{ animationDelay: '0.40s', animationFillMode: 'both' }}
            >
              <Link
                href={primaryButtonLink}
                className="inline-flex h-11 items-center justify-center rounded-md bg-neutral-900 dark:bg-neutral-100 px-8 text-sm font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-800 dark:hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300"
              >
                {primaryButtonText}
              </Link>
              <Link
                href={secondaryButtonLink}
                className="inline-flex h-11 items-center justify-center rounded-md border border-neutral-200 dark:border-neutral-800 bg-transparent px-8 text-sm font-medium text-neutral-900 dark:text-neutral-100 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-neutral-950">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>
    </section>
  );
}

export const schema = {
  name: 'Hero Skateshop',
  type: 'hero-skateshop',
  settings: [
    {
      type: 'text',
      id: 'title',
      label: 'Title',
      default: 'Foundation for your commerce platform'
    },
    {
      type: 'textarea',
      id: 'subtitle',
      label: 'Subtitle',
      default: 'Skateshop is an open-source platform for building and customizing your own commerce platform with ease.'
    },
    {
      type: 'text',
      id: 'primaryButtonText',
      label: 'Primary Button Text',
      default: 'Buy now'
    },
    {
      type: 'text',
      id: 'primaryButtonLink',
      label: 'Primary Button Link',
      default: '/products'
    },
    {
      type: 'text',
      id: 'secondaryButtonText',
      label: 'Secondary Button Text',
      default: 'Sell now'
    },
    {
      type: 'text',
      id: 'secondaryButtonLink',
      label: 'Secondary Button Link',
      default: '/dashboard/stores'
    },
    {
      type: 'checkbox',
      id: 'showGithubStars',
      label: 'Show GitHub Stars',
      default: true
    },
    {
      type: 'number',
      id: 'githubStars',
      label: 'GitHub Stars Count',
      default: 1337
    }
  ]
};