'use client';

import { useEffect } from 'react';

export function SimplePerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // API çağrılarını loglama
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const response = await originalFetch(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      // 100ms üzeri süren çağrıları logla
      if (duration > 100) {
        console.log(`[API] ${url} - ${duration.toFixed(0)}ms`);
      }
      
      return response;
    };

    // Page load performance
    if (window.performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log(`[Page Load] ${(navigation.loadEventEnd - navigation.fetchStart).toFixed(0)}ms`);
        }
      });
    }

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}