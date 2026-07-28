import { useTogglePriority } from '../../lib/api';

export function useFocusPot() {
  const togglePriority = useTogglePriority();

  return {
    pin: (productId: string) => togglePriority.mutate({ productId, isPriority: true }),
    unpin: (productId: string) => togglePriority.mutate({ productId, isPriority: false }),
    isPending: togglePriority.isPending,
  };
}
