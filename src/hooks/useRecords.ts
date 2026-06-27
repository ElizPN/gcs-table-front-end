import { useEffect, useState } from 'react';
import { fetchRecords } from '../api/records';
import type { DataRecord, ListQuery, Page } from '../domain/types';

// Discriminated union: each state owns exactly what it needs.
// `loading` keeps the previous page so the table doesn't blank out on refetch.
type State =
  | { status: 'loading'; data: Page<DataRecord> | null }
  | { status: 'success'; data: Page<DataRecord> }
  | { status: 'error'; error: Error };

export function useRecords(query: ListQuery): State {
  const [state, setState] = useState<State>({ status: 'loading', data: null });

  useEffect(() => {
    const ctrl = new AbortController();

    setState((prev) => ({
      status: 'loading',
      // Carry over previous data so the table stays populated during refetch.
      // Error → null because the previous data is invalidated by the error.
      data:
        prev.status === 'success' ? prev.data
          : prev.status === 'loading' ? prev.data
          : null,
    }));

    fetchRecords(query, ctrl.signal)
      .then((page) => setState({ status: 'success', data: page }))
      .catch((err) => {
        // AbortError is intentional cancellation — silently ignore.
        if (err?.name === 'AbortError') return;
        const error = err instanceof Error ? err : new Error(String(err));
        setState({ status: 'error', error });
      });

    return () => ctrl.abort();
    // We depend on primitive fields, not the `query` object, on purpose.
    // The parent rebuilds `{ ...query, search: debouncedSearch }` every render,
    // so depending on the object would re-fetch on every render. The five
    // primitives capture every meaningful change. exhaustive-deps disagrees,
    // but its assumption (objects are stable) doesn't hold here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.search, query.status, query.sortBy, query.sortOrder, query.page]);

  return state;
}
