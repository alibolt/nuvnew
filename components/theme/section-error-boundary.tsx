'use client';

import React from 'react';
import { ThemeErrorBoundary } from './theme-error-boundary';
import { AlertTriangle } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  sectionType: string;
  themeId: string;
  fallbackComponent?: React.ComponentType<any>;
}

export function SectionErrorBoundary({
  children,
  sectionType,
  themeId,
  fallbackComponent: FallbackComponent
}: SectionErrorBoundaryProps) {
  
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Track section-specific errors
    if (typeof window !== 'undefined') {
      // Store error in sessionStorage for debugging
      const errors = JSON.parse(
        sessionStorage.getItem('theme-section-errors') || '[]'
      );
      errors.push({
        sectionType,
        themeId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      sessionStorage.setItem('theme-section-errors', JSON.stringify(errors));
    }
  };

  const fallback = FallbackComponent ? (
    <FallbackComponent />
  ) : (
    <div className="section-error-fallback p-8 bg-gray-50 border border-gray-200 rounded">
      <div className="flex items-center justify-center text-gray-500">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span>Failed to load {sectionType} section</span>
      </div>
    </div>
  );

  return (
    <ThemeErrorBoundary
      sectionType={sectionType}
      themeId={themeId}
      fallback={fallback}
      onError={handleError}
    >
      {children}
    </ThemeErrorBoundary>
  );
}