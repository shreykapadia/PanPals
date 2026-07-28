import { useMemo } from 'react';
import { useSimilarOwned } from '../../../lib/api';
import { Category, Product } from '../../../mocks/types';
import { CATEGORY_LABELS } from '../strings';

export const INTERCEPT_THRESHOLD = 3;

export type MatchConfidence = 'high' | 'medium' | 'low';

export interface SimilarMatch {
  product: Product;
  confidence: MatchConfidence;
  reason: string;
}

export type InterceptDecision = 'keep_wishlist' | 'use_owned' | 'continue_retailer';

const CONFIDENCE_RANK: Record<MatchConfidence, number> = { high: 0, medium: 1, low: 2 };

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

// Confidence-tiered language (row 22): a category-only match is never
// called an "exact duplicate" — the wording scales with how sure we are.
function rankMatch(
  wishlistItem: { brand: string; shade: string | null },
  product: Product,
): SimilarMatch {
  if (
    product.shade &&
    wishlistItem.shade &&
    normalize(product.shade) === normalize(wishlistItem.shade)
  ) {
    return { product, confidence: 'high', reason: `Almost the same shade: ${product.shade}` };
  }
  if (normalize(product.brand) === normalize(wishlistItem.brand)) {
    return { product, confidence: 'medium', reason: `Similar — same brand (${product.brand})` };
  }
  return {
    product,
    confidence: 'low',
    reason: `In the same category: ${CATEGORY_LABELS[product.category]}`,
  };
}

export function useIntercept(
  category: Category,
  wishlistItem: { brand: string; shade: string | null },
) {
  const { data, isLoading, isError } = useSimilarOwned(category);

  const matches = useMemo(() => {
    const products = data?.products ?? [];
    return products
      .map((product) => rankMatch(wishlistItem, product))
      .sort((a, b) => CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, wishlistItem.brand, wishlistItem.shade]);

  const count = data?.count ?? 0;
  const shouldIntercept = count >= INTERCEPT_THRESHOLD;

  // Mocked per JOON-PLAN.md Phase 1b — Phase 3 wires this through the
  // shared track() helper (duplicate_warning_shown / warning_decision).
  const recordDecision = (decision: InterceptDecision) => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log('[intercept] decision recorded (mock):', decision);
    }
  };

  return { shouldIntercept, count, matches, isLoading, isError, recordDecision };
}
