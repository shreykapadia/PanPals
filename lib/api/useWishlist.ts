import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WishlistItem, WishlistStatus, WishlistPriority } from '../../mocks/types';
import { Database } from '../../types/database';
import { queryKeys } from '../queryKeys';
import { track } from '../analytics';
import { supabase } from '../supabase';

type WishlistItemUpdate = Database['public']['Tables']['wishlist_items']['Update'];

export function useWishlist(filters?: { status?: WishlistStatus }) {
  return useQuery({
    queryKey: queryKeys.wishlist.list(filters),
    queryFn: async (): Promise<WishlistItem[]> => {
      let query = supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WishlistItem[];
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      // cooling_off_ends_at relies on the DB default (now() + 14 days) —
      // never set it from the client.
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert({ ...newItemData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;

      track('wishlist_item_added', { category: data.category }, data.id);

      return data as WishlistItem;
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
      priority?: WishlistPriority;
    }) => {
      const updates: WishlistItemUpdate = { last_reviewed_at: new Date().toISOString() };
      if (reflectionResponse !== undefined) updates.reflection_response = reflectionResponse;
      if (status !== undefined) updates.status = status;
      if (priority !== undefined) updates.priority = priority;

      const { data, error } = await supabase
        .from('wishlist_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as WishlistItem;
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
      const { data, error } = await supabase
        .from('wishlist_items')
        .update({ status: 'removed' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;

      track('wishlist_item_removed', {}, id);

      return data as WishlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
