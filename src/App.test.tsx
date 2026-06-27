import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import type { Page, DataRecord } from './domain/types';

function makePage(ids: number[]): Page<DataRecord> {
  return {
    data: ids.map((id) => ({
      id,
      name: `row-${id}`,
      status: 'COMPLETED' as const,
      description: '',
      delta: null,
      createdOn: null,
    })),
    pagination: {
      page: 1,
      pageSize: 20,
      totalItems: ids.length,
      totalPages: 1,
    },
  };
}

describe('App integration', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => makePage([1, 2, 3]),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test('fires an initial fetch with default query params and renders rows', async () => {
    render(<App />);

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const url = fetchSpy.mock.calls[0][0] as string;
    expect(url).toMatch(/sortBy=id/);
    expect(url).toMatch(/sortOrder=asc/);
    expect(url).toMatch(/page=1/);

    expect(await screen.findByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-2')).toBeInTheDocument();
    expect(screen.getByText('row-3')).toBeInTheDocument();
  });

  test('typing in search eventually fires a debounced fetch with the new term', async () => {
    render(<App />);

    // Initial fetch on mount.
    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(1));

    const input = screen.getByLabelText(/Search by name/i);
    fireEvent.change(input, { target: { value: 'foo' } });

    // The debounce is 500ms; give it a comfortable real-time margin.
    await waitFor(
      () => expect(fetchSpy).toHaveBeenCalledTimes(2),
      { timeout: 2000 },
    );

    const secondCall = fetchSpy.mock.calls[1][0] as string;
    expect(secondCall).toMatch(/search=foo/);
    expect(secondCall).toMatch(/page=1/);
  });
});
