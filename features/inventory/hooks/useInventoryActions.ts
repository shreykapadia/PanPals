import {
  useProducts,
  useCreateProduct,
  useLogUsage,
  useTogglePriority,
  useUpdateProduct,
  useDeleteProduct,
  useUsageLogs,
  ProductPatch,
} from '../../../lib/api';
import { Category, Product, ProductStatus } from '../../../mocks/types';

type NewProduct = Omit<Product, 'id' | 'user_id' | 'created_at'>;

export function useInventoryActions(filters?: { status?: ProductStatus; category?: Category }) {
  const productsQuery = useProducts(filters);
  const createMutation = useCreateProduct();
  const logUsageMutation = useLogUsage();
  const togglePriorityMutation = useTogglePriority();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  // No productId — every log the signed-in user owns, for the "recently
  // used" filter. Item detail asks useUsageLogs(productId) directly instead.
  const allUsageLogsQuery = useUsageLogs();

  return {
    items: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    isRefetching: productsQuery.isRefetching,
    refetch: productsQuery.refetch,

    allUsageLogs: allUsageLogsQuery.data ?? [],

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

    updateItem: (args: { productId: string; patch: ProductPatch }) =>
      updateMutation.mutateAsync(args),
    isUpdating: updateMutation.isPending,

    // Cascades to usage_logs and any empties row — see useDeleteProduct's doc
    // comment in lib/api. Confirmation copy must stay honest about that.
    deleteItem: (productId: string) => deleteMutation.mutateAsync({ productId }),
    isDeleting: deleteMutation.isPending,
  };
}
