import { renderHook, act } from '@testing-library/react';
import { useUrlQueryState } from './useUrlQueryState';

function setSearch(qs: string) {
  // jsdom lets us set window.location.search by replacing the search string.
  window.history.replaceState(null, '', `/?${qs}`);
}

describe('useUrlQueryState', () => {
  beforeEach(() => setSearch(''));

  test('uses defaults when URL has no params', () => {
    const { result } = renderHook(() => useUrlQueryState());
    const [query] = result.current;
    expect(query).toEqual({
      search: '',
      status: '',
      sortBy: 'id',
      sortOrder: 'asc',
      page: 1,
    });
  });

  test('reads valid params from the URL on mount', () => {
    setSearch('search=foo&status=ERROR&sortBy=name&sortOrder=desc&page=3');
    const { result } = renderHook(() => useUrlQueryState());
    const [query] = result.current;
    expect(query).toEqual({
      search: 'foo',
      status: 'ERROR',
      sortBy: 'name',
      sortOrder: 'desc',
      page: 3,
    });
  });

  test('falls back to defaults for invalid enum values', () => {
    setSearch('status=PIZZA&sortBy=delta&sortOrder=sideways&page=abc');
    const { result } = renderHook(() => useUrlQueryState());
    const [query] = result.current;
    expect(query.status).toBe('');
    expect(query.sortBy).toBe('id');
    expect(query.sortOrder).toBe('asc');
    expect(query.page).toBe(1);
  });

  test('updating state mirrors to the URL', () => {
    const { result } = renderHook(() => useUrlQueryState());

    act(() => {
      const [, setQuery] = result.current;
      setQuery({
        search: 'bar',
        status: 'COMPLETED',
        sortBy: 'createdOn',
        sortOrder: 'desc',
        page: 2,
      });
    });

    expect(window.location.search).toBe(
      '?search=bar&status=COMPLETED&sortBy=createdOn&sortOrder=desc&page=2',
    );
    expect(result.current[0].search).toBe('bar');
  });

  test('omits empty search and status from the URL', () => {
    const { result } = renderHook(() => useUrlQueryState());

    act(() => {
      const [, setQuery] = result.current;
      setQuery({
        search: '',
        status: '',
        sortBy: 'id',
        sortOrder: 'asc',
        page: 1,
      });
    });

    expect(window.location.search).toBe('?sortBy=id&sortOrder=asc&page=1');
  });
});
