import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { Product, DashboardData } from '../../../mocks/types';

const mockUseDashboard = jest.fn();

jest.mock('../../../lib/api', () => ({
  useDashboard: () => mockUseDashboard(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

function makeProduct(overrides: Partial<Product>): Product {
  return {
    id: 'prod-1',
    user_id: 'user-1',
    catalog_product_id: null,
    brand: 'Rare Beauty',
    name: 'Soft Pinch Liquid Blush',
    shade: null,
    category: 'face',
    format: 'full',
    status: 'in_rotation',
    percent_remaining: 50,
    photo_url: null,
    pao_months: 12,
    opened_at: '2026-01-01',
    is_priority: true,
    source_wishlist_item_id: null,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeDashboard(overrides: Partial<DashboardData>): DashboardData {
  return {
    profile: {
      id: 'user-1',
      username: 'maya',
      avatar_url: null,
      age_range: null,
      location: null,
      selected_goals: [],
      current_streak: 3,
      longest_streak: 5,
      last_log_date: '2026-07-22',
      created_at: '2026-01-01T00:00:00.000Z',
    },
    focus_products: [],
    status_counts: { unopened: 0, in_rotation: 0, finished: 0 },
    streak: { current_streak: 3, longest_streak: 5, last_log_date: '2026-07-22' },
    category_counts: { lip: 0, face: 0, eye: 0, skincare: 0, fragrance: 0, hair: 0, other: 0 },
    ready_wishlist_items: [],
    ...overrides,
  };
}

describe('HomeScreen', () => {
  beforeEach(() => {
    mockUseDashboard.mockReset();
  });

  it('never renders more than 5 focus rings even with 6 pinned products', () => {
    const focusProducts = Array.from({ length: 6 }, (_, index) =>
      makeProduct({ id: `prod-${index}`, name: `Product ${index}` }),
    );
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: focusProducts }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getAllByLabelText } = render(<HomeScreen />);

    expect(getAllByLabelText(/% remaining$/)).toHaveLength(5);
  });

  it('shows the streak as display-only with no rewards, badges, or points', () => {
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({}),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByText, queryByText } = render(<HomeScreen />);

    expect(getByText('3-day streak')).toBeTruthy();
    expect(queryByText(/badge|points|reward|unlock/i)).toBeNull();
  });

  it('shows a loading state while the dashboard is pending', () => {
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isPending: true,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    expect(getByLabelText('Loading your Home dashboard')).toBeTruthy();
  });

  it('shows a calm error state and lets someone retry', () => {
    const refetch = jest.fn();
    mockUseDashboard.mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
      refetch,
    });

    const { getByLabelText } = render(<HomeScreen />);

    expect(getByLabelText('Your Home dashboard could not be loaded. Try again.')).toBeTruthy();
  });
});
