import { z } from 'zod';
import { NextRequest } from 'next/server';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Address
  address: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    province: z.string().optional(),
    country: z.string().min(2).max(2), // ISO 3166-1 alpha-2
    zip: z.string().min(1),
    phone: z.string().optional(),
    provinceCode: z.string().optional(),
    countryName: z.string().optional()
  }),

  // Date range
  dateRange: z.object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional()
  }),

  // Search
  search: z.object({
    query: z.string().optional(),
    fields: z.array(z.string()).optional()
  }),

  // ID validation
  id: z.string().uuid(),
  
  // Slug validation
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),

  // Email
  email: z.string().email(),

  // Phone
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),

  // URL
  url: z.string().url(),

  // Currency
  currency: z.string().length(3), // ISO 4217

  // Money amount
  money: z.number().min(0).multipleOf(0.01),

  // Percentage
  percentage: z.number().min(0).max(100),

  // Tags
  tags: z.array(z.string()).optional(),

  // Metadata
  metadata: z.record(z.string(), z.any()).optional()
};

/**
 * Parse and validate request body
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data?: T; error?: z.ZodError }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error };
    }
    throw error;
  }
}

/**
 * Parse and validate query parameters
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { data?: T; error?: z.ZodError } {
  try {
    const params = Object.fromEntries(searchParams.entries());
    const data = schema.parse(params);
    return { data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error };
    }
    throw error;
  }
}

/**
 * Get pagination parameters from search params
 */
export function getPaginationParams(searchParams: URLSearchParams) {
  const result = validateQueryParams(searchParams, commonSchemas.pagination);
  
  return result.data || {
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'desc' as const
  };
}

/**
 * Build Prisma pagination options
 */
export function buildPaginationOptions(params: z.infer<typeof commonSchemas.pagination>) {
  return {
    skip: (params.page - 1) * params.limit,
    take: params.limit,
    ...(params.sortBy && {
      orderBy: {
        [params.sortBy]: params.sortOrder
      }
    })
  };
}

/**
 * Common filter builders
 */
export const filterBuilders = {
  /**
   * Build search filter for multiple fields
   */
  search(query: string | null | undefined, fields: string[]) {
    if (!query) return undefined;
    
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: query,
          mode: 'insensitive'
        }
      }))
    };
  },

  /**
   * Build date range filter
   */
  dateRange(field: string, from?: string, to?: string) {
    const filter: any = {};
    
    if (from) {
      filter.gte = new Date(from);
    }
    
    if (to) {
      filter.lte = new Date(to);
    }
    
    return Object.keys(filter).length > 0 ? { [field]: filter } : undefined;
  },

  /**
   * Build array contains filter
   */
  arrayContains(field: string, values: string[] | undefined) {
    if (!values || values.length === 0) return undefined;
    
    return {
      [field]: {
        hasSome: values
      }
    };
  }
};

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate and parse JSON safely
 */
export function parseJsonSafely<T = any>(json: string): { data?: T; error?: Error } {
  try {
    const data = JSON.parse(json);
    return { data };
  } catch (error) {
    return { error: error as Error };
  }
}