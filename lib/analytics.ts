import { AnalyticsEvent } from '../mocks/types';

const mockAnalyticsLog: AnalyticsEvent[] = [];

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
 * §analytics_events). Never store raw review text in event properties —
 * a `review_text` key throws rather than being silently dropped, since a
 * caller passing it is a bug, not a valid event shape.
 */
export function track(
  eventName: EventName,
  properties?: Record<string, unknown>,
  entityId?: string,
  sourceView?: string,
): AnalyticsEvent {
  if (!EVENT_DICTIONARY.includes(eventName)) {
    throw new Error(`track(): "${eventName}" is not in the analytics event dictionary.`);
  }
  if (properties && Object.prototype.hasOwnProperty.call(properties, 'review_text')) {
    throw new Error('track(): review_text may never be sent to analytics_events.');
  }

  const event: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: 'mock-user-123',
    event_name: eventName,
    entity_id: entityId || null,
    source_view: sourceView || null,
    properties: properties || null,
    created_at: new Date().toISOString(),
  };

  mockAnalyticsLog.push(event);

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log(`[Analytics Track]: ${eventName}`, properties || '');
  }

  return event;
}

export function getTrackedEvents() {
  return [...mockAnalyticsLog];
}
