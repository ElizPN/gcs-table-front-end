import { useEffect, useState } from 'react';

// Returns `value` lagged by `delayMs`. Each new `value` resets the timer,
// so the returned copy only updates after the caller pauses for the full delay.
export function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
