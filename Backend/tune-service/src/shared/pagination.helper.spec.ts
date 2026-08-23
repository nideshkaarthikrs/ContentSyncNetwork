import { clampPagination } from './pagination.helper';

/**
 * Unit tests for clampPagination (P0.4 — page/pageSize bounds). Pure
 * function, no mocks needed.
 */

describe('clampPagination', () => {
  it('leaves an already in-bounds page/pageSize unchanged', () => {
    expect(clampPagination(1, 20)).toEqual({ page: 1, pageSize: 20 });
  });

  it('clamps page up from 0', () => {
    expect(clampPagination(0, 20)).toEqual({ page: 1, pageSize: 20 });
  });

  it('clamps page up from a negative value', () => {
    expect(clampPagination(-5, 20)).toEqual({ page: 1, pageSize: 20 });
  });

  it('clamps pageSize up from 0', () => {
    expect(clampPagination(1, 0)).toEqual({ page: 1, pageSize: 1 });
  });

  it('clamps pageSize up from a negative value', () => {
    expect(clampPagination(1, -10)).toEqual({ page: 1, pageSize: 1 });
  });

  it('clamps pageSize down at the upper bound', () => {
    expect(clampPagination(1, 150)).toEqual({ page: 1, pageSize: 100 });
  });

  it('leaves pageSize unchanged at exactly the upper bound', () => {
    expect(clampPagination(1, 100)).toEqual({ page: 1, pageSize: 100 });
  });
});
