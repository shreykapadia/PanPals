/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery } from '@tanstack/react-query';
import { CatalogProduct, Category } from '../../mocks/types';
import { mockCatalogProducts } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';

export function useCatalogSearch(query: string, category?: Category, limit = 10) {
  const trimmedQuery = query.trim().toLowerCase();

  return useQuery({
    queryKey: queryKeys.catalog.search(trimmedQuery, category),
    queryFn: async (): Promise<CatalogProduct[]> => {
      if (!trimmedQuery) return [];

      let results = mockCatalogProducts.filter(
        (c) =>
          c.active_flag &&
          (c.brand.toLowerCase().includes(trimmedQuery) ||
            c.name.toLowerCase().includes(trimmedQuery)),
      );

      if (category) {
        results = results.filter((c) => c.category === category);
      }

      return results.slice(0, limit);
    },
    enabled: trimmedQuery.length > 0,
  });
}
