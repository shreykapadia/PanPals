import { useDashboard, useProducts, useUsageLogs } from '../../lib/api';
import { Product, UsageLog } from '../../mocks/types';

export const MAX_FOCUS_PRODUCTS = 5;
const RECENT_ACTIVITY_LIMIT = 5;

export interface RecentActivityEntry {
  log: UsageLog;
  product: Product;
}

export function useHomeData() {
  const dashboardQuery = useDashboard();
  const productsQuery = useProducts();
  const usageLogsQuery = useUsageLogs();
  const dashboard = dashboardQuery.data;

  const focusProducts = (dashboard?.focus_products ?? []).slice(0, MAX_FOCUS_PRODUCTS);
  const activeProducts = (productsQuery.data ?? []).filter(
    (product) => product.status !== 'finished',
  );
  const unpinnedProducts = activeProducts.filter((product) => !product.is_priority);

  const usageLogs = usageLogsQuery.data ?? [];
  const productsById = new Map((productsQuery.data ?? []).map((product) => [product.id, product]));
  const recentActivity: RecentActivityEntry[] = usageLogs
    .map((log) => ({ log, product: productsById.get(log.product_id) }))
    .filter((entry): entry is RecentActivityEntry => entry.product !== undefined)
    .slice(0, RECENT_ACTIVITY_LIMIT);
  const loggedDates = new Set(usageLogs.map((log) => log.logged_at.slice(0, 10)));

  return {
    focusProducts,
    isFocusFull: focusProducts.length >= MAX_FOCUS_PRODUCTS,
    unpinnedProducts,
    hasAnyActiveProducts: activeProducts.length > 0,
    profile: dashboard?.profile,
    statusCounts: dashboard?.status_counts,
    streak: dashboard?.streak,
    readyWishlistItem: dashboard?.ready_wishlist_items[0],
    recentActivity,
    loggedDates,
    isLoading: dashboardQuery.isPending || productsQuery.isPending || usageLogsQuery.isPending,
    isError: dashboardQuery.isError || productsQuery.isError || usageLogsQuery.isError,
    refetch: () => {
      void dashboardQuery.refetch();
      void productsQuery.refetch();
      void usageLogsQuery.refetch();
    },
  };
}
