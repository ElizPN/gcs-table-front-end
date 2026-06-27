import type { RecordStatus } from '../domain/types';
import styles from './Toolbar.module.css';

interface Props {
  search: string;
  status: RecordStatus | '';
  onSearchChange: (next: string) => void;
  onStatusChange: (next: RecordStatus | '') => void;
}

// All four statuses live here as the source of truth for the dropdown options.
// Adding a new status = add one line.
const STATUS_OPTIONS: { value: RecordStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELED', label: 'Canceled' },
  { value: 'ERROR', label: 'Error' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

// Purely controlled: every change goes straight up to the parent.
// Debouncing of `search` is the parent's job (App owns the debounce).
export function Toolbar({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: Props) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search by name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search by name"
        />
      </div>
      <div className={styles.statusWrap}>
        <select
          className={styles.statusSelect}
          value={status}
          onChange={(e) => onStatusChange(e.target.value as RecordStatus | '')}
          aria-label="Filter by status"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
