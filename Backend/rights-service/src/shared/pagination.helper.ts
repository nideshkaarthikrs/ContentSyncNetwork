export function clampPagination(page: number, pageSize: number): { page: number; pageSize: number } {
  return {
    page: Math.max(1, page),
    pageSize: Math.min(100, Math.max(1, pageSize)),
  };
}
