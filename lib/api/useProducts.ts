/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Category, UsageLog } from '../../mocks/types';
import { mockProducts, mockUsageLogs, mockWishlistItems, mockProfile } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';
import { track } from './track';

// In-memory store for dev mock session
let productsStore: Product[] = [...mockProducts];
let usageLogsStore: UsageLog[] = [...mockUsageLogs];

export function useProducts(filters?: {
  status?: string;
  category?: Category;
  is_priority?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async () => {
      let result = [...productsStore];

      if (filters?.status) {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters?.category) {
        result = result.filter((p) => p.category === filters.category);
      }
      if (filters?.is_priority !== undefined) {
        result = result.filter((p) => p.is_priority === filters.is_priority);
      }

      return result;
    },
  });
}

export function useSimilarOwned(category: Category, excludeId?: string) {
  return useQuery({
    queryKey: queryKeys.products.similar(category, excludeId),
    queryFn: async () => {
      const activeOwned = productsStore.filter(
        (p) => p.category === category && p.status !== 'finished' && p.id !== excludeId,
      );

      return {
        count: activeOwned.length,
        products: activeOwned,
      };
    },
  });
}

export function useLogUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      percentAfter,
      note,
      photoUrl,
    }: {
      productId: string;
      percentAfter: number;
      note?: string;
      photoUrl?: string;
    }) => {
      const productIndex = productsStore.findIndex((p) => p.id === productId);
      if (productIndex === -1) throw new Error('Product not found');

      const updatedProduct = {
        ...productsStore[productIndex],
        percent_remaining: percentAfter,
        status: percentAfter === 0 ? ('finished' as const) : productsStore[productIndex].status,
      };

      productsStore[productIndex] = updatedProduct;

      const newLog: UsageLog = {
        id: `log-${Date.now()}`,
        product_id: productId,
        percent_after: percentAfter,
        note: note || null,
        photo_url: photoUrl || null,
        logged_at: new Date().toISOString(),
      };

      usageLogsStore.push(newLog);

      // Check streak bump logic
      const todayStr = new Date().toISOString().substring(0, 10);
      if (mockProfile.last_log_date !== todayStr) {
        mockProfile.current_streak += 1;
        if (mockProfile.current_streak > mockProfile.longest_streak) {
          mockProfile.longest_streak = mockProfile.current_streak;
        }
        mockProfile.last_log_date = todayStr;
      }

      track('usage_logged', { percent_after: percentAfter }, productId);

      return { product: updatedProduct, log: newLog };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useTogglePriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isPriority }: { productId: string; isPriority: boolean }) => {
      const currentPriorityCount = productsStore.filter((p) => p.is_priority).length;

      if (isPriority && currentPriorityCount >= 5) {
        throw new Error('Focus Pot cap reached: Maximum 5 priority products allowed.');
      }

      const productIndex = productsStore.findIndex((p) => p.id === productId);
      if (productIndex === -1) throw new Error('Product not found');

      productsStore[productIndex] = {
        ...productsStore[productIndex],
        is_priority: isPriority,
      };

      track('focus_product_set', { is_priority: isPriority }, productId);

      return productsStore[productIndex];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProductData: Omit<Product, 'id' | 'user_id' | 'created_at'>) => {
      const newProduct: Product = {
        ...newProductData,
        id: `prod-${Date.now()}`,
        user_id: 'mock-user-123',
        created_at: new Date().toISOString(),
      };

      productsStore.unshift(newProduct);
      track('inventory_item_added', { category: newProduct.category }, newProduct.id);

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useCreateFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ wishlistItemId }: { wishlistItemId: string }) => {
      const wishItem = mockWishlistItems.find((w) => w.id === wishlistItemId);
      if (!wishItem) throw new Error('Wishlist item not found');

      // Update wishlist status
      wishItem.status = 'purchased';

      // Create new inventory product
      const newProduct: Product = {
        id: `prod-from-wish-${Date.now()}`,
        user_id: 'mock-user-123',
        catalog_product_id: wishItem.catalog_product_id,
        brand: wishItem.brand,
        name: wishItem.name,
        shade: wishItem.shade,
        category: wishItem.category,
        format: 'full',
        status: 'in_rotation',
        percent_remaining: 100,
        photo_url: wishItem.photo_url,
        pao_months: 12,
        opened_at: new Date().toISOString().substring(0, 10),
        is_priority: false,
        source_wishlist_item_id: wishItem.id,
        created_at: new Date().toISOString(),
      };

      productsStore.unshift(newProduct);
      track('wishlist_item_purchased', { category: newProduct.category }, wishItem.id);

      return newProduct;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
