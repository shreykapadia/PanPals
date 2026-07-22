import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Category, ProductStatus } from '../../mocks/types';
import { Database } from '../../types/database';
import { queryKeys } from '../queryKeys';
import { track } from '../analytics';
import { supabase } from '../supabase';

type LogUsageArgs = Database['public']['Functions']['log_usage']['Args'];

export function useProducts(filters?: {
  status?: ProductStatus;
  category?: Category;
  is_priority?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: async (): Promise<Product[]> => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });

      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      if (filters?.is_priority !== undefined) query = query.eq('is_priority', filters.is_priority);

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useSimilarOwned(category: Category, excludeId?: string) {
  return useQuery({
    queryKey: queryKeys.products.similar(category, excludeId),
    queryFn: async (): Promise<{ count: number; products: Product[] }> => {
      const { data, error } = await supabase.rpc('find_similar_owned', {
        category,
        exclude_product_id: excludeId,
      });
      if (error) throw error;
      return data as unknown as { count: number; products: Product[] };
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
      // The generated Args type marks note/photo_url as required plain
      // strings since the SQL signature has no DEFAULT — but Postgres
      // params are always nullable regardless, and the column is nullable
      // too. This cast passes the correct null through at runtime.
      const { data, error } = await supabase.rpc('log_usage', {
        product_id: productId,
        percent: percentAfter,
        note: note ?? null,
        photo_url: photoUrl ?? null,
      } as LogUsageArgs);
      if (error) throw error;

      track('usage_logged', { percent_after: percentAfter }, productId);

      return { product: data as unknown as Product };
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
      // No client-side max-5 check needed — enforce_focus_pot_max (B2)
      // rejects the 6th priority product at the database level.
      const { data, error } = await supabase
        .from('products')
        .update({ is_priority: isPriority })
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;

      track('focus_product_set', { is_priority: isPriority }, productId);

      return data as Product;
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      const { data, error } = await supabase
        .from('products')
        .insert({ ...newProductData, user_id: user.id })
        .select()
        .single();
      if (error) throw error;

      track('inventory_item_added', { category: data.category }, data.id);

      return data as Product;
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not signed in.');

      const { data: wishItem, error: fetchError } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('id', wishlistItemId)
        .single();
      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('wishlist_items')
        .update({ status: 'purchased' })
        .eq('id', wishlistItemId);
      if (updateError) throw updateError;

      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
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
        })
        .select()
        .single();
      if (insertError) throw insertError;

      track('wishlist_item_purchased', { category: newProduct.category }, wishItem.id);

      return newProduct as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
