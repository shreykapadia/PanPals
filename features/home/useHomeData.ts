import { useDashboard } from '../../lib/api';

export const MAX_FOCUS_PRODUCTS = 5;

export function useHomeData() {
  const dashboardQuery = useDashboard();
  const dashboard = dashboardQuery.data;

  return {
    focusProducts: (dashboard?.focus_products ?? []).slice(0, MAX_FOCUS_PRODUCTS),
    statusCounts: dashboard?.status_counts,
    streak: dashboard?.streak,
    readyWishlistItem: dashboard?.ready_wishlist_items[0],
    // No usage-history hook exists yet in lib/api (see CROSS-LANE REQUEST),
    // so recent activity is empty until one is added.
    recentActivity: [] as never[],
    isLoading: dashboardQuery.isPending,
    isError: dashboardQuery.isError,
    refetch: dashboardQuery.refetch,
  };
}
