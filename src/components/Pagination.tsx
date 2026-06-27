import styles from './Pagination.module.css';

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  // True while a fetch is in flight. Disables both buttons so impatient
  // users can't queue up duplicate requests; also gives visual feedback.
  loading: boolean;
  onPageChange: (next: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  loading,
  onPageChange,
}: Props) {
  const canPrev = page > 1 && !loading;
  const canNext = page < totalPages && !loading;

  return (
    <div className={styles.pagination}>
      <span className={styles.label}>
        {totalItems === 0
          ? 'No results'
          : `Page ${page} of ${totalPages} · ${totalItems} results`}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
      >
        ← Prev
      </button>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
      >
        Next →
      </button>
    </div>
  );
}
