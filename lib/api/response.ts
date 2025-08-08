import { NextResponse } from 'next/server';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
}

interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: Record<string, any>;
}

interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

interface ApiPaginatedResponse<T = any> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
  meta?: Record<string, any>;
}

/**
 * Standard API response utilities
 */
export const apiResponse = {
  /**
   * Success response
   */
  success<T = any>(data: T, meta?: Record<string, any>): NextResponse<ApiSuccessResponse<T>> {
    return NextResponse.json({
      success: true,
      data,
      ...(meta && { meta })
    });
  },

  /**
   * Error response
   */
  error(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ): NextResponse<ApiErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(code && { code }),
        ...(details && { details })
      },
      { status }
    );
  },

  /**
   * Paginated response
   */
  paginated<T = any>(
    data: T[],
    pagination: Omit<PaginationMeta, 'totalPages'>,
    meta?: Record<string, any>
  ): NextResponse<ApiPaginatedResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        ...pagination,
        totalPages
      },
      ...(meta && { meta })
    });
  },

  /**
   * Common error responses
   */
  unauthorized(message: string = 'Unauthorized'): NextResponse<ApiErrorResponse> {
    return this.error(message, 401, 'UNAUTHORIZED');
  },

  forbidden(message: string = 'Forbidden'): NextResponse<ApiErrorResponse> {
    return this.error(message, 403, 'FORBIDDEN');
  },

  notFound(resource: string = 'Resource'): NextResponse<ApiErrorResponse> {
    return this.error(`${resource} not found`, 404, 'NOT_FOUND');
  },

  badRequest(message: string, details?: any): NextResponse<ApiErrorResponse> {
    return this.error(message, 400, 'BAD_REQUEST', details);
  },

  conflict(message: string): NextResponse<ApiErrorResponse> {
    return this.error(message, 409, 'CONFLICT');
  },

  validationError(errors: any): NextResponse<ApiErrorResponse> {
    return this.error('Validation failed', 422, 'VALIDATION_ERROR', errors);
  },

  serverError(message: string = 'Internal server error'): NextResponse<ApiErrorResponse> {
    return this.error(message, 500, 'SERVER_ERROR');
  }
};

/**
 * API error handler with logging
 */
export function handleApiError(
  error: any,
  context?: string,
  options?: {
    logError?: boolean;
    exposeDetails?: boolean;
  }
): NextResponse<ApiErrorResponse> {
  const { logError = true, exposeDetails = false } = options || {};

  if (logError) {
    console.error(context ? `[${context}] Error:` : 'Error:', error);
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return apiResponse.conflict('A record with this value already exists');
  }

  if (error.code === 'P2025') {
    return apiResponse.notFound();
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return apiResponse.validationError(error.errors);
  }

  // Default error response
  const message = exposeDetails && error.message ? error.message : 'Internal server error';
  return apiResponse.serverError(message);
}

/**
 * Legacy support for old API routes
 */
export function successResponse(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}