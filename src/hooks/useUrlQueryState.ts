import { useCallback, useState } from 'react';
import type {
  ListQuery,
  RecordStatus,
  SortBy,
  SortOrder,
} from '../domain/types';
import { serializeQuery } from '../lib/queryParams';

const STATUSES: RecordStatus[] = ['COMPLETED', 'CANCELED', 'ERROR', 'UNKNOWN'];
const SORT_BYS: SortBy[] = ['id', 'name', 'createdOn'];
const SORT_ORDERS: SortOrder[] = ['asc', 'desc'];

const DEFAULTS: ListQuery = {
  search: '',
  status: '',
  sortBy: 'id',
  sortOrder: 'asc',
  page: 1,
};

// Read the current URL once and turn it into a typed ListQuery.
// Any missing or invalid param falls back to the default — we never trust
// what's in the address bar.
function parseQueryFromUrl(): ListQuery {
  const params = new URLSearchParams(window.location.search);

  const rawStatus = params.get('status') ?? '';
  const rawSortBy = params.get('sortBy') ?? '';
  const rawSortOrder = params.get('sortOrder') ?? '';
  const rawPage = Number(params.get('page'));

  return {
    search: params.get('search') ?? DEFAULTS.search,
    status: STATUSES.includes(rawStatus as RecordStatus)
      ? (rawStatus as RecordStatus)
      : DEFAULTS.status,
    sortBy: SORT_BYS.includes(rawSortBy as SortBy)
      ? (rawSortBy as SortBy)
      : DEFAULTS.sortBy,
    sortOrder: SORT_ORDERS.includes(rawSortOrder as SortOrder)
      ? (rawSortOrder as SortOrder)
      : DEFAULTS.sortOrder,
    page: Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : DEFAULTS.page,
  };
}

// Owns the ListQuery state and keeps window.location.search in sync.
// Behaves like useState from the caller's perspective.
export function useUrlQueryState(): [ListQuery, (next: ListQuery) => void] {
  const [query, setQueryState] = useState<ListQuery>(parseQueryFromUrl);

  const setQuery = useCallback((next: ListQuery) => {
    setQueryState(next);
    // replaceState (not pushState) — we don't want each filter change to add
    // a back-button entry. Reload-safe, shareable, no router needed.
    window.history.replaceState(
      null,
      '',
      '?' + serializeQuery(next).toString(),
    );
  }, []);

  return [query, setQuery];
}
