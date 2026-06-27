// `createdOn` arrives as epoch ms or null. Render as `YYYY-MM-DD HH:mm` in UTC
// so the display is stable regardless of the viewer's timezone.
export function formatDate(ms: number | null): string {
  if (ms == null) return '—';
  return new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
}

// `delta` arrives as number or null. Just stringify; null → em dash.
export function formatDelta(n: number | null): string {
  if (n == null) return '—';
  return String(n);
}
