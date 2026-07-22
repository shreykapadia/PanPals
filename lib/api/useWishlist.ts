/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WishlistItem, WishlistStatus } from '../../mocks/types';
import { mockWishlistItems } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';
import { track } from './track';

let wishlistStore: WishlistItem[] = [...mockWishlistItems];

export function useWishlist(filters?: { status?: WishlistStatus }) {
  return useQuery({
    queryKey: queryKeys.wishlist.list(filters),
    queryFn: async () => {
      const now = new Date();

      // Refresh cooling off ready states
      wishlistStore = wishlistStore.map((item) => {
        if (item.status === 'cooling' && new Date(item.cooling_off_ends_at) <= now) {
          return { ...item, status: 'ready' as const };
        }
        return item;
      });

      let result = [...wishlistStore];
      if (filters?.status) {
        result = result.filter((w) => w.status === filters.status);
      }

      return result;
    },
  });
}

export function useAddWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newItemData: Omit<
        WishlistItem,
        'id' | 'user_id' | 'created_at' | 'cooling_off_ends_at' | 'status'
      >,
    ) => {
      const now = new Date();
      const fourteenDaysLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

      const newItem: WishlistItem = {
        ...newItemData,
        id: `wish-${Date.now()}`,
        user_id: 'mock-user-123',
        status: 'cooling',
        cooling_off_ends_at: fourteenDaysLater.toISOString(),
        created_at: now.toISOString(),
      };

      wishlistStore.unshift(newItem);
      track('wishlist_item_added', { category: newItem.category }, newItem.id);

      return newItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useUpdateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reflectionResponse,
      status,
      priority,
    }: {
      id: string;
      reflectionResponse?: string;
      status?: WishlistStatus;
      priority?: 'high' | 'medium' | 'low';
    }) => {
      const itemIndex = wishlistStore.findIndex((w) => w.id === id);
      if (itemIndex === -1) throw new Error('Wishlist item not found');

      const updated = {
        ...wishlistStore[itemIndex],
        ...(reflectionResponse !== undefined && { reflection_response: reflectionResponse }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        last_reviewed_at: new Date().toISOString(),
      };

      wishlistStore[itemIndex] = updated;

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

export function useRemoveWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const itemIndex = wishlistStore.findIndex((w) => w.id === id);
      if (itemIndex === -1) throw new Error('Wishlist item not found');

      wishlistStore[itemIndex] = {
        ...wishlistStore[itemIndex],
        status: 'removed',
      };

      track('wishlist_item_removed', {}, id);

      return wishlistStore[itemIndex];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
