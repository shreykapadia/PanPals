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

  it('shows a warm empty state with CTA when there are no finished products', () => {
    const onAction = jest.fn();
    const { getByText } = render(<EmptiesEmptyState onAction={onAction} />);

    expect(getByText('Your empties will gather here')).toBeTruthy();
    expect(getByText(/private shelf/i)).toBeTruthy();

    fireEvent.press(getByText('View Focus Pot'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders filter chips and filters entries by Holy Grails', () => {
    const noRepurchaseEntry: ArchiveEntry = {
      empty: {
        ...archiveEntry.empty,
        id: 'empty-2',
        repurchase: 'no',
      },
      product: {
        ...archiveEntry.product!,
        id: 'product-2',
        name: 'Matte Foundation',
      },
    };

    const { getByText, queryByText } = render(
      <EmptiesArchive entries={[archiveEntry, noRepurchaseEntry]} />,
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('✦ Holy Grails')).toBeTruthy();
    expect(getByText('Soft Pinch Liquid Blush')).toBeTruthy();
    expect(getByText('Matte Foundation')).toBeTruthy();

    fireEvent.press(getByText('✦ Holy Grails'));

    expect(getByText('Soft Pinch Liquid Blush')).toBeTruthy();
    expect(queryByText('Matte Foundation')).toBeNull();
  });

  it('shows no filter matches message when no entries match selected filter', () => {
    const { getByText } = render(<EmptiesArchive entries={[archiveEntry]} />);

    fireEvent.press(getByText('Hair'));

    expect(getByText('No matching empties')).toBeTruthy();
    expect(
      getByText('Try selecting a different filter to view your finished products.'),
    ).toBeTruthy();
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
