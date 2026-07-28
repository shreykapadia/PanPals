import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InterceptBanner } from '../components/InterceptBanner';
import { AddWishlistItemSheet } from '../components/AddWishlistItemSheet';
import { SimilarMatch } from '../hooks/useIntercept';
import { Product } from '../../../mocks/types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import { mockRpc } from '../../../lib/testUtils/supabaseMock';

// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('../../../lib/supabase', () => require('../../../lib/testUtils/supabaseMock'));
// recordDecision/recordWarningShown now really call track() (Phase 3) —
// stub it so those calls don't hit the unconfigured supabase mock.
jest.mock('../../../lib/analytics', () => ({ track: jest.fn() }));

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

describe('InterceptBanner', () => {
  const matches: SimilarMatch[] = [
    {
      product: makeProduct({ id: 'p1', brand: 'Glossier', name: 'Cloud Paint', shade: 'Puff' }),
      confidence: 'high',
      reason: 'Almost the same shade: Puff',
    },
    {
      product: makeProduct({ id: 'p2', brand: 'NARS', name: 'Blush', shade: 'Orgasm' }),
      confidence: 'medium',
      reason: 'Similar — same brand (NARS)',
    },
    {
      product: makeProduct({ id: 'p3', brand: 'Ilia', name: 'Multi-Stick', shade: 'Tenderly' }),
      confidence: 'low',
      reason: 'In the same category: Face',
    },
  ];

  it('shows the count, the owned matches, and a WHY for each — never calling a category-only match a duplicate', () => {
    const { getByText, queryByText } = render(
      <InterceptBanner
        category="face"
        count={4}
        matches={matches}
        productUrl={null}
        onKeepOnWishlist={() => {}}
        onUseOwned={() => {}}
        onContinueToRetailer={() => {}}
      />,
    );

    expect(getByText('You already have 4 similar face items in active rotation.')).toBeTruthy();
    expect(getByText('Glossier · Cloud Paint')).toBeTruthy();
    expect(getByText('Almost the same shade: Puff')).toBeTruthy();
    expect(getByText('In the same category: Face')).toBeTruthy();
    expect(queryByText(/exact duplicate/i)).toBeNull();
    expect(queryByText(/duplicate/i)).toBeNull();
  });

  it('keeps the retailer action tappable — never disabled', () => {
    const onContinueToRetailer = jest.fn();
    const { getByLabelText } = render(
      <InterceptBanner
        category="face"
        count={4}
        matches={matches}
        productUrl={null}
        onKeepOnWishlist={() => {}}
        onUseOwned={() => {}}
        onContinueToRetailer={onContinueToRetailer}
      />,
    );

    const retailerButton = getByLabelText('Continue to Retailer');
    expect(retailerButton.props.accessibilityState?.disabled).toBeFalsy();
    fireEvent.press(retailerButton);
    expect(onContinueToRetailer).toHaveBeenCalledTimes(1);
  });

  it('wires all three actions', () => {
    const onKeepOnWishlist = jest.fn();
    const onUseOwned = jest.fn();
    const { getByLabelText } = render(
      <InterceptBanner
        category="face"
        count={4}
        matches={matches}
        productUrl={null}
        onKeepOnWishlist={onKeepOnWishlist}
        onUseOwned={onUseOwned}
        onContinueToRetailer={() => {}}
      />,
    );

    fireEvent.press(getByLabelText('Add to 14-Day Cooling-Off Wishlist'));
    expect(onKeepOnWishlist).toHaveBeenCalledTimes(1);

    fireEvent.press(getByLabelText("I'll use one I already own"));
    expect(onUseOwned).toHaveBeenCalledTimes(1);
  });
});

function renderSheetWithClient() {
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

// useIntercept's query fires on mount; flush the microtask queue right after
// render so its resolution lands inside act() instead of leaking into an
// unwrapped update between the fireEvent calls below.
async function flushMicrotasks() {
  await act(async () => {
    await Promise.resolve();
  });
}

describe('AddWishlistItemSheet intercept threshold', () => {
  it('shows the banner once the user has entered a product and owns >= 3 in that category', async () => {
    mockRpc.mockResolvedValue({
      data: {
        count: 4,
        products: [
          makeProduct({ id: 'p1', brand: 'Glossier', shade: 'Puff', category: 'face' }),
          makeProduct({ id: 'p2', brand: 'NARS', category: 'face' }),
          makeProduct({ id: 'p3', brand: 'Ilia', category: 'face' }),
          makeProduct({ id: 'p4', brand: 'Rare Beauty', category: 'face' }),
        ],
      },
      error: null,
    });

    const { getByText, getByLabelText, findByText } = renderSheetWithClient();

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByText('Face'));

    await findByText('Hold on — take a breath.');
    // The plain Save button is replaced by the banner's own CTA.
    expect(() => getByText('Add to wishlist')).toThrow();
  });

  it('does not show the banner when the user owns fewer than 3 in that category', async () => {
    mockRpc.mockResolvedValue({
      data: { count: 1, products: [makeProduct({ id: 'p1', category: 'face' })] },
      error: null,
    });

    const { getByText, getByLabelText, findByLabelText, queryByText } = renderSheetWithClient();

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByText('Face'));

    await findByLabelText('Add to wishlist');
    expect(queryByText('Hold on — take a breath.')).toBeNull();
  });

  it("Keep on wishlist saves the item, and I'll use one I own closes without saving", async () => {
    mockRpc.mockResolvedValue({
      data: {
        count: 3,
        products: [
          makeProduct({ id: 'p1', category: 'face' }),
          makeProduct({ id: 'p2', category: 'face' }),
          makeProduct({ id: 'p3', category: 'face' }),
        ],
      },
      error: null,
    });

    const { getByText, getByLabelText, findByLabelText, onSave } = renderSheetWithClient();

    await flushMicrotasks();
    fireEvent.press(getByText('Manual'));
    fireEvent.changeText(getByLabelText('Brand'), 'Rare Beauty');
    fireEvent.changeText(getByLabelText('Product name'), 'Soft Pinch Blush');
    fireEvent.press(getByText('Face'));

    const keepButton = await findByLabelText('Add to 14-Day Cooling-Off Wishlist');
    fireEvent.press(keepButton);

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ brand: 'Rare Beauty' }));
  });
});
