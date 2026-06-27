import { useDebouncedValue } from "./hooks/useDebouncedValue";
import { useRecords } from "./hooks/useRecords";
import { useUrlQueryState } from "./hooks/useUrlQueryState";
import { Toolbar } from "./components/Toolbar";
import { RecordsTable } from "./components/RecordsTable";
import { Pagination } from "./components/Pagination";
import type { RecordStatus, SortBy, SortOrder } from "./domain/types";
import "./App.css";

function App() {
  const [query, setQuery] = useUrlQueryState();
  // Debounced copy only used for the fetch — the input itself stays bound to
  // `query.search` so typing feels instant.
  const debouncedSearch = useDebouncedValue(query.search, 700);
  const records = useRecords({ ...query, search: debouncedSearch });

  // Any filter change resets page to 1; only paging keeps the current page.
  const handleSearchChange = (next: string) =>
    setQuery({ ...query, search: next, page: 1 });

  const handleStatusChange = (next: RecordStatus | "") =>
    setQuery({ ...query, status: next, page: 1 });

  const handleSortChange = (sortBy: SortBy, sortOrder: SortOrder) =>
    setQuery({ ...query, sortBy, sortOrder, page: 1 });

  const handlePageChange = (page: number) => setQuery({ ...query, page });

  const rows =
    records.status === "success" || records.status === "loading"
      ? records.data?.data ?? []
      : [];
  const pagination =
    records.status === "success" || records.status === "loading"
      ? records.data?.pagination
      : undefined;

  const tableState =
    records.status === "error"
      ? "error"
      : records.status === "loading"
      ? "loading"
      : "idle";

  return (
    <div className="app">
      <header className="header">
        <h1 className="title">🍭 GCS Records</h1>
        <p className="subtitle">
          Search, filter, sort and page through records from Google Cloud
          Storage.
        </p>
      </header>

      <Toolbar
        search={query.search}
        status={query.status}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <RecordsTable
        rows={rows}
        sortBy={query.sortBy}
        sortOrder={query.sortOrder}
        onSortChange={handleSortChange}
        state={tableState}
        errorMessage={
          records.status === "error" ? records.error.message : undefined
        }
      />

      <Pagination
        page={query.page}
        totalPages={pagination?.totalPages ?? 0}
        totalItems={pagination?.totalItems ?? 0}
        loading={records.status === "loading"}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

export default App;
