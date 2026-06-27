import { formatDate, formatDelta } from './format';

describe('formatDate', () => {
  test('returns an em dash for null', () => {
    expect(formatDate(null)).toBe('—');
  });

  test('renders epoch ms as YYYY-MM-DD HH:mm in UTC', () => {
    // 2024-03-01T00:00:00Z
    expect(formatDate(1709251200000)).toBe('2024-03-01 00:00');
  });

  test('preserves minute precision', () => {
    // 2024-03-01T12:34:56Z → seconds dropped
    expect(formatDate(1709296496000)).toBe('2024-03-01 12:34');
  });
});

describe('formatDelta', () => {
  test('returns an em dash for null', () => {
    expect(formatDelta(null)).toBe('—');
  });

  test('stringifies positive integers', () => {
    expect(formatDelta(42)).toBe('42');
  });

  test('stringifies zero', () => {
    expect(formatDelta(0)).toBe('0');
  });

  test('stringifies negative numbers', () => {
    expect(formatDelta(-7)).toBe('-7');
  });
});
