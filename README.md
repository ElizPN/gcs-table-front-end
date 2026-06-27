# GCS Table Frontend

Frontend for the **King Full-Stack Developer tech test**. Renders the GCS records served by [`gcs-table-back-end`](../gcs-table-back-end) as a searchable, filterable, sortable, paginated table.

The back-end is delivered separately and does all filtering / sorting / paging server-side. This app is a thin, well-tested view layer.

---

## Run it

Requires **Node 18+** and **npm**.

```bash
npm install
npm start             # http://localhost:3001
```

The back-end is expected at `http://localhost:3000` by default. Start it first:

```bash
cd ../gcs-table-back-end
yarn install && yarn dev
```

Then open the front-end at [http://localhost:3001](http://localhost:3001).

To point at a different host, set `REACT_APP_API_BASE_URL` in `.env.local`.

### Tests

```bash
npm test                    # interactive watch mode
CI=true npm test            # single run, CI mode
```

**33 tests across 7 suites:** helpers (`format`), hooks (`useDebouncedValue`, `useUrlQueryState`, `useRecords`), components (`RecordsTable`, `Pagination`), and a full integration test against a mocked `fetch`.

---

## What it does

- **Search** by `name` (debounced 500ms)
- **Filter** by `status` (`COMPLETED` / `CANCELED` / `ERROR` / `UNKNOWN`)
- **Sort** by `id`, `name`, or `createdOn` (click the column header; click again to flip direction)
- **Paginate** 20 rows per page
- **URL state sync** — filters live in the address bar, so reload-safe and shareable
- **Responsive** — hides low-priority columns at narrow widths, stacks the toolbar on mobile

---

## API contract used

`GET /api/records?search=&status=&sortBy=&sortOrder=&page=` → `{ data, pagination }`.

Empty `search` and `status` are dropped from the URL so the browser cache benefits from cleaner cache keys. The back-end already sets `Cache-Control: max-age=30` so we get a free perf win on repeated navigation.

---

## Design decisions

### Lean stack, no extra deps

The spec calls out load times and bundle size. We added **zero dependencies** beyond what CRA ships with — no Redux, no React Query, no router, no UI library, no axios.

- **No Redux** — one screen, one query object. `useState` is plenty.
- **No React Query** — one endpoint. Browser HTTP cache + back-end's `max-age=30` cover us. Adding it would have been ~13 kB gzipped for no behavior change.
- **No router** — single page. `URLSearchParams` + `history.replaceState` does URL sync in ~15 lines.
- **No UI library** — spec forbids them. CSS Modules (built into CRA) gives scoped styles with no deps.

### URL state sync

`useUrlQueryState` mirrors every filter / sort / page change to the address bar via `history.replaceState`. Reload survives, links are shareable, back/forward navigates filter states. Reading on mount validates against the allowed enums so a typo in the URL (`?status=PIZZA`) just falls back to defaults.

### Debounce + AbortController

Two complementary mechanisms protect against wasteful and unsafe network behavior:

- **Debounce (500ms)** keeps the search box from firing a fetch on every keystroke. *Frequency control.*
- **AbortController** cancels the previous in-flight request whenever the query changes, so stale responses can never paint over fresh data. *Order control.*

The `AbortError` from a cancelled request is silently ignored — we caused it on purpose, so it's not a real failure. Only genuine failures (network down, 500 from server, JSON parse) make it to the error state.

### Carry-over data during refetch

`useRecords` keeps the previous page's rows visible while a new fetch is in flight. Avoids the "flash of empty table" when paging or sorting. The pagination buttons are disabled during loading both for visual feedback and to prevent duplicate requests from impatient clicks.

## Architecture

```text
src/
├── api/records.ts          # the only network call; AbortController plumbing
├── domain/types.ts         # DataRecord, RecordStatus, ListQuery, Page<T>
├── lib/
│   ├── format.ts           # formatDate, formatDelta
│   └── queryParams.ts      # serializeQuery — shared by api + URL state hook
├── hooks/
│   ├── useDebouncedValue.ts
│   ├── useUrlQueryState.ts # reads/writes window.location.search
│   └── useRecords.ts       # discriminated-union state, abort, carry-over
├── components/
│   ├── StatusBadge.tsx
│   ├── RecordsTable.tsx    # sortable headers, memoized rows
│   ├── Toolbar.tsx         # controlled input + select
│   └── Pagination.tsx
└── App.tsx                 # composition root, owns the query
```

Bottom-up: types → API client → hooks → components → App. Each layer depends only on what's below it.

---

## What I'd add with more time

- **Virtualized rows** (e.g. `react-window`) — irrelevant at 20 rows / page, useful if `pageSize` ever grows.
- **Retry button** when in the error state — currently the user has to change a filter to retrigger a fetch.
- **CSV export** of the current filtered view.
- **Column resize** — useful when descriptions are long.
- **E2E test** with Playwright covering the full flow against a real back-end.
- **Skeleton loading rows** — would smooth the perceived performance during the first load.
