import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddWishlistItemSheet } from '../components/AddWishlistItemSheet';
import { Product } from '../../../mocks/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { mockRpc } from '../../../lib/testUtils/supabaseMock';
import { track } from '../../../lib/analytics';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));
jest.mock('../../../lib/analytics', () => ({ track: jest.fn() }));

const mockTrack = track as jest.Mock;

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 'prod-id',
    user_id: 'user-1',
    catalog_product_id: null,
    brand: 'Brand',
    name: 'Product',
    shade: null,
    category: 'face',
    format: 'full',
    status: 'in_rotation',
    percent_remaining: 50,
    photo_url: null,
    pao_months: 12,
    opened_at: null,
    is_priority: false,
    source_wishlist_item_id: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

function renderSheet() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onSave = jest.fn().mockResolvedValue(undefined);
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <AddWishlistItemSheet
        visible
        onClose={() => {}}
        onSave={onSave}
        isSaving={false}
        existingItems={[]}
      />
    </QueryClientProvider>,
  );
  return { ...utils, onSave };
}

async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function fillUntilBannerShows(utils: ReturnType<typeof renderSheet>) {
  await flushMicrotasks();
  fireEvent.press(utils.getByText('Manual'));
  fireEvent.changeText(utils.getByLabelText('Brand'), 'Rare Beauty');
  fireEvent.changeText(utils.getByLabelText('Product name'), 'Soft Pinch Blush');
  fireEvent.press(utils.getByText('Face'));
  await utils.findByText('Hold on — take a breath.');
}

beforeEach(() => {
  mockTrack.mockClear();
  mockRpc.mockResolvedValue({
    data: {
      count: 3,
      products: [
        makeProduct({ id: 'p1', shade: 'Puff' }),
        makeProduct({ id: 'p2' }),
        makeProduct({ id: 'p3' }),
      ],
    },
    error: null,
  });
});

describe('intercept analytics', () => {
  it('fires duplicate_warning_shown once per category shown — not per render or re-show', async () => {
    const utils = renderSheet();
    // Brand+name complete while the default category ('other') is selected —
    // the mock owns 3 of everything, so the banner shows for 'other' first,
    // then again for 'face'. Two categories shown → two fires.
    await fillUntilBannerShows(utils);

    // A field edit that keeps the banner visible must not re-fire the event.
    fireEvent.changeText(utils.getByLabelText('Shade (optional)'), 'Hope');
    await flushMicrotasks();

    // Nor must switching back to a category that was already warned about.
    fireEvent.press(utils.getByText('Other'));
    await flushMicrotasks();

    const shownCalls = mockTrack.mock.calls.filter(([name]) => name === 'duplicate_warning_shown');
    expect(shownCalls.map(([, props]) => props.category)).toEqual(['other', 'face']);
    expect(shownCalls[1][1]).toEqual(
      expect.objectContaining({ category: 'face', similar_owned_count: 3 }),
    );
  });

  it('fires warning_decision with the chosen action on the cooling-off CTA', async () => {
    const utils = renderSheet();
    await fillUntilBannerShows(utils);

    fireEvent.press(utils.getByLabelText('Add to 14-Day Cooling-Off Wishlist'));

    await waitFor(() =>
      expect(mockTrack).toHaveBeenCalledWith(
        'warning_decision',
        expect.objectContaining({ decision: 'keep_wishlist', category: 'face' }),
      ),
    );
  });

  it('fires warning_decision for dismiss and retailer actions', async () => {
    const utils = renderSheet();
    await fillUntilBannerShows(utils);

    fireEvent.press(utils.getByLabelText('Continue to Retailer'));
    expect(mockTrack).toHaveBeenCalledWith(
      'warning_decision',
      expect.objectContaining({ decision: 'continue_retailer' }),
    );

    fireEvent.press(utils.getByLabelText("I'll use one I already own"));
    expect(mockTrack).toHaveBeenCalledWith(
      'warning_decision',
      expect.objectContaining({ decision: 'use_owned' }),
    );
  });

  it('never sends product names or reflection text in analytics props', async () => {
    const utils = renderSheet();
    await fillUntilBannerShows(utils);
    fireEvent.press(utils.getByLabelText('Add to 14-Day Cooling-Off Wishlist'));
    await flushMicrotasks();

    for (const [, props] of mockTrack.mock.calls) {
      const keys = Object.keys(props ?? {});
      expect(keys).not.toContain('review_text');
      expect(keys).not.toContain('reflection_response');
      expect(keys).not.toContain('name');
      expect(keys).not.toContain('brand');
    }
  });
});
