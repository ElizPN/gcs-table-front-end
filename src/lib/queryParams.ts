import type { ListQuery } from '../domain/types';

// Turns a ListQuery into URLSearchParams.
// Empty `search` and `status` are dropped so the resulting string stays clean
// (`?sortBy=id&sortOrder=asc&page=1` instead of `?search=&status=&...`).
//
// Used in two places:
//   - api/records.ts → for the request URL sent to the back-end
//   - hooks/useUrlQueryState.ts → for the address bar
// The two contexts share the exact same shape, so they share this helper.
export function serializeQuery(query: ListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set('search', query.search);
  if (query.status) params.set('status', query.status);
  params.set('sortBy', query.sortBy);
  params.set('sortOrder', query.sortOrder);
  params.set('page', String(query.page));
  return params;
}
