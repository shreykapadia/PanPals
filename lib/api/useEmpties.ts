import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Empty, RepurchaseVerdict } from '../../mocks/types';
import { Database } from '../../types/database';
import { queryKeys } from '../queryKeys';
import { track } from '../analytics';
import { supabase } from '../supabase';

type FinishProductArgs = Database['public']['Functions']['finish_product']['Args'];

export function useEmpties() {
  return useQuery({
    queryKey: queryKeys.empties.all,
    queryFn: async (): Promise<Empty[]> => {
      const { data, error } = await supabase
        .from('empties')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Empty[];
    },
  });
}

export function useFinishProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      reviewText,
      repurchase,
      photoUrl,
    }: {
      productId: string;
      reviewText?: string;
      repurchase: RepurchaseVerdict;
      photoUrl?: string;
    }) => {
      // See useProducts.ts's log_usage cast: the generated Args type marks
      // review/photo_url as required plain strings since the SQL signature
      // has no DEFAULT, but Postgres params are always nullable and the
      // columns are nullable too. This cast passes the correct null through.
      const { data, error } = await supabase.rpc('finish_product', {
        product_id: productId,
        review: reviewText ?? null,
        repurchase,
        photo_url: photoUrl ?? null,
      } as FinishProductArgs);
      if (error) throw error;

      track('product_finished', { repurchase }, productId);

      return data as unknown as Empty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.empties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
