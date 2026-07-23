import {
  useWishlist,
  useAddWishlistItem,
  useUpdateWishlistItem,
  useRemoveWishlistItem,
} from '../../../lib/api';
import { WishlistItem, WishlistStatus } from '../../../mocks/types';

type NewWishlistItem = Omit<
  WishlistItem,
  'id' | 'user_id' | 'created_at' | 'cooling_off_ends_at' | 'status'
>;

export function useWishlistActions(filters?: { status?: WishlistStatus }) {
  const wishlistQuery = useWishlist(filters);
  const addMutation = useAddWishlistItem();
  const updateMutation = useUpdateWishlistItem();
  const removeMutation = useRemoveWishlistItem();

  return {
    items: wishlistQuery.data ?? [],
    isLoading: wishlistQuery.isLoading,
    isError: wishlistQuery.isError,
    isRefetching: wishlistQuery.isRefetching,
    refetch: wishlistQuery.refetch,

    addItem: (item: NewWishlistItem) => addMutation.mutateAsync(item),
    isAdding: addMutation.isPending,

    editItem: (
      id: string,
      patch: {
        reflectionResponse?: string | null;
        priority?: WishlistItem['priority'];
      },
    ) =>
      updateMutation.mutateAsync({
        id,
        reflectionResponse: patch.reflectionResponse ?? undefined,
        priority: patch.priority,
      }),
    isEditing: updateMutation.isPending,

    removeItem: (id: string) => removeMutation.mutateAsync({ id }),
    isRemoving: removeMutation.isPending,

    // Restoring re-derives cooling vs. ready from cooling_off_ends_at rather
    // than assuming the prior status, since we don't retain history of what
    // status the item had before it was removed.
    restoreItem: (item: WishlistItem) => {
      const stillCooling = new Date(item.cooling_off_ends_at).getTime() > Date.now();
      return updateMutation.mutateAsync({
        id: item.id,
        status: stillCooling ? 'cooling' : 'ready',
      });
    },
  };
}
