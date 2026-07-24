import { useMemo } from 'react';
import { useDashboard, useEmpties, useProducts } from '../../lib/api';
import { Empty, Product } from '../../mocks/types';

export interface ArchiveEntry {
  empty: Empty;
  product: Product | undefined;
}

export function useEmptiesArchive() {
  const emptiesQuery = useEmpties();
  const productsQuery = useProducts({ status: 'finished' });
  const dashboardQuery = useDashboard();

  const entries = useMemo<ArchiveEntry[]>(() => {
    const productsById = new Map(
      (productsQuery.data ?? []).map((product) => [product.id, product]),
    );

    return (emptiesQuery.data ?? []).map((empty) => ({
      empty,
      product: productsById.get(empty.product_id),
    }));
  }, [emptiesQuery.data, productsQuery.data]);

  const refetch = async () => {
    await Promise.all([emptiesQuery.refetch(), productsQuery.refetch(), dashboardQuery.refetch()]);
  };

  return {
    entries,
    dashboard: dashboardQuery.data,
    isLoading: emptiesQuery.isPending || productsQuery.isPending || dashboardQuery.isPending,
    isError: emptiesQuery.isError || productsQuery.isError || dashboardQuery.isError,
    refetch,
  };
}
