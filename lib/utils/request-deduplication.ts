/**
 * Request deduplication to prevent duplicate API calls
 */

type PromiseCache = Map<string, Promise<any>>;

class RequestDeduplicator {
  private cache: PromiseCache = new Map();
  
  /**
   * Deduplicate requests by key
   * If a request with the same key is already in flight, return the same promise
   */
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // Check if request is already in flight
    const existing = this.cache.get(key);
    if (existing) {
      return existing;
    }
    
    // Create new request and cache the promise
    const promise = fn().finally(() => {
      // Clean up after request completes
      this.cache.delete(key);
    });
    
    this.cache.set(key, promise);
    return promise;
  }
  
  /**
   * Clear all pending requests
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Get number of pending requests
   */
  get size() {
    return this.cache.size;
  }
}

// Create singleton instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * HOF to wrap async functions with deduplication
 */
export function withDeduplication<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    return requestDeduplicator.dedupe(key, () => fn(...args));
  }) as T;
}