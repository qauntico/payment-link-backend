/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Pagination result interface
 */
export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Calculate pagination metadata
 * @param total - Total number of items
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns PaginationMeta object
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.ceil(total / limit);
  
  return {
    total,
    page,
    limit,
    total_pages: total_pages > 0 ? total_pages : 0,
  };
}

/**
 * Get skip value for Prisma queries
 * @param page - Current page number (1-based)
 * @param limit - Number of items per page
 * @returns Skip value for Prisma
 */
export function getSkipValue(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Normalize pagination parameters (ensure valid values)
 * @param page - Page number (defaults to 1 if invalid)
 * @param limit - Items per page (defaults to 10 if invalid, max 100)
 * @returns Normalized page and limit
 */
export function normalizePaginationParams(
  page?: number,
  limit?: number,
): { page: number; limit: number } {
  const normalizedPage = page && page > 0 ? page : 1;
  const normalizedLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}
