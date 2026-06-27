import type { RecordStatus } from '../domain/types';
import styles from './StatusBadge.module.css';

// Maps RecordStatus to a class on the CSS module. Lowercasing the status
// gives us the matching class name without a switch statement.
export function StatusBadge({ status }: { status: RecordStatus }) {
  const className = `${styles.badge} ${styles[status.toLowerCase()]}`;
  return <span className={className}>{status}</span>;
}
