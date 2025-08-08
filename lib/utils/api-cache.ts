/**
 * Simple in-memory cache for API responses
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 60 * 1000; // 1 minute default TTL

  /**
   * Get cached data if valid
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set cache data
   */
  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  /**
   * Clear specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const apiCache = new APICache();

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cached fetch wrapper
 */
export async function cachedFetch(
  url: string, 
  options?: RequestInit, 
  ttl?: number
): Promise<Response> {
  const cacheKey = `${url}:${JSON.stringify(options)}`;
  
  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }
  
  // Fetch from server
  const response = await fetch(url, options);
  
  // Cache successful responses
  if (response.ok) {
    const data = await response.json();
    apiCache.set(cacheKey, data, ttl);
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' }
    });
  }
  
  return response;
}