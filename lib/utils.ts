import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatPrice, formatCurrency } from './price-utils';

export const protocol =
  process.env.NODE_ENV === 'production' ? 'https' : 'http';
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export from price-utils for backward compatibility
export { formatPrice, formatCurrency };

// Unflatten dot notation keys to nested object
export function unflattenSettings(settings: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(settings).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = result;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  });
  
  return result;
}
