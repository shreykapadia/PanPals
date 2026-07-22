import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProductSearch } from '../ProductSearch';
import { mockRpc, resetSupabaseMock } from '../../../lib/testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('ProductSearch', () => {
  beforeEach(() => {
    resetSupabaseMock();
  });

  it('shows catalog results when typing a brand prefix and calls onSelect', async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          id: 'cat-1',
          brand: 'Rare Beauty',
          name: 'Soft Pinch Liquid Blush',
          category: 'face',
          shade_or_variant: 'Happy',
          image_url: null,
        },
      ],
      error: null,
    });

    const onSelect = jest.fn();
    const { getByPlaceholderText, getByText } = renderWithClient(
      <ProductSearch onSelect={onSelect} />,
    );

    fireEvent.changeText(getByPlaceholderText('Search by brand or product name'), 'rare');

    await waitFor(() => expect(getByText(/Rare Beauty/)).toBeTruthy(), { timeout: 2000 });

    fireEvent.press(getByText(/Rare Beauty/));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Rare Beauty' }));
  });

  it('always shows the "Enter manually" fallback, even with no query', () => {
    const { getByLabelText } = renderWithClient(<ProductSearch onSelect={jest.fn()} />);
    expect(getByLabelText('Enter this product manually')).toBeTruthy();
  });
});
