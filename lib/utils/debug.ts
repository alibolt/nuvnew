/**
 * Debug utility for development logging
 * Only logs in development environment
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log('[DEBUG]', ...args);
  }
};

export const debugWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn('[DEBUG]', ...args);
  }
};

export const debugError = (...args: any[]) => {
  if (isDevelopment) {
    console.error('[DEBUG]', ...args);
  }
};

// For temporary debug logs that should be removed
export const tempLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log('[TEMP]', ...args);
  }
};