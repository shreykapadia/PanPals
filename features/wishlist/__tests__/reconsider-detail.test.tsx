import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReconsiderDetail } from '../components/ReconsiderDetail';
import { WishlistItem } from '../../../mocks/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { mockRpc } from '../../../lib/testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

const readyItem: WishlistItem = {
  id: 'wish-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Blush',
  shade: 'Hope',
  category: 'face',
  price: 23,
  product_url: 'https://example.com/blush',
  photo_url: null,
  priority: 'high',
  rank_position: null,
  reflection_response: null,
  cooling_off_ends_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  reminder_at: null,
  status: 'cooling',
  last_reviewed_at: null,
  created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// useSimilarOwned's query fires on mount; flush the microtask queue right
// after render so its resolution lands inside act() instead of leaking into
// an unwrapped update after an immediate fireEvent.press.
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockRpc.mockResolvedValue({ data: { count: 2, products: [] }, error: null });
});

describe('ReconsiderDetail', () => {
  it('renders nothing when item is null', () => {
    const { queryByText } = render(
      <ReconsiderDetail
        item={null}
        onClose={() => {}}
        onRemove={jest.fn()}
        onMarkPurchased={jest.fn()}
      />,
    );
    expect(queryByText('Reconsider this item')).toBeNull();
  });

  it('shows days-on-list, priority, ready status, and similar-owned count', async () => {
    const { getByText, findByText } = renderWithClient(
      <ReconsiderDetail
        item={readyItem}
        onClose={() => {}}
        onRemove={jest.fn()}
        onMarkPurchased={jest.fn()}
      />,
    );

    expect(getByText('Rare Beauty · Soft Pinch Blush')).toBeTruthy();
    expect(getByText('15 days on your list')).toBeTruthy();
    expect(getByText('HIGH PRIORITY')).toBeTruthy();
    expect(getByText('READY TO RECONSIDER')).toBeTruthy();
    await findByText('You own 2 similar items in this category.');
  });

  it('marking purchased calls onMarkPurchased and closes', async () => {
    const onMarkPurchased = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const { getByLabelText } = renderWithClient(
      <ReconsiderDetail
        item={readyItem}
        onClose={onClose}
        onRemove={jest.fn()}
        onMarkPurchased={onMarkPurchased}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByLabelText('I bought this'));

    await waitFor(() => expect(onMarkPurchased).toHaveBeenCalledWith(readyItem));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('removing calls onRemove and closes', async () => {
    const onRemove = jest.fn().mockResolvedValue(undefined);
    const onClose = jest.fn();
    const { getByLabelText } = renderWithClient(
      <ReconsiderDetail
        item={readyItem}
        onClose={onClose}
        onRemove={onRemove}
        onMarkPurchased={jest.fn()}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByLabelText('Remove from wishlist'));

    await waitFor(() => expect(onRemove).toHaveBeenCalledWith(readyItem));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('shows an inline error and stays open when marking purchased fails', async () => {
    const onMarkPurchased = jest.fn().mockRejectedValue(new Error('network'));
    const onClose = jest.fn();
    const { getByLabelText, findByText } = renderWithClient(
      <ReconsiderDetail
        item={readyItem}
        onClose={onClose}
        onRemove={jest.fn()}
        onMarkPurchased={onMarkPurchased}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByLabelText('I bought this'));

    await findByText("We couldn't complete that. Please try again.");
    expect(onClose).not.toHaveBeenCalled();
  });
});
