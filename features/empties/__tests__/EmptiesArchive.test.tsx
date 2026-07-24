import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { EmptyCard } from '../EmptyCard';
import { EmptiesArchive } from '../EmptiesArchive';
import { EmptiesEmptyState } from '../EmptiesEmptyState';
import { EmptiesErrorState } from '../EmptiesErrorState';
import { EmptiesLoadingState } from '../EmptiesLoadingState';
import { ArchiveEntry } from '../useEmptiesArchive';

const archiveEntry: ArchiveEntry = {
  empty: {
    id: 'empty-1',
    user_id: 'user-1',
    product_id: 'product-1',
    review_text: 'A lovely everyday blush.',
    repurchase: 'yes',
    months_in_use: 4,
    photo_url: null,
    created_at: '2026-07-22T00:00:00.000Z',
  },
  product: {
    id: 'product-1',
    user_id: 'user-1',
    catalog_product_id: null,
    brand: 'Rare Beauty',
    name: 'Soft Pinch Liquid Blush',
    shade: 'Happy',
    category: 'face',
    format: 'full',
    status: 'finished',
    percent_remaining: 0,
    photo_url: null,
    pao_months: 12,
    opened_at: '2026-03-22',
    is_priority: false,
    source_wishlist_item_id: null,
    created_at: '2026-03-22T00:00:00.000Z',
  },
};

describe('private empties archive', () => {
  it('renders one card for every finished product without feed controls', () => {
    const { getByText, queryByText } = render(<EmptiesArchive entries={[archiveEntry]} />);

    expect(getByText('Your Empties')).toBeTruthy();
    expect(getByText('Rare Beauty')).toBeTruthy();
    expect(getByText('Soft Pinch Liquid Blush')).toBeTruthy();
    expect(queryByText(/like/i)).toBeNull();
    expect(queryByText(/community/i)).toBeNull();
    expect(queryByText(/posted by/i)).toBeNull();
  });

  it('shows the months-in-use chip and text repurchase verdict', () => {
    const { getByText } = render(
      <EmptyCard empty={archiveEntry.empty} product={archiveEntry.product} />,
    );

    expect(getByText('4 MONTHS IN USE')).toBeTruthy();
    expect(getByText('REPURCHASE: YES')).toBeTruthy();
  });

  it('shows a warm empty state when there are no finished products', () => {
    const { getByText } = render(<EmptiesEmptyState />);

    expect(getByText('Your empties will gather here')).toBeTruthy();
    expect(getByText(/private shelf/i)).toBeTruthy();
  });

  it('shows an accessible loading state while private progress is loading', () => {
    const { getByLabelText, getByText } = render(<EmptiesLoadingState />);

    expect(getByLabelText('Loading your private empties archive')).toBeTruthy();
    expect(getByText('Loading your progress')).toBeTruthy();
  });

  it('shows a calm error state and lets someone retry', () => {
    const onRetry = jest.fn();
    const { getByLabelText, getByText } = render(<EmptiesErrorState onRetry={onRetry} />);

    expect(getByLabelText('Your progress could not be loaded. Try again.')).toBeTruthy();
    expect(getByText('Your progress needs another moment')).toBeTruthy();

    fireEvent.press(getByLabelText('Try Again'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
