/**
 * Theme Performance Monitoring System
 * Tracks and analyzes theme performance metrics
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  cacheHitRate: number;
  errorRate: number;
  timestamp: Date;
}

export interface ComponentMetrics {
  componentName: string;
  renderCount: number;
  averageRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  lastRenderTime: number;
  errorCount: number;
}

export interface PageMetrics {
  url: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
  firstInputDelay?: number;
}

export interface PerformanceReport {
  themeId: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    averageLoadTime: number;
    averageRenderTime: number;
    totalErrors: number;
    totalPageViews: number;
    slowestPages: PageMetrics[];
    slowestComponents: ComponentMetrics[];
  };
  metrics: PerformanceMetrics[];
  recommendations: string[];
  score: number; // 0-100
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  unit: string;
}

// Default performance thresholds
const DEFAULT_THRESHOLDS: PerformanceThreshold[] = [
  { metric: 'loadTime', warning: 3000, critical: 5000, unit: 'ms' },
  { metric: 'renderTime', warning: 100, critical: 200, unit: 'ms' },
  { metric: 'bundleSize', warning: 500000, critical: 1000000, unit: 'bytes' },
  { metric: 'memoryUsage', warning: 50, critical: 100, unit: 'MB' },
  { metric: 'errorRate', warning: 0.01, critical: 0.05, unit: '%' },
  { metric: 'firstContentfulPaint', warning: 1800, critical: 3000, unit: 'ms' },
  { metric: 'largestContentfulPaint', warning: 2500, critical: 4000, unit: 'ms' },
  { metric: 'cumulativeLayoutShift', warning: 0.1, critical: 0.25, unit: 'score' }
];

export class ThemePerformanceMonitor {
  private themeId: string;
  private metrics: PerformanceMetrics[] = [];
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private pageMetrics: Map<string, PageMetrics[]> = new Map();
  private thresholds: PerformanceThreshold[];
  private observers: PerformanceObserver[] = [];

  constructor(themeId: string, thresholds?: PerformanceThreshold[]) {
    this.themeId = themeId;
    this.thresholds = thresholds || DEFAULT_THRESHOLDS;
  }

  /**
   * Initialize performance monitoring
   */
  initialize(): void {
    if (typeof window === 'undefined') {
      console.warn('[Performance Monitor] Can only run in browser environment');
      return;
    }

    // Setup Performance Observer for navigation timing
    this.setupNavigationObserver();
    
    // Setup Performance Observer for resource timing
    this.setupResourceObserver();
    
    // Setup Performance Observer for paint timing
    this.setupPaintObserver();
    
    // Setup memory monitoring
    this.setupMemoryMonitoring();
    
    // Setup error monitoring
    this.setupErrorMonitoring();

    console.log(`[Performance Monitor] Initialized for theme ${this.themeId}`);
  }

  /**
   * Record component render performance
   */
  recordComponentRender(
    componentName: string,
    renderTime: number,
    error?: boolean
  ): void {
    const existing = this.componentMetrics.get(componentName) || {
      componentName,
      renderCount: 0,
      averageRenderTime: 0,
      maxRenderTime: 0,
      minRenderTime: Infinity,
      lastRenderTime: 0,
      errorCount: 0
    };

    existing.renderCount++;
    existing.lastRenderTime = renderTime;
    existing.maxRenderTime = Math.max(existing.maxRenderTime, renderTime);
    existing.minRenderTime = Math.min(existing.minRenderTime, renderTime);
    existing.averageRenderTime = 
      (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) / 
      existing.renderCount;
    
    if (error) {
      existing.errorCount++;
    }

    this.componentMetrics.set(componentName, existing);

    // Check threshold
    this.checkComponentThreshold(componentName, renderTime);
  }

  /**
   * Record page load metrics
   */
  recordPageLoad(metrics: PageMetrics): void {
    const url = metrics.url;
    const existing = this.pageMetrics.get(url) || [];
    existing.push(metrics);
    
    // Keep last 100 measurements per URL
    if (existing.length > 100) {
      existing.shift();
    }
    
    this.pageMetrics.set(url, existing);

    // Check thresholds
    this.checkPageThresholds(metrics);
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      renderTime: this.calculateAverageRenderTime(),
      bundleSize: this.calculateBundleSize(),
      memoryUsage: this.getMemoryUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
      errorRate: this.calculateErrorRate(),
      timestamp: new Date()
    };
  }

  /**
   * Generate performance report
   */
  generateReport(startDate?: Date, endDate?: Date): PerformanceReport {
    const now = new Date();
    const start = startDate || new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const end = endDate || now;

    // Filter metrics within date range
    const periodMetrics = this.metrics.filter(
      m => m.timestamp >= start && m.timestamp <= end
    );

    // Calculate summary
    const summary = this.calculateSummary(periodMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(summary);

    // Calculate score
    const score = this.calculatePerformanceScore(summary);

    return {
      themeId: this.themeId,
      period: { start, end },
      summary,
      metrics: periodMetrics,
      recommendations,
      score
    };
  }

  /**
   * Setup navigation timing observer
   */
  private setupNavigationObserver(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            const metrics: PageMetrics = {
              url: navEntry.name,
              loadTime: navEntry.loadEventEnd - navEntry.fetchStart,
              firstContentfulPaint: 0,
              largestContentfulPaint: 0,
              timeToInteractive: navEntry.domInteractive - navEntry.fetchStart,
              cumulativeLayoutShift: 0
            };
            this.recordPageLoad(metrics);
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('[Performance Monitor] Failed to setup navigation observer:', error);
    }
  }

  /**
   * Setup resource timing observer
   */
  private setupResourceObserver(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            // Track resource loading
            this.trackResourceLoad(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('[Performance Monitor] Failed to setup resource observer:', error);
    }
  }

  /**
   * Setup paint timing observer
   */
  private setupPaintObserver(): void {
    if (!window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            // Update FCP metric
            this.updatePaintMetric('firstContentfulPaint', entry.startTime);
          } else if (entry.name === 'largest-contentful-paint') {
            // Update LCP metric
            this.updatePaintMetric('largestContentfulPaint', entry.startTime);
          }
        }
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('[Performance Monitor] Failed to setup paint observer:', error);
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if (!(performance as any).memory) return;

    setInterval(() => {
      const memoryInfo = (performance as any).memory;
      const usedMemory = memoryInfo.usedJSHeapSize / 1048576; // Convert to MB
      
      // Store memory usage
      this.metrics.push({
        ...this.getCurrentMetrics(),
        memoryUsage: usedMemory
      });

      // Keep last 1000 metrics
      if (this.metrics.length > 1000) {
        this.metrics.shift();
      }
    }, 60000); // Check every minute
  }

  /**
   * Setup error monitoring
   */
  private setupErrorMonitoring(): void {
    let errorCount = 0;
    let totalEvents = 0;

    window.addEventListener('error', (event) => {
      errorCount++;
      console.error('[Performance Monitor] Error captured:', event.error);
    });

    // Track all events to calculate error rate
    const originalAddEventListener = window.addEventListener;
    window.addEventListener = function(...args) {
      totalEvents++;
      return originalAddEventListener.apply(this, args as any);
    };

    // Calculate error rate periodically
    setInterval(() => {
      const errorRate = totalEvents > 0 ? errorCount / totalEvents : 0;
      
      if (errorRate > this.getThreshold('errorRate').critical) {
        console.warn(`[Performance Monitor] High error rate detected: ${(errorRate * 100).toFixed(2)}%`);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Track resource load
   */
  private trackResourceLoad(entry: PerformanceResourceTiming): void {
    // Track bundle sizes for JS and CSS
    if (entry.name.endsWith('.js') || entry.name.endsWith('.css')) {
      const size = entry.transferSize || entry.encodedBodySize || 0;
      
      if (size > this.getThreshold('bundleSize').warning) {
        console.warn(`[Performance Monitor] Large resource detected: ${entry.name} (${(size / 1024).toFixed(2)} KB)`);
      }
    }
  }

  /**
   * Update paint metric
   */
  private updatePaintMetric(metric: string, value: number): void {
    const threshold = this.getThreshold(metric);
    
    if (value > threshold.critical) {
      console.error(`[Performance Monitor] Critical ${metric}: ${value}ms`);
    } else if (value > threshold.warning) {
      console.warn(`[Performance Monitor] Warning ${metric}: ${value}ms`);
    }
  }

  /**
   * Check component threshold
   */
  private checkComponentThreshold(componentName: string, renderTime: number): void {
    const threshold = this.getThreshold('renderTime');
    
    if (renderTime > threshold.critical) {
      console.error(`[Performance Monitor] Critical render time for ${componentName}: ${renderTime}ms`);
    } else if (renderTime > threshold.warning) {
      console.warn(`[Performance Monitor] Slow render for ${componentName}: ${renderTime}ms`);
    }
  }

  /**
   * Check page thresholds
   */
  private checkPageThresholds(metrics: PageMetrics): void {
    const checks = [
      { metric: 'loadTime', value: metrics.loadTime },
      { metric: 'firstContentfulPaint', value: metrics.firstContentfulPaint },
      { metric: 'largestContentfulPaint', value: metrics.largestContentfulPaint },
      { metric: 'cumulativeLayoutShift', value: metrics.cumulativeLayoutShift }
    ];

    for (const check of checks) {
      const threshold = this.getThreshold(check.metric);
      if (!threshold) continue;

      if (check.value > threshold.critical) {
        console.error(`[Performance Monitor] Critical ${check.metric} for ${metrics.url}: ${check.value}${threshold.unit}`);
      } else if (check.value > threshold.warning) {
        console.warn(`[Performance Monitor] Warning ${check.metric} for ${metrics.url}: ${check.value}${threshold.unit}`);
      }
    }
  }

  /**
   * Get threshold for metric
   */
  private getThreshold(metric: string): PerformanceThreshold {
    return this.thresholds.find(t => t.metric === metric) || {
      metric,
      warning: Infinity,
      critical: Infinity,
      unit: ''
    };
  }

  /**
   * Calculate average render time
   */
  private calculateAverageRenderTime(): number {
    if (this.componentMetrics.size === 0) return 0;
    
    let total = 0;
    let count = 0;
    
    this.componentMetrics.forEach(metric => {
      total += metric.averageRenderTime * metric.renderCount;
      count += metric.renderCount;
    });
    
    return count > 0 ? total / count : 0;
  }

  /**
   * Calculate bundle size
   */
  private calculateBundleSize(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;
    
    for (const resource of resources) {
      if (resource.name.endsWith('.js') || resource.name.endsWith('.css')) {
        totalSize += resource.transferSize || resource.encodedBodySize || 0;
      }
    }
    
    return totalSize;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1048576; // MB
    }
    return 0;
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let cached = 0;
    let total = 0;
    
    for (const resource of resources) {
      total++;
      if (resource.transferSize === 0 && resource.encodedBodySize > 0) {
        cached++;
      }
    }
    
    return total > 0 ? cached / total : 0;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    let totalComponents = 0;
    let errorComponents = 0;
    
    this.componentMetrics.forEach(metric => {
      totalComponents += metric.renderCount;
      errorComponents += metric.errorCount;
    });
    
    return totalComponents > 0 ? errorComponents / totalComponents : 0;
  }

  /**
   * Calculate summary
   */
  private calculateSummary(metrics: PerformanceMetrics[]): any {
    const totalLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0);
    const totalRenderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + (m.errorRate * 100), 0);
    
    // Get slowest pages
    const slowestPages: PageMetrics[] = [];
    this.pageMetrics.forEach((pageMetrics, url) => {
      const latest = pageMetrics[pageMetrics.length - 1];
      if (latest) {
        slowestPages.push(latest);
      }
    });
    slowestPages.sort((a, b) => b.loadTime - a.loadTime);
    
    // Get slowest components
    const slowestComponents: ComponentMetrics[] = Array.from(this.componentMetrics.values())
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, 10);
    
    return {
      averageLoadTime: metrics.length > 0 ? totalLoadTime / metrics.length : 0,
      averageRenderTime: metrics.length > 0 ? totalRenderTime / metrics.length : 0,
      totalErrors: Math.round(totalErrors),
      totalPageViews: this.pageMetrics.size,
      slowestPages: slowestPages.slice(0, 5),
      slowestComponents
    };
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(summary: any): string[] {
    const recommendations: string[] = [];
    
    // Load time recommendations
    if (summary.averageLoadTime > 3000) {
      recommendations.push('Consider optimizing initial page load time with code splitting');
    }
    
    // Render time recommendations
    if (summary.averageRenderTime > 100) {
      recommendations.push('Optimize component render performance with React.memo or useMemo');
    }
    
    // Slowest components
    if (summary.slowestComponents.length > 0) {
      const slowest = summary.slowestComponents[0];
      if (slowest.averageRenderTime > 200) {
        recommendations.push(`Component "${slowest.componentName}" is rendering slowly - consider optimization`);
      }
    }
    
    // Error rate
    if (summary.totalErrors > 1) {
      recommendations.push('High error rate detected - review error logs and fix issues');
    }
    
    // Bundle size (check current metrics)
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics.bundleSize > 500000) {
      recommendations.push('Bundle size is large - consider lazy loading and tree shaking');
    }
    
    // Memory usage
    if (currentMetrics.memoryUsage > 50) {
      recommendations.push('High memory usage detected - check for memory leaks');
    }
    
    // Cache hit rate
    if (currentMetrics.cacheHitRate < 0.5) {
      recommendations.push('Low cache hit rate - improve caching strategy');
    }
    
    return recommendations;
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(summary: any): number {
    let score = 100;
    
    // Deduct points for slow load time
    if (summary.averageLoadTime > 5000) score -= 30;
    else if (summary.averageLoadTime > 3000) score -= 15;
    else if (summary.averageLoadTime > 1000) score -= 5;
    
    // Deduct points for slow render time
    if (summary.averageRenderTime > 200) score -= 20;
    else if (summary.averageRenderTime > 100) score -= 10;
    else if (summary.averageRenderTime > 50) score -= 5;
    
    // Deduct points for errors
    if (summary.totalErrors > 10) score -= 20;
    else if (summary.totalErrors > 5) score -= 10;
    else if (summary.totalErrors > 1) score -= 5;
    
    // Bonus points for good cache hit rate
    const currentMetrics = this.getCurrentMetrics();
    if (currentMetrics.cacheHitRate > 0.8) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Cleanup observers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Performance monitoring React hook
 */
export function useThemePerformance(themeId: string) {
  if (typeof window === 'undefined') {
    return {
      recordRender: () => {},
      getMetrics: () => null,
      getReport: () => null
    };
  }

  const monitor = new ThemePerformanceMonitor(themeId);
  monitor.initialize();

  return {
    recordRender: (componentName: string, renderTime: number, error?: boolean) => {
      monitor.recordComponentRender(componentName, renderTime, error);
    },
    getMetrics: () => monitor.getCurrentMetrics(),
    getReport: (startDate?: Date, endDate?: Date) => monitor.generateReport(startDate, endDate)
  };
}

/**
 * Performance monitoring HOC
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
  themeId: string
) {
  return (props: P) => {
    const startTime = performance.now();
    const monitor = new ThemePerformanceMonitor(themeId);
    
    try {
      const result = Component(props);
      const renderTime = performance.now() - startTime;
      monitor.recordComponentRender(componentName, renderTime, false);
      return result;
    } catch (error) {
      const renderTime = performance.now() - startTime;
      monitor.recordComponentRender(componentName, renderTime, true);
      throw error;
    }
  };
}