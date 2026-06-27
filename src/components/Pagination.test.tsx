import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  test('renders the label with page numbers and total', () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        totalItems={97}
        loading={false}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText('Page 2 of 5 · 97 results')).toBeInTheDocument();
  });

  test('disables Prev on the first page', () => {
    render(
      <Pagination
        page={1}
        totalPages={5}
        totalItems={97}
        loading={false}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeEnabled();
  });

  test('disables Next on the last page', () => {
    render(
      <Pagination
        page={5}
        totalPages={5}
        totalItems={97}
        loading={false}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  test('disables both buttons while loading', () => {
    render(
      <Pagination
        page={2}
        totalPages={5}
        totalItems={97}
        loading={true}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole('button', { name: /Prev/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  test('calls onPageChange with page+1 when Next is clicked', () => {
    const onPageChange = jest.fn();
    render(
      <Pagination
        page={2}
        totalPages={5}
        totalItems={97}
        loading={false}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('renders "No results" label when totalItems is 0', () => {
    render(
      <Pagination
        page={1}
        totalPages={0}
        totalItems={0}
        loading={false}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });
});
