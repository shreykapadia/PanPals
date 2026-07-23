import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WishlistItemCard } from '../components/WishlistItemCard';
import { AddWishlistItemSheet } from '../components/AddWishlistItemSheet';
import { WishlistItem } from '../../../mocks/types';

// AddWishlistItemSheet renders ProductSearch, which pulls in lib/api ->
// lib/supabase — mock it so the client's env-var check doesn't throw in tests.
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));

const baseItem: WishlistItem = {
  id: 'wish-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Blush',
  shade: 'Joy',
  category: 'face',
  price: 24,
  product_url: null,
  photo_url: null,
  priority: 'high',
  rank_position: null,
  reflection_response: null,
  cooling_off_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
  reminder_at: null,
  status: 'cooling',
  last_reviewed_at: null,
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
};

describe('WishlistItemCard', () => {
  it('renders brand, name, shade, priority, and days-on-list', () => {
    const { getByText } = render(
      <WishlistItemCard item={baseItem} onPress={() => {}} onRemove={() => {}} />,
    );

    expect(getByText('Rare Beauty · Soft Pinch Blush')).toBeTruthy();
    expect(getByText('Face · Joy')).toBeTruthy();
    expect(getByText('HIGH PRIORITY')).toBeTruthy();
    expect(getByText('2 days on your list')).toBeTruthy();
  });
});

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AddWishlistItemSheet', () => {
  const fillManualEntry = (
    getByLabelText: (label: string) => any,
    getByText: (label: string) => any,
  ) => {
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Glossier');
    fireEvent.changeText(getByLabelText('Product name'), 'Cloud Paint');
  };

  it('defaults priority to Medium and saves it unchanged', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = renderWithClient(
      <AddWishlistItemSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fillManualEntry(getByLabelText, getByText);
    fireEvent.press(getByText('Add to wishlist'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ priority: 'medium' }));
  });

  it('stores the selected priority and reflection when changed', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    const { getByLabelText, getByText } = renderWithClient(
      <AddWishlistItemSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fillManualEntry(getByLabelText, getByText);
    fireEvent.press(getByText('Low priority'));
    fireEvent.changeText(
      getByLabelText('Would you still want this in 30 days? (optional)'),
      'Yes, still want it',
    );
    fireEvent.press(getByText('Add to wishlist'));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        priority: 'low',
        reflection_response: 'Yes, still want it',
        brand: 'Glossier',
        name: 'Cloud Paint',
      }),
    );
  });

  it('keeps the save button disabled when brand and name are missing', () => {
    const onSave = jest.fn();
    const { getByText, getByLabelText } = renderWithClient(
      <AddWishlistItemSheet visible onClose={() => {}} onSave={onSave} isSaving={false} />,
    );

    fireEvent.press(getByText('Manual'));
    fireEvent.press(getByLabelText('Add to wishlist'));

    expect(onSave).not.toHaveBeenCalled();
    expect(getByLabelText('Add to wishlist').props.accessibilityState?.disabled).toBe(true);
  });

  it('renders nothing when not visible', () => {
    const { queryByText } = render(
      <AddWishlistItemSheet
        visible={false}
        onClose={() => {}}
        onSave={jest.fn()}
        isSaving={false}
      />,
    );
    expect(queryByText('Add to your wishlist')).toBeNull();
  });
});
