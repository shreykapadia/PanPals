/**
 * MOCK-FIRST: returns fixtures until types/database.ts lands (AI-CONTEXT §2).
 * Swap internals only; keep this signature stable so feature screens never change.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Empty, RepurchaseVerdict } from '../../mocks/types';
import { mockEmpties, mockProducts } from '../../mocks/fixtures';
import { queryKeys } from '../queryKeys';
import { track } from '../analytics';

let emptiesStore: Empty[] = [...mockEmpties];

export function useEmpties() {
  return useQuery({
    queryKey: queryKeys.empties.all,
    queryFn: async () => {
      return [...emptiesStore];
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
      const productIndex = mockProducts.findIndex((p) => p.id === productId);
      if (productIndex === -1) throw new Error('Product not found');

      const product = mockProducts[productIndex];

      // Compute months in use if opened_at exists
      let monthsInUse: number | null = null;
      if (product.opened_at) {
        const opened = new Date(product.opened_at);
        const now = new Date();
        const diffMonths =
          (now.getFullYear() - opened.getFullYear()) * 12 + (now.getMonth() - opened.getMonth());
        monthsInUse = Math.max(1, diffMonths);
      }

      // Update product status
      mockProducts[productIndex] = {
        ...product,
        status: 'finished',
        percent_remaining: 0,
        is_priority: false,
      };

      // Create new private Empty row
      const newEmpty: Empty = {
        id: `empty-${Date.now()}`,
        user_id: 'mock-user-123',
        product_id: productId,
        review_text: reviewText || null,
        repurchase,
        months_in_use: monthsInUse,
        photo_url: photoUrl || null,
        created_at: new Date().toISOString(),
      };

      emptiesStore.unshift(newEmpty);
      track('product_finished', { repurchase }, productId);

      return newEmpty;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.empties.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
