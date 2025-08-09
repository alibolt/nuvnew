/**
 * Recently viewed products tracking utilities
 */

const RECENTLY_VIEWED_KEY = 'recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  productId: string;
  storeSubdomain: string;
  timestamp: number;
}

/**
 * Track a product view
 */
export function trackProductView(productId: string, storeSubdomain: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];
    
    // Remove existing entry for this product if it exists
    items = items.filter(item => 
      !(item.productId === productId && item.storeSubdomain === storeSubdomain)
    );
    
    // Add new entry at the beginning
    items.unshift({
      productId,
      storeSubdomain,
      timestamp: Date.now()
    });
    
    // Keep only the most recent items
    items = items.slice(0, MAX_ITEMS);
    
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error tracking product view:', error);
  }
}

/**
 * Get recently viewed products for a store
 */
export function getRecentlyViewed(storeSubdomain: string): string[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];
    
    const items: RecentlyViewedItem[] = JSON.parse(stored);
    
    // Filter by store and return product IDs
    return items
      .filter(item => item.storeSubdomain === storeSubdomain)
      .map(item => item.productId);
  } catch (error) {
    console.error('Error getting recently viewed products:', error);
    return [];
  }
}

/**
 * Clear recently viewed products
 */
export function clearRecentlyViewed(storeSubdomain?: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    if (!storeSubdomain) {
      // Clear all
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
    } else {
      // Clear only for specific store
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (!stored) return;
      
      const items: RecentlyViewedItem[] = JSON.parse(stored);
      const filtered = items.filter(item => item.storeSubdomain !== storeSubdomain);
      
      if (filtered.length === 0) {
        localStorage.removeItem(RECENTLY_VIEWED_KEY);
      } else {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered));
      }
    }
  } catch (error) {
    console.error('Error clearing recently viewed products:', error);
  }
}