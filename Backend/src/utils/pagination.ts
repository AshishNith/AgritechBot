export interface PaginationPayload {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPagination(page: number, limit: number, total: number): PaginationPayload {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}

