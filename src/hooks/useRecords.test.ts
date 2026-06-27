import { renderHook, waitFor, act } from '@testing-library/react';
import { useRecords } from './useRecords';
import type { ListQuery, Page, DataRecord } from '../domain/types';

const baseQuery: ListQuery = {
  search: '',
  status: '',
  sortBy: 'id',
  sortOrder: 'asc',
  page: 1,
};

function makePage(ids: number[]): Page<DataRecord> {
  return {
    data: ids.map((id) => ({
      id,
      name: `row-${id}`,
      status: 'COMPLETED',
      description: '',
      delta: null,
      createdOn: null,
    })),
    pagination: {
      page: 1,
      pageSize: 20,
      totalItems: ids.length,
      totalPages: 1,
    },
  };
}

describe('useRecords', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test('transitions loading → success and exposes the data', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => makePage([1, 2, 3]),
    } as Response);

    const { result } = renderHook(() => useRecords(baseQuery));

    expect(result.current.status).toBe('loading');

    await waitFor(() => expect(result.current.status).toBe('success'));
    if (result.current.status === 'success') {
      expect(result.current.data.data.map((r) => r.id)).toEqual([1, 2, 3]);
    }
  });

  test('transitions loading → error on non-2xx response', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'boom' }),
    } as Response);

    const { result } = renderHook(() => useRecords(baseQuery));

    await waitFor(() => expect(result.current.status).toBe('error'));
    if (result.current.status === 'error') {
      expect(result.current.error.message).toBe('boom');
    }
  });

  test('carries over previous data while refetching after a query change', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => makePage([1, 2, 3]),
    } as Response);

    const { result, rerender } = renderHook(
      ({ q }: { q: ListQuery }) => useRecords(q),
      { initialProps: { q: baseQuery } },
    );

    await waitFor(() => expect(result.current.status).toBe('success'));

    // Trigger a refetch with a different page. Second fetch is delayed so we
    // can observe the carry-over.
    let resolveSecond: (v: Response) => void;
    fetchSpy.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveSecond = resolve;
      }),
    );

    rerender({ q: { ...baseQuery, page: 2 } });

    // Now in loading, but data should still be page 1.
    expect(result.current.status).toBe('loading');
    if (result.current.status === 'loading') {
      expect(result.current.data?.data.map((r) => r.id)).toEqual([1, 2, 3]);
    }

    await act(async () => {
      resolveSecond!({
        ok: true,
        json: async () => makePage([4, 5, 6]),
      } as Response);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    if (result.current.status === 'success') {
      expect(result.current.data.data.map((r) => r.id)).toEqual([4, 5, 6]);
    }
  });

  test('aborts the previous request when query changes', async () => {
    const abortSignals: AbortSignal[] = [];
    fetchSpy.mockImplementation((_url, init?: RequestInit) => {
      if (init?.signal) abortSignals.push(init.signal);
      return new Promise(() => {}); // never resolves
    });

    const { rerender } = renderHook(
      ({ q }: { q: ListQuery }) => useRecords(q),
      { initialProps: { q: baseQuery } },
    );

    rerender({ q: { ...baseQuery, search: 'x' } });

    expect(abortSignals).toHaveLength(2);
    expect(abortSignals[0].aborted).toBe(true);
    expect(abortSignals[1].aborted).toBe(false);
  });
});
