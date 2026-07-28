import { useState } from 'react';
import { Category, Product, ProductStatus, UsageLog } from '../../../mocks/types';

export interface InventoryFilterState {
  status?: ProductStatus;
  category?: Category;
  search: string;
  recentlyUsedOnly: boolean;
}

/** "Recently used" window (F9 filter) — a use logged in the last 7 days. */
export const RECENTLY_USED_WINDOW_DAYS = 7;

export function matchesSearch(item: Product, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.brand.toLowerCase().includes(q) ||
    item.name.toLowerCase().includes(q) ||
    (item.shade ?? '').toLowerCase().includes(q)
  );
}

/**
 * Product ids with at least one usage_log within the last `windowDays`.
 * Pass the signed-in user's full log list (`useUsageLogs()` with no
 * productId) — one pass over it derives the whole "recently used" set.
 */
export function recentlyUsedProductIds(
  logs: UsageLog[],
  windowDays: number = RECENTLY_USED_WINDOW_DAYS,
  now: Date = new Date(),
): Set<string> {
  const cutoff = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const ids = new Set<string>();
  for (const log of logs) {
    if (new Date(log.logged_at).getTime() >= cutoff) {
      ids.add(log.product_id);
    }
  }
  return ids;
}

/**
 * Applies every inventory filter to a product list. `status`/`category` are
 * included here (even though the screen also passes them server-side via
 * `useProducts(filters)`) so this function is a single, pure source of truth
 * that's fully unit-testable without a query client or a rendered screen.
 */
export function filterInventory(
  items: Product[],
  state: InventoryFilterState,
  recentIds: ReadonlySet<string>,
): Product[] {
  return items.filter((item) => {
    if (state.status && item.status !== state.status) return false;
    if (state.category && item.category !== state.category) return false;
    if (!matchesSearch(item, state.search)) return false;
    if (state.recentlyUsedOnly && !recentIds.has(item.id)) return false;
    return true;
  });
}

export function useInventoryFilters() {
  const [status, setStatus] = useState<ProductStatus | undefined>(undefined);
  const [category, setCategory] = useState<Category | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [recentlyUsedOnly, setRecentlyUsedOnly] = useState(false);

  return {
    status,
    setStatus,
    category,
    setCategory,
    search,
    setSearch,
    recentlyUsedOnly,
    setRecentlyUsedOnly,
  };
}
