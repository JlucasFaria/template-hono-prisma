// Pagination utilities: parse query params and build pagination metadata

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Parses and validates pagination parameters from the query string
 */
export function getPaginationParams(
  page?: string | number,
  limit?: string | number,
): { page: number; limit: number; skip: number } {
  const pageNum = page && !isNaN(Number(page)) ? Number(page) : 1;
  const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 10;

  const validPage = Math.max(1, pageNum);
  const validLimit = Math.min(100, Math.max(1, limitNum)); // Max 100 items
  const skip = (validPage - 1) * validLimit;

  return {
    page: validPage,
    limit: validLimit,
    skip,
  };
}

/**
 * Builds pagination metadata from total count and current params
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
