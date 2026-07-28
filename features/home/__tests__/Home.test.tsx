import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../HomeScreen';
import { Product, DashboardData } from '../../../mocks/types';

const mockUseDashboard = jest.fn();
const mockUseProducts = jest.fn();
const mockTogglePriorityMutate = jest.fn();
const mockLogUsageMutate = jest.fn();
const mockLogUsageReset = jest.fn();

jest.mock('../../../lib/api', () => ({
  useDashboard: () => mockUseDashboard(),
  useProducts: () => mockUseProducts(),
  useTogglePriority: () => ({ mutate: mockTogglePriorityMutate, isPending: false }),
  useLogUsage: () => ({
    mutate: mockLogUsageMutate,
    reset: mockLogUsageReset,
    isPending: false,
  }),
}));

const mockRouterPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
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
    mockUseProducts.mockReset().mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockTogglePriorityMutate.mockReset();
    mockLogUsageMutate.mockReset();
    mockLogUsageReset.mockReset();
    mockRouterPush.mockReset();
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

  it('blocks pinning a 6th product and shows a calm full-Focus-Pot message', () => {
    const focusProducts = Array.from({ length: 5 }, (_, index) =>
      makeProduct({ id: `focus-${index}`, is_priority: true }),
    );
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: focusProducts }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseProducts.mockReturnValue({
      data: [
        ...focusProducts,
        makeProduct({ id: 'unpinned-1', is_priority: false, name: 'Extra Product' }),
      ],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByText, queryByLabelText } = render(<HomeScreen />);

    expect(getByText('Your Focus Pot holds 5 — unpin one to add another')).toBeTruthy();
    expect(queryByLabelText(/^Pin /)).toBeNull();
  });

  it('points to Log Item when the account has no products at all yet', () => {
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseProducts.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('Log your first product to start building your Focus Pot.')).toBeTruthy();
  });

  it('says everything is already pinned when products exist but none are unpinned', () => {
    const focusProduct = makeProduct({ id: 'focus-1', is_priority: true });
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [focusProduct] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseProducts.mockReturnValue({
      data: [focusProduct],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByText } = render(<HomeScreen />);

    expect(getByText('Everything in rotation is already pinned.')).toBeTruthy();
  });

  it('pins an unpinned product through the shared Focus Pot hook when there is room', () => {
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });
    mockUseProducts.mockReturnValue({
      data: [makeProduct({ id: 'unpinned-1', is_priority: false, name: 'Extra Product' })],
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Pin Rare Beauty Extra Product to your Focus Pot'));

    expect(mockTogglePriorityMutate).toHaveBeenCalledWith({
      productId: 'unpinned-1',
      isPriority: true,
    });
  });

  it('unpins a focus product through the shared Focus Pot hook', () => {
    const focusProduct = makeProduct({ id: 'focus-1', is_priority: true });
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [focusProduct] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(
      getByLabelText('Unpin Rare Beauty Soft Pinch Liquid Blush from your Focus Pot'),
    );

    expect(mockTogglePriorityMutate).toHaveBeenCalledWith({
      productId: 'focus-1',
      isPriority: false,
    });
  });

  it('logs a usage through the shared log_usage hook when a ring update is confirmed', async () => {
    const focusProduct = makeProduct({ id: 'focus-1', percent_remaining: 25 });
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [focusProduct] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Log a use for Rare Beauty Soft Pinch Liquid Blush'));
    fireEvent.press(getByLabelText('Save 25% remaining'));

    await waitFor(() =>
      expect(mockLogUsageMutate).toHaveBeenCalledWith(
        { productId: 'focus-1', percentAfter: 25 },
        expect.anything(),
      ),
    );
  });

  it('navigates to Inventory when the empty Focus Pot state points to Log Item', () => {
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Log Item'));

    expect(mockRouterPush).toHaveBeenCalledWith('/(tabs)/inventory');
  });

  it('shows a profile button that navigates to /you', () => {
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText } = render(<HomeScreen />);

    fireEvent.press(getByLabelText('Your profile and settings'));

    expect(mockRouterPush).toHaveBeenCalledWith('/you');
  });

  it('renders exactly two quick-action pills, neither a log/add action', () => {
    const focusProduct = makeProduct({ id: 'focus-1', is_priority: true });
    mockUseDashboard.mockReturnValue({
      data: makeDashboard({ focus_products: [focusProduct] }),
      isPending: false,
      isError: false,
      refetch: jest.fn(),
    });

    const { getByLabelText, queryByLabelText, queryByText } = render(<HomeScreen />);

    expect(getByLabelText('Scan a product (coming soon)')).toBeTruthy();
    expect(getByLabelText('Search your products (coming soon)')).toBeTruthy();
    expect(queryByLabelText('Log a new item')).toBeNull();
    expect(queryByText('Log Item')).toBeNull();
  });
});
