import { render, screen, fireEvent } from '@testing-library/react';
import { RecordsTable } from './RecordsTable';
import type { DataRecord } from '../domain/types';

const sampleRows: DataRecord[] = [
  {
    id: 1,
    name: 'alpha',
    status: 'COMPLETED',
    description: 'first',
    delta: 5,
    createdOn: 1709251200000,
  },
  {
    id: 2,
    name: 'beta',
    status: 'ERROR',
    description: '',
    delta: null,
    createdOn: null,
  },
];

describe('RecordsTable', () => {
  test('renders all rows with id, name, and status', () => {
    render(
      <RecordsTable
        rows={sampleRows}
        sortBy="id"
        sortOrder="asc"
        onSortChange={() => {}}
        state="idle"
      />,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('alpha')).toBeInTheDocument();
    expect(screen.getByText('beta')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  test('clicking the same sort column toggles the order', () => {
    const onSortChange = jest.fn();
    render(
      <RecordsTable
        rows={sampleRows}
        sortBy="id"
        sortOrder="asc"
        onSortChange={onSortChange}
        state="idle"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /ID/i }));
    expect(onSortChange).toHaveBeenCalledWith('id', 'desc');
  });

  test('clicking a different sort column resets the order to asc', () => {
    const onSortChange = jest.fn();
    render(
      <RecordsTable
        rows={sampleRows}
        sortBy="id"
        sortOrder="desc"
        onSortChange={onSortChange}
        state="idle"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Name/i }));
    expect(onSortChange).toHaveBeenCalledWith('name', 'asc');
  });

  test('shows "Loading…" when state is loading and no rows', () => {
    render(
      <RecordsTable
        rows={[]}
        sortBy="id"
        sortOrder="asc"
        onSortChange={() => {}}
        state="loading"
      />,
    );
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  test('shows "No results" when idle and no rows', () => {
    render(
      <RecordsTable
        rows={[]}
        sortBy="id"
        sortOrder="asc"
        onSortChange={() => {}}
        state="idle"
      />,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  test('shows the error message when state is error', () => {
    render(
      <RecordsTable
        rows={[]}
        sortBy="id"
        sortOrder="asc"
        onSortChange={() => {}}
        state="error"
        errorMessage="boom"
      />,
    );
    expect(screen.getByText('boom')).toBeInTheDocument();
  });
});
