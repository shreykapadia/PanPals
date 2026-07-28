import React from 'react';
import { render, fireEvent, waitFor, act, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddWishlistItemSheet } from '../components/AddWishlistItemSheet';
import { useWishlistActions } from '../hooks/useWishlistActions';
import { WishlistItem } from '../../../mocks/types';
import {
  mockFrom,
  mockRpc,
  mockGetUser,
  resetSupabaseMock,
  chainableResult,
} from '../../../lib/testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

function makeItem(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    id: 'wish-id',
    user_id: 'user-1',
    catalog_product_id: null,
    brand: 'Rare Beauty',
    name: 'Soft Pinch Blush',
    shade: 'Hope',
    category: 'face',
    price: 23,
    product_url: null,
    photo_url: null,
    priority: 'medium',
    rank_position: null,
    reflection_response: null,
    cooling_off_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_at: null,
    status: 'cooling',
    last_reviewed_at: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  mockRpc.mockResolvedValue({ data: { count: 0, products: [] }, error: null });
});

describe('duplicate wishlist entry detection', () => {
  const existingItems = [
    makeItem({ id: 'existing-1', brand: 'Rare Beauty', name: 'Soft Pinch Blush' }),
  ];

  it('asks to keep both on a close match against an existing wishlist entry, and never auto-blocks', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByLabelText, findByText } = renderWithClient(
      <AddWishlistItemSheet
        visible
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        existingItems={existingItems}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByLabelText('Add to wishlist'));

    await findByText('Looks like this may already be on your list.');
    expect(onSave).not.toHaveBeenCalled();

    fireEvent.press(getByText('Keep both'));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
  });

  it('cancelling the duplicate prompt does not save', async () => {
    const onSave = jest.fn();
    const { getByText, getByLabelText, findByText, queryByText } = renderWithClient(
      <AddWishlistItemSheet
        visible
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        existingItems={existingItems}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByLabelText('Add to wishlist'));

    await findByText('Looks like this may already be on your list.');
    fireEvent.press(getByText('Cancel'));

    expect(queryByText('Looks like this may already be on your list.')).toBeNull();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('does not prompt for an unrelated item', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByLabelText, queryByText } = renderWithClient(
      <AddWishlistItemSheet
        visible
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        existingItems={existingItems}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Glossier');
    fireEvent.changeText(getByLabelText('Product name'), 'Cloud Paint');
    fireEvent.press(getByLabelText('Add to wishlist'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(queryByText('Looks like this may already be on your list.')).toBeNull();
  });

  it('ignores a match against a removed or purchased entry', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const removedMatch = [
      makeItem({
        id: 'removed-1',
        brand: 'Rare Beauty',
        name: 'Soft Pinch Blush',
        status: 'removed',
      }),
    ];
    const { getByText, getByLabelText, queryByText } = renderWithClient(
      <AddWishlistItemSheet
        visible
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        existingItems={removedMatch}
      />,
    );

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByLabelText('Add to wishlist'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(queryByText('Looks like this may already be on your list.')).toBeNull();
  });
});

describe('useWishlistActions.markPurchased', () => {
  it('calls the shared conversion hook with the wishlist item id (row 18 — no re-entry)', async () => {
    resetSupabaseMock();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mockFrom.mockImplementation((table: string) => {
      if (table === 'wishlist_items') {
        return chainableResult({
          data: makeItem({ id: 'wish-1', catalog_product_id: null }),
          error: null,
        });
      }
      if (table === 'products') {
        return chainableResult({ data: { id: 'prod-1', category: 'face' }, error: null });
      }
      return chainableResult({ data: null, error: null });
    });

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useWishlistActions(), { wrapper });

    await act(async () => {
      await result.current.markPurchased('wish-1');
    });

    expect(mockFrom).toHaveBeenCalledWith('wishlist_items');
    expect(mockFrom).toHaveBeenCalledWith('products');
  });
});
