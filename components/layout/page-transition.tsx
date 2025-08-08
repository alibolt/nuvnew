'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Check if View Transitions API is supported
    const supportsViewTransitions = 'startViewTransition' in document;

    if (pathname !== previousPathname.current) {
      if (supportsViewTransitions && contentRef.current) {
        // Use View Transitions API for modern browsers
        (document as any).startViewTransition(async () => {
          // Add fade effect to current content
          if (contentRef.current) {
            contentRef.current.style.opacity = '0';
            contentRef.current.style.transform = 'translateX(-20px)';
          }
          
          // Wait for animation
          await new Promise(resolve => setTimeout(resolve, 150));
          
          // Reset and show new content
          if (contentRef.current) {
            contentRef.current.style.opacity = '1';
            contentRef.current.style.transform = 'translateX(0)';
          }
          
          previousPathname.current = pathname;
        });
      } else {
        // Fallback animation for older browsers
        if (contentRef.current) {
          // Exit animation
          contentRef.current.classList.add('nuvi-animate-fade-out');
          
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.classList.remove('nuvi-animate-fade-out');
              contentRef.current.classList.add('nuvi-animate-slide-up');
              
              // Remove animation class after completion
              setTimeout(() => {
                if (contentRef.current) {
                  contentRef.current.classList.remove('nuvi-animate-slide-up');
                }
              }, 200);
            }
          }, 150);
        }
        previousPathname.current = pathname;
      }
    }
  }, [pathname]);

  return (
    <div 
      ref={contentRef}
      className={`page-transition-wrapper ${className}`}
      style={{
        minHeight: '100vh',
        position: 'relative',
        transition: 'opacity 0.2s ease, transform 0.3s ease',
        opacity: 1,
        transform: 'translateX(0)'
      }}
    >
      {children}
    </div>
  );
}

// Skeleton Loading Components
export function SkeletonCard() {
  return (
    <div className="nuvi-skeleton-card">
      <div className="nuvi-skeleton nuvi-skeleton-heading" />
      <div className="nuvi-skeleton nuvi-skeleton-text" />
      <div className="nuvi-skeleton nuvi-skeleton-text" style={{ width: '80%' }} />
      <div className="nuvi-skeleton nuvi-skeleton-text" style={{ width: '60%' }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="nuvi-card">
      <div className="nuvi-card-content">
        <table className="nuvi-table">
          <thead>
            <tr>
              {[1, 2, 3, 4].map((i) => (
                <th key={i}>
                  <div className="nuvi-skeleton nuvi-skeleton-text" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                {[1, 2, 3, 4].map((j) => (
                  <td key={j}>
                    <div className="nuvi-skeleton nuvi-skeleton-text" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonProductGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-3 nuvi-gap-md">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="nuvi-card">
          <div className="nuvi-skeleton nuvi-skeleton-image" />
          <div className="nuvi-card-content">
            <div className="nuvi-skeleton nuvi-skeleton-heading" />
            <div className="nuvi-skeleton nuvi-skeleton-text" />
            <div className="nuvi-skeleton nuvi-skeleton-text" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="nuvi-grid nuvi-grid-cols-1 nuvi-md:grid-cols-2 nuvi-lg:grid-cols-4 nuvi-gap-md">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="nuvi-card nuvi-card-compact">
          <div className="nuvi-card-content">
            <div className="nuvi-flex nuvi-items-center nuvi-justify-between nuvi-mb-md">
              <div className="nuvi-skeleton nuvi-skeleton-avatar" />
              <div className="nuvi-skeleton nuvi-skeleton-text" style={{ width: '50px' }} />
            </div>
            <div className="nuvi-skeleton nuvi-skeleton-heading" />
            <div className="nuvi-skeleton nuvi-skeleton-text" style={{ width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}