import { WishlistItem, WishlistStatus } from '../../../mocks/types';

export function isReadyToReconsider(coolingOffEndsAt: string, now: Date = new Date()): boolean {
  return new Date(coolingOffEndsAt).getTime() <= now.getTime();
}

export function daysUntilReady(coolingOffEndsAt: string, now: Date = new Date()): number {
  const diffMs = new Date(coolingOffEndsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// The database never flips status from "cooling" to "ready" on its own — it's
// a plain enum column, not a computed value. This derives the effective
// status at read time instead, so a stale "cooling" row still displays and
// filters correctly once its 14 days are up.
export function effectiveWishlistStatus(
  item: Pick<WishlistItem, 'status' | 'cooling_off_ends_at'>,
  now: Date = new Date(),
): WishlistStatus {
  if (item.status === 'cooling' && isReadyToReconsider(item.cooling_off_ends_at, now)) {
    return 'ready';
  }
  return item.status;
}
