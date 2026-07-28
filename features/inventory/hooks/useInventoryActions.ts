import { useProducts, useCreateProduct, useLogUsage, useTogglePriority } from '../../../lib/api';
import { Category, Product, ProductStatus } from '../../../mocks/types';

type NewProduct = Omit<Product, 'id' | 'user_id' | 'created_at'>;

export function useInventoryActions(filters?: { status?: ProductStatus; category?: Category }) {
  const productsQuery = useProducts(filters);
  const createMutation = useCreateProduct();
  const logUsageMutation = useLogUsage();
  const togglePriorityMutation = useTogglePriority();

  return {
    items: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    isRefetching: productsQuery.isRefetching,
    refetch: productsQuery.refetch,

    logItem: (item: NewProduct) => createMutation.mutateAsync(item),
    isLogging: createMutation.isPending,

    logUsage: (args: { productId: string; percentAfter: number; note?: string }) =>
      logUsageMutation.mutateAsync(args),
    isLoggingUsage: logUsageMutation.isPending,

    // The 6th pin is rejected at the DB level (enforce_focus_pot_max) — callers
    // should catch and show `detailSheet.errorFocusFull` rather than pre-count locally.
    togglePriority: (args: { productId: string; isPriority: boolean }) =>
      togglePriorityMutation.mutateAsync(args),
    isTogglingPriority: togglePriorityMutation.isPending,
  };
}
