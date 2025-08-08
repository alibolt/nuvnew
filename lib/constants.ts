/**
 * Centralized constants file for shared values across the application
 */

// File size limits
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024,      // 10MB
  VIDEO: 100 * 1024 * 1024,     // 100MB
  DOCUMENT: 25 * 1024 * 1024,   // 25MB
  AVATAR: 5 * 1024 * 1024,      // 5MB
  CSV: 10 * 1024 * 1024,        // 10MB
} as const;

// Accepted file types
export const ACCEPTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  VIDEO: ['video/mp4', 'video/webm', 'video/ogg'],
  DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  CSV: ['text/csv', 'application/csv'],
} as const;

// API rate limits
export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  UPLOAD_REQUESTS_PER_HOUR: 100,
  SEARCH_REQUESTS_PER_MINUTE: 30,
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60,           // 1 minute
  MEDIUM: 300,         // 5 minutes
  LONG: 3600,          // 1 hour
  VERY_LONG: 86400,    // 24 hours
} as const;

// Status codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Product status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
} as const;

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Store status
export const STORE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  TRIAL: 'trial',
} as const;

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'UTC',
  DATE_FORMAT: 'MMM dd, yyyy',
  TIME_FORMAT: 'HH:mm',
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  SUBDOMAIN: /^[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  VALIDATION_FAILED: 'Validation failed',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
  INVALID_FILE_TYPE: 'Invalid file type',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SAVED: 'Saved successfully',
  PUBLISHED: 'Published successfully',
} as const;