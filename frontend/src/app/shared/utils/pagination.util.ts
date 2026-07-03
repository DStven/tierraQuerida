export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function buildPagination(totalItems: number, page: number, pageSize: number): PaginationState {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return {
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
    totalItems,
  };
}
