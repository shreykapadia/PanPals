import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Category, ProductStatus, UsageLog } from '../../mocks/types';
import { Database } from '../../types/database';
import { queryKeys } from '../queryKeys';
import { track } from '../analytics';
import { supabase } from '../supabase';

type LogUsageArgs = Database['public']['Functions']['log_usage']['Args'];

/**
 * The fields a user may correct directly from item detail. Deliberately
 * excludes:
 * - `id`, `user_id`, `created_at` — never editable.
 * - `is_priority` — use `useTogglePriority()`, which carries the
 *   `focus_product_set` analytics event and the DB max-5 guard.
 * - `catalog_product_id`, `source_wishlist_item_id` — provenance links, set
 *   once at creation.
 * - `status: 'finished'` — see below.
 */
export type ProductPatch = Partial<
  Pick<
    Product,
    | 'brand'
    | 'name'
    | 'shade'
    | 'category'
    | 'format'
    | 'percent_remaining'
    | 'photo_url'
    | 'pao_months'
    | 'opened_at'
  >
> & {
  /**
   * Editable statuses only. `'finished'` is excluded at the type level so
   * finishing by edit is a `tsc` failure — and `npm run verify` runs `tsc`,
   * which is this project's only gate. `empties.repurchase` is `not null`,
   * so a finish genuinely cannot happen as a side effect of an edit: there
   * would be no verdict to write. Finishing goes through `useFinishProduct()`.
   *
   * This narrows what may be *edited*, not what may be displayed — a finished
   * product still reads back with `status: 'finished'` from `useProducts()`.
   */
  status?: Exclude<ProductStatus, 'finished'>;
};

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

/**
 * Records a use: writes a `usage_logs` row, sets `percent_remaining`, and bumps
 * the streak on the day's first log.
 *
 * The RPC rejects a product whose `status` is already `'finished'` — logging a
 * use after the finish left the product reading back above 0% with a log dated
 * after its empties archive row. Callers must handle the error, and shouldn't
 * offer a log-usage control for a finished product in the first place.
 *
 * Correcting a wrong percentage without recording a use is `useUpdateProduct()`.
 */
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

/**
 * A product's usage history, newest first. Omit `productId` to get every log
 * the signed-in user owns (Home's "recent progress" and the weekly checkmark
 * row); pass one for a single item's history on inventory item detail.
 *
 * There is no `user_id` column on `usage_logs` — ownership runs through
 * `products.user_id`, and the `usage_logs_select_own` RLS policy already
 * scopes the read, so no client-side owner filter is needed.
 */
export function useUsageLogs(productId?: string, options?: { limit?: number }) {
  const limit = options?.limit;

  return useQuery({
    queryKey: queryKeys.products.usageLogs(productId, limit),
    queryFn: async (): Promise<UsageLog[]> => {
      let query = supabase.from('usage_logs').select('*').order('logged_at', { ascending: false });

      if (productId) query = query.eq('product_id', productId);
      if (limit !== undefined) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as UsageLog[];
    },
  });
}

/**
 * Applies a partial patch to a product — the edit half of inventory item
 * detail. `percent_remaining` is editable directly here so a user can correct
 * a wrong number without logging a use that never happened; that means no
 * `usage_logs` row is written and no `usage_logged` event fires, which is the
 * intended difference from `useLogUsage()`.
 *
 * Finishing is NOT reachable through this hook — see the guard below.
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, patch }: { productId: string; patch: ProductPatch }) => {
      if (Object.keys(patch).length === 0) {
        throw new Error('useUpdateProduct: patch is empty — nothing to update.');
      }
      // Backstop for callers who cast past ProductPatch's status type. A plain
      // status write would skip finish_product(), so the empties archive row
      // and repurchase verdict would never be created and F6's record of the
      // finish would be lost. Route finishing through the RPC.
      if ((patch.status as ProductStatus | undefined) === 'finished') {
        throw new Error(
          'useUpdateProduct: cannot set status to "finished" — use useFinishProduct() so the empties archive entry and repurchase verdict are written.',
        );
      }
      // Mirrors the products_percent_remaining check constraint, so a bad
      // value fails with a readable message instead of a Postgres error.
      if (patch.percent_remaining !== undefined) {
        const percent = patch.percent_remaining;
        if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
          throw new Error('useUpdateProduct: percent_remaining must be an integer from 0 to 100.');
        }
      }

      const { data, error } = await supabase
        .from('products')
        .update(patch)
        .eq('id', productId)
        .select()
        .single();
      if (error) throw error;

      // No analytics call: the event dictionary in lib/analytics.ts has no
      // product-edited event, and track() throws on unknown names by design.
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}

/**
 * Deletes a product row.
 *
 * **This is destructive beyond the product itself.** Both
 * `usage_logs.product_id` and `empties.product_id` are
 * `on delete cascade` (`supabase/migrations/*_core_schema.sql`), so deleting
 * a product also deletes its entire usage history and — if it was ever
 * finished — its private empties archive entry and repurchase verdict.
 * Delete-confirmation copy must say so rather than promising history
 * survives.
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }: { productId: string }) => {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;

      return { productId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Cascades can remove an empties row, so the archive can go stale too.
      queryClient.invalidateQueries({ queryKey: queryKeys.empties.all });
    },
  });
}

/**
 * Pins or unpins a product to the Focus Pot. Two database triggers can reject a
 * pin, so callers must handle the error rather than assume success:
 * - `enforce_focus_pot_max` — the 6th priority product.
 * - `enforce_focus_pot_not_finished` — a finished product. `get_dashboard`
 *   leaves finished products out of `focus_products`, so a pin that landed here
 *   would read back as priority in inventory yet never show up on Home. Don't
 *   offer a pin control for a product whose `status` is `'finished'`.
 */
export function useTogglePriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isPriority }: { productId: string; isPriority: boolean }) => {
      // No client-side checks needed — both guards run at the database level.
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
