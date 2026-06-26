import { API_BASE_URL } from "../config";
import type { DataRecord, ListQuery, Page } from "../domain/types";

// Typed non-2xx error so callers can branch on status if needed.
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Build the query string. Empty strings are dropped so we don't send
// ?search=&status= — the back-end accepts both, but cleaner URLs cache better
// and read better in the address bar.
function buildParams(query: ListQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  params.set("sortBy", query.sortBy);
  params.set("sortOrder", query.sortOrder);
  params.set("page", String(query.page));
  return params;
}

// The only network call in the app. `signal` lets the caller (useRecords)
// abort a stale request when the query changes mid-flight.
export async function fetchRecords(
  query: ListQuery,
  signal: AbortSignal,
): Promise<Page<DataRecord>> {
  const url = `${API_BASE_URL}/api/records?${buildParams(query).toString()}`;
  const res = await fetch(url, { signal });

  if (!res.ok) {
    // Back-end returns { error: string } on 4xx/5xx
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // Body wasn't JSON; keep statusText.
    }
    throw new ApiError(res.status, message);
  }

  return res.json() as Promise<Page<DataRecord>>;
}
