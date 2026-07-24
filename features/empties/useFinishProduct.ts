import { useFinishProduct as useFinishProductMutation } from '../../lib/api';
import { RepurchaseVerdict } from '../../mocks/types';

interface FinishInput {
  productId: string;
  repurchase: RepurchaseVerdict;
  reviewText?: string;
  photoUrl?: string;
}

export function useFinishProduct() {
  const mutation = useFinishProductMutation();

  return {
    ...mutation,
    finish: ({ productId, repurchase, reviewText, photoUrl }: FinishInput) =>
      mutation.mutateAsync({ productId, repurchase, reviewText, photoUrl }),
  };
}
