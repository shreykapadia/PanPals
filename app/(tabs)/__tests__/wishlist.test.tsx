import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WishlistTab from '../wishlist';
import { WishlistItem } from '../../../mocks/types';

// The screen renders AddWishlistItemSheet, which pulls in ProductSearch ->
// lib/api -> lib/supabase — mock it so the client's env-var check doesn't
// throw in tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

function makeItem(overrides: Partial<WishlistItem>): WishlistItem {
  return {
    id: 'wish-id',
    user_id: 'user-1',
    catalog_product_id: null,
    brand: 'Brand',
    name: 'Product',
    shade: 'Shade',
    category: 'other',
    price: null,
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

const items: WishlistItem[] = [
  makeItem({
    id: 'a',
    brand: 'Rare Beauty',
    name: 'Blush',
    shade: 'Joy',
    category: 'face',
    priority: 'high',
  }),
  makeItem({
    id: 'b',
    brand: 'Glossier',
    name: 'Gloss',
    shade: 'Clear',
    category: 'lip',
    priority: 'low',
  }),
];

const mockActions = {
  items,
  isLoading: false,
  isError: false,
  isRefetching: false,
  refetch: jest.fn(),
  addItem: jest.fn(),
  isAdding: false,
  editItem: jest.fn(),
  isEditing: false,
  removeItem: jest.fn().mockResolvedValue(undefined),
  restoreItem: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../../features/wishlist/hooks/useWishlistActions', () => ({
  useWishlistActions: () => mockActions,
}));

describe('WishlistTab filters', () => {
  it('lists all items with no filter applied', () => {
    const { getByText } = render(<WishlistTab />);
    expect(getByText('Rare Beauty · Blush')).toBeTruthy();
    expect(getByText('Glossier · Gloss')).toBeTruthy();
  });

  it('narrows the list by category', () => {
    const { getByText, queryByText } = render(<WishlistTab />);

    fireEvent.press(getByText('Lip'));

    expect(queryByText('Rare Beauty · Blush')).toBeNull();
    expect(getByText('Glossier · Gloss')).toBeTruthy();
  });

  it('narrows the list by priority', () => {
    const { getByText, queryByText } = render(<WishlistTab />);

    fireEvent.press(getByText('High priority'));

    expect(getByText('Rare Beauty · Blush')).toBeTruthy();
    expect(queryByText('Glossier · Gloss')).toBeNull();
  });

  it('shows a no-matches state when filters exclude everything', () => {
    const { getByText } = render(<WishlistTab />);

    fireEvent.press(getByText('Lip'));
    fireEvent.press(getByText('High priority'));

    expect(getByText('No items match these filters')).toBeTruthy();
  });
});
