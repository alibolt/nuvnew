import { Prisma } from '@prisma/client';

/**
 * Common database query builders and utilities
 */

/**
 * Build where clause for search across multiple fields
 */
export function buildSearchWhere(
  search: string | null | undefined,
  fields: string[]
): Prisma.JsonObject | undefined {
  if (!search) return undefined;

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as Prisma.QueryMode
      }
    }))
  };
}

/**
 * Build where clause for filtering by multiple values
 */
export function buildInFilter(
  field: string,
  values: string[] | undefined
): Prisma.JsonObject | undefined {
  if (!values || values.length === 0) return undefined;

  return {
    [field]: {
      in: values
    }
  };
}

/**
 * Build where clause for date range filtering
 */
export function buildDateRangeWhere(
  field: string,
  from?: string | Date,
  to?: string | Date
): Prisma.JsonObject | undefined {
  const conditions: any = {};

  if (from) {
    conditions.gte = from instanceof Date ? from : new Date(from);
  }

  if (to) {
    conditions.lte = to instanceof Date ? to : new Date(to);
  }

  return Object.keys(conditions).length > 0 ? { [field]: conditions } : undefined;
}

/**
 * Merge multiple where conditions
 */
export function mergeWhereConditions(
  ...conditions: (Prisma.JsonObject | undefined)[]
): Prisma.JsonObject {
  const validConditions = conditions.filter(Boolean) as Prisma.JsonObject[];
  
  if (validConditions.length === 0) return {};
  if (validConditions.length === 1) return validConditions[0];
  
  return {
    AND: validConditions
  };
}

/**
 * Common include patterns for different models
 */
export const commonIncludes = {
  product: {
    full: {
      category: true,
      variants: {
        include: {
          images: true
        },
        orderBy: {
          price: 'asc' as const
        }
      },
      reviews: {
        where: { approved: true },
        select: {
          rating: true
        }
      }
    },
    
    minimal: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      variants: {
        select: {
          id: true,
          price: true,
          compareAtPrice: true,
          inventory: true
        },
        orderBy: {
          price: 'asc' as const
        },
        take: 1
      }
    }
  },

  order: {
    full: {
      customer: true,
      lineItems: {
        include: {
          product: true,
          variant: true
        }
      },
      shippingAddress: true,
      billingAddress: true,
      fulfillments: true,
      refunds: true,
      discounts: true
    },
    
    minimal: {
      customer: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: {
          lineItems: true
        }
      }
    }
  },

  customer: {
    full: {
      addresses: true,
      orders: {
        orderBy: {
          createdAt: 'desc' as const
        },
        take: 10
      },
      _count: {
        select: {
          orders: true
        }
      }
    },
    
    minimal: {
      _count: {
        select: {
          orders: true
        }
      }
    }
  }
};

/**
 * Batch operations utilities
 */
export const batchOperations = {
  /**
   * Create many with error handling
   */
  async createMany<T>(
    model: any,
    data: T[],
    options?: { skipDuplicates?: boolean }
  ) {
    try {
      const result = await model.createMany({
        data,
        skipDuplicates: options?.skipDuplicates
      });
      
      return { success: true, count: result.count };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Update many with transaction
   */
  async updateManyInTransaction<T extends { id: string }>(
    prisma: any,
    model: string,
    updates: T[]
  ) {
    const operations = updates.map(update => {
      const { id, ...data } = update;
      return prisma[model].update({
        where: { id },
        data
      });
    });

    return await prisma.$transaction(operations);
  }
};

/**
 * Soft delete utilities
 */
export const softDelete = {
  /**
   * Build where clause that excludes soft deleted records
   */
  excludeDeleted(additionalWhere?: Prisma.JsonObject): Prisma.JsonObject {
    return {
      ...additionalWhere,
      deletedAt: null
    };
  },

  /**
   * Soft delete a record
   */
  async delete(model: any, id: string) {
    return await model.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  },

  /**
   * Restore a soft deleted record
   */
  async restore(model: any, id: string) {
    return await model.update({
      where: { id },
      data: { deletedAt: null }
    });
  }
};

/**
 * Transaction utilities
 */
export async function withTransaction<T>(
  prisma: any,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}

/**
 * Pagination metadata builder
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
    hasPrevious: page > 1
  };
}