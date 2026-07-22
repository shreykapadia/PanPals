import { supabase } from './supabase';
import { Json } from '../types/database';

export type EventName =
  | 'account_completed'
  | 'inventory_item_added'
  | 'wishlist_item_added'
  | 'focus_product_set'
  | 'usage_logged'
  | 'duplicate_warning_shown'
  | 'warning_decision'
  | 'product_finished'
  | 'wishlist_item_removed'
  | 'wishlist_item_purchased';

const EVENT_DICTIONARY: readonly EventName[] = [
  'account_completed',
  'inventory_item_added',
  'wishlist_item_added',
  'focus_product_set',
  'usage_logged',
  'duplicate_warning_shown',
  'warning_decision',
  'product_finished',
  'wishlist_item_removed',
  'wishlist_item_purchased',
];

/**
 * Tracks pseudonymous product analytics events (matrix row 24, DATA-MODEL.md
 * §analytics_events) by inserting into analytics_events. Never store raw
 * review text — a `review_text` key throws rather than being silently
 * dropped, since a caller passing it is a bug, not a valid event shape.
 *
 * Deliberately NOT declared `async`: the dictionary/review_text checks throw
 * synchronously so callers (and tests) can rely on `track()` failing fast,
 * before any network call happens. The actual insert runs in the background;
 * callers may await the returned promise but aren't required to.
 */
export function track(
  eventName: EventName,
  properties?: Record<string, unknown>,
  entityId?: string,
  sourceView?: string,
): Promise<void> {
  if (!EVENT_DICTIONARY.includes(eventName)) {
    throw new Error(`track(): "${eventName}" is not in the analytics event dictionary.`);
  }
  if (properties && Object.prototype.hasOwnProperty.call(properties, 'review_text')) {
    throw new Error('track(): review_text may never be sent to analytics_events.');
  }

  return insertEvent(eventName, properties, entityId, sourceView);
}

async function insertEvent(
  eventName: EventName,
  properties?: Record<string, unknown>,
  entityId?: string,
  sourceView?: string,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('analytics_events').insert({
    user_id: user?.id ?? null,
    event_name: eventName,
    entity_id: entityId ?? null,
    source_view: sourceView ?? null,
    properties: (properties ?? null) as unknown as Json,
  });

  if (error && __DEV__) {
    // eslint-disable-next-line no-console
    console.warn(`[Analytics] Failed to record "${eventName}":`, error.message);
  }
}
