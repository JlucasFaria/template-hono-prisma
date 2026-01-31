// src/utils/pagination.ts

export interface PaginationParams {
  page?: number;
  limit?: number;
}

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
 * Extrai e valida parâmetros de paginação da query string
 */
export function getPaginationParams(
  page?: string | number,
  limit?: string | number,
): { page: number; limit: number; skip: number } {
  const pageNum = page ? Number(page) : 1;
  const limitNum = limit ? Number(limit) : 10;

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
 * Cria metadata de paginação
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
