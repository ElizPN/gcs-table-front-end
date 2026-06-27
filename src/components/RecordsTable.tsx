import { memo } from 'react';
import type { DataRecord, SortBy, SortOrder } from '../domain/types';
import { formatDate, formatDelta } from '../lib/format';
import { StatusBadge } from './StatusBadge';
import styles from './RecordsTable.module.css';

interface Props {
  rows: DataRecord[];
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void;
  // Drives the message row when there's nothing useful to show.
  state: 'idle' | 'loading' | 'error';
  errorMessage?: string;
}

// Columns are declared once. `sortable` flips whether the header is a button.
// `cssClass` is used to hide the column at narrow widths.
const COLUMNS = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'description', label: 'Description', sortable: false, cssClass: 'colDescription' },
  { key: 'delta', label: 'Delta', sortable: false, cssClass: 'colDelta' },
  { key: 'createdOn', label: 'Created', sortable: true },
] as const;

export function RecordsTable({
  rows,
  sortBy,
  sortOrder,
  onSortChange,
  state,
  errorMessage,
}: Props) {
  // Click on a sortable header: same column → flip order, new column → asc.
  const handleSort = (key: SortBy) => {
    if (sortBy === key) {
      onSortChange(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={'cssClass' in col ? styles[col.cssClass] : undefined}
              >
                {col.sortable ? (
                  <SortHeader
                    label={col.label}
                    active={sortBy === col.key}
                    order={sortOrder}
                    onClick={() => handleSort(col.key as SortBy)}
                  />
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {renderBody({ rows, state, errorMessage })}
        </tbody>
      </table>
    </div>
  );
}

function SortHeader({
  label,
  active,
  order,
  onClick,
}: {
  label: string;
  active: boolean;
  order: SortOrder;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.sortButton} ${active ? styles.sortActive : ''}`}
      onClick={onClick}
    >
      {label}
      <span className={styles.sortArrow} aria-hidden>
        {active ? (order === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </button>
  );
}

// The body has four possible shapes: error message, loading message, empty
// message, or actual rows. Each is a single full-width row except the last.
function renderBody({
  rows,
  state,
  errorMessage,
}: {
  rows: DataRecord[];
  state: 'idle' | 'loading' | 'error';
  errorMessage?: string;
}) {
  if (state === 'error') {
    return (
      <tr className={`${styles.messageRow} ${styles.errorRow}`}>
        <td colSpan={COLUMNS.length}>
          {errorMessage ?? 'Something went wrong.'}
        </td>
      </tr>
    );
  }

  if (rows.length === 0) {
    return (
      <tr className={styles.messageRow}>
        <td colSpan={COLUMNS.length}>
          {state === 'loading' ? 'Loading…' : 'No results'}
        </td>
      </tr>
    );
  }

  return rows.map((row) => <Row key={row.id} row={row} />);
}

// Memoized: a row only re-renders if its own data changed. Saves work when
// the parent re-renders due to filter/sort/page changes that don't affect it.
const Row = memo(function Row({ row }: { row: DataRecord }) {
  return (
    <tr>
      <td className={styles.mono}>{row.id}</td>
      <td>{row.name}</td>
      <td><StatusBadge status={row.status} /></td>
      <td className={styles.colDescription}>{row.description || <span className={styles.muted}>—</span>}</td>
      <td className={styles.colDelta}>{formatDelta(row.delta)}</td>
      <td className={styles.mono}>{formatDate(row.createdOn)}</td>
    </tr>
  );
});
