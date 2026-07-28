import { useDashboard, useProducts } from '../../lib/api';

export const MAX_FOCUS_PRODUCTS = 5;

export function useHomeData() {
  const dashboardQuery = useDashboard();
  const productsQuery = useProducts();
  const dashboard = dashboardQuery.data;

  const focusProducts = (dashboard?.focus_products ?? []).slice(0, MAX_FOCUS_PRODUCTS);
  const activeProducts = (productsQuery.data ?? []).filter(
    (product) => product.status !== 'finished',
  );
  const unpinnedProducts = activeProducts.filter((product) => !product.is_priority);

  return {
    focusProducts,
    isFocusFull: focusProducts.length >= MAX_FOCUS_PRODUCTS,
    unpinnedProducts,
    hasAnyActiveProducts: activeProducts.length > 0,
    profile: dashboard?.profile,
    statusCounts: dashboard?.status_counts,
    streak: dashboard?.streak,
    readyWishlistItem: dashboard?.ready_wishlist_items[0],
    // No usage-history hook exists yet in lib/api (see CROSS-LANE REQUEST),
    // so recent activity is empty until one is added.
    recentActivity: [] as never[],
    isLoading: dashboardQuery.isPending || productsQuery.isPending,
    isError: dashboardQuery.isError || productsQuery.isError,
    refetch: () => {
      void dashboardQuery.refetch();
      void productsQuery.refetch();
    },
  };
}
