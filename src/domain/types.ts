// Mirrors the back-end's record shape after normalization.
// `UNKNOWN` is the synthetic status the back-end uses when a row's status is
// missing or invalid upstream. `delta` and `createdOn` are nullable for the
// same reason — see the back-end's normalize.ts for the policy.

export type RecordStatus = "COMPLETED" | "CANCELED" | "ERROR" | "UNKNOWN";

export type SortBy = "id" | "name" | "createdOn";
export type SortOrder = "asc" | "desc";

export interface DataRecord {
  id: number;
  name: string;
  status: RecordStatus;
  description: string;
  delta: number | null;
  createdOn: number | null;
}

// The single query object the whole UI drives off of.
// '' is the "no filter" sentinel for search and status — keeps the type
// simple and avoids carrying optional fields through the URL serializer.
export interface ListQuery {
  search: string;
  status: RecordStatus | "";
  sortBy: SortBy;
  sortOrder: SortOrder;
  page: number; // 1-based, matches the back-end
}

// Generic paged response — matches the back-end's envelope exactly.
export interface Page<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
