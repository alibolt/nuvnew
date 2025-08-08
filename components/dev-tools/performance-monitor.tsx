'use client';

import { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';

// Singleton instance kontrolü
let isMonitorActive = false;

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    pageLoad: 0,
    apiCalls: [] as { url: string; duration: number }[],
    componentRenders: 0,
    memoryUsage: 0,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Sadece client-side'da ve mount olduktan sonra başlat
    if (!mounted) return;
    if (isInitialized.current || isMonitorActive) return;
    isInitialized.current = true;
    isMonitorActive = true;
    
    // Development modunda göster
    if (process.env.NODE_ENV === 'development') {
      // Page load time
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          setMetrics(prev => ({
            ...prev,
            pageLoad: navigation.loadEventEnd - navigation.fetchStart
          }));
        }
      }

      // API call monitoring
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const url = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        setMetrics(prev => ({
          ...prev,
          apiCalls: [...prev.apiCalls.slice(-9), { url, duration }].filter(
            call => call.duration > 100 // Sadece 100ms üzeri göster
          )
        }));
        
        return response;
      };

      // Memory usage
      const checkMemory = () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: Math.round(memory.usedJSHeapSize / 1048576) // MB
          }));
        }
      };
      
      const interval = setInterval(checkMemory, 2000);
      return () => {
        clearInterval(interval);
        window.fetch = originalFetch;
        isMonitorActive = false;
      };
    }
  }, [mounted]);

  // Server-side'da render etme
  if (!mounted || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-mono"
      >
        {isVisible ? 'Hide' : 'Perf'}
      </button>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-sm font-mono text-xs">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">Performance Monitor</h3>
            <button onClick={() => setIsVisible(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <span className="text-gray-400">Page Load:</span>{' '}
              <span className={metrics.pageLoad > 1000 ? 'text-red-400' : 'text-green-400'}>
                {metrics.pageLoad.toFixed(0)}ms
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Memory:</span>{' '}
              <span className={metrics.memoryUsage > 100 ? 'text-yellow-400' : 'text-green-400'}>
                {metrics.memoryUsage}MB
              </span>
            </div>
            
            {metrics.apiCalls.length > 0 && (
              <div>
                <div className="text-gray-400 mb-1">Recent API Calls:</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {metrics.apiCalls.map((call, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-gray-500">{call.url.split('/').slice(-2).join('/')}</span>
                      <span className={call.duration > 500 ? 'text-red-400 ml-2' : 'text-green-400 ml-2'}>
                        {call.duration.toFixed(0)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}