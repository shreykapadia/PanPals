import React from 'react';
import { render } from '@testing-library/react-native';
import { RecentProgress } from '../RecentProgress';
import { Product, UsageLog } from '../../../mocks/types';

const product: Product = {
  id: 'prod-1',
  user_id: 'user-1',
  catalog_product_id: null,
  brand: 'Rare Beauty',
  name: 'Soft Pinch Liquid Blush',
  shade: null,
  category: 'face',
  format: 'full',
  status: 'in_rotation',
  percent_remaining: 45,
  photo_url: null,
  pao_months: 12,
  opened_at: '2026-01-01',
  is_priority: true,
  source_wishlist_item_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
};

function makeLog(overrides: Partial<UsageLog>): UsageLog {
  return {
    id: 'log-1',
    product_id: 'prod-1',
    percent_after: 45,
    note: null,
    photo_url: null,
    logged_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('RecentProgress', () => {
  it('shows the calm empty state when there are no entries', () => {
    const { getByText } = render(<RecentProgress entries={[]} />);

    expect(getByText('No updates yet')).toBeTruthy();
    expect(getByText('Tap a ring in Today’s Focus to log your first use.')).toBeTruthy();
  });

  it('lists a real usage log with the product name, percent, and accessible label', () => {
    const log = makeLog({});
    const { getByText, getByLabelText } = render(<RecentProgress entries={[{ log, product }]} />);

    expect(getByText('Rare Beauty Soft Pinch Liquid Blush')).toBeTruthy();
    expect(getByText('45%')).toBeTruthy();
    expect(getByText('Today')).toBeTruthy();
    expect(
      getByLabelText('Rare Beauty Soft Pinch Liquid Blush: 45% remaining, logged Today'),
    ).toBeTruthy();
  });

  it('renders multiple entries in the given order', () => {
    const logs = [
      makeLog({ id: 'log-1', percent_after: 45 }),
      makeLog({ id: 'log-2', percent_after: 40 }),
    ];
    const { getAllByText } = render(
      <RecentProgress entries={logs.map((log) => ({ log, product }))} />,
    );

    expect(getAllByText('Rare Beauty Soft Pinch Liquid Blush')).toHaveLength(2);
  });
});
