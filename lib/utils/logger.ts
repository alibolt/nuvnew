/**
 * Centralized logging utility for development/production environments
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.DEBUG === 'true';

export const logger = {
  debug: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || isDebugEnabled) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    console.error(...args);
  },
  
  // Performance logging
  time: (label: string) => {
    if (isDevelopment || isDebugEnabled) {
      console.time(label);
    }
  },
  
  timeEnd: (label: string) => {
    if (isDevelopment || isDebugEnabled) {
      console.timeEnd(label);
    }
  }
};

// Export a namespace-specific logger factory
export const createLogger = (namespace: string) => {
  return {
    debug: (...args: any[]) => logger.debug(`[${namespace}]`, ...args),
    info: (...args: any[]) => logger.info(`[${namespace}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${namespace}]`, ...args),
    error: (...args: any[]) => logger.error(`[${namespace}]`, ...args),
    time: (label: string) => logger.time(`${namespace}:${label}`),
    timeEnd: (label: string) => logger.timeEnd(`${namespace}:${label}`)
  };
};