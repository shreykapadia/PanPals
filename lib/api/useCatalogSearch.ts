import { useQuery } from '@tanstack/react-query';
import { CatalogProduct, Category } from '../../mocks/types';
import { queryKeys } from '../queryKeys';
import { supabase } from '../supabase';

export function useCatalogSearch(query: string, category?: Category, limit = 10) {
  const trimmedQuery = query.trim().toLowerCase();

  return useQuery({
    queryKey: queryKeys.catalog.search(trimmedQuery, category),
    queryFn: async (): Promise<CatalogProduct[]> => {
      const { data, error } = await supabase.rpc('search_catalog', {
        q: trimmedQuery,
        category,
        limit,
      });
      if (error) throw error;
      return data as CatalogProduct[];
    },
    enabled: trimmedQuery.length > 0,
  });
}
